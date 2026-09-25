#!/usr/bin/env python3
"""幻燈 GENTO · 找图：在开放馆藏里搜、查授权、下载原图，并把出处记进 credits.json。

只收 CC0 和公有领域。CC BY、CC BY-SA 这类要署名或传染的授权一律拒收。

搜索：
  python3 fetch_art.py search met "Rhea Kronos stone"
  python3 fetch_art.py search commons "Goya Saturn Devouring His Son"
  python3 fetch_art.py search aic "Titans"

下载（名字是片子里 IMG('名字') 用的键）：
  python3 fetch_art.py get met 247960 <片源目录>/raw vase
  python3 fetch_art.py get commons "File:Nike of Samothrace, Paris, Louvre.jpg" <片源目录>/raw nike
  python3 fetch_art.py get aic 16568 <片源目录>/raw titans

下载后 <目录>/credits.json 里多一条：title、artist、date、institution、license、source。
片尾出处从这里抄，逐条再看一眼原页面。

只用标准库。Commons 要求带 User-Agent，这里用仓库地址。
"""
import json, os, re, sys, urllib.parse, urllib.request

UA = 'GENTO-fetch-art/1.0 (https://github.com/Shinkou777/gento)'
OK_COMMONS = re.compile(r'^(public domain|pd\b|pd-|cc0|cc-zero|no restrictions)', re.I)


def get(url, binary=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else json.loads(data)


def strip(html):
    s = re.sub(r'<[^>]+>', '', html or '')
    s = re.sub(r'\b(title|label) QS:[^"]*"[^"]*"', '', s)  # Commons 里夹带的 Wikidata 标签
    return re.sub(r'\s+', ' ', s).strip()


# ---------- The Met ----------
def met_obj(oid):
    return get(f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{oid}')


def met_search(q):
    ids = (get('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=' + urllib.parse.quote(q)).get('objectIDs') or [])[:25]
    for oid in ids:
        try:
            o = met_obj(oid)
        except Exception:
            continue
        pd = 'CC0' if o.get('isPublicDomain') and o.get('primaryImage') else 'no'
        print(f"{oid:>8}  [{pd}]  {o.get('title')}  |  {o.get('artistDisplayName') or o.get('culture')}  |  {o.get('objectDate')}  |  {o.get('department')}")


def met_get(oid, out, name):
    o = met_obj(oid)
    if not (o.get('isPublicDomain') and o.get('primaryImage')):
        sys.exit(f'拒收：Met {oid} 不是开放馆藏或没有图')
    ext = os.path.splitext(o['primaryImage'])[1].lower() or '.jpg'
    path = save(o['primaryImage'], out, name, ext)
    credit(out, name, {
        'title': o.get('title'), 'artist': o.get('artistDisplayName') or o.get('culture') or '', 'date': o.get('objectDate'),
        'medium': o.get('medium'), 'institution': 'The Metropolitan Museum of Art', 'accession': o.get('accessionNumber'),
        'license': 'CC0', 'source': o.get('objectURL'), 'file': path,
    })


# ---------- Wikimedia Commons ----------
def commons_info(title, width=3200):
    q = {'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': width, 'format': 'json'}
    pages = get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(q))['query']['pages']
    return next(iter(pages.values()))


def commons_search(q):
    r = get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode({'action': 'query', 'list': 'search', 'srsearch': q, 'srnamespace': 6, 'srlimit': 20, 'format': 'json'}))
    for hit in r['query']['search']:
        p = commons_info(hit['title'], 800)
        ii = (p.get('imageinfo') or [{}])[0]; m = ii.get('extmetadata', {})
        lic = m.get('LicenseShortName', {}).get('value', '?')
        mark = 'OK' if OK_COMMONS.search(lic) else 'no'
        print(f"[{mark}] {lic:<22} {ii.get('width')}×{ii.get('height')}  {hit['title']}")


def commons_get(title, out, name):
    if not title.startswith('File:'): title = 'File:' + title
    p = commons_info(title)
    ii = (p.get('imageinfo') or [None])[0]
    if not ii: sys.exit(f'找不到：{title}')
    m = ii.get('extmetadata', {})
    lic = m.get('LicenseShortName', {}).get('value', '')
    if not OK_COMMONS.search(lic):
        sys.exit(f'拒收：{title} 的授权是「{lic}」，只收 CC0 和公有领域')
    url = ii.get('thumburl') or ii['url']
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or '.jpg'
    path = save(url, out, name, ext)
    credit(out, name, {
        'title': strip(m.get('ObjectName', {}).get('value')) or title[5:], 'artist': strip(m.get('Artist', {}).get('value')),
        'date': strip(m.get('DateTimeOriginal', {}).get('value')), 'description': strip(m.get('ImageDescription', {}).get('value'))[:400],
        'credit': strip(m.get('Credit', {}).get('value'))[:300], 'license': lic, 'source': ii.get('descriptionurl'), 'file': path,
        'size': f"{ii.get('width')}×{ii.get('height')}",
    })


# ---------- Art Institute of Chicago ----------
def aic_search(q):
    r = get('https://api.artic.edu/api/v1/artworks/search?limit=20&fields=id,title,artist_display,date_display,is_public_domain,image_id&q=' + urllib.parse.quote(q))
    for o in r['data']:
        mark = 'CC0' if o.get('is_public_domain') and o.get('image_id') else 'no'
        print(f"{o['id']:>8}  [{mark}]  {o['title']}  |  {(o.get('artist_display') or '').splitlines()[0]}  |  {o.get('date_display')}")


def aic_get(oid, out, name):
    o = get(f'https://api.artic.edu/api/v1/artworks/{oid}?fields=id,title,artist_display,date_display,is_public_domain,image_id,medium_display,credit_line')['data']
    if not (o.get('is_public_domain') and o.get('image_id')):
        sys.exit(f'拒收：AIC {oid} 不是公有领域或没有图')
    path = save(f"https://www.artic.edu/iiif/2/{o['image_id']}/full/1686,/0/default.jpg", out, name, '.jpg')
    credit(out, name, {
        'title': o['title'], 'artist': (o.get('artist_display') or '').replace('\n', ', '), 'date': o.get('date_display'),
        'medium': o.get('medium_display'), 'institution': 'The Art Institute of Chicago', 'license': 'CC0',
        'source': f'https://www.artic.edu/artworks/{oid}', 'file': path,
    })


# ---------- 公用 ----------
def save(url, out, name, ext):
    os.makedirs(out, exist_ok=True)
    path = os.path.join(out, name + ext)
    with open(path, 'wb') as f:
        f.write(get(url, binary=True))
    print(f'已存 {path}  {os.path.getsize(path) // 1024} KB')
    return path


def credit(out, name, info):
    p = os.path.join(out, 'credits.json')
    data = json.load(open(p)) if os.path.exists(p) else {}
    data[name] = info
    json.dump(data, open(p, 'w'), ensure_ascii=False, indent=2)
    print(json.dumps(info, ensure_ascii=False, indent=2))


def main():
    a = sys.argv[1:]
    if len(a) >= 3 and a[0] == 'search':
        {'met': met_search, 'commons': commons_search, 'aic': aic_search}[a[1]](' '.join(a[2:]))
    elif len(a) == 5 and a[0] == 'get':
        {'met': met_get, 'commons': commons_get, 'aic': aic_get}[a[1]](a[2], a[3], a[4])
    else:
        print(__doc__); sys.exit(1)


if __name__ == '__main__':
    main()

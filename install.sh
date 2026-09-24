#!/bin/bash
# 幻燈 GENTO 安装（macOS / Linux）
# 把 skills/gento 链到 ~/.claude/skills/gento，装 puppeteer-core，检查 Chrome 和 ffmpeg，跑一次质检当冒烟测试。
# 之后 git pull 就是更新，skill 直接跟着仓库走。
set -euo pipefail

REPO="$(cd "$(dirname "$0")" && pwd)"
SKILL="$REPO/skills/gento"
DEST="$HOME/.claude/skills/gento"

echo "[1/4] 检查 Node、Chrome、ffmpeg"
command -v node >/dev/null 2>&1 || { echo "缺 Node 18+（brew install node）" >&2; exit 1; }
CHROME="${CHROME_PATH:-}"
for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser; do
  [ -z "$CHROME" ] && [ -x "$c" ] && CHROME="$c"
done
[ -n "$CHROME" ] || { echo "缺 Chrome：装 Google Chrome，或设 CHROME_PATH" >&2; exit 1; }
if ! command -v ffmpeg >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then brew install ffmpeg; else echo "缺 ffmpeg" >&2; exit 1; fi
fi

echo "[2/4] 安装 puppeteer-core"
npm install --prefix "$SKILL" --no-fund --no-audit --silent

echo "[3/4] 链接 skill → $DEST"
mkdir -p "$HOME/.claude/skills"
if [ -e "$DEST" ] && [ ! -L "$DEST" ]; then
  echo "$DEST 已存在且不是链接，先挪走再装" >&2; exit 1
fi
ln -sfn "$SKILL" "$DEST"

echo "[4/4] 冒烟测试：孔版样片质检"
node "$SKILL/scripts/check.js" "$SKILL/samples/riso"

cat <<TIP

装好了。在 Claude Code 里敲：
  /gento 你的素材，要求

成品放在 ~/Desktop/幻燈/，片源放在 ~/Movies/幻燈/。
TIP

> 名字、域名、数据库、账号一律以 ShinkoLab 管理文档为准：~/DevGitRepo/shinkolab-ops/registry.yaml（GitHub Shinkou777/shinkolab-ops）。

# 幻燈 GENTO 仓库说明

Claude Code skill：素材 → 代码动画短片（Canvas 逐帧 + 代码合成配乐 → MP4）。

- skill 本体在 `skills/gento/`，本机通过 `install.sh` 链到 `~/.claude/skills/gento`，改这里就是改线上的 skill
- 同一个仓库也是插件市场：`.claude-plugin/marketplace.json` + `plugin.json`
- 结构、用法、扩展方法见 `skills/gento/SKILL.md` 和 `skills/gento/references/`

## 改动规矩

1. 改引擎、风格包、模板、音乐之后跑 `node skills/gento/scripts/test.js --matrix`，全部通过才能提交
2. 加风格按 `references/extend.md`，同步登记 catalog.json、styles.md、README 风格表、样片
3. 公开仓库：提交身份用 `ShinkoLab <noreply@shinkolab.app>`（本地已配），不提交个人信息、本机绝对路径、key
4. 屏幕文字、文档照 `~/.claude/CLAUDE.md` 的写作规则
5. 改完直接提交推送

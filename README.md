# F1 像素庄园 Web/PWA

一款参考轻养成循环的 F1 车手像素小游戏。玩家绑定车手后，每天投喂专属食物，积累成长值和本周喂食量，并通过食物仓库完成收集、赠送与集合兑换。

## 当前实现

- Web/PWA 单页应用，发布目录为 `pwa/`。
- Netlify Functions 后端接口，位于 `netlify/functions/`。
- 车手绑定、每日投喂、幸运双倍、成长等级和周榜同步。
- 食物仓库：每日登录奖励、8 种车手专属食物库存、仓库推荐投喂。
- 本地好友赠送 MVP：每周 2 次，单次 1-5 个，保留最近赠送记录。
- 集合兑换：集齐 8 种食物各 1 个可兑换“金牌美食家”和珍珠 x10。
- PWA 支持：manifest、service worker、移动端添加到主屏幕。

## 本地运行

```bash
npm install
npm run dev
```

默认通过 Netlify Dev 启动本地站点和函数。

## 检查

```bash
npm run check
```

该命令会检查 `pwa/app.js`、`pwa/sw.js` 和 `netlify/functions/game.js` 的 JavaScript 语法。

## 部署

项目使用 Netlify：

- 构建命令：`npm run check`
- 发布目录：`pwa`
- 函数目录：`netlify/functions`

推送到 GitHub 后由 Netlify 自动构建部署，或使用 Netlify CLI 手动部署。

## 目录

- `pwa/`：网站前端和 PWA 资源。
- `netlify/functions/`：排行榜、账号和同步接口。
- `assets/`：车手像素素材和生成过程资源。

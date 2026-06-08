# F1 像素庄园 Web/PWA

一款参考轻养成循环的 F1 车手像素小游戏。玩家绑定车手后，每天投喂专属食物，积累成长值和本周喂食量，并通过食物仓库完成收集、赠送与集合兑换。

## 当前实现

- Web/PWA 单页应用，发布目录为 `pwa/`。
- Cloudflare Pages Functions + D1 后端接口，位于 `functions/api/game.js`，用于账号、云端存档和排行榜。
- 保留 Netlify Functions 旧后端，位于 `netlify/functions/`，作为历史兼容。
- 车手绑定、每日投喂、幸运双倍、成长等级和周榜同步。
- 食物仓库：每日登录奖励、10 种食物库存、任意车手可投喂任意食物，专属食物提高幸运加倍概率。
- 本地好友赠送 MVP：每周 2 次，单次 1-5 个，保留最近赠送记录。
- 集合兑换：集齐全部食物各 1 个可兑换“金牌美食家”和珍珠 x10。
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

该命令会检查 `pwa/app.js`、`pwa/sw.js`、`netlify/functions/game.js` 和 `functions/api/game.js` 的 JavaScript 语法。

## 部署

### Cloudflare Pages + D1

推荐使用 Cloudflare Pages 长期托管：

1. 创建 D1 数据库：

   ```bash
   npx wrangler d1 create f1-pixel-garden
   ```

2. 将返回的 `database_id` 填入 `wrangler.toml`。

3. 初始化 D1 表：

   ```bash
   npx wrangler d1 execute f1-pixel-garden --file=./schema.sql
   ```

4. 部署 Pages：

   ```bash
   npx wrangler pages deploy pwa --project-name=f1-pixel-garden
   ```

Cloudflare Pages 会使用 `functions/api/game.js` 暴露 `/api/game`。前端会自动优先调用 `/api/game`，并把 D1 后端识别为“云端在线”。

免费额度下的节流策略：

- 静态资源由 Pages 托管，不计入 Worker 请求。
- 只有登录、投喂、绑定、领奖、排行榜刷新等动作才请求后端。
- 排行榜一次最多读取 200 条并只展示前 50 条，避免无界读取。
- 存档和排行榜使用 D1，不使用 KV 高频写入，避免 KV 免费写入额度过低。

### Netlify 兼容部署

项目仍保留 Netlify：

- 构建命令：`npm run check`
- 发布目录：`pwa`
- 函数目录：`netlify/functions`

推送到 GitHub 后由 Netlify 自动构建部署，或使用 Netlify CLI 手动部署。

## 目录

- `pwa/`：网站前端和 PWA 资源。
- `functions/api/game.js`：Cloudflare Pages Functions 后端。
- `schema.sql`：Cloudflare D1 初始化 schema。
- `wrangler.toml`：Cloudflare Pages / D1 配置。
- `netlify/functions/`：排行榜、账号和同步接口。
- `assets/`：车手像素素材和生成过程资源。

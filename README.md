# F1 像素庄园 Web/PWA

一款 F1 车手像素养成小游戏。玩家绑定车手后，通过每日投喂、食物收集、训练营、成就、幸运转盘、排行榜、好友和赠送来推进成长。

项目不是传统 F1 赛车竞速游戏，而是围绕车手养成和轻社交循环的 Web/PWA。

## 当前能力

- `pwa/`：可直接发布的单页 PWA，支持移动端添加到主屏幕。
- 8 名车手、8 组表情头像、10 种食物。
- 任意车手可投喂任意食物；投喂专属食物时，加倍和幸运转盘概率更高。
- 每日基础补给、食物仓库、集合兑换、成长等级、成就、训练营、幸运转盘、排行榜。
- 账号体系：云端账号用于跨设备同步，本地账号用于静态站点或云端不可用时继续游玩。
- Cloudflare Pages Functions + D1 后端：账号、云存档、排行榜、好友搜索/添加/删除、云端赠送和每周赠送限制。
- Netlify Functions 兼容后端：保留同一套账号、存档、排行榜和社交 API。
- GitHub Pages 静态发布：可以本地游玩和检查 UI，但没有 `/api/game` 后端，不能提供真正的跨设备云存档和好友赠送。

## 本地运行

安装依赖：

```bash
npm install
```

使用 Netlify Dev 运行前端和兼容函数：

```bash
npm run dev
```

使用 Cloudflare Pages + D1 本地运行：

```bash
npm run cf:dev
```

只检查静态 PWA 页面时，也可以直接用任意静态服务器打开 `pwa/`。

## 检查

```bash
npm run check
```

该命令会执行：

- `pwa/app.js`、`pwa/sw.js`、`netlify/functions/game.js`、`functions/api/game.js` 语法检查。
- `pwa/manifest.webmanifest` 合法性和 PWA 元信息检查。
- 核心资源、图标、service worker 缓存清单检查。
- 使用内存 D1 模拟 Cloudflare API，验证注册、搜索账号、添加好友、服务端赠送、接收方领取礼物。

可选浏览器冒烟检查需要本机 Chrome 或 Edge，并先用静态服务器托管 `pwa/`：

```bash
python -m http.server 4174 -d pwa
npm run browser:smoke -- http://127.0.0.1:4174
```

Cloudflare 上线前可运行配置检查：

```bash
npm run cf:check
```

它会确认 `wrangler.toml` 已填入真实 D1 `database_id`、D1 binding 名称为 `DB`、`schema.sql` 和 Pages Function 入口存在。`database_id` 还是占位值时该命令会失败，这是预期的上线保护。

带后端的真实部署完成后，运行在线 API 冒烟检查：

```bash
npm run api:smoke -- https://你的 Cloudflare Pages 域名
```

该检查会创建两个临时账号，验证账号注册、好友搜索、添加好友、云存档、服务端赠送、重复赠送请求幂等和接收方入库。

## Cloudflare Pages + D1 部署

推荐长期部署方式是 Cloudflare Pages + D1。

1. 创建 D1 数据库：

   ```bash
   npm run cf:d1:create
   ```

2. 把命令返回的 `database_id` 填入 `wrangler.toml`：

   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "f1-pixel-garden"
   database_id = "你的 D1 database_id"
   ```

3. 初始化 D1 表：

   ```bash
   npx wrangler d1 execute f1-pixel-garden --file=./schema.sql
   ```

4. 部署 Pages：

   ```bash
   npm run cf:deploy
   ```

5. 部署完成后验证真实 API：

   ```bash
   npm run api:smoke -- https://你的 Cloudflare Pages 域名
   ```

Cloudflare Pages 会发布 `pwa/`，并通过 `functions/api/game.js` 暴露 `/api/game`。

## 社交和赠送规则

- 只有云端账号支持好友搜索、添加、删除和云端赠送。
- 本地账号只保存当前浏览器存档，不支持跨设备好友。
- 仓库在没有好友时不会显示赠送按钮。
- 赠送由服务器执行：校验登录 token、好友关系、食物 ID、数量、每周次数和发送方云端库存。
- 云端赠送带请求 ID，重复点击或网络重试会返回同一次结果，不会重复扣库存或重复发礼物。
- 当前限制：每周最多赠送 2 次，单次 1-5 个食物。
- 接收方在线有云存档时会直接入库；没有云存档时，礼物进入云端 inbox，下次登录加载存档时自动入库。

## Netlify 兼容部署

项目仍保留 Netlify 兼容方案：

- 构建命令：`npm run check`
- 发布目录：`pwa`
- 函数目录：`netlify/functions`

Netlify 后端使用 Netlify Blobs 保存账号、存档、排行榜、好友和赠送记录。它适合作为兼容方案；长期免费稳定性和 D1 管理体验优先考虑 Cloudflare。

## GitHub Pages 静态发布

GitHub Pages 只能发布静态 `pwa/` 内容。它适合：

- 快速打开页面检查 UI。
- 使用本地账号在当前浏览器游玩。
- 验证 PWA 静态资源和移动端布局。

它不适合：

- 云端账号登录。
- 跨设备存档同步。
- 好友搜索、添加和服务端赠送。
- 多玩家共享排行榜。

如果要和朋友一起玩，需要 Cloudflare Pages + D1 或 Netlify Functions 这类带后端的部署。

## 目录说明

- `pwa/`：前端 PWA。
- `pwa/app.js`：核心玩法、账号、同步、好友和 UI。
- `pwa/styles.css`：移动端优先界面样式。
- `pwa/sw.js`：离线缓存和 PWA service worker。
- `functions/api/game.js`：Cloudflare Pages Functions 后端。
- `netlify/functions/game.js`：Netlify Functions 兼容后端。
- `schema.sql`：Cloudflare D1 初始化 schema。
- `wrangler.toml`：Cloudflare Pages / D1 配置。
- `tools/verify_project.mjs`：PWA 和 API 轻量验收脚本。
- `assets/`：车手素材和生成过程资源。

## 常见故障

### GitHub Pages 打开后看不到最新版本

浏览器可能还在使用旧 service worker 缓存。先刷新页面；仍不更新时，在浏览器开发者工具里清除该站点的 service worker/cache storage，或打开带查询参数的 URL，例如：

```text
https://yet2meet.github.io/f1-pixel-garden/?v=latest
```

### 云端登录失败

确认当前部署不是纯 GitHub Pages，并且 `/api/game` 可以访问。Cloudflare 部署还需要确认：

- `wrangler.toml` 的 D1 `database_id` 已替换。
- 已执行 `schema.sql` 初始化。
- Pages Functions 成功部署。

### 好友或赠送不可用

确认使用的是云端账号，不是本地账号。赠送还要求双方已经是好友，并且发送方云端库存足够。

### Cloudflare 免费额度

本项目的设计尽量减少 Worker 请求：静态资源由 Pages 直接托管，只有登录、同步、排行榜、好友和赠送会访问后端。小规模朋友游玩通常足够；如果公开传播或玩家增长，需要关注 Cloudflare Pages Functions 和 D1 的当期免费额度与用量。

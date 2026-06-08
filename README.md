# F1 Pixel Garden PWA

这是 F1 像素庄园的 Web/PWA 版本。当前版本引用 8 位车手的 8 张表情头像，并支持 10 种食物的仓库投喂玩法：

- Max Verstappen
- Charles Leclerc
- Lewis Hamilton
- Lando Norris
- Oscar Piastri
- George Russell
- Kimi Antonelli
- Fernando Alonso

## 本地预览

在项目根目录运行：

```powershell
python -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173/pwa/
```

## 手机预览

电脑和手机连接同一个 Wi-Fi 后，先查电脑局域网 IP：

```powershell
ipconfig
```

然后在手机浏览器打开：

```text
http://你的电脑IP:4173/pwa/
```

## 添加到主屏幕

- iOS：用 Safari 打开页面，点分享按钮，选择“添加到主屏幕”。
- Android：用 Chrome 或 Edge 打开页面，菜单里选择“安装应用”或“添加到主屏幕”。

本地数据保存在浏览器 `localStorage` 中。PWA 会缓存核心文件和 8 位车手的 8 张表情头像，方便离线打开。

## 多人排行榜部署

当前代码支持“本地优先 + Cloudflare D1 云端同步”：

- 本地或云端不可用时，游戏仍然使用浏览器本地数据。
- 部署到 Cloudflare Pages 且 D1 绑定可用后，账号、存档和本周榜单会同步到云端。
- 云端数据入口是 `/api/game`，存储使用 Cloudflare D1。
- Netlify Functions 仍保留兼容，但不是推荐部署方式。

多人版本不要只上传 `pwa` 文件夹，因为静态部署不会带上云端接口。推荐把整个项目推到 GitHub，然后在 Cloudflare Pages 绑定仓库，或使用 Wrangler 从项目根目录部署。

Cloudflare 配置已经写在根目录的 `wrangler.toml`，D1 初始化表结构在 `schema.sql`：

```powershell
npx wrangler d1 create f1-pixel-garden
npx wrangler d1 execute f1-pixel-garden --file=./schema.sql
npx wrangler pages deploy pwa --project-name=f1-pixel-garden
```

首次部署前在项目根目录安装依赖：

```powershell
npm install
```

本地开发多人接口时可以使用：

```powershell
npx wrangler pages dev pwa --d1 DB=f1-pixel-garden
```

静态预览仍然可以用 `python -m http.server 4173`，但这种方式不会启动云端排行榜接口。

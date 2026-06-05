# F1 Pixel Garden PWA

这是 F1 像素庄园的 Web/PWA 版本。当前版本引用 8 位车手的 8 张表情头像：

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

当前代码支持“本地优先 + Netlify 云端同步”：

- 本地或云端不可用时，游戏仍然使用浏览器本地数据。
- 部署到 Netlify 且 Functions 可用后，喂食、成长值、本周榜单会同步到云端。
- 云端数据入口是 `/.netlify/functions/game`，存储使用 Netlify Blobs。

多人版本不要只拖拽 `pwa` 文件夹到 Netlify Drop，因为 Drop 只适合静态试玩。推荐把整个项目推到 GitHub，然后在 Netlify 绑定仓库。

Netlify 构建配置已经写在根目录的 `netlify.toml`：

```toml
[build]
  publish = "pwa"
  functions = "netlify/functions"
```

首次部署前在项目根目录安装依赖：

```powershell
npm install
```

本地开发多人接口时使用：

```powershell
npx netlify dev
```

静态预览仍然可以用 `python -m http.server 4173`，但这种方式不会启动云端排行榜接口。

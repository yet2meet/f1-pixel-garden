# 像素 F1 庄园微信小程序

一款参考「蚂蚁庄园」轻养成循环的 F1 车手像素小游戏原型。玩家首次绑定车手后，每天投喂专属食物，累计本周喂食量，周日结算好友榜冠军。

## 当前实现

- 原生微信小程序项目结构，可直接用微信开发者工具导入。
- 车手绑定与更换流程，更换后喂食和成长重新计算。
- 主养成页：Canvas 2D 像素车手、喂食按钮、每日次数、库存、本周进度、幸运双倍。
- 主养成页：PNG Sprite Sheet 像素车手、喂食按钮、每日次数、库存、本周进度、幸运双倍。
- 好友排行页：本地模拟好友榜，玩家成绩高亮。
- 车手图鉴页：预设 8 位车手、车队、专属食物、背景故事。
- 成就页：成长值、等级路线、历史冠军占位。
- 设置页：微信资料授权入口、结算提醒占位。
- 云函数雏形：`login`、`feedDriver`、`settleWeekly`。

## 打开方式

1. 打开微信开发者工具。
2. 选择「导入项目」。
3. 项目目录选择本文件夹。
4. AppID 可先使用测试号或替换 `project.config.json` 中的 `appid`。

## 云开发接入清单

1. 在微信开发者工具中开通云开发环境。
2. 将 `project.config.json` 的 `appid` 替换为正式小程序 AppID。
3. 上传并部署 `cloudfunctions/login`、`cloudfunctions/feedDriver`、`cloudfunctions/settleWeekly`。
4. 在云数据库中创建 `users`、`weekly_feed`、`weekly_rank`、`friends`、`feed_log` 集合。
5. 按 `database.schema.md` 设置集合字段、索引和权限。
6. 把前端 `utils/gameStore.js` 的本地喂食逻辑替换为 `wx.cloud.callFunction({ name: "feedDriver" })`。
7. 配置订阅消息模板 ID 后，在设置页接入 `wx.requestSubscribeMessage`。

## 后续建议

- 用真实 Sprite Sheet 替换当前 Canvas 像素块占位。
- 继续精修 `assets/drivers` 下的 Sprite Sheet，替换为更细的手绘或 AI 像素头像素材。
- 新增开放数据域页面，接入 `wx.getFriendCloudStorage` 好友排行榜。
- 在云函数中加入 HMAC 签名校验、设备风控和异常日志。
- 增加挑战帖、好友加油和周冠军奖杯动画。

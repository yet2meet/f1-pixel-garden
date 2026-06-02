# 数据库集合设计

## users

用户基础档案。文档 ID 建议使用 `openid`。

```js
{
  openid: string,
  nickName: string,
  avatarUrl: string,
  driverId: string,
  growth: number,
  championWeeks: string[],
  createdAt: number,
  updatedAt: number
}
```

## weekly_feed

本周喂食累计。文档 ID 建议使用 `${openid}_${weekId}`。

```js
{
  openid: string,
  driverId: string,
  weekId: string,
  feedCount: number,
  updatedAt: number
}
```

## weekly_rank

每周结算快照。文档 ID 建议使用 `weekId`。

```js
{
  weekId: string,
  rankings: [
    {
      rank: number,
      openid: string,
      driverId: string,
      feedCount: number,
      growthAward: number,
      champion: boolean
    }
  ],
  settledAt: number
}
```

## friends

好友关系缓存。真实关系链能力应优先结合开放数据域与用户授权。

```js
{
  openid: string,
  friendOpenid: string,
  createdAt: number
}
```

## feed_log

每日喂食日志和防作弊统计。文档 ID 建议使用 `${openid}_${yyyy-mm-dd}`。

```js
{
  openid: string,
  driverId: string,
  date: string,
  feedCount: number,
  totalFeed: number,
  lastFeedAt: number,
  logs: [
    {
      value: number,
      lucky: boolean,
      createdAt: number
    }
  ]
}
```

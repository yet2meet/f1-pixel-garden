const { drivers, getDriver, getLevel } = require("../data/drivers");

const PLAYER_KEY = "f1_pixel_player";
const FEED_KEY = "f1_pixel_feed_state";
const DAILY_LIMIT = 5;
const DAILY_STOCK = 5;
const FEED_VALUE = 20;

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekId() {
  const app = getApp();
  return app && app.getWeekId ? app.getWeekId() : "";
}

function getPlayer() {
  return wx.getStorageSync(PLAYER_KEY) || null;
}

function bindDriver(driverId) {
  const existing = getPlayer();
  const driver = getDriver(driverId);
  const isSameDriver = existing && existing.driverId === driver.id;
  if (isSameDriver) {
    return existing;
  }

  const player = {
    id: "me",
    nickName: existing ? existing.nickName : "像素车迷",
    avatarUrl: existing ? existing.avatarUrl : "",
    driverId: driver.id,
    growth: 0,
    championWeeks: [],
    createdAt: existing ? existing.createdAt : Date.now(),
    updatedAt: Date.now(),
  };
  wx.setStorageSync(PLAYER_KEY, player);
  resetFeedState();
  return player;
}

function resetFeedState() {
  wx.removeStorageSync(FEED_KEY);
}

function getFeedState() {
  const today = todayKey();
  const weekId = getWeekId();
  const state = wx.getStorageSync(FEED_KEY) || {};
  if (state.today !== today || state.weekId !== weekId) {
    return {
      today,
      weekId,
      usedFeeds: 0,
      stock: DAILY_STOCK,
      weeklyFeed: state.weekId === weekId ? state.weeklyFeed || 0 : 0,
      cheers: state.weekId === weekId ? state.cheers || 0 : 0,
      logs: [],
    };
  }
  return state;
}

function saveFeedState(state) {
  wx.setStorageSync(FEED_KEY, state);
}

function feedDriver() {
  const player = getPlayer();
  if (!player) {
    return { ok: false, message: "请先选择车手" };
  }

  const state = getFeedState();
  if (state.usedFeeds >= DAILY_LIMIT) {
    return { ok: false, message: "今日喂食次数已经用完" };
  }
  if (state.stock <= 0) {
    return { ok: false, message: "今日食物库存不足" };
  }

  const lucky = Math.random() < 0.12;
  const value = lucky ? FEED_VALUE * 2 : FEED_VALUE;
  state.usedFeeds += 1;
  state.stock -= 1;
  state.weeklyFeed += value;
  state.logs.unshift({
    id: `${Date.now()}`,
    time: Date.now(),
    value,
    lucky,
  });
  saveFeedState(state);
  return { ok: true, value, lucky, state };
}

function getHomeModel() {
  const player = getPlayer();
  const state = getFeedState();
  if (!player) return { player: null, state };
  const driver = getDriver(player.driverId);
  const level = getLevel(player.growth);
  return { player, state, driver, level };
}

function getMockRankings() {
  const model = getHomeModel();
  const mine = model.player
    ? {
        id: "me",
        nickName: model.player.nickName,
        driver: model.driver,
        feed: model.state.weeklyFeed,
        growth: model.player.growth,
        mine: true,
      }
    : null;

  const bots = [
    ["小周", "leclerc", 184],
    ["Apex", "norris", 156],
    ["DRS 开了", "verstappen", 132],
    ["银箭新星", "antonelli", 118],
    ["头哥信徒", "alonso", 92],
  ].map(([nickName, driverId, feed], index) => ({
    id: `bot-${index}`,
    nickName,
    driver: getDriver(driverId),
    feed,
    growth: 240 + index * 80,
    mine: false,
  }));

  return (mine ? [mine, ...bots] : bots).sort((a, b) => b.feed - a.feed);
}

function getGallery() {
  const player = getPlayer();
  return drivers.map((driver) => ({
    ...driver,
    selected: player && player.driverId === driver.id,
  }));
}

module.exports = {
  DAILY_LIMIT,
  DAILY_STOCK,
  FEED_VALUE,
  bindDriver,
  feedDriver,
  getFeedState,
  getGallery,
  getHomeModel,
  getMockRankings,
  getPlayer,
  resetFeedState,
};

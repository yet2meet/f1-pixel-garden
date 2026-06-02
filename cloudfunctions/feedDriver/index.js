const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const DAILY_LIMIT = 5;
const FEED_VALUE = 20;

function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function weekId(date = new Date()) {
  const target = new Date(date.valueOf());
  const day = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - day + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((target - firstThursday) / 604800000);
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const now = Date.now();
  const today = dateKey();
  const currentWeek = weekId();

  const dailyDocId = `${OPENID}_${today}`;
  const weeklyDocId = `${OPENID}_${currentWeek}`;

  const daily = await db.collection("feed_log").doc(dailyDocId).get().catch(() => null);
  const usedFeeds = daily && daily.data ? daily.data.feedCount : 0;

  if (usedFeeds >= DAILY_LIMIT) {
    return {
      ok: false,
      code: "DAILY_LIMIT",
      message: "今日喂食次数已用完",
    };
  }

  if (!event || !event.driverId || !event.timestamp) {
    return {
      ok: false,
      code: "BAD_REQUEST",
      message: "缺少必要参数",
    };
  }

  const lucky = Math.random() < 0.12;
  const value = lucky ? FEED_VALUE * 2 : FEED_VALUE;

  if (daily && daily.data) {
    await db.collection("feed_log").doc(dailyDocId).update({
      data: {
        feedCount: _.inc(1),
        totalFeed: _.inc(value),
        lastFeedAt: now,
        logs: _.push([{ value, lucky, createdAt: now }]),
      },
    });
  } else {
    await db.collection("feed_log").doc(dailyDocId).set({
      data: {
        openid: OPENID,
        driverId: event.driverId,
        date: today,
        feedCount: 1,
        totalFeed: value,
        lastFeedAt: now,
        logs: [{ value, lucky, createdAt: now }],
      },
    });
  }

  const weekly = await db.collection("weekly_feed").doc(weeklyDocId).get().catch(() => null);
  if (weekly && weekly.data) {
    await db.collection("weekly_feed").doc(weeklyDocId).update({
      data: {
        feedCount: _.inc(value),
        updatedAt: now,
      },
    });
  } else {
    await db.collection("weekly_feed").doc(weeklyDocId).set({
      data: {
        openid: OPENID,
        driverId: event.driverId,
        weekId: currentWeek,
        feedCount: value,
        updatedAt: now,
      },
    });
  }

  return {
    ok: true,
    value,
    lucky,
    weekId: currentWeek,
  };
};

const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

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

function growthByRank(index) {
  if (index === 0) return 120;
  if (index <= 2) return 96;
  if (index <= 4) return 72;
  return 48;
}

exports.main = async (event = {}) => {
  const targetWeek = event.weekId || weekId();
  const result = await db.collection("weekly_feed")
    .where({ weekId: targetWeek })
    .orderBy("feedCount", "desc")
    .limit(100)
    .get();

  const rankings = result.data.map((item, index) => ({
    rank: index + 1,
    openid: item.openid,
    driverId: item.driverId,
    feedCount: item.feedCount,
    growthAward: growthByRank(index),
    champion: index === 0,
  }));

  await db.collection("weekly_rank").doc(targetWeek).set({
    data: {
      weekId: targetWeek,
      rankings,
      settledAt: Date.now(),
    },
  });

  await Promise.all(rankings.map((item) => {
    const data = {
      growth: _.inc(item.growthAward),
      updatedAt: Date.now(),
    };
    if (item.champion) {
      data.championWeeks = _.push([targetWeek]);
    }
    return db.collection("users").doc(item.openid).update({ data }).catch(() => null);
  }));

  return {
    ok: true,
    weekId: targetWeek,
    total: rankings.length,
    champion: rankings[0] || null,
  };
};

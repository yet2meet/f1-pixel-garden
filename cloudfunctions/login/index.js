const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const now = Date.now();

  await db.collection("users").doc(wxContext.OPENID).set({
    data: {
      openid: wxContext.OPENID,
      updatedAt: now,
    },
  }).catch(async () => {
    await db.collection("users").doc(wxContext.OPENID).update({
      data: {
        updatedAt: now,
      },
    });
  });

  return {
    openid: wxContext.OPENID,
    unionid: wxContext.UNIONID,
  };
};

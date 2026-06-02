const { getMockRankings } = require("../../utils/gameStore");

Page({
  data: {
    rankings: [],
  },

  onShow() {
    this.setData({
      rankings: getMockRankings(),
    });
  },

  onShareAppMessage() {
    return {
      title: "来像素 F1 庄园挑战本周冠军",
      path: "/pages/home/home",
    };
  },
});

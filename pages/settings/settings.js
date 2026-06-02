const { getPlayer } = require("../../utils/gameStore");

Page({
  data: {
    player: null,
  },

  onShow() {
    this.setData({
      player: getPlayer(),
    });
  },

  syncProfile() {
    if (!wx.getUserProfile) {
      wx.showToast({ title: "当前基础库不支持", icon: "none" });
      return;
    }
    wx.getUserProfile({
      desc: "展示玩家昵称和头像",
      success: (res) => {
        const player = getPlayer();
        if (!player) {
          wx.showToast({ title: "请先选择车手", icon: "none" });
          return;
        }
        const next = {
          ...player,
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
        };
        wx.setStorageSync("f1_pixel_player", next);
        this.setData({ player: next });
      },
    });
  },

  requestSubscribe() {
    wx.showToast({
      title: "请在接入模板 ID 后启用",
      icon: "none",
    });
  },
});

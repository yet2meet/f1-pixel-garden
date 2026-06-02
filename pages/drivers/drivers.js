const { getGallery } = require("../../utils/gameStore");

Page({
  data: {
    drivers: [],
  },

  onShow() {
    this.setData({
      drivers: getGallery(),
    });
  },
});

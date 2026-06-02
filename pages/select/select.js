const { drivers } = require("../../data/drivers");
const { bindDriver, getPlayer } = require("../../utils/gameStore");

Page({
  data: {
    drivers,
    selectedId: "",
    currentDriverId: "",
  },

  onShow() {
    const player = getPlayer();
    this.setData({
      currentDriverId: player ? player.driverId : "",
      selectedId: player ? player.driverId : "",
    });
  },

  chooseDriver(event) {
    this.setData({
      selectedId: event.currentTarget.dataset.id,
    });
  },

  confirmDriver() {
    const driver = drivers.find((item) => item.id === this.data.selectedId);
    const isChanging = this.data.currentDriverId && this.data.currentDriverId !== driver.id;
    const isSame = this.data.currentDriverId === driver.id;
    wx.showModal({
      title: isChanging ? "更换车手" : "确认车手",
      content: isChanging
        ? `确定更换为 ${driver.name} 吗？当前喂食、成长值和喂食日志会重新计算。`
        : isSame
          ? `${driver.name} 已经是当前车手。`
          : `确定选择 ${driver.name} 吗？之后也可以回来更换车手。`,
      confirmText: isChanging ? "更换" : "确认",
      cancelText: "再看看",
      success: (res) => {
        if (!res.confirm) return;
        bindDriver(driver.id);
        wx.switchTab({
          url: "/pages/home/home",
        });
      },
    });
  },
});

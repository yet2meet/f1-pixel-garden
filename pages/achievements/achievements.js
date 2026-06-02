const { levels, getLevel } = require("../../data/drivers");
const { getPlayer } = require("../../utils/gameStore");

Page({
  data: {
    player: null,
    growth: 0,
    levelName: "幼驾员",
    levels,
  },

  onShow() {
    const player = getPlayer();
    const growth = player ? player.growth : 0;
    this.setData({
      player,
      growth,
      levelName: getLevel(growth).name,
    });
  },
});

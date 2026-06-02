App({
  globalData: {
    cloudReady: false,
    weekId: "",
  },

  onLaunch() {
    this.globalData.weekId = this.getWeekId();

    if (wx.cloud) {
      wx.cloud.init({
        traceUser: true,
      });
      this.globalData.cloudReady = true;
    }
  },

  getWeekId(date = new Date()) {
    const target = new Date(date.valueOf());
    const day = (target.getDay() + 6) % 7;
    target.setDate(target.getDate() - day + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const firstDay = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
    const week = 1 + Math.round((target - firstThursday) / 604800000);
    return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
  },
});

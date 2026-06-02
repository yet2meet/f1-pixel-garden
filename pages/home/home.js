const { DAILY_LIMIT, feedDriver, getHomeModel } = require("../../utils/gameStore");

const EXPRESSIONS = {
  idle: 0,
  eat: 1,
  celebrate: 2,
  tired: 3,
};

const DIRECTIONS = {
  front: 0,
  left: 1,
  right: 2,
};

const MOOD_POSE = {
  idle: { expression: "idle", direction: "front" },
  talk: { expression: "idle", direction: "right" },
  eat: { expression: "eat", direction: "left" },
  celebrate: { expression: "celebrate", direction: "front" },
  tired: { expression: "tired", direction: "front" },
};

const SPRITE_FRAMES = 4;

Page({
  data: {
    player: null,
    driver: null,
    level: null,
    state: {},
    hasPlayer: false,
    remainFeeds: 0,
    progress: 0,
    mood: "idle",
    driverLine: "",
    isFeeding: false,
    floatingFood: false,
    feedDelta: 0,
    luckyFlash: false,
    spriteSrc: "",
    spriteFrameSrc: "",
  },

  onShow() {
    this.load();
  },

  onReady() {
    this.startAnimation();
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
    if (this.talkTimer) clearTimeout(this.talkTimer);
    if (this.feedTimer) clearTimeout(this.feedTimer);
    if (this.effectTimer) clearTimeout(this.effectTimer);
  },

  load() {
    const model = getHomeModel();
    const remainFeeds = model.state ? DAILY_LIMIT - model.state.usedFeeds : 0;
    const nextMood = remainFeeds <= 0 ? "tired" : this.data.mood === "tired" ? "idle" : this.data.mood;
    const spriteSrc = model.driver ? model.driver.sprite : "";
    this.setData({
      player: model.player || null,
      driver: model.driver || null,
      level: model.level || null,
      state: model.state || {},
      hasPlayer: !!model.player,
      remainFeeds,
      progress: Math.min(100, Math.round(((model.state.weeklyFeed || 0) / 260) * 100)),
      mood: nextMood,
      spriteSrc,
    });
    this.updateSpriteFrame();
  },

  startAnimation() {
    if (this.timer) clearInterval(this.timer);
    this.frame = 0;
    this.timer = setInterval(() => {
      this.frame = (this.frame + 1) % SPRITE_FRAMES;
      this.updateSpriteFrame();
    }, 260);
  },

  updateSpriteFrame() {
    if (!this.data.driver) return;
    const pose = MOOD_POSE[this.data.mood] || MOOD_POSE.idle;
    const col = this.frame || 0;
    this.setData({
      spriteFrameSrc: `/assets/drivers/frames/${this.data.driver.id}_${pose.expression}_${pose.direction}_${col}.png`,
    });
  },

  goSelect() {
    wx.navigateTo({
      url: "/pages/select/select",
    });
  },

  feed() {
    if (this.data.isFeeding) return;
    const result = feedDriver();
    if (!result.ok) {
      wx.showToast({ title: result.message, icon: "none" });
      return;
    }
    const line = result.lucky ? "Perfect bite. Double points!" : this.getFeedLine();
    if (wx.vibrateShort) {
      wx.vibrateShort({ type: result.lucky ? "heavy" : "light" });
    }
    this.setData({
      mood: "eat",
      isFeeding: true,
      floatingFood: true,
      feedDelta: result.value,
      luckyFlash: result.lucky,
      driverLine: line,
    });
    this.updateSpriteFrame();
    wx.showToast({
      title: result.lucky ? `幸运双倍 +${result.value}` : `喂食 +${result.value}`,
      icon: "none",
    });
    if (this.feedTimer) clearTimeout(this.feedTimer);
    this.feedTimer = setTimeout(() => {
      this.setData({ mood: result.lucky ? "celebrate" : "idle" });
      this.load();
    }, 520);
    if (this.effectTimer) clearTimeout(this.effectTimer);
    this.effectTimer = setTimeout(() => {
      this.setData({
        mood: this.data.remainFeeds <= 0 ? "tired" : "idle",
        isFeeding: false,
        floatingFood: false,
        feedDelta: 0,
        luckyFlash: false,
      });
      this.updateSpriteFrame();
    }, 1200);
    if (this.talkTimer) clearTimeout(this.talkTimer);
    this.talkTimer = setTimeout(() => {
      this.setData({ driverLine: "" });
    }, 2400);
  },

  talkToDriver() {
    if (!this.data.driver) return;
    const quotes = this.data.driver.quotes || [];
    const index = Math.floor(Math.random() * quotes.length);
    this.setData({
      mood: "talk",
      driverLine: quotes[index] || "Ready to race!",
    });
    this.updateSpriteFrame();
    if (this.talkTimer) clearTimeout(this.talkTimer);
    this.talkTimer = setTimeout(() => {
      this.setData({
        mood: "idle",
        driverLine: "",
      });
      this.updateSpriteFrame();
    }, 2200);
  },

  getFeedLine() {
    const lines = [
      `${this.data.driver.food} received.`,
      "Energy is up.",
      "Ready for the next stint.",
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },
});

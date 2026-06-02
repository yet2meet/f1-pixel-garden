const { drivers, levels, getDriver, getLevel } = require("./data/drivers");

const canvas = wx.createCanvas();
const ctx = canvas.getContext("2d");
const info = wx.getSystemInfoSync();
const DPR = info.pixelRatio || 1;

canvas.width = info.windowWidth * DPR;
canvas.height = info.windowHeight * DPR;
ctx.scale(DPR, DPR);

const W = info.windowWidth;
const H = info.windowHeight;
const FRAME_W = 128;
const FRAME_H = 160;
const SPRITE_COLS = 4;
const DAILY_LIMIT = 5;
const DAILY_STOCK = 5;
const FEED_VALUE = 20;
const PLAYER_KEY = "f1_pixel_player";
const FEED_KEY = "f1_pixel_feed_state";

const spriteRows = {
  idle: 0,
  talk: 2,
  eat: 4,
  lucky: 6,
  tired: 9,
};
const sprites = {};
const state = {
  scene: "home",
  frame: 0,
  tick: 0,
  mood: "idle",
  line: "",
  toast: "",
  selectedDriverId: "",
  player: null,
  feed: null,
  feedAnim: null,
  deltaAnim: null,
  luckyUntil: 0,
  buttons: [],
  scroll: 0,
};

function loadSprites() {
  drivers.forEach((driver) => {
    const img = wx.createImage();
    img.src = driver.sprite.replace(/^\//, "");
    sprites[driver.id] = img;
  });
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekId(date = new Date()) {
  const target = new Date(date.valueOf());
  const day = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - day + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((target - firstThursday) / 604800000);
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getPlayer() {
  return wx.getStorageSync(PLAYER_KEY) || null;
}

function savePlayer(player) {
  wx.setStorageSync(PLAYER_KEY, player);
}

function resetFeed() {
  wx.removeStorageSync(FEED_KEY);
}

function getFeedState() {
  const today = todayKey();
  const weekId = getWeekId();
  const old = wx.getStorageSync(FEED_KEY) || {};
  if (old.today !== today || old.weekId !== weekId) {
    return {
      today,
      weekId,
      usedFeeds: 0,
      stock: DAILY_STOCK,
      weeklyFeed: old.weekId === weekId ? old.weeklyFeed || 0 : 0,
      logs: [],
    };
  }
  return old;
}

function saveFeed(feed) {
  wx.setStorageSync(FEED_KEY, feed);
}

function bindDriver(driverId) {
  const old = getPlayer();
  if (old && old.driverId === driverId) return old;
  const player = {
    id: "me",
    nickName: old ? old.nickName : "像素车迷",
    driverId,
    growth: 0,
    championWeeks: [],
    createdAt: old ? old.createdAt : Date.now(),
    updatedAt: Date.now(),
  };
  savePlayer(player);
  resetFeed();
  return player;
}

function loadState() {
  state.player = getPlayer();
  state.feed = getFeedState();
  state.selectedDriverId = state.player ? state.player.driverId : drivers[0].id;
}

function currentDriver() {
  return state.player ? getDriver(state.player.driverId) : getDriver(state.selectedDriverId);
}

function setScene(scene) {
  state.scene = scene;
  state.scroll = 0;
  state.toast = "";
  if (scene === "select") state.selectedDriverId = currentDriver().id;
}

function addButton(id, x, y, w, h, label, action) {
  state.buttons.push({ id, x, y, w, h, label, action });
}

function clear(bg = "#0f1218") {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  state.buttons = [];
}

function text(str, x, y, size = 14, color = "#f4f0d8", align = "left", bold = false) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? "bold " : ""}${size}px Courier New, monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillText(str, x, y);
}

function wrap(str, x, y, maxWidth, lineHeight, size, color) {
  let line = "";
  let cy = y;
  const chars = String(str).split("");
  ctx.font = `${size}px Courier New, monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  chars.forEach((ch) => {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, x, cy);
  return cy + lineHeight;
}

function panel(x, y, w, h, fill = "#1b2130", stroke = "#f4f0d8") {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
}

function button(id, x, y, w, h, label, action, fill = "#f8d84a", color = "#111318") {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#fff2a4";
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  text(label, x + w / 2, y + h / 2 - 8, 15, color, "center", true);
  addButton(id, x, y, w, h, label, action);
}

function drawSprite(driver, x, y, width, mood = state.mood) {
  const img = sprites[driver.id];
  const row = spriteRows[mood] || 0;
  const col = state.frame % SPRITE_COLS;
  const height = Math.round(width * FRAME_H / FRAME_W);
  if (!img || !img.width) {
    panel(x, y, width, height, driver.palette[0], driver.palette[2]);
    text(driver.badge, x + width / 2, y + height / 2 - 10, 20, "#fff", "center", true);
    return;
  }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H, x, y, width, height);
}

function drawNav() {
  const navH = 58;
  const y = H - navH;
  ctx.fillStyle = "#151923";
  ctx.fillRect(0, y, W, navH);
  const tabs = [
    ["home", "养成"],
    ["gallery", "图鉴"],
    ["achievements", "成就"],
    ["settings", "设置"],
  ];
  tabs.forEach(([id, label], i) => {
    const x = (W / tabs.length) * i;
    const active = state.scene === id;
    text(label, x + W / tabs.length / 2, y + 20, 14, active ? "#f8d84a" : "#aeb6c8", "center", active);
    addButton(`nav-${id}`, x, y, W / tabs.length, navH, label, () => setScene(id));
  });
}

function drawHome() {
  clear();
  const driver = currentDriver();
  if (!state.player) {
    text("像素 F1 庄园", W / 2, 72, 24, "#f8d84a", "center", true);
    panel(24, 138, W - 48, 220);
    text("欢迎来到维修区", W / 2, 170, 20, "#f8d84a", "center", true);
    wrap("先选择一位车手，开始每日投喂并冲击本周冠军。", 48, 218, W - 96, 26, 15, "#cfd6dd");
    button("select-start", 58, 292, W - 116, 48, "选择车手", () => setScene("select"));
    return;
  }

  text(driver.name, 20, 24, 20, "#f8d84a", "left", true);
  text(`#${driver.number} · ${driver.team} · ${getLevel(state.player.growth).name}`, 20, 50, 13, "#aeb6c8");
  panel(18, 82, W - 36, Math.min(360, W + 16), "#263954", driver.palette[2]);
  const stageY = 94;
  drawSprite(driver, W / 2 - 120, stageY + 8, 240);
  text(`#${driver.number}`, W - 34, stageY + 245, 42, "rgba(244,240,216,0.18)", "right", true);

  if (state.feedAnim) {
    const p = Math.min(1, (Date.now() - state.feedAnim.start) / 720);
    text(driver.foodEmoji, W - 74 - p * 132, stageY + 268 - p * 186, 34);
    if (p >= 1) state.feedAnim = null;
  }
  if (state.deltaAnim) {
    const p = Math.min(1, (Date.now() - state.deltaAnim.start) / 900);
    text(`+${state.deltaAnim.value}`, W / 2, stageY + 210 - p * 58, 24, state.deltaAnim.lucky ? "#f8d84a" : "#37d67a", "center", true);
    if (p >= 1) state.deltaAnim = null;
  }
  if (Date.now() < state.luckyUntil) {
    text("LUCKY x2", W / 2, stageY + 28, 22, "#f8d84a", "center", true);
  }

  const speechY = stageY + 326;
  if (state.line) {
    panel(18, speechY, W - 36, 48, "#05070b", "#f8d84a");
    text(`${driver.moodEmoji} ${state.line}`, 34, speechY + 15, 14, "#f4f0d8");
  }

  const statusY = speechY + (state.line ? 64 : 18);
  panel(18, statusY, W - 36, 122);
  text("本周喂食量", 36, statusY + 18, 14, "#f4f0d8");
  text(String(state.feed.weeklyFeed || 0), W - 38, statusY + 18, 18, "#37d67a", "right", true);
  const progress = Math.min(1, (state.feed.weeklyFeed || 0) / 260);
  ctx.fillStyle = "#0a0d12";
  ctx.fillRect(36, statusY + 50, W - 72, 16);
  ctx.fillStyle = "#f8d84a";
  ctx.fillRect(39, statusY + 53, (W - 78) * progress, 10);
  text(`今日任务 ${state.feed.usedFeeds || 0}/${DAILY_LIMIT}`, 36, statusY + 80, 13, "#aeb6c8");
  text(`库存 ${state.feed.stock}`, W - 38, statusY + 80, 13, "#aeb6c8", "right");

  const feedDisabled = state.feed.usedFeeds >= DAILY_LIMIT || state.feed.stock <= 0;
  button("feed", 18, statusY + 140, W - 36, 48, `投喂 ${driver.food}`, feedDisabled ? null : feedDriverAction, feedDisabled ? "#343b4a" : "#f8d84a", feedDisabled ? "#737b8a" : "#111318");
  button("change", 18, statusY + 198, W - 36, 42, "更换车手", () => setScene("select"), "#202838", "#f4f0d8");
  drawNav();
}

function feedDriverAction() {
  if (!state.player) return;
  if (state.feed.usedFeeds >= DAILY_LIMIT || state.feed.stock <= 0) return;
  const lucky = Math.random() < 0.12;
  const value = lucky ? FEED_VALUE * 2 : FEED_VALUE;
  state.feed.usedFeeds += 1;
  state.feed.stock -= 1;
  state.feed.weeklyFeed += value;
  state.feed.logs.unshift({ id: `${Date.now()}`, value, lucky, time: Date.now() });
  saveFeed(state.feed);
  state.mood = lucky ? "lucky" : "eat";
  state.line = lucky ? "Perfect bite. Double points!" : "Energy is up.";
  state.feedAnim = { start: Date.now() };
  state.deltaAnim = { start: Date.now(), value, lucky };
  state.luckyUntil = lucky ? Date.now() + 900 : 0;
  if (wx.vibrateShort) wx.vibrateShort({ type: lucky ? "heavy" : "light" });
  setTimeout(() => {
    state.mood = "idle";
  }, 1300);
  setTimeout(() => {
    state.line = "";
  }, 2500);
}

function talkAction() {
  const driver = currentDriver();
  const quotes = driver.quotes || [];
  state.mood = "talk";
  state.line = quotes[Math.floor(Math.random() * quotes.length)] || "Ready to race!";
  setTimeout(() => {
    state.mood = "idle";
    state.line = "";
  }, 2200);
}

function drawSelect() {
  clear();
  text("选择车手", 20, 24, 22, "#f8d84a", "left", true);
  text("更换后喂食和成长重新计算", 20, 52, 13, "#aeb6c8");
  const cardW = (W - 54) / 2;
  const cardH = 166;
  drivers.forEach((driver, i) => {
    const x = 18 + (i % 2) * (cardW + 18);
    const y = 86 + Math.floor(i / 2) * (cardH + 16) - state.scroll;
    panel(x, y, cardW, cardH, state.selectedDriverId === driver.id ? "#242b3b" : "#1b2130", state.selectedDriverId === driver.id ? "#f8d84a" : "#f4f0d8");
    drawSprite(driver, x + cardW / 2 - 45, y + 8, 90, "idle");
    text(`#${driver.number} ${driver.badge}`, x + 12, y + 104, 14, "#f8d84a", "left", true);
    text(driver.name, x + 12, y + 126, 12, "#f4f0d8");
    text(`${driver.foodEmoji} ${driver.food}`, x + 12, y + 146, 11, "#aeb6c8");
    addButton(`pick-${driver.id}`, x, y, cardW, cardH, driver.name, () => {
      state.selectedDriverId = driver.id;
    });
  });
  button("confirm", 18, H - 122, W - 36, 48, "确认绑定", () => {
    state.player = bindDriver(state.selectedDriverId);
    state.feed = getFeedState();
    setScene("home");
  });
}

function drawGallery() {
  clear();
  text("车手图鉴", 20, 24, 22, "#f8d84a", "left", true);
  const cardH = 136;
  drivers.forEach((driver, i) => {
    const y = 70 + i * (cardH + 12) - state.scroll;
    panel(18, y, W - 36, cardH, "#1b2130", driver.palette[2]);
    drawSprite(driver, 28, y + 12, 108, "idle");
    text(`#${driver.number} ${driver.name}`, 146, y + 16, 15, "#f8d84a", "left", true);
    text(`${driver.team} · ${driver.foodEmoji} ${driver.food}`, 146, y + 40, 12, "#aeb6c8");
    wrap(driver.story, 146, y + 64, W - 170, 19, 12, "#cfd6dd");
  });
  drawNav();
}

function drawAchievements() {
  clear();
  const growth = state.player ? state.player.growth : 0;
  const level = getLevel(growth);
  text("成就", 20, 24, 22, "#f8d84a", "left", true);
  panel(18, 70, W - 36, 126);
  text("成长档案", 36, 92, 16, "#f8d84a", "left", true);
  text(`成长值 ${growth}`, 36, 122, 14, "#f4f0d8");
  text(`当前等级 ${level.name}`, 36, 150, 14, "#f4f0d8");
  text("等级路线", 20, 224, 18, "#f8d84a", "left", true);
  levels.forEach((item, i) => {
    const y = 260 + i * 46;
    panel(18, y, W - 36, 34, growth >= item.minGrowth ? "#183325" : "#151b26", growth >= item.minGrowth ? "#37d67a" : "#303849");
    text(item.name, 34, y + 9, 13, "#f4f0d8");
    text(String(item.minGrowth), W - 34, y + 9, 13, "#aeb6c8", "right");
  });
  drawNav();
}

function drawSettings() {
  clear();
  text("设置", 20, 24, 22, "#f8d84a", "left", true);
  panel(18, 80, W - 36, 150);
  text("关于游戏", 36, 104, 16, "#f8d84a", "left", true);
  wrap("当前为微信小游戏 Canvas 首版。先上线，再逐步补好友排行、云开发和周结算。", 36, 138, W - 72, 24, 13, "#cfd6dd");
  button("reset", 18, 260, W - 36, 44, "清空本地数据", () => {
    wx.removeStorageSync(PLAYER_KEY);
    wx.removeStorageSync(FEED_KEY);
    loadState();
    setScene("home");
  }, "#202838", "#f4f0d8");
  drawNav();
}

function draw() {
  if (state.scene === "select") drawSelect();
  else if (state.scene === "gallery") drawGallery();
  else if (state.scene === "achievements") drawAchievements();
  else if (state.scene === "settings") drawSettings();
  else drawHome();
}

function loop() {
  state.tick += 1;
  if (state.tick % 10 === 0) state.frame = (state.frame + 1) % SPRITE_COLS;
  draw();
  requestAnimationFrame(loop);
}

wx.onTouchStart((event) => {
  const touch = event.touches[0];
  const x = touch.clientX;
  const y = touch.clientY;
  const hit = [...state.buttons].reverse().find((btn) => x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h);
  if (hit && hit.action) {
    hit.action();
    return;
  }
  if (state.scene === "home" && state.player) {
    const stageTop = 82;
    const stageBottom = Math.min(442, W + 98);
    if (y >= stageTop && y <= stageBottom) talkAction();
  }
});

wx.onTouchMove((event) => {
  const touch = event.touches[0];
  if (!state.lastY) state.lastY = touch.clientY;
  const delta = state.lastY - touch.clientY;
  state.lastY = touch.clientY;
  if (state.scene === "select" || state.scene === "gallery") {
    state.scroll = Math.max(0, state.scroll + delta);
  }
});

wx.onTouchEnd(() => {
  state.lastY = null;
});

loadSprites();
loadState();
if (!state.player) setScene("select");
loop();

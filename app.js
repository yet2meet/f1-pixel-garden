const STORAGE = {
  player: "f1_pixel_pwa_player",
  feed: "f1_pixel_pwa_feed",
  deviceId: "f1_pixel_pwa_device_id",
};

const DAILY_LIMIT = 5;
const DAILY_STOCK = 5;
const FEED_VALUE = 20;
const GROWTH_PER_FEED = 12;
const PORTRAIT_EXPRESSIONS = ["neutral", "tap", "anticipate", "eat", "satisfied", "celebrate", "tired", "depleted"];

const drivers = [
  {
    id: "verstappen",
    name: "Max Verstappen",
    team: "Red Bull",
    food: "红牛饮料",
    foodEmoji: "🥤",
    number: "1",
    badge: "MV",
    moodEmoji: "😎",
    color: "#2f5be8",
    quotes: ["Simply lovely.", "That was mega!", "Box, box? I am flying."],
    story: "强势、直接、节奏惊人，把每一次起步都当成决胜圈。",
  },
  {
    id: "leclerc",
    name: "Charles Leclerc",
    team: "Ferrari",
    food: "香蕉",
    foodEmoji: "🍌",
    number: "16",
    badge: "CL",
    moodEmoji: "😉",
    color: "#ef2635",
    quotes: ["We are checking.", "Forza Ferrari!", "I need one clean lap."],
    story: "法拉利红色车库里的速度诗人，排位赛手感总是闪闪发亮。",
  },
  {
    id: "hamilton",
    name: "Lewis Hamilton",
    team: "Ferrari",
    food: "素食沙拉",
    foodEmoji: "🥗",
    number: "44",
    badge: "LH",
    moodEmoji: "💜",
    color: "#b5121b",
    quotes: ["Still we rise.", "Hammer time.", "Forza Ferrari."],
    story: "七冠传奇披上法拉利红，稳定、优雅，也会在关键时刻拿出冠军级爆发。",
  },
  {
    id: "norris",
    name: "Lando Norris",
    team: "McLaren",
    food: "炸鸡",
    foodEmoji: "🍗",
    number: "4",
    badge: "LN",
    moodEmoji: "😃",
    color: "#ff8700",
    quotes: ["Send it!", "That was spicy.", "Papaya power!"],
    story: "迈凯伦橙色能量担当，轻松外表下藏着越来越锋利的比赛节奏。",
  },
  {
    id: "piastri",
    name: "Oscar Piastri",
    team: "McLaren",
    food: "澳洲牛肉派",
    foodEmoji: "🥧",
    number: "81",
    badge: "OP",
    moodEmoji: "🧊",
    color: "#47c7fc",
    quotes: ["Cool, understood.", "Nice and calm.", "Let's execute."],
    story: "冷脸新星，学习速度快到像偷偷开了升级包。",
  },
  {
    id: "russell",
    name: "George Russell",
    team: "Mercedes",
    food: "蛋白棒",
    foodEmoji: "💪",
    number: "63",
    badge: "GR",
    moodEmoji: "📋",
    color: "#00d2be",
    quotes: ["Let's keep pushing.", "Tyres feel good.", "That was tidy."],
    story: "学院派速度机器，精准、勤奋，等待属于自己的银箭高光。",
  },
  {
    id: "antonelli",
    name: "Kimi Antonelli",
    team: "Mercedes",
    food: "意式能量披萨",
    foodEmoji: "🍕",
    number: "12",
    badge: "KA",
    moodEmoji: "⚡",
    color: "#cfd6dd",
    quotes: ["Copy, I am pushing.", "Let's keep learning.", "That felt quick!"],
    story: "梅赛德斯年轻新星，冷静、学习快，带着银箭青训的锐利速度登场。",
  },
  {
    id: "alonso",
    name: "Fernando Alonso",
    team: "Aston Martin",
    food: "西班牙玉米饼",
    foodEmoji: "🫓",
    number: "14",
    badge: "FA",
    moodEmoji: "🧠",
    color: "#006f62",
    quotes: ["GP2 engine!", "El plan.", "I know what to do."],
    story: "经验和斗志都拉满的老冠军，任何弯角都可能藏着他的计划。",
  },
];

const levels = [
  { name: "幼驾员", minGrowth: 0 },
  { name: "卡丁车手", minGrowth: 120 },
  { name: "F3 新秀", minGrowth: 320 },
  { name: "F2 悍将", minGrowth: 680 },
  { name: "F1 车手", minGrowth: 1200 },
  { name: "世界冠军", minGrowth: 2200 },
];

const state = {
  view: "home",
  selectedDriverId: "verstappen",
  playerId: "",
  mood: "idle",
  line: "",
  toast: "",
  backend: "checking",
  leaderboard: [],
  leaderboardUpdatedAt: 0,
  isFeeding: false,
  floatingFood: false,
  feedDelta: 0,
  luckyFlash: false,
  expressionFrame: 0,
};

const app = document.querySelector("#app");

function ensurePlayerId() {
  let id = localStorage.getItem(STORAGE.deviceId);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(STORAGE.deviceId, id);
  }
  state.playerId = id;
  return id;
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

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getDriver(id) {
  return drivers.find((driver) => driver.id === id) || drivers[0];
}

function getLevel(growth) {
  return levels.reduce((current, level) => (growth >= level.minGrowth ? level : current), levels[0]);
}

function getNextLevel(growth) {
  return levels.find((level) => level.minGrowth > growth) || levels[levels.length - 1];
}

function getPlayer() {
  return readJson(STORAGE.player);
}

function savePlayer(player) {
  writeJson(STORAGE.player, { ...player, updatedAt: Date.now() });
}

function getFeedState() {
  const today = todayKey();
  const weekId = getWeekId();
  const old = readJson(STORAGE.feed) || {};
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

function saveFeedState(feed) {
  writeJson(STORAGE.feed, feed);
}

function publicPlayerSnapshot(player = getPlayer(), feed = getFeedState()) {
  if (!player) return null;
  const driver = getDriver(player.driverId);
  return {
    playerId: ensurePlayerId(),
    nickName: player.nickName || "像素车迷",
    driverId: driver.id,
    driverName: driver.name,
    team: driver.team,
    badge: driver.badge,
    growth: player.growth || 0,
    weeklyFeed: feed.weeklyFeed || 0,
    weekId: feed.weekId || getWeekId(),
    usedFeeds: feed.usedFeeds || 0,
    updatedAt: Date.now(),
  };
}

async function callGameApi(payload, options = {}) {
  const response = await fetch("/.netlify/functions/game", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: options.signal,
  });
  if (!response.ok) throw new Error(`Game API ${response.status}`);
  return response.json();
}

async function syncRemote(reason = "sync") {
  const snapshot = publicPlayerSnapshot();
  if (!snapshot) return;
  try {
    const data = await callGameApi({ action: "syncPlayer", reason, player: snapshot });
    state.backend = data.storage === "blob" ? "online" : "offline";
  } catch {
    state.backend = "offline";
  }
}

async function refreshLeaderboard({ silent = true } = {}) {
  try {
    const data = await callGameApi({ action: "leaderboard", weekId: getWeekId() });
    state.backend = data.storage === "blob" ? "online" : "offline";
    state.leaderboard = Array.isArray(data.rankings) ? data.rankings : [];
    state.leaderboardUpdatedAt = Date.now();
    render();
  } catch {
    state.backend = "offline";
    if (!silent) showToast("云端排行榜暂时不可用，已保留本地进度");
    render();
  }
}

function bootstrapBackend() {
  ensurePlayerId();
  syncRemote("boot").finally(() => refreshLeaderboard({ silent: true }));
}

function bindDriver(driverId) {
  const old = getPlayer();
  const driver = getDriver(driverId);
  const player = {
    id: "me",
    nickName: old ? old.nickName : "像素车迷",
    driverId: driver.id,
    growth: old && old.driverId === driver.id ? old.growth : 0,
    championWeeks: old && old.driverId === driver.id ? old.championWeeks || [] : [],
    createdAt: old ? old.createdAt : Date.now(),
    updatedAt: Date.now(),
  };
  writeJson(STORAGE.player, player);
  if (!old || old.driverId !== driver.id) localStorage.removeItem(STORAGE.feed);
  state.view = "home";
  showToast(`已绑定 ${driver.name}`);
  render();
  syncRemote("bind").finally(() => refreshLeaderboard({ silent: true }));
}

function resetAll() {
  localStorage.removeItem(STORAGE.player);
  localStorage.removeItem(STORAGE.feed);
  state.view = "select";
  state.line = "";
  showToast("本地数据已清空");
  render();
  callGameApi({ action: "resetPlayer", playerId: ensurePlayerId(), weekId: getWeekId() })
    .finally(() => refreshLeaderboard({ silent: true }));
}

function portraitExpression(mood = state.mood) {
  return {
    idle: "neutral",
    talk: "tap",
    anticipate: "anticipate",
    eat: "eat",
    satisfied: "satisfied",
    celebrate: "celebrate",
    tired: "tired",
    depleted: "depleted",
  }[mood] || "neutral";
}

function portraitSrc(driver, expression = portraitExpression()) {
  const index = PORTRAIT_EXPRESSIONS.indexOf(expression);
  const serial = String(index + 1).padStart(2, "0");
  return `./portraits/${driver.id}_${serial}_${expression}.png`;
}

function rotatingPortraitSrc(driver) {
  const expression = PORTRAIT_EXPRESSIONS[state.expressionFrame % PORTRAIT_EXPRESSIONS.length];
  return portraitSrc(driver, expression);
}

function currentModel() {
  const player = getPlayer();
  const feed = getFeedState();
  const driver = player ? getDriver(player.driverId) : getDriver(state.selectedDriverId);
  const growth = player ? player.growth : 0;
  return {
    player,
    feed,
    driver,
    level: getLevel(growth),
    nextLevel: getNextLevel(growth),
  };
}

function feedDriver() {
  const player = getPlayer();
  if (!player) {
    state.view = "select";
    render();
    return;
  }
  const feed = getFeedState();
  if (feed.usedFeeds >= DAILY_LIMIT) return showToast("今天的喂食次数已经用完");
  if (feed.stock <= 0) return showToast("今天的食物库存不足");

  const lucky = Math.random() < 0.12;
  const value = lucky ? FEED_VALUE * 2 : FEED_VALUE;
  const growthValue = lucky ? GROWTH_PER_FEED * 2 : GROWTH_PER_FEED;
  feed.usedFeeds += 1;
  feed.stock -= 1;
  feed.weeklyFeed += value;
  feed.logs.unshift({ id: `${Date.now()}`, time: Date.now(), value, growthValue, lucky });
  saveFeedState(feed);
  savePlayer({ ...player, growth: (player.growth || 0) + growthValue });
  syncRemote(lucky ? "luckyFeed" : "feed").finally(() => refreshLeaderboard({ silent: true }));

  state.mood = "eat";
  state.line = lucky ? "完美补给！这口直接双倍加速。" : randomLine(["能量补满，下一圈继续推。", "这口燃料味道很快。", "维修区节奏不错。"]);
  state.isFeeding = true;
  state.floatingFood = true;
  state.feedDelta = value;
  state.luckyFlash = lucky;
  render();

  window.setTimeout(() => {
    state.mood = lucky ? "celebrate" : "satisfied";
    state.floatingFood = false;
    render();
  }, 560);

  window.setTimeout(() => {
    const nextFeed = getFeedState();
    state.mood = nextFeed.usedFeeds >= DAILY_LIMIT ? "tired" : "idle";
    state.isFeeding = false;
    state.feedDelta = 0;
    state.luckyFlash = false;
    render();
  }, 1280);

  window.setTimeout(() => {
    state.line = "";
    render();
  }, 2500);
}

function talkToDriver() {
  const { driver } = currentModel();
  state.mood = "talk";
  state.line = randomLine(driver.quotes);
  render();
  window.setTimeout(() => {
    state.mood = "idle";
    state.line = "";
    render();
  }, 2200);
}

function randomLine(lines) {
  return lines[Math.floor(Math.random() * lines.length)] || "";
}

function showToast(message) {
  state.toast = message;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 1800);
}

function render() {
  const player = getPlayer();
  if (!player && state.view === "home") state.view = "select";
  app.innerHTML = `
    ${renderHeader()}
    ${renderView()}
    ${renderTabbar()}
    ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
  `;
  bindEvents();
}

function renderHeader() {
  const { feed } = currentModel();
  const backendLabel = state.backend === "online" ? "云端在线" : state.backend === "offline" ? "本地模式" : "同步中";
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">Pixel F1 Garden</p>
        <h1>F1 像素庄园</h1>
      </div>
      <div class="week-pill">${feed.weekId || getWeekId()} · ${backendLabel}</div>
    </header>
  `;
}

function renderView() {
  if (state.view === "select") return renderSelect();
  if (state.view === "garage") return renderGarage();
  if (state.view === "leaderboard") return renderLeaderboard();
  if (state.view === "achievements") return renderAchievements();
  if (state.view === "settings") return renderSettings();
  return renderHome();
}

function renderHome() {
  const { player, feed, driver, level, nextLevel } = currentModel();
  if (!player) return renderSelect();
  const remain = Math.max(0, DAILY_LIMIT - feed.usedFeeds);
  const growth = player.growth || 0;
  const weeklyProgress = Math.min(100, Math.round((feed.weeklyFeed / 260) * 100));
  const levelProgress = nextLevel.minGrowth === level.minGrowth
    ? 100
    : Math.min(100, Math.round(((growth - level.minGrowth) / (nextLevel.minGrowth - level.minGrowth)) * 100));
  const disabled = remain <= 0 || feed.stock <= 0 || state.isFeeding;
  return `
    <main>
      <section class="hero-stage ${state.luckyFlash ? "lucky" : ""}" style="--driver:${driver.color}">
        <div class="track-lines"></div>
        <div class="driver-card">
          <div class="driver-meta">
            <span>#${driver.number} ${driver.team}</span>
            <span>${level.name}</span>
          </div>
          <h2 class="driver-name">${driver.name}</h2>
          <button class="portrait-wrap ${state.isFeeding ? "is-feeding" : ""}" data-action="talk" aria-label="和车手互动">
            <img data-home-portrait="${driver.id}" src="${portraitSrc(driver)}" alt="${driver.name}" />
          </button>
          ${state.floatingFood ? `<div class="food-fly">${driver.foodEmoji}</div>` : ""}
          ${state.feedDelta ? `<div class="delta">+${state.feedDelta}</div>` : ""}
        </div>
        <div class="speech">${state.line ? `${driver.moodEmoji} ${state.line}` : "点一点车手，或者给他喂食。今天的围场还很安静。"}</div>
      </section>

      <section class="stats-grid">
        <div class="stat">
          <span class="label">本周喂食</span>
          <span class="value">${feed.weeklyFeed || 0}</span>
          <div class="progress" style="--progress:${weeklyProgress}%"><span></span></div>
        </div>
        <div class="stat">
          <span class="label">成长值</span>
          <span class="value">${growth}</span>
          <div class="progress" style="--progress:${levelProgress}%"><span></span></div>
        </div>
        <div class="stat">
          <span class="label">今日任务</span>
          <span class="value">${feed.usedFeeds}/${DAILY_LIMIT}</span>
        </div>
        <div class="stat">
          <span class="label">食物库存</span>
          <span class="value">${feed.stock}</span>
        </div>
      </section>

      <section class="actions">
        <button class="btn" data-action="feed" ${disabled ? "disabled" : ""}>喂食 ${driver.foodEmoji} ${driver.food}</button>
        <button class="btn secondary" data-view="select">更换车手</button>
      </section>
    </main>
  `;
}

function renderSelect() {
  return `
    <main>
      <section class="panel intro-panel">
        <h2>选择你的首发车手</h2>
        <p class="label">当前版本包含 8 位车手，每位都有 8 张表情头像。选择后可在本地重新绑定。</p>
      </section>
      <section class="driver-grid">
        ${drivers.map((driver) => `
          <button class="driver-tile ${state.selectedDriverId === driver.id ? "selected" : ""}" style="--driver:${driver.color}" data-select="${driver.id}">
            <img data-rotating-portrait="${driver.id}" src="${rotatingPortraitSrc(driver)}" alt="${driver.name}" />
            <strong>#${driver.number} ${driver.badge}</strong>
            <span>${driver.name}</span>
            <span>${driver.foodEmoji} ${driver.food}</span>
          </button>
        `).join("")}
      </section>
      <section class="actions" style="margin-top:14px">
        <button class="btn" data-bind="${state.selectedDriverId}">确认绑定</button>
      </section>
    </main>
  `;
}

function renderGarage() {
  return `
    <main>
      <section class="panel">
        <h2>车手图鉴</h2>
        <div class="list">
          ${drivers.map((driver) => `
            <div class="list-row" style="--driver:${driver.color}">
              <img src="${portraitSrc(driver, "neutral")}" alt="${driver.name}" />
              <div>
                <strong>#${driver.number} ${driver.name}</strong>
                <small>${driver.team} · ${driver.story}</small>
              </div>
              <span>${driver.badge}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderLeaderboard() {
  const me = ensurePlayerId();
  const local = publicPlayerSnapshot();
  const rows = state.leaderboard.length ? state.leaderboard : local ? [local] : [];
  return `
    <main>
      <section class="panel">
        <h2>本周排行榜</h2>
        <p class="label">${state.backend === "online" ? "云端数据已同步，所有玩家共享同一周榜。" : "当前是本地模式。部署 Netlify Functions 后会自动切换到云端周榜。"}</p>
        <div class="list">
          ${rows.map((row, index) => {
            const driver = getDriver(row.driverId);
            return `
              <div class="list-row ${row.playerId === me ? "selected-row" : ""}" style="--driver:${driver.color}">
                <img src="${portraitSrc(driver, index === 0 ? "celebrate" : "neutral")}" alt="${row.driverName || driver.name}" />
                <div>
                  <strong>#${index + 1} ${row.nickName || "像素车迷"}</strong>
                  <small>${row.driverName || driver.name} · 本周喂食 ${row.weeklyFeed || 0} · 成长值 ${row.growth || 0}</small>
                </div>
                <span>${row.badge || driver.badge}</span>
              </div>
            `;
          }).join("")}
        </div>
      </section>
      <section class="actions">
        <button class="btn secondary" data-action="refreshLeaderboard">刷新排行榜</button>
      </section>
    </main>
  `;
}

function renderAchievements() {
  const { player, feed, level, nextLevel } = currentModel();
  const growth = player ? player.growth || 0 : 0;
  return `
    <main>
      <section class="panel">
        <h2>成就档案</h2>
        <p>当前等级：<strong>${level.name}</strong></p>
        <p>成长值：${growth}</p>
        <p>本周喂食：${feed.weeklyFeed || 0}</p>
        <p class="label">${nextLevel.minGrowth === level.minGrowth ? "已经抵达最高等级。" : `距离 ${nextLevel.name} 还差 ${nextLevel.minGrowth - growth} 成长值。`}</p>
      </section>
      <section class="panel">
        <h2>等级路线</h2>
        <div class="list">
          ${levels.map((item) => `
            <div class="list-row">
              <span>${growth >= item.minGrowth ? "✓" : "·"}</span>
              <div><strong>${item.name}</strong><small>成长值达到 ${item.minGrowth}</small></div>
              <span>${item.minGrowth}</span>
            </div>
          `).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderSettings() {
  return `
    <main>
      <section class="panel">
        <h2>设置</h2>
        <p>这是 Web/PWA 版本，可以在 iOS Safari 或 Android Chrome 里添加到主屏幕。数据保存在本机浏览器。</p>
      </section>
      <section class="actions">
        <button class="btn secondary" data-action="install">安装提示</button>
        <button class="btn secondary" data-action="reset">清空本地数据</button>
      </section>
    </main>
  `;
}

function renderTabbar() {
  const tabs = [
    ["home", "养成"],
    ["leaderboard", "排行"],
    ["garage", "图鉴"],
    ["achievements", "成就"],
    ["settings", "设置"],
  ];
  return `
    <nav class="tabbar" aria-label="主导航">
      ${tabs.map(([view, label]) => `<button class="${state.view === view ? "active" : ""}" data-view="${view}">${label}</button>`).join("")}
    </nav>
  `;
}

function bindEvents() {
  app.querySelectorAll("[data-view]").forEach((node) => {
    node.addEventListener("click", () => {
      state.view = node.dataset.view;
      render();
    });
  });
  app.querySelectorAll("[data-select]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedDriverId = node.dataset.select;
      render();
    });
  });
  app.querySelectorAll("[data-bind]").forEach((node) => {
    node.addEventListener("click", () => bindDriver(node.dataset.bind));
  });
  app.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", () => {
      const action = node.dataset.action;
      if (action === "feed") feedDriver();
      if (action === "talk") talkToDriver();
      if (action === "reset") resetAll();
      if (action === "refreshLeaderboard") refreshLeaderboard({ silent: false });
      if (action === "install") showToast("iOS: Safari 分享按钮 -> 添加到主屏幕；Android: 浏览器菜单 -> 安装应用");
    });
  });
}

window.setInterval(() => {
  state.expressionFrame = (state.expressionFrame + 1) % PORTRAIT_EXPRESSIONS.length;
  const { driver } = currentModel();
  app.querySelectorAll("[data-home-portrait]").forEach((img) => {
    img.src = portraitSrc(driver);
  });
  app.querySelectorAll("[data-rotating-portrait]").forEach((img) => {
    img.src = rotatingPortraitSrc(getDriver(img.dataset.rotatingPortrait));
  });
}, 320);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

render();
bootstrapBackend();

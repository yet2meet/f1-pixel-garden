const STORAGE = {
  player: "f1_pixel_pwa_player",
  feed: "f1_pixel_pwa_feed",
  inventory: "f1_pixel_pwa_food_inventory",
  gifts: "f1_pixel_pwa_food_gifts",
  deviceId: "f1_pixel_pwa_device_id",
  account: "f1_pixel_pwa_account",
};

const DAILY_LIMIT = 5;
const DAILY_STOCK = 5;
const FEED_VALUE = 20;
const GROWTH_PER_FEED = 12;
const FAVORITE_FEED_BONUS = 8;
const FAVORITE_GROWTH_BONUS = 4;
const MAX_FOOD_STACK = 99;
const WEEKLY_GIFT_LIMIT = 2;
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
    quotes: [
      "Simply lovely.",
      "That was mega!",
      "Box, box? I am flying.",
      "No drama. Just apex, throttle, repeat.",
      "Give me clean air and I will handle the rest.",
      "Track limits? I prefer track dominance.",
      "This lap feels purple already.",
      "I smell fastest sector.",
      "Keep the snacks efficient. I have a race to win.",
      "Tell the pit wall I am pushing.",
    ],
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
    quotes: [
      "We are checking.",
      "Forza Ferrari!",
      "I need one clean lap.",
      "The car is alive in sector two.",
      "Give me space. I will paint the kerbs red.",
      "This is quali mode in my heart.",
      "I can find two tenths if the tyres wake up.",
      "Copy. Head down, full send.",
      "If we suffer, we suffer beautifully.",
      "One more lap. I can make it count.",
    ],
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
    quotes: [
      "Still we rise.",
      "Hammer time.",
      "Forza Ferrari.",
      "Bono, my snacks are gone.",
      "The tyres are speaking. I am listening.",
      "Let us keep the energy clean.",
      "Every lap is a chance to reset.",
      "I have got more pace in the pocket.",
      "This corner needs patience, then power.",
      "Keep believing. I am still here.",
    ],
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
    quotes: [
      "Send it!",
      "That was spicy.",
      "Papaya power!",
      "I saw the gap and it looked friendly.",
      "Box for snacks? Asking professionally.",
      "This pace is actually decent.",
      "Let Oscar know I am being very mature.",
      "The kerb bit back. Rude.",
      "Give me one more lap; I am cooking.",
      "If this works, pretend it was the plan.",
    ],
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
    quotes: [
      "Cool, understood.",
      "Nice and calm.",
      "Let's execute.",
      "The tyres are good. No need for poetry.",
      "I will pass when the maths says yes.",
      "Copy. Minimal fuss, maximum lap time.",
      "This is fine. Very fine.",
      "Tell Lando I said hi from the apex.",
      "I can manage this stint.",
      "Quiet car, quick car. I like it.",
    ],
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
    quotes: [
      "Let's keep pushing.",
      "Tyres feel good.",
      "That was tidy.",
      "Forecast says opportunity.",
      "I can be sensible and quick. Mostly quick.",
      "This is our moment if we stay sharp.",
      "Give me the gap. I will measure it properly.",
      "Mode push. Clipboard closed.",
      "The car is responding well.",
      "No overthinking. Hit the marks.",
    ],
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
    quotes: [
      "Copy, I am pushing.",
      "Let's keep learning.",
      "That felt quick!",
      "I am young, not slow.",
      "Give me the delta. I will chase it.",
      "The car is nervous, but I can work with it.",
      "Silver suit, rookie licence, full attack.",
      "I will keep it clean through the next sector.",
      "Every lap is data.",
      "Tell George I am taking notes.",
    ],
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
    quotes: [
      "GP2 engine!",
      "El plan.",
      "I know what to do.",
      "Leave-a the space.",
      "The plan is older than the tyres.",
      "I have seen this race before. Twice.",
      "Give me chaos. I can use it.",
      "Strategy B? I invented Strategy B.",
      "This corner owes me respect.",
      "Trust the experience. And the snacks.",
    ],
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

const rarityMeta = {
  normal: { label: "普通", className: "normal" },
  rare: { label: "稀有", className: "rare" },
  legendary: { label: "传奇", className: "legendary" },
};

const foodCatalog = drivers.map((driver, index) => ({
  id: driver.id,
  name: driver.food,
  emoji: driver.foodEmoji,
  driverName: driver.name,
  team: driver.team,
  rarity: index === 0 ? "rare" : "normal",
  color: driver.color,
}));

const friend = {
  id: "friend-rival",
  name: "Charles 车库",
  rank: "#16",
};

const state = {
  view: "home",
  selectedDriverId: "verstappen",
  giftFoodId: "",
  giftQuantity: 1,
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
  lastQuoteByDriver: {},
};

const app = document.querySelector("#app");

function ensurePlayerId() {
  const account = getAccount();
  if (account) {
    state.playerId = account.id;
    return account.id;
  }

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
  const player = readJson(STORAGE.player);
  if (!player) return null;
  return {
    ...player,
    treasures: player.treasures || 0,
    achievements: Array.isArray(player.achievements) ? player.achievements : [],
  };
}

function savePlayer(player) {
  writeJson(STORAGE.player, {
    ...player,
    treasures: player.treasures || 0,
    achievements: Array.isArray(player.achievements) ? player.achievements : [],
    updatedAt: Date.now(),
  });
}

function getAccount() {
  return readJson(STORAGE.account);
}

function saveAccount(account) {
  writeJson(STORAGE.account, account);
  state.playerId = account.id;
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

function emptyInventory() {
  return foodCatalog.reduce((items, food) => {
    items[food.id] = 0;
    return items;
  }, {});
}

function getInventoryState() {
  const old = readJson(STORAGE.inventory) || {};
  const items = { ...emptyInventory(), ...(old.items || old) };
  foodCatalog.forEach((food) => {
    items[food.id] = Math.max(0, Math.min(MAX_FOOD_STACK, Number(items[food.id]) || 0));
  });
  return {
    items,
    lastDailyReward: old.lastDailyReward || "",
  };
}

function saveInventoryState(inventory) {
  writeJson(STORAGE.inventory, inventory);
}

function getGiftState() {
  const weekId = getWeekId();
  const old = readJson(STORAGE.gifts) || {};
  return {
    weekId,
    sentThisWeek: old.weekId === weekId ? old.sentThisWeek || 0 : 0,
    records: Array.isArray(old.records) ? old.records.slice(0, 12) : [],
  };
}

function saveGiftState(gifts) {
  writeJson(STORAGE.gifts, gifts);
}

function findFood(foodId) {
  return foodCatalog.find((food) => food.id === foodId) || foodCatalog[0];
}

function addFood(foodId, quantity = 1) {
  const inventory = getInventoryState();
  inventory.items[foodId] = Math.min(MAX_FOOD_STACK, (inventory.items[foodId] || 0) + quantity);
  saveInventoryState(inventory);
  return inventory;
}

function consumeFood(foodId, quantity = 1) {
  const inventory = getInventoryState();
  if ((inventory.items[foodId] || 0) < quantity) return false;
  inventory.items[foodId] -= quantity;
  saveInventoryState(inventory);
  return true;
}

function claimDailyFoodReward() {
  const player = getPlayer();
  if (!player) return;
  const inventory = getInventoryState();
  const today = todayKey();
  if (inventory.lastDailyReward === today) return;
  const reward = foodCatalog[Math.floor(Math.random() * foodCatalog.length)];
  inventory.items[reward.id] = Math.min(MAX_FOOD_STACK, (inventory.items[reward.id] || 0) + 1);
  inventory.lastDailyReward = today;
  saveInventoryState(inventory);
  showToast(`每日登录奖励：${reward.emoji} ${reward.name} +1`);
}

function collectionCount(inventory = getInventoryState()) {
  return foodCatalog.filter((food) => (inventory.items[food.id] || 0) > 0).length;
}

function canRedeemCollection(inventory = getInventoryState()) {
  return foodCatalog.every((food) => (inventory.items[food.id] || 0) > 0);
}

function giftLeft(gifts = getGiftState()) {
  return Math.max(0, WEEKLY_GIFT_LIMIT - (gifts.sentThisWeek || 0));
}

function publicPlayerSnapshot(player = getPlayer(), feed = getFeedState()) {
  if (!player) return null;
  const account = getAccount();
  if (!account) return null;
  const driver = getDriver(player.driverId);
  return {
    playerId: account.id,
    nickName: account.nickName || player.nickName || account.accountName,
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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Game API ${response.status}`);
  return data;
}

async function syncRemote(reason = "sync") {
  const snapshot = publicPlayerSnapshot();
  if (!snapshot) return;
  const account = getAccount();
  try {
    const data = await callGameApi({ action: "syncPlayer", reason, player: snapshot, accountToken: account?.authToken });
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

async function authenticateAccount(mode) {
  const accountName = app.querySelector("[data-auth-account]")?.value.trim();
  const password = app.querySelector("[data-auth-password]")?.value;
  const nickName = app.querySelector("[data-auth-nickname]")?.value.trim() || accountName;
  if (!accountName || !password) return showToast("请输入账号和密码");

  try {
    const data = await callGameApi({
      action: mode === "register" ? "registerAccount" : "loginAccount",
      accountName,
      password,
      nickName,
    });
    saveAccount(data.account);
    const player = getPlayer();
    if (player) savePlayer({ ...player, nickName: data.account.nickName });
    state.backend = data.storage === "blob" ? "online" : "offline";
    showToast(mode === "register" ? "账号已注册并登录" : "账号已登录");
    render();
    syncRemote("auth").finally(() => refreshLeaderboard({ silent: true }));
  } catch (error) {
    const message = {
      account_exists: "账号已存在，请直接登录",
      invalid_login: "账号或密码不正确",
      invalid_credentials: "账号需 3-24 位英文/数字/_/-，密码至少 4 位",
      storage_unavailable: "云端账号暂时不可用",
    }[error.message] || "账号操作失败";
    showToast(message);
  }
}

function logoutAccount() {
  localStorage.removeItem(STORAGE.account);
  state.playerId = "";
  showToast("已退出账号，本地进度仍保留");
  render();
}

function bootstrapBackend() {
  const account = getAccount();
  if (account) state.playerId = account.id;
  syncRemote("boot").finally(() => refreshLeaderboard({ silent: true }));
}

function bindDriver(driverId) {
  const old = getPlayer();
  const account = getAccount();
  const driver = getDriver(driverId);
  const player = {
    id: "me",
    nickName: old ? old.nickName : "像素车迷",
    driverId: driver.id,
    nickName: account ? account.nickName : old ? old.nickName : "Pixel Racer",
    growth: old ? old.growth || 0 : 0,
    treasures: old ? old.treasures || 0 : 0,
    achievements: old && Array.isArray(old.achievements) ? old.achievements : [],
    championWeeks: old ? old.championWeeks || [] : [],
    createdAt: old ? old.createdAt : Date.now(),
    updatedAt: Date.now(),
  };
  savePlayer(player);
  if (!old || old.driverId !== driver.id) localStorage.removeItem(STORAGE.feed);
  state.view = "home";
  showToast(`已绑定 ${driver.name}`);
  claimDailyFoodReward();
  render();
  syncRemote("bind").finally(() => refreshLeaderboard({ silent: true }));
}

function resetAll() {
  localStorage.removeItem(STORAGE.player);
  localStorage.removeItem(STORAGE.feed);
  localStorage.removeItem(STORAGE.inventory);
  localStorage.removeItem(STORAGE.gifts);
  state.view = "select";
  state.line = "";
  showToast("本地数据已清空");
  render();
  const account = getAccount();
  callGameApi({ action: "resetPlayer", playerId: ensurePlayerId(), weekId: getWeekId(), accountToken: account?.authToken })
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
  const inventory = getInventoryState();
  const favoriteQty = inventory.items[player.driverId] || 0;
  const useFavoriteFood = favoriteQty > 0;
  if (!useFavoriteFood && feed.stock <= 0) return showToast("今天的补给和专属食物都不足");
  if (useFavoriteFood) {
    inventory.items[player.driverId] -= 1;
    saveInventoryState(inventory);
  } else {
    feed.stock -= 1;
  }

  const lucky = Math.random() < 0.12;
  const baseValue = FEED_VALUE + (useFavoriteFood ? FAVORITE_FEED_BONUS : 0);
  const baseGrowth = GROWTH_PER_FEED + (useFavoriteFood ? FAVORITE_GROWTH_BONUS : 0);
  const value = lucky ? baseValue * 2 : baseValue;
  const growthValue = lucky ? baseGrowth * 2 : baseGrowth;
  feed.usedFeeds += 1;
  feed.weeklyFeed += value;
  feed.logs.unshift({ id: `${Date.now()}`, time: Date.now(), value, growthValue, lucky, foodId: useFavoriteFood ? player.driverId : "daily-stock" });
  saveFeedState(feed);
  savePlayer({ ...player, growth: (player.growth || 0) + growthValue });
  syncRemote(lucky ? "luckyFeed" : "feed").finally(() => refreshLeaderboard({ silent: true }));

  state.mood = "eat";
  state.line = useFavoriteFood ? "专属食物命中节奏，成长加速。" : lucky ? "完美补给！这口直接双倍加速。" : randomLine(["能量补满，下一圈继续推。", "这口燃料味道很快。", "维修区节奏不错。"]);
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
  state.line = randomLine(driver.quotes, state.lastQuoteByDriver[driver.id]);
  state.lastQuoteByDriver[driver.id] = state.line;
  render();
  window.setTimeout(() => {
    state.mood = "idle";
    state.line = "";
    render();
  }, 2200);
}

function randomLine(lines, previous = "") {
  const pool = lines.length > 1 ? lines.filter((line) => line !== previous) : lines;
  return pool[Math.floor(Math.random() * pool.length)] || "";
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
  if (player) claimDailyFoodReward();
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
  if (state.view === "warehouse") return renderWarehouse();
  if (state.view === "garage") return renderGarage();
  if (state.view === "leaderboard") return renderLeaderboard();
  if (state.view === "achievements") return renderAchievements();
  if (state.view === "settings") return renderSettings();
  return renderHome();
}

function renderSideDriverName(name) {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `<span class="name-word">${[...word].reverse().map((letter) => `<span>${letter}</span>`).join("")}</span>`)
    .join("");
  return `<h2 class="driver-name" aria-label="${name}">${words}</h2>`;
}

function renderHome() {
  const { player, feed, driver, level, nextLevel } = currentModel();
  if (!player) return renderSelect();
  const inventory = getInventoryState();
  const favoriteQty = inventory.items[driver.id] || 0;
  const remain = Math.max(0, DAILY_LIMIT - feed.usedFeeds);
  const growth = player.growth || 0;
  const weeklyProgress = Math.min(100, Math.round((feed.weeklyFeed / 260) * 100));
  const levelProgress = nextLevel.minGrowth === level.minGrowth
    ? 100
    : Math.min(100, Math.round(((growth - level.minGrowth) / (nextLevel.minGrowth - level.minGrowth)) * 100));
  const disabled = remain <= 0 || (feed.stock <= 0 && favoriteQty <= 0) || state.isFeeding;
  return `
    <main class="home-main">
      <section class="hero-stage ${state.luckyFlash ? "lucky" : ""}" style="--driver:${driver.color}">
        <div class="track-lines"></div>
        <div class="driver-card">
          <div class="driver-meta">
            <span>#${driver.number} ${driver.team}</span>
            <span>${level.name}</span>
          </div>
          ${renderSideDriverName(driver.name)}
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
          <span class="label">补给库存</span>
          <span class="value">${feed.stock}</span>
        </div>
        <div class="stat wide-stat">
          <span class="label">仓库推荐</span>
          <span class="value">${driver.foodEmoji} x${favoriteQty}</span>
          <small>${favoriteQty > 0 ? "本次优先消耗专属食物，喂食和成长都有加成。" : "没有专属食物时使用每日补给。"}</small>
        </div>
      </section>

      <section class="actions">
        <button class="btn" data-action="feed" ${disabled ? "disabled" : ""}>${favoriteQty > 0 ? "喂食库存" : "喂食补给"} ${driver.foodEmoji} ${driver.food}</button>
        <button class="btn secondary" data-view="select">更换车手</button>
      </section>
    </main>
  `;
}

function renderSelect() {
  return `
    <main class="select-main">
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
      <section class="actions select-actions">
        <button class="btn" data-bind="${state.selectedDriverId}">确认绑定</button>
      </section>
    </main>
  `;
}

function renderWarehouse() {
  const player = getPlayer();
  if (!player) return renderSelect();
  const inventory = getInventoryState();
  const gifts = getGiftState();
  const collected = collectionCount(inventory);
  const missing = foodCatalog.filter((food) => (inventory.items[food.id] || 0) <= 0);
  return `
    <main class="warehouse-main">
      <section class="panel collection-panel">
        <h2>食物仓库</h2>
        <p class="label">集合进度 ${collected}/8 · 珍珠 ${player.treasures || 0} · 本周可赠送 ${giftLeft(gifts)}/${WEEKLY_GIFT_LIMIT}</p>
        <div class="progress collection-progress" style="--progress:${Math.round((collected / foodCatalog.length) * 100)}%"><span></span></div>
        <p class="label">缺少：${missing.length ? missing.map((food) => food.name).join("、") : "已集齐"}</p>
        <button class="btn" data-action="redeemCollection" ${canRedeemCollection(inventory) ? "" : "disabled"}>集齐兑换 金牌美食家</button>
      </section>
      <section class="food-grid">
        ${foodCatalog.map((food) => {
          const qty = inventory.items[food.id] || 0;
          const rarity = rarityMeta[food.rarity] || rarityMeta.normal;
          return `
            <article class="food-card ${qty <= 0 ? "empty" : ""}" style="--driver:${food.color}">
              <div class="food-icon">${food.emoji}</div>
              <div>
                <strong>${food.name}</strong>
                <small>${food.driverName}</small>
              </div>
              <span class="rarity ${rarity.className}">${rarity.label}</span>
              <span class="food-count">x${qty}</span>
              <button class="mini-btn" data-gift="${food.id}" ${qty > 0 && giftLeft(gifts) > 0 ? "" : "disabled"}>赠送</button>
            </article>
          `;
        }).join("")}
      </section>
      <section class="panel gift-log-panel">
        <h2>最近赠送</h2>
        <div class="list">
          ${gifts.records.length ? gifts.records.slice(0, 5).map((record) => {
            const food = findFood(record.foodId);
            return `<div class="list-row"><span>${food.emoji}</span><div><strong>送给 ${record.to}</strong><small>${food.name} x${record.quantity}</small></div><span>${record.weekId}</span></div>`;
          }).join("") : `<p class="label">还没有赠送记录。</p>`}
        </div>
      </section>
      ${state.giftFoodId ? renderGiftModal() : ""}
    </main>
  `;
}

function renderGiftModal() {
  const inventory = getInventoryState();
  const food = findFood(state.giftFoodId);
  const owned = inventory.items[food.id] || 0;
  const quantity = Math.min(state.giftQuantity, Math.min(5, owned));
  state.giftQuantity = Math.max(1, quantity);
  return `
    <div class="modal-backdrop">
      <section class="gift-modal panel">
        <h2>赠送食物给好友</h2>
        <p class="label">好友：${friend.name} ${friend.rank}</p>
        <div class="gift-preview" style="--driver:${food.color}">
          <span>${food.emoji}</span>
          <div><strong>${food.name}</strong><small>持有 x${owned} · ${food.driverName}</small></div>
        </div>
        <div class="quantity-row">
          <button class="mini-btn" data-gift-qty="-1">-</button>
          <strong>${state.giftQuantity}</strong>
          <button class="mini-btn" data-gift-qty="1" ${state.giftQuantity >= Math.min(5, owned) ? "disabled" : ""}>+</button>
        </div>
        <p class="label">预览：赠送 ${state.giftQuantity} 个 ${food.name}</p>
        <section class="actions account-actions">
          <button class="btn" data-action="confirmGift">确认</button>
          <button class="btn secondary" data-action="cancelGift">取消</button>
        </section>
      </section>
    </div>
  `;
}

function openGift(foodId) {
  state.giftFoodId = foodId;
  state.giftQuantity = 1;
  render();
}

function confirmGift() {
  const gifts = getGiftState();
  if (!state.giftFoodId || giftLeft(gifts) <= 0) return showToast("本周赠送次数已用完");
  const food = findFood(state.giftFoodId);
  const quantity = Math.min(5, state.giftQuantity);
  if (!consumeFood(food.id, quantity)) return showToast("库存不足，无法赠送");
  gifts.sentThisWeek += 1;
  gifts.records.unshift({
    id: `${Date.now()}`,
    foodId: food.id,
    quantity,
    to: friend.name,
    weekId: gifts.weekId,
    sentAt: Date.now(),
  });
  gifts.records = gifts.records.slice(0, 12);
  saveGiftState(gifts);
  state.giftFoodId = "";
  state.giftQuantity = 1;
  showToast(`已赠送 ${food.name} x${quantity}`);
  render();
}

function redeemCollection() {
  const player = getPlayer();
  const inventory = getInventoryState();
  if (!player || !canRedeemCollection(inventory)) return showToast("还没有集齐 8 种食物");
  foodCatalog.forEach((food) => {
    inventory.items[food.id] -= 1;
  });
  saveInventoryState(inventory);
  const achievements = Array.isArray(player.achievements) ? player.achievements : [];
  if (!achievements.includes("gold_foodie")) achievements.push("gold_foodie");
  savePlayer({
    ...player,
    treasures: (player.treasures || 0) + 10,
    achievements,
  });
  showToast("兑换成功：金牌美食家 + 珍珠 x10");
  render();
}

function renderGarage() {
  return `
    <main class="garage-main">
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
    <main class="leaderboard-main">
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
  const hasFoodie = player && Array.isArray(player.achievements) && player.achievements.includes("gold_foodie");
  return `
    <main class="achievements-main">
      <section class="panel">
        <h2>成就档案</h2>
        <p>当前等级：<strong>${level.name}</strong></p>
        <p>成长值：${growth}</p>
        <p>本周喂食：${feed.weeklyFeed || 0}</p>
        <p>珍珠：${player ? player.treasures || 0 : 0}</p>
        <p>金牌美食家：<strong>${hasFoodie ? "已解锁" : "未解锁"}</strong></p>
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
  const account = getAccount();
  return `
    <main class="settings-main">
      <section class="panel account-panel">
        <h2>云端账号</h2>
        ${account ? `
          <p class="label">已登录：${account.nickName} / ${account.accountName}</p>
          <p class="label">排行榜 ID：${account.id}</p>
          <section class="actions">
            <button class="btn secondary" data-action="logoutAccount">退出账号</button>
          </section>
        ` : `
          <p class="label">登录后排行榜会绑定到同一个账号。清空浏览器数据后，重新登录同一账号即可继续使用原排行榜身份。</p>
          <div class="account-form">
            <input data-auth-account autocomplete="username" maxlength="24" placeholder="账号：英文/数字/_/-" />
            <input data-auth-nickname maxlength="24" placeholder="昵称：排行榜显示名" />
            <input data-auth-password autocomplete="current-password" maxlength="72" type="password" placeholder="密码：至少 4 位" />
          </div>
          <section class="actions account-actions">
            <button class="btn" data-action="registerAccount">注册并登录</button>
            <button class="btn secondary" data-action="loginAccount">登录</button>
          </section>
        `}
      </section>
      <section class="panel">
        <h2>设置</h2>
        <p>这是 Web/PWA 版本，可以在 iOS Safari 或 Android Chrome 里添加到主屏幕。食物仓库、赠送记录和兑换奖励先保存在本机浏览器。</p>
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
    ["warehouse", "仓库"],
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
      if (action === "registerAccount") authenticateAccount("register");
      if (action === "loginAccount") authenticateAccount("login");
      if (action === "logoutAccount") logoutAccount();
      if (action === "redeemCollection") redeemCollection();
      if (action === "confirmGift") confirmGift();
      if (action === "cancelGift") {
        state.giftFoodId = "";
        render();
      }
      if (action === "install") showToast("iOS: Safari 分享按钮 -> 添加到主屏幕；Android: 浏览器菜单 -> 安装应用");
    });
  });
  app.querySelectorAll("[data-gift]").forEach((node) => {
    node.addEventListener("click", () => openGift(node.dataset.gift));
  });
  app.querySelectorAll("[data-gift-qty]").forEach((node) => {
    node.addEventListener("click", () => {
      state.giftQuantity = Math.max(1, Math.min(5, state.giftQuantity + Number(node.dataset.giftQty)));
      render();
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

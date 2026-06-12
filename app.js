const STORAGE = {
  player: "f1_pixel_pwa_player",
  feed: "f1_pixel_pwa_feed",
  inventory: "f1_pixel_pwa_food_inventory",
  gifts: "f1_pixel_pwa_food_gifts",
  friends: "f1_pixel_pwa_friends",
  meta: "f1_pixel_pwa_meta",
  achievements: "f1_pixel_pwa_achievements",
  deviceId: "f1_pixel_pwa_device_id",
  account: "f1_pixel_pwa_account",
  localAccounts: "f1_pixel_pwa_local_accounts",
};

const DAILY_LIMIT = 5;
const DAILY_STOCK = 5;
const FEED_VALUE = 20;
const GROWTH_PER_FEED = 12;
const FAVORITE_FEED_BONUS = 8;
const FAVORITE_GROWTH_BONUS = 4;
const BASIC_FEED_LUCKY_CHANCE = 0.08;
const FOOD_FEED_LUCKY_CHANCE = 0.12;
const EXCLUSIVE_FEED_LUCKY_CHANCE = 0.24;
const FOOD_WHEEL_CHANCE = 0.07;
const EXCLUSIVE_WHEEL_CHANCE = 0.12;
const BASIC_WHEEL_CHANCE = 0.05;
const DAILY_STOCK_FOOD_ID = "daily-stock";
const DAILY_STOCK_EMOJI = "⛽";
const MAX_FOOD_STACK = 99;
const WEEKLY_GIFT_LIMIT = 2;
const LEADERBOARD_LIMIT = 50;
const LUCKY_WHEEL_LIMIT = 3;
const DOUBLE_CARD_LIMIT = 10;
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

const foodCatalog = [
  {
    id: "verstappen",
    driverId: "verstappen",
    name: "红牛饮料",
    emoji: "🥤",
    englishName: "Red Bull Energy Drink",
    rarity: "rare",
    nutrition: ["牛磺酸", "咖啡因", "B 族维生素"],
    museumStory: "高速、激进和持续能量的象征。喂给专属车手时，更容易触发幸运加倍。",
  },
  {
    id: "leclerc",
    driverId: "leclerc",
    name: "香蕉",
    emoji: "🍌",
    englishName: "Banana",
    rarity: "normal",
    nutrition: ["钾", "维生素 B6", "碳水化合物"],
    museumStory: "轻便、稳定、适合快速补能，是围场里最可靠的基础能量来源之一。",
  },
  {
    id: "hamilton",
    driverId: "hamilton",
    name: "素食沙拉",
    emoji: "🥗",
    englishName: "Fresh Salad",
    rarity: "normal",
    nutrition: ["纤维", "维生素", "矿物质"],
    museumStory: "清爽自律的补给，代表车手对长期状态和身体管理的重视。",
  },
  {
    id: "norris",
    driverId: "norris",
    name: "炸鸡",
    emoji: "🍗",
    englishName: "Fried Chicken",
    rarity: "normal",
    nutrition: ["蛋白质", "能量", "B 族维生素"],
    museumStory: "不完美但快乐，像迈凯伦橙色车库里轻松又锋利的比赛节奏。",
  },
  {
    id: "piastri",
    driverId: "piastri",
    name: "澳洲牛肉派",
    emoji: "🥧",
    englishName: "Australian Meat Pie",
    rarity: "normal",
    nutrition: ["蛋白质", "铁", "碳水化合物"],
    museumStory: "家乡味道和稳定补能的结合，适合冷静执行每一圈计划。",
  },
  {
    id: "russell",
    driverId: "russell",
    name: "蛋白棒",
    emoji: "💪",
    englishName: "Protein Bar",
    rarity: "normal",
    nutrition: ["高蛋白", "必需氨基酸", "低糖"],
    museumStory: "轻便、精准、可控，像每一次入弯都讲究效率的工程化补给。",
  },
  {
    id: "antonelli",
    driverId: "antonelli",
    name: "意式能量披萨",
    emoji: "🍕",
    englishName: "Italian Energy Pizza",
    rarity: "normal",
    nutrition: ["碳水化合物", "蛋白质", "番茄红素"],
    museumStory: "碳水补给和意大利热情，让年轻车手的每一圈都更有冲劲。",
  },
  {
    id: "alonso",
    driverId: "alonso",
    name: "西班牙玉米饼",
    emoji: "🫓",
    englishName: "Spanish Tortilla",
    rarity: "normal",
    nutrition: ["蛋白质", "碳水化合物", "脂肪"],
    museumStory: "朴素但耐久，像老将的职业生涯一样，总能在混乱里找到计划。",
  },
  {
    id: "espresso_gel",
    driverId: "",
    name: "能量咖啡胶",
    emoji: "☕",
    englishName: "Espresso Energy Gel",
    rarity: "rare",
    nutrition: ["咖啡因", "电解质", "快速糖"],
    museumStory: "通用冲刺补给，任何车手都能吃，但不会触发专属加成。",
  },
  {
    id: "hydration_pack",
    driverId: "",
    name: "电解质补给",
    emoji: "🧃",
    englishName: "Hydration Pack",
    rarity: "normal",
    nutrition: ["钠", "钾", "水分"],
    museumStory: "通用耐力补给，适合长回合养成和稳定推进。",
  },
].map((food) => {
  const driver = food.driverId ? drivers.find((item) => item.id === food.driverId) : null;
  return {
    ...food,
    driverName: driver ? driver.name : "通用补给",
    team: driver ? driver.team : "Paddock",
    color: driver ? driver.color : "#39ff14",
  };
});

const wheelRewards = [
  { id: "growth_1", label: "成长 x1", type: "growth", value: 1, weight: 20 },
  { id: "growth_2a", label: "成长 x2", type: "growth", value: 2, weight: 15 },
  { id: "growth_3", label: "成长 x3", type: "growth", value: 3, weight: 10 },
  { id: "food_1", label: "食物 x1", type: "food", value: 1, weight: 20 },
  { id: "double_1", label: "加倍卡 x1", type: "double_card", value: 1, weight: 10 },
  { id: "food_2", label: "食物 x2", type: "food", value: 2, weight: 10 },
  { id: "growth_2b", label: "成长 x2", type: "growth", value: 2, weight: 10 },
  { id: "double_2", label: "加倍卡 x2", type: "double_card", value: 2, weight: 5 },
];

const achievementDefs = [
  { id: "ach_feed_20", category: "养成", name: "初心者", desc: "累计喂食 20 次", target: 20, reward: 3, metric: "totalFeeds" },
  { id: "ach_feed_50", category: "养成", name: "养护专家", desc: "累计喂食 50 次", target: 50, reward: 8, metric: "totalFeeds" },
  { id: "ach_feed_100", category: "养成", name: "贴心管家", desc: "累计喂食 100 次", target: 100, reward: 15, metric: "totalFeeds" },
  { id: "ach_lucky_3", category: "挑战", name: "幸运车手", desc: "触发幸运时刻 3 次", target: 3, reward: 8, metric: "luckyTriggers" },
  { id: "ach_food_complete", category: "挑战", name: "美食鉴赏家", desc: "集齐 10 种食物", target: foodCatalog.length, reward: 20, metric: "foodCollected" },
  { id: "ach_7day_streak", category: "挑战", name: "每日坚持者", desc: "连续 7 天喂食", target: 7, reward: 10, metric: "feedStreak" },
  { id: "ach_all_milestones", category: "养成", name: "世界冠军之路", desc: "当前车手达到世界冠军", target: 6, reward: 50, metric: "currentLevel" },
];

const milestoneRewards = [
  { level: 1, treasures: 0 },
  { level: 2, treasures: 3 },
  { level: 3, treasures: 5 },
  { level: 4, treasures: 10, foods: 5 },
  { level: 5, treasures: 20 },
  { level: 6, treasures: 50 },
];

function currentTrainingCamp() {
  const week = Number(getWeekId().slice(-2));
  const index = (week - 1) % drivers.length;
  const driver = drivers[index];
  const exclusiveFood = foodCatalog.find((food) => food.driverId === driver.id) || foodCatalog[0];
  return {
    weekId: getWeekId(),
    driver,
    tasks: [
      { id: "camp_feed", name: "主题周冲刺", desc: `本周喂食 ${driver.name} 20 次`, target: 20, reward: "珍珠 x5" },
      { id: "camp_food", name: "专属补给", desc: `使用 ${exclusiveFood.name} 喂食 10 次`, target: 10, reward: "食物 x3 + 珍珠 x3" },
      { id: "camp_growth", name: "稳定推进", desc: "本周喂食量达到 180", target: 180, reward: "加倍卡 x1" },
    ],
  };
}

const state = {
  view: "home",
  selectedDriverId: "verstappen",
  giftFoodId: "",
  giftQuantity: 1,
  giftFriendId: "",
  giftRequestId: "",
  museumFoodId: "",
  selectedFeedFoodId: "",
  doubleCardArmed: false,
  wheel: null,
  playerId: "",
  mood: "idle",
  line: "",
  toast: "",
  backend: "checking",
  syncPending: false,
  lastSyncAt: 0,
  leaderboard: [],
  leaderboardUpdatedAt: 0,
  friendSearchQuery: "",
  friendSearchResults: [],
  socialLoading: false,
  authLoading: false,
  authDraft: {
    accountName: "",
    nickName: "",
    password: "",
  },
  isFeeding: false,
  feedPickerOpen: false,
  floatingFood: false,
  floatingFoodEmoji: "",
  feedDelta: 0,
  luckyFlash: false,
  expressionFrame: 0,
  lastQuoteByDriver: {},
  installPromptReady: false,
};

const app = document.querySelector("#app");
let deferredInstallPrompt = null;

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

function scopedKey(key) {
  const account = readJson(STORAGE.account);
  if (!account || key === STORAGE.account || key === STORAGE.deviceId) return key;
  return `${key}_${account.id}`;
}

function readScopedJson(key) {
  return readJson(scopedKey(key));
}

function writeScopedJson(key, value) {
  writeJson(scopedKey(key), value);
}

function removeScopedItem(key) {
  localStorage.removeItem(scopedKey(key));
}

function migrateGuestProgressToAccount(account) {
  if (!account) return;
  [STORAGE.player, STORAGE.feed, STORAGE.inventory, STORAGE.gifts, STORAGE.friends, STORAGE.meta, STORAGE.achievements].forEach((key) => {
    const accountKey = `${key}_${account.id}`;
    if (!localStorage.getItem(accountKey)) {
      const guestValue = localStorage.getItem(key);
      if (guestValue) localStorage.setItem(accountKey, guestValue);
    }
  });
}

function localAccountId(accountName) {
  return `local_${accountName.replace(/[^a-z0-9_-]/g, "_")}`;
}

function getLocalAccounts() {
  const accounts = readJson(STORAGE.localAccounts);
  return accounts && typeof accounts === "object" && !Array.isArray(accounts) ? accounts : {};
}

function saveLocalAccounts(accounts) {
  writeJson(STORAGE.localAccounts, accounts);
}

function authenticateLocalAccount(mode, accountName, password, nickName) {
  const normalizedName = String(accountName || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{3,24}$/.test(normalizedName) || String(password || "").length < 4) {
    showToast("账号需 3-24 位英文/数字/_/-，密码至少 4 位");
    return false;
  }

  const accounts = getLocalAccounts();
  const existing = accounts[normalizedName];
  if (mode === "register" && existing) {
    showToast("账号已存在，请直接登录");
    return false;
  }
  if (mode === "login" && (!existing || existing.password !== password)) {
    showToast("账号或密码不正确");
    return false;
  }

  const account = existing || {
    id: localAccountId(normalizedName),
    accountName: normalizedName,
    nickName: nickName || normalizedName,
    password,
    authToken: `local_${Date.now()}`,
  };
  account.nickName = nickName || account.nickName || normalizedName;
  account.authToken = account.authToken || `local_${Date.now()}`;
  accounts[normalizedName] = account;
  saveLocalAccounts(accounts);
  saveAccount({
    id: account.id,
    accountName: account.accountName,
    nickName: account.nickName,
    authToken: account.authToken,
    localOnly: true,
  });
  showToast(mode === "register" ? "本地账号已注册并登录" : "本地账号已登录");
  render();
  return true;
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
  const player = readScopedJson(STORAGE.player);
  if (!player) return null;
  return {
    ...player,
    treasures: player.treasures || 0,
    achievements: Array.isArray(player.achievements) ? player.achievements : [],
  };
}

function savePlayer(player) {
  writeScopedJson(STORAGE.player, {
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
  migrateGuestProgressToAccount(account);
}

function getFeedState() {
  const today = todayKey();
  const weekId = getWeekId();
  const old = readScopedJson(STORAGE.feed) || {};
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
  writeScopedJson(STORAGE.feed, feed);
}

function emptyInventory() {
  return foodCatalog.reduce((items, food) => {
    items[food.id] = 0;
    return items;
  }, {});
}

function getInventoryState() {
  const old = readScopedJson(STORAGE.inventory) || {};
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
  writeScopedJson(STORAGE.inventory, inventory);
}

function getMetaState() {
  const weekId = getWeekId();
  const old = readScopedJson(STORAGE.meta) || {};
  const weekly = old.weekId === weekId ? old.weekly || {} : {};
  return {
    weekId,
    totalFeeds: old.totalFeeds || 0,
    luckyTriggers: old.luckyTriggers || 0,
    feedStreak: old.feedStreak || 0,
    lastFeedDate: old.lastFeedDate || "",
    doubleCards: Math.min(DOUBLE_CARD_LIMIT, old.doubleCards || 0),
    weekly: {
      luckyWheelUsed: weekly.luckyWheelUsed || 0,
      campFeeds: weekly.campFeeds || 0,
      campFoodFeeds: weekly.campFoodFeeds || 0,
      campFeedValue: weekly.campFeedValue || 0,
      bonusGrowth: weekly.bonusGrowth || 0,
    },
    milestones: old.milestones || {},
    titles: Array.isArray(old.titles) ? old.titles : [],
    updatedAt: old.updatedAt || Date.now(),
  };
}

function saveMetaState(meta) {
  writeScopedJson(STORAGE.meta, { ...meta, updatedAt: Date.now() });
}

function getAchievementsState() {
  const old = readScopedJson(STORAGE.achievements) || {};
  return {
    unlocked: old.unlocked && typeof old.unlocked === "object" ? old.unlocked : {},
    claimedTreasures: old.claimedTreasures || 0,
  };
}

function saveAchievementsState(achievements) {
  writeScopedJson(STORAGE.achievements, achievements);
}

function getFriendsState() {
  const old = readScopedJson(STORAGE.friends) || {};
  return {
    friends: Array.isArray(old.friends) ? old.friends.map(normalizeFriend).filter(Boolean) : [],
  };
}

function normalizeFriend(friend) {
  if (!friend || typeof friend !== "object") return null;
  const id = String(friend.id || "").trim();
  if (!id) return null;
  const accountName = String(friend.accountName || "").trim();
  const nickName = String(friend.nickName || friend.name || accountName || id).trim();
  return {
    id,
    accountName,
    nickName,
    name: nickName,
    addedAt: Number(friend.addedAt) || Date.now(),
  };
}

function saveFriendsState(friendsState) {
  const friends = Array.isArray(friendsState?.friends) ? friendsState.friends.map(normalizeFriend).filter(Boolean) : [];
  writeScopedJson(STORAGE.friends, { friends });
}

function getGiftState() {
  const weekId = getWeekId();
  const old = readScopedJson(STORAGE.gifts) || {};
  return {
    weekId,
    sentThisWeek: old.weekId === weekId ? old.sentThisWeek || 0 : 0,
    records: Array.isArray(old.records) ? old.records.slice(0, 12) : [],
  };
}

function saveGiftState(gifts) {
  writeScopedJson(STORAGE.gifts, gifts);
}

function findFood(foodId) {
  return foodCatalog.find((food) => food.id === foodId) || foodCatalog[0];
}

function foodQuantity(inventory, foodId) {
  return inventory.items[foodId] || 0;
}

function hasFood(inventory, foodId) {
  return foodQuantity(inventory, foodId) > 0;
}

function exclusiveFoodForDriver(driverId) {
  return foodCatalog.find((food) => food.driverId === driverId) || foodCatalog[0];
}

function ownedFoodCount(inventory = getInventoryState()) {
  return foodCatalog.reduce((sum, food) => sum + foodQuantity(inventory, food.id), 0);
}

function selectedFeedFood(inventory = getInventoryState(), driverId = getPlayer()?.driverId) {
  if (state.selectedFeedFoodId === DAILY_STOCK_FOOD_ID) return null;
  const selected = foodCatalog.find((food) => food.id === state.selectedFeedFoodId);
  if (selected && hasFood(inventory, selected.id)) return selected;
  const exclusive = exclusiveFoodForDriver(driverId);
  if (hasFood(inventory, exclusive.id)) return exclusive;
  return foodCatalog.find((food) => hasFood(inventory, food.id)) || null;
}

function isExclusiveFood(food, driverId) {
  return Boolean(food && food.driverId && food.driverId === driverId);
}

function resolveFeedChoice(inventory, feed, driverId) {
  const food = selectedFeedFood(inventory, driverId);
  if (food) {
    return {
      food,
      hasInventoryFood: true,
      isExclusive: isExclusiveFood(food, driverId),
      foodId: food.id,
      emoji: food.emoji,
    };
  }
  if (feed.stock > 0) {
    return {
      food: null,
      hasInventoryFood: false,
      isExclusive: false,
      foodId: DAILY_STOCK_FOOD_ID,
      emoji: DAILY_STOCK_EMOJI,
    };
  }
  return null;
}

function consumeFeedChoice(choice, inventory, feed) {
  if (choice.hasInventoryFood) {
    inventory.items[choice.food.id] -= 1;
    saveInventoryState(inventory);
    return;
  }
  feed.stock -= 1;
}

function feedLuckyChance(choice) {
  if (choice.isExclusive) return EXCLUSIVE_FEED_LUCKY_CHANCE;
  return choice.hasInventoryFood ? FOOD_FEED_LUCKY_CHANCE : BASIC_FEED_LUCKY_CHANCE;
}

function feedWheelChance(choice) {
  if (choice.isExclusive) return EXCLUSIVE_WHEEL_CHANCE;
  return choice.hasInventoryFood ? FOOD_WHEEL_CHANCE : BASIC_WHEEL_CHANCE;
}

function feedBaseStats(choice) {
  return {
    value: FEED_VALUE + (choice.isExclusive ? FAVORITE_FEED_BONUS : 0),
    growth: GROWTH_PER_FEED + (choice.isExclusive ? FAVORITE_GROWTH_BONUS : 0),
  };
}

function feedStatusLine({ choice, useDoubleCard, inCamp, campBonus, lucky }) {
  if (useDoubleCard) return "加倍卡启动，本次成长翻倍。";
  if (choice.isExclusive) return `专属食物 ${choice.food.emoji} 命中节奏，加倍概率提升。`;
  if (choice.hasInventoryFood) return `${choice.food.emoji} ${choice.food.name} 已投喂，非专属也能补能。`;
  if (inCamp) return `训练营加成生效：+${campBonus} 成长。`;
  if (lucky) return "完美补给！这口直接双倍加速。";
  return randomLine(["能量补满，下一圈继续推。", "这口燃料味道很快。", "维修区节奏不错。"]);
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
  inventory.items[reward.id] = Math.min(MAX_FOOD_STACK, foodQuantity(inventory, reward.id) + 1);
  inventory.lastDailyReward = today;
  saveInventoryState(inventory);
  showToast(`每日登录奖励：${reward.emoji} ${reward.name} +1`);
}

function collectionCount(inventory = getInventoryState()) {
  return foodCatalog.filter((food) => hasFood(inventory, food.id)).length;
}

function canRedeemCollection(inventory = getInventoryState()) {
  return foodCatalog.every((food) => hasFood(inventory, food.id));
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
    treasures: player.treasures || 0,
    achievements: Array.isArray(player.achievements) ? player.achievements : [],
    inventory: getInventoryState(),
    feed,
    friends: getFriendsState(),
    meta: getMetaState(),
    achievementsState: getAchievementsState(),
    updatedAt: Date.now(),
  };
}

async function callGameApi(payload, options = {}) {
  const response = await fetch(gameApiUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: options.signal,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Game API ${response.status}`);
  return data;
}

function createClientRequestId(prefix = "req") {
  const random = crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "")
    : `${Date.now()}${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${random}`.slice(0, 72);
}

function isCloudAccount(account = getAccount()) {
  return Boolean(account && !account.localOnly);
}

function applyRemoteGameState(gameState) {
  if (!gameState) return;
  if (gameState.player) writeScopedJson(STORAGE.player, gameState.player);
  if (gameState.feed) writeScopedJson(STORAGE.feed, gameState.feed);
  if (gameState.inventory) writeScopedJson(STORAGE.inventory, gameState.inventory);
  if (gameState.gifts) writeScopedJson(STORAGE.gifts, gameState.gifts);
  if (gameState.friends) saveFriendsState(gameState.friends);
  if (gameState.meta) writeScopedJson(STORAGE.meta, gameState.meta);
  if (gameState.achievementsState) writeScopedJson(STORAGE.achievements, gameState.achievementsState);
}

function cloudStorageOnline(storage) {
  return storage === "blob" || storage === "d1";
}

function socialErrorMessage(error) {
  return {
    unauthorized_player: "账号登录已过期，请重新登录后再试",
    invalid_friend: "好友信息无效",
    friend_not_found: "没有找到这个账号",
    not_friends: "对方还不是你的好友",
    invalid_gift: "赠送信息无效",
    insufficient_inventory: "云端库存不足，本次没有扣库存",
    weekly_gift_limit: "本周赠送次数已用完",
    storage_unavailable: "云端社交暂时不可用",
  }[error] || "云端社交暂时不可用，请稍后再试";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]));
}

function gameApiUrl() {
  const override = document.querySelector('meta[name="game-api-url"]')?.content?.trim();
  if (override) return override;
  if (location.hostname.endsWith("netlify.app")) return "/.netlify/functions/game";
  return "/api/game";
}

async function promptInstallApp() {
  if (deferredInstallPrompt) {
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    state.installPromptReady = false;
    try {
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      showToast(choice?.outcome === "accepted" ? "安装已开始" : "已关闭安装提示");
    } catch {
      showToast("当前浏览器暂时不能直接安装，请使用浏览器菜单添加到主屏幕");
    }
    render();
    return;
  }
  showToast("iOS: Safari 分享按钮 -> 添加到主屏幕；Android: 浏览器菜单 -> 安装应用");
}

async function syncRemote(reason = "sync") {
  const snapshot = publicPlayerSnapshot();
  if (!snapshot) return;
  const account = getAccount();
  try {
    const data = await callGameApi({ action: "syncPlayer", reason, player: snapshot, accountToken: account?.authToken });
    state.backend = cloudStorageOnline(data.storage) ? "online" : "offline";
    if (cloudStorageOnline(data.storage)) {
      state.syncPending = false;
      state.lastSyncAt = Date.now();
    }
  } catch {
    state.backend = "offline";
    if (isCloudAccount(account)) state.syncPending = true;
  }
}

async function refreshLeaderboard({ silent = true } = {}) {
  try {
    const data = await callGameApi({ action: "leaderboard", weekId: getWeekId() });
    state.backend = cloudStorageOnline(data.storage) ? "online" : "offline";
    state.leaderboard = Array.isArray(data.rankings) ? data.rankings : [];
    state.leaderboardUpdatedAt = Date.now();
    render();
  } catch {
    state.backend = "offline";
    if (!silent) showToast("云端排行榜暂时不可用，已保留本地进度");
    render();
  }
}

async function loadCloudFriends({ silent = true } = {}) {
  const account = getAccount();
  if (!isCloudAccount(account)) return;
  try {
    const data = await callGameApi({
      action: "listFriends",
      playerId: account.id,
      accountToken: account.authToken,
    });
    state.backend = cloudStorageOnline(data.storage) ? "online" : "offline";
    saveFriendsState({ friends: Array.isArray(data.friends) ? data.friends : [] });
    if (!silent) showToast("好友列表已同步");
  } catch (error) {
    state.backend = "offline";
    if (!silent) showToast(socialErrorMessage(error.message));
  } finally {
    render();
  }
}

async function searchCloudFriends() {
  const account = getAccount();
  if (!isCloudAccount(account)) return showToast("请先使用云端账号登录，GitHub Pages 静态站点不支持云端好友");
  const query = app.querySelector("[data-friend-search]")?.value.trim() || "";
  state.friendSearchQuery = query;
  state.socialLoading = true;
  render();
  try {
    const data = await callGameApi({
      action: "searchAccounts",
      playerId: account.id,
      accountToken: account.authToken,
      query,
    });
    state.backend = cloudStorageOnline(data.storage) ? "online" : "offline";
    state.friendSearchResults = Array.isArray(data.results) ? data.results : [];
    if (!state.friendSearchResults.length) showToast("没有找到可添加的账号");
  } catch (error) {
    state.backend = "offline";
    showToast(socialErrorMessage(error.message));
  } finally {
    state.socialLoading = false;
    render();
  }
}

async function addCloudFriend(friendId) {
  const account = getAccount();
  if (!isCloudAccount(account)) return showToast("本地账号不能添加云端好友");
  state.socialLoading = true;
  render();
  try {
    const data = await callGameApi({
      action: "addFriend",
      playerId: account.id,
      accountToken: account.authToken,
      friendId,
    });
    saveFriendsState({ friends: Array.isArray(data.friends) ? data.friends : [] });
    state.friendSearchResults = state.friendSearchResults.filter((friend) => friend.id !== friendId);
    state.backend = cloudStorageOnline(data.storage) ? "online" : "offline";
    showToast("好友已添加");
    saveRemoteGameState();
  } catch (error) {
    state.backend = "offline";
    showToast(socialErrorMessage(error.message));
  } finally {
    state.socialLoading = false;
    render();
  }
}

async function removeCloudFriend(friendId) {
  const account = getAccount();
  if (!isCloudAccount(account)) return showToast("本地账号没有云端好友列表");
  state.socialLoading = true;
  render();
  try {
    const data = await callGameApi({
      action: "removeFriend",
      playerId: account.id,
      accountToken: account.authToken,
      friendId,
    });
    saveFriendsState({ friends: Array.isArray(data.friends) ? data.friends : [] });
    if (state.giftFriendId === friendId) state.giftFriendId = "";
    state.backend = cloudStorageOnline(data.storage) ? "online" : "offline";
    showToast("好友已删除");
    saveRemoteGameState();
  } catch (error) {
    state.backend = "offline";
    showToast(socialErrorMessage(error.message));
  } finally {
    state.socialLoading = false;
    render();
  }
}

function readAuthDraft() {
  const accountName = (app.querySelector("[data-auth-account]")?.value ?? state.authDraft.accountName).trim();
  const password = app.querySelector("[data-auth-password]")?.value ?? state.authDraft.password;
  const nickName = (app.querySelector("[data-auth-nickname]")?.value ?? state.authDraft.nickName).trim() || accountName;
  state.authDraft = { accountName, nickName, password };
  return state.authDraft;
}

async function authenticateAccount(mode) {
  if (state.authLoading) return showToast("云端账号处理中，请稍等");
  const { accountName, password, nickName } = readAuthDraft();
  if (!accountName || !password) return showToast("请输入账号和密码");

  state.authLoading = true;
  try {
    const data = await callGameApi({
      action: mode === "register" ? "registerAccount" : "loginAccount",
      accountName,
      password,
      nickName,
    });
    saveAccount(data.account);
    await loadRemoteGameState();
    await loadCloudFriends({ silent: true });
    const player = getPlayer();
    if (player) savePlayer({ ...player, nickName: data.account.nickName });
    await saveRemoteGameState();
    state.backend = cloudStorageOnline(data.storage) ? "online" : "offline";
    state.authDraft.password = "";
    showToast(mode === "register" ? "账号已注册并登录" : "账号已登录");
    syncRemote("auth").finally(() => refreshLeaderboard({ silent: true }));
  } catch (error) {
    const message = {
      account_exists: "账号已存在，请直接登录",
      invalid_login: "账号或密码不正确",
      invalid_credentials: "账号需 3-24 位英文/数字/_/-，密码至少 4 位",
      storage_unavailable: "云端账号暂时不可用",
    }[error.message] || "云端账号暂时不可用，请使用本地账号按钮或等待后端恢复";
    showToast(message);
  } finally {
    state.authLoading = false;
    render();
  }
}

function authenticateLocalAccountFromForm(mode) {
  if (state.authLoading) return showToast("云端账号处理中，请稍等");
  const { accountName, password, nickName } = readAuthDraft();
  if (!accountName || !password) return showToast("请输入账号和密码");
  if (authenticateLocalAccount(mode, accountName, password, nickName)) state.authDraft.password = "";
}

function logoutAccount() {
  localStorage.removeItem(STORAGE.account);
  state.playerId = "";
  showToast("已退出账号，账号存档已保留");
  render();
}

function bootstrapBackend() {
  const account = getAccount();
  if (account) state.playerId = account.id;
  loadRemoteGameState()
    .finally(() => loadCloudFriends({ silent: true }))
    .finally(() => syncRemote("boot").finally(() => refreshLeaderboard({ silent: true })));
}

function bindDriver(driverId) {
  const old = getPlayer();
  const account = getAccount();
  const driver = getDriver(driverId);
  const player = {
    id: "me",
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
  if (!old || old.driverId !== driver.id) removeScopedItem(STORAGE.feed);
  state.view = "home";
  showToast(`已绑定 ${driver.name}`);
  claimDailyFoodReward();
  render();
  syncRemote("bind").finally(() => refreshLeaderboard({ silent: true }));
}

function resetAll() {
  removeScopedItem(STORAGE.player);
  removeScopedItem(STORAGE.feed);
  removeScopedItem(STORAGE.inventory);
  removeScopedItem(STORAGE.gifts);
  removeScopedItem(STORAGE.meta);
  removeScopedItem(STORAGE.achievements);
  state.view = "select";
  state.line = "";
  showToast("本地数据已清空");
  render();
  const account = getAccount();
  callGameApi({ action: "resetPlayer", playerId: ensurePlayerId(), weekId: getWeekId(), accountToken: account?.authToken })
    .finally(() => refreshLeaderboard({ silent: true }));
}

async function loadRemoteGameState() {
  const account = getAccount();
  if (!account) return;
  try {
    const data = await callGameApi({ action: "loadGameState", playerId: account.id, accountToken: account.authToken });
    if (!data.gameState) return;
    applyRemoteGameState(data.gameState);
    state.syncPending = false;
    state.lastSyncAt = Date.now();
  } catch {
    if (isCloudAccount(account)) state.syncPending = true;
    // Local account-scoped progress remains authoritative if cloud state is unavailable.
  }
}

async function saveRemoteGameState() {
  const account = getAccount();
  const player = getPlayer();
  if (!account || !player) return;
  try {
    const data = await callGameApi({
      action: "saveGameState",
      playerId: account.id,
      accountToken: account.authToken,
      gameState: {
        player,
        feed: getFeedState(),
        inventory: getInventoryState(),
        gifts: getGiftState(),
        friends: getFriendsState(),
        meta: getMetaState(),
        achievementsState: getAchievementsState(),
        updatedAt: Date.now(),
      },
    });
    state.backend = cloudStorageOnline(data.storage) ? "online" : state.backend;
    if (cloudStorageOnline(data.storage)) {
      state.syncPending = false;
      state.lastSyncAt = Date.now();
    }
  } catch {
    if (isCloudAccount(account)) {
      state.backend = "offline";
      state.syncPending = true;
    }
    // Gameplay must never block on cloud storage.
  }
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

function getLevelIndex(growth) {
  return levels.findIndex((level) => level.name === getLevel(growth).name) + 1;
}

function addTreasures(amount) {
  const player = getPlayer();
  if (!player || amount <= 0) return;
  savePlayer({ ...player, treasures: (player.treasures || 0) + amount });
}

function awardRandomFood(quantity = 1) {
  Array.from({ length: quantity }).forEach(() => {
    const food = foodCatalog[Math.floor(Math.random() * foodCatalog.length)];
    addFood(food.id, 1);
  });
}

function updateFeedStreak(meta) {
  const today = todayKey();
  const last = meta.lastFeedDate;
  if (last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    meta.feedStreak = last === yesterdayKey ? (meta.feedStreak || 0) + 1 : 1;
    meta.lastFeedDate = today;
  }
}

function checkMilestones(beforeGrowth, afterGrowth, driverId) {
  const meta = getMetaState();
  const player = getPlayer();
  if (!player) return;
  const beforeLevel = getLevelIndex(beforeGrowth);
  const afterLevel = getLevelIndex(afterGrowth);
  if (afterLevel <= beforeLevel && meta.milestones[driverId]) return;
  const driverMilestones = meta.milestones[driverId] || [];
  for (let level = 1; level <= afterLevel; level += 1) {
    if (driverMilestones.some((item) => item.level === level)) continue;
    const reward = milestoneRewards[level - 1] || {};
    driverMilestones.push({
      level,
      levelName: levels[level - 1]?.name || "里程碑",
      reachedAt: todayKey(),
      growthValue: afterGrowth,
      treasureReward: reward.treasures || 0,
    });
    if (reward.treasures) addTreasures(reward.treasures);
    if (reward.foods) awardRandomFood(reward.foods);
  }
  meta.milestones[driverId] = driverMilestones;
  saveMetaState(meta);
}

function achievementProgress(def) {
  const meta = getMetaState();
  const player = getPlayer();
  const inventory = getInventoryState();
  if (def.metric === "totalFeeds") return meta.totalFeeds || 0;
  if (def.metric === "luckyTriggers") return meta.luckyTriggers || 0;
  if (def.metric === "foodCollected") return collectionCount(inventory);
  if (def.metric === "feedStreak") return meta.feedStreak || 0;
  if (def.metric === "currentLevel") return player ? getLevelIndex(player.growth || 0) : 0;
  return 0;
}

function checkAchievements() {
  const stateAchs = getAchievementsState();
  let changed = false;
  achievementDefs.forEach((def) => {
    const progress = achievementProgress(def);
    if (progress >= def.target && !stateAchs.unlocked[def.id]) {
      stateAchs.unlocked[def.id] = { unlockedAt: Date.now(), progress };
      stateAchs.claimedTreasures += def.reward;
      addTreasures(def.reward);
      changed = true;
      showToast(`成就解锁：${def.name} +${def.reward} 珍珠`);
    }
  });
  if (changed) saveAchievementsState(stateAchs);
}

function shouldTriggerWheel(meta, chance = 0.05) {
  return meta.weekly.luckyWheelUsed < LUCKY_WHEEL_LIMIT && Math.random() < chance;
}

function pickWheelReward() {
  const total = wheelRewards.reduce((sum, reward) => sum + reward.weight, 0);
  let roll = Math.random() * total;
  return wheelRewards.find((reward) => {
    roll -= reward.weight;
    return roll <= 0;
  }) || wheelRewards[0];
}

function settleWheelReward(reward, baseGrowth) {
  const player = getPlayer();
  const meta = getMetaState();
  if (!player) return;
  if (reward.type === "growth") {
    const gain = baseGrowth * reward.value;
    const beforeGrowth = player.growth || 0;
    const afterGrowth = beforeGrowth + gain;
    savePlayer({ ...player, growth: afterGrowth });
    checkMilestones(beforeGrowth, afterGrowth, player.driverId);
    state.wheel.resultText = `获得 +${gain} 成长值`;
  } else if (reward.type === "food") {
    awardRandomFood(reward.value);
    state.wheel.resultText = `获得随机食物 x${reward.value}`;
  } else if (reward.type === "double_card") {
    meta.doubleCards = Math.min(DOUBLE_CARD_LIMIT, (meta.doubleCards || 0) + reward.value);
    saveMetaState(meta);
    state.wheel.resultText = `获得加倍卡 x${reward.value}`;
  }
  meta.luckyTriggers += 1;
  saveMetaState(meta);
  checkAchievements();
  saveRemoteGameState();
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
  const choice = resolveFeedChoice(inventory, feed, player.driverId);
  if (!choice) return showToast("今天的补给和仓库食物都不足");
  const meta = getMetaState();
  const camp = currentTrainingCamp();
  const inCamp = player.driverId === camp.driver.id;
  const useDoubleCard = state.doubleCardArmed && meta.doubleCards > 0;
  consumeFeedChoice(choice, inventory, feed);

  const lucky = Math.random() < feedLuckyChance(choice);
  const baseStats = feedBaseStats(choice);
  const baseValue = baseStats.value;
  let baseGrowth = baseStats.growth;
  const campBonus = inCamp ? Math.ceil(baseGrowth * 0.2) : 0;
  baseGrowth += campBonus;
  const value = lucky ? baseValue * 2 : baseValue;
  let growthValue = lucky ? baseGrowth * 2 : baseGrowth;
  if (useDoubleCard) {
    growthValue *= 2;
    meta.doubleCards -= 1;
    state.doubleCardArmed = false;
  }
  feed.usedFeeds += 1;
  feed.weeklyFeed += value;
  feed.logs.unshift({
    id: `${Date.now()}`,
    time: Date.now(),
    value,
    growthValue,
    lucky,
    campBonus,
    doubleCard: useDoubleCard,
    foodId: choice.foodId,
    exclusive: choice.isExclusive,
  });
  saveFeedState(feed);
  const beforeGrowth = player.growth || 0;
  const afterGrowth = beforeGrowth + growthValue;
  savePlayer({ ...player, growth: afterGrowth });
  meta.totalFeeds += 1;
  meta.weekly.campFeedValue += value;
  updateFeedStreak(meta);
  if (inCamp) {
    meta.weekly.campFeeds += 1;
    if (choice.isExclusive) meta.weekly.campFoodFeeds += 1;
    meta.weekly.bonusGrowth += campBonus;
  }
  const triggerWheel = shouldTriggerWheel(meta, feedWheelChance(choice));
  if (triggerWheel) meta.weekly.luckyWheelUsed += 1;
  saveMetaState(meta);
  checkMilestones(beforeGrowth, afterGrowth, player.driverId);
  checkAchievements();
  saveRemoteGameState();
  syncRemote(lucky ? "luckyFeed" : "feed").finally(() => refreshLeaderboard({ silent: true }));

  state.mood = "eat";
  state.line = feedStatusLine({ choice, useDoubleCard, inCamp, campBonus, lucky });
  state.isFeeding = true;
  state.feedPickerOpen = false;
  state.floatingFood = true;
  state.floatingFoodEmoji = choice.emoji;
  state.feedDelta = value;
  state.luckyFlash = lucky;
  render();

  window.setTimeout(() => {
    state.mood = lucky ? "celebrate" : "satisfied";
    state.floatingFood = false;
    state.floatingFoodEmoji = "";
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
    if (triggerWheel) {
      state.wheel = { reward: pickWheelReward(), clicks: 0, startedAt: Date.now(), settled: false, resultText: "" };
      render();
    }
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
    ${state.feedPickerOpen ? renderFeedPickerModal() : ""}
    ${state.wheel ? renderWheelModal() : ""}
    ${state.toast ? `<div class="toast">${state.toast}</div>` : ""}
  `;
  bindEvents();
}

function renderHeader() {
  const { feed } = currentModel();
  const account = getAccount();
  const backendLabel = account?.localOnly
    ? "本地账号"
    : state.syncPending
      ? "待同步"
      : state.backend === "online"
        ? "云端在线"
        : state.backend === "offline"
          ? "本地模式"
          : "同步中";
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
  if (state.view === "training") return renderTrainingCamp();
  if (state.view === "museum") return renderFoodMuseum();
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

function renderFeedPickerModal() {
  const { player, feed, driver } = currentModel();
  if (!player) return "";
  const inventory = getInventoryState();
  const selectedFood = selectedFeedFood(inventory, driver.id);
  const totalOwnedFoods = ownedFoodCount(inventory);
  const canUseBasicStock = state.selectedFeedFoodId === DAILY_STOCK_FOOD_ID || (!selectedFood && feed.stock > 0);
  const disabled = feed.usedFeeds >= DAILY_LIMIT || state.isFeeding || (feed.stock <= 0 && totalOwnedFoods <= 0);
  return `
    <div class="modal-backdrop feed-backdrop">
      <section class="feed-picker panel">
        <div class="feed-picker-head">
          <div>
            <h2>选择投喂食物</h2>
            <p class="label">任意车手都能吃任意食物；专属食物提高加倍和幸运转盘触发概率。</p>
          </div>
          <button class="mini-btn" data-action="closeFeedPicker">关闭</button>
        </div>
        <div class="feed-food-grid">
          <button class="feed-food basic-stock ${canUseBasicStock ? "active" : ""} ${feed.stock <= 0 ? "empty" : ""}" data-feed-basic="1" ${feed.stock <= 0 ? "disabled" : ""}>
            <span>${DAILY_STOCK_EMOJI}</span>
            <strong>基础补给</strong>
            <small>x${feed.stock}</small>
          </button>
          ${foodCatalog.map((food) => {
            const qty = foodQuantity(inventory, food.id);
            const active = selectedFood && selectedFood.id === food.id;
            const exclusive = isExclusiveFood(food, driver.id);
            return `
              <button class="feed-food ${active ? "active" : ""} ${qty <= 0 ? "empty" : ""}" data-feed-food="${food.id}" style="--driver:${food.color}" ${qty <= 0 ? "disabled" : ""}>
                <span>${food.emoji}</span>
                <strong>${food.name}</strong>
                <small>x${qty}${exclusive ? " · 专属" : ""}</small>
              </button>
            `;
          }).join("")}
        </div>
        <section class="actions feed-picker-actions">
          <button class="btn" data-action="confirmFeed" ${disabled ? "disabled" : ""}>确认投喂 ${selectedFood ? `${selectedFood.emoji} ${selectedFood.name}` : "基础补给"}</button>
          <button class="btn secondary" data-action="closeFeedPicker">取消</button>
        </section>
      </section>
    </div>
  `;
}

function renderHome() {
  const { player, feed, driver, level, nextLevel } = currentModel();
  if (!player) return renderSelect();
  const inventory = getInventoryState();
  const meta = getMetaState();
  const camp = currentTrainingCamp();
  const inCamp = driver.id === camp.driver.id;
  const totalOwnedFoods = ownedFoodCount(inventory);
  const remain = Math.max(0, DAILY_LIMIT - feed.usedFeeds);
  const growth = player.growth || 0;
  const weeklyProgress = Math.min(100, Math.round((feed.weeklyFeed / 260) * 100));
  const levelProgress = nextLevel.minGrowth === level.minGrowth
    ? 100
    : Math.min(100, Math.round(((growth - level.minGrowth) / (nextLevel.minGrowth - level.minGrowth)) * 100));
  const disabled = remain <= 0 || (feed.stock <= 0 && totalOwnedFoods <= 0) || state.isFeeding;
  return `
    <main class="home-main">
      <section class="event-strip" style="--driver:${camp.driver.color}">
        <div>
          <strong>本周训练营：${camp.driver.name}</strong>
          <small>${camp.driver.team} · ${inCamp ? "+20% 成长加成已生效" : "绑定焦点车手可获得 +20% 成长"}</small>
        </div>
        <button class="mini-btn" data-view="training">任务</button>
      </section>
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
          ${meta.doubleCards > 0 ? `<button class="double-card-float ${state.doubleCardArmed ? "armed" : ""}" data-action="toggleDoubleCard">${state.doubleCardArmed ? "已启用" : "加倍卡"} x${meta.doubleCards}</button>` : ""}
          ${state.floatingFood ? `<div class="food-fly">${state.floatingFoodEmoji || driver.foodEmoji}</div>` : ""}
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
      </section>

      ${renderDailyAgenda({ feed, inventory, totalOwnedFoods, remain })}

      <section class="actions">
        <button class="btn" data-action="openFeedPicker" ${disabled ? "disabled" : ""}>投喂食物</button>
        <button class="btn secondary" data-view="select">更换车手</button>
      </section>
    </main>
  `;
}

function renderDailyAgenda({ feed, inventory, totalOwnedFoods, remain }) {
  const account = getAccount();
  const collection = collectionCount(inventory);
  const canFeed = remain > 0 && (feed.stock > 0 || totalOwnedFoods > 0);
  const syncDone = account?.localOnly || (isCloudAccount(account) && state.backend === "online" && !state.syncPending);
  const syncDetail = !account
    ? "未登录 · 本地存档"
    : account.localOnly
      ? "本地账号"
      : state.syncPending
        ? "等待云端恢复"
        : state.backend === "online"
          ? "云端在线"
          : "本地模式";
  const items = [
    {
      done: feed.usedFeeds >= DAILY_LIMIT,
      title: "今日投喂",
      detail: canFeed ? `还可 ${remain} 次 · 食物 ${totalOwnedFoods}` : "今日已收工",
      progress: Math.round((feed.usedFeeds / DAILY_LIMIT) * 100),
    },
    {
      done: collection >= foodCatalog.length,
      title: "食物收集",
      detail: collection >= foodCatalog.length ? "可兑换珍珠" : `${collection}/${foodCatalog.length} 已收集`,
      progress: Math.round((collection / foodCatalog.length) * 100),
    },
    {
      done: Boolean(syncDone),
      title: "账号同步",
      detail: syncDetail,
      progress: syncDone ? 100 : 35,
    },
  ];
  return `
    <section class="agenda-strip" aria-label="今日赛程">
      ${items.map((item) => `
        <article class="agenda-item ${item.done ? "done" : ""}" style="--progress:${item.progress}%">
          <span class="agenda-dot">${item.done ? "✓" : "·"}</span>
          <div>
            <strong>${item.title}</strong>
            <small>${item.detail}</small>
          </div>
        </article>
      `).join("")}
    </section>
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
  const friends = getFriendsState().friends;
  const hasFriends = friends.length > 0;
  const collected = collectionCount(inventory);
  const missing = foodCatalog.filter((food) => !hasFood(inventory, food.id));
  return `
    <main class="warehouse-main">
      <section class="panel collection-panel">
        <h2>食物仓库</h2>
        <p class="label">集合进度 ${collected}/${foodCatalog.length} · 珍珠 ${player.treasures || 0}${hasFriends ? ` · 本周可赠送 ${giftLeft(gifts)}/${WEEKLY_GIFT_LIMIT}` : ""}</p>
        <div class="progress collection-progress" style="--progress:${Math.round((collected / foodCatalog.length) * 100)}%"><span></span></div>
        <p class="label">缺少：${missing.length ? missing.map((food) => food.name).join("、") : "已集齐"}</p>
        <button class="btn" data-action="redeemCollection" ${canRedeemCollection(inventory) ? "" : "disabled"}>集齐兑换 金牌美食家</button>
        ${hasFriends ? "" : `<p class="label">暂无好友，添加好友后这里会开放食物赠送。</p>`}
      </section>
      <section class="food-grid">
        ${foodCatalog.map((food) => {
          const qty = foodQuantity(inventory, food.id);
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
              ${hasFriends ? `<button class="mini-btn" data-gift="${food.id}" ${qty > 0 && giftLeft(gifts) > 0 ? "" : "disabled"}>赠送</button>` : ""}
            </article>
          `;
        }).join("")}
      </section>
      ${hasFriends ? `
        <section class="panel gift-log-panel">
          <h2>最近赠送</h2>
          <div class="list">
            ${gifts.records.length ? gifts.records.slice(0, 5).map((record) => {
              const food = findFood(record.foodId);
              const title = record.direction === "received" ? `收到 ${record.from || "好友"}` : `送给 ${record.to || "好友"}`;
              return `<div class="list-row"><span>${food.emoji}</span><div><strong>${escapeHtml(title)}</strong><small>${food.name} x${record.quantity}</small></div><span>${record.weekId}</span></div>`;
            }).join("") : `<p class="label">还没有赠送记录。</p>`}
          </div>
        </section>
      ` : ""}
      ${state.giftFoodId && hasFriends ? renderGiftModal(friends) : ""}
    </main>
  `;
}

function renderGiftModal(friends) {
  const inventory = getInventoryState();
  const food = findFood(state.giftFoodId);
  const owned = foodQuantity(inventory, food.id);
  const quantity = Math.min(state.giftQuantity, Math.min(5, owned));
  const selectedFriend = friends.find((friend) => friend.id === state.giftFriendId) || friends[0];
  state.giftQuantity = Math.max(1, quantity);
  state.giftFriendId = selectedFriend.id;
  return `
    <div class="modal-backdrop">
      <section class="gift-modal panel">
        <h2>赠送食物给好友</h2>
        <p class="label">好友：${escapeHtml(selectedFriend.name)}</p>
        ${friends.length > 1 ? `
          <div class="friend-choice-grid">
            ${friends.map((friend) => `<button class="friend-chip ${friend.id === selectedFriend.id ? "active" : ""}" data-gift-friend="${friend.id}">${escapeHtml(friend.name)}</button>`).join("")}
          </div>
        ` : ""}
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
          <button class="btn" data-action="confirmGift" ${state.socialLoading || owned <= 0 ? "disabled" : ""}>确认</button>
          <button class="btn secondary" data-action="cancelGift">取消</button>
        </section>
      </section>
    </div>
  `;
}

function openGift(foodId) {
  const friends = getFriendsState().friends;
  if (!friends.length) return showToast("暂无好友，不能赠送");
  state.giftFoodId = foodId;
  state.giftFriendId = state.giftFriendId && friends.some((friend) => friend.id === state.giftFriendId)
    ? state.giftFriendId
    : friends[0].id;
  state.giftQuantity = 1;
  state.giftRequestId = createClientRequestId("gift");
  render();
}

async function confirmGift() {
  const friends = getFriendsState().friends;
  const gifts = getGiftState();
  if (!friends.length) return showToast("暂无好友，不能赠送");
  if (!state.giftFoodId || giftLeft(gifts) <= 0) return showToast("本周赠送次数已用完");
  const food = findFood(state.giftFoodId);
  const quantity = Math.min(5, state.giftQuantity);
  const receiver = friends.find((friend) => friend.id === state.giftFriendId) || friends[0];
  const account = getAccount();

  if (isCloudAccount(account)) {
    state.socialLoading = true;
    render();
    try {
      const data = await callGameApi({
        action: "sendGift",
        playerId: account.id,
        accountToken: account.authToken,
        receiverId: receiver.id,
        foodId: food.id,
        quantity,
        weekId: gifts.weekId,
        requestId: state.giftRequestId || createClientRequestId("gift"),
      });
      if (data.gameState) applyRemoteGameState(data.gameState);
      if (data.friends) saveFriendsState({ friends: data.friends });
      state.backend = cloudStorageOnline(data.storage) ? "online" : "offline";
      state.giftFoodId = "";
      state.giftFriendId = "";
      state.giftQuantity = 1;
      state.giftRequestId = "";
      showToast(`已通过云端赠送 ${food.name} x${quantity}`);
    } catch (error) {
      state.backend = "offline";
      showToast(socialErrorMessage(error.message));
    } finally {
      state.socialLoading = false;
      render();
    }
    return;
  }

  if (!consumeFood(food.id, quantity)) return showToast("库存不足，无法赠送");
  gifts.sentThisWeek += 1;
  gifts.records.unshift({
    id: `${Date.now()}`,
    foodId: food.id,
    quantity,
    to: receiver.name,
    receiverId: receiver.id,
    weekId: gifts.weekId,
    sentAt: Date.now(),
  });
  gifts.records = gifts.records.slice(0, 12);
  saveGiftState(gifts);
  saveRemoteGameState();
  state.giftFoodId = "";
  state.giftFriendId = "";
  state.giftQuantity = 1;
  state.giftRequestId = "";
  showToast(`已赠送 ${food.name} x${quantity}`);
  render();
}

function renderTrainingCamp() {
  const { player } = currentModel();
  if (!player) return renderSelect();
  const meta = getMetaState();
  const camp = currentTrainingCamp();
  const inCamp = player.driverId === camp.driver.id;
  const progress = [meta.weekly.campFeeds, meta.weekly.campFoodFeeds, meta.weekly.campFeedValue];
  const targets = [20, 10, 180];
  return `
    <main class="training-main">
      <section class="panel spotlight-panel" style="--driver:${camp.driver.color}">
        <h2>本周训练营</h2>
        <div class="spotlight-driver">
          <img src="${portraitSrc(camp.driver, "celebrate")}" alt="${camp.driver.name}" />
          <div>
            <strong>${camp.driver.name}</strong>
            <small>${camp.driver.team} · ${camp.weekId}</small>
            <p class="label">${inCamp ? "你正在享受 +20% 成长加成。" : "本周焦点车手玩家可获得 +20% 成长加成。"}</p>
          </div>
        </div>
      </section>
      <section class="panel">
        <h2>周任务</h2>
        <div class="task-list">
          ${camp.tasks.map((task, index) => {
            const value = Math.min(targets[index], progress[index] || 0);
            const done = value >= targets[index];
            return `
              <article class="task-card ${done ? "done" : ""}">
                <strong>${done ? "✓" : "·"} ${task.name}</strong>
                <small>${task.desc}</small>
                <div class="progress" style="--progress:${Math.round((value / targets[index]) * 100)}%"><span></span></div>
                <small>进度 ${value}/${targets[index]} · 奖励 ${task.reward}</small>
              </article>
            `;
          }).join("")}
        </div>
      </section>
      <section class="panel">
        <h2>活动统计</h2>
        <p>本周训练营额外成长：${meta.weekly.bonusGrowth || 0}</p>
        <p>幸运时刻：${meta.weekly.luckyWheelUsed || 0}/${LUCKY_WHEEL_LIMIT}</p>
      </section>
    </main>
  `;
}

function renderFoodMuseum() {
  const player = getPlayer();
  if (!player) return renderSelect();
  const inventory = getInventoryState();
  const selected = state.museumFoodId ? findFood(state.museumFoodId) : null;
  const collected = collectionCount(inventory);
  if (selected) return renderFoodDetail(selected, inventory);
  return `
    <main class="museum-main">
      <section class="panel museum-hero">
        <h2>食物博物馆</h2>
        <p class="label">F1 车手的能量秘密 · 已展览 ${collected}/${foodCatalog.length}</p>
        <div class="progress collection-progress" style="--progress:${Math.round((collected / foodCatalog.length) * 100)}%"><span></span></div>
        ${collected >= foodCatalog.length ? `<p>美食大师之路已开启，称号「美食品鉴家」可在成就中查看。</p>` : `<p class="label">收集食物即可点亮展览卡片。</p>`}
      </section>
      <section class="museum-grid">
        ${foodCatalog.map((food) => {
          const owned = hasFood(inventory, food.id);
          return `
            <button class="museum-card ${owned ? "" : "locked"}" style="--driver:${food.color}" data-museum="${food.id}">
              <span class="food-icon">${food.emoji}</span>
              <strong>${food.name}</strong>
              <small>${food.englishName}</small>
              <small>${food.driverName}</small>
              <span>${owned ? "已拥有" : "未拥有"}</span>
            </button>
          `;
        }).join("")}
      </section>
    </main>
  `;
}

function renderFoodDetail(food, inventory) {
  const qty = foodQuantity(inventory, food.id);
  return `
    <main class="museum-main">
      <section class="panel museum-detail" style="--driver:${food.color}">
        <button class="mini-btn" data-action="museumBack">返回展览区</button>
        <div class="detail-food">${food.emoji}</div>
        <h2>${food.name}</h2>
        <p class="label">${food.englishName} · ${food.driverName} · ${food.team}</p>
        <h3>营养价值</h3>
        <p>${food.nutrition.join(" / ")}</p>
        <h3>F1 故事</h3>
        <p>${food.museumStory}</p>
        <h3>你的进展</h3>
        <p>当前持有：${qty} 个</p>
      </section>
    </main>
  `;
}

function renderWheelModal() {
  const wheel = state.wheel;
  return `
    <div class="modal-backdrop">
      <section class="wheel-modal panel">
        <h2>幸运时刻</h2>
        <div class="wheel-board">
          ${wheelRewards.map((reward, index) => `<button class="wheel-slice ${wheel.reward.id === reward.id && wheel.settled ? "winner" : ""}" data-action="wheelTap" style="--i:${index}">${reward.label}</button>`).join("")}
        </div>
        <p class="label">快速点击转盘，点击次数会让它多转几格。</p>
        <p>点击次数：${wheel.clicks}</p>
        ${wheel.settled ? `<strong>${wheel.resultText}</strong>` : `<button class="btn" data-action="settleWheel">停止并领奖</button>`}
        ${wheel.settled ? `<button class="btn secondary" data-action="closeWheel">收下奖励</button>` : ""}
      </section>
    </div>
  `;
}

function redeemCollection() {
  const player = getPlayer();
  const inventory = getInventoryState();
  if (!player || !canRedeemCollection(inventory)) return showToast(`还没有集齐 ${foodCatalog.length} 种食物`);
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
  saveRemoteGameState();
  showToast("兑换成功：金牌美食家 + 珍珠 x10");
  render();
}

function renderLeaderboard() {
  const me = ensurePlayerId();
  const local = publicPlayerSnapshot();
  const rows = state.leaderboard.length ? state.leaderboard : local ? [local] : [];
  const ownIndex = local ? rows.findIndex((row) => row.playerId === me) : -1;
  const ownRankText = !local
    ? "选择车手并完成一次喂食后会生成你的本周成绩。"
    : ownIndex >= 0
      ? `当前排名 #${ownIndex + 1} · 本周喂食 ${local.weeklyFeed || 0} · 成长值 ${local.growth || 0}`
      : `本周喂食 ${local.weeklyFeed || 0} · 成长值 ${local.growth || 0} · 暂未进入前 ${LEADERBOARD_LIMIT}`;
  return `
    <main class="leaderboard-main">
      <section class="panel">
        <h2>本周排行榜</h2>
        <p class="label">${state.backend === "online" ? "云端数据已同步，所有玩家共享同一周榜。" : "当前是本地模式。部署 Cloudflare Pages + D1 后会自动切换到云端周榜。"}</p>
        <div class="rank-summary">
          <strong>我的本周状态</strong>
          <small>${ownRankText}</small>
        </div>
        <div class="list">
          ${rows.length ? rows.map((row, index) => {
            const driver = getDriver(row.driverId);
            return `
              <div class="list-row ${row.playerId === me ? "selected-row" : ""}" style="--driver:${driver.color}">
                <img src="${portraitSrc(driver, index === 0 ? "celebrate" : "neutral")}" alt="${escapeHtml(row.driverName || driver.name)}" />
                <div>
                  <strong>#${index + 1} ${escapeHtml(row.nickName || "像素车迷")}</strong>
                  <small>${escapeHtml(row.driverName || driver.name)} · 本周喂食 ${Number(row.weeklyFeed) || 0} · 成长值 ${Number(row.growth) || 0}</small>
                </div>
                <span>${escapeHtml(row.badge || driver.badge)}</span>
              </div>
            `;
          }).join("") : `<p class="label">还没有本周榜单数据。先完成喂食，或者登录云端账号后刷新排行榜。</p>`}
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
  const achievements = getAchievementsState();
  const meta = getMetaState();
  const driverMilestones = player ? meta.milestones[player.driverId] || [] : [];
  const unlocked = achievementDefs.filter((def) => achievements.unlocked[def.id]).length;
  return `
    <main class="achievements-main">
      <section class="panel">
        <h2>成就中心</h2>
        <p class="label">已解锁 ${unlocked}/${achievementDefs.length} · 成就珍珠 ${achievements.claimedTreasures || 0}</p>
        <div class="progress" style="--progress:${Math.round((unlocked / achievementDefs.length) * 100)}%"><span></span></div>
      </section>
      <section class="achievement-grid">
        ${achievementDefs.map((def) => {
          const progress = Math.min(def.target, achievementProgress(def));
          const done = Boolean(achievements.unlocked[def.id]);
          return `
            <article class="achievement-card ${done ? "done" : ""}">
              <strong>${done ? "✓" : "○"} ${def.name}</strong>
              <small>${def.category} · ${def.desc}</small>
              <div class="progress" style="--progress:${Math.round((progress / def.target) * 100)}%"><span></span></div>
              <small>进度 ${progress}/${def.target} · 奖励 珍珠 x${def.reward}</small>
            </article>
          `;
        }).join("")}
      </section>
      <section class="panel">
        <h2>成长档案</h2>
        <p>当前等级：<strong>${level.name}</strong></p>
        <p>成长值：${growth}</p>
        <p>本周喂食：${feed.weeklyFeed || 0}</p>
        <p>珍珠：${player ? player.treasures || 0 : 0}</p>
        <p>金牌美食家：<strong>${hasFoodie ? "已解锁" : "未解锁"}</strong></p>
        <p class="label">${nextLevel.minGrowth === level.minGrowth ? "已经抵达最高等级。" : `距离 ${nextLevel.name} 还差 ${nextLevel.minGrowth - growth} 成长值。`}</p>
      </section>
      <section class="panel">
        <h2>里程碑相册</h2>
        <div class="list">
          ${levels.map((item, index) => {
            const milestone = driverMilestones.find((entry) => entry.level === index + 1);
            return `
            <div class="list-row">
              <span>${milestone ? "✓" : "·"}</span>
              <div><strong>Lv.${index + 1} ${item.name}</strong><small>${milestone ? `解锁于 ${milestone.reachedAt} · 成长值 ${milestone.growthValue}` : `成长值达到 ${item.minGrowth}`}</small></div>
              <span>${item.minGrowth}</span>
            </div>
          `; }).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderFriendsPanel(account) {
  if (!account) return "";
  const friends = getFriendsState().friends;
  if (account.localOnly) {
    return `
      <section class="panel friends-panel">
        <h2>好友</h2>
        <p class="label">本地账号只保存当前浏览器存档，不支持云端好友、搜索和服务端赠送。想和朋友一起玩，需要部署 Cloudflare Pages + D1 后使用云端账号。</p>
      </section>
    `;
  }

  const searchResults = state.friendSearchResults || [];
  return `
    <section class="panel friends-panel">
      <div class="panel-head">
        <div>
          <h2>好友</h2>
          <p class="label">云端好友用于开放仓库赠送；赠送次数和库存由服务器校验。</p>
        </div>
        <button class="mini-btn" data-action="refreshFriends" ${state.socialLoading ? "disabled" : ""}>同步</button>
      </div>
      <div class="friend-search">
        <input data-friend-search maxlength="24" placeholder="搜索账号或昵称" value="${escapeHtml(state.friendSearchQuery)}" />
        <button class="mini-btn" data-action="searchFriends" ${state.socialLoading ? "disabled" : ""}>搜索</button>
      </div>
      ${searchResults.length ? `
        <div class="friend-result-list">
          ${searchResults.map((friend) => `
            <div class="friend-row">
              <div>
                <strong>${escapeHtml(friend.nickName || friend.name || friend.accountName)}</strong>
                <small>${escapeHtml(friend.accountName || friend.id)}</small>
              </div>
              <button class="mini-btn" data-friend-add="${friend.id}" ${state.socialLoading ? "disabled" : ""}>添加</button>
            </div>
          `).join("")}
        </div>
      ` : ""}
      <div class="friend-result-list">
        ${friends.length ? friends.map((friend) => `
          <div class="friend-row">
            <div>
              <strong>${escapeHtml(friend.name || friend.nickName || friend.accountName)}</strong>
              <small>${escapeHtml(friend.accountName || friend.id)}</small>
            </div>
            <button class="mini-btn" data-friend-remove="${friend.id}" ${state.socialLoading ? "disabled" : ""}>删除</button>
          </div>
        `).join("") : `<p class="label">还没有好友。搜索朋友的账号或昵称后添加。</p>`}
      </div>
    </section>
  `;
}

function renderSettings() {
  const account = getAccount();
  const accountMode = account ? account.localOnly ? "本地账号" : "云端账号" : "";
  const authDisabled = state.authLoading ? "disabled" : "";
  const syncStatus = !account
    ? "未登录账号。本地进度会保存在当前浏览器。"
    : account.localOnly
      ? "本地账号不会上传云端，适合单机试玩。"
      : state.syncPending
        ? "有本地进度正在等待云端恢复后同步。"
        : state.lastSyncAt
          ? `最近云端同步：${new Date(state.lastSyncAt).toLocaleString()}`
          : "云端账号已登录，下一次保存会更新同步状态。";
  const accountHint = account
    ? account.localOnly
      ? "当前存档只保存在这个浏览器和这个网站域名下，不会自动关联云端旧账号。"
      : "当前存档会尝试和云端后端同步，可跨浏览器关联同一账号。"
    : "";
  return `
    <main class="settings-main">
      <section class="panel account-panel">
        <h2>账号</h2>
        ${account ? `
          <p class="label">已登录：${escapeHtml(account.nickName)} / ${escapeHtml(account.accountName)}</p>
          <p class="account-mode ${account.localOnly ? "local" : "cloud"}">${accountMode}</p>
          <p class="label">${accountHint}</p>
          <p class="sync-state ${state.syncPending ? "pending" : ""}">${syncStatus}</p>
          <p class="label">排行榜 ID：${escapeHtml(account.id)}</p>
          <section class="actions">
            <button class="btn secondary" data-action="logoutAccount">退出账号</button>
          </section>
        ` : `
          <p class="label">云端登录用于跨设备关联旧账号；本地登录只保存到当前浏览器。当前 GitHub Pages 静态站点没有云函数时，云端登录会失败，不会再自动切换成本地账号。</p>
          <div class="account-form">
            <input data-auth-account autocomplete="username" maxlength="24" placeholder="账号：英文/数字/_/-" value="${escapeHtml(state.authDraft.accountName)}" />
            <input data-auth-nickname maxlength="24" placeholder="昵称：排行榜显示名" value="${escapeHtml(state.authDraft.nickName)}" />
            <input data-auth-password autocomplete="current-password" maxlength="72" type="password" placeholder="密码：至少 4 位" value="${escapeHtml(state.authDraft.password)}" />
          </div>
          <section class="actions account-actions">
            <button class="btn" data-action="registerAccount" ${authDisabled}>${state.authLoading ? "连接中" : "云端注册"}</button>
            <button class="btn secondary" data-action="loginAccount" ${authDisabled}>云端登录</button>
            <button class="btn secondary" data-action="registerLocalAccount" ${authDisabled}>本地注册</button>
            <button class="btn secondary" data-action="loginLocalAccount" ${authDisabled}>本地登录</button>
          </section>
        `}
      </section>
      ${renderFriendsPanel(account)}
      <section class="panel">
        <h2>设置</h2>
        <p>这是 Web/PWA 版本，可以在 iOS Safari 或 Android Chrome 里添加到主屏幕。养成、食物仓库和兑换奖励会优先绑定到当前登录账号；静态站点会使用本地账号存档。</p>
        ${account ? "" : `<p class="sync-state">当前未登录，刷新页面不会丢失本地进度；登录云端账号后可尝试跨设备同步。</p>`}
      </section>
      <section class="actions">
        <button class="btn secondary" data-action="install">${state.installPromptReady ? "安装到设备" : "安装说明"}</button>
        <button class="btn secondary" data-action="reset">清空本地数据</button>
      </section>
    </main>
  `;
}

function renderTabbar() {
  const tabs = [
    ["home", "养成"],
    ["warehouse", "仓库"],
    ["training", "活动"],
    ["museum", "博物馆"],
    ["leaderboard", "排行"],
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
  app.querySelectorAll("[data-feed-food]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedFeedFoodId = node.dataset.feedFood;
      render();
    });
  });
  app.querySelectorAll("[data-feed-basic]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedFeedFoodId = DAILY_STOCK_FOOD_ID;
      render();
    });
  });
  app.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", () => {
      const action = node.dataset.action;
      if (action === "openFeedPicker") {
        state.feedPickerOpen = true;
        render();
      }
      if (action === "closeFeedPicker") {
        state.feedPickerOpen = false;
        render();
      }
      if (action === "confirmFeed") feedDriver();
      if (action === "talk") talkToDriver();
      if (action === "reset") resetAll();
      if (action === "toggleDoubleCard") {
        state.doubleCardArmed = !state.doubleCardArmed;
        render();
      }
      if (action === "refreshLeaderboard") refreshLeaderboard({ silent: false });
      if (action === "refreshFriends") loadCloudFriends({ silent: false });
      if (action === "searchFriends") searchCloudFriends();
      if (action === "registerAccount") authenticateAccount("register");
      if (action === "loginAccount") authenticateAccount("login");
      if (action === "registerLocalAccount") authenticateLocalAccountFromForm("register");
      if (action === "loginLocalAccount") authenticateLocalAccountFromForm("login");
      if (action === "logoutAccount") logoutAccount();
      if (action === "redeemCollection") redeemCollection();
      if (action === "museumBack") {
        state.museumFoodId = "";
        render();
      }
      if (action === "wheelTap" && state.wheel && !state.wheel.settled) {
        state.wheel.clicks += 1;
        render();
      }
      if (action === "settleWheel" && state.wheel && !state.wheel.settled) {
        state.wheel.settled = true;
        settleWheelReward(state.wheel.reward, GROWTH_PER_FEED + state.wheel.clicks);
        render();
      }
      if (action === "closeWheel") {
        state.wheel = null;
        render();
      }
      if (action === "confirmGift") confirmGift();
      if (action === "cancelGift") {
        state.giftFoodId = "";
        state.giftRequestId = "";
        render();
      }
      if (action === "install") promptInstallApp();
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
  app.querySelectorAll("[data-gift-friend]").forEach((node) => {
    node.addEventListener("click", () => {
      state.giftFriendId = node.dataset.giftFriend;
      render();
    });
  });
  app.querySelectorAll("[data-friend-add]").forEach((node) => {
    node.addEventListener("click", () => addCloudFriend(node.dataset.friendAdd));
  });
  app.querySelectorAll("[data-friend-remove]").forEach((node) => {
    node.addEventListener("click", () => removeCloudFriend(node.dataset.friendRemove));
  });
  app.querySelectorAll("[data-friend-search]").forEach((node) => {
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter") searchCloudFriends();
    });
  });
  app.querySelectorAll("[data-auth-account]").forEach((node) => {
    node.addEventListener("input", () => {
      state.authDraft.accountName = node.value.trim();
      if (!state.authDraft.nickName) state.authDraft.nickName = state.authDraft.accountName;
    });
  });
  app.querySelectorAll("[data-auth-nickname]").forEach((node) => {
    node.addEventListener("input", () => {
      state.authDraft.nickName = node.value.trim();
    });
  });
  app.querySelectorAll("[data-auth-password]").forEach((node) => {
    node.addEventListener("input", () => {
      state.authDraft.password = node.value;
    });
  });
  app.querySelectorAll("[data-museum]").forEach((node) => {
    node.addEventListener("click", () => {
      state.museumFoodId = node.dataset.museum;
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

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  state.installPromptReady = true;
  render();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  state.installPromptReady = false;
  showToast("应用已安装");
  render();
});

render();
bootstrapBackend();

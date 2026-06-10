import { connectLambda, getStore } from "@netlify/blobs";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "content-type": "application/json; charset=utf-8",
};

const MAX_RANKINGS = 50;
const WEEKLY_GIFT_LIMIT = 2;
const MAX_GIFT_QUANTITY = 5;
const MAX_FOOD_STACK = 99;
const FOOD_IDS = [
  "verstappen",
  "leclerc",
  "hamilton",
  "norris",
  "piastri",
  "russell",
  "antonelli",
  "alonso",
  "espresso_gel",
  "hydration_pack",
];
const VALID_ACTIONS = new Set([
  "syncPlayer",
  "leaderboard",
  "resetPlayer",
  "registerAccount",
  "loginAccount",
  "loadGameState",
  "saveGameState",
  "listFriends",
  "searchAccounts",
  "addFriend",
  "removeFriend",
  "sendGift",
]);
const SOCIAL_ACTIONS = new Set(["listFriends", "searchAccounts", "addFriend", "removeFriend", "sendGift"]);

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return json(204, {});
  if (event.httpMethod !== "POST") return json(405, { error: "method_not_allowed" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "invalid_json" });
  }

  if (!VALID_ACTIONS.has(body.action)) return json(400, { error: "invalid_action" });

  const store = createStore(event);

  if (body.action === "registerAccount" || body.action === "loginAccount") {
    if (!store) return json(503, { ok: false, error: "storage_unavailable" });
    return handleAccountAction(store, body);
  }

  if (SOCIAL_ACTIONS.has(body.action)) {
    if (!store) return json(503, { ok: false, error: "storage_unavailable" });
    return handleSocialAction(store, body);
  }

  if (body.action === "syncPlayer") {
    const player = normalizePlayer(body.player);
    if (!player) return json(400, { error: "invalid_player" });

    if (!store) return json(200, { ok: true, storage: "volatile", player });
    if (!(await canWritePlayer(store, player.playerId, body.accountToken))) {
      return json(401, { ok: false, error: "unauthorized_player" });
    }

    await store.setJSON(weeklyKey(player.weekId, player.playerId), player);
    await store.setJSON(`players/${player.playerId}`, player);
    return json(200, { ok: true, storage: "blob", player });
  }

  if (body.action === "loadGameState") {
    const playerId = safeId(body.playerId);
    if (!playerId) return json(400, { error: "invalid_player" });
    if (!store) return json(200, { ok: true, storage: "volatile", gameState: null });
    if (!(await canWritePlayer(store, playerId, body.accountToken))) {
      return json(401, { ok: false, error: "unauthorized_player" });
    }
    const gameState = await loadStoredGameState(store, playerId);
    return json(200, { ok: true, storage: "blob", gameState });
  }

  if (body.action === "saveGameState") {
    const playerId = safeId(body.playerId);
    if (!playerId) return json(400, { error: "invalid_player" });
    if (!store) return json(200, { ok: true, storage: "volatile" });
    if (!(await canWritePlayer(store, playerId, body.accountToken))) {
      return json(401, { ok: false, error: "unauthorized_player" });
    }
    const gameState = normalizeGameState(body.gameState);
    if (!gameState) return json(400, { ok: false, error: "invalid_game_state" });
    gameState.friends = { friends: await getFriends(store, playerId) };
    await store.setJSON(gameStateKey(playerId), { ...gameState, updatedAt: Date.now() });
    return json(200, { ok: true, storage: "blob", gameState });
  }

  if (body.action === "resetPlayer") {
    const playerId = safeId(body.playerId);
    const weekId = safeWeekId(body.weekId);
    if (!playerId || !weekId) return json(400, { error: "invalid_player" });

    if (store) {
      if (!(await canWritePlayer(store, playerId, body.accountToken))) {
        return json(401, { ok: false, error: "unauthorized_player" });
      }
      await store.delete(weeklyKey(weekId, playerId));
      await store.delete(`players/${playerId}`);
      await store.delete(gameStateKey(playerId));
    }

    return json(200, { ok: true, storage: store ? "blob" : "volatile" });
  }

  const weekId = safeWeekId(body.weekId);
  if (!weekId) return json(400, { error: "invalid_week" });

  if (!store) return json(200, { ok: true, storage: "volatile", weekId, rankings: [] });

  const players = await store.listJSON(`leaderboards/${weekId}/`, 200);
  const rankings = players
    .filter(Boolean)
    .sort((a, b) => {
      if ((b.weeklyFeed || 0) !== (a.weeklyFeed || 0)) return (b.weeklyFeed || 0) - (a.weeklyFeed || 0);
      if ((b.growth || 0) !== (a.growth || 0)) return (b.growth || 0) - (a.growth || 0);
      return (a.updatedAt || 0) - (b.updatedAt || 0);
    })
    .slice(0, MAX_RANKINGS);

  return json(200, { ok: true, storage: "blob", weekId, rankings });
}

async function handleAccountAction(store, body) {
  const credentials = normalizeCredentials(body);
  if (!credentials) return json(400, { ok: false, error: "invalid_credentials" });

  const accounts = await getAccountsIndex(store);
  const existing = accounts[credentials.accountName] || null;

  if (body.action === "registerAccount") {
    if (existing) return json(409, { ok: false, error: "account_exists" });

    const authToken = createAuthToken();
    const passwordSalt = createPasswordSalt();
    const account = {
      id: accountId(credentials.accountName),
      accountName: credentials.accountName,
      nickName: credentials.nickName,
      passwordHash: hashPassword(credentials.accountName, credentials.password, passwordSalt),
      passwordSalt,
      authTokenHash: hashToken(authToken),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    accounts[credentials.accountName] = account;
    await saveAccountIndexes(store, accounts, account);
    await store.setJSON(friendKey(account.id), { friends: [], updatedAt: Date.now() });
    return json(200, { ok: true, storage: "blob", account: publicAccount(account, authToken) });
  }

  if (!existing || !verifyPassword(credentials.password, existing)) {
    return json(401, { ok: false, error: "invalid_login" });
  }

  const authToken = createAuthToken();
  if (!existing.passwordSalt) {
    existing.passwordSalt = createPasswordSalt();
    existing.passwordHash = hashPassword(existing.accountName, credentials.password, existing.passwordSalt);
  }
  existing.authTokenHash = hashToken(authToken);
  existing.updatedAt = Date.now();
  accounts[credentials.accountName] = existing;
  await saveAccountIndexes(store, accounts, existing);

  return json(200, { ok: true, storage: "blob", account: publicAccount(existing, authToken) });
}

async function handleSocialAction(store, body) {
  const context = await requireAccount(store, body.playerId, body.accountToken);
  if (!context) return json(401, { ok: false, error: "unauthorized_player" });

  if (body.action === "listFriends") {
    return json(200, { ok: true, storage: "blob", friends: await getFriends(store, context.id) });
  }

  if (body.action === "searchAccounts") {
    const query = normalizeSearchQuery(body.query);
    if (query.length < 2) return json(200, { ok: true, storage: "blob", results: [] });
    const friends = await getFriends(store, context.id);
    const blockedIds = new Set([context.id, ...friends.map((friend) => friend.id)]);
    const accounts = Object.values(await getAccountsIndex(store));
    const results = accounts
      .filter((account) => account && safeId(account.id) && !blockedIds.has(account.id))
      .filter((account) => {
        const haystack = `${account.accountName || ""} ${account.nickName || ""}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12)
      .map(publicProfile);
    return json(200, { ok: true, storage: "blob", results });
  }

  if (body.action === "addFriend") {
    const friendId = safeId(body.friendId);
    if (!friendId || friendId === context.id) return json(400, { ok: false, error: "invalid_friend" });
    const friend = await getAccountById(store, friendId);
    if (!friend) return json(404, { ok: false, error: "friend_not_found" });
    await upsertFriend(store, context.id, friend.account);
    await upsertFriend(store, friend.id, context.account);
    return json(200, { ok: true, storage: "blob", friends: await getFriends(store, context.id) });
  }

  if (body.action === "removeFriend") {
    const friendId = safeId(body.friendId);
    if (!friendId || friendId === context.id) return json(400, { ok: false, error: "invalid_friend" });
    await removeFriendRef(store, context.id, friendId);
    await removeFriendRef(store, friendId, context.id);
    return json(200, { ok: true, storage: "blob", friends: await getFriends(store, context.id) });
  }

  return sendGift(store, context, body);
}

async function sendGift(store, context, body) {
  const receiverId = safeId(body.receiverId);
  const foodId = safeFoodId(body.foodId);
  const weekId = safeWeekId(body.weekId);
  const quantity = clampNumber(body.quantity, 1, MAX_GIFT_QUANTITY);
  const requestId = safeRequestId(body.requestId);
  if (!receiverId || !foodId || !weekId || receiverId === context.id) {
    return json(400, { ok: false, error: "invalid_gift" });
  }

  const requestKey = requestId ? giftRequestKey(context.id, requestId) : "";
  if (requestKey) {
    const previousRequest = await store.getJSON(requestKey);
    if (previousRequest?.response) {
      return json(200, { ...previousRequest.response, duplicate: true });
    }
  }

  const receiver = await getAccountById(store, receiverId);
  if (!receiver) return json(404, { ok: false, error: "friend_not_found" });

  const friends = await getFriends(store, context.id);
  if (!friends.some((friend) => friend.id === receiverId)) {
    return json(403, { ok: false, error: "not_friends" });
  }

  const senderState = normalizeGameState(await store.getJSON(gameStateKey(context.id))) || {};
  const inventory = normalizeInventoryState(senderState.inventory);
  if ((inventory.items[foodId] || 0) < quantity) {
    return json(409, { ok: false, error: "insufficient_inventory" });
  }

  const gifts = normalizeGiftState(senderState.gifts, weekId);
  if ((gifts.sentThisWeek || 0) >= WEEKLY_GIFT_LIMIT) {
    return json(429, { ok: false, error: "weekly_gift_limit" });
  }

  const sentAt = Date.now();
  const recordId = `${sentAt}_${randomBytes(4).toString("hex")}`;
  const receiverName = receiver.account.nickName || receiver.account.accountName;
  const senderName = context.account.nickName || context.account.accountName;
  const sentRecord = {
    id: recordId,
    direction: "sent",
    foodId,
    quantity,
    to: receiverName,
    receiverId,
    weekId,
    sentAt,
  };
  const receivedRecord = {
    id: recordId,
    direction: "received",
    foodId,
    quantity,
    from: senderName,
    fromId: context.id,
    weekId,
    sentAt,
  };

  inventory.items[foodId] -= quantity;
  gifts.sentThisWeek += 1;
  gifts.records = [sentRecord, ...gifts.records].slice(0, 12);
  const updatedSenderState = {
    ...senderState,
    inventory,
    gifts,
    friends: { friends },
    updatedAt: sentAt,
  };
  await store.setJSON(gameStateKey(context.id), updatedSenderState);
  await deliverGift(store, receiverId, receivedRecord, foodId, quantity, weekId);

  const responsePayload = {
    ok: true,
    storage: "blob",
    gameState: normalizeGameState(updatedSenderState),
    giftRecord: sentRecord,
    friends,
  };
  if (requestKey) await store.setJSON(requestKey, { response: responsePayload, updatedAt: sentAt });

  return json(200, responsePayload);
}

async function deliverGift(store, receiverId, record, foodId, quantity, weekId) {
  const receiverState = normalizeGameState(await store.getJSON(gameStateKey(receiverId)));
  if (!receiverState) {
    const inbox = normalizeGiftInbox(await store.getJSON(giftInboxKey(receiverId)));
    inbox.records = [record, ...inbox.records].slice(0, 30);
    await store.setJSON(giftInboxKey(receiverId), { ...inbox, updatedAt: Date.now() });
    return;
  }

  const inventory = normalizeInventoryState(receiverState.inventory);
  inventory.items[foodId] = Math.min(MAX_FOOD_STACK, (inventory.items[foodId] || 0) + quantity);
  const gifts = normalizeGiftState(receiverState.gifts, weekId);
  gifts.records = [record, ...gifts.records].slice(0, 12);
  receiverState.inventory = inventory;
  receiverState.gifts = gifts;
  receiverState.friends = { friends: await getFriends(store, receiverId) };
  receiverState.updatedAt = Date.now();
  await store.setJSON(gameStateKey(receiverId), receiverState);
}

async function loadStoredGameState(store, playerId) {
  let gameState = normalizeGameState(await store.getJSON(gameStateKey(playerId)));
  gameState = await applyInboxGifts(store, playerId, gameState);
  const friends = await getFriends(store, playerId);
  if (gameState) {
    gameState.friends = { friends };
    return gameState;
  }
  if (friends.length) return { friends: { friends }, updatedAt: Date.now() };
  return null;
}

async function applyInboxGifts(store, playerId, gameState) {
  const inbox = normalizeGiftInbox(await store.getJSON(giftInboxKey(playerId)));
  if (!inbox.records.length) return gameState;

  const updated = gameState || { updatedAt: Date.now() };
  const inventory = normalizeInventoryState(updated.inventory);
  const gifts = normalizeGiftState(updated.gifts, inbox.records[0].weekId);
  inbox.records.forEach((record) => {
    if (!safeFoodId(record.foodId)) return;
    inventory.items[record.foodId] = Math.min(MAX_FOOD_STACK, (inventory.items[record.foodId] || 0) + record.quantity);
    gifts.records.unshift(record);
  });
  gifts.records = gifts.records.slice(0, 12);
  updated.inventory = inventory;
  updated.gifts = gifts;
  updated.updatedAt = Date.now();
  await store.setJSON(gameStateKey(playerId), updated);
  await store.delete(giftInboxKey(playerId));
  return normalizeGameState(updated);
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: statusCode === 204 ? "" : JSON.stringify(payload),
  };
}

function createStore(event) {
  try {
    if (event.blobs) connectLambda(event);
    const blobStore = getStore("f1-pixel-garden");
    return {
      async getJSON(key) {
        return blobStore.get(key, { type: "json" }).catch(() => null);
      },
      async setJSON(key, value) {
        await blobStore.setJSON(key, value);
      },
      async delete(key) {
        await blobStore.delete(key);
      },
      async listJSON(prefix, limit) {
        const list = await blobStore.list({ prefix });
        return Promise.all(list.blobs.slice(0, limit).map((blob) => blobStore.get(blob.key, { type: "json" }).catch(() => null)));
      },
    };
  } catch (error) {
    if (error && error.name === "MissingBlobsEnvironmentError") return null;
    throw error;
  }
}

function normalizePlayer(raw) {
  if (!raw || typeof raw !== "object") return null;
  const playerId = safeId(raw.playerId);
  const weekId = safeWeekId(raw.weekId);
  const driverId = safeId(raw.driverId);
  if (!playerId || !weekId || !driverId) return null;

  return {
    playerId,
    weekId,
    driverId,
    nickName: clampText(raw.nickName || "Pixel Racer", 24),
    driverName: clampText(raw.driverName || driverId, 40),
    team: clampText(raw.team || "", 32),
    badge: clampText(raw.badge || "", 4),
    growth: clampNumber(raw.growth, 0, 999999),
    weeklyFeed: clampNumber(raw.weeklyFeed, 0, 999999),
    usedFeeds: clampNumber(raw.usedFeeds, 0, 50),
    updatedAt: clampNumber(raw.updatedAt || Date.now(), 0, Number.MAX_SAFE_INTEGER),
  };
}

function normalizeGameState(raw) {
  if (!raw || typeof raw !== "object") return null;
  const state = {
    player: raw.player && typeof raw.player === "object" ? raw.player : null,
    feed: raw.feed && typeof raw.feed === "object" ? raw.feed : null,
    inventory: raw.inventory ? normalizeInventoryState(raw.inventory) : null,
    gifts: raw.gifts ? normalizeGiftState(raw.gifts) : null,
    friends: raw.friends ? normalizeFriendsState(raw.friends) : null,
    meta: raw.meta && typeof raw.meta === "object" ? raw.meta : null,
    achievementsState: raw.achievementsState && typeof raw.achievementsState === "object" ? raw.achievementsState : null,
    updatedAt: clampNumber(raw.updatedAt || Date.now(), 0, Number.MAX_SAFE_INTEGER),
  };
  return state.player || state.feed || state.inventory || state.friends ? state : null;
}

function normalizeInventoryState(raw) {
  const source = raw && typeof raw === "object" ? raw.items || raw : {};
  const items = {};
  FOOD_IDS.forEach((foodId) => {
    items[foodId] = clampNumber(source[foodId], 0, MAX_FOOD_STACK);
  });
  return {
    items,
    lastDailyReward: clampText(raw?.lastDailyReward || "", 16),
  };
}

function normalizeGiftState(raw, weekId = "") {
  const rawWeek = safeWeekId(raw?.weekId);
  const safeWeek = safeWeekId(weekId) || rawWeek || "";
  const sameWeek = !safeWeek || !rawWeek || rawWeek === safeWeek;
  return {
    weekId: safeWeek,
    sentThisWeek: sameWeek ? clampNumber(raw?.sentThisWeek, 0, WEEKLY_GIFT_LIMIT) : 0,
    records: Array.isArray(raw?.records) ? raw.records.map(normalizeGiftRecord).filter(Boolean).slice(0, 12) : [],
  };
}

function normalizeGiftInbox(raw) {
  return {
    records: Array.isArray(raw?.records) ? raw.records.map(normalizeGiftRecord).filter(Boolean).slice(0, 30) : [],
  };
}

function normalizeGiftRecord(raw) {
  if (!raw || typeof raw !== "object") return null;
  const foodId = safeFoodId(raw.foodId);
  const quantity = clampNumber(raw.quantity, 1, MAX_GIFT_QUANTITY);
  const weekId = safeWeekId(raw.weekId);
  if (!foodId || !weekId) return null;
  return {
    id: clampText(raw.id || `${Date.now()}`, 48),
    direction: raw.direction === "received" ? "received" : "sent",
    foodId,
    quantity,
    to: clampText(raw.to || "", 24),
    from: clampText(raw.from || "", 24),
    receiverId: safeId(raw.receiverId),
    fromId: safeId(raw.fromId),
    weekId,
    sentAt: clampNumber(raw.sentAt || Date.now(), 0, Number.MAX_SAFE_INTEGER),
  };
}

function normalizeCredentials(raw) {
  if (!raw || typeof raw !== "object") return null;
  const accountName = normalizeAccountName(raw.accountName);
  const password = String(raw.password || "");
  const nickName = clampText(raw.nickName || accountName, 24);
  if (!accountName || password.length < 4 || password.length > 72) return null;
  return { accountName, password, nickName };
}

function normalizeAccountName(value) {
  const cleaned = String(value || "").trim().toLowerCase();
  return /^[a-z0-9_-]{3,24}$/.test(cleaned) ? cleaned : "";
}

function normalizeSearchQuery(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_\-\s]/g, "").slice(0, 24);
}

function accountId(accountName) {
  return `acct_${createHash("sha256").update(accountName).digest("hex").slice(0, 24)}`;
}

function gameStateKey(playerId) {
  return `game-states/${playerId}`;
}

function friendKey(playerId) {
  return `friends/${playerId}`;
}

function giftInboxKey(playerId) {
  return `gift-inbox/${playerId}`;
}

function giftRequestKey(playerId, requestId) {
  return `gift-requests/${playerId}/${requestId}`;
}

function createPasswordSalt() {
  return randomBytes(16).toString("hex");
}

function hashPassword(accountName, password, salt) {
  return createHash("sha256").update(`${salt}:${accountName}:${password}`).digest("hex");
}

function legacyHashPassword(accountName, password) {
  return createHash("sha256").update(`${accountName}:${password}`).digest("hex");
}

function verifyPassword(password, account) {
  const expected = Buffer.from(String(account.passwordHash || ""), "hex");
  const actualHash = account.passwordSalt
    ? hashPassword(account.accountName || "", password, account.passwordSalt)
    : legacyHashPassword(account.accountName || "", password);
  const actual = Buffer.from(actualHash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function createAuthToken() {
  return randomBytes(24).toString("hex");
}

function hashToken(token) {
  return createHash("sha256").update(String(token || "")).digest("hex");
}

function verifyToken(token, tokenHash) {
  const expected = Buffer.from(String(tokenHash || ""), "hex");
  const actual = Buffer.from(hashToken(token), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function publicAccount(account, authToken) {
  return {
    id: account.id,
    accountName: account.accountName,
    nickName: account.nickName,
    authToken,
  };
}

function publicProfile(account) {
  return {
    id: account.id,
    accountName: account.accountName,
    nickName: account.nickName || account.accountName,
    name: account.nickName || account.accountName,
  };
}

function weeklyKey(weekId, playerId) {
  return `leaderboards/${weekId}/${playerId}`;
}

async function getAccountsIndex(store) {
  const accounts = await store.getJSON("accounts-index");
  return accounts && typeof accounts === "object" && !Array.isArray(accounts) ? accounts : {};
}

async function saveAccountIndexes(store, accounts, account) {
  await store.setJSON("accounts-index", accounts);
  await store.setJSON(`accounts/${account.accountName}`, account);
  await store.setJSON(`account-ids/${account.id}`, account.accountName);
}

async function canWritePlayer(store, playerId, accountToken) {
  if (!playerId.startsWith("acct_")) return true;
  const context = await requireAccount(store, playerId, accountToken);
  return Boolean(context);
}

async function requireAccount(store, playerId, accountToken) {
  const accountIdValue = safeId(playerId);
  if (!accountIdValue || !accountIdValue.startsWith("acct_")) return null;
  const found = await getAccountById(store, accountIdValue);
  if (!found || !verifyToken(accountToken, found.account.authTokenHash)) return null;
  return found;
}

async function getAccountById(store, playerId) {
  const accountName = await store.getJSON(`account-ids/${playerId}`);
  const accounts = await getAccountsIndex(store);
  const account = accountName ? accounts[accountName] : Object.values(accounts).find((item) => item && item.id === playerId);
  if (!account || account.id !== playerId) return null;
  return { id: account.id, accountName: account.accountName, account };
}

async function getFriends(store, playerId) {
  const refs = normalizeFriendsState(await store.getJSON(friendKey(playerId))).friends;
  const hydrated = await Promise.all(
    refs.map(async (friend) => {
      const found = await getAccountById(store, friend.id);
      if (!found) return null;
      return { ...publicProfile(found.account), addedAt: friend.addedAt || Date.now() };
    })
  );
  return hydrated.filter(Boolean).slice(0, 50);
}

async function upsertFriend(store, ownerId, friendAccount) {
  const friends = normalizeFriendsState(await store.getJSON(friendKey(ownerId))).friends;
  const withoutExisting = friends.filter((friend) => friend.id !== friendAccount.id);
  withoutExisting.unshift({ ...publicProfile(friendAccount), addedAt: Date.now() });
  await store.setJSON(friendKey(ownerId), { friends: withoutExisting.slice(0, 50), updatedAt: Date.now() });
}

async function removeFriendRef(store, ownerId, friendId) {
  const friends = normalizeFriendsState(await store.getJSON(friendKey(ownerId))).friends;
  await store.setJSON(friendKey(ownerId), {
    friends: friends.filter((friend) => friend.id !== friendId),
    updatedAt: Date.now(),
  });
}

function normalizeFriendsState(raw) {
  const source = Array.isArray(raw?.friends) ? raw.friends : [];
  const seen = new Set();
  const friends = [];
  source.forEach((item) => {
    const id = safeId(item?.id);
    if (!id || seen.has(id)) return;
    seen.add(id);
    const accountName = clampText(item.accountName || "", 24);
    const nickName = clampText(item.nickName || item.name || accountName || id, 24);
    friends.push({
      id,
      accountName,
      nickName,
      name: nickName,
      addedAt: clampNumber(item.addedAt || Date.now(), 0, Number.MAX_SAFE_INTEGER),
    });
  });
  return { friends };
}

function safeId(value) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  return /^[a-zA-Z0-9_-]{1,80}$/.test(cleaned) ? cleaned : "";
}

function safeFoodId(value) {
  const cleaned = safeId(value);
  return FOOD_IDS.includes(cleaned) ? cleaned : "";
}

function safeWeekId(value) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  return /^\d{4}-W\d{2}$/.test(cleaned) ? cleaned : "";
}

function safeRequestId(value) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  return /^[a-zA-Z0-9_-]{8,80}$/.test(cleaned) ? cleaned : "";
}

function clampText(value, max) {
  return String(value || "").replace(/[\u0000-\u001f]/g, "").slice(0, max);
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

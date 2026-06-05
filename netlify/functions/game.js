import { connectLambda, getStore } from "@netlify/blobs";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "content-type": "application/json; charset=utf-8",
};

const MAX_RANKINGS = 50;
const VALID_ACTIONS = new Set(["syncPlayer", "leaderboard", "resetPlayer", "registerAccount", "loginAccount", "loadGameState", "saveGameState"]);

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
      await store.setJSON("accounts-index", accounts);
      return json(200, { ok: true, storage: "blob", account: publicAccount(account, authToken) });
    }

    if (!existing || !verifyPassword(credentials.password, existing)) {
      return json(401, {
        ok: false,
        error: "invalid_login",
      });
    }

    const authToken = createAuthToken();
    if (!existing.passwordSalt) {
      existing.passwordSalt = createPasswordSalt();
      existing.passwordHash = hashPassword(existing.accountName, credentials.password, existing.passwordSalt);
    }
    existing.authTokenHash = hashToken(authToken);
    existing.updatedAt = Date.now();
    accounts[credentials.accountName] = existing;
    await store.setJSON("accounts-index", accounts);

    return json(200, { ok: true, storage: "blob", account: publicAccount(existing, authToken) });
  }

  if (body.action === "syncPlayer") {
    const player = normalizePlayer(body.player);
    if (!player) return json(400, { error: "invalid_player" });

    if (!store) return json(200, { ok: true, storage: "volatile", player });
    if (!(await canWritePlayer(store, player.playerId, body.accountToken))) {
      return json(401, { ok: false, error: "unauthorized_player" });
    }

    const weekKey = weeklyKey(player.weekId, player.playerId);
    await store.setJSON(weekKey, player);
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
    const gameState = await store.get(`game-states/${playerId}`, { type: "json" }).catch(() => null);
    return json(200, { ok: true, storage: "blob", gameState: normalizeGameState(gameState) });
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
    await store.setJSON(`game-states/${playerId}`, { ...gameState, updatedAt: Date.now() });
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
    }

    return json(200, { ok: true, storage: store ? "blob" : "volatile" });
  }

  const weekId = safeWeekId(body.weekId);
  if (!weekId) return json(400, { error: "invalid_week" });

  if (!store) return json(200, { ok: true, storage: "volatile", weekId, rankings: [] });

  const list = await store.list({ prefix: `leaderboards/${weekId}/` });
  const players = await Promise.all(
    list.blobs.slice(0, 200).map((blob) => store.get(blob.key, { type: "json" }).catch(() => null))
  );

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
    return getStore("f1-pixel-garden");
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
    nickName: clampText(raw.nickName || "像素车迷", 24),
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
    inventory: raw.inventory && typeof raw.inventory === "object" ? raw.inventory : null,
    gifts: raw.gifts && typeof raw.gifts === "object" ? raw.gifts : null,
    friends: raw.friends && typeof raw.friends === "object" ? raw.friends : null,
    updatedAt: clampNumber(raw.updatedAt || Date.now(), 0, Number.MAX_SAFE_INTEGER),
  };
  return state.player || state.feed || state.inventory ? state : null;
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

function accountId(accountName) {
  return `acct_${createHash("sha256").update(accountName).digest("hex").slice(0, 24)}`;
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

function weeklyKey(weekId, playerId) {
  return `leaderboards/${weekId}/${playerId}`;
}

async function getAccountsIndex(store) {
  const accounts = await store.get("accounts-index", { type: "json" }).catch(() => null);
  return accounts && typeof accounts === "object" && !Array.isArray(accounts) ? accounts : {};
}

async function canWritePlayer(store, playerId, accountToken) {
  if (!playerId.startsWith("acct_")) return true;
  const accounts = await getAccountsIndex(store);
  const account = Object.values(accounts).find((item) => item && item.id === playerId);
  return Boolean(account && verifyToken(accountToken, account.authTokenHash));
}

function safeId(value) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  return /^[a-zA-Z0-9_-]{1,80}$/.test(cleaned) ? cleaned : "";
}

function safeWeekId(value) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  return /^\d{4}-W\d{2}$/.test(cleaned) ? cleaned : "";
}

function clampText(value, max) {
  return String(value).replace(/[\u0000-\u001f]/g, "").slice(0, max);
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, Math.round(number)));
}

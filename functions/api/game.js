const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "content-type": "application/json; charset=utf-8",
};

const MAX_RANKINGS = 50;
const VALID_ACTIONS = new Set(["syncPlayer", "leaderboard", "resetPlayer", "registerAccount", "loginAccount", "loadGameState", "saveGameState"]);

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === "OPTIONS") return json(204, {});
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  if (!VALID_ACTIONS.has(body.action)) return json(400, { error: "invalid_action" });

  const store = createStore(env);

  if (body.action === "registerAccount" || body.action === "loginAccount") {
    if (!store) return json(503, { ok: false, error: "storage_unavailable" });
    return handleAccountAction(store, body);
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
    return json(200, { ok: true, storage: "d1", player });
  }

  if (body.action === "loadGameState") {
    const playerId = safeId(body.playerId);
    if (!playerId) return json(400, { error: "invalid_player" });
    if (!store) return json(200, { ok: true, storage: "volatile", gameState: null });
    if (!(await canWritePlayer(store, playerId, body.accountToken))) {
      return json(401, { ok: false, error: "unauthorized_player" });
    }
    const gameState = await store.getJSON(`game-states/${playerId}`);
    return json(200, { ok: true, storage: "d1", gameState: normalizeGameState(gameState) });
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
    return json(200, { ok: true, storage: "d1", gameState });
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
      await store.delete(`game-states/${playerId}`);
    }
    return json(200, { ok: true, storage: store ? "d1" : "volatile" });
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

  return json(200, { ok: true, storage: "d1", weekId, rankings });
}

async function handleAccountAction(store, body) {
  const credentials = normalizeCredentials(body);
  if (!credentials) return json(400, { ok: false, error: "invalid_credentials" });

  const accountKey = accountStoreKey(credentials.accountName);
  const existing = await store.getJSON(accountKey);

  if (body.action === "registerAccount") {
    if (existing) return json(409, { ok: false, error: "account_exists" });

    const authToken = createAuthToken();
    const passwordSalt = createPasswordSalt();
    const account = {
      id: await accountId(credentials.accountName),
      accountName: credentials.accountName,
      nickName: credentials.nickName,
      passwordHash: await hashPassword(credentials.accountName, credentials.password, passwordSalt),
      passwordSalt,
      authTokenHash: await hashToken(authToken),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await store.setJSON(accountKey, account);
    await store.setJSON(`account-ids/${account.id}`, credentials.accountName);
    return json(200, { ok: true, storage: "d1", account: publicAccount(account, authToken) });
  }

  if (!existing || !(await verifyPassword(credentials.password, existing))) {
    return json(401, { ok: false, error: "invalid_login" });
  }

  const authToken = createAuthToken();
  if (!existing.passwordSalt) {
    existing.passwordSalt = createPasswordSalt();
    existing.passwordHash = await hashPassword(existing.accountName, credentials.password, existing.passwordSalt);
  }
  existing.authTokenHash = await hashToken(authToken);
  existing.updatedAt = Date.now();
  await store.setJSON(accountKey, existing);
  await store.setJSON(`account-ids/${existing.id}`, existing.accountName);

  return json(200, { ok: true, storage: "d1", account: publicAccount(existing, authToken) });
}

function json(status, payload) {
  return new Response(status === 204 ? "" : JSON.stringify(payload), {
    status,
    headers: CORS_HEADERS,
  });
}

function createStore(env) {
  if (!env || !env.DB) return null;
  return {
    async getJSON(key) {
      const row = await env.DB.prepare("SELECT value FROM kv_store WHERE key = ?").bind(key).first();
      if (!row || typeof row.value !== "string") return null;
      try {
        return JSON.parse(row.value);
      } catch {
        return null;
      }
    },
    async setJSON(key, value) {
      await env.DB.prepare("INSERT OR REPLACE INTO kv_store (key, value, updated_at) VALUES (?, ?, ?)")
        .bind(key, JSON.stringify(value), Date.now())
        .run();
    },
    async delete(key) {
      await env.DB.prepare("DELETE FROM kv_store WHERE key = ?").bind(key).run();
    },
    async listJSON(prefix, limit) {
      const rows = await env.DB.prepare("SELECT value FROM kv_store WHERE key LIKE ? ORDER BY updated_at DESC LIMIT ?")
        .bind(`${prefix}%`, limit)
        .all();
      return (rows.results || []).map((row) => {
        try {
          return JSON.parse(row.value);
        } catch {
          return null;
        }
      });
    },
  };
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
    meta: raw.meta && typeof raw.meta === "object" ? raw.meta : null,
    skins: raw.skins && typeof raw.skins === "object" ? raw.skins : null,
    achievementsState: raw.achievementsState && typeof raw.achievementsState === "object" ? raw.achievementsState : null,
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

async function accountId(accountName) {
  return `acct_${(await sha256(accountName)).slice(0, 24)}`;
}

function accountStoreKey(accountName) {
  return `accounts/${accountName}`;
}

function createPasswordSalt() {
  return randomHex(16);
}

async function hashPassword(accountName, password, salt) {
  return sha256(`${salt}:${accountName}:${password}`);
}

async function legacyHashPassword(accountName, password) {
  return sha256(`${accountName}:${password}`);
}

async function verifyPassword(password, account) {
  const actual = account.passwordSalt
    ? await hashPassword(account.accountName || "", password, account.passwordSalt)
    : await legacyHashPassword(account.accountName || "", password);
  return safeEqualHex(account.passwordHash, actual);
}

function createAuthToken() {
  return randomHex(24);
}

async function hashToken(token) {
  return sha256(String(token || ""));
}

async function verifyToken(token, tokenHash) {
  return safeEqualHex(tokenHash, await hashToken(token));
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

async function canWritePlayer(store, playerId, accountToken) {
  if (!playerId.startsWith("acct_")) return true;
  const accountName = await store.getJSON(`account-ids/${playerId}`);
  if (!accountName) return false;
  const account = await store.getJSON(accountStoreKey(accountName));
  return Boolean(account && (await verifyToken(accountToken, account.authTokenHash)));
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

async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqualHex(left, right) {
  const a = String(left || "");
  const b = String(right || "");
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

import { getStore } from "@netlify/blobs";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "content-type": "application/json; charset=utf-8",
};

const MAX_RANKINGS = 50;
const VALID_ACTIONS = new Set(["syncPlayer", "leaderboard", "resetPlayer"]);

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

  const store = getStore("f1-pixel-garden");

  if (body.action === "syncPlayer") {
    const player = normalizePlayer(body.player);
    if (!player) return json(400, { error: "invalid_player" });

    const weekKey = weeklyKey(player.weekId, player.playerId);
    await store.setJSON(weekKey, player);
    await store.setJSON(`players/${player.playerId}`, player);

    return json(200, { ok: true, player });
  }

  if (body.action === "resetPlayer") {
    const playerId = safeId(body.playerId);
    const weekId = safeWeekId(body.weekId);
    if (!playerId || !weekId) return json(400, { error: "invalid_player" });

    await store.delete(weeklyKey(weekId, playerId));
    await store.delete(`players/${playerId}`);

    return json(200, { ok: true });
  }

  const weekId = safeWeekId(body.weekId);
  if (!weekId) return json(400, { error: "invalid_week" });

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

  return json(200, { ok: true, weekId, rankings });
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: statusCode === 204 ? "" : JSON.stringify(payload),
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

function weeklyKey(weekId, playerId) {
  return `leaderboards/${weekId}/${playerId}`;
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

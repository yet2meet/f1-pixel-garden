import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { onRequest } from "../functions/api/game.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredCoreAssets = [
  "pwa/index.html",
  "pwa/app.js",
  "pwa/styles.css",
  "pwa/sw.js",
  "pwa/manifest.webmanifest",
  "pwa/icons/icon-192.png",
  "pwa/icons/icon-512.png",
  "pwa/icons/apple-touch-icon.png",
];
const driverIds = ["verstappen", "leclerc", "hamilton", "norris", "piastri", "russell", "antonelli", "alonso"];
const portraitExpressions = ["neutral", "tap", "anticipate", "eat", "satisfied", "celebrate", "tired", "depleted"];
const foodIds = [
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function verifyManifest() {
  const manifest = JSON.parse(read("pwa/manifest.webmanifest"));
  assert(manifest.name === "F1 像素庄园", "manifest name mismatch");
  assert(manifest.short_name === "F1庄园", "manifest short_name mismatch");
  assert(manifest.description && manifest.description.includes("F1"), "manifest description missing");
  assert(manifest.start_url === "./index.html", "manifest start_url must be ./index.html");
  assert(manifest.display === "standalone", "manifest display must be standalone");
  assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "manifest icons missing");
  manifest.icons.forEach((icon) => {
    assert(icon.src && exists(path.join("pwa", icon.src.replace(/^\.\//, ""))), `manifest icon missing: ${icon.src}`);
  });
}

function verifyResources() {
  requiredCoreAssets.forEach((asset) => assert(exists(asset), `missing core asset: ${asset}`));
  driverIds.forEach((driverId) => {
    portraitExpressions.forEach((expression, index) => {
      const serial = String(index + 1).padStart(2, "0");
      assert(exists(`pwa/portraits/${driverId}_${serial}_${expression}.png`), `missing portrait: ${driverId}_${serial}_${expression}.png`);
    });
  });
  const index = read("pwa/index.html");
  assert(index.includes('<html lang="zh-CN">'), "index lang must be zh-CN");
  assert(index.includes('rel="manifest"'), "index must reference manifest");
  assert(index.includes("./styles.css"), "index must reference styles.css");
  assert(index.includes("./app.js"), "index must reference app.js");
}

function verifyServiceWorker() {
  const sw = read("pwa/sw.js");
  assert(/f1-pixel-pwa-v\d+/.test(sw), "service worker cache version missing");
  ["./index.html", "./styles.css", "./app.js", "./manifest.webmanifest"].forEach((asset) => {
    assert(sw.includes(asset), `service worker missing ${asset}`);
  });
  const portraitMatches = sw.match(/portraits\/\$\{driver\}_\$\{serial\}_\$\{expression\}\.png/);
  assert(portraitMatches, "service worker must cache generated driver portraits");
  assert(sw.includes("APP_SHELL_URL"), "service worker must define an app shell fallback");
  assert(sw.includes('request.mode === "navigate"'), "service worker must handle offline navigations");
  assert(sw.includes("caches.match(APP_SHELL_URL)"), "service worker must fall back to cached index.html for navigations");
  assert(sw.includes("response.ok"), "service worker must avoid caching failed responses");
}

function createMockD1() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              if (sql.startsWith("SELECT value FROM kv_store WHERE key = ?")) {
                const value = rows.get(args[0]);
                return value === undefined ? null : { value };
              }
              throw new Error(`Unhandled first SQL: ${sql}`);
            },
            async run() {
              if (sql.startsWith("INSERT OR REPLACE INTO kv_store")) {
                rows.set(args[0], args[1]);
                return {};
              }
              if (sql.startsWith("DELETE FROM kv_store WHERE key = ?")) {
                rows.delete(args[0]);
                return {};
              }
              throw new Error(`Unhandled run SQL: ${sql}`);
            },
            async all() {
              if (sql.startsWith("SELECT value FROM kv_store WHERE key LIKE ?")) {
                const prefix = String(args[0]).replace(/%$/, "");
                const limit = Number(args[1]) || 100;
                return {
                  results: [...rows.entries()]
                    .filter(([key]) => key.startsWith(prefix))
                    .slice(0, limit)
                    .map(([, value]) => ({ value })),
                };
              }
              throw new Error(`Unhandled all SQL: ${sql}`);
            },
          };
        },
      };
    },
  };
}

async function apiRaw(env, payload) {
  const response = await onRequest({
    env,
    request: new Request("https://example.test/api/game", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function api(env, payload) {
  const { response, data } = await apiRaw(env, payload);
  assert(response.ok, `${payload.action} failed: ${response.status} ${JSON.stringify(data)}`);
  return data;
}

async function verifyCloudflareApi() {
  const env = { DB: createMockD1() };
  const alice = await api(env, {
    action: "registerAccount",
    accountName: "alice_test",
    password: "pass1234",
    nickName: "Alice",
  });
  const bob = await api(env, {
    action: "registerAccount",
    accountName: "bob_test",
    password: "pass1234",
    nickName: "Bob",
  });
  const aliceAccount = alice.account;
  const bobAccount = bob.account;

  const search = await api(env, {
    action: "searchAccounts",
    playerId: aliceAccount.id,
    accountToken: aliceAccount.authToken,
    query: "bob",
  });
  assert(search.results.some((result) => result.id === bobAccount.id), "account search did not find Bob");

  const friends = await api(env, {
    action: "addFriend",
    playerId: aliceAccount.id,
    accountToken: aliceAccount.authToken,
    friendId: bobAccount.id,
  });
  assert(friends.friends.some((friend) => friend.id === bobAccount.id), "friend add did not persist");

  const savedState = await api(env, {
    action: "saveGameState",
    playerId: aliceAccount.id,
    accountToken: aliceAccount.authToken,
    gameState: {
      player: {
        id: "me",
        driverId: "verstappen",
        nickName: "Alice<script>",
        growth: 10000000,
        treasures: 1000000,
        achievements: ["ach_feed_20", "<bad>", "ach_feed_20"],
        championWeeks: ["2026-W24", "bad-week"],
      },
      feed: {
        weekId: "2026-W24",
        today: "2026-06-10",
        usedFeeds: 500,
        stock: 500,
        weeklyFeed: 999999,
        logs: [{ foodId: "verstappen", value: 999, growthValue: 999, lucky: true }],
      },
      inventory: { items: Object.fromEntries(foodIds.map((foodId) => [foodId, foodId === "verstappen" ? 3 : 0])) },
      gifts: { weekId: "2026-W24", sentThisWeek: 0, records: [] },
      meta: {
        weekId: "2026-W24",
        totalFeeds: 999999999,
        feedStreak: 999999,
        doubleCards: 999,
        weekly: { luckyWheelUsed: 99, campFeedValue: 999999 },
      },
      achievementsState: { unlocked: { ach_feed_20: true, "<script>": true }, claimedTreasures: 999999 },
    },
  });
  assert(savedState.gameState.player.growth === 999999, "saveGameState did not clamp player growth");
  assert(savedState.gameState.player.treasures === 9999, "saveGameState did not clamp treasures");
  assert(savedState.gameState.feed.usedFeeds === 5, "saveGameState did not clamp daily feeds");
  assert(savedState.gameState.feed.stock === 10, "saveGameState did not clamp daily stock");
  assert(savedState.gameState.feed.weeklyFeed === 5000, "saveGameState did not clamp weekly feed");
  assert(savedState.gameState.meta.doubleCards === 10, "saveGameState did not clamp double cards");
  assert(savedState.gameState.achievementsState.claimedTreasures === 9999, "saveGameState did not clamp achievement treasures");
  assert(!Object.keys(savedState.gameState.achievementsState.unlocked).some((key) => key.includes("<")), "saveGameState did not sanitize achievement keys");

  const cloudRankWrite = await api(env, {
    action: "syncPlayer",
    accountToken: aliceAccount.authToken,
    player: {
      playerId: aliceAccount.id,
      weekId: "2026-W24",
      driverId: "verstappen",
      nickName: "Alice",
      driverName: "Max Verstappen",
      team: "Red Bull",
      badge: "MV",
      growth: 120,
      weeklyFeed: 240,
      usedFeeds: 2,
      updatedAt: Date.now(),
    },
  });
  assert(cloudRankWrite.storage === "d1", "cloud account ranking write should use D1");

  const unauthorizedRankWrite = await apiRaw(env, {
    action: "syncPlayer",
    player: {
      playerId: aliceAccount.id,
      weekId: "2026-W24",
      driverId: "verstappen",
      nickName: "Alice",
      driverName: "Max Verstappen",
      team: "Red Bull",
      badge: "MV",
      growth: 120,
      weeklyFeed: 240,
      usedFeeds: 2,
      updatedAt: Date.now(),
    },
  });
  assert(unauthorizedRankWrite.response.status === 401, "cloud ranking write without token should be unauthorized");
  assert(unauthorizedRankWrite.data.error === "unauthorized_player", "unauthorized ranking write returned wrong error");

  const localRankWrite = await api(env, {
    action: "syncPlayer",
    player: {
      playerId: "local_cheat",
      weekId: "2026-W24",
      driverId: "verstappen",
      nickName: "Local Cheat",
      driverName: "Max Verstappen",
      team: "Red Bull",
      badge: "MV",
      growth: 999999,
      weeklyFeed: 5000,
      usedFeeds: 5,
      updatedAt: Date.now(),
    },
  });
  assert(localRankWrite.storage === "volatile", "local ranking write should not persist to cloud storage");

  const leaderboard = await api(env, { action: "leaderboard", weekId: "2026-W24" });
  assert(leaderboard.rankings.some((row) => row.playerId === aliceAccount.id), "cloud ranking write did not appear");
  assert(!leaderboard.rankings.some((row) => row.playerId === "local_cheat"), "local player polluted cloud leaderboard");

  const giftPayload = {
    action: "sendGift",
    playerId: aliceAccount.id,
    accountToken: aliceAccount.authToken,
    receiverId: bobAccount.id,
    foodId: "verstappen",
    quantity: 2,
    weekId: "2026-W24",
    requestId: "gift_duplicate_test_001",
  };
  const gift = await api(env, giftPayload);
  assert(gift.gameState.inventory.items.verstappen === 1, "sendGift did not deduct sender inventory");
  assert(gift.gameState.gifts.sentThisWeek === 1, "sendGift did not count weekly send");

  const duplicateGift = await api(env, giftPayload);
  assert(duplicateGift.duplicate === true, "duplicate sendGift was not marked duplicate");
  assert(duplicateGift.gameState.inventory.items.verstappen === 1, "duplicate sendGift deducted inventory again");
  assert(duplicateGift.gameState.gifts.sentThisWeek === 1, "duplicate sendGift counted weekly send again");

  const bobState = await api(env, {
    action: "loadGameState",
    playerId: bobAccount.id,
    accountToken: bobAccount.authToken,
  });
  assert(bobState.gameState.inventory.items.verstappen === 2, "receiver did not get inbox gift");
}

verifyManifest();
verifyResources();
verifyServiceWorker();
await verifyCloudflareApi();

console.log("Project verification passed");

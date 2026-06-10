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

async function api(env, payload) {
  const response = await onRequest({
    env,
    request: new Request("https://example.test/api/game", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }),
  });
  const data = await response.json().catch(() => ({}));
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

  await api(env, {
    action: "saveGameState",
    playerId: aliceAccount.id,
    accountToken: aliceAccount.authToken,
    gameState: {
      player: { id: "me", driverId: "verstappen", nickName: "Alice", growth: 10 },
      feed: { weekId: "2026-W24", usedFeeds: 0, stock: 5, weeklyFeed: 0 },
      inventory: { items: Object.fromEntries(foodIds.map((foodId) => [foodId, foodId === "verstappen" ? 3 : 0])) },
      gifts: { weekId: "2026-W24", sentThisWeek: 0, records: [] },
    },
  });

  const gift = await api(env, {
    action: "sendGift",
    playerId: aliceAccount.id,
    accountToken: aliceAccount.authToken,
    receiverId: bobAccount.id,
    foodId: "verstappen",
    quantity: 2,
    weekId: "2026-W24",
  });
  assert(gift.gameState.inventory.items.verstappen === 1, "sendGift did not deduct sender inventory");
  assert(gift.gameState.gifts.sentThisWeek === 1, "sendGift did not count weekly send");

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

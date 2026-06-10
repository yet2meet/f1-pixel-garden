const baseUrl = normalizeBaseUrl(process.argv[2]);
const endpointOverride = process.argv[3] || "";

if (!baseUrl) {
  console.error("Usage: npm run api:smoke -- https://<deployed-site> [endpoint]");
  process.exit(1);
}

const apiUrl = endpointOverride || defaultEndpoint(baseUrl);
const runId = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
const weekId = "2026-W24";

function normalizeBaseUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function defaultEndpoint(url) {
  const parsed = new URL(url);
  if (parsed.hostname.endsWith("netlify.app")) return `${url}/.netlify/functions/game`;
  return `${url}/api/game`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function callGameApi(payload, expectedOk = true) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (expectedOk && !response.ok) {
    throw new Error(`${payload.action} failed: ${response.status} ${JSON.stringify(data)}`);
  }
  return { response, data };
}

async function main() {
  const aliceName = `smoke_alice_${runId}`.slice(0, 24);
  const bobName = `smoke_bob_${runId}`.slice(0, 24);
  const password = `pass_${runId}`;

  const alice = (await callGameApi({
    action: "registerAccount",
    accountName: aliceName,
    password,
    nickName: "Smoke Alice",
  })).data.account;
  const bob = (await callGameApi({
    action: "registerAccount",
    accountName: bobName,
    password,
    nickName: "Smoke Bob",
  })).data.account;
  assert(alice?.id && alice?.authToken, "Alice account missing id/authToken");
  assert(bob?.id && bob?.authToken, "Bob account missing id/authToken");

  const search = (await callGameApi({
    action: "searchAccounts",
    playerId: alice.id,
    accountToken: alice.authToken,
    query: bobName.slice(0, 12),
  })).data;
  assert(search.results?.some((account) => account.id === bob.id), "searchAccounts did not find Bob");

  const friends = (await callGameApi({
    action: "addFriend",
    playerId: alice.id,
    accountToken: alice.authToken,
    friendId: bob.id,
  })).data;
  assert(friends.friends?.some((friend) => friend.id === bob.id), "addFriend did not return Bob");

  await callGameApi({
    action: "saveGameState",
    playerId: alice.id,
    accountToken: alice.authToken,
    gameState: {
      player: { id: "me", driverId: "verstappen", nickName: "Smoke Alice", growth: 120 },
      feed: { weekId, today: "2026-06-10", usedFeeds: 0, stock: 5, weeklyFeed: 0, logs: [] },
      inventory: {
        items: {
          verstappen: 4,
          leclerc: 0,
          hamilton: 0,
          norris: 0,
          piastri: 0,
          russell: 0,
          antonelli: 0,
          alonso: 0,
          espresso_gel: 0,
          hydration_pack: 0,
        },
      },
      gifts: { weekId, sentThisWeek: 0, records: [] },
    },
  });

  const giftPayload = {
    action: "sendGift",
    playerId: alice.id,
    accountToken: alice.authToken,
    receiverId: bob.id,
    foodId: "verstappen",
    quantity: 2,
    weekId,
    requestId: `gift_${runId}`,
  };
  const gift = (await callGameApi(giftPayload)).data;
  assert(gift.gameState?.inventory?.items?.verstappen === 2, "sendGift did not deduct Alice inventory");
  assert(gift.gameState?.gifts?.sentThisWeek === 1, "sendGift did not increment weekly gift count");

  const duplicateGift = (await callGameApi(giftPayload)).data;
  assert(duplicateGift.duplicate === true, "duplicate sendGift was not marked duplicate");
  assert(duplicateGift.gameState?.inventory?.items?.verstappen === 2, "duplicate sendGift deducted inventory again");

  const bobState = (await callGameApi({
    action: "loadGameState",
    playerId: bob.id,
    accountToken: bob.authToken,
  })).data.gameState;
  assert(bobState?.inventory?.items?.verstappen === 2, "Bob did not receive gift");
  assert(bobState?.gifts?.records?.some((record) => record.direction === "received"), "Bob gift log missing received record");

  console.log(JSON.stringify({
    ok: true,
    apiUrl,
    accounts: {
      alice: alice.accountName,
      bob: bob.accountName,
    },
    verified: [
      "registerAccount",
      "searchAccounts",
      "addFriend",
      "saveGameState",
      "sendGift",
      "duplicate sendGift",
      "loadGameState receiver inbox",
    ],
  }, null, 2));
}

main().catch((error) => {
  console.error(`API smoke failed for ${apiUrl}: ${error.message}`);
  process.exit(1);
});

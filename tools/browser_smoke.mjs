import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const baseUrl = process.argv[2] || "http://127.0.0.1:4173";
const debugPort = Number(process.env.CDP_PORT || 9227);
const screenshotDir = process.env.SMOKE_SCREENSHOT_DIR || path.join(os.tmpdir(), "f1-pixel-smoke");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findBrowser() {
  const candidates = [
    process.env.BROWSER_PATH,
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function waitForDebugger(port) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      return await fetchJson(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  throw new Error("browser debugger did not start");
}

async function openTarget(port, url) {
  try {
    return await fetchJson(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  } catch {
    const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
    const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
    if (!page) throw new Error("no debuggable page target");
    return page;
  }
}

class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
  }

  async open() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => this.handleMessage(event));
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || "CDP command failed"));
      else resolve(message.result || {});
      return;
    }
    if (message.method && this.listeners.has(message.method)) {
      this.listeners.get(message.method).forEach((listener) => listener(message.params || {}));
    }
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 10000).unref?.();
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) || [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  close() {
    this.ws?.close();
  }
}

async function main() {
  const browserPath = findBrowser();
  assert(browserPath, "Chrome or Edge executable not found. Set BROWSER_PATH to run smoke tests.");
  assert(typeof WebSocket === "function", "Current Node runtime does not provide WebSocket");

  fs.mkdirSync(screenshotDir, { recursive: true });
  const profileDir = path.join(os.tmpdir(), `f1-pixel-profile-${Date.now()}`);
  const browser = spawn(browserPath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  const runtimeEvents = [];
  let cdp;
  try {
    await waitForDebugger(debugPort);
    const target = await openTarget(debugPort, `${baseUrl}/`);
    cdp = new CdpSession(target.webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("Log.enable");
    cdp.on("Runtime.exceptionThrown", (params) => {
      runtimeEvents.push({ type: "exception", text: params.exceptionDetails?.text || "runtime exception" });
    });
    cdp.on("Log.entryAdded", (params) => {
      if (params.entry?.level === "error") runtimeEvents.push({ type: "log", text: params.entry.text });
    });
    cdp.on("Runtime.consoleAPICalled", (params) => {
      if (params.type === "error") {
        runtimeEvents.push({ type: "console", text: params.args?.map((arg) => arg.value || arg.description).join(" ") });
      }
    });

    const desktop = await runViewport(cdp, "desktop", 1180, 820, false);
    const mobile = await runViewport(cdp, "mobile", 390, 844, true);
    const economy = await runEconomyCheck(cdp);
    const cloudAuthMigration = await runCloudAuthMigrationCheck(cdp);

    const severeEvents = runtimeEvents.filter((event) => {
      const text = String(event.text || "");
      if (text.includes("501 (Unsupported method")) return false;
      if (text.includes("405 ()")) return false;
      if (text.includes("404 (") || text.includes("404 ()")) return false;
      return !text.includes("/api/game");
    });
    assert(severeEvents.length === 0, `browser runtime errors: ${JSON.stringify(severeEvents)}`);

    console.log(JSON.stringify({ desktop, mobile, economy, cloudAuthMigration, runtimeEvents: severeEvents, screenshotDir }, null, 2));
  } finally {
    cdp?.close();
    browser.kill();
    await sleep(400);
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

async function runEconomyCheck(cdp) {
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

  await cdp.send("Page.navigate", { url: `${baseUrl}/?economy=${Date.now()}` });
  await waitForApp(cdp);
  await evaluate(cdp, `(() => {
    localStorage.clear();
    const now = Date.now();
    localStorage.setItem("f1_pixel_pwa_player", JSON.stringify({
      id: "me",
      nickName: "Economy Smoke",
      driverId: "verstappen",
      growth: 40,
      treasures: 0,
      achievements: [],
      championWeeks: [],
      createdAt: now,
      updatedAt: now
    }));
    localStorage.setItem("f1_pixel_pwa_food_inventory", JSON.stringify({ items: {} }));
    return true;
  })()`);
  await cdp.send("Page.navigate", { url: `${baseUrl}/?economy=${Date.now()}-daily` });
  await waitForApp(cdp);
  await waitUntil(cdp, `(() => {
    const inventory = JSON.parse(localStorage.getItem("f1_pixel_pwa_food_inventory") || "{}");
    return Boolean(inventory.lastDailyReward);
  })()`);
  const dailyFirst = await readEconomyState(cdp, foodIds);

  await cdp.send("Page.navigate", { url: `${baseUrl}/?economy=${Date.now()}-daily-repeat` });
  await waitForApp(cdp);
  const dailySecond = await readEconomyState(cdp, foodIds);
  assert(dailyFirst.totalFood === 1, `daily reward should grant exactly one food, got ${dailyFirst.totalFood}`);
  assert(dailySecond.totalFood === dailyFirst.totalFood, "daily reward repeated after same-day reload");
  assert(dailySecond.lastDailyReward === dailyFirst.lastDailyReward, "daily reward date changed after same-day reload");

  await evaluate(cdp, `(() => {
    const today = new Date();
    const todayKey = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    const foodIds = ${JSON.stringify(foodIds)};
    const items = Object.fromEntries(foodIds.map((foodId) => [foodId, 1]));
    const now = Date.now();
    localStorage.setItem("f1_pixel_pwa_player", JSON.stringify({
      id: "me",
      nickName: "Economy Smoke",
      driverId: "verstappen",
      growth: 40,
      treasures: 0,
      achievements: [],
      championWeeks: [],
      createdAt: now,
      updatedAt: now
    }));
    localStorage.setItem("f1_pixel_pwa_food_inventory", JSON.stringify({ items, lastDailyReward: todayKey }));
    return true;
  })()`);
  await cdp.send("Page.navigate", { url: `${baseUrl}/?economy=${Date.now()}-redeem` });
  await waitForApp(cdp);
  await click(cdp, '[data-view="warehouse"]');
  await waitForSelector(cdp, ".warehouse-main");
  await click(cdp, '[data-action="redeemCollection"]');
  await waitUntil(cdp, `(() => {
    const player = JSON.parse(localStorage.getItem("f1_pixel_pwa_player") || "{}");
    const inventory = JSON.parse(localStorage.getItem("f1_pixel_pwa_food_inventory") || "{}");
    const items = inventory.items || {};
    return player.treasures === 10 && player.achievements?.includes("gold_foodie") &&
      ${JSON.stringify(foodIds)}.every((foodId) => items[foodId] === 0);
  })()`);
  const redeemed = await readEconomyState(cdp, foodIds);
  assert(redeemed.treasures === 10, "collection redeem did not grant treasures");
  assert(redeemed.hasGoldFoodie, "collection redeem did not unlock gold_foodie");
  assert(redeemed.totalFood === 0, "collection redeem did not consume all food types");

  return { dailyFirst, dailySecond, redeemed };
}

async function readEconomyState(cdp, foodIds) {
  return evaluate(cdp, `(() => {
    const foodIds = ${JSON.stringify(foodIds)};
    const inventory = JSON.parse(localStorage.getItem("f1_pixel_pwa_food_inventory") || "{}");
    const player = JSON.parse(localStorage.getItem("f1_pixel_pwa_player") || "{}");
    const items = inventory.items || {};
    return {
      totalFood: foodIds.reduce((sum, foodId) => sum + (Number(items[foodId]) || 0), 0),
      counts: Object.fromEntries(foodIds.map((foodId) => [foodId, Number(items[foodId]) || 0])),
      lastDailyReward: inventory.lastDailyReward || "",
      treasures: Number(player.treasures) || 0,
      hasGoldFoodie: Array.isArray(player.achievements) && player.achievements.includes("gold_foodie")
    };
  })()`);
}

async function runCloudAuthMigrationCheck(cdp) {
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => {
      const nativeFetch = window.fetch.bind(window);
      window.__gameApiCalls = [];
      window.fetch = async (input, init = {}) => {
        const url = String(input && input.url ? input.url : input);
        if (!url.includes("/api/game") && !url.includes("/.netlify/functions/game")) {
          return nativeFetch(input, init);
        }
        let body = {};
        try {
          body = JSON.parse(init.body || "{}");
        } catch {}
        window.__gameApiCalls.push(body);
        const account = {
          id: "acct_browser_smoke",
          accountName: body.accountName || "cloud_smoke",
          nickName: body.nickName || "Cloud Smoke",
          authToken: "token_browser_smoke"
        };
        let status = 200;
        let payload = { ok: true, storage: "d1" };
        if (body.action === "registerAccount" || body.action === "loginAccount") {
          payload = { ok: true, storage: "d1", account };
        } else if (body.action === "loadGameState") {
          payload = { ok: true, storage: "d1", gameState: null };
        } else if (body.action === "listFriends") {
          payload = { ok: true, storage: "d1", friends: [] };
        } else if (body.action === "saveGameState") {
          payload = { ok: true, storage: "d1", gameState: body.gameState };
        } else if (body.action === "syncPlayer") {
          payload = { ok: true, storage: "d1", player: body.player };
        } else if (body.action === "leaderboard") {
          payload = { ok: true, storage: "d1", weekId: body.weekId, rankings: [] };
        } else {
          status = 400;
          payload = { ok: false, error: "invalid_action" };
        }
        return new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });
      };
    })();`,
  });

  await cdp.send("Page.navigate", { url: `${baseUrl}/?cloud-auth=${Date.now()}` });
  await waitForApp(cdp);
  await evaluate(cdp, `(() => {
    localStorage.clear();
    const now = Date.now();
    localStorage.setItem("f1_pixel_pwa_player", JSON.stringify({
      id: "me",
      nickName: "Guest Progress",
      driverId: "verstappen",
      growth: 88,
      treasures: 3,
      achievements: [],
      championWeeks: [],
      createdAt: now,
      updatedAt: now
    }));
    localStorage.setItem("f1_pixel_pwa_feed", JSON.stringify({
      today: "2026-06-11",
      weekId: "2026-W24",
      usedFeeds: 1,
      stock: 4,
      weeklyFeed: 20,
      logs: []
    }));
    localStorage.setItem("f1_pixel_pwa_food_inventory", JSON.stringify({
      items: { verstappen: 2, leclerc: 1 }
    }));
    return true;
  })()`);
  await cdp.send("Page.navigate", { url: `${baseUrl}/?cloud-auth=${Date.now()}-seeded` });
  await waitForApp(cdp);
  await waitUntil(cdp, `(() => window.__gameApiCalls && window.__gameApiCalls.some((call) => call.action === "leaderboard"))()`);

  await click(cdp, '[data-view="settings"]');
  await waitForSelector(cdp, ".settings-main");
  await evaluate(cdp, `(() => {
    const setInput = (selector, value) => {
      const node = document.querySelector(selector);
      node.value = value;
      node.dispatchEvent(new Event("input", { bubbles: true }));
    };
    setInput("[data-auth-account]", "cloud_smoke");
    setInput("[data-auth-nickname]", "Cloud Smoke");
    setInput("[data-auth-password]", "pass1234");
    return true;
  })()`);
  await click(cdp, '[data-view="settings"]');
  await waitUntil(cdp, `(() =>
    document.querySelector("[data-auth-account]")?.value === "cloud_smoke" &&
    document.querySelector("[data-auth-password]")?.value === "pass1234"
  )()`);
  await click(cdp, '[data-action="registerAccount"]');
  await waitUntil(cdp, `(() => window.__gameApiCalls && window.__gameApiCalls.some((call) => call.action === "saveGameState"))()`);

  const metrics = await evaluate(cdp, `(() => {
    const calls = window.__gameApiCalls || [];
    const saved = calls.find((call) => call.action === "saveGameState");
    const account = JSON.parse(localStorage.getItem("f1_pixel_pwa_account") || "null");
    const scopedPlayer = JSON.parse(localStorage.getItem("f1_pixel_pwa_player_acct_browser_smoke") || "null");
    return {
      actions: calls.map((call) => call.action),
      accountId: account?.id || "",
      savedGrowth: saved?.gameState?.player?.growth || 0,
      savedNickName: saved?.gameState?.player?.nickName || "",
      savedFood: saved?.gameState?.inventory?.items?.verstappen || 0,
      scopedGrowth: scopedPlayer?.growth || 0,
      syncState: document.querySelector(".sync-state")?.textContent || ""
    };
  })()`);
  assert(metrics.accountId === "acct_browser_smoke", "cloud auth migration did not save cloud account");
  assert(metrics.savedGrowth === 88, "cloud auth migration did not upload guest growth");
  assert(metrics.savedFood === 2, "cloud auth migration did not upload guest inventory");
  assert(metrics.scopedGrowth === 88, "cloud auth migration did not scope guest player");
  return metrics;
}

async function runViewport(cdp, label, width, height, mobile) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile,
  });
  await cdp.send("Page.navigate", { url: `${baseUrl}/?smoke=${Date.now()}-${label}` });
  await waitForApp(cdp);
  await evaluate(cdp, "localStorage.clear(); true");
  await cdp.send("Page.navigate", { url: `${baseUrl}/?smoke=${Date.now()}-${label}-clean` });
  await waitForApp(cdp);

  const selectMetrics = await evaluate(cdp, `(() => ({
    titleOk: document.body.innerText.includes("F1 像素庄园"),
    driverTiles: document.querySelectorAll("[data-select]").length,
    overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  }))()`);
  assert(selectMetrics.titleOk, `${label}: title text missing`);
  assert(selectMetrics.driverTiles === 8, `${label}: expected 8 driver tiles`);
  assert(selectMetrics.overflowX <= 2, `${label}: select view has horizontal overflow ${selectMetrics.overflowX}`);

  await click(cdp, "[data-bind]");
  await waitForSelector(cdp, ".home-main");
  await waitUntil(cdp, `(() => {
    const portrait = document.querySelector("[data-home-portrait]");
    return Boolean(portrait && portrait.naturalWidth > 0 && portrait.naturalHeight > 0);
  })()`);
  const homeMetrics = await evaluate(cdp, `(() => {
    const portrait = document.querySelector("[data-home-portrait]");
    const agenda = document.querySelector(".agenda-strip");
    const actions = document.querySelector(".home-main > .actions");
    const toast = document.querySelector(".toast");
    const agendaRect = agenda?.getBoundingClientRect();
    const actionsRect = actions?.getBoundingClientRect();
    const toastRect = toast?.getBoundingClientRect();
    const toastClearOfActions = !toastRect || !actionsRect ||
      toastRect.bottom <= actionsRect.top ||
      toastRect.top >= actionsRect.bottom ||
      toastRect.right <= actionsRect.left ||
      toastRect.left >= actionsRect.right;
    return {
      tabCount: document.querySelectorAll(".tabbar button").length,
      portraitNatural: portrait ? [portrait.naturalWidth, portrait.naturalHeight] : [0, 0],
      feedButton: Boolean(document.querySelector('[data-action="openFeedPicker"]')),
      agendaItems: document.querySelectorAll(".agenda-item").length,
      agendaBeforeActions: agendaRect && actionsRect ? agendaRect.bottom <= actionsRect.top + 2 : false,
      toastClearOfActions,
      overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    };
  })()`);
  assert(homeMetrics.tabCount === 7, `${label}: tabbar should have 7 tabs`);
  assert(homeMetrics.portraitNatural[0] > 0 && homeMetrics.portraitNatural[1] > 0, `${label}: driver portrait did not load`);
  assert(homeMetrics.feedButton, `${label}: feed button missing`);
  assert(homeMetrics.agendaItems === 3, `${label}: daily agenda should have 3 items`);
  assert(homeMetrics.agendaBeforeActions, `${label}: daily agenda overlaps home actions`);
  assert(homeMetrics.toastClearOfActions, `${label}: toast overlaps home actions`);
  assert(homeMetrics.overflowX <= 2, `${label}: home view has horizontal overflow ${homeMetrics.overflowX}`);
  await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false })
    .then((shot) => fs.writeFileSync(path.join(screenshotDir, `${label}-home.png`), Buffer.from(shot.data, "base64")));

  await click(cdp, '[data-action="openFeedPicker"]');
  await waitForSelector(cdp, ".feed-picker");
  await sleep(420);
  const feedMetrics = await evaluate(cdp, `(() => ({
    feedChoices: document.querySelectorAll(".feed-food").length,
    confirmDisabled: document.querySelector('[data-action="confirmFeed"]')?.disabled || false,
    modalBottom: Math.round(document.querySelector(".feed-picker").getBoundingClientRect().bottom),
    viewportHeight: window.innerHeight
  }))()`);
  assert(feedMetrics.feedChoices === 11, `${label}: expected basic stock plus 10 foods`);
  assert(!feedMetrics.confirmDisabled, `${label}: feed confirm should be enabled after daily stock`);
  assert(feedMetrics.modalBottom <= feedMetrics.viewportHeight + 2, `${label}: feed picker exceeds viewport`);
  await click(cdp, '[data-action="closeFeedPicker"]');
  await waitForGone(cdp, ".feed-picker");

  await click(cdp, '[data-view="warehouse"]');
  await waitForSelector(cdp, ".warehouse-main");
  const noFriendWarehouseMetrics = await evaluate(cdp, `(() => ({
    foodCards: document.querySelectorAll(".food-card").length,
    giftButtons: document.querySelectorAll("[data-gift]").length,
    overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  }))()`);
  assert(noFriendWarehouseMetrics.foodCards === 10, `${label}: expected 10 food cards without friends`);
  assert(noFriendWarehouseMetrics.giftButtons === 0, `${label}: gift buttons should be hidden without friends`);
  assert(noFriendWarehouseMetrics.overflowX <= 2, `${label}: no-friend warehouse view has horizontal overflow ${noFriendWarehouseMetrics.overflowX}`);

  await seedGiftState(cdp);
  await click(cdp, '[data-view="home"]');
  await waitForSelector(cdp, ".home-main");
  await click(cdp, '[data-view="warehouse"]');
  await waitForSelector(cdp, ".warehouse-main");
  const warehouseMetrics = await evaluate(cdp, `(() => ({
    foodCards: document.querySelectorAll(".food-card").length,
    giftButtons: document.querySelectorAll("[data-gift]").length,
    overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  }))()`);
  assert(warehouseMetrics.foodCards === 10, `${label}: expected 10 food cards`);
  assert(warehouseMetrics.giftButtons === 10, `${label}: gift buttons should appear when a friend exists`);
  assert(warehouseMetrics.overflowX <= 2, `${label}: warehouse view has horizontal overflow ${warehouseMetrics.overflowX}`);
  await click(cdp, '[data-gift="verstappen"]');
  await waitForSelector(cdp, ".gift-modal");
  await sleep(420);
  const giftModal = await evaluate(cdp, `(() => ({
    hasConfirm: Boolean(document.querySelector('[data-action="confirmGift"]')),
    modalBottom: Math.round(document.querySelector(".gift-modal").getBoundingClientRect().bottom),
    viewportHeight: window.innerHeight
  }))()`);
  assert(giftModal.hasConfirm, `${label}: gift modal confirm missing`);
  assert(giftModal.modalBottom <= giftModal.viewportHeight + 2, `${label}: gift modal exceeds viewport`);

  await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false })
    .then((shot) => fs.writeFileSync(path.join(screenshotDir, `${label}.png`), Buffer.from(shot.data, "base64")));

  await click(cdp, '[data-action="cancelGift"]');
  await waitForGone(cdp, ".gift-modal");

  const tabViews = ["training", "museum", "leaderboard", "achievements", "settings"];
  const tabMetrics = {};
  for (const view of tabViews) {
    await click(cdp, `[data-view="${view}"]`);
    await sleep(120);
    tabMetrics[view] = await evaluate(cdp, `(() => ({
      mainClass: document.querySelector("main")?.className || "",
      visibleButtons: document.querySelectorAll("button").length,
      hasRankSummary: Boolean(document.querySelector(".rank-summary")),
      hasSyncState: Boolean(document.querySelector(".sync-state")),
      overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    }))()`);
    assert(tabMetrics[view].mainClass.includes(`${view}-main`) || view === "settings", `${label}: ${view} did not render expected main`);
    assert(tabMetrics[view].overflowX <= 2, `${label}: ${view} view has horizontal overflow ${tabMetrics[view].overflowX}`);
  }
  assert(tabMetrics.leaderboard.hasRankSummary, `${label}: leaderboard rank summary missing`);
  assert(tabMetrics.settings.hasSyncState, `${label}: settings sync state missing`);
  assert(await evaluate(cdp, `document.body.innerText.includes("安装")`), `${label}: install section missing`);

  return { selectMetrics, homeMetrics, feedMetrics, noFriendWarehouseMetrics, warehouseMetrics, giftModal, tabMetrics };
}

async function seedGiftState(cdp) {
  await evaluate(cdp, `(() => {
    const inventory = JSON.parse(localStorage.getItem("f1_pixel_pwa_food_inventory") || '{"items":{}}');
    inventory.items = inventory.items || {};
    inventory.items.verstappen = 3;
    localStorage.setItem("f1_pixel_pwa_food_inventory", JSON.stringify(inventory));
    localStorage.setItem("f1_pixel_pwa_friends", JSON.stringify({
      friends: [{ id: "local_friend", accountName: "friend", nickName: "Friend" }]
    }));
    return true;
  })()`);
}

async function waitForApp(cdp) {
  await waitUntil(cdp, `["interactive", "complete"].includes(document.readyState) && Boolean(document.querySelector("#app .tabbar"))`);
}

async function waitForSelector(cdp, selector) {
  await waitUntil(cdp, `Boolean(document.querySelector(${JSON.stringify(selector)}))`);
}

async function waitForGone(cdp, selector) {
  await waitUntil(cdp, `!document.querySelector(${JSON.stringify(selector)})`);
}

async function waitUntil(cdp, expression) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (await evaluate(cdp, expression)) return;
    await sleep(120);
  }
  const pageState = await evaluate(cdp, `(() => ({
    href: location.href,
    readyState: document.readyState,
    title: document.title,
    apiCalls: (window.__gameApiCalls || []).map((call) => call.action),
    authButtons: [...document.querySelectorAll("[data-action$='Account']")].map((button) => ({
      action: button.dataset.action,
      disabled: button.disabled,
      text: button.textContent
    })),
    body: (document.body?.innerText || "").slice(0, 600),
    html: document.documentElement.outerHTML.slice(0, 600)
  }))()`).catch((error) => ({ error: error.message }));
  throw new Error(`timed out waiting for: ${expression}; page=${JSON.stringify(pageState)}`);
}

async function click(cdp, selector) {
  const clicked = await evaluate(cdp, `(() => {
    const node = document.querySelector(${JSON.stringify(selector)});
    if (!node || node.disabled) return false;
    node.click();
    return true;
  })()`);
  assert(clicked, `click failed: ${selector}`);
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return result.result?.value;
}

await main();

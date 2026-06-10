import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function matchTomlString(source, key) {
  const match = source.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, "m"));
  return match ? match[1] : "";
}

function main() {
  const wrangler = read("wrangler.toml");
  const schema = read("schema.sql");
  const cloudflareFunction = read("functions/api/game.js");
  const packageJson = JSON.parse(read("package.json"));

  const name = matchTomlString(wrangler, "name");
  const outputDir = matchTomlString(wrangler, "pages_build_output_dir");
  const databaseName = matchTomlString(wrangler, "database_name");
  const databaseId = matchTomlString(wrangler, "database_id");

  assert(name === "f1-pixel-garden", "wrangler.toml name must be f1-pixel-garden");
  assert(outputDir === "pwa", "wrangler.toml pages_build_output_dir must be pwa");
  assert(wrangler.includes('binding = "DB"'), "wrangler.toml must bind D1 as DB");
  assert(databaseName === "f1-pixel-garden", "wrangler.toml database_name must be f1-pixel-garden");
  assert(databaseId && !databaseId.includes("REPLACE_WITH"), "wrangler.toml database_id is still a placeholder");
  assert(schema.includes("CREATE TABLE IF NOT EXISTS kv_store"), "schema.sql must create kv_store");
  assert(schema.includes("idx_kv_store_updated_at"), "schema.sql must create updated_at index");
  assert(cloudflareFunction.includes("export async function onRequest"), "Cloudflare function must export onRequest");
  assert(cloudflareFunction.includes("sendGift"), "Cloudflare function must include social gift flow");
  assert(packageJson.scripts?.["cf:d1:init"], "package.json missing cf:d1:init script");
  assert(packageJson.scripts?.["cf:deploy"], "package.json missing cf:deploy script");

  console.log(JSON.stringify({
    ok: true,
    project: name,
    outputDir,
    d1: {
      binding: "DB",
      databaseName,
      databaseId,
    },
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`Cloudflare config check failed: ${error.message}`);
  process.exit(1);
}

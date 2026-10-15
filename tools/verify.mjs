import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFile(path.join(root, file), "utf8");
const json = async (file) => JSON.parse(await read(file));
const biblioteca = await json("data/biblioteca.json");
assert.equal(biblioteca.items.length, 1087);
const ids = new Set(biblioteca.items.map((x) => x.id));
assert.equal(ids.size, biblioteca.items.length);
for (const item of biblioteca.items) {
  assert.ok(item.title && item.source && item.collection, item.id);
  for (const link of item.links || [])
    assert.ok(/^https?:\/\//.test(link.url), item.id);
}
const programme = await json("data/programa.json");
assert.equal(programme.modules.length, 12);
assert.equal(programme.units.length, 36);
const modules = new Set(programme.modules.map((x) => x.id));
for (const unit of programme.units)
  assert.ok(modules.has(unit.moduleId), unit.id);
const media = await json("data/recursos-multimedia.json");
assert.equal(media.resources.length, 26);
for (const item of media.resources) {
  assert.ok(new URL(item.url).protocol === "https:", item.id);
  for (const id of item.cuidotecaIds)
    assert.ok(ids.has(id), `${item.id}: ${id}`);
  assert.ok(item.license?.decision, item.id);
}
const manifest = await json("assets/audio/manifest.json");
const musicFiles = ["piano-meditation", "piano-luminous"];
for (const [i, item] of manifest.music.entries()) {
  const bytes = await fs.readFile(
    path.join(root, "assets/audio", musicFiles[i], "audio.mp3"),
  );
  assert.equal(createHash("sha256").update(bytes).digest("hex"), item.sha256);
  assert.equal(bytes.length, item.bytes);
  assert.equal(item.license, "CC BY 4.0");
}
for (const item of manifest.narrations)
  assert.equal(item.playback, "local-tts");
for (const file of await fs.readdir(path.join(root, "assets/v2"))) {
  if (!file.endsWith(".js")) continue;
  const syntax = spawnSync(
    process.execPath,
    ["--check", path.join(root, "assets/v2", file)],
    { encoding: "utf8" },
  );
  assert.equal(syntax.status, 0, syntax.stderr);
  const source = await read("assets/v2/" + file);
  for (const [, relative] of source.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g))
    await fs.access(path.resolve(root, "assets/v2", relative));
}
const html = await read("index.html");
for (const [, asset] of html.matchAll(
  /(?:src|href)="((?:assets\/|manifest\.)[^"]+)"/g,
))
  await fs.access(path.join(root, asset));
assert.ok(!html.includes("mailto:"));
assert.ok(html.includes("Content-Security-Policy"));
console.log(
  "Verified: 1,087 entries, 36 units, 26 resources, music checksums, module syntax and local asset references.",
);

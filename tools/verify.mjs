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
const scriptFiles = [];
for (const directory of ["assets/v2", "assets/v3"]) {
  for (const file of await fs.readdir(path.join(root, directory))) {
    if (file.endsWith(".js")) scriptFiles.push(path.join(directory, file));
  }
}
for (const file of scriptFiles) {
  const syntax = spawnSync(
    process.execPath,
    ["--check", path.join(root, file)],
    { encoding: "utf8" },
  );
  assert.equal(syntax.status, 0, syntax.stderr);
  const source = await read(file);
  for (const [, relative] of source.matchAll(
    /(?:from\s*|import\s*\(\s*|import\s*)['"](\.{1,2}\/[^'"]+)['"]/g,
  )) {
    const target = path.resolve(root, path.dirname(file), relative);
    assert.ok(
      target.startsWith(root + path.sep),
      `${file}: import outside app`,
    );
    await fs.access(target);
  }
}
const html = await read("index.html");
const serviceWorker = await read("sw.js");
const coreSection = serviceWorker.match(
  /const CORE_FILES\s*=\s*\[([\s\S]*?)\];/,
);
assert.ok(coreSection, "service worker core list");
const coreFiles = [...coreSection[1].matchAll(/['"]([^'"]*)['"]/g)].map(
  (x) => x[1],
);
assert.equal(
  new Set(coreFiles).size,
  coreFiles.length,
  "offline assets must be unique",
);
for (const file of coreFiles)
  await fs.access(path.join(root, file || "index.html"));
for (const file of scriptFiles)
  assert.ok(coreFiles.includes(file), `module omitted offline: ${file}`);
for (const [, asset] of html.matchAll(
  /(?:src|href)="((?:assets\/|manifest\.)[^"]+)"/g,
)) {
  await fs.access(path.join(root, asset));
  assert.ok(coreFiles.includes(asset), `entry asset omitted offline: ${asset}`);
}
assert.ok(!html.includes("mailto:"));
assert.ok(html.includes("Content-Security-Policy"));
console.log(
  `Verified: 1,087 entries, 36 units, 26 resources, music checksums, ${scriptFiles.length} v2/v3 modules, ${coreFiles.length} offline assets and local references.`,
);

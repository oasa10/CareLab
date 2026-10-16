import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fresh, validate } from "../assets/v2/store.js";
import { SENSITIVE_RESOURCE_IDS, librarySafetyNotice, hasSensitiveSources } from "../assets/v3/library-safety.js";
import { feedbackEndpoint } from "../assets/v2/feedback-config.js";

test("markers require explicit consent and migration never removes records", () => {
  const old = fresh();
  assert.equal(old.settings.gamification, false);
  old.completed = ["u01"];
  old.practice = ["reparto"];
  old.settings.gamification = true;
  delete old.settings.gamificationChoice;
  let next = validate(old);
  assert.equal(next.settings.gamification, false);
  assert.deepEqual(next.completed, old.completed);
  assert.deepEqual(next.practice, old.practice);
  next.settings.gamificationChoice = true;
  next.settings.gamification = true;
  assert.equal(validate(JSON.parse(JSON.stringify(next))).settings.gamification, true);
  next.settings.gamification = false;
  assert.equal(validate(next).settings.gamification, false);
});
test("sensitive source notices resolve and do not recommend an exercise", async () => {
  const data = JSON.parse(await fs.readFile(new URL("../data/biblioteca.json", import.meta.url)));
  for (const id of SENSITIVE_RESOURCE_IDS) {
    if (id !== "p12") assert.ok(data.items.some(x => x.id === id), id);
    assert.match(librarySafetyNotice(id), /#\/ayuda/);
    assert.doesNotMatch(librarySafetyNotice(id), /#\/tool/);
  }
  assert.ok(hasSensitiveSources(["AC06"]));
  assert.equal(librarySafetyNotice("unknown"), "");
});
test("external inbox is off and the entry page permits only same-origin requests", async () => {
  assert.equal(feedbackEndpoint, "");
  const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /connect-src 'self';/);
  assert.doesNotMatch(html, /carelab-sugerencias|mailto:/);
  const app = await fs.readFile(new URL("../assets/v2/app.js", import.meta.url), "utf8");
  assert.doesNotMatch(app, /mountFeedback\(/);
  assert.match(app, /mountEvaluation\(view\)/);
});

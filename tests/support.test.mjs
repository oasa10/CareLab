import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { HELP_TOPICS, PROCEDURES, SHARED_SUPPORT_NOTICE, mountHelp, mountProcedures, selectSupportResources } from "../assets/v3/support.js";

const data = JSON.parse(await fs.readFile(new URL("../data/apoyos.json", import.meta.url), "utf8"));
const mock = () => ({ innerHTML: "" });

test("urgent signposting is present without loading the directory or making a choice", () => {
  for (const id of ["", "unknown", ...HELP_TOPICS.map((item) => item.id)]) {
    const container = mock();
    mountHelp(container, id);
    assert.match(container.innerHTML, /href="tel:112"/);
    assert.match(container.innerHTML, /CareLab no recibe avisos ni puede enviar ayuda/);
    assert.match(container.innerHTML, /revisión clínica externa.*pendiente/);
    assert.match(container.innerHTML, /STOP/);
    for (const [, number] of container.innerHTML.matchAll(/href="tel:([^"]+)"/g)) assert.match(number, /^\d{3}(\d{6})?$/);
    assert.doesNotMatch(container.innerHTML, /oai_link_source|<form|<input|<textarea/);
  }
});

test("restored direct routes use the verified number and keep support outside ordinary exercises", () => {
  const expected = { suicidio: "024", violencia: "016", menores: "900202010", salud: "900203050" };
  for (const [id, number] of Object.entries(expected)) {
    const container = mock(); mountHelp(container, id);
    assert.ok(container.innerHTML.includes(`href="tel:${number}"`));
  }
  const violence = mock(); mountHelp(violence, "violencia");
  assert.match(violence.innerHTML, /href="https:\/\/wa.me\/34600000016"/);
  assert.match(violence.innerHTML, /900840111/);
  assert.match(violence.innerHTML, /historial del teléfono/);
  const suicidal = mock(); mountHelp(suicidal, "suicidio");
  assert.match(suicidal.innerHTML, /href="https:\/\/www2.cruzroja.es\/web\/cruzroja\/chat-linea024"/);
});

test("each main panel has no more than forty words", () => {
  for (const topic of [...HELP_TOPICS, ...PROCEDURES]) assert.ok(topic.text.trim().split(/\s+/).length <= 40, topic.id || topic.title);
  assert.ok(SHARED_SUPPORT_NOTICE.trim().split(/\s+/).length <= 40);
});

test("the directory keeps a verified source and usable contacts for every selected service", () => {
  assert.equal(data.checkedAt, "2026-10-16");
  assert.equal(data.clinicalReview.status, "pendiente");
  const ids = new Set(data.resources.map((item) => item.id));
  assert.equal(ids.size, data.resources.length);
  for (const [key, region] of Object.entries(data.regions)) {
    assert.equal(new Set(region.ids).size, region.ids.length);
    assert.equal(selectSupportResources(data, key).items.length, region.ids.length);
    for (const id of region.ids) assert.ok(ids.has(id), `${key}: ${id}`);
  }
  for (const item of data.resources) {
    assert.equal(new URL(item.source).protocol, "https:");
    if (item.phone) assert.match(item.phone, /^\d{3}(\d{6})?$/);
  }
  for (const region of ["unknown", "__proto__", "constructor", ""]) assert.equal(selectSupportResources(data, region).region, "euskadi");
});

test("core telephone facts in the fixed page and directory agree", () => {
  for (const topic of HELP_TOPICS) {
    for (const action of topic.actions.filter((item) => item.type === "phone")) {
      assert.ok(data.resources.some((item) => item.phone === action.number), topic.id);
    }
  }
});

test("procedures do not promise immediate legal entitlements and point to the official dated source", () => {
  const container = mock(); mountProcedures(container);
  assert.match(container.innerHTML, /23 de octubre de 2026/);
  assert.match(container.innerHTML, /no significa que exista una prestación individual inmediata/);
  assert.match(container.innerHTML, /BOE-A-2026-20528/);
  assert.match(container.innerHTML, /#\/tool\/economia/);
  assert.doesNotMatch(container.innerHTML, /<form|<input|<textarea|mailto:/);
});

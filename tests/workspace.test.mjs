import test from "node:test";
import assert from "node:assert/strict";
import * as Store from "../assets/v2/store.js";
const episode = () => ({
  id: "example",
  title: "Preparar un relevo",
  tool: "plan",
  owner: "Yo",
  due: "Cuando lo acordemos",
  status: "propuesto",
  fields: {
    bb_version: "1.2",
    bb_rev_como: "Conversación acordada",
    bb_rev_procedencia: "Declaración",
  },
  createdAt: "",
  updatedAt: "",
});
test("BrainBox and independent return survive export/restore without claiming verification", () => {
  const s = Store.fresh();
  s.actions.push(episode());
  s.reviews.push({
    id: "review",
    actionId: "example",
    date: "",
    note: "Todavía falta acordarlo",
    fields: { done: "no-ocurrio", origin: "declarado" },
  });
  const result = Store.validate(JSON.parse(JSON.stringify(s)));
  assert.equal(result.actions[0].fields.bb_rev_como, "Conversación acordada");
  assert.equal(result.reviews[0].result, "Todavía no lo sé");
  assert.equal(result.reviews[0].fields.origin, "declarado");
});
test("Invalid restore never replaces the existing workspace", () => {
  const before = Store.get();
  assert.throws(() => Store.restore({ schema: 999 }));
  assert.equal(Store.get(), before);
});
test("Rejects duplicate action IDs rather than combining plans", () => {
  const s = Store.fresh();
  s.actions.push(episode(), episode());
  assert.throws(() => Store.validate(s), /repetidos/);
});
test("Rejects oversized fields instead of silently truncating plans", () => {
  const s = Store.fresh();
  const a = episode();
  a.fields.action = "a".repeat(4001);
  s.actions.push(a);
  assert.throws(() => Store.validate(s), /recortará/);
});
test("Rejects unsafe keys and unknown tools", () => {
  const s = Store.fresh();
  const a = episode();
  s.actions.push(a);
  a.fields = JSON.parse('{"__proto__":"attack"}');
  assert.throws(() => Store.validate(s), /no válido/);
  a.fields = {};
  a.tool = "constructor";
  assert.throws(() => Store.validate(s), /no reconocida/);
});
test("A theme choice is valid only among the three supported options", () => {
  for (const theme of ["system", "dark", "light"]) {
    const s = Store.fresh();
    s.settings.theme = theme;
    assert.equal(Store.validate(s).settings.theme, theme);
  }
  const s = Store.fresh();
  s.settings.theme = "unknown";
  assert.throws(() => Store.validate(s));
});

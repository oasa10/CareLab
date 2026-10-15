import test from "node:test";
import assert from "node:assert/strict";

class StorageDouble {
  data = new Map();
  failRead = false;
  failWrite = false;
  failRemove = false;
  getItem(key) {
    if (this.failRead) throw new Error("Denied");
    return this.data.get(key) ?? null;
  }
  setItem(key, value) {
    if (this.failWrite) throw new Error("QuotaExceededError");
    this.data.set(key, String(value));
  }
  removeItem(key) {
    if (this.failRemove) throw new Error("Denied");
    this.data.delete(key);
  }
}
let instance = 0;
const load = async (
  session = new StorageDouble(),
  local = new StorageDouble(),
) => {
  globalThis.sessionStorage = session;
  globalThis.localStorage = local;
  const store = await import(`../assets/v2/store.js?test=${++instance}`);
  return { store, session, local };
};
const action = () => ({
  id: "action-1",
  title: "Acordar una ayuda",
  tool: "plan",
  owner: "Yo",
  due: "Al hablar",
  status: "propuesto",
  fields: { bb_version: "1.2", bb_rev_como: "Conversación" },
  createdAt: "",
  updatedAt: "",
});
const journeySession = () => ({
  id: "session-1",
  title: "Una responsabilidad concreta",
  scenario: "relevo",
  step: 7,
  returnStep: 2,
  status: "planned",
  actionId: "action-1",
  fields: {
    situation: "Texto propio, sin información clínica.",
    sap_senal: "Una tarea pendiente",
    sap_accion: "Pedir ayuda",
    sap_proposito: "Compartir la organización",
    contraste: "Dato declarado",
    action: "Conversar",
    return_observation: "Todavía no ocurrió",
    narrative: "Revisar la expectativa",
    before_observation: "Mi observación anterior",
    before_source: "Anotación propia",
    c0: "opcion-b",
  },
  createdAt: "2026-10-15T10:00:00.000Z",
  updatedAt: "2026-10-15T10:01:00.000Z",
  completedAt: "",
});
function fill(store) {
  const state = store.get();
  state.profile = "familia";
  state.actions = [action()];
  state.reviews = [
    {
      id: "return-1",
      date: "",
      actionId: "action-1",
      result: "Todavía no lo sé",
      note: "Pendiente",
      next: "Volver a conversar",
      fields: { origin: "declarado" },
    },
  ];
  state.journey = {
    version: 1,
    onboarded: true,
    currentId: "session-1",
    sessions: [journeySession()],
  };
  return state;
}

test("Default session recovers every touched journey field after a module reload, without opting into localStorage", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.save();
  assert.equal(local.getItem(store.KEY), null);
  assert.equal(store.isPersistent(), false);
  assert.equal(store.getStorageStatus().mode, "session");
  const before = store.exportSnapshot();
  const next = (await load(session, local)).store;
  assert.deepEqual(next.exportSnapshot(), before);
  assert.equal(next.get().journey.sessions[0].step, 7);
  assert.equal(next.getStorageStatus().recoverable, true);
});
test("Existing opted-in schema2 device data migrates with an empty journey and retains episodes and returns", async () => {
  const { store, session, local } = await load();
  fill(store);
  const old = store.exportSnapshot();
  delete old.journey;
  local.setItem(store.KEY, JSON.stringify(old));
  const next = (await load(session, local)).store;
  assert.equal(next.isPersistent(), true);
  assert.deepEqual(next.get().actions, old.actions);
  assert.deepEqual(next.get().reviews, old.reviews);
  assert.deepEqual(next.get().journey, {
    version: 1,
    onboarded: false,
    currentId: "",
    sessions: [],
  });
  assert.equal(local.getItem(store.KEY), JSON.stringify(old));
});
test("Device opt-in is explicit and subsequent reload recovers the latest device version", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.save();
  assert.equal(store.enable(), true);
  store.get().journey.sessions[0].fields.narrative = "Texto actualizado";
  store.save();
  assert.equal(store.getStorageStatus().deviceSaved, true);
  assert.equal(
    (await load(session, local)).store.get().journey.sessions[0].fields
      .narrative,
    "Texto actualizado",
  );
});
test("Disabling device storage keeps a recoverable tab copy, including full journey state", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  assert.equal(store.disable(), true);
  assert.equal(local.getItem(store.KEY), null);
  assert.equal(store.isPersistent(), false);
  const next = (await load(session, local)).store;
  assert.equal(
    next.get().journey.sessions[0].fields.sap_proposito,
    "Compartir la organización",
  );
  assert.equal(next.isPersistent(), false);
});
test("A session-mode tab never silently imports another tab device copy", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.save();
  const other = store.fresh();
  other.profile = "profesional";
  local.setItem(store.KEY, JSON.stringify(other));
  const next = (await load(session, local)).store;
  assert.equal(next.get().profile, "familia");
  assert.equal(next.isPersistent(), false);
  next.save();
  assert.equal(JSON.parse(local.getItem(store.KEY)).profile, "profesional");
});
test("Local quota failure preserves old device copy and latest recoverable session with an accurate warning", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  const previous = local.getItem(store.KEY);
  local.failWrite = true;
  store.get().journey.sessions[0].fields.action = "Cambio nuevo";
  store.save();
  assert.equal(local.getItem(store.KEY), previous);
  assert.equal(store.isPersistent(), false);
  assert.equal(store.getStorageStatus().recoverable, true);
  assert.equal(store.getStorageStatus().deviceSaved, false);
  assert.match(store.takeError(), /dispositivo/);
  local.failWrite = false;
  assert.equal(
    (await load(session, local)).store.get().journey.sessions[0].fields.action,
    "Cambio nuevo",
  );
});
test("Session quota failure leaves the old snapshot intact and declares unsaved changes", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.save();
  const previous = session.getItem(store.SESSION_KEY);
  session.failWrite = true;
  store.get().journey.sessions[0].fields.action = "Texto todavía en memoria";
  store.save();
  assert.equal(session.getItem(store.SESSION_KEY), previous);
  assert.equal(
    store.get().journey.sessions[0].fields.action,
    "Texto todavía en memoria",
  );
  assert.equal(store.getStorageStatus().hasUnstoredChanges, true);
  assert.equal(store.getStorageStatus().mode, "memory");
  assert.equal(local.getItem(store.KEY), null);
  assert.match(store.takeError(), /exporta/);
});
test("Denied storage does not crash or erase the live workspace", async () => {
  const session = new StorageDouble(),
    local = new StorageDouble();
  session.failRead =
    session.failWrite =
    local.failRead =
    local.failWrite =
      true;
  const { store } = await load(session, local);
  fill(store);
  store.save();
  assert.equal(store.get().actions.length, 1);
  assert.equal(store.getStorageStatus().recoverable, false);
  assert.equal(store.getStorageStatus().hasUnstoredChanges, true);
  assert.match(store.takeError(), /recarga/);
});
test("Valid JSON backup restores all old and new fields to a recoverable session", async () => {
  const { store, session, local } = await load();
  fill(store);
  const backup = JSON.parse(JSON.stringify(store.exportSnapshot()));
  const target = (await load(new StorageDouble(), new StorageDouble())).store;
  target.restore(backup);
  assert.deepEqual(target.get().journey, backup.journey);
  assert.deepEqual(target.get().reviews, backup.reviews);
  assert.deepEqual(target.get().actions, backup.actions);
  assert.equal(target.getStorageStatus().mode, "session");
});
test("Malformed restore is atomic for memory and both stored copies", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  const state = store.get(),
    s = session.getItem(store.SESSION_KEY),
    l = local.getItem(store.KEY);
  const broken = store.exportSnapshot();
  broken.journey.sessions[0].fields.action = 42;
  assert.throws(() => store.restore(broken), /texto/);
  assert.equal(store.get(), state);
  assert.equal(session.getItem(store.SESSION_KEY), s);
  assert.equal(local.getItem(store.KEY), l);
});
test("Session restore quota failure never replaces the old memory or snapshot", async () => {
  const { store, session } = await load();
  fill(store);
  store.save();
  const state = store.get(),
    raw = session.getItem(store.SESSION_KEY);
  session.failWrite = true;
  const candidate = store.fresh();
  candidate.profile = "multiple";
  assert.throws(() => store.restore(candidate), /se conservan/);
  assert.equal(store.get(), state);
  assert.equal(session.getItem(store.SESSION_KEY), raw);
});
test("Device restore quota failure never replaces old memory, device copy or session", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  const state = store.get(),
    s = session.getItem(store.SESSION_KEY),
    l = local.getItem(store.KEY);
  local.failWrite = true;
  assert.throws(() => store.restore(store.fresh()), /se conservan/);
  assert.equal(store.get(), state);
  assert.equal(session.getItem(store.SESSION_KEY), s);
  assert.equal(local.getItem(store.KEY), l);
});
test("A device restore remains recoverable if its optional session mirror cannot be written", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  const next = store.fresh();
  next.profile = "multiple";
  session.failWrite = true;
  store.restore(next);
  assert.equal(store.get().profile, "multiple");
  assert.equal(store.getStorageStatus().deviceSaved, true);
  assert.equal((await load(session, local)).store.get().profile, "multiple");
});
test("Session limits and malformed choices reject data rather than dropping or truncating answers", async () => {
  const { store } = await load();
  fill(store);
  for (const mutate of [
    (s) => (s.version = 2),
    (s) => (s.sessions[0].step = 13),
    (s) => (s.sessions[0].returnStep = -1),
    (s) => (s.sessions[0].scenario = "unknown"),
    (s) => (s.sessions[0].status = "complete"),
    (s) => (s.sessions[0].title = "a".repeat(221)),
    (s) => (s.sessions[0].fields.note = "a".repeat(4001)),
    (s) =>
      (s.sessions[0].fields = Object.fromEntries(
        Array.from({ length: 61 }, (_, i) => ["field" + i, "a"]),
      )),
    (s) => s.sessions.push(structuredClone(s.sessions[0])),
    (s) => (s.currentId = "missing"),
    (s) => (s.sessions[0].unexpected = "must not disappear"),
    (s) => (s.sessions[0].fields = JSON.parse('{"__proto__":"unsafe"}')),
  ]) {
    const candidate = store.exportSnapshot();
    mutate(candidate.journey);
    assert.throws(() => store.validate(candidate));
  }
  const large = store.exportSnapshot();
  large.journey.sessions = Array.from({ length: 101 }, (_, i) => ({
    ...journeySession(),
    id: "s" + i,
  }));
  assert.throws(() => store.validate(large), /100 sesiones/);
});
test("Removing a linked plan severs the link in live and serialized journey state without removing any session text", async () => {
  const { store, session } = await load();
  fill(store);
  store.get().actions = [];
  store.save();
  assert.equal(store.get().journey.sessions[0].actionId, "");
  assert.equal(store.get().journey.sessions[0].fields.action, "Conversar");
  assert.equal(
    JSON.parse(session.getItem(store.SESSION_KEY)).workspace.journey.sessions[0]
      .actionId,
    "",
  );
});
test("A changed device copy from another tab is not overwritten by a stale tab save", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  const other = store.fresh();
  other.profile = "profesional";
  const raw = JSON.stringify(other);
  local.setItem(store.KEY, raw);
  store.get().journey.sessions[0].fields.action = "Cambio de esta pestaña";
  store.save();
  assert.equal(local.getItem(store.KEY), raw);
  assert.equal(store.isPersistent(), false);
  assert.equal(store.getStorageStatus().recoverable, true);
  assert.match(store.takeError(), /otra pestaña/);
  assert.equal(
    (await load(session, local)).store.get().journey.sessions[0].fields.action,
    "Cambio de esta pestaña",
  );
});
test("Corrupt device data is retained and never overwritten by default session autosave", async () => {
  const session = new StorageDouble(),
    local = new StorageDouble();
  local.setItem("carelab:v2:workspace", "{bad");
  const { store } = await load(session, local);
  fill(store);
  store.save();
  assert.equal(local.getItem(store.KEY), "{bad");
  assert.equal(store.getStorageStatus().mode, "session");
});
test("Corrupt session is preserved until an explicit restore successfully replaces it", async () => {
  const session = new StorageDouble();
  session.setItem("carelab:v3:session", "{bad");
  const { store } = await load(session);
  fill(store);
  store.save();
  assert.equal(session.getItem(store.SESSION_KEY), "{bad");
  assert.equal(store.getStorageStatus().hasUnstoredChanges, true);
  const candidate = store.exportSnapshot();
  store.restore(candidate);
  assert.equal(
    JSON.parse(session.getItem(store.SESSION_KEY)).workspace.journey.sessions
      .length,
    1,
  );
  assert.equal(store.getStorageStatus().mode, "session");
});
test("Disabling does not remove the only device copy when session creation fails", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  const raw = local.getItem(store.KEY);
  session.failWrite = true;
  assert.equal(store.disable(), false);
  assert.equal(store.isPersistent(), true);
  assert.equal(local.getItem(store.KEY), raw);
});
test("Failed device removal rolls back the session mode and reports unsuccessful disable", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  const s = session.getItem(store.SESSION_KEY),
    l = local.getItem(store.KEY);
  local.failRemove = true;
  assert.equal(store.disable(), false);
  assert.equal(store.isPersistent(), true);
  assert.equal(session.getItem(store.SESSION_KEY), s);
  assert.equal(local.getItem(store.KEY), l);
});
test("Reset removes both CareLab snapshots and leaves unrelated keys intact", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  session.setItem("other", "keep");
  local.setItem("other", "keep");
  assert.equal(store.reset(), true);
  assert.equal(session.getItem(store.SESSION_KEY), null);
  assert.equal(local.getItem(store.KEY), null);
  assert.equal(session.getItem("other"), "keep");
  assert.equal(local.getItem("other"), "keep");
  assert.deepEqual(store.get().journey.sessions, []);
  assert.equal(store.isPersistent(), false);
});
test("Failed reset does not clear memory and restores the removed device snapshot", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.enable();
  const state = store.get(),
    l = local.getItem(store.KEY),
    s = session.getItem(store.SESSION_KEY);
  session.failRemove = true;
  assert.equal(store.reset(), false);
  assert.equal(store.get(), state);
  assert.equal(local.getItem(store.KEY), l);
  assert.equal(session.getItem(store.SESSION_KEY), s);
});
test("Unsubmitted legacy tool and BrainBox drafts survive session reload and validated JSON backup", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.get().drafts.tools["consulta/action-1"] = {
    title: "Borrador distinto",
    owner: "Yo",
    due: "Después",
    status: "propuesto",
    fields: {
      title: "Borrador distinto",
      situation: "Texto no añadido al plan",
      action: "Concertar",
      scope: "organizacion",
    },
  };
  store.get().drafts.brainbox.new = {
    draft: {
      title: "En construcción",
      owner: "Yo",
      status: "propuesto",
      bb_siento: "Cansancio cotidiano",
      bb_saber: "Falta contrastar",
      bb_stage: "3",
    },
    stage: 3,
    entered: true,
  };
  store.save();
  const backup = store.exportSnapshot();
  const next = (await load(session, local)).store;
  assert.deepEqual(next.get().drafts, backup.drafts);
  assert.deepEqual(
    next.validate(JSON.parse(JSON.stringify(backup))).drafts,
    backup.drafts,
  );
});
test("Malformed or oversized drafts fail atomic restore rather than silently dropping user text", async () => {
  const { store, session } = await load();
  fill(store);
  store.save();
  const before = store.get(),
    raw = session.getItem(store.SESSION_KEY);
  for (const mutate of [
    (s) => (s.tools["unknown/"] = { fields: {} }),
    (s) => (s.tools["consulta/bad/id"] = { fields: {} }),
    (s) => (s.tools["consulta/"] = { title: "x".repeat(221) }),
    (s) => (s.brainbox.new = { stage: 7, draft: {} }),
    (s) => (s.brainbox.new = { stage: 1, draft: { bb_siento: 5 } }),
    (s) =>
      (s.brainbox.new = { stage: 1, draft: { bb_siento: "x".repeat(4001) } }),
    (s) =>
      (s.brainbox.new = {
        stage: 1,
        draft: {},
        saved: { id: "unexpected-duplicate" },
      }),
    (s) => (s.brainbox = JSON.parse('{"__proto__":{"draft":{},"stage":0}}')),
  ]) {
    const candidate = store.exportSnapshot();
    mutate(candidate.drafts);
    assert.throws(() => store.restore(candidate));
    assert.equal(store.get(), before);
    assert.equal(session.getItem(store.SESSION_KEY), raw);
  }
});

test("Unsubmitted support and return forms preserve fields and checkbox state through reload and backup", async () => {
  const { store, session, local } = await load();
  fill(store);
  store.get().drafts.forms["person/new"] = {
    name: "Hermana",
    help: "Una gestión concreta",
    availability: "Por acordar",
    accepted: "false",
  };
  store.get().drafts.forms["review/action-1"] = {
    note: "Retorno aún sin confirmar",
    done: "no-observado",
    result: "Todavía no lo sé",
    origin: "declarado",
    next: "Volver a preguntar",
  };
  store.save();
  const next = (await load(session, local)).store;
  assert.deepEqual(next.get().drafts.forms, store.get().drafts.forms);
  assert.deepEqual(
    next.validate(next.exportSnapshot()).drafts.forms,
    next.get().drafts.forms,
  );
});
test("Malformed form contexts, unexpected fields and oversize drafts reject restore without changing live data", async () => {
  const { store, session } = await load();
  fill(store);
  store.save();
  const before = store.get(),
    raw = session.getItem(store.SESSION_KEY);
  for (const forms of [
    { "feedback/new": { message: "excluded" } },
    { "person/new": { accepted: "on" } },
    { "person/new": { name: "a".repeat(501) } },
    { "review/action/id": { note: "bad" } },
    { "review/new": { note: "a".repeat(4001) } },
    { "person/new": { diagnosis: "excluded" } },
  ]) {
    const candidate = store.exportSnapshot();
    candidate.drafts.forms = forms;
    assert.throws(() => store.restore(candidate));
    assert.equal(store.get(), before);
    assert.equal(session.getItem(store.SESSION_KEY), raw);
  }
});

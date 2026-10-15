import test from "node:test";
import assert from "node:assert/strict";
import * as J from "../assets/v3/journey.js";
import * as C from "../assets/v3/journey-content.js";
import * as S from "../assets/v2/store.js";

test("four scenarios and individual contrast", () => {
  assert.equal(Object.keys(C.SCENARIOS).length, 4);
  for (const s of Object.values(C.SCENARIOS))
    for (let i = 0; i < 3; i++) {
      assert(J.contrastFeedback(s.id, i, s.contrast[i].kind).matches);
      assert(!J.contrastFeedback(s.id, i, "other").matches);
      assert(J.contrastFeedback(s.id, i, "other").explanation.length > 70);
    }
});
test("canonical saber both faces and optional descent repair", () => {
  assert.deepEqual(
    C.KNOWING.map((x) => x.title),
    ["Ruido", "Datos", "Información", "Conocimiento", "Entendimiento"],
  );
  assert.deepEqual(
    C.KNOWING.map((x) => x.down),
    [
      "Punto de partida",
      "Pseudodato",
      "Desinformación",
      "Pseudoconocimiento",
      "Insensatez",
    ],
  );
  assert.equal(J.moveKnowledge("0", -1), "0");
  assert.equal(J.moveKnowledge("4", 1), "4");
  assert.equal(J.moveKnowledge(J.moveKnowledge("1", 1), -1), "1");
});
test("canonical hacer with two pending terms", () => {
  assert.deepEqual(
    C.DOING.map((x) => x.title),
    [
      "Aptitud",
      "Habilidad",
      "Destreza",
      "Competencia",
      "Experiencia cultivada",
    ],
  );
  assert.equal(
    C.DOING.filter((x) => x.down === "Nombre pendiente en 1.2").length,
    2,
  );
});
for (const scenario of Object.keys(C.SCENARIOS))
  test("valid action and store roundtrip " + scenario, () => {
    const s = J.newLivingSession(scenario);
    assert(!s.fields.before_observation);
    assert(!s.fields.feeling);
    const a = J.buildLivingAction(s);
    assert.equal(a.status, "propuesto");
    assert(Object.keys(a.fields).length <= 30);
    const state = S.fresh();
    state.actions.push(a);
    s.actionId = a.id;
    state.journey = {
      version: 1,
      onboarded: false,
      currentId: s.id,
      sessions: [s],
    };
    const restored = S.validate(state);
    assert.equal(restored.journey.sessions[0].scenario, scenario);
    assert.equal(restored.actions[0].status, "propuesto");
  });
test("return before doing cannot invent success", () => {
  const s = J.newLivingSession("relevo");
  s.fields.return_done = "no";
  s.fields.return_worth = "ayudo";
  const r = J.buildLivingReturn(s);
  assert.equal(r.result, "No pude probarlo");
  assert(r.fields.bb_hizo.includes("no pude"));
  assert.equal(r.fields.bb_disponibilidad, "No ocurrió");
  assert(!r.note.includes("mejoré"));
});
test("not observed and not disclosed remain different", () => {
  const s = J.newLivingSession("mente");
  s.fields.return_source = "no_visto";
  assert.equal(J.buildLivingReturn(s).fields.bb_disponibilidad, "No lo vimos");
  s.fields.return_source = "reservado";
  assert.equal(
    J.buildLivingReturn(s).fields.bb_disponibilidad,
    "No desea contarlo",
  );
  s.fields.return_observation = "texto reservado";
  assert(!J.buildLivingReturn(s).fields.bb_paso.includes("texto reservado"));
});
test("declared evidence never silently verified; long observations retained", () => {
  const s = J.newLivingSession("pausa");
  s.fields.before_observation = "A".repeat(4000);
  s.fields.return_observation = "B".repeat(4000);
  s.fields.return_source = "registro";
  const r = J.buildLivingReturn(s);
  assert(r.note.length <= 4000);
  assert.equal(r.fields.bb_antes.length, 4000);
  assert.equal(r.fields.bb_paso.length, 4000);
  assert.equal(r.fields.bb_procedencia, "Declarado por la persona usuaria");
  assert(Object.keys(r.fields).length <= 20);
});
test("cycle is self described, not a person score", () => {
  const f = { turn1: "peor", turn2: "mejor", turn3: "sin_observar" };
  const before = JSON.stringify(f);
  assert(J.cycleReflection(f).includes("faltan"));
  assert.equal(JSON.stringify(f), before);
  assert(
    J.cycleReflection({ turn1: "peor", turn2: "peor", turn3: "peor" }).includes(
      "no define a ninguna persona",
    ),
  );
});

test("inherited or unknown scenario names cannot create or inspect a journey", () => {
  for (const name of [
    "constructor",
    "__proto__",
    "toString",
    "hasOwnProperty",
    "missing",
    "",
    null,
    undefined,
  ]) {
    assert.throws(
      () => J.newLivingSession(name),
      /Elige una situación disponible/,
    );
    assert.equal(J.contrastFeedback(name, 0, "hecho"), null);
  }
  assert.equal(J.contrastFeedback("relevo", -1, "hecho"), null);
  assert.equal(J.contrastFeedback("relevo", 3, "hecho"), null);
  assert.equal(J.contrastFeedback("relevo", "constructor", "hecho"), null);
});

test("each scenario has three distinct narrative lenses with two explained options", () => {
  for (const id of Object.keys(C.SCENARIOS)) {
    const lenses = C.NARRATIVE_LENSES[id];
    for (const key of ["reframe", "context", "meaning"]) {
      assert.equal(lenses[key].length, 2);
      assert.equal(new Set(lenses[key].map((x) => x[0])).size, 2);
      for (const option of lenses[key]) {
        assert(option[1].length > 50);
        assert(option[2].length > 70);
      }
    }
  }
});

test("chosen narrative lenses remain provisional and never change observation fields", () => {
  for (const scenario of Object.keys(C.SCENARIOS)) {
    const session = J.newLivingSession(scenario),
      f = session.fields,
      lenses = C.NARRATIVE_LENSES[scenario];
    Object.assign(f, {
      thought: "Una interpretación inicial",
      before_observation: "Una observación antes",
      return_observation: "Una observación después",
      return_source: "yo",
      narrative_mode: "explorar",
    });
    for (const key of ["reframe", "context", "meaning"])
      f["narrative_" + key] = lenses[key][0][0];
    const before = JSON.stringify(session),
      review = J.buildLivingReturn(session);
    assert(
      review.fields.bb_relato.includes(
        "no son observaciones ni explicaciones verificadas",
      ),
    );
    assert(review.fields.bb_relato.includes("Reencuadre:"));
    assert(review.fields.bb_relato.includes("Recontextualización:"));
    assert(review.fields.bb_relato.includes("Resignificación:"));
    assert.equal(review.fields.bb_antes, "Una observación antes");
    assert.equal(review.fields.bb_paso, "Una observación después");
    assert.equal(JSON.stringify(session), before);
    assert.equal(Object.keys(review.fields).length, 20);
  }
});

test("keeping observations without a new account suppresses previously selected lenses", () => {
  const s = J.newLivingSession("relevo");
  Object.assign(s.fields, {
    narrative_mode: "conservar",
    narrative_reframe: "peticion",
    narrative_context: "condiciones",
    narrative_meaning: "ensayo",
    after_story: "Una interpretación que decidí no añadir",
  });
  const r = J.buildLivingReturn(s);
  assert.equal(
    r.fields.bb_relato,
    "Conservo lo observado sin añadir un nuevo relato.",
  );
  assert.equal(r.fields.bb_lentes, "");
  assert(!r.note.includes("Una interpretación que decidí no añadir"));
  assert.equal(s.fields.after_story, "Una interpretación que decidí no añadir");
});

test("long personal narrative and chosen lenses remain intact within backup field limits", () => {
  const s = J.newLivingSession("relevo");
  Object.assign(s.fields, {
    narrative_mode: "explorar",
    narrative_reframe: "peticion",
    narrative_context: "condiciones",
    narrative_meaning: "ensayo",
    after_story: "A".repeat(4000),
  });
  const r = J.buildLivingReturn(s);
  assert.equal(r.fields.bb_relato, s.fields.after_story);
  assert(r.fields.bb_lentes.includes("Reencuadre:"));
  assert(r.fields.bb_lentes.includes("Recontextualización:"));
  assert(r.fields.bb_lentes.includes("Resignificación:"));
  const state = S.fresh(),
    a = J.buildLivingAction(s);
  s.actionId = a.id;
  r.actionId = a.id;
  state.actions.push(a);
  state.reviews.push(r);
  state.journey.sessions.push(s);
  state.journey.currentId = s.id;
  const v = S.validate(state);
  assert.equal(v.reviews[0].fields.bb_relato.length, 4000);
});

test("a fully populated session, including every optional lens, fits all backup limits", () => {
  const s = J.newLivingSession("relevo");
  Object.assign(s.fields, {
    scope: "cotidiano",
    route: "apoyo",
    feeling: "Cansancio",
    automatic: "Lo hago yo sin preguntar",
    thought: "Una interpretación",
    c0: "hecho",
    c1: "supuesto",
    c2: "experiencia",
    inversion_choice: "adoptar",
    before_observation: "A".repeat(4000),
    rehearsal_choice: "1",
    barrier: "B".repeat(4000),
    story_mode: "propia",
    story: "C".repeat(4000),
    paused_reason: "Una pausa",
    previous_session: "previous-episode",
    previous_narrative: "Una lectura anterior",
    previous_lenses: "Miradas anteriores provisionales",
    return_done: "hecho",
    return_observation: "D".repeat(4000),
    return_source: "yo",
    return_worth: "incierto",
    return_cost: "Por comprobar",
    return_alignment: "No comparo",
    return_attribution: "No puedo atribuirlo",
    turn1: "mejor",
    turn2: "igual",
    turn3: "sin_observar",
    cycle_type: "insuficiente",
    decision: "indagar",
    decision_note: "Una pregunta siguiente",
    after_story: "E".repeat(4000),
    review_id: "review-complete",
    narrative_mode: "explorar",
    narrative_reframe: "peticion",
    narrative_context: "condiciones",
    narrative_meaning: "ensayo",
  });
  for (const key of [
    "action",
    "message",
    "who",
    "when",
    "support",
    "stop",
    "observe",
    "procedure",
    "criterion",
    "return_when",
    "return_who",
    "before_source",
    "unknown",
  ])
    s.fields[key] = "Z".repeat(4000);
  const original = JSON.stringify(s.fields),
    a = J.buildLivingAction(s);
  s.actionId = a.id;
  const r = J.buildLivingReturn(s);
  assert.equal(Object.keys(s.fields).length, 55);
  assert(Object.keys(a.fields).length <= 30);
  assert.equal(Object.keys(r.fields).length, 20);
  for (const value of [...Object.values(a.fields), ...Object.values(r.fields)])
    assert(value.length <= 4000);
  assert(a.owner.length <= 500);
  assert(a.due.length <= 500);
  assert.equal(a.fields.action, s.fields.action);
  assert.equal(a.fields.bb_nota_instrumento, s.fields.message);
  assert.equal(r.fields.bb_antes, s.fields.before_observation);
  assert.equal(r.fields.bb_paso, s.fields.return_observation);
  assert.equal(r.fields.bb_relato, s.fields.after_story);
  assert.equal(JSON.stringify(s.fields), original);
  const state = S.fresh();
  state.actions.push(a);
  state.reviews.push(r);
  state.journey.sessions.push(s);
  state.journey.currentId = s.id;
  const restored = S.validate(state);
  assert.deepEqual(restored.journey.sessions[0].fields, s.fields);
  assert(restored.actions[0].fields.bb_saber.includes("#/vivir/" + s.id));
});

test("a withheld return is not silently copied into the next observation", () => {
  for (const flags of [
    { return_done: "reservado" },
    { return_source: "reservado" },
    { return_done: "reservado", return_source: "reservado" },
  ]) {
    const previous = J.newLivingSession("relevo");
    Object.assign(previous.fields, {
      return_done: "hecho",
      return_source: "yo",
      return_observation: "Una observación privada que no quiero contar",
      ...flags,
    });
    const before = JSON.stringify(previous),
      next = J.buildLivingContinuation(previous),
      review = J.buildLivingReturn(previous);
    assert.equal(next.before_observation, "");
    assert.equal(
      next.before_source,
      "No traslado una observación que elegí no contar.",
    );
    assert(!JSON.stringify(next).includes(previous.fields.return_observation));
    assert(!review.fields.bb_paso.includes(previous.fields.return_observation));
    assert.equal(JSON.stringify(previous), before);
  }
  const previous = J.newLivingSession("relevo");
  Object.assign(previous.fields, {
    return_done: "hecho",
    return_source: "yo",
    return_observation: "Una observación que sí cuento",
  });
  assert.equal(
    J.buildLivingContinuation(previous).before_observation,
    previous.fields.return_observation,
  );
});

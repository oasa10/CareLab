import {
  SCENARIOS,
  KNOWING,
  DOING,
  KINDS,
  ROUTES,
  DECISIONS,
  CYCLE_TYPES,
  SOURCE,
  NARRATIVE_LENSES,
} from "./journey-content.js";
const escape = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const idOf = () =>
  globalThis.crypto?.randomUUID?.() ||
  `living-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const time = () => new Date().toISOString();
const mounted = new WeakMap();
const maxSessions = 100;
const hasScenario = (id) =>
  typeof id === "string" && Object.hasOwn(SCENARIOS, id);
const relatedNeeds = {
  relevo: "reparto",
  mente: "comprender",
  pausa: "descanso",
  limites: "limites",
};
export const LIVING_STEPS = [
  "Antes de empezar",
  "Una sola situación",
  "Lo que siento",
  "Lo que me sale",
  "Lo que pienso",
  "El giro",
  "Hasta dónde sé",
  "Ensayar un hacer",
  "Mi propuesta",
  "Preparar la vuelta",
  "Una historia abierta",
  "Salir a probar",
];
const axes = [
  "Límites",
  "Situar",
  "I · Ser",
  "I · Ser",
  "I → II",
  "II · Saber",
  "II · Saber",
  "III · Hacer",
  "III · Hacer",
  "Retorno previsto",
  "IV · Creer / Crear",
  "Fuera de la pantalla",
];
export function contrastFeedback(scenario, index, choice) {
  const card =
    hasScenario(scenario) && Number.isInteger(index)
      ? SCENARIOS[scenario].contrast[index]
      : null;
  if (!card) return null;
  return {
    matches: card.kind === choice,
    kind: card.kind,
    explanation: card.why,
  };
}
export function moveKnowledge(level, delta) {
  const current = Number(level);
  return String(
    Math.max(
      0,
      Math.min(
        KNOWING.length - 1,
        (Number.isInteger(current) ? current : 0) + delta,
      ),
    ),
  );
}
export function cycleReflection(fields) {
  const turns = [fields.turn1, fields.turn2, fields.turn3],
    complete = turns.every((x) => ["mejor", "igual", "peor"].includes(x));
  if (!complete)
    return "Todavía faltan observaciones de tres vueltas reales. Puedes dejar el ciclo sin clasificar.";
  if (turns.every((x) => x === "mejor"))
    return "Has descrito tres vueltas que mejoran. Si eliges «sano», se refiere a estas interacciones y a este contexto.";
  if (turns.every((x) => x === "peor"))
    return "Has descrito tres vueltas que empeoran. Puedes revisar qué señal se refuerza; no define a ninguna persona.";
  return "Has descrito vueltas mezcladas o sin cambio. La etiqueta es secundaria: elige qué condición revisar.";
}
export function newLivingSession(scenario, id = idOf()) {
  if (!hasScenario(scenario))
    throw new Error("Elige una situación disponible.");
  const s = SCENARIOS[scenario];
  return {
    id,
    title: s.title,
    scenario,
    step: 0,
    returnStep: 0,
    status: "draft",
    actionId: "",
    createdAt: time(),
    updatedAt: time(),
    completedAt: "",
    fields: {
      action: s.action,
      message: s.message,
      who: "Yo: haré la propuesta; la otra persona decide si acepta.",
      when: "En la próxima ocasión tranquila y segura.",
      support: s.support,
      stop: s.stop,
      observe: s.observe,
      procedure: s.procedure,
      criterion: s.criterion,
      return_when: "Después de esa ocasión, aunque no haya podido probarlo.",
      return_who:
        "Yo revisaré lo ocurrido, distinguiendo mi recuerdo de una comprobación independiente.",
      knowledge_level: "0",
      knowledge_face: "up",
      doing_level: "0",
      doing_face: "up",
      before_source:
        "Mi descripción de esta ocasión; aún sin comprobación independiente.",
      unknown: "",
      contrast_index: "0",
    },
  };
}
const fitSummary = (text, session, max = 4000) =>
  String(text ?? "").length <= max
    ? String(text ?? "")
    : `Detalle extenso conservado íntegro en el recorrido #/vivir/${session.id}. Consulta allí los campos separados; este resumen no los sustituye.`;
export function buildLivingAction(session) {
  const f = session.fields,
    s = SCENARIOS[session.scenario];
  const action = {
    id: session.actionId || idOf(),
    title: `${s.title} · una prueba`,
    tool: "plan",
    owner: fitSummary(f.who, session, 500),
    due: fitSummary(f.when, session, 500),
    status: "propuesto",
    createdAt: session.createdAt,
    updatedAt: time(),
    fields: {
      situation:
        f.before_observation ||
        "Situación cotidiana elegida; aún sin observación propia anotada.",
      action: f.action,
      support: f.support,
      stop: f.stop,
      review: `Observaré: ${f.observe}. Volveré: ${f.return_when}. Criterio: ${f.criterion}`,
      bb_version: "CareLab 3 · recorrido viviente · BrainBox 1.2",
      bb_route: f.route || "No elegida",
      bb_siento: f.feeling || "Prefiero no describirlo",
      bb_actuo: f.automatic || "Sin describir",
      bb_pienso: f.thought || "Sin describir",
      bb_saber: `Observación: ${f.before_observation || "No disponible"}. Procedencia: ${f.before_source}. Peldaño autoelegido: ${KNOWING[Number(f.knowledge_level)]?.title || "Ruido"}; no es una evaluación.`,
      bb_supuestos: f.thought || "Sin describir",
      bb_duda: f.unknown || "Aún no delimitada",
      bb_hacer: `Tarea: ${f.action}. Aspecto elegido: ${DOING[Number(f.doing_level)]?.title || "Aptitud"}. Condición: ${f.barrier || "Por comprobar"}.`,
      bb_relato:
        f.story_mode === "hechos"
          ? "Prefiero conservar sólo hechos e intención."
          : f.story || "Voy a probar una acción; todavía no hay resultado.",
      bb_etica:
        "La aceptación de otras personas no se presupone. Mantener cubiertas las necesidades indispensables. Parar ante riesgo o decisiones médicas, psicológicas o legales.",
      bb_rev_que: f.observe,
      bb_rev_quien: f.return_who,
      bb_rev_cuando: f.return_when,
      bb_rev_como: f.procedure,
      bb_rev_criterio: f.criterion,
      bb_rev_procedencia: "Previsto; aún no observado.",
      bb_pausa: f.paused_reason || "",
      bb_stage: "Preparado; todavía no equivale a hecho",
      bb_scope: "Organización cotidiana elegida por la persona",
      bb_entorno: f.support,
      bb_story_in: f.thought || "Sin relato de entrada",
      bb_instrumento:
        "SAP, contraste del Saber y ensayo de una tarea; adaptación guiada",
      bb_nota_instrumento: f.message,
    },
  };
  for (const [key, text] of Object.entries(action.fields))
    action.fields[key] = fitSummary(text, session);
  return action;
}
export function buildLivingNarrative(session) {
  const f = session.fields;
  if (f.narrative_mode === "conservar")
    return {
      text: "Conservo lo observado sin añadir un nuevo relato.",
      lenses: "",
    };
  const lensData = hasScenario(session.scenario)
    ? NARRATIVE_LENSES[session.scenario]
    : null;
  const parts = [];
  if (f.narrative_mode === "explorar" && lensData) {
    for (const [key, title] of [
      ["reframe", "Reencuadre"],
      ["context", "Recontextualización"],
      ["meaning", "Resignificación"],
    ]) {
      const option = lensData[key].find((x) => x[0] === f["narrative_" + key]);
      if (option) parts.push(title + ": " + option[1]);
    }
  }
  const lenses = parts.length
    ? "Lecturas provisionales elegidas por mí; no son observaciones ni explicaciones verificadas.\n" +
      parts.join("\n")
    : "";
  const personal = f.after_story || "";
  const combined = [
    lenses,
    personal && "Mis palabras (interpretación personal): " + personal,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    text:
      combined.length > 4000
        ? personal
        : combined || "Conservo las observaciones sin añadir un relato.",
    lenses,
  };
}
export function buildLivingContinuation(previous) {
  const f = previous.fields,
    narrative = buildLivingNarrative(previous),
    reserved = f.return_done === "reservado" || f.return_source === "reservado";
  return {
    previous_session: previous.id,
    previous_narrative: narrative.text,
    previous_lenses: narrative.lenses,
    before_observation: reserved ? "" : f.return_observation || "",
    before_source: reserved
      ? "No traslado una observación que elegí no contar."
      : "Lo que declaré en mi vuelta anterior; no una comprobación externa.",
    unknown: hasScenario(previous.scenario)
      ? SCENARIOS[previous.scenario].nextAsk
      : "",
  };
}
export function buildLivingReturn(session) {
  const f = session.fields,
    done = f.return_done || "sin_dato",
    obs = f.return_observation || "No tengo una observación que añadir",
    source = f.return_source || "No indicado",
    sourceLabel =
      {
        yo: "Lo observé yo",
        otra_persona: "Otra persona me lo contó",
        registro: "Lo consulté en un registro",
        no_visto: "No vimos lo que ocurrió",
        reservado: "Prefiero no contar esa parte",
      }[source] || source;
  const result =
    done === "no"
      ? "No pude probarlo"
      : f.return_worth === "ayudo"
        ? "Me ha ayudado"
        : f.return_worth === "carga"
          ? "Ha añadido carga"
          : f.return_worth === "igual"
            ? "No he notado un cambio"
            : "Todavía no lo sé";
  const before = f.before_observation || "No registré una observación inicial.";
  const performed = {
    hecho: "Cuento que hice la acción prevista.",
    parte: "Cuento que hice sólo una parte.",
    no: "Cuento que no pude probarla.",
    sin_dato: "No tengo información suficiente sobre lo ocurrido.",
    reservado: "Prefiero no contar si se hizo.",
  }[done];
  const after =
    done === "reservado" || source === "reservado"
      ? "He elegido no contar esta parte."
      : obs;
  const narrative = buildLivingNarrative(session);
  const note = `Antes: ${before}\nAhora: ${performed}\nObservación declarada: ${after}\nDe dónde sale: ${sourceLabel}. Esto registra lo que la persona cuenta; no es una verificación externa de CareLab.`;
  const review = {
    id: f.review_id || idOf(),
    date: time(),
    actionId: session.actionId || "",
    result,
    note:
      note.length <= 4000
        ? note
        : "Retorno declarado. Las observaciones completas se conservan por separado en los campos Antes y Qué pasó; no se recortan.",
    next:
      DECISIONS.find((x) => x[0] === f.decision)?.[1] || "Todavía no decido",
    fields: {
      bb_antes: before,
      bb_hizo: performed,
      bb_paso: after,
      bb_valor: f.return_worth || "No valorado",
      bb_coste: f.return_cost || "Sin describir",
      bb_atribucion: f.return_attribution || "No puedo atribuir un efecto",
      bb_procedencia: "Declarado por la persona usuaria",
      bb_fuente: sourceLabel,
      bb_fuente_codigo: source,
      bb_criterio_previsto: f.criterion,
      bb_procedimiento_previsto: f.procedure,
      bb_decision: f.decision || "No decidida",
      bb_siguiente: f.decision_note || "",
      bb_alineacion: f.return_alignment || "Prefiero no compararlo",
      bb_ciclo: f.cycle_type
        ? `${f.cycle_type}: elegido por la persona, no inferido por la herramienta.`
        : "Sin clasificar",
      bb_vueltas: [f.turn1, f.turn2, f.turn3]
        .map((x) => x || "Sin observar")
        .join(" → "),
      bb_relato: narrative.text,
      bb_lentes: narrative.lenses,
      bb_metacarga: f.return_cost || "No indicada",
      bb_disponibilidad:
        done === "no"
          ? "No ocurrió"
          : source === "no_visto"
            ? "No lo vimos"
            : done === "reservado" || source === "reservado"
              ? "No desea contarlo"
              : "Información declarada disponible",
    },
  };
  for (const [key, text] of Object.entries(review.fields))
    review.fields[key] = fitSummary(text, session);
  return review;
}
export function getLivingSummary(Store) {
  const j = Store.get().journey || { sessions: [], currentId: "" };
  const sessions = [...j.sessions].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  return {
    current: sessions.find((s) => s.id === j.currentId) || sessions[0] || null,
    planned: sessions.filter((s) => s.status === "planned"),
    reviewed: sessions.filter((s) => s.status === "reviewed"),
    paused: sessions.filter((s) => s.status === "paused"),
    sessions,
  };
}
function storageText(Store) {
  const s = Store.getStorageStatus?.();
  if (s?.error || s?.hasUnstoredChanges)
    return (
      (s.error ||
        "Estos cambios sólo están en memoria y no están asegurados al recargar.") +
      " Exporta una copia desde Privacidad y guardado antes de cerrar."
    );
  return s?.mode === "device"
    ? "Guardado en este dispositivo."
    : s?.mode === "session"
      ? "Se conserva durante esta sesión del navegador."
      : s?.mode === "memory"
        ? "Sólo está en esta pestaña; no está asegurado al recargar."
        : "Disponible en tu espacio; comprueba el guardado antes de cerrar.";
}
function setup(container, options, isReturn) {
  mounted.get(container)?.();
  const { Store, notify = () => {}, readText, onAction, onReview } = options;
  let alive = true,
    saving = false,
    error = "",
    pauseOpen = false,
    stopped = false,
    returnSaved = false;
  const state = () => Store.get();
  if (!state().journey)
    state().journey = {
      version: 1,
      onboarded: false,
      currentId: "",
      sessions: [],
    };
  let session =
    state().journey.sessions.find((x) => x.id === options.id) || null;
  stopped =
    !!session && ["stop", "duda", "urgente"].includes(session.fields.scope);
  const findSession = () =>
    session && state().journey.sessions.find((x) => x.id === session.id);
  function save() {
    if (!alive || !session) return;
    const actual = findSession();
    if (!actual) {
      error = "Este recorrido ya no está en tu espacio.";
      return;
    }
    session = actual;
    session.updatedAt = time();
    state().journey.currentId = session.id;
    Store.save();
  }
  function create(scenario) {
    if (!hasScenario(scenario)) {
      error = "Elige una situación disponible.";
      render();
      return;
    }
    if (state().journey.sessions.length >= maxSessions) {
      error =
        "Tu espacio tiene 100 recorridos. Exporta una copia y revisa los anteriores antes de añadir otro.";
      render();
      return;
    }
    session = newLivingSession(scenario);
    state().journey.sessions.push(session);
    state().journey.currentId = session.id;
    save();
    if (!isReturn) history.replaceState(null, "", `#/vivir/${session.id}`);
    render(true);
  }
  if (!session && hasScenario(options.id) && !isReturn) {
    session = newLivingSession(options.id);
    if (state().journey.sessions.length < maxSessions) {
      state().journey.sessions.push(session);
      state().journey.currentId = session.id;
      save();
      history.replaceState(null, "", `#/vivir/${session.id}`);
    } else session = null;
  }
  const value = (name) => session?.fields[name] || "";
  const button = (text, attrs = "", kind = "secondary") =>
    `<button type="button" class="lv-${kind}" ${attrs}>${escape(text)}</button>`;
  const choose = (name, items, label) =>
    `<div class="lv-options" role="group" aria-label="${escape(label)}">${items
      .map((item) => {
        const [v, text, desc] = Array.isArray(item) ? item : [item, item];
        return `<button type="button" class="lv-option" data-choice="${escape(name)}" data-value="${escape(v)}" aria-pressed="${value(name) === v}"><span>${escape(text)}</span>${desc ? `<small>${escape(desc)}</small>` : ""}</button>`;
      })
      .join("")}</div>`;
  const select = (name, label, items) =>
    `<label class="lv-field"><span>${escape(label)}</span><select class="lv-input" data-select name="${name}"><option value="">Elegir una opción</option>${items.map(([v, t]) => `<option value="${escape(v)}" ${value(name) === v ? "selected" : ""}>${escape(t)}</option>`).join("")}</select></label>`;
  const field = (name, label, rows = 2, max = 1200) =>
    `<label class="lv-field"><span>${escape(label)}</span><textarea class="lv-input" name="${name}" rows="${rows}" maxlength="${max}">${escape(value(name))}</textarea></label>`;
  const edit = (name, label) =>
    `<details class="lv-edit"><summary>${escape(label)}</summary>${field(name, "Puedes cambiar estas palabras; no hace falta rellenarlo de nuevo.")}</details>`;
  const note = (text, cls = "note") =>
    `<aside class="lv-${cls}">${escape(text)}</aside>`;
  const relatedResource = () =>
    `<p class="lv-related"><a class="lv-quiet" href="#/recursos/${relatedNeeds[session.scenario]}">Un recurso relacionado, si me sirve</a></p>`;
  const next = (label = "Seguir", attrs = "data-next") =>
    `<div class="lv-actions">${button(label, attrs, "primary")}</div>`;
  const staticAudio = (text) =>
    typeof readText === "function"
      ? button("Escuchar esta explicación", "data-read", "quiet")
      : "";
  function header(title, lead, body, stage = "") {
    const phase = isReturn
      ? "Volver para decidir"
      : session
        ? "Una cosa cada vez · a tu ritmo"
        : "Una situación, un siguiente paso";
    container.innerHTML = `<section class="lv-shell" aria-label="Recorrido viviente BrainBox"><div class="lv-top"><a href="#/micamino" class="lv-quiet">Mi camino</a><a href="#/ayuda" class="lv-quiet">Necesito ayuda</a></div><div class="lv-progress"><span>${escape(phase)}</span>${session ? `<span class="lv-axis">${escape(stage || axes[session.step] || "Retorno")}</span>` : ""}</div><section class="lv-focus"><p class="lv-kicker">${isReturn ? "VOLVER A LO QUE PASÓ" : "BRAINBOX · VIVIR EL MÉTODO"}</p><h1 class="lv-title" tabindex="-1">${escape(title)}</h1><p class="lv-lead">${escape(lead)}</p>${staticAudio(lead)}${error ? `<p class="lv-error" role="alert">${escape(error)}</p>` : ""}${body}</section><footer class="lv-footer">${session && !stopped ? `<div class="lv-actions">${button("Volver un paso", "data-back", "quiet")}${button("No puedo ahora", "data-pause", "quiet")}</div><p class="lv-storage" data-storage role="status">${escape(storageText(Store))} <a href="#/ajustes">Privacidad y guardado</a></p>` : ""}<details class="lv-method"><summary>Qué parte del método estoy usando</summary>${session ? button("Esta situación necesita ayuda", "data-stop", "quiet") : ""}<p>${escape(SOURCE)}</p><p>Es una adaptación didáctica para decisiones cotidianas, no una intervención clínica validada. Los ejemplos no son datos de tu vida. No hay una IA evaluando tus respuestas.</p><a href="#/profundizar">Cómo usarlo en mi día</a></details></footer></section>`;
    container.dataset.editorial = lead;
  }
  function paused() {
    header(
      "Ahora puede bastar con parar",
      "Pausar no confirma que la situación esté resuelta. Conserva lo imprescindible y elige qué necesitas antes de volver.",
      choose(
        "paused_reason",
        [
          ["Necesito detenerme y volver cuando pueda.", "Necesito detenerme"],
          ["No dispongo del apoyo necesario.", "Falta apoyo"],
          ["No tengo una ocasión viable ahora.", "Falta una ocasión"],
          [
            "Prefiero no seguir explorando esta situación.",
            "Prefiero dejarlo aquí",
          ],
        ],
        "Motivo de pausa",
      ) +
        next("Guardar esta pausa", "data-save-pause") +
        button("Volver a donde estaba", "data-cancel-pause", "quiet"),
    );
  }
  function stopScreen() {
    header(
      "Aquí va primero la ayuda adecuada",
      "Si hay riesgo para alguien o una decisión médica, psicológica o legal, este recorrido no se aplica a esa decisión.",
      note(
        "Detén el ejercicio y busca apoyo competente. No modifiques tratamientos ni dejes sin atender necesidades indispensables. Si la situación es urgente, entra en Ayuda para ver recursos verificados.",
        "stop",
      ) +
        `<div class="lv-actions"><a class="lv-primary" href="#/ayuda">Ir a Ayuda</a><a class="lv-secondary" href="#/">Salir del recorrido</a></div>` +
        button(
          "La situación cotidiana es otra; volver a delimitar",
          "data-rescope",
          "quiet",
        ),
      "STOP",
    );
  }
  function ladder(type) {
    const list = type === "knowledge" ? KNOWING : DOING,
      index = Math.max(0, Math.min(4, Number(value(type + "_level")) || 0)),
      item = list[index],
      scene = SCENARIOS[session.scenario],
      negative = value(type + "_face") === "down";
    return `<div class="lv-ladder" aria-label="Escalera ${type === "knowledge" ? "del saber" : "del hacer"}"><details class="lv-method"><summary>Las dos caras de esta escalera</summary><div class="lv-actions">${button("Lo que puedo respaldar", `data-face="${type}" data-value="up" aria-pressed="${!negative}"`, "quiet")}${button("Lo que puede parecerlo", `data-face="${type}" data-value="down" aria-pressed="${negative}"`, "quiet")}</div></details><details class="lv-method"><summary>Ver todos los peldaños</summary><div class="lv-rungs">${list.map((x, i) => `<button type="button" class="lv-rung" data-rung="${type}" data-index="${i}" aria-pressed="${index === i}"><span>${i + 1}</span>${escape(negative ? x.down : x.title)}</button>`).join("")}</div></details><div class="lv-card"><h2>${escape(negative ? item.down : item.title)}</h2><p>${escape(negative ? item.warning : item.text)}</p><p class="lv-example"><strong>En el ejemplo: </strong>${escape(type === "knowledge" ? (negative ? scene.misleading[index] : scene.knowledge[index]) : scene.doing[index])}</p></div>${type === "knowledge" ? `<div class="lv-actions">${button("Volver un peldaño", `data-knowledge="-1" ${index === 0 ? "disabled" : ""}`, "quiet")}${button("Mirar el siguiente", `data-knowledge="1" ${index === 4 ? "disabled" : ""}`, "quiet")}</div>` : ""}</div>`;
  }
  function forward() {
    const s = SCENARIOS[session.scenario],
      step = session.step;
    if (step === 0) {
      header(
        s.title,
        "Empecemos por una escena cercana. No hace falta contar toda tu historia.",
        note(s.scene, "example") +
          (value("previous_narrative")
            ? `<details class="lv-method"><summary>Una lectura provisional de mi vuelta anterior</summary><p>${escape(value("previous_narrative")).replaceAll("\n", "<br>")}</p>${value("previous_lenses") && !value("previous_narrative").includes(value("previous_lenses")) ? `<p>${escape(value("previous_lenses")).replaceAll("\n", "<br>")}</p>` : ""}<p>La traigo como interpretación revisable; no la convierto en un hecho de esta nueva ocasión.</p></details>`
            : "") +
          '<details class="lv-method"><summary>Antes de seguir: cuándo hace falta otro apoyo</summary><p>Este espacio sirve para organizar una petición, pausa, tarea o acuerdo. Si hay riesgo o una decisión médica, psicológica o legal, el recorrido no se aplica: primero va la ayuda competente.</p></details>' +
          choose(
            "scope",
            [
              ["cotidiano", "Es una decisión cotidiana de organización"],
              [
                "duda",
                "No tengo claro si hay riesgo o hace falta ayuda profesional",
              ],
              ["urgente", "Hay riesgo o necesito ayuda ahora"],
            ],
            "Ámbito de esta situación",
          ) +
          next("Continuar"),
      );
      return;
    }
    if (step === 1) {
      header(
        "¿Qué te vendría bien ahora?",
        "Puedes cuidar lo que ya funciona, mirar un atasco o pasar a una propuesta concreta.",
        choose("route", ROUTES, "Qué encaja hoy") +
          note(
            "No es un test: tú eliges la profundidad. Si algo ya funciona, no hace falta desmontarlo.",
          ) +
          next(
            value("route") === "cuidado"
              ? "Cuidar lo que ya funciona"
              : "Mirar una sola vuelta",
          ) +
          button(
            "Prefiero ensayar una propuesta ya",
            "data-direct",
            "secondary",
          ),
      );
      return;
    }
    if (step === 2) {
      header(
        "Primero, lo que se siente",
        "Elige una palabra que se acerque. También puedes dejar esta parte sin contar.",
        choose("feeling", s.feelings, "Lo que siento") +
          note(s.validation) +
          edit("feeling", "Quiero usar mis propias palabras") +
          next(),
      );
      return;
    }
    if (step === 3) {
      header(
        "¿Qué te sale hacer en ese momento?",
        "Mira una reacción que una cámara pudiera describir, sin juzgar a la persona que reacciona.",
        choose("automatic", s.reactions, "La reacción que me sale") +
          note(
            "Este es el actuar de SAP: lo que sale. Más adelante ensayarás un hacer elegido, que puede ser distinto.",
          ) +
          edit("automatic", "Mi reacción es distinta") +
          next(),
      );
      return;
    }
    if (step === 4) {
      header(
        "La frase que aparece por dentro",
        "Una interpretación puede sentirse muy convincente. Vamos a reconocerla sin darle todavía valor de hecho.",
        choose("thought", s.thoughts, "La interpretación que aparece") +
          note(
            "Sentirlo de verdad y saber que es verdad son cosas distintas. No hace falta negar la emoción para revisar la explicación.",
          ) +
          edit("thought", "Quiero escribir otra frase") +
          next("Hacer el giro"),
      );
      return;
    }
    if (step === 5) {
      const index = Math.min(2, Number(value("contrast_index")) || 0),
        card = s.contrast[index],
        selected = value("c" + index),
        feedback = selected && contrastFeedback(s.id, index, selected);
      header(
        "¿Qué permite afirmar esta frase?",
        "Éste es un ejemplo ficticio. Puedes cambiar tu elección; no hay puntos ni examen.",
        `<p class="lv-kicker">Ejemplo ${index + 1} de 3</p><blockquote class="lv-quote">${escape(card.text)}</blockquote>` +
          choose("c" + index, KINDS, "Qué clase de afirmación es") +
          (feedback
            ? note(
                `${feedback.matches ? "Has separado esa pieza." : "Miremos el salto con calma."} ${feedback.explanation}`,
                "feedback",
              )
            : "") +
          `<div class="lv-actions">${index ? button("Ejemplo anterior", "data-example-back", "quiet") : ""}${button(index < 2 ? "Ver otra pieza" : "Volver a mi situación", "data-example-next", "primary")}</div>` +
          `<details class="lv-inversion"><summary>Probar la pregunta al revés</summary><p>${escape(s.inversion)}</p>${choose(
            "inversion_choice",
            [
              ["adoptar", "Quiero usar esta pregunta para mi prueba"],
              ["mantener", "Prefiero mantener mi pregunta por ahora"],
            ],
            "Qué hago con esta nueva pregunta",
          )}${value("inversion_choice") === "adoptar" ? note("La pregunta de tu prueba queda así: " + s.question) : ""}</details>`,
      );
      return;
    }
    if (step === 6) {
      header(
        "¿Hasta dónde puedes justificarlo hoy?",
        "Una observación suficiente vale más que una explicación enorme. No tienes que subir toda la escalera.",
        choose(
          "before_observation",
          s.observations,
          "Lo que he observado en mi situación",
        ) +
          edit("before_observation", "Precisar mi observación") +
          edit("before_source", "Indicar de dónde sale") +
          ladder("knowledge") +
          note(
            "Elegir un peldaño no demuestra haberlo alcanzado. Puedes bajar ante un dato nuevo: es rectificar, no fracasar. La cara que baja muestra errores posibles, no un juicio sobre ti.",
          ) +
          edit("unknown", "Qué sigue sin saberse") +
          next("Ensayar un siguiente paso"),
      );
      return;
    }
    if (step === 7) {
      const r = Number(value("rehearsal_choice")),
        selected = value("rehearsal_choice") !== "";
      header(
        "Prueba unas palabras antes de usarlas",
        "Son propuestas de ejemplo: toca una y mira qué aclara o qué deja pendiente. Después podrás cambiarla.",
        choose(
          "rehearsal_choice",
          s.rehearsal.map((x, i) => [String(i), x.text]),
          "Miniensayo de una propuesta",
        ) +
          (selected
            ? note(
                s.rehearsal[r]?.response || "Puedes elegir otra formulación.",
                "feedback",
              )
            : "") +
          choose(
            "barrier",
            [
              [
                "Puedo ensayar ahora; falta comprobarlo fuera de la pantalla.",
                "Puedo ensayar; aún falta probarlo",
              ],
              [
                "Necesito apoyo o condiciones que ahora no tengo.",
                "Falta apoyo o una condición",
              ],
              [
                "Ya sé hacerlo; quiero comprobar si encaja en esta ocasión.",
                "Sé hacerlo; cambia el contexto",
              ],
            ],
            "Condiciones para este hacer",
          ) +
          `<details class="lv-method"><summary>Mirar mi tarea con la escalera del hacer</summary>${ladder("doing")}<p>Ensayar aquí no demuestra competencia en la situación real. Una barrera del entorno no se carga a la persona. Dos nombres de la cara descendente siguen pendientes en BrainBox 1.2.</p></details>` +
          next("Preparar mi propuesta"),
      );
      return;
    }
    if (step === 8) {
      header(
        "Algo que depende de ti",
        "Pedir un acuerdo y conseguirlo son resultados distintos. Ésta es una propuesta editable; no se envía a nadie.",
        `<div class="lv-card"><h2>Lo que voy a probar</h2><p>${escape(value("action"))}</p>${edit("action", "Cambiar la acción")}</div><blockquote class="lv-quote">${escape(value("message"))}</blockquote>` +
          edit("message", "Cambiar las palabras del mensaje") +
          choose(
            "when",
            [
              [
                "En la próxima ocasión tranquila y segura.",
                "En la próxima ocasión tranquila",
              ],
              [
                "Antes de responder a la próxima petición cotidiana.",
                "Antes de responder a la próxima petición",
              ],
              [
                "Cuando haya confirmado el apoyo necesario.",
                "Cuando confirme el apoyo necesario",
              ],
            ],
            "Ocasión para probarlo",
          ) +
          `<details class="lv-method"><summary>Responsables, apoyos y cuándo parar</summary>${field("who", "Lo que me comprometo a hacer yo", 2, 500)}${field("support", "Apoyos y condiciones")}${field("stop", "Cuándo parar o cambiar")}</details>` +
          note(value("stop")) +
          next("Decidir cómo volver"),
      );
      return;
    }
    if (step === 9) {
      header(
        "¿Qué te haría mantener o cambiar la prueba?",
        "El retorno se prepara antes de hacer. Puede enseñar que algo no sirve o que aún faltan condiciones.",
        `<div class="lv-card lv-return-plan"><dl><dt><strong>Voy a observar</strong></dt><dd>${escape(value("observe"))}</dd><dt><strong>Lo comprobaré así</strong></dt><dd>${escape(value("procedure"))}</dd><dt><strong>Mi decisión dependerá de esto</strong></dt><dd>${escape(value("criterion"))}</dd></dl><details class="lv-edit"><summary>Quiero cambiar esta propuesta</summary>${field("observe", "Qué observaré")}${field("procedure", "Cómo lo comprobaré")}${field("criterion", "Qué resultado mantendrá o cambiará la prueba")}</details></div>` +
          choose(
            "return_when",
            [
              [
                "Después de esa ocasión, aunque no haya podido probarlo.",
                "Después de esa ocasión",
              ],
              [
                "Cuando reciba una respuesta o compruebe que sigue pendiente.",
                "Cuando haya respuesta o siga pendiente",
              ],
              [
                "Cuando vuelva a CareLab; indicaré qué pude observar.",
                "Cuando vuelva a CareLab",
              ],
            ],
            "Cuándo revisar",
          ) +
          edit("return_who", "Quién revisará y con qué respaldo") +
          note(
            "No hay alarma ni aviso automático. Volverás desde Mi camino, incluso si no pudiste hacerlo.",
          ) +
          next("Dejar una historia abierta"),
      );
      return;
    }
    if (step === 10) {
      const narrative = `He reconocido ${value("before_observation") ? `esta observación: «${value("before_observation")}»` : "una situación que quiero delimitar"}. ${value("thought") && !/^(No quiero|Prefiero)/.test(value("thought")) ? `Mi interpretación era «${value("thought")}».` : "Todavía no he descrito una interpretación."} Voy a probar: ${value("action")} Aún no sé qué pasará; volveré para observarlo.`;
      header(
        "Todavía no hay un final que contar",
        "Crear es preparar lo que viene. La historia sólo cambiará con lo que ocurra y puedas observar.",
        note(narrative, "quote") +
          choose(
            "story_mode",
            [
              ["intencion", "Conservar esta intención abierta"],
              ["hechos", "Prefiero sólo hechos y una acción"],
              ["propia", "Quiero cambiar las palabras"],
            ],
            "Cómo quiero narrarlo",
          ) +
          (value("story_mode") === "propia"
            ? field("story", "Mi versión, sin inventar un resultado", 3)
            : "") +
          note(
            "No tienes que verte como una persona nueva, encontrar algo positivo ni compartir tu historia.",
          ) +
          next("Guardar la prueba para volver", "data-plan-save"),
      );
      return;
    }
    header(
      "La prueba está preparada",
      "Guardar no significa que ya lo hayas hecho. La siguiente parte sucede en tu vida; aquí quedará dónde volver.",
      `<div class="lv-receipt"><p>${escape(value("action"))}</p><p><strong>Ocasión:</strong> ${escape(value("when"))}</p><p><strong>Volveré:</strong> ${escape(value("return_when"))}</p></div><div class="lv-actions">${button("Copiar mi propuesta", "data-copy", "primary")}<a class="lv-secondary" href="#/volver/${session.id}">Volver a lo que pasó</a><a class="lv-quiet" href="#/micamino">Ir a Mi camino</a></div><div data-copy-fallback></div>` +
        relatedResource() +
        note(
          "Copiar sólo prepara el texto. Tú eliges si lo compartes, con quién y por qué medio. CareLab no manda mensajes.",
        ) +
        `<details><summary>Ver lo que está previsto comprobar</summary><p>${escape(value("observe"))}</p><p>${escape(value("procedure"))}</p><p>${escape(value("criterion"))}</p></details>`,
      "Acción prevista",
    );
  }
  function narrativeExercise() {
    const r = buildLivingReturn(session),
      lenses = NARRATIVE_LENSES[session.scenario];
    return (
      `<details class="lv-method"><summary>Mi relato: mirarlo de otra manera, si me sirve</summary><p>Primero, lo que realmente has contado. Las nuevas miradas no cambian estos datos ni prueban una explicación.</p><dl class="lv-return-plan"><dt>Mi interpretación inicial</dt><dd>${escape(value("thought") || "No la describí.")}</dd><dt>Mi observación inicial</dt><dd>${escape(value("before_observation") || "No registré una observación inicial.")}</dd><dt>Lo que ahora declaro</dt><dd>${escape(r.fields.bb_hizo)} ${escape(r.fields.bb_paso)}</dd></dl>` +
      choose(
        "narrative_mode",
        [
          ["explorar", "Quiero explorar tres miradas provisionales"],
          ["conservar", "Conservar lo observado sin un nuevo relato"],
        ],
        "Qué quiero hacer con mi relato",
      ) +
      (value("narrative_mode") === "explorar"
        ? ["reframe", "context", "meaning"]
            .map((key, i) => {
              const title = [
                  "Reencuadrar · cambiar la pregunta",
                  "Recontextualizar · mirar las condiciones",
                  "Resignificar · proponer un sentido provisional",
                ][i],
                selected = lenses[key].find(
                  (x) => x[0] === value("narrative_" + key),
                );
              return (
                `<details class="lv-method"><summary>${title}</summary>` +
                choose(
                  "narrative_" + key,
                  lenses[key].map((x) => [x[0], x[1]]),
                  title,
                ) +
                (selected ? note(selected[2], "feedback") : "") +
                "</details>"
              );
            })
            .join("") +
          `<details class="lv-edit"><summary>Precisarlo con mis palabras, si quiero</summary>${field("after_story", "Mi lectura personal; no cambia lo observado.", 3)}</details>` +
          note(
            "Puedes tomar una mirada, las tres o ninguna. No hace falta una interpretación positiva ni una conclusión sobre quién eres.",
          )
        : "") +
      "</details>"
    );
  }
  function narrativeReceipt(review) {
    return `<details class="lv-method"><summary>La lectura provisional que he conservado</summary><p>${escape(review.fields.bb_relato).replaceAll("\n", "<br>")}</p>${review.fields.bb_lentes && !review.fields.bb_relato.includes(review.fields.bb_lentes) ? `<p>${escape(review.fields.bb_lentes).replaceAll("\n", "<br>")}</p>` : ""}<p>Este significado es una interpretación personal revisable, no evidencia adicional.</p></details>`;
  }
  function returning() {
    const s = SCENARIOS[session.scenario],
      step = session.returnStep;
    if (!session.actionId) {
      header(
        "Esta vuelta todavía no tiene una prueba guardada",
        "Puedes revisar tu recorrido o preparar una acción antes de asociar un retorno. No hace falta haberla realizado.",
        `<a class="lv-primary" href="#/vivir/${session.id}">Volver al recorrido</a>`,
      );
      return;
    }
    if (step === 0) {
      header(
        "¿Qué ocurrió con tu prueba?",
        "Puedes volver antes de hacerla. No haber podido probarla también importa.",
        note(value("action"), "example") +
          choose(
            "return_done",
            [
              ["hecho", "Hice lo que había previsto"],
              ["parte", "Hice sólo una parte"],
              ["no", "No pude probarlo"],
              ["sin_dato", "Todavía no lo sé"],
              ["reservado", "Prefiero no contarlo"],
            ],
            "Si se hizo",
          ) +
          next("Mirar lo que se observó"),
        "Hacer → retorno",
      );
      return;
    }
    if (step === 1) {
      header(
        "Un antes y un ahora, sin rellenar los huecos",
        "Conservemos separados lo que pasó, lo que viste y lo que aún no sabes.",
        `<div class="lv-card"><h2>Lo anotado antes</h2><p>${escape(value("before_observation") || "No había una observación inicial registrada.")}</p></div>` +
          choose(
            "return_observation",
            s.afterOptions,
            "Observación después de la ocasión",
          ) +
          edit("return_observation", "Precisar lo observado") +
          select("return_source", "De dónde sale esta observación", [
            ["yo", "Lo observé yo"],
            ["otra_persona", "Otra persona me lo contó"],
            ["registro", "Lo consulté en un registro"],
            ["no_visto", "No vimos lo que ocurrió"],
            ["reservado", "Prefiero no contar esa parte"],
          ]) +
          note(
            "CareLab registra tu declaración. No la convierte en verificación externa. «No ocurrió», «no lo vimos» y «no quiero contarlo» son cosas distintas.",
          ) +
          next(),
        "II · Saber de vuelta",
      );
      return;
    }
    if (step === 2) {
      header(
        "¿Mereció la pena, y para quién?",
        "Un resultado puede ayudar en algo y añadir coste en otra parte. Las respuestas no se suman.",
        choose(
          "return_worth",
          [
            ["ayudo", "Me ha ayudado en esta situación"],
            ["igual", "No noté un cambio"],
            ["carga", "Ha añadido carga"],
            ["incierto", "Todavía no puedo valorarlo"],
            ["reservado", "Prefiero no valorarlo"],
          ],
          "Valor de la prueba",
        ) +
          select("return_cost", "Qué coste tuvo, si lo sabes", [
            [
              "No he identificado un coste añadido; eso no prueba que no exista.",
              "No he identificado un coste añadido",
            ],
            [
              "Me pidió más tiempo, energía o vigilancia.",
              "Me añadió tiempo, energía o vigilancia",
            ],
            [
              "Otra persona asumió una parte; quiero revisar si le resultó viable.",
              "Otra persona asumió una parte",
            ],
            [
              "No tengo información suficiente sobre los costes.",
              "Todavía no sé qué coste tuvo",
            ],
          ]) +
          `<details><summary>¿Lo que sentías y hacías iba junto?</summary>${choose(
            "return_alignment",
            [
              ["juntos", "En esa ocasión iban juntos"],
              ["separados", "En esa ocasión iban separados"],
              ["mixto", "Hubo de las dos cosas"],
              ["reservado", "No quiero compararlo"],
            ],
            "Relación entre sentir y hacer",
          )}<p>Es una pregunta provisional del método, no una puntuación ni una prueba de transformación.</p></details>` +
          next(),
        "Ser y entorno",
      );
      return;
    }
    if (step === 3) {
      header(
        "¿Qué puedes atribuir a lo que hiciste?",
        "Que algo ocurra después no demuestra que lo haya causado la prueba.",
        choose(
          "return_attribution",
          [
            [
              "Puede estar relacionado, pero hubo otras condiciones.",
              "Puede estar relacionado; hubo más cosas",
            ],
            [
              "Tengo una comparación concreta, aunque no prueba causalidad.",
              "Tengo una comparación concreta",
            ],
            [
              "No puedo atribuir el resultado a esta acción.",
              "No puedo atribuirlo a esta acción",
            ],
            [
              "No hubo prueba u observación suficiente.",
              "No hubo prueba u observación suficiente",
            ],
          ],
          "Atribución prudente",
        ) +
          note(
            "Una respuesta favorable no confirma toda la historia anterior. Una negativa tampoco demuestra que pedir apoyo fuera un error.",
          ) +
          next("Mirar la vuelta del ciclo"),
        "Contraste",
      );
      return;
    }
    if (step === 4) {
      header(
        "Mira el ciclo, no a las personas",
        "Una vuelta real tiene una señal, una reacción, un efecto y algo que vuelve a empezar. Estas pantallas no cuentan como vueltas.",
        `<div class="lv-map"><div><strong>Situación anotada</strong><p>${escape(value("before_observation") || "No anoté una observación inicial.")}</p></div><span aria-hidden="true">→</span><div><strong>Reacción inicial</strong><p>${escape(value("automatic") || "No la describí.")}</p></div><span aria-hidden="true">→</span><div><strong>Lo que ahora cuento</strong><p>${escape(buildLivingReturn(session).fields.bb_paso)}</p></div><span aria-hidden="true">→</span><div><strong>Vuelta</strong><p>¿Qué se repitió o cambió en la siguiente ocasión?</p></div></div><p>Si recuerdas tres ocasiones reales, describe sólo su dirección. Si no, déjalas sin observar.</p>` +
          [1, 2, 3]
            .map(
              (i) =>
                `<details class="lv-method"><summary>Vuelta ${i}: ${escape(value("turn" + i) || "sin observar")}</summary>${choose(
                  "turn" + i,
                  [
                    ["mejor", `Vuelta ${i}: ayudó o permitió aprender`],
                    ["igual", `Vuelta ${i}: siguió igual`],
                    ["peor", `Vuelta ${i}: reforzó la dificultad`],
                    ["sin_observar", `Vuelta ${i}: no la observé`],
                  ],
                  `Dirección de la vuelta ${i}`,
                )}</details>`,
            )
            .join("") +
          note(cycleReflection(session.fields)) +
          `<details class="lv-method"><summary>Ponerle un nombre al ciclo, si me sirve</summary>${choose("cycle_type", CYCLE_TYPES, "Cómo describo este ciclo, si tengo base")}</details>` +
          next("Decidir mi siguiente paso"),
        "Ciclo de interacción",
      );
      return;
    }
    if (step === 5) {
      header(
        "¿Qué decides con lo que sabes ahora?",
        "La decisión puede ser mantener, cambiar o parar. No hace falta producir un final favorable.",
        note(
          `El criterio que habías preparado: ${value("criterion")}`,
          "example",
        ) +
          choose("decision", DECISIONS, "Decisión después del retorno") +
          edit("decision_note", "Precisar una condición que cambiaré") +
          narrativeExercise() +
          next("Guardar esta vuelta", "data-return-save"),
        "IV · Relatar sin inventar",
      );
      return;
    }
    const review = buildLivingReturn(session);
    header(
      "Has dejado una vuelta registrada",
      "Lo guardado es lo que tú has contado, con sus límites. No una nota sobre ti ni una promesa de resultado.",
      `<div class="lv-receipt"><p>${escape(review.note).replaceAll("\n", "<br>")}</p><p><strong>Mi decisión:</strong> ${escape(review.next)}</p></div><div class="lv-actions">${button("Copiar mi registro", "data-copy-return", "primary")}${button("Preparar otra vuelta", "data-new-loop", "secondary")}<a class="lv-quiet" href="#/micamino">Volver a Mi camino</a></div><div data-copy-fallback></div>` +
        relatedResource() +
        narrativeReceipt(review) +
        note(
          "Otra vuelta crea una prueba nueva; conserva la anterior para no reescribir lo que ocurrió.",
        ),
      "Retorno registrado",
    );
  }
  function render(focus = false) {
    if (!alive) return;
    const active = container.contains(document.activeElement)
      ? document.activeElement
      : null;
    const focusData = active?.dataset
      ? Object.entries(active.dataset).filter(([k]) =>
          ["choice", "value", "rung", "index", "face", "knowledge"].includes(k),
        )
      : [];
    const openDetails = [...container.querySelectorAll("details[open]")].map(
      (x) => x.querySelector("summary")?.textContent,
    );
    if (session && !findSession()) {
      session = null;
      error = "Este recorrido ya no está en tu espacio.";
    }
    if (stopped) stopScreen();
    else if (pauseOpen) paused();
    else if (!session) {
      if (options.id && !hasScenario(options.id))
        header(
          "No encontramos ese recorrido",
          "Puedes volver a Mi camino o abrir una situación nueva.",
          `<a class="lv-primary" href="#/micamino">Mi camino</a><a class="lv-secondary" href="#/vivir">Elegir una situación</a>`,
        );
      else
        header(
          "¿Qué te pesa en esta ocasión?",
          "No hace falta explicarlo todo. Elige una escena cercana; tendrás palabras de partida que podrás corregir.",
          `<div class="lv-scenarios">${Object.values(SCENARIOS)
            .map(
              (s) =>
                `<button type="button" class="lv-option" data-scenario="${s.id}"><span aria-hidden="true" class="lv-scenario-symbol">${s.icon}</span><strong>${escape(s.title)}</strong><span>${escape(s.subtitle)}</span></button>`,
            )
            .join("")}</div>` +
            note(
              "Cada microfase propone unos 30–90 segundos de atención, sin reloj ni plazos. Puedes salir, pausar o volver atrás.",
            ),
        );
    } else if (isReturn) returning();
    else forward();
    for (const detail of container.querySelectorAll("details"))
      if (openDetails.includes(detail.querySelector("summary")?.textContent))
        detail.open = true;
    if (focus) container.querySelector("h1")?.focus({ preventScroll: true });
    else if (focusData.length) {
      const restored = [...container.querySelectorAll("button")].find((x) =>
        focusData.every(([k, v]) => x.dataset[k] === v),
      );
      restored?.focus({ preventScroll: true });
    }
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      if (alive) notify("Texto copiado. Tú eliges si lo compartes.");
    } catch {
      const node = container.querySelector("[data-copy-fallback]");
      if (node) {
        node.innerHTML = `<label class="lv-field"><span>No se pudo copiar automáticamente. Selecciona este texto:</span><textarea class="lv-input" rows="6" readonly>${escape(text)}</textarea></label>`;
        node.querySelector("textarea").select();
      }
    }
  }
  function guardNext() {
    const f = session.fields,
      step = session.step;
    if (step === 0 && f.scope !== "cotidiano") {
      if (f.scope) {
        stopped = true;
        session.status = "paused";
        f.scope = "stop";
        f.paused_reason = "Fuera del ámbito cotidiano del recorrido";
        save();
      } else
        error = "Elige el ámbito para saber si este recorrido corresponde.";
      return false;
    }
    const needed = {
      1: "route",
      2: "feeling",
      3: "automatic",
      4: "thought",
      6: "before_observation",
      7: "rehearsal_choice",
    };
    if (needed[step] && !f[needed[step]]) {
      error = "Elige una opción, incluida la de no contarlo, para continuar.";
      return false;
    }
    if (step === 7 && !f.barrier) {
      error = "Indica si falta una condición o si puedes ensayar.";
      return false;
    }
    if (
      step === 8 &&
      ["action", "message", "who", "when", "support", "stop"].some(
        (x) => !f[x]?.trim(),
      )
    ) {
      error =
        "La propuesta necesita acción, ocasión, responsable, condiciones y límite. Puedes recuperar las palabras de partida.";
      return false;
    }
    if (
      step === 9 &&
      ["observe", "procedure", "criterion", "return_when", "return_who"].some(
        (x) => !f[x]?.trim(),
      )
    ) {
      error =
        "Conserva una observación, procedimiento, criterio y ocasión para volver. No hace falta escribir: puedes usar la propuesta inicial.";
      return false;
    }
    return true;
  }
  async function savePlan() {
    if (saving || !alive) return;
    if (!value("story_mode")) {
      error =
        "Elige si quieres conservar la intención, usar tus palabras o quedarte con hechos.";
      render();
      return;
    }
    if (typeof onAction !== "function") {
      error =
        "Ahora no está disponible el guardado en Mi plan. El recorrido sigue aquí.";
      render();
      return;
    }
    if (value("story_mode") === "intencion")
      session.fields.story = fitSummary(
        `Voy a probar: ${value("action")} Aún no sé qué pasará; lo revisaré según: ${value("criterion")}`,
        session,
      );
    const originalId = session.id;
    saving = true;
    const b = container.querySelector("[data-plan-save]");
    if (b) {
      b.disabled = true;
      b.textContent = "Guardando…";
    }
    try {
      const action = await onAction(buildLivingAction(session));
      if (!alive) return;
      const active = state().journey.sessions.find((x) => x.id === originalId);
      if (!active) return;
      if (!action?.id)
        throw new Error("No se confirmó el guardado de la acción.");
      session = active;
      session.actionId = action.id;
      session.status = "planned";
      session.step = 11;
      save();
      notify(
        "Prueba preparada. Todavía no está marcada como realizada. " +
          storageText(Store),
      );
      render(true);
    } catch (e) {
      if (alive) {
        error = e.message || "No se pudo guardar la propuesta.";
        render();
      }
    } finally {
      saving = false;
    }
  }
  function saveReturn() {
    if (saving || returnSaved) return;
    if (!value("decision")) {
      error = "Elige qué harás con este retorno, incluida la opción de pausar.";
      render();
      return;
    }
    if (!state().actions.some((x) => x.id === session.actionId)) {
      error =
        "La acción vinculada ya no está en Mi plan. El recorrido conserva tus respuestas.";
      render();
      return;
    }
    saving = true;
    try {
      const review = buildLivingReturn(session),
        existing = state().reviews.findIndex((x) => x.id === review.id);
      if (existing < 0 && state().reviews.length >= 300)
        throw new Error(
          "Hay 300 revisiones. Exporta y revisa tu espacio antes de añadir otra.",
        );
      if (existing < 0) state().reviews.push(review);
      else state().reviews[existing] = review;
      session.fields.review_id = review.id;
      session.status = "reviewed";
      session.completedAt = time();
      session.returnStep = 6;
      const action = state().actions.find((x) => x.id === session.actionId);
      action.status =
        session.fields.decision === "pausar"
          ? "pausado"
          : session.fields.return_done === "hecho"
            ? "realizado"
            : "propuesto";
      action.updatedAt = time();
      save();
      returnSaved = true;
      notify("Vuelta registrada con lo que has contado. " + storageText(Store));
      onReview?.(session.actionId, review);
      render(true);
    } catch (e) {
      error = e.message || "No se pudo registrar la vuelta.";
      render();
    } finally {
      saving = false;
    }
  }
  function input(event) {
    const control = event.target;
    if (
      !session ||
      !control.matches("textarea[name],select[data-select]") ||
      control.readOnly
    )
      return;
    const actual = findSession();
    if (!actual) return;
    session = actual;
    session.fields[control.name] = control.value;
    save();
    const notice = container.querySelector("[data-storage]");
    if (notice)
      notice.innerHTML =
        escape(storageText(Store)) +
        ' <a href="#/ajustes">Privacidad y guardado</a>';
  }
  async function click(event) {
    const target = event.target.closest("button");
    if (!target || !container.contains(target) || target.disabled) return;
    error = "";
    if (target.dataset.scenario) {
      create(target.dataset.scenario);
      return;
    }
    if (target.hasAttribute("data-read")) {
      readText?.("Tu paso con BrainBox", container.dataset.editorial || "");
      return;
    }
    if (!session) return;
    if (target.hasAttribute("data-stop")) {
      stopped = true;
      session.status = "paused";
      session.fields.scope = "stop";
      session.fields.paused_reason =
        "Necesito ayuda o una valoración fuera de este recorrido";
      save();
      render(true);
      return;
    }
    if (target.hasAttribute("data-rescope")) {
      stopped = false;
      session.step = 0;
      session.fields.scope = "";
      session.status = "draft";
      save();
      render(true);
      return;
    }
    if (target.hasAttribute("data-pause")) {
      pauseOpen = true;
      render(true);
      return;
    }
    if (target.hasAttribute("data-cancel-pause")) {
      pauseOpen = false;
      render(true);
      return;
    }
    if (target.hasAttribute("data-save-pause")) {
      session.status = "paused";
      if (!value("paused_reason"))
        session.fields.paused_reason = "He decidido pausar por ahora.";
      save();
      pauseOpen = false;
      notify("Pausa registrada en Mi camino. " + storageText(Store));
      header(
        "Puedes dejarlo aquí por ahora",
        "La situación sigue abierta. Tus respuestas quedan en tu espacio según el modo de guardado elegido.",
        note(value("paused_reason")) +
          `<a class="lv-primary" href="#/micamino">Mi camino</a>`,
      );
      return;
    }
    if (target.dataset.choice) {
      session.fields[target.dataset.choice] = target.dataset.value;
      if (
        target.dataset.choice === "inversion_choice" &&
        target.dataset.value === "adoptar"
      )
        session.fields.unknown = SCENARIOS[session.scenario].question;
      save();
      render();
      return;
    }
    if (target.dataset.rung) {
      session.fields[target.dataset.rung + "_level"] = target.dataset.index;
      save();
      render();
      return;
    }
    if (target.dataset.face) {
      session.fields[target.dataset.face + "_face"] = target.dataset.value;
      save();
      render();
      return;
    }
    if (target.dataset.knowledge) {
      session.fields.knowledge_level = moveKnowledge(
        value("knowledge_level"),
        Number(target.dataset.knowledge),
      );
      save();
      render();
      return;
    }
    if (target.hasAttribute("data-example-back")) {
      session.fields.contrast_index = String(
        Math.max(0, Number(value("contrast_index")) - 1),
      );
      save();
      render(true);
      return;
    }
    if (target.hasAttribute("data-example-next")) {
      const i = Number(value("contrast_index"));
      if (!value("c" + i)) {
        error =
          "Elige qué te parece; puedes corregirlo después de ver la explicación.";
        render();
        return;
      }
      if (i < 2) session.fields.contrast_index = String(i + 1);
      else session.step = 6;
      save();
      render(true);
      return;
    }
    if (target.hasAttribute("data-direct")) {
      session.fields.route =
        "Vía breve elegida: ensayar una propuesta, sin clasificar mi estado";
      session.step = 7;
      save();
      render(true);
      return;
    }
    if (target.hasAttribute("data-next")) {
      if (isReturn) {
        const needed = {
          0: "return_done",
          1: "return_source",
          2: "return_worth",
          3: "return_attribution",
        };
        if (needed[session.returnStep] && !value(needed[session.returnStep])) {
          error =
            "Elige una opción; también puedes indicar que no lo sabes o no quieres contarlo.";
          render();
          return;
        }
        session.returnStep = Math.min(6, session.returnStep + 1);
      } else {
        if (!guardNext()) {
          render(true);
          return;
        }
        if (session.step === 1 && value("route") === "cuidado")
          session.step = 8;
        else session.step = Math.min(11, session.step + 1);
      }
      save();
      render(true);
      return;
    }
    if (target.hasAttribute("data-back")) {
      if (isReturn) {
        session.returnStep = Math.max(0, session.returnStep - 1);
        returnSaved = false;
      } else session.step = Math.max(0, session.step - 1);
      save();
      render(true);
      return;
    }
    if (target.hasAttribute("data-plan-save")) {
      await savePlan();
      return;
    }
    if (target.hasAttribute("data-return-save")) {
      saveReturn();
      return;
    }
    if (target.hasAttribute("data-copy")) {
      await copy(value("message"));
      return;
    }
    if (target.hasAttribute("data-copy-return")) {
      const r = buildLivingReturn(session);
      await copy(r.note + "\nMi decisión: " + r.next);
      return;
    }
    if (target.hasAttribute("data-new-loop")) {
      const previous = session,
        scenario = session.scenario;
      create(scenario);
      if (!session || session === previous) return;
      Object.assign(session.fields, buildLivingContinuation(previous));
      session.step = 0;
      save();
      location.hash = `#/vivir/${session.id}`;
      if (!isReturn) render(true);
    }
  }
  container.addEventListener("input", input);
  container.addEventListener("click", click);
  const cleanup = () => {
    alive = false;
    container.removeEventListener("input", input);
    container.removeEventListener("click", click);
    mounted.delete(container);
  };
  mounted.set(container, cleanup);
  render();
  return cleanup;
}
export const mountLivingJourney = (container, options) =>
  setup(container, options, false);
export const mountLivingReturn = (container, options) =>
  setup(container, options, true);

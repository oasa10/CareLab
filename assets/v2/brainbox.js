/* CareLab adaptation of Método BrainBox 1.2, edition 3, 14 October 2026.
 * Original interface: progressive questions, no assessment, no automated interpretation.
 * Source locators are exported for review. No private source documents are embedded.
 */
import * as Store from "./store.js";

const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let mountNumber = 0;
const mounted = new WeakMap();
const sessionDrafts = () => Store.get().drafts.brainbox;
let draftGeneration = 0;
export const hasBrainBoxDraft = () => Object.keys(sessionDrafts()).length > 0;
export const clearBrainBoxDrafts = (id) => {
  draftGeneration++;
  if (id) delete sessionDrafts()[id];
  else Store.get().drafts.brainbox = {};
};
export const brainboxFieldLabels = {
  situation: "Situación delimitada",
  action: "Acción mínima suficiente",
  support: "Apoyos y dependencias",
  stop: "Cuándo parar",
  review: "Resumen del retorno preparado",
  bb_version: "Versión de la adaptación",
  bb_route: "Ruta elegida",
  bb_story_in: "Historia de entrada (voluntaria)",
  bb_siento: "Siento",
  bb_actuo: "Me sale actuar",
  bb_pienso: "Pienso",
  bb_ciclo: "Ciclo de interacción",
  bb_saber: "Qué sé y con qué respaldo",
  bb_supuestos: "Qué estoy suponiendo",
  bb_duda: "Dónde termina lo que puedo justificar",
  bb_hacer: "Acción, aprendizaje y condiciones",
  bb_instrumento: "Instrumento elegido",
  bb_nota_instrumento: "Trabajo con el instrumento",
  bb_relato: "Relato voluntario, no resultado",
  bb_lentes: "Miradas provisionales elegidas",
  bb_entorno: "Entorno, recursos y barreras",
  bb_etica: "Personas afectadas, consentimiento y costes",
  bb_rev_que: "Qué observar en el retorno",
  bb_rev_quien: "Quién revisará",
  bb_rev_cuando: "Cuándo revisar",
  bb_rev_como: "Cómo comprobarlo",
  bb_rev_criterio: "Criterio para decidir",
  bb_rev_procedencia: "Procedencia prevista",
  bb_pausa: "Motivo de la pausa deliberada",
  bb_stage: "Momento de trabajo",
  bb_scope: "Ámbito cotidiano confirmado",
};
export const brainBoxLabels = brainboxFieldLabels;
export const brainboxCoverage = [
  {
    piece: "Cuatro ejes y tres capas",
    source: "§2, §2.2, §2.3",
    implementation:
      "SAP, contraste, acción y relato voluntario; ética y entorno editables; IA explicada como opcional y ausente en esta aplicación.",
  },
  {
    piece: "Hipótesis 1.1, tres rutas y STOP",
    source: "§3, §3.3, §9",
    implementation:
      "Elección manual según relaciones entre ejes; entrada de ámbito; sin inferencia por carga, ánimo ni perfil.",
  },
  {
    piece: "Intuición y oficio",
    source: "§3.5",
    implementation:
      "Ampliación sobre práctica reiterada, retorno inmediato, entorno regular, relación causa–efecto, contraste y respeto a la pericia.",
  },
  {
    piece: "SAP y 3–2",
    source: "§4.1",
    implementation:
      "Tres campos y tabla de nueve órdenes, como momentos; 3–2 orientativo, sin test ni puntuación.",
  },
  {
    piece: "Escalera del saber",
    source: "§4.2",
    implementation:
      "Ascenso, descenso y descanso de duda; separar respaldo, supuesto y límite de justificación.",
  },
  {
    piece: "Escalera del hacer",
    source: "§4.3",
    implementation:
      "Cinco peldaños en una tarea; apoyos, condiciones y contraste; dos nombres descendentes se conservan pendientes.",
  },
  {
    piece: "Relato",
    source: "§4.4",
    implementation:
      "Quién/con quién, hechos/obstáculos/apoyos y propósito; voluntario; no fabrica una historia de éxito.",
  },
  {
    piece: "Cinco pasos, AMV y REV",
    source: "§5, §5.1, §5.2",
    implementation:
      "Preparación de acción y retorno; hacer fuera de la pantalla; Vuelta enlaza revisión posterior con cuatro preguntas y procedencia.",
  },
  {
    piece: "Cuatro procesos e instrumentos A–F",
    source: "§6.1, §6.2",
    implementation:
      "Procesos visibles; seis fichas opcionales con finalidad, relación entre ejes, pregunta y nota editable. G no se aplica.",
  },
  {
    piece: "Ciclos y los dos caminos",
    source: "§7, §8",
    implementation:
      "Señal→reacción→efecto→vuelta; nota contextual y tres vueltas sin clasificación automática; verdad incómoda sólo cotidiana, reversible y voluntaria.",
  },
  {
    piece: "Seis reglas y ocho compromisos",
    source: "Apertura, §9",
    implementation:
      "Ayuda contextual íntegra y límites de uso; salida y pausa disponibles.",
  },
  {
    piece: "Episodio de siete tiempos",
    source: "§14.3, tabla de episodio",
    implementation:
      "Adaptación de CareLab: sin reloj obligatorio, desbloqueos, competición ni relato impuesto; conserva el vínculo con cinco pasos.",
  },
  {
    piece: "MetaBrainBox",
    source: "§17.1, MetaBrainBox",
    implementation:
      "Revisión de utilidad/carga del método en el retorno; propuesta de cambio de una pieza, con motivo y revisión. No cambia el canon ni aprende automáticamente.",
  },
];
const routes = [
  [
    "cuidado",
    "Cuidar lo que funciona",
    "En esta situación, lo que siento y me sale actuar se comunica con lo que elijo hacer. Saber y relato acompañan.",
    "Conserva lo que ayuda. Una acción para cuidarlo y un retorno bastan; no hace falta abrir más preguntas.",
  ],
  [
    "apoyo",
    "Recuperar la conexión",
    "En esta situación, Ser y Hacer se han desconectado. Necesito un apoyo concreto de conocimiento o relato para volver a actuar.",
    "Abre sólo la pregunta o el apoyo que falta. Añadir explicaciones sin necesidad también añade carga.",
  ],
  [
    "gestion",
    "Volver de la explicación a la acción",
    "En esta situación, saber, explicar o contar ocupan el lugar de lo que siento y de lo que hago.",
    "Reordena lo acumulado y prepara un paso posible. Revisa con la frecuencia que pida el contexto; considera acompañamiento.",
  ],
];
const stages = [
  [
    "Choque",
    "Situar · eje I",
    "Algo pide atención.",
    "Delimita una situación cotidiana. Puedes entrar por lo que te cuentas y volver a lo que sientes; no necesitas narrar tu intimidad.",
  ],
  [
    "Reflejo",
    "Situar · eje I",
    "Lo que sale antes de elegir.",
    "Distingue cómo te sale actuar de lo que después decidirás hacer. Observarlo no convierte una reacción en una identidad.",
  ],
  [
    "Giro",
    "Comprender y elegir · I → II",
    "Una pregunta que abre una posibilidad.",
    "Elige la ruta por la relación entre los ejes en esta situación. No describe tu estado de ánimo ni el tipo de persona que eres.",
  ],
  [
    "Peldaño",
    "Comprender y elegir · eje II",
    "Sólo el saber que hace falta.",
    "Separa lo respaldado de lo supuesto. No necesitas entenderlo todo para preparar un paso cotidiano seguro.",
  ],
  [
    "Misión",
    "Preparar · eje III",
    "Un paso que quepa en la vida.",
    "Prepara una acción mínima, viable y suficiente, y el retorno antes de probarla. También puedes decidir una pausa explicada.",
  ],
  [
    "Tu historia",
    "Creer / crear · eje IV",
    "Una historia que sigue siendo tuya.",
    "Puedes revisar lo que te cuentas, formular una posibilidad o dejarlo en blanco. Una intención no es un hecho ocurrido.",
  ],
  [
    "Vuelta",
    "Hacer y observar → revisar y decidir",
    "Volver con lo que ocurrió.",
    "La acción sucede en tu contexto. Después se registra el retorno: no hace falta que sea favorable para ayudar a decidir.",
  ],
];
const instruments = [
  [
    "A",
    "Contrastar una experiencia",
    "Ser → Saber",
    "¿Qué interpretación doy a esta experiencia y qué referencia externa permite contrastarla?",
    "Pon la experiencia junto a una referencia pertinente. Separa lo sentido de la interpretación; termina en una decisión, no en un juicio sobre ti.",
  ],
  [
    "B",
    "Examinar una repercusión",
    "Saber → Ser",
    "¿Cómo repercute en lo que siento, me sale actuar y pienso algo que ahora sé?",
    "Partiendo de un conocimiento respaldado, observa su repercusión en SAP y elige una respuesta cotidiana. No equivale a tratamiento psicológico.",
  ],
  [
    "C",
    "Localizar la dificultad propia",
    "Saber ↔ Hacer · quien practica",
    "¿En qué parte de esta tarea encuentro dificultad y qué prueba con apoyos puedo preparar?",
    "Distingue comprender, ejecutar y sostener la tarea en estas condiciones. No conviertas una barrera del entorno en incapacidad personal.",
  ],
  [
    "D",
    "Justificar la ayuda",
    "Saber ↔ Hacer · quien acompaña",
    "¿Para qué dificultad concreta ofrezco esta ayuda y cómo comprobaré si puede retirarse o ajustarse?",
    "Explica finalidad, acuerdo y ajuste del apoyo. Hacer por la otra persona no demuestra que ella pueda hacerlo después sin ayuda.",
  ],
  [
    "E",
    "Formular posibilidades",
    "Hacer → Creer / crear",
    "¿Qué posibilidad realista abre lo hecho, sin inventar lo que aún no ocurrió?",
    "Describe hechos disponibles, apoyos y una alternativa posible. No exige optimismo, crecimiento ni una historia de superación.",
  ],
  [
    "F",
    "Revisar la orientación",
    "Creer / crear → Ser, Saber, Hacer",
    "¿La dirección que propongo concuerda con lo que vivo, lo que sé y lo que puedo hacer?",
    "Contrasta el propósito con los otros tres ejes. Puedes mantenerlo, ajustarlo, reducirlo o dejarlo; no se obliga a perseverar.",
  ],
];
const rules = [
  "Trabajar situaciones y ciclos, no etiquetar personas.",
  "No diagnosticar ni medir a las personas.",
  "Cerrar con una acción y un retorno, o con una pausa deliberada y explicada.",
  "Mantener el relato voluntario, realista y contrastable.",
  "La IA es opcional y nunca decide ni juzga.",
  "Parar ante riesgo, falta de competencia o condiciones, perjuicio, coerción o petición de detenerse.",
];
const commitments = [
  "Persona situada",
  "Agencia con apoyos",
  "Bienestar plural",
  "Conocimiento revisable",
  "Práctica proporcionada",
  "Retorno informativo",
  "Relato libre y contrastable",
  "Rectificación efectiva",
];
const fieldKeys = Object.keys(brainboxFieldLabels);

export function mountBrainBox(
  container,
  {
    action = null,
    onSave = async () => {
      throw new Error("El guardado no está conectado todavía.");
    },
    onReview = () => {},
  } = {},
) {
  if (!(container instanceof Element))
    throw new TypeError("Falta el contenedor del recorrido BrainBox.");
  mounted.get(container)?.();
  const controller = new AbortController(),
    { signal } = controller;
  const id = `bb-${++mountNumber}`;
  const generation = draftGeneration;
  const workspace = Store.get();
  let cacheKey = action?.id || "new";
  const cached = sessionDrafts()[cacheKey];
  let saved = action ? structuredClone(action) : null;
  let draft = {
    title: action?.title || "",
    owner: action?.owner || "Yo",
    due: action?.due || "",
    status: action?.status || "propuesto",
    ...Object.fromEntries(
      fieldKeys.map((k) => [k, String(action?.fields?.[k] ?? "")]),
    ),
  };
  if (cached?.draft) draft = { ...draft, ...cached.draft };
  draft.bb_version = "BrainBox 1.2 · CareLab 2.0";
  let stage = Math.max(
      0,
      Math.min(6, Number(cached?.stage ?? draft.bb_stage) || 0),
    ),
    entered = cached?.entered ?? !!action?.fields?.bb_scope,
    busy = false,
    dirty = !!cached;
  const recoveryText = () => {
    const status = Store.getStorageStatus();
    if (status.error) return status.error;
    return (
      (status.mode === "device"
        ? "El borrador se conserva en este dispositivo. "
        : status.mode === "session"
          ? "El borrador se recupera al recargar esta pestaña. Para conservarlo entre visitas, activa el guardado o exporta una copia. "
          : "Todavía no hay cambios conservados. ") +
      "Sólo se incorpora al plan al guardar la acción. No se envía a otras personas."
    );
  };
  const cache = () => {
    // A restored/reset workspace has a new identity: an old form must never write
    // its draft back over a newly imported or erased snapshot during cleanup.
    if (dirty && generation === draftGeneration && workspace === Store.get()) {
      sessionDrafts()[cacheKey] = { draft: { ...draft }, stage, entered };
      Store.save();
      const label = container.querySelector(".bb-local");
      if (label) label.textContent = recoveryText();
    }
  };
  const cleanup = () => {
    cache();
    controller.abort();
    if (mounted.get(container) === cleanup) mounted.delete(container);
  };
  mounted.set(container, cleanup);
  const field = (key, label, hint = "", type = "textarea") =>
    `<div class="bb-field"><label for="${id}-${key}">${label}</label>${type === "textarea" ? `<textarea id="${id}-${key}" name="${key}" rows="3" maxlength="4000" aria-describedby="${id}-${key}-hint">${esc(draft[key])}</textarea>` : `<input id="${id}-${key}" name="${key}" value="${esc(draft[key])}" maxlength="${key === "title" ? 220 : 500}" aria-describedby="${id}-${key}-hint">`}<small id="${id}-${key}-hint">${hint}</small></div>`;
  const details = (title, body, open = false) =>
    `<details class="bb-detail" ${open ? "open" : ""}><summary>${title}</summary><div>${body}</div></details>`;
  const note = (body) => `<p class="bb-note">${body}</p>`;
  const source = (where) =>
    `<p class="bb-source">Base: Método BrainBox 1.2 · ${where}. Adaptación de preguntas y ejemplos para CareLab.</p>`;
  function notice(message, error = false) {
    const node = container.querySelector(".bb-message");
    if (node) {
      node.textContent = message;
      node.classList.toggle("bb-error", error);
      node.focus();
    }
  }
  const sapHelp = () =>
    details(
      "SAP: sentir, actuar y pensar; no es un test",
      `<p><strong>Actuar</strong> es lo espontáneo o aprendido que sale en ese momento. <strong>Hacer</strong> es el acto elegido para un propósito. No hay un orden «bueno» para toda tarea ni una clasificación de personas.</p><div class="bb-table-wrap"><table><caption>Nueve órdenes posibles en momentos concretos (§4.1)</caption><thead><tr><th>Modo</th><th>Base</th><th>Variante</th><th>Extremo</th></tr></thead><tbody><tr><th>Automático</th><td>S–A–P</td><td>S–P–A · entrenado</td><td>S–A · puro</td></tr><tr><th>Entrenamiento</th><td>P–A–S</td><td>P–S–A · contaminado</td><td>P–S · bloqueado</td></tr><tr><th>Reto</th><td>A–S–P</td><td>A–P–S · contaminado</td><td>A–S · óptimo</td></tr></tbody></table></div><p>Los nombres pertenecen al esquema del método. Describen secuencias situadas, no diagnósticos, grados de valor personal ni una prueba de competencia. No interrumpas una tarea experta o sensible para completar una introspección.</p>${note("<strong>Regla 3–2:</strong> como ayuda para no acumular, hasta tres elementos por casilla y dos variables por elemento. Menos puede bastar. No es una dosis ni un tiempo obligatorio; lo que sientes no se descarta como «ruido».")}`,
    );
  const cycleHelp = () =>
    details(
      "Mirar el ciclo entre personas",
      `<ol class="bb-flow"><li><strong>Señal</strong><span>Qué hace o dice alguien.</span></li><li><strong>Reacción</strong><span>Cómo responden las demás personas.</span></li><li><strong>Efecto</strong><span>Qué cambia en la persona y la relación.</span></li><li><strong>Vuelta</strong><span>Cómo vuelve o cambia la señal.</span></li></ol><p>Ejemplo ficticio: pido ayuda de forma imprecisa → responden «avísame» → sigo coordinándolo todo → vuelvo a pedir cuando ya no puedo más. Una propuesta posible es acordar una cadena completa y revisar el efecto, si hay aceptación y condiciones.</p>${field("bb_ciclo", "¿Qué secuencia puedes describir sin etiquetar a nadie?", "Puedes anotar una sola vuelta o lo que aún no sabes. Describir el sistema no iguala las responsabilidades.")}<p>El canon propone mirar las tres últimas vueltas: tres a mejor, tres a peor o mezcla/sin cambio. Es una lectura del ciclo, no una escala validada; con datos insuficientes, no se clasifica. El nombre intermedio «vaivén / transición» sigue pendiente.</p>${source("§7")}`,
    );
  const instrumentHelp = () =>
    details(
      "Profundizar sólo si hace falta: instrumentos A–F",
      `<p>Elige como máximo el instrumento que ahora te aporte algo; no hay que completar los seis. Son apoyos a procesos, no seis pasos obligatorios.</p><div class="bb-instruments">${instruments.map(([code, title, axes, q, why]) => `<article><span class="bb-chip">${code} · ${axes}</span><h4>${title}</h4><p>${q}</p><p class="bb-small">${why}</p><button type="button" class="bb-button bb-secondary" data-instrument="${code}" aria-pressed="${draft.bb_instrumento === code}">Trabajar con ${code}</button></article>`).join("")}</div><p class="bb-selection">${draft.bb_instrumento ? "Instrumento elegido: " + esc(draft.bb_instrumento) : "Ningún instrumento elegido. Puedes continuar así."}</p>${field("bb_nota_instrumento", "Nota de trabajo con el instrumento (opcional)", "Anota la pregunta, el contraste disponible y la decisión o prueba que permite preparar.")}<button type="button" class="bb-link" data-instrument="">Retirar la elección del instrumento</button>${note("<strong>G · Conocerse en acto</strong> está propuesto, aún sin diseñar: no se aplica aquí. Tampoco hay un instrumento directo Saber↔Relato. No se inventa ninguno para completar el esquema.")}${source("§6.2")}`,
    );
  function foundation() {
    return details(
      "Ver el método por dentro: cuatro ejes, cinco pasos y sus límites",
      `<div class="bb-axes"><article><b>I · Ser</b><p>Qué siento, cómo me sale actuar y qué pienso: SAP.</p></article><article><b>II · Saber</b><p>Qué sé con respaldo y qué supongo.</p></article><article><b>III · Hacer</b><p>Qué decido hacer, para qué y con qué apoyos.</p></article><article><b>IV · Creer / crear</b><p>Qué historia me cuento y qué dirección quiero construir.</p></article></div><p>Los ejes se contrastan entre sí. Sentir algo no prueba su causa; conocer no prueba que se sepa hacer; hacer no vuelve una acción ética; una historia coherente no demuestra que sea verdadera.</p><h4>Cinco pasos del método</h4><ol><li>Situar.</li><li>Comprender y elegir.</li><li>Preparar la acción mínima y el retorno.</li><li>Hacer y observar, en tu contexto.</li><li>Revisar y decidir.</li></ol><p>Las siete pantallas organizan un episodio; no sustituyen estos cinco pasos. Puedes volver, saltar una ampliación y detenerte. CareLab adapta el episodio al cuidado: sin cuenta atrás obligatoria, desbloqueos, competición, rachas ni historias impuestas.</p><h4>Cuatro procesos que conectan ejes</h4><ul><li><strong>Decidir:</strong> Ser → Saber.</li><li><strong>Crear y mantener hábitos:</strong> Saber → Hacer.</li><li><strong>Relatar:</strong> Hacer → Creer / crear.</li><li><strong>Cuidar el bienestar:</strong> Creer / crear → Ser.</li></ul><p>Un proceso puede ocurrir sin una ficha. No hay correspondencia obligatoria de un instrumento por proceso.</p><h4>Tres capas en todo el recorrido</h4><p><strong>Ética:</strong> voz, dignidad, consentimiento, costes y derecho a parar. <strong>Entorno:</strong> tiempo, recursos, barreras, reglas y responsabilidades. <strong>IA:</strong> opcional, nunca juez ni evidencia. Este recorrido no usa una IA para interpretar tus respuestas, elegir tu ruta o generar tu relato.</p><h4>Seis reglas</h4><ul>${rules.map((x) => `<li>${x}</li>`).join("")}</ul><h4>Ocho compromisos</h4><p>${commitments.join(" · ")}.</p><p>Se respeta «prefiero no compartirlo». Conocer el método no da atribuciones profesionales. No se aplica directamente a menores sin adaptar participación, apoyos y responsabilidades.</p><h4>Qué sigue abierto</h4><p>El instrumento G, dos términos del descenso de la escalera del hacer, la alegoría SAP, el nombre de los ciclos intermedios y algunas correspondencias de cadena/manillar siguen pendientes en el documento. Esta interfaz no los resuelve ni presenta el método como eficacia clínica demostrada. La hipótesis mantiene el nombre 1.1 dentro de la versión 1.2.</p>${source("§§2–9, §14.3; edición 3, 14/10/2026")}`,
    );
  }
  function content() {
    if (stage === 0)
      return (
        field(
          "situation",
          "¿Qué pasa y qué necesitas decidir?",
          "Una situación, entre quiénes, cuándo y en qué condiciones. Usa roles o iniciales.",
        ) +
        field(
          "bb_siento",
          "¿Qué sientes ante esa situación? (opcional)",
          "Puedes nombrarlo brevemente, dejarlo sin responder o escribir «prefiero no compartirlo».",
        ) +
        details(
          "Entrar por tu historia, si te sirve",
          field(
            "bb_story_in",
            "¿Qué te estás contando sobre esta situación?",
            "Es un punto de partida voluntario, no una explicación que haya que aceptar.",
          ),
        ) +
        note(
          "Ejemplo ficticio: «Después de cada cita, yo coordino transporte, recetas y avisos. Necesito decidir qué cadena puedo compartir».",
        ) +
        source("§2, §4.1, §5, §14.3")
      );
    if (stage === 1)
      return (
        field(
          "bb_actuo",
          "¿Cómo te sale actuar ahora? (opcional)",
          "Por ejemplo: responder que sí antes de saber si puedo. Describe un momento, no «yo soy así».",
        ) +
        field(
          "bb_pienso",
          "¿Qué piensas en ese momento? (opcional)",
          "Distingue el pensamiento de un hecho comprobado.",
        ) +
        sapHelp() +
        cycleHelp() +
        source("§4.1, §7, §14.3")
      );
    if (stage === 2)
      return `<fieldset class="bb-routes"><legend>¿Qué relación reconoces aquí?</legend>${routes.map(([key, title, description]) => `<label class="bb-route"><input type="radio" name="bb_route" value="${key}" ${draft.bb_route === key ? "checked" : ""}><span><strong>${title}</strong><small>${description}</small></span></label>`).join("")}</fieldset><p class="bb-route-note">${esc(routes.find((r) => r[0] === draft.bb_route)?.[3] || "Si no lo sabes, puedes volver a la situación o preparar una consulta. No tienes que aceptar una etiqueta.")}</p>${details("Cuando una explicación me impide dar un paso", `<p>Sólo para algo cotidiano, seguro, reversible y que quieras explorar. Si toca riesgo o una situación médica, psicológica o legal, detén el método y busca ayuda competente.</p><ol><li>Nombra la señal, sin una historia larga.</li><li>Si fuera cierta, ¿qué cambio cotidiano sería pertinente?</li><li>¿Qué explicación dio alivio sin cambiar la situación?</li><li>¿Qué parte puedes mirar sin forzarte?</li><li>Prepara una acción o una pausa, y un retorno.</li></ol><p>No exige confesión, castigo, abrirlo todo ni aceptar la interpretación de otra persona. «Entendí mi patrón» aún necesita contraste con lo que ocurra. CareLab no impone los tiempos orientativos del ejemplo original.</p>${source("§8")}`)}${details("Intuición y oficio: cuando explicarlo todo estorba", `<p>Una respuesta experta puede condensar aprendizaje en una tarea y un contexto con regularidades. El canon concreta cuatro condiciones: práctica reiterada, retorno inmediato, entorno regular y relación directa entre causa y efecto. La seguridad con que se afirma una intuición no sustituye esas condiciones ni el contraste.</p><p>No exijas explicitar cada operación si eso interfiere con una pericia bien establecida. Contrasta con el resultado y las condiciones; si cambia el contexto, faltan retornos o la consecuencia es delicada, no des por garantizada la intuición ni suplas ayuda competente.</p>${source("§3.5")}`)}${source("§3.3; hipótesis 1.1")}`;
    if (stage === 3)
      return (
        note(
          draft.bb_route === "cuidado"
            ? "Tu ruta conserva lo que funciona. Puedes dejar esta ampliación en blanco si no necesitas más saber."
            : "Busca el mínimo respaldo útil para la decisión. Puedes detenerte donde acaba lo justificable.",
        ) +
        field(
          "bb_saber",
          "¿Qué sabes y de dónde procede?",
          "Hechos, acuerdos, fuente y fecha si la conoces. Una respuesta automática no es evidencia.",
        ) +
        field(
          "bb_supuestos",
          "¿Qué estás suponiendo?",
          "Qué falta confirmar, con quién o mediante qué fuente.",
        ) +
        field(
          "bb_duda",
          "¿Dónde termina lo que puedes justificar?",
          "Puedes decir «no lo sé todavía» y limitar la acción en consecuencia.",
        ) +
        details(
          "Escalera del saber: subir, contrastar y descansar en la duda",
          `<ol><li><strong>Ruido:</strong> lo que aún no está delimitado ni contrastado; puede ser pertinente y no invalida la experiencia emocional.</li><li><strong>Datos:</strong> registros con procedencia.</li><li><strong>Información:</strong> datos organizados para una pregunta.</li><li><strong>Conocimiento:</strong> una regla o explicación respaldada, con condiciones.</li><li><strong>Entendimiento:</strong> saber cuándo y cómo tiene sentido aplicarlo.</li></ol><p>El descenso advierte de <strong>pseudodato → desinformación → pseudoconocimiento → insensatez</strong>. Nombra problemas de información y aplicación, nunca el valor de una persona.</p><p><strong>Descanso de duda:</strong> reconocer hasta dónde alcanza la justificación. Es revisable al llegar nueva información; no es un fallo ni permite rellenar huecos con certeza inventada.</p>${source("§4.2")}`,
        ) +
        instrumentHelp() +
        source("§4.2, §6")
      );
    if (stage === 4)
      return `<div class="bb-two">${field("title", "Nombre de este paso", "Un título que puedas reconocer en tu plan.", "text")}${field("owner", "¿Quién asume el paso?", "Rol o iniciales. No atribuyas aceptación que no has confirmado.", "text")}</div>${field("action", "¿Qué eliges hacer y para qué?", "Puede ser reducir, compartir, pedir apoyo, conservar algo útil o retirar una carga. Si has decidido pausar, explica abajo el motivo.")}${field("due", "¿En qué ocasión o fecha?", "Una ocasión concreta; el método no impone un plazo.", "text")}${field("support", "¿Qué apoyos, acuerdos o condiciones necesita?", "Distingue disponibilidad confirmada de una propuesta pendiente.")}${field("stop", "¿Qué haría necesario parar o cambiar?", "Incluye falta de cobertura, perjuicio, pérdida de consentimiento o condiciones indispensables.")}<div class="bb-field"><label for="${id}-status">Estado real que registras</label><select id="${id}-status" name="status"><option value="propuesto" ${draft.status === "propuesto" ? "selected" : ""}>Propuesta · falta concretar o acordar</option><option value="aceptado" ${draft.status === "aceptado" ? "selected" : ""}>Aceptado · lo he confirmado</option><option value="realizado" ${draft.status === "realizado" ? "selected" : ""}>Realizado · ya ocurrió, según mi registro</option><option value="pausado" ${draft.status === "pausado" ? "selected" : ""}>Pausa deliberada</option></select><small>Preparar este formulario no confirma un acuerdo ni realiza la acción.</small></div>${details("Si decides una pausa", field("bb_pausa", "¿Por qué pausas y qué permitiría reconsiderarlo?", "Parar puede ser la decisión adecuada. No suspende cuidados necesarios ni la búsqueda de ayuda competente."), draft.status === "pausado")}<section class="bb-return"><p class="bb-kicker">PREPARAR EL RETORNO · REV</p><h3>Antes de probarlo, acuerda cómo volver.</h3>${field("bb_rev_que", "¿Qué observarás?", "Separa si se hizo, qué ocurrió, para quién mereció la pena y qué se puede atribuir. En pausa, qué condición revisarás.")}${field("bb_rev_quien", "¿Quién revisará?", "La persona o rol que podrá contrastar lo ocurrido.", "text")}${field("bb_rev_cuando", "¿En qué ocasión revisaréis?", "Una fecha o una ocasión identificable.", "text")}${field("bb_rev_como", "¿Cómo se comprobará?", "Un registro, una conversación acordada, observar una tarea u otro procedimiento pertinente.")}${field("bb_rev_criterio", "¿Qué criterio orientará mantener, ajustar o parar?", "Por ejemplo: si la cadena vuelve a depender de mí, revisaremos el reparto; si añade carga, reduciremos el paso.")}${field("bb_rev_procedencia", "¿De dónde vendrá la información?", "Quién lo contará o comprobará, cómo y cuándo. Lo previsto no es todavía un retorno observado.")}</section>${details("Escalera del hacer: qué apoyo necesita esta tarea", `<ol><li><strong>Aptitud:</strong> condiciones y posibilidad para esta tarea.</li><li><strong>Habilidad:</strong> poder ejecutarla.</li><li><strong>Destreza:</strong> afinar su ejecución.</li><li><strong>Competencia:</strong> actuar adecuadamente en contexto.</li><li><strong>Experiencia cultivada:</strong> práctica revisada que permite adaptar lo aprendido.</li></ol><p>El descenso nombra inaptitud, torpeza e incompetencia; los opuestos de destreza y experiencia cultivada siguen pendientes. No se inventan términos ni se etiqueta a personas.</p><p>Una ejecución con ayuda no prueba retención ni transferencia a otra situación. La ocasión y la motivación importan; falta de tiempo, recursos o cobertura no equivale a incapacidad personal.</p>${field("bb_hacer", "¿Qué parte necesita preparación, práctica o apoyo? (opcional)", "Especifica una tarea y sus condiciones, no un nivel global de persona.")}${source("§4.3")}`)}${details("Entorno y ética: para quién y a qué coste", field("bb_entorno", "¿Qué recursos y barreras no dependen sólo de ti?", "Tiempo, servicios, reglas, condiciones laborales, dinero, accesibilidad y responsabilidades institucionales.") + field("bb_etica", "¿Quién se ve afectado y qué debe respetarse?", "Voz, consentimiento, intimidad, costes y derecho de todas las partes a pedir un cambio."))}${source("§4.3, §5.1–5.2, §9")}`;
    if (stage === 5)
      return (
        note(
          "Puedes omitir esta parte. No hace falta acabar con una historia positiva ni atribuir al método un cambio que todavía no has observado.",
        ) +
        field(
          "bb_relato",
          "¿Qué historia quieres conservar, revisar o construir? (opcional)",
          "Distingue hechos ocurridos, interpretaciones e intenciones. No hace falta compartir vivencias íntimas.",
        ) +
        details(
          "Tres apoyos para un relato libre",
          `<ul><li><strong>Protagonista:</strong> quién decide y con quién cuenta.</li><li><strong>Guion:</strong> qué ocurrió, qué obstáculos y apoyos existen.</li><li><strong>Objetivo:</strong> qué dirección eliges sin prometer control total.</li></ul><p><strong>Creer</strong> mira la historia que te cuentas; <strong>crear</strong> abre una dirección posible. Reencuadrar, recontextualizar o resignificar no cambia los hechos. No se fuerza la gratitud, el perdón, el optimismo ni el crecimiento.</p><p>Ejemplo de intención, no resultado: «No necesito sostener esta cadena a solas; voy a preguntar si podemos repartirla con un acuerdo verificable».</p>${source("§4.4")}`,
        ) +
        source("§4.4, §14.3")
      );
    return `<div class="bb-output"><p class="bb-kicker">${saved ? "EPISODIO GUARDADO EN TU PLAN" : "TODAVÍA SIN GUARDAR"}</p><h3>${esc(draft.title || "Tu acción o pausa")}</h3><p>${esc(draft.status === "pausado" ? draft.bb_pausa : draft.action) || "Vuelve a Misión para concretar un paso o una pausa."}</p><dl><dt>Responsable</dt><dd>${esc(draft.owner || "Por concretar")}</dd><dt>Ocasión</dt><dd>${esc(draft.due || "Por concretar")}</dd><dt>Retorno</dt><dd>${esc(draft.bb_rev_cuando || "Por concretar")}</dd><dt>Criterio</dt><dd>${esc(draft.bb_rev_criterio || "Por concretar")}</dd></dl></div><p><strong>Hacer y observar:</strong> lleva el paso a tu contexto cuando haya condiciones. Este recorrido no confirma aceptación de terceros, no envía solicitudes y no sustituye lo que corresponde a un servicio o profesional.</p><div class="bb-four"><article><b>1. ¿Se hizo?</b><p>No ocurrió, no se observó y la persona prefirió no contarlo son situaciones distintas.</p></article><article><b>2. ¿Qué pasó?</b><p>Qué cambió, cuándo y quién lo vio; incluye efectos no esperados.</p></article><article><b>3. ¿Mereció la pena?</b><p>Para quién, con qué beneficio, coste, carga o conflicto.</p></article><article><b>4. ¿Qué se puede atribuir?</b><p>Qué relación puede justificarse y qué otras condiciones influyeron.</p></article></div><p>No se suman estas cuatro respuestas. Simulado, declarado y comprobado independientemente son procedencias distintas. CareLab guarda lo que declaras; no certifica por sí mismo una verificación.</p>${saved ? `<button type="button" class="bb-button" data-review ${dirty ? "disabled" : ""}>Registrar un retorno real o una ausencia de información</button>${dirty ? '<p class="bb-small">Guarda primero los cambios de preparación para que el retorno quede conectado a esa versión.</p>' : ""}` : note("Guarda primero el episodio preparado; después podrás volver y registrar lo ocurrido.")}<a class="bb-link" href="#/plan">Ir a mi plan</a>${details("MetaBrainBox: revisar también el método", `<p>¿Este recorrido te ayudó o añadió carga? En la revisión puedes dejar una nota y proponer simplificar, retirar o cambiar una pieza.</p><ol><li>Sitúa la dificultad concreta de uso.</li><li>Comprende y elige una sola pieza a cambiar.</li><li>Prepara el cambio, su motivo y el retorno.</li><li>Pruébalo dentro de los límites de uso.</li><li>Revisa antes de conservarlo.</li></ol><p>Una propuesta local no modifica automáticamente BrainBox ni demuestra su eficacia. Los cambios del producto necesitan revisión y versión; la aplicación no aprende de tus datos ni los envía al equipo.</p>${source("§17.1 · MetaBrainBox")}`)}${source("§5.2; §14.3")}`;
  }
  function render(focus = false) {
    draft.bb_stage = String(stage);
    cache();
    if (!entered) {
      container.innerHTML = `<section class="bb-shell"><header class="bb-brand"><span class="bb-mark" aria-hidden="true">B<span>×</span></span><div><p class="bb-kicker">CARELAB · MÉTODO BRAINBOX 1.2</p><h1>De lo que te pasa<br>a un paso con retorno.</h1><p>Un espacio para una situación cotidiana, con la profundidad que necesites. Sin test, puntuaciones ni itinerario obligatorio.</p></div></header><div class="bb-gate"><h2>Primero, el ámbito y los límites.</h2><p>Si hay riesgo para alguien o se trata de una situación médica, psicológica o legal, <strong>no se aplica BrainBox</strong>: se busca ayuda competente. Organizar una consulta es distinto de resolver esa decisión.</p><div class="bb-gate-grid"><button class="bb-gate-choice" type="button" data-enter="cotidiano"><strong>Es una organización cotidiana, segura y reversible</strong><span>Puedo preparar una acción con sus apoyos y revisión.</span></button><a class="bb-gate-choice" href="#/tool/consulta"><strong>Necesito una decisión o apoyo profesional</strong><span>Preparar lo que quiero consultar y la información pertinente.</span></a><a class="bb-gate-choice bb-gate-stop" href="#/ayuda"><strong>Hay riesgo o necesito ayuda ahora</strong><span>Salir del método y encontrar apoyo.</span></a></div>${details("Dosificar la profundidad: el semáforo del método", `<ul><li><strong>Verde:</strong> cotidiano, seguro y reversible; recorrido normal.</li><li><strong>Ámbar:</strong> carga emocional alta, prisa o vueltas repetidas; reducir a un paso y dosificar.</li><li><strong>Rojo:</strong> sensibilidad o impacto altos; sólo con límites, revisión y apoyo profesional. Este espacio autónomo te orienta a preparar ese apoyo.</li><li><strong>STOP:</strong> riesgo o situación médica, psicológica o legal; no aplicar el método y pedir ayuda competente.</li></ul><p>No calculamos un color a partir de tus respuestas. Puedes detenerte cuando quieras, sin tener que justificar una exploración personal.</p>`)}${foundation()}</div></section>`;
      return;
    }
    draft.bb_stage = String(stage);
    container.innerHTML = `<section class="bb-shell"><header class="bb-brand bb-brand-compact"><span class="bb-mark" aria-hidden="true">B<span>×</span></span><div><p class="bb-kicker">CARELAB · MÉTODO BRAINBOX 1.2</p><h1>Un episodio, a tu medida.</h1><p>Ser · Saber · Hacer · Creer / crear</p></div><button class="bb-link" type="button" data-gate>Revisar ámbito / parar</button></header><nav class="bb-stages" aria-label="Momentos abiertos del episodio">${stages.map(([title], i) => `<button type="button" data-stage="${i}" ${stage === i ? 'aria-current="step"' : ""}><span aria-hidden="true">${i + 1}</span>${title}</button>`).join("")}</nav><div class="bb-layout"><section class="bb-main" aria-label="Trabajo del episodio"><form novalidate><p class="bb-kicker">${stages[stage][1]}</p><h2 tabindex="-1" class="bb-stage-title">${stages[stage][2]}</h2><p class="bb-intro">${stages[stage][3]}</p>${content()}<p class="bb-message" role="status" tabindex="-1"></p><div class="bb-navigation">${stage > 0 ? '<button class="bb-button bb-secondary" type="button" data-prev>Anterior</button>' : ""}${stage < 6 ? `<button class="bb-button" type="button" data-next>${stage === 4 ? "Continuar · historia opcional" : "Continuar"}</button>` : ""}${stage >= 4 ? `<button class="bb-button ${stage < 6 ? "bb-secondary" : ""}" type="submit" ${busy ? "disabled" : ""}>${saved ? "Guardar cambios del episodio" : "Guardar acción o pausa en mi plan"}</button>` : ""}</div><p class="bb-small bb-local">${esc(recoveryText())}</p></form></section><aside class="bb-aside"><p class="bb-kicker">LO QUE TE LLEVAS</p><h3>Una decisión. <br>Una acción o pausa. <br>Un retorno.</h3><p>Tu necesidad y tu contexto guían cuánto abrir. No hace falta responderlo todo ni hacerlo hoy.</p>${draft.bb_route ? `<p class="bb-route-summary"><strong>Ruta de ${esc(draft.bb_route === "gestion" ? "gestión" : draft.bb_route)}</strong><br>${esc(routes.find((r) => r[0] === draft.bb_route)?.[3] || "")}</p>` : ""}<p class="bb-small">Si aparece riesgo o una situación médica, psicológica o legal, no apliques el método. La logística cotidiana puede preparar la ayuda competente.</p><a class="bb-link" href="#/tool/consulta">Preparar una consulta</a><a class="bb-link" href="#/ayuda">Encontrar apoyo</a><button class="bb-link" type="button" data-stage="4">Ir a acción o pausa</button></aside></div>${foundation()}</section>`;
    if (focus) {
      const heading = container.querySelector(".bb-stage-title");
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }
  function readInput(target) {
    const key = target.name;
    if (!key || !Object.hasOwn(draft, key)) return;
    if (target.type === "radio" && !target.checked) return;
    draft[key] = target.value;
    dirty = true;
    cache();
  }
  container.addEventListener("input", (e) => readInput(e.target), { signal });
  container.addEventListener(
    "change",
    (e) => {
      readInput(e.target);
      if (e.target.name === "bb_route") {
        const n = container.querySelector(".bb-route-note");
        if (n)
          n.textContent =
            routes.find((r) => r[0] === draft.bb_route)?.[3] || "";
      }
    },
    { signal },
  );
  container.addEventListener(
    "click",
    (e) => {
      const button = e.target.closest("button");
      if (!button || !container.contains(button) || busy) return;
      if (button.hasAttribute("data-enter")) {
        if (!saved) dirty = true;
        entered = true;
        draft.bb_scope = "organizacion-cotidiana";
        render(true);
      } else if (button.hasAttribute("data-gate")) {
        if (!saved) dirty = true;
        entered = false;
        render();
      } else if (button.hasAttribute("data-stage")) {
        if (!saved) dirty = true;
        stage = Number(button.dataset.stage);
        render(true);
      } else if (button.hasAttribute("data-next")) {
        if (!saved) dirty = true;
        stage = Math.min(6, stage + 1);
        render(true);
      } else if (button.hasAttribute("data-prev")) {
        if (!saved) dirty = true;
        stage = Math.max(0, stage - 1);
        render(true);
      } else if (button.hasAttribute("data-instrument")) {
        draft.bb_instrumento = button.dataset.instrument;
        dirty = true;
        cache();
        container
          .querySelectorAll("[data-instrument]")
          .forEach((b) =>
            b.setAttribute(
              "aria-pressed",
              String(b.dataset.instrument === draft.bb_instrumento),
            ),
          );
        container.querySelector(".bb-selection").textContent =
          draft.bb_instrumento
            ? "Instrumento elegido: " + draft.bb_instrumento
            : "Ningún instrumento elegido. Puedes continuar así.";
        container.querySelector(`[name="bb_nota_instrumento"]`)?.focus();
      } else if (button.hasAttribute("data-review") && saved && !dirty) {
        onReview(saved.id);
      }
    },
    { signal },
  );
  container.addEventListener(
    "submit",
    async (e) => {
      e.preventDefault();
      if (busy) return;
      const required =
        draft.status === "pausado"
          ? [
              "title",
              "situation",
              "bb_pausa",
              "bb_rev_quien",
              "bb_rev_cuando",
              "bb_rev_criterio",
            ]
          : [
              "title",
              "situation",
              "bb_route",
              "action",
              "owner",
              "due",
              "stop",
              "bb_rev_que",
              "bb_rev_quien",
              "bb_rev_cuando",
              "bb_rev_como",
              "bb_rev_criterio",
              "bb_rev_procedencia",
            ];
      const missing = required.filter((k) => !String(draft[k] || "").trim());
      if (missing.length) {
        notice(
          "Para guardar, concreta: " +
            missing
              .map(
                (k) =>
                  ({
                    title: "el nombre",
                    owner: "quién asume el paso",
                    due: "la ocasión",
                  })[k] || brainboxFieldLabels[k],
              )
              .join(", ") +
            ". Puedes volver al momento correspondiente o elegir una pausa deliberada.",
          true,
        );
        return;
      }
      const fields = Object.fromEntries(
        fieldKeys.map((k) => [k, String(draft[k] || "").trim()]),
      );
      const reviewSummary = [
        draft.bb_rev_que,
        draft.bb_rev_cuando,
        draft.bb_rev_criterio,
      ]
        .filter(Boolean)
        .join("\n");
      fields.review =
        reviewSummary.length <= 4000
          ? reviewSummary
          : "Retorno preparado: consultar los campos separados de qué observar, quién, cuándo, procedimiento, criterio y procedencia. El contenido completo se conserva en esos campos.";
      fields.bb_stage = "6";
      if (
        Object.values(fields).some((v) => v.length > 4000) ||
        draft.title.length > 220 ||
        draft.owner.length > 500 ||
        draft.due.length > 500
      ) {
        notice(
          "Hay una respuesta demasiado larga. Abrevia antes de guardar; no se ha recortado tu texto.",
          true,
        );
        return;
      }
      const now = new Date().toISOString();
      const candidate = {
        id: saved?.id || crypto.randomUUID(),
        title: draft.title.trim(),
        tool: "plan",
        owner: draft.owner.trim(),
        due: draft.due.trim(),
        status: draft.status,
        fields,
        createdAt: saved?.createdAt || now,
        updatedAt: now,
      };
      busy = true;
      container.querySelectorAll("button").forEach((b) => (b.disabled = true));
      try {
        const result = await onSave(candidate);
        if (!result?.id)
          throw new Error("No se recibió la confirmación del guardado.");
        saved = structuredClone(result);
        dirty = false;
        delete sessionDrafts()[cacheKey];
        Store.save();
        cacheKey = saved.id;
        stage = 6;
        render(true);
        notice(
          "Episodio guardado. La acción y sus resultados siguen pendientes de lo que ocurra en tu contexto.",
        );
      } catch (error) {
        render();
        notice(
          "No se ha confirmado el guardado. Conserva esta pantalla e inténtalo de nuevo. " +
            (error?.message || ""),
          true,
        );
      } finally {
        busy = false;
        container
          .querySelectorAll(".bb-navigation button")
          .forEach((b) => (b.disabled = false));
      }
    },
    { signal },
  );
  render();
  return cleanup;
}

/** Practical accompaniment, local feedback and method-use guidance.
 * These views never import the workspace or transmit personal responses.
 * Group scenes are fictional demonstrations, pending clinical review before pilot use.
 */
import { SCENARIOS } from "./journey-content.js";
import { icon } from "../v2/icons.js";

const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[c]);
const mounted = new WeakMap();
const link = (route, label, primary = false) => `<a class="${primary ? "lv-primary" : "lv-secondary"}" href="#/${route}">${label}</a>`;
function focusPanel(container) {
  const heading = container.querySelector("[data-ac-heading]");
  heading?.focus({ preventScroll: true });
}
function lifecycle(container) {
  mounted.get(container)?.();
  const controller = new AbortController();
  const dispose = [];
  let active = true;
  const cleanup = () => {
    if (!active) return;
    active = false;
    controller.abort();
    dispose.forEach((fn) => fn());
    mounted.delete(container);
    container.replaceChildren();
  };
  mounted.set(container, cleanup);
  return { cleanup, signal: controller.signal, dispose, active: () => active };
}
function downloadText(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function printSheet(html, life) {
  document.querySelector(".ac-print-sheet")?.remove();
  const sheet = document.createElement("section");
  sheet.className = "ac-print-sheet";
  sheet.innerHTML = html;
  document.body.append(sheet);
  document.body.classList.add("ac-printing");
  let done = false;
  const remove = () => {
    if (done) return;
    done = true;
    sheet.remove();
    document.body.classList.remove("ac-printing");
    window.removeEventListener("afterprint", remove);
  };
  life.dispose.push(remove);
  window.addEventListener("afterprint", remove, { once: true });
  window.print();
}
const preparationNotice = `<p class="ac-status-note"><strong>Material de preparación.</strong> La revisión clínica está pendiente. Esta demostración permite preparar la sesión; no acredita una intervención ni autoriza todavía el uso con un grupo real.</p>`;

const CASES = {
  relevo: {
    person: "Marta",
    scene: "Marta necesita un relevo. Escribe «Cuando puedas, échame una mano». Nadie ha confirmado qué puede hacer ni cuándo.",
    feeling: "Puede haber cansancio y culpa al pedir. Reconocerlo no exige adivinar lo que piensa la otra persona.",
    question: "¿Qué falta para que esa ayuda sea un acuerdo?",
    contrast: "Sabemos qué mensaje envió. No sabemos si alguien puede acompañar ni qué tarea aceptaría. El silencio no es aceptación.",
    action: "«¿Puedes acompañar veinte minutos el jueves? Antes acordamos qué necesitas saber y cómo avisarnos si algo cambia. Si no puedes, dímelo». Todavía es una propuesta.",
    condition: "La otra persona debe aceptar y poder cubrir las necesidades indispensables. Si no hay cobertura segura, no se da el relevo por hecho.",
    return: "¿Hubo respuesta? ¿Se acordó una ocasión? ¿Ocurrió el relevo? Si no, cambia la petición o busca apoyo; no se considera un fallo personal.",
  },
  mente: {
    person: "Sara",
    scene: "Sara recuerda varias veces una compra pendiente mientras hace otras tareas. Está escrita en una lista, pero nadie ha aceptado encargarse.",
    feeling: "Tener que anticiparlo y recordarlo todo puede cansar. Nombrar ese trabajo permite hablar de reparto, sin atribuir intenciones a nadie.",
    question: "¿Basta con apuntarlo para dejar de estar pendiente?",
    contrast: "La lista permite comprobar qué falta. No prueba que otra persona haya aceptado la responsabilidad ni cuándo avisará de que está hecho.",
    action: "Acordar una sola compra: quién puede hacerla, para cuándo y cómo confirmará que está resuelta. No añadir otra tarea de vigilancia a Sara.",
    condition: "Si nadie puede asumirla, dejar visible esa falta de apoyo y revisar prioridad o alternativas. Una lista no crea disponibilidad.",
    return: "¿Alguien aceptó? ¿Pudo encargarse y avisar? ¿Sara tuvo que seguir recordándolo? Revisar el acuerdo según lo observado, no según lo que debería haber pasado.",
  },
  pausa: {
    person: "Inés",
    scene: "Inés intenta sentarse, pero vuelve a una tarea pendiente. Una persona ha ofrecido acompañar un rato; todavía falta concretar qué puede cubrir.",
    feeling: "La culpa puede aparecer incluso cuando existe una pausa posible. No hay que expulsarla ni sentirse bien a la fuerza para mirar las condiciones.",
    question: "¿Qué haría posible una pausa segura, aunque queden cosas pendientes?",
    contrast: "Hay un ofrecimiento, no una cobertura confirmada. Descansar no demuestra falta de cariño. Tampoco basta con proponérselo cuando faltan apoyos.",
    action: "Elegir una pausa breve después de acordar cobertura y duración. Puede ser sentarse o escuchar algo; no es otra tarea que cumplir.",
    condition: "Si no se pueden cubrir las necesidades indispensables, pedir apoyo o revisar la ocasión. No salir ni dejar sin atención a una persona que la necesita.",
    return: "¿Existió esa ocasión? ¿La pausa ocurrió? ¿Ayudó, no cambió nada o añadió carga? También vale que no pudiera hacerse; se revisan las condiciones.",
  },
  limites: {
    person: "Leire",
    scene: "A Leire le piden una gestión para una hora en la que ya tiene otra tarea acordada. Siente presión y piensa que solo puede decir que sí.",
    feeling: "La presión y el temor a decepcionar merecen espacio. No obligan a aceptar una tarea imposible ni a confrontar a nadie.",
    question: "¿Qué puede ofrecer realmente, y qué necesita quedar cubierto?",
    contrast: "La coincidencia de horarios se puede comprobar. Que alguien se moleste es una posibilidad; no un hecho que ya haya ocurrido.",
    action: "«A esa hora ya tengo una tarea acordada. Puedo revisar otra ocasión contigo, pero no confirmar las dos». Preparar una alternativa solo si es viable.",
    condition: "Si existe intimidación, violencia o riesgo, no se ensaya una confrontación: se busca apoyo competente. Mantener cubierto lo indispensable no debe depender de una promesa imposible.",
    return: "¿Se pudo expresar el límite? ¿Qué respuesta hubo? ¿Quedó alguna necesidad sin cubrir? Revisar alternativas y apoyos sin convertir la reacción ajena en un juicio sobre Leire.",
  },
};
const SESSION = [
  ["0–5 min", "Llegar sin obligación de contar", "Explicar que se trabajará una escena inventada. Cada una puede escuchar, participar, pasar o salir. No pedir nombres ni historias de la persona cuidada."],
  ["5–15 min", "Mirar la escena", "Leer un caso. Dar lugar a lo que podría sentir la protagonista. No diagnosticarla ni deducir cómo están las participantes."],
  ["15–25 min", "Distinguir lo que se sabe", "Separar hechos, experiencia y suposiciones. Comprobar primero si faltan tiempo, servicios, relevo o condiciones de trabajo."],
  ["25–35 min", "Preparar un paso posible", "Ensayar una petición o una pausa elegida. Acordar qué tendría que estar disponible. Reducir, delegar, detener o pedir apoyo también pueden ser una acción."],
  ["35–45 min", "Cerrar con apoyo y una vuelta", "Localizar un recurso pertinente. Cada una puede llevarse un paso en su propio papel, sin compartirlo. Decidir cuándo observar qué ocurrió; no pedir compromisos públicos."],
  ["Otro encuentro", "Volver sin juzgar", "Preguntar si ocurrió, qué pasó y si ayudó o añadió carga. No pude, no lo observé y prefiero no contarlo son respuestas distintas y válidas."],
];
function groupGuide(caseId) {
  const c = CASES[caseId];
  return `<h1>CareLab · Preparar una sesión acompañada</h1><p><strong>Guía orientativa de 45 minutos · Método BrainBox 1.2 aplicado al cuidado</strong></p>${preparationNotice}<p>Casos ficticios. Sin evaluación, puntuación ni recogida de datos. Los tiempos orientan a quien facilita; no son un reloj para las participantes.</p>${c ? `<h2>${escape(SCENARIOS[caseId].title)}</h2><p>${escape(c.scene)}</p><p><strong>Pregunta:</strong> ${escape(c.question)}</p><p><strong>Un paso posible:</strong> ${escape(c.action)}</p><p><strong>Condiciones:</strong> ${escape(c.condition)}</p>` : ""}<h2>El guion</h2>${SESSION.map(([time, title, text]) => `<section><h3>${time} · ${title}</h3><p>${text}</p></section>`).join("")}<h2>Antes de convocar</h2><ul><li>Contar con revisión clínica de los textos de ayuda y con acompañamiento adecuado para el grupo.</li><li>Comprobar los recursos oficiales de la zona y abrir la pantalla Ayuda antes de la sesión.</li><li>Usar un dispositivo de demostración sin notas personales. Desactivar notificaciones ajenas a CareLab.</li><li>No registrar votos, relatos, nombres ni información de salud. Participar o compartir siempre es voluntario; hablar sin nombres no garantiza anonimato.</li><li>Si aparece riesgo o una decisión médica, psicológica o legal, parar esa actividad y acudir a ayuda competente. CareLab no atiende crisis ni avisa a nadie.</li></ul><p><strong>Recursos:</strong> abre Ayuda dentro de CareLab. La disponibilidad y la fecha de comprobación se consultan allí.</p><p>Preparación editorial con asistencia de ChatGPT/Codex. La revisión de software no es revisión clínica ni prueba de eficacia.</p>`;
}
export function mountGroup(container) {
  const life = lifecycle(container);
  let caseId = "", step = 0;
  life.dispose.push(() => { caseId = ""; step = 0; });
  function render(focus = false) {
    const c = CASES[caseId];
    if (!c) {
      container.innerHTML = `<section class="ac-shell"><header class="quiet-page-head"><p class="quiet-eyebrow">CUIDAR CON APOYO</p><h1 data-ac-heading tabindex="-1">Preparar un encuentro.<br><em>Sin pedir más de la cuenta.</em></h1><p>Una escena inventada, una conversación y un paso posible. Para quien prepara una sesión acompañada.</p></header>${preparationNotice}<section class="ac-panel"><h2>Elige una escena para la demostración</h2><div class="ac-case-list">${Object.entries(CASES).map(([id]) => `<button type="button" class="ac-case" data-case="${id}"><span aria-hidden="true">${icon(SCENARIOS[id].id === "relevo" ? "people" : SCENARIOS[id].id === "mente" ? "plan" : SCENARIOS[id].id === "pausa" ? "leaf" : "shield", 28)}</span><span><strong>${escape(SCENARIOS[id].title)}</strong><span>${escape(SCENARIOS[id].subtitle)}</span></span>${icon("arrow", 21)}</button>`).join("")}</div></section><div class="ac-actions"><button type="button" class="lv-secondary" data-group-print>Imprimir guía de 45 minutos</button>${link("ayuda", "Ver recursos de apoyo")}</div><details class="ac-detail"><summary>Qué prepara quien acompaña</summary><p>Una sesión segura empieza por los apoyos disponibles, el derecho a pasar y la revisión clínica pendiente. No se recogerán datos. Esta pantalla no lee tus planes ni tus notas.</p><p>Al proyectar, usa un dispositivo sin información personal. Hablar sin nombres no garantiza anonimato; trabaja siempre con la escena inventada.</p></details></section>`;
    } else {
      const panels = [
        ["ANTES DE EMPEZAR", "Escuchar también es participar.", "No hay que contar una experiencia propia ni dar una respuesta correcta. Trabajaremos con una protagonista inventada. Cualquiera puede pasar, salir o pedir apoyo.", "Reglas de quien acompaña", "No recoger nombres, votos ni relatos. No atribuir el caso a nadie del grupo. Preparar apoyos de la zona y respetar los límites de la sesión."],
        ["LA ESCENA", SCENARIOS[caseId].title, c.scene, "Una experiencia que puede reconocerse", c.feeling],
        ["OTRA MIRADA", c.question, "Antes de buscar una solución, distingamos lo que aparece en la escena de lo que todavía no sabemos. Si faltan apoyos, no es un fallo de la protagonista.", "Un contraste posible, sin examen", c.contrast],
        ["UN PASO POSIBLE", "Preparar no es darlo por hecho.", c.action, "Qué debe estar cubierto", c.condition],
        ["LA VUELTA", "Mirar qué pasó, sin juzgar.", c.return, "Un cierre que no añade tareas", "Cada una puede llevarse una pregunta o un paso en su propio papel. También puede no elegir nada hoy. No se piden promesas públicas ni se recoge lo escrito."],
      ];
      const [eyebrow, title, text, moreTitle, more] = panels[step];
      container.innerHTML = `<section class="ac-shell ac-demonstration"><header class="ac-compact-head"><p class="quiet-eyebrow">DEMOSTRACIÓN · CASO FICTICIO · REVISIÓN CLÍNICA PENDIENTE</p><button type="button" class="lv-quiet" data-group-reset>Cambiar de escena</button></header><article class="ac-panel ac-projection"><p class="quiet-eyebrow">${eyebrow}</p><h1 data-ac-heading tabindex="-1">${escape(title)}</h1><p class="ac-lead">${escape(text)}</p><details class="ac-detail"><summary>${moreTitle}</summary><p>${escape(more)}</p></details></article><nav class="ac-actions" aria-label="Recorrer la demostración">${step ? '<button type="button" class="lv-secondary" data-group-prev>Anterior</button>' : ""}${step < panels.length - 1 ? '<button type="button" class="lv-primary" data-group-next>Continuar</button>' : '<button type="button" class="lv-primary" data-group-reset>Terminar demostración</button>'}${link("ayuda", "Abrir Ayuda")}</nav>${step === panels.length - 1 ? '<div class="ac-actions"><button type="button" class="lv-secondary" data-group-print>Imprimir esta guía y el guion</button></div>' : ""}<p class="quiet-caption">Solo se muestra este caso ficticio. No se leen ni se guardan respuestas o notas personales.</p></section>`;
    }
    if (focus) focusPanel(container);
  }
  container.addEventListener("click", (event) => {
    const b = event.target.closest("button");
    if (!b || !container.contains(b)) return;
    if (b.dataset.case && Object.hasOwn(CASES, b.dataset.case)) { caseId = b.dataset.case; step = 0; render(true); }
    else if (b.hasAttribute("data-group-next")) { step = Math.min(4, step + 1); render(true); }
    else if (b.hasAttribute("data-group-prev")) { step = Math.max(0, step - 1); render(true); }
    else if (b.hasAttribute("data-group-reset")) { caseId = ""; step = 0; render(true); }
    else if (b.hasAttribute("data-group-print")) printSheet(groupGuide(caseId), life);
  }, { signal: life.signal });
  render();
  return life.cleanup;
}

const QUESTIONS = [
  { key: "useful", title: "¿Te ha servido para algo concreto?", help: "No hace falta terminar un recorrido para opinar.", choices: ["Sí, bastante", "Algo", "Todavía no", "No lo sé"] },
  { key: "difficulty", title: "¿Qué te ha costado más?", help: "Elige lo principal. Puedes dejarlo sin responder.", choices: ["Leer o escuchar", "Encontrar lo que necesitaba", "Saber cómo empezar", "Usar una función", "Nada en particular", "Otra cosa"] },
  { key: "burden", title: "¿Usarla te añadió carga?", help: "Nos importa también lo que no ayuda.", choices: ["No", "Un poco", "Sí, bastante", "No lo sé"] },
  { key: "improvement", title: "¿Qué cambiarías?", help: "Una frase basta. No incluyas nombres, datos de salud ni información de otras personas." },
];
export function mountEvaluation(container) {
  const life = lifecycle(container);
  let step = 0, answers = { useful: "", difficulty: "", burden: "", improvement: "" };
  life.dispose.push(() => { answers = {}; step = 0; });
  const report = () => "CareLab · Una experiencia para mejorar\n\n" + QUESTIONS.map((q) => `${q.title}\n${answers[q.key] || "Sin responder"}`).join("\n\n") + "\n\nPreparado localmente. No se ha enviado a CareLab.\n";
  const status = (text) => { const n = container.querySelector("[data-ac-status]"); if (n) n.textContent = text; };
  function render(focus = false) {
    const q = QUESTIONS[step];
    container.innerHTML = `<section class="ac-shell ac-evaluation"><header class="ac-compact-head"><p class="quiet-eyebrow">TU EXPERIENCIA IMPORTA</p><p class="quiet-caption">Este formulario no se envía. Puedes llevarlo a la persona que te presentó CareLab. No se guarda: al salir o recargar, se pierde.</p></header>${q ? `<form id="feedback-form" autocomplete="off"><section class="ac-panel"><h1 data-ac-heading tabindex="-1">${q.title}</h1><p>${q.help}</p>${q.choices ? `<fieldset class="ac-options"><legend class="visually-hidden">${q.title}</legend>${q.choices.map((choice, i) => `<label><input type="radio" name="${q.key}" value="${escape(choice)}" ${answers[q.key] === choice ? "checked" : ""}><span>${escape(choice)}</span></label>`).join("")}</fieldset>` : `<label class="visually-hidden" for="ac-improvement">Una mejora para CareLab</label><textarea id="ac-improvement" name="improvement" maxlength="1200" rows="4" placeholder="Me ayudaría…">${escape(answers.improvement)}</textarea><p class="quiet-caption">Opcional. Máximo 1.200 caracteres.</p>`}</section><nav class="ac-actions" aria-label="Preguntas sobre tu experiencia">${step ? '<button type="button" class="lv-secondary" data-eval-prev>Anterior</button>' : ""}<button type="submit" class="lv-primary">${step === QUESTIONS.length - 1 ? "Revisar mis respuestas" : "Continuar"}</button><button type="button" class="lv-quiet" data-eval-skip>Omitir esta pregunta</button></nav></form>` : `<section class="ac-panel"><h1 data-ac-heading tabindex="-1">Esto es lo que te llevas.</h1><p>Nada se ha enviado. Si quieres compartirlo, decide con quién y utiliza el canal que ya tengáis.</p><dl class="ac-answer-list">${QUESTIONS.map((item) => `<div><dt>${item.title}</dt><dd>${escape(answers[item.key] || "Sin responder")}</dd></div>`).join("")}</dl><div class="ac-actions"><button type="button" class="lv-primary" data-eval-copy>${icon("plan", 19)} Copiar</button><button type="button" class="lv-secondary" data-eval-download>Descargar texto</button><button type="button" class="lv-secondary" data-eval-print>Imprimir</button></div><div data-ac-copy-fallback hidden><label for="ac-copy-text">Selecciona y copia tus respuestas</label><textarea id="ac-copy-text" readonly rows="8"></textarea></div><div class="ac-actions"><button type="button" class="lv-quiet" data-eval-prev>Volver a editar</button><button type="button" class="lv-quiet" data-eval-clear>Borrar mis respuestas</button></div></section>`}<p class="quiet-caption" role="status" aria-live="polite" data-ac-status></p><p class="quiet-caption">Copiar, descargar o imprimir crea una copia fuera de este formulario. No incorpora tus planes ni tus notas de CareLab.</p>${link("explorar", "Volver a Explorar")}</section>`;
    if (focus) focusPanel(container);
  }
  container.addEventListener("input", (event) => {
    const el = event.target;
    if (el.name === "improvement") answers.improvement = el.value.slice(0, 1200);
    else {
      const q = QUESTIONS.find((item) => item.key === el.name);
      if (q?.choices?.includes(el.value)) answers[el.name] = el.value;
    }
  }, { signal: life.signal });
  container.addEventListener("submit", (event) => { event.preventDefault(); step = Math.min(QUESTIONS.length, step + 1); render(true); }, { signal: life.signal });
  container.addEventListener("click", async (event) => {
    const b = event.target.closest("button");
    if (!b || !container.contains(b)) return;
    if (b.hasAttribute("data-eval-prev")) { step = Math.max(0, step - 1); render(true); }
    else if (b.hasAttribute("data-eval-skip")) { answers[QUESTIONS[step].key] = ""; step++; render(true); }
    else if (b.hasAttribute("data-eval-clear")) { answers = { useful: "", difficulty: "", burden: "", improvement: "" }; step = 0; render(true); status("Respuestas borradas de este formulario. Las copias que hayas creado se conservan donde las guardaste."); }
    else if (b.hasAttribute("data-eval-download")) { downloadText(report(), "CareLab-mi-experiencia.txt"); status("Archivo preparado en este dispositivo. No se ha enviado al equipo."); }
    else if (b.hasAttribute("data-eval-print")) printSheet(`<h1>CareLab · Mi experiencia</h1><p>Guía breve de retorno. Compartirla es voluntario; no contiene los planes ni las notas del espacio personal.</p>${QUESTIONS.map((item) => `<h2>${item.title}</h2><p class="ac-prewrap">${escape(answers[item.key] || "Sin responder")}</p>`).join("")}<p>Preparada localmente. No se ha enviado a CareLab.</p>`, life);
    else if (b.hasAttribute("data-eval-copy")) {
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(report());
        if (life.active()) status("Copiado. Puedes pegarlo en el canal que elijas; no se ha enviado al equipo.");
      } catch {
        if (!life.active()) return;
        const box = container.querySelector("[data-ac-copy-fallback]");
        if (!box) return;
        box.hidden = false;
        const text = box.querySelector("textarea");
        text.value = report();
        text.focus();
        text.select();
        status("Tu navegador no ha permitido copiar. Puedes seleccionar y copiar el texto de este recuadro.");
      }
    }
  }, { signal: life.signal });
  render();
  return life.cleanup;
}

export function mountMethodUse(container) {
  const life = lifecycle(container);
  container.innerHTML = `<section class="ac-shell"><header class="quiet-page-head"><p class="quiet-eyebrow">CON EL MÉTODO BRAINBOX 1.2</p><h1 data-ac-heading tabindex="-1">Una situación.<br><em>Un paso que puedas usar.</em></h1><p>CareLab te acompaña a mirar lo que te pasa, preparar algo posible y volver a comprobar si te sirvió. No tienes que responderlo todo.</p></header><section class="ac-panel"><h2>Empieza por lo que hoy te pesa</h2><p>Una petición que cuesta hacer, una preocupación que vuelve, una pausa o un límite. Elige una escena; puedes parar y retomarla cuando te venga bien.</p><div class="ac-actions">${link("vivir", "Trabajar una situación", true)}${link("mapa", "Primero, ordenar mi carga")}</div></section><details class="ac-detail"><summary>¿Y si no sé qué me pasa?</summary><p>Puedes reconocer una sensación sin tener que explicar su causa. El recorrido ayuda a separar lo que sientes, lo que ocurre y lo que estás suponiendo. No interpreta tus emociones ni te pone una etiqueta.</p></details><details class="ac-detail"><summary>¿Qué me llevo fuera de la pantalla?</summary><p>Una petición, una decisión cotidiana o una pausa preparada, con sus condiciones y un momento para revisarla. Pedir no equivale a conseguir: la disponibilidad de otra persona o servicio se confirma en el mundo real.</p><p>Si faltan apoyos, no es un fallo de voluntad. Reducir, delegar, aplazar o buscar ayuda pueden ser el paso adecuado.</p></details><details class="ac-detail"><summary>¿Qué pasa si no pude hacerlo?</summary><p>También puedes volver con «no pude», «no sé qué pasó» o «prefiero no contarlo». Revisar sirve para ajustar el paso, no para aprobarte. Los registros no prueban por sí solos que algo haya mejorado.</p><div class="ac-actions">${link("micamino", "Retomar o revisar mi situación")}${link("revision", "Revisar otra acción")}</div></details><details class="ac-detail"><summary>¿Cuándo busco ayuda fuera de aquí?</summary><p>Ante peligro o una decisión médica, psicológica o legal, este recorrido no resuelve esa situación. Puedes preparar una consulta y buscar ayuda competente. Esto no significa interrumpir los cuidados ordinarios ni las indicaciones profesionales.</p><div class="ac-actions">${link("ayuda", "Encontrar apoyo")}${link("tool/consulta", "Preparar una consulta")}</div></details><p class="quiet-caption">Método BrainBox 1.2 aplicado a situaciones cotidianas. CareLab no es terapia, no diagnostica y no contiene un asistente conversacional. La revisión clínica y el contraste de utilidad con personas son procesos distintos de las pruebas técnicas.</p><div class="ac-actions">${link("pausa", "Ahora prefiero una pausa")}${link("explorar", "Ver otras posibilidades")}</div></section>`;
  return life.cleanup;
}

import { icon } from "../v2/icons.js";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const go = (path) => {
  location.hash = "#/" + path;
};
const focusHeading = (container) => {
  const h = container.querySelector("h1");
  h?.setAttribute("tabindex", "-1");
  h?.focus({ preventScroll: true });
};
const link = (path, label, cls = "lv-primary") =>
  `<a class="${cls}" href="#/${path}">${label}</a>`;
export function landscape(large = false) {
  return `<div class="quiet-window ${large ? "quiet-window-large" : ""}" aria-hidden="true"><img src="assets/v3/images/ventana-lago.png" alt="" width="1536" height="1024" decoding="async"><span>Una ventana. Ninguna prisa.</span></div>`;
}
function status(Store) {
  const s = Store.getStorageStatus?.();
  return s?.recoverable
    ? s.mode === "device"
      ? "Tu paso queda en este dispositivo."
      : "Tu paso se recupera al recargar esta pestaña."
    : "El navegador no está guardando. Exporta antes de salir.";
}
function save(Store, notify) {
  Store.save();
  const error = Store.takeError();
  if (error) notify(error);
  document.dispatchEvent(new CustomEvent("carelab:preference-change"));
}
export function mountWelcome(container, { Store, notify }) {
  let stage = 0;
  function finish() {
    Store.get().journey.onboarded = true;
    save(Store, notify);
    go("vivir");
  }
  function render() {
    const content = [
      `<p class="quiet-eyebrow">CUIDAR SIN DESAPARECER</p><h1>No tienes que<br>poder <em>con todo.</em></h1><p class="quiet-intro">Cuidas de alguien. CareLab te ayuda a que cuidar no te borre.</p><button class="lv-primary" data-next>Encontrar mi primer paso ${icon("arrow", 18)}</button><a class="lv-quiet" href="#/pausa">Solo necesito una pausa</a><a class="lv-quiet quiet-help-door" href="#/ayuda">Hoy no puedo más. Necesito ayuda, no un ejercicio.</a>`,
      `<p class="quiet-eyebrow">UNA COSA CADA VEZ · BRAINBOX 1.2</p><h1>Una situación.<br><em>Un paso posible.</em></h1><p class="quiet-intro">Miramos lo que ocurre, contrastamos una idea y preparamos un paso. Después volvemos para comprobar qué pasó.</p><p class="quiet-caption">Puedes parar y retomar.</p><button class="lv-primary" data-next>Así sí puedo empezar ${icon("arrow", 18)}</button>`,
      `<p class="quiet-eyebrow">SI LA VIDA TE INTERRUMPE</p><h1>Que tu paso<br><em>no se pierda.</em></h1><p class="quiet-intro">Tus respuestas quedan en este navegador, sin cifrar. Elige cuánto conservarlas.</p><div class="quiet-save-options"><button class="lv-primary" data-device>Guardar en mi dispositivo</button><button class="lv-secondary" data-session>Usar solo esta pestaña</button></div><p class="quiet-caption">No se envían tus respuestas.</p><details class="quiet-storage-details"><summary>Cómo funciona el guardado</summary><p>Esta pestaña conserva lo escrito al recargar. El navegador puede restaurar sesiones cerradas. Guardar en el dispositivo permite volver después; quien use ese perfil puede verlo. Puedes borrar en Ajustes. Si no se puede guardar, te avisamos.</p></details>`,
    ][stage];
    container.innerHTML = `<section class="quiet-arrival"><div class="quiet-copy">${content}<div class="quiet-onboarding-foot"><span aria-label="Pantalla ${stage + 1} de 3">${[0, 1, 2].map((i) => `<i class="${i === stage ? "current" : ""}"></i>`).join("")}</span><a href="#/explorar">Prefiero explorar</a>${stage ? '<button class="lv-quiet" data-back>Atrás</button>' : ""}</div></div>${landscape()}</section>`;
    container.querySelector("[data-next]")?.addEventListener("click", () => {
      stage++;
      render();
      container.querySelector("h1").setAttribute("tabindex", "-1");
      container.querySelector("h1").focus({ preventScroll: true });
    });
    container.querySelector("[data-back]")?.addEventListener("click", () => {
      stage--;
      render();
      focusHeading(container);
    });
    container.querySelector("[data-device]")?.addEventListener("click", () => {
      if (Store.enable()) finish();
      else notify(Store.takeError());
    });
    container.querySelector("[data-session]")?.addEventListener("click", () => {
      if (!Store.isPersistent() || Store.disable()) finish();
      else notify(Store.takeError());
    });
  }
  render();
}
export function mountNow(container, { Store, summary, notify }) {
  if (
    !Store.get().journey.onboarded &&
    !Store.get().actions.length &&
    !Store.get().journey.sessions.length
  )
    return mountWelcome(container, { Store, notify });
  const s = summary(Store),
    current = s.current,
    waiting = s.planned?.[0];
  const resume = current && !["reviewed", "planned"].includes(current.status);
  const route = resume
    ? "vivir/" + current.id
    : waiting
      ? "volver/" + waiting.id
      : "vivir";
  container.innerHTML = `<section class="quiet-arrival"><div class="quiet-copy"><p class="quiet-eyebrow">TU MOMENTO · CON BRAINBOX 1.2</p><h1>${resume ? "Podemos seguir<br><em>desde aquí.</em>" : waiting ? "Lo que pasó<br><em>también cuenta.</em>" : "Un poco de espacio.<br><em>Un paso posible.</em>"}</h1><p class="quiet-intro">${resume ? "Retoma la situación con lo que ya has elegido." : waiting ? "Veamos qué ocurrió. No haber podido hacerlo también tiene un lugar aquí." : "Elige una situación. Prepara solo el paso que te sirva ahora."}</p>${link(route, resume ? "Retomar mi paso" : waiting ? "Volver con lo que ocurrió" : "Trabajar lo que me pesa")}<a class="lv-quiet" href="#/pausa">Solo quiero parar un momento</a><a class="lv-quiet quiet-help-door" href="#/ayuda">Hoy no puedo más. Necesito ayuda, no un ejercicio.</a><p class="quiet-caption">${esc(status(Store))}</p></div>${landscape()}</section><div class="quiet-understory"><span>Sentir sin juzgarte. Contrastar. Probar. Volver.</span>${link("micamino", "Ver mi camino", "lv-quiet")}</div>`;
}
const groups = [
  [
    "Para este momento",
    [
      [
        "vivir",
        "Trabajar una situación",
        "Una experiencia guiada, desde lo que te pasa hasta un paso real.",
        "flower",
      ],
      [
        "pausa",
        "Un lugar donde parar",
        "Una ventana, música opcional y una pausa que no exige nada.",
        "leaf",
      ],
      [
        "recursos",
        "Encontrar un recurso",
        "Una necesidad. Pocas propuestas, elegidas para ese momento.",
        "audio",
      ],
    ],
  ],
  [
    "Para organizar la vida",
    [
      ["apoyos", "Apoyos cerca de mí", "Servicios y asociaciones de Euskadi y del resto de España.", "people"],
      ["tramites", "Preparar una gestión", "Dependencia, respiro, prestaciones y condiciones de trabajo.", "plan"],
      ["mapa", "Mi carga", "Lo visible y lo que nadie ve.", "map"],
      [
        "plan",
        "Mis acuerdos y acciones",
        "Lo preparado, lo que se hizo y lo que sigue pendiente.",
        "plan",
      ],
      [
        "red",
        "Mi red de apoyo",
        "Quién puede ayudar, cómo y con qué acuerdo.",
        "people",
      ],
      [
        "herramientas",
        "Herramientas prácticas",
        "Preparar peticiones, límites, consultas y gestiones.",
        "spark",
      ],
    ],
  ],
  [
    "Para aprender y profundizar",
    [
      [
        "programa",
        "Mi programa",
        "12 módulos y 36 prácticas; elige lo que te haga falta.",
        "program",
      ],
      [
        "biblioteca",
        "La biblioteca del cuidado",
        "Cuidopedia, CareTools, Cuidoteca, Cuidosfera y guías.",
        "library",
      ],
      [
        "media",
        "Escuchar y ver",
        "Audio, vídeos, transcripciones y controles completos.",
        "audio",
      ],
      ["grupo", "Preparar un encuentro", "Casos ficticios y guía de sesión. Pendiente de revisión clínica.", "people"],
      [
        "profundizar",
        "Usar BrainBox en mi día",
        "Mirar lo que ocurre, preparar un paso y volver con lo vivido.",
        "flower",
      ],
    ],
  ],
  [
    "Tu espacio",
    [
      [
        "micamino",
        "Mi camino",
        "Ver lo que has preparado, probado y aprendido.",
        "leaf",
      ],
      [
        "ajustes",
        "Aspecto, privacidad y copias",
        "Guardado, letra, movimiento y acceso sin conexión.",
        "settings",
      ],
      ["feedback", "Compartir mi experiencia", "Preparar un comentario sin enviarlo desde CareLab.", "spark"],
      [
        "acerca",
        "El proyecto y sus fuentes",
        "Qué hace CareLab y cuáles son sus límites.",
        "library",
      ],
    ],
  ],
];
export function mountExplore(container) {
  container.innerHTML = `<header class="quiet-page-head"><p class="quiet-eyebrow">TODO TIENE SU LUGAR</p><h1>Lo que necesitas.<br><em>Cuando lo necesitas.</em></h1><p>No hace falta recorrerlo todo. Puedes elegir solo una cosa.</p></header><div class="quiet-index">${groups.map(([title, links]) => `<section><h2>${title}</h2><div>${links.map(([route, label, desc, ico]) => `<a class="quiet-index-link" href="#/${route}"><span class="quiet-index-icon">${icon(ico, 25)}</span><span><strong>${label}</strong><small>${desc}</small></span><span aria-hidden="true">↗</span></a>`).join("")}</div></section>`).join("")}</div>`;
}
export function mountPath(container, { Store, summary }) {
  const state = Store.get(),
    s = summary(Store);
  const sessions = [...s.sessions];
  const stages = [
    [
      "Mirar",
      sessions.some((x) => x.fields?.feeling || x.fields?.before_observation),
      "Poner nombre a lo que ocurre.",
    ],
    [
      "Contrastar",
      sessions.some((x) => x.fields?.c0 && x.fields?.c1 && x.fields?.c2),
      "Separar una explicación de un dato.",
    ],
    [
      "Preparar",
      state.actions.length > 0,
      "Elegir una acción y cómo revisarla.",
    ],
    [
      "Volver",
      state.reviews.length > 0,
      "Registrar lo que ocurrió, aunque no ayudara.",
    ],
  ];
  container.innerHTML = `<header class="quiet-page-head"><p class="quiet-eyebrow">TU CAMINO · SIN COMPARACIONES</p><h1>Lo que vas<br><em>haciendo tuyo.</em></h1><p>No es una puntuación sobre ti. Son las huellas de lo que has trabajado aquí.</p></header>${state.settings.gamification ? `<ol class="quiet-milestones">${stages.map(([title, done, desc], i) => `<li class="${done ? "reached" : ""}"><span aria-hidden="true">${done ? "✦" : String(i + 1).padStart(2, "0")}</span><h2>${title}</h2><p>${desc}</p><small>${done ? "Hay un registro en tu espacio" : "Todavía sin registro"}</small></li>`).join("")}</ol>` : ""}<section class="quiet-journal"><div class="row between"><h2>Mis situaciones</h2>${link("vivir", "Abrir una situación", "lv-secondary")}</div>${sessions.length ? sessions.map((x) => `<article class="quiet-entry"><div><p class="quiet-eyebrow">${esc({ draft: "EN CURSO", planned: "PASO PREPARADO", reviewed: "CON RETORNO", paused: "EN PAUSA" }[x.status] || "EN CURSO")}</p><h3>${esc(x.title || x.fields?.situation || { relevo: "Pedir un relevo", mente: "Compartir la carga mental", pausa: "Hacer sitio para mí", limites: "Poner un límite" }[x.scenario] || "Mi situación")}</h3><p>${x.status === "reviewed" ? "Tu revisión conserva qué ocurrió y qué decides ahora." : x.status === "planned" ? "Prepararlo no significa haberlo hecho. Vuelve cuando tengas algo que observar." : "Puedes retomarla sin volver a empezar."}</p></div><div>${link((x.status === "reviewed" || x.status === "planned" ? "volver/" : "vivir/") + x.id, x.status === "reviewed" ? "Ver mi retorno" : x.status === "planned" ? "Revisar lo ocurrido" : "Retomar", "lv-secondary")}</div></article>`).join("") : `<p class="quiet-empty">Tu camino puede empezar con una petición, una pausa o una pregunta que importe. No tienes que completar nada para merecer apoyo.</p>`}<div class="quiet-journal-links">${link("plan", "Todos mis planes", "lv-quiet")}${state.settings.gamification ? link("logros", "Otros avances", "lv-quiet") : ""}${link("revision", "Revisar otra acción", "lv-quiet")}</div></section>`;
}
export function mountPause(
  container,
  { startTrack, stopMedia, readText, Store },
) {
  let step = 0;
  const prompts = [
    [
      "Durante un momento,<br><em>nada que resolver.</em>",
      "Si las necesidades de cuidado están cubiertas, puedes detenerte aquí. No necesitas cerrar los ojos ni cambiar la respiración.",
      "Me quedo un momento",
    ],
    [
      "Encuentra un detalle.<br><em>Solo uno.</em>",
      "Puede ser una línea, un color o una luz de tu entorno. Míralo sin buscar una respuesta. Si mirar no te resulta cómodo, puedes notar un sonido.",
      "Ya lo he encontrado",
    ],
    [
      "Nota dónde<br><em>te apoyas.</em>",
      "Si te resulta cómodo, nota el contacto con la silla, el suelo o algo que tengas cerca. No hay que conseguir calma. Puedes seguir sintiéndote como antes.",
      "Puedo seguir",
    ],
    [
      "¿Qué te haría<br><em>un poco de sitio?</em>",
      "Tal vez un relevo, menos interrupciones o permiso para atender una necesidad tuya. El siguiente paso puede ser pedir una condición que hoy falta.",
      "Elegir un paso posible",
    ],
  ];
  function render() {
    const [title, copy, cta] = prompts[step];
    container.innerHTML = `<section class="quiet-pause">${landscape(true)}<div class="quiet-pause-copy"><p class="quiet-eyebrow">UN MOMENTO SIN EXIGENCIAS</p><h1>${title}</h1><p class="quiet-intro">${copy}</p><div class="lv-actions"><button class="lv-primary" data-pause-next>${cta}</button><button class="lv-quiet" data-skip>Esto no me ayuda ahora</button></div><div class="quiet-sound-controls"><button class="lv-secondary" data-sound="piano-meditation">${icon("play", 17)} Escuchar piano</button><button class="lv-quiet" data-silence>Silencio</button><button class="lv-quiet" data-read>${icon("volume", 17)} Escuchar esta guía</button></div><p class="quiet-caption">Tú decides cuánto quedarte. Sonido siempre opcional.</p></div></section>`;
    container.querySelector("[data-pause-next]").onclick = () => {
      if (step === 3) go("vivir");
      else {
        step++;
        render();
        focusHeading(container);
      }
    };
    container.querySelector("[data-skip]").onclick = () => {
      container.querySelector(".quiet-pause-copy").innerHTML =
        `<p class="quiet-eyebrow">PODEMOS CAMBIAR DE CAMINO</p><h1>No tienes que<br><em>forzarlo.</em></h1><p class="quiet-intro">Una pausa no sustituye el apoyo que falta. Puedes preparar una petición o dejar CareLab por ahora.</p><div class="lv-actions">${link("vivir/relevo", "Preparar una petición")}${link("hoy", "Volver a mi espacio", "lv-secondary")}</div><button class="lv-quiet" data-stop-all>Parar el sonido</button>`;
      container.querySelector("[data-stop-all]").onclick = stopMedia;
      focusHeading(container);
    };
    container.querySelector("[data-sound]").onclick = (e) =>
      startTrack(e.currentTarget.dataset.sound);
    container.querySelector("[data-silence]").onclick = stopMedia;
    container.querySelector("[data-read]").onclick = () =>
      readText("Un momento sin exigencias", copy);
  }
  render();
}

import { mountHelp, mountSupportDirectory, mountProcedures } from "../v3/support.js";
import { mountGroup, mountEvaluation, mountMethodUse } from "../v3/accompaniment.js";
import { librarySafetyNotice, isSensitiveResource, SAFETY_COPY } from "../v3/library-safety.js";
import { mountGuidedPractice } from "../v3/practice.js";
import {
  mountWelcome,
  mountNow,
  mountExplore,
  mountPath,
  mountPause,
} from "../v3/sanctuary.js";
import {
  mountLivingJourney,
  mountLivingReturn,
  getLivingSummary,
} from "../v3/journey.js";
import { installSafetySignpost } from "../v3/safety.js";
import { installFormDrafts, clearFormDraft } from "../v3/form-drafts.js";
import {
  hasFeedbackDraft,
  clearFeedbackDraft,
} from "./feedback.js";
import {
  mountBrainBox,
  brainboxFieldLabels,
  clearBrainBoxDrafts,
} from "./brainbox.js";
import { applyTheme } from "./theme.js";
import { mountJourney, mountCareMap, videoTutorial } from "./didactic.js";
import { mountRecommendations, dimensionNeed } from "./recommendations.js";
import * as Store from "./store.js";
import { icon, art } from "./icons.js";
import { dimensions, tools, scenarios } from "./tools.js";
import {
  tracks,
  startTrack,
  readText,
  stopMedia,
  mountMediaPage,
  mountPlayer,
} from "./media.js";
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const norm = (x) =>
  String(x ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const short = (x, n = 150) =>
  String(x ?? "").length > n
    ? String(x)
        .slice(0, n)
        .replace(/\s+\S*$/, "") + "…"
    : String(x ?? "");
const toolFor = (id) =>
  typeof id === "string" && Object.hasOwn(tools, id) ? tools[id] : null;
const date = (x) =>
  x
    ? new Date(x).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Sin fecha";
const nav = [
  ["hoy", "Ahora", "home"],
  ["micamino", "Mi camino", "flower"],
  ["explorar", "Explorar", "library"],
];
const view = $("#contenido");
let program = null,
  library = null,
  libraryPromise = null,
  route = "",
  cleanup = null,
  toastTimer = 0;
let drafts = Store.get().drafts.tools;
const filter = { q: "", collection: "", dimension: "", page: 0 };
const link = (to, text, cls = "btn", ico = "arrow") =>
  `<a href="#/${to}" class="${cls}">${text}${ico ? icon(ico, 17) : ""}</a>`;
const header = (eyebrow, title, intro, extra = "") =>
  `<header class="page-head"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="intro">${intro}</p>${extra}</header>`;
const field = (
  id,
  label,
  value = "",
  placeholder = "",
  type = "textarea",
  required = false,
) =>
  `<div class="field"><label for="${id}">${label}${required ? " *" : ""}</label>${type === "textarea" ? `<textarea id="${id}" name="${id}" maxlength="${Store.LIMITS.text}" placeholder="${esc(placeholder)}" ${required ? "required" : ""}>${esc(value)}</textarea>` : `<input id="${id}" name="${id}" type="${type}" maxlength="${id === "title" ? Store.LIMITS.title : Store.LIMITS.shortText}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${required ? "required" : ""}>`}</div>`;
const boundary =
  "<strong>Un límite importante.</strong> Ante riesgo o una situación médica, psicológica o legal, no apliques BrainBox: pide ayuda competente. Esto no significa interrumpir los cuidados ordinarios o las indicaciones profesionales.";
function toast(text) {
  clearTimeout(toastTimer);
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 6500);
}
function sync() {
  Store.save();
  applySettings();
  const e = Store.takeError();
  if (e) toast(e);
}
function applySettings() {
  applyTheme();
  const s = Store.get().settings;
  document.documentElement.classList.toggle("large-text", s.largeText);
  document.documentElement.classList.toggle("no-motion", !s.motion);
  $("#font-toggle").setAttribute("aria-pressed", String(s.largeText));
  const fontLabel = s.largeText ? "Volver al tamaño de texto habitual" : "Aumentar tamaño de texto";
  $("#font-toggle").setAttribute("aria-label", fontLabel);
  $("#font-toggle").title = fontLabel;
  const storage = Store.getStorageStatus();
  $("#storage-indicator").textContent =
    storage.mode === "device"
      ? "Guardado en este dispositivo"
      : storage.mode === "session"
        ? "Sesión recuperable"
        : "Sin guardar";
}
function modal(title, html, onReady) {
  const d = $("#dialog"),
    previous = document.activeElement;
  d.innerHTML = `<button class="close-dialog" aria-label="Cerrar">×</button><h2 id="dialog-title">${title}</h2>${html}`;
  $(".close-dialog", d).onclick = () => d.close();
  d.addEventListener(
    "close",
    () => {
      if (previous?.isConnected) previous.focus();
    },
    { once: true },
  );
  d.showModal();
  onReady?.(d);
}
function confirmAction(title, text, yes, label = "Confirmar") {
  modal(
    title,
    `<p>${text}</p><div class="row"><button class="btn" id="confirm-yes">${label}</button><button class="btn secondary" id="confirm-no">Cancelar</button></div>`,
    (d) => {
      $("#confirm-no", d).onclick = () => d.close();
      $("#confirm-yes", d).onclick = () => {
        d.close();
        yes();
      };
    },
  );
}
function empty(title, text, to, button) {
  return `<div class="empty"><div class="empty-icon">${icon("leaf", 28)}</div><h3 style="margin-top:18px">${title}</h3><p>${text}</p>${to ? link(to, button) : ""}</div>`;
}
function storageCopy() {
  const status = Store.getStorageStatus();
  if (status.error || status.hasUnstoredChanges)
    return (
      status.error ||
      "Hay cambios que el navegador no ha podido guardar. Exporta una copia antes de salir."
    );
  return status.mode === "device"
    ? "Guardado activado en este navegador y dispositivo."
    : "Guardado de sesión: los cambios se conservan al recargar esta pestaña si el navegador dispone de espacio. Para volver después de cerrarla, activa el guardado en este dispositivo.";
}
function saveNotice() {
  return `<p class="small muted">${esc(storageCopy())} <a class="text-link" href="#/ajustes">Elegir cómo guardar</a>. Usa iniciales o roles; evita datos identificativos de otras personas.</p>`;
}
function titleFor(path) {
  return (
    {
      bienvenida: "Un paso posible, también para ti",
      vivir: "Una situación, un paso posible",
      volver: "Volver con lo que ocurrió",
      explorar: "Lo que necesitas, cuando lo necesitas",
      micamino: "Lo que vas haciendo tuyo",
      pausa: "Un momento sin exigencias",
      profundizar: "Usar BrainBox en tu día",
      feedback: "Tu experiencia nos ayuda a mejorar",
      brainbox: "Del comprender al hacer, con retorno",
      hoy: "Un espacio para quien cuida",
      recursos: "Un recurso cuando te sirva",
      mapa: "Hacer visible lo que pesa",
      plan: "De la intención a lo posible",
      programa: "Aprender haciendo",
      biblioteca: "El conocimiento, cuando lo necesitas",
      herramientas: "Recursos que se convierten en acciones",
      media: "Un momento para escuchar",
      ajustes: "Tú decides cómo usarlo",
      ayuda: "Encontrar apoyo",
      red: "Compartir la responsabilidad",
      apoyos: "Apoyos cerca de ti",
      tramites: "Preparar una gestión",
      grupo: "Preparar un encuentro acompañado",
      logros: "Tu camino, a tu ritmo",
    }[path] || "Tu espacio de cuidado"
  );
}
function drawNav(path) {
  path = ["hoy", "bienvenida", "vivir", "brainbox", "pausa"].includes(path)
    ? "hoy"
    : ["micamino", "volver", "plan", "revision", "logros"].includes(path)
      ? "micamino"
      : "explorar";
  $("#navigation").innerHTML = nav
    .map(([id, label, i]) =>
      link(id, label, `nav-link ${path === id ? "active" : ""}`, i),
    )
    .join("");
  $(".mobile-nav").innerHTML = nav
    .map(
      ([id, label, i]) =>
        `<a href="#/${id}" class="${path === id ? "active" : ""}" ${path === id ? 'aria-current="page"' : ""}>${icon(i)}<span>${label}</span></a>`,
    )
    .join("");
  $$(".nav-link.active").forEach((a) => a.setAttribute("aria-current", "page"));
  $("#breadcrumb").textContent = titleFor(path);
}
function dimBars() {
  const s = Store.get(),
    answered = dimensions.filter(([id]) => id in s.dimensions);
  return answered.length
    ? answered
        .map(
          ([id, label]) =>
            `<div class="dim-row"><span>${label}</span><div class="bar" aria-hidden="true"><span style="width:${25 + s.dimensions[id] * 25}%"></span></div><span class="dim-value">${["Llevadero", "Exigente", "Muy pesado", "Al límite"][s.dimensions[id]]}</span></div>`,
        )
        .join("")
    : '<p class="muted small">Poner nombre a lo que pesa es el primer paso para cambiar su reparto.</p><div aria-hidden="true">' +
        ["Tiempo", "Carga mental", "Apoyos"]
          .map(
            (x, i) =>
              `<div class="dim-row"><span>${x}</span><div class="bar"><span style="width:${[55, 80, 38][i]}%;opacity:.3"></span></div><span class="dim-value">Por explorar</span></div>`,
          )
          .join("") +
        "</div>";
}
function badges() {
  const s = Store.get();
  return [
    [
      "map",
      "Lo hice visible",
      "Registraste tu mapa.",
      Object.keys(s.dimensions).length > 0,
      "map",
    ],
    [
      "plan",
      "Un paso posible",
      "Preparaste una acción.",
      s.actions.length > 0,
      "leaf",
    ],
    [
      "share",
      "Una carga compartida",
      "Registraste un acuerdo aceptado.",
      s.actions.some(
        (a) =>
          a.tool === "reparto" && ["aceptado", "realizado"].includes(a.status),
      ),
      "people",
    ],
    [
      "learn",
      "Aprender haciendo",
      "Marcaste tres prácticas.",
      s.completed.length >= 3,
      "program",
    ],
    [
      "review",
      "Escuchar el retorno",
      "Registraste una revisión.",
      s.reviews.length > 0,
      "spark",
    ],
    [
      "practice",
      "Otra mirada",
      "Exploraste una situación.",
      s.practice.length > 0,
      "flower",
    ],
  ];
}
function home() {
  const s = Store.get(),
    pending = s.actions.filter(
      (x) => !["realizado", "pausado"].includes(x.status),
    );
  const next =
    program?.units.find((u) => !s.completed.includes(u.id)) ||
    program?.units[0];
  view.innerHTML = `<section class="hero"><div class="hero-copy"><p class="eyebrow">CARELAB · MÉTODO BRAINBOX 1.2</p><h1>Cuidar también<br>puede dejar<br><em>espacio para ti.</em></h1><p>Vamos a sacar la carga de tu cabeza y convertirla en un plan más llevadero. Un paso posible, con los apoyos que necesitas.</p><div class="row">${link("brainbox", "Empezar con BrainBox")}${link("acerca", "Cómo te ayuda", "text-link", "")}</div></div><div class="hero-art">${art()}<span class="art-label">No tienes que sostenerlo todo.</span></div></section>
${s.profile === "sin-elegir" ? `<section class="onboarding"><div class="row between"><div><strong>Un espacio que encaje contigo</strong><p class="small muted" style="margin:5px 0 0">Puedes empezar sin responder ni crear una cuenta.</p></div><button class="btn secondary small" id="choose-profile">Elegir mi contexto ${icon("arrow", 16)}</button></div></section>` : ""}
<section class="section"><div class="section-head"><h2>¿Qué necesitas hoy?</h2><span class="small muted">Elige solo una cosa</span></div><div class="grid three quick-grid">${[
    [
      "tool/mapa",
      "Tengo demasiadas cosas en la cabeza",
      "Hacer visible la carga",
      "spark",
    ],
    [
      "tool/reparto",
      "Necesito que alguien me ayude",
      "Preparar una petición",
      "people",
    ],
    ["media", "Necesito un poco de aire", "Una pausa con audio", "leaf"],
  ]
    .map(
      ([to, t, d, i]) =>
        `<a class="quick-card" href="#/${to}"><span class="round">${icon(i)}</span><span><strong>${t}</strong><small>${d}</small></span><span class="arrow">${icon("arrow", 17)}</span></a>`,
    )
    .join("")}</div></section>
<section class="section grid wide-grid"><div class="card"><div class="section-head"><h2>Tu próximo paso</h2>${link("plan", "Ver mi plan", "text-link", "")}</div>${pending.length ? pending.slice(0, 2).map(taskCard).join("") : empty("Pequeño. Concreto. Posible.", "No necesitas resolverlo todo hoy. Prepara una acción y decide qué apoyo hace falta.", "brainbox", "Preparar mi primer paso")}</div><div class="card soft"><p class="mini-heading">LA CARGA TIENE MUCHAS CARAS</p><h2 style="font-size:1.6rem">Así está tu cuidado</h2>${dimBars()}${link("mapa", Object.keys(s.dimensions).length ? "Actualizar mi mapa" : "Explorar mi carga", "text-link", "arrow")}</div></section>
<section class="section grid wide-grid"><div class="card"><p class="mini-heading">TU PROGRAMA PRÁCTICO</p><div class="row between"><span class="tag">12 módulos · 36 prácticas abiertas</span>${s.settings.gamification ? `<span class="small muted">${s.completed.length} exploradas</span>` : ""}</div><h2 style="margin-top:22px;font-size:1.9rem">${esc(next?.title || "Aprender a cuidar sin desaparecer")}</h2><p class="muted small">${esc(next?.summary || "Elige un tema y llévalo a tu vida con un instrumento concreto.")}</p>${link(next ? "unidad/" + next.id : "programa", "Entrar en esta práctica", "btn secondary")}<div style="margin-top:14px">${link("programa", "Ver todo el programa", "text-link", "")}</div></div><div class="card dark pause-card"><p class="mini-heading" style="color:#d7e4cc">UN MOMENTO PARA TI</p><div class="pause-orb" aria-hidden="true"></div><h3>Ahora, un poco de espacio.</h3><p class="small muted">Puedes parar. Escuchar. Retomar cuando quieras.</p><button class="btn light" data-track="pausa">${icon("play", 17)} Escuchar una pausa</button></div></section>
${s.settings.gamification ? `<section class="section row between"><span class="small muted">${badges().filter((x) => x[3]).length} pequeños logros reconocidos. Sin rachas ni competición.</span>${link("logros", "Mi recorrido", "text-link", "arrow")}</section>` : ""}`;
  $("#choose-profile")?.addEventListener("click", chooseProfile);
  wireTasks();
}
function chooseProfile() {
  modal(
    "¿Desde dónde cuidas?",
    `<p class="muted">Se usa para destacar prácticas relacionadas. No te clasifica ni evalúa.</p><div class="stack">${[
      ["familia", "Cuido a alguien de mi entorno"],
      ["profesional", "Cuidar es mi trabajo"],
      ["multiple", "Cuido en varios ámbitos"],
      ["acompanar", "Acompaño a otras personas cuidadoras"],
    ]
      .map(
        ([k, t]) =>
          `<button class="quick-card" data-profile="${k}">${t}${icon("arrow", 16)}</button>`,
      )
      .join("")}</div>`,
    (d) =>
      $$("[data-profile]", d).forEach(
        (b) =>
          (b.onclick = () => {
            Store.get().profile = b.dataset.profile;
            sync();
            d.close();
            render();
            toast(
              Store.getStorageStatus().error ||
                "Contexto elegido. Puedes cambiarlo cuando quieras.",
            );
          }),
      ),
  );
}
function mapPage() {
  const s = Store.get();
  view.innerHTML =
    header(
      "MI CARGA",
      "Ponerle nombre<br>a lo que pesa.",
      "Un mapa personal para decidir por dónde empezar. No es un test ni una valoración clínica.",
    ) +
    `<div class="grid wide-grid"><section class="card"><form id="map-form">${dimensions.map(([id, label, desc]) => `<fieldset class="dimension-field"><legend>${label}</legend><p class="muted">${desc}</p><div class="choice-group">${["Llevadero", "Exigente", "Muy pesado", "Al límite"].map((v, i) => `<label class="choice"><input type="radio" name="${id}" value="${i}" ${s.dimensions[id] === i ? "checked" : ""}><span>${v}</span></label>`).join("")}</div><button type="button" class="text-link small" data-clear-dim="${id}" style="margin-top:8px">Dejar sin responder</button></fieldset>`).join("")}<div class="section">${saveNotice()}<button class="btn">Guardar mi mapa ${icon("arrow", 17)}</button></div></form></section><aside class="stack" style="align-content:start"><div class="card soft"><p class="mini-heading">DE VERLO A CAMBIARLO</p><h2>El cuidado es un sistema.</h2><p class="small muted">El tiempo puede estar unido al reparto de tareas. El descanso, a la disponibilidad de un relevo. No todo se arregla esforzándote más.</p><ol class="step-list"><li>Observa qué pesa hoy.</li><li>Elige una parte abordable.</li><li>Prepara un cambio con apoyos.</li><li>Revisa qué ocurrió.</li></ol></div><div class="boundary">Si algo está al límite, puedes ir directamente a <a href="#/ayuda" class="text-link">encontrar apoyo</a>. La herramienta no calcula riesgo a partir de estas respuestas.</div>${s.mapHistory.length ? `<div class="card"><h3>Mapas anteriores</h3><p class="small muted">${s.mapHistory.length} registros personales. Último: ${date(s.mapHistory.at(-1).date)}. Sirven para conversar sobre cambios, no para medir eficacia.</p>${link("revision", "Revisar lo que cambia", "text-link")}</div>` : ""}</aside></div>`;
  $$("[data-clear-dim]").forEach(
    (b) =>
      (b.onclick = () => {
        $$(`input[name="${b.dataset.clearDim}"]`).forEach(
          (r) => (r.checked = false),
        );
      }),
  );
  $("#map-form").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      d = {};
    for (const [id] of dimensions) if (f.has(id)) d[id] = Number(f.get(id));
    if (
      Object.keys(d).length &&
      s.mapHistory.length >= Store.LIMITS.mapHistory
    ) {
      toast(
        "Has llegado a 100 mapas. Exporta una copia antes de iniciar un espacio nuevo. No se ha sustituido ningún mapa.",
      );
      return;
    }
    s.dimensions = d;
    if (Object.keys(d).length)
      s.mapHistory.push({
        date: new Date().toISOString(),
        dimensions: { ...d },
      });
    sync();
    modal(
      "Tu mapa está preparado",
      `<p>Elige qué quieres transformar primero. Ninguna respuesta te obliga a seguir una ruta.</p><div class="stack">${
        [...dimensions]
          .filter(([id]) => id in d)
          .sort((a, b) => d[b[0]] - d[a[0]])
          .slice(0, 3)
          .map(([id, label]) => link("herramientas/" + id, label, "quick-card"))
          .join("") || link("herramientas", "Ver las herramientas", "btn")
      }</div>${link("hoy", "Volver a mi espacio", "text-link", "")}`,
      (el) =>
        $$("a", el).forEach((a) =>
          a.addEventListener("click", () => el.close()),
        ),
    );
  };
}
function taskCard(a) {
  return `<article class="task"><span class="task-dot ${a.status === "realizado" ? "done" : ""}" aria-hidden="true"></span><div class="task-body"><h3>${esc(a.title)}</h3><p>${esc(a.owner || "Responsable por concretar")} · ${esc(a.due || "Sin fecha acordada")}</p><span class="tag ${a.status === "propuesto" ? "orange" : "neutral"}">${{ propuesto: "Propuesta · falta acordar", aceptado: "Aceptado según tu registro", realizado: "Realizado según tu registro", pausado: "En pausa" }[a.status]}</span><details><summary>Ver el plan preparado</summary>${Object.entries(
    a.fields || {},
  )
    .filter(
      ([k, v]) =>
        v && !["scope", "bb_scope", "bb_stage", "bb_version"].includes(k),
    )
    .map(
      ([k, v]) =>
        `<p><strong>${esc(fieldLabel(a.tool, k))}</strong><br>${esc(v).replace(/\n/g, "<br>")}</p>`,
    )
    .join(
      "",
    )}</details></div><div class="task-tools no-print"><button data-edit="${esc(a.id)}">Editar</button><button data-copy="${esc(a.id)}">Copiar</button><button data-review="${esc(a.id)}">Revisar</button></div></article>`;
}
const commonLabels = {
  review: "Cómo y con qué criterio revisar",
  reviewDate: "Cuándo revisar",
  evidence: "Información de partida",
  stop: "Condición para detenerse",
  action: "Acción",
  support: "Apoyos y dependencias",
  scope: "Ámbito",
};
function fieldLabel(tool, k) {
  if (Object.hasOwn(brainboxFieldLabels, k)) return brainboxFieldLabels[k];
  return (
    toolFor(tool)?.fields?.find((x) => x[0] === k)?.[1] ||
    (Object.hasOwn(commonLabels, k) ? commonLabels[k] : k)
  );
}
function taskText(a) {
  return [
    `CARELAB · ${a.title}`,
    `Estado: ${a.status}`,
    `Responsable: ${a.owner || "Por concretar"}`,
    `Ocasión: ${a.due || "Por concretar"}`,
    ...Object.entries(a.fields || {})
      .filter(([k, v]) => v)
      .map(([k, v]) => `${fieldLabel(a.tool, k)}: ${v}`),
    "Registro preparado por quien usa CareLab; no acredita aceptación de terceros ni verificación profesional.",
  ].join("\n\n");
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copiado. Revisa qué datos quieres compartir antes de enviarlo.");
  } catch {
    modal(
      "Texto para copiar",
      field("copy-text", "Selecciona y copia el texto", text),
      (d) => {
        $("#copy-text", d).select();
      },
    );
  }
}
function wireTasks() {
  $$("[data-edit]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = Store.get().actions.find((a) => a.id === b.dataset.edit);
        const living = Store.get().journey.sessions.find(
          (s) => s.actionId === a.id,
        );
        if (living) {
          if (living.status !== "reviewed") living.step = 8;
          sync();
          location.hash = `#/${living.status === "reviewed" ? "volver" : "vivir"}/${living.id}`;
          return;
        }
        location.hash = a.fields?.bb_version
          ? `#/brainbox/${a.id}`
          : `#/tool/${a.tool}/${a.id}`;
      }),
  );
  $$("[data-copy]").forEach(
    (b) =>
      (b.onclick = () =>
        copyText(
          taskText(Store.get().actions.find((a) => a.id === b.dataset.copy)),
        )),
  );
  $$("[data-review]").forEach(
    (b) =>
      (b.onclick = () => {
        const living = Store.get().journey.sessions.find(
          (s) => s.actionId === b.dataset.review,
        );
        if (living) location.hash = `#/volver/${living.id}`;
        else reviewModal(b.dataset.review);
      }),
  );
}
function planPage() {
  const s = Store.get();
  view.innerHTML =
    header(
      "MI PLAN",
      "Menos en la cabeza.<br>Más sobre la mesa.",
      "Tus acciones, acuerdos y revisiones en un mismo lugar.",
      `<div class="row section">${link("brainbox", "Preparar con BrainBox", "btn", "plus")}${link("red", "Mi red de apoyo", "btn secondary", "people")}<button class="btn ghost" id="print-plan">Imprimir mi plan</button></div>`,
    ) +
    saveNotice() +
    `<div class="stats"><div><span class="count">${s.actions.filter((a) => a.status === "propuesto").length}</span><small>por acordar</small></div><div><span class="count">${s.actions.filter((a) => a.status === "aceptado").length}</span><small>aceptadas según tu registro</small></div><div><span class="count">${s.actions.filter((a) => a.status === "realizado").length}</span><small>realizadas</small></div></div><div class="subnav no-print"><button class="pill active" data-status="">Todas</button><button class="pill" data-status="propuesto">Por acordar</button><button class="pill" data-status="aceptado">Aceptadas</button><button class="pill" data-status="realizado">Realizadas</button><button class="pill" data-status="pausado">En pausa</button></div><section class="stack" id="tasks">${s.actions.length ? s.actions.map(taskCard).join("") : empty("Tu plan empieza con una sola acción", "Puedes reducir, simplificar, compartir o pedir apoyo. No tiene que ser hacer más.", "brainbox", "Preparar con BrainBox")}</section><section class="section"><div class="section-head"><h2>Qué ha ocurrido después</h2>${link("revision", "Registrar una revisión", "text-link")}</div>${s.reviews.length ? '<p class="small muted">Se muestran los diez retornos más recientes. La copia exportada conserva todos.</p>' : ""}${
      s.reviews.length
        ? s.reviews
            .slice()
            .reverse()
            .slice(0, 10)
            .map(
              (r) =>
                `<article class="card" style="margin-bottom:12px"><span class="tag">${date(r.date)}</span><h3 style="margin-top:15px">${esc(r.result)}</h3><p class="small">${esc(r.note)}</p><p class="small muted"><strong>Próximo ajuste:</strong> ${esc(r.next || "Sin concretar")}</p>${
                  r.fields
                    ? `<details><summary>Ver las preguntas y la procedencia</summary>${Object.entries(
                        r.fields,
                      )
                        .filter(([k, v]) => v && k !== "bb_fuente_codigo")
                        .map(
                          ([k, v]) =>
                            `<p><strong>${esc(reviewLabels[k] || brainboxFieldLabels[k] || k)}:</strong> ${esc(reviewValue(k, v))}</p>`,
                        )
                        .join(
                          "",
                        )}<p class="small muted">La procedencia refleja tu registro. CareLab no certifica una comprobación independiente.</p></details>`
                    : ""
                }</article>`,
            )
            .join("")
        : '<p class="muted small">Cuando pruebes un cambio, anota qué ayudó y qué necesita ajuste.</p>'
    }</section>`;
  $("#print-plan").onclick = () => window.print();
  $$("[data-status]").forEach(
    (b) =>
      (b.onclick = () => {
        $$("[data-status]").forEach((x) =>
          x.classList.toggle("active", x === b),
        );
        const list = s.actions.filter(
          (a) => !b.dataset.status || a.status === b.dataset.status,
        );
        $("#tasks").innerHTML = list.length
          ? list.map(taskCard).join("")
          : empty(
              "No hay acciones en este estado",
              "Puedes volver a Todas o preparar una nueva.",
            );
        wireTasks();
      }),
  );
  wireTasks();
}
function toolsPage(dimension) {
  const values = Object.entries(tools).sort(
    (a, b) =>
      Number(b[1].dimension === dimension) -
      Number(a[1].dimension === dimension),
  );
  view.innerHTML =
    header(
      "HERRAMIENTAS",
      "Del problema<br>a algo que puedas usar.",
      "Elige un instrumento. Te ayudará a preparar una salida concreta y editable, aquí mismo.",
    ) +
    `<div class="grid three">${values.map(([id, t]) => `<a class="card clickable module-card" href="#/tool/${id}"><div class="row between">${icon(t.icon, 27)}<span class="tag ${t.outside ? "orange" : ""}">${t.outside ? "Preparar apoyo" : "Organización cotidiana"}</span></div><h3 style="margin-top:22px">${t.title}</h3><p>${t.subtitle}</p><div class="row between"><small>${t.output}</small>${icon("arrow", 18)}</div></a>`).join("")}</div><div class="boundary section">${boundary}</div>`;
}
function toolPage(id, editId, prepared = false) {
  const t = toolFor(id);
  if (!t) {
    notFound();
    return;
  }
  const current = Store.get().actions.find(
    (a) => a.id === editId && a.tool === id,
  );
  if (editId && !current) {
    notFound();
    return;
  }
  if (current?.fields?.bb_version) {
    location.hash = `#/brainbox/${current.id}`;
    return;
  }
  const draft = drafts[`${id}/${editId || ""}`] || {};
  const data = {
    ...current,
    ...draft,
    fields: { ...(current?.fields || {}), ...(draft.fields || {}) },
  };
  if (!prepared && !current && !t.outside) {
    view.innerHTML =
      header("ANTES DE EMPEZAR", t.title, t.subtitle) +
      `<div class="reading"><div class="card"><h2 style="font-size:1.8rem">¿Qué necesitas resolver?</h2><p>Este instrumento organiza acciones cotidianas. No toma decisiones médicas, psicológicas o legales.</p><div class="stack"><button class="quick-card" id="daily-scope">Organizar una situación cotidiana ${icon("arrow", 18)}</button>${link("tool/consulta", "Preparar una consulta con alguien competente", "quick-card")}${link("ayuda", "Hay riesgo o necesito ayuda ahora", "quick-card")}</div><div class="boundary section">${boundary}</div></div></div>`;
    $("#daily-scope").onclick = () => toolPage(id, editId, true);
    return;
  }
  const f = data.fields || {};
  view.innerHTML =
    header(
      t.outside ? "PREPARAR APOYO COMPETENTE" : "HERRAMIENTA PRÁCTICA",
      t.title,
      t.subtitle,
    ) +
    `<div class="grid wide-grid"><div class="card"><form id="tool-form">${field("title", "Ponle un nombre a tu plan", data.title || t.prompt, "", "text", true)}${t.fields.map(([k, label, p], i) => field(k, label, f[k] || "", p, "textarea", i === 0 || k === "action")).join("")}<details><summary>Concretar responsabilidad, ocasión y revisión</summary><div style="padding-top:15px">${field("owner", "¿Quién asume este paso?", data.owner || "Yo", "Usa un rol o iniciales.", "text")}${field("due", "¿En qué ocasión o fecha?", data.due || "", "El jueves al hablar del próximo turno.", "text")}${!t.fields.some((x) => x[0] === "review") ? field("review", "¿Qué observarás y cómo sabrás si ayuda?", f.review || "", "Qué, quién, cómo y qué criterio usarás.") : ""}${field("reviewDate", "¿Cuándo revisarás lo ocurrido?", f.reviewDate || "", "Después de probarlo en la ocasión acordada.", "text")}${field("evidence", "¿Con qué información cuentas para decidir?", f.evidence || "", "Hechos, acuerdos, fuente de información y dudas.", "textarea")}${!t.fields.some((x) => x[0] === "stop") ? field("stop", "¿Qué haría necesario parar o cambiar?", f.stop || "", "Falta de cobertura, cambio de condiciones o necesidad de apoyo.") : ""}</div></details><div class="field"><label for="status">Estado real del acuerdo</label><select name="status" id="status">${[
      ["propuesto", "Propuesta · todavía por acordar"],
      ["aceptado", "Aceptado · lo he confirmado"],
      ["realizado", "Realizado · lo he llevado a cabo"],
      ["pausado", "En pausa"],
    ]
      .map(
        ([v, l]) =>
          `<option value="${v}" ${data.status === v ? "selected" : ""}>${l}</option>`,
      )
      .join(
        "",
      )}</select><small>CareLab no envía tareas ni confirma la disponibilidad de otras personas.</small></div><label class="row small" style="align-items:flex-start;margin:20px 0"><input type="checkbox" required name="scope" value="organizacion" ${current ? "checked" : ""}><span>${t.outside ? "Entiendo que esto prepara una consulta; no resuelve la decisión profesional." : "El paso que preparo es de organización cotidiana. Si hay riesgo o una situación médica, psicológica o legal, no aplicaré BrainBox y pediré ayuda competente."}</span></label>${saveNotice()}<div class="row"><button class="btn" type="submit">${current ? "Guardar cambios" : "Añadir a mi plan"} ${icon("check", 18)}</button>${link("plan", "Volver al plan", "btn secondary", "")}</div></form>${current ? `<div class="hr"></div><button class="text-link" id="delete-action">Eliminar esta acción</button>` : ""}</div><aside class="stack" style="align-content:start"><div class="card soft"><p class="mini-heading">LO QUE TE LLEVAS</p><h2 style="font-size:1.8rem">${t.output}</h2><p class="small muted">Puedes editarlo, copiarlo, imprimirlo y volver para revisar qué ocurrió. No se enviará a nadie automáticamente.</p><div class="flow-diagram"><button class="pill active" data-flow="0">Preparar</button> → <button class="pill" data-flow="1">Acordar</button> → <button class="pill" data-flow="2">Revisar</button><p id="flow-text" class="small" style="margin-top:15px">Describe qué hace falta, quién podría ayudar y qué condiciones deben cumplirse.</p></div></div><div class="boundary">${boundary}</div><div class="card"><h3>Para entender esta parte</h3><p class="small muted">Consulta términos, prácticas y límites relacionados.</p>${link("biblioteca", "Buscar en la biblioteca", "text-link")}</div></aside></div>`;
  $$("[data-flow]").forEach(
    (b) =>
      (b.onclick = () => {
        $$("[data-flow]").forEach((x) => x.classList.toggle("active", x === b));
        $("#flow-text").textContent = [
          "Describe qué hace falta, quién podría ayudar y qué condiciones deben cumplirse.",
          "La ayuda solo es un acuerdo cuando la persona lo acepta y puede hacerlo. Registra lo confirmado, no lo supuesto.",
          "Observa qué ocurrió con el criterio que preparaste. Decide si mantener, adaptar o parar.",
        ][b.dataset.flow];
      }),
  );
  const form = $("#tool-form");
  form.addEventListener("input", () => {
    const all = Object.fromEntries(new FormData(form));
    drafts[`${id}/${editId || ""}`] = {
      title: all.title,
      owner: all.owner,
      due: all.due,
      status: all.status,
      fields: all,
    };
    sync();
  });
  form.onsubmit = (e) => {
    e.preventDefault();
    const all = Object.fromEntries(new FormData(form));
    if (!all.title?.trim()) {
      toast("Escribe un nombre para este paso.");
      return;
    }
    const a = {
      id: current?.id || Store.uid(),
      title: all.title.trim(),
      tool: id,
      owner: all.owner || "Yo",
      due: all.due || "",
      status: all.status,
      fields: Object.fromEntries(
        Object.entries(all).filter(
          ([k]) => !["title", "owner", "due", "status"].includes(k),
        ),
      ),
      createdAt: current?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const s = Store.get();
    if (current)
      s.actions = s.actions.map((x) => (x.id === current.id ? a : x));
    else {
      if (s.actions.length >= Store.LIMITS.actions) {
        toast(
          "Has llegado a 300 acciones. Exporta una copia y revisa las antiguas.",
        );
        return;
      }
      s.actions.unshift(a);
    }
    delete drafts[`${id}/${editId || ""}`];
    sync();
    location.hash = "#/plan";
    toast(
      Store.getStorageStatus().error ||
        "Paso añadido a tu plan. Puedes editarlo o compartir solo lo que elijas.",
    );
  };
  $("#delete-action")?.addEventListener("click", () =>
    confirmAction(
      "¿Eliminar esta acción?",
      "Se retirará de tu plan. Las copias que hayas exportado no se modifican.",
      () => {
        Store.get().actions = Store.get().actions.filter(
          (x) => x.id !== current.id,
        );
        delete drafts[`${id}/${editId || ""}`];
        sync();
        location.hash = "#/plan";
      },
      "Eliminar",
    ),
  );
}
const reviewLabels = {
  done: "¿Se hizo?",
  worth: "¿Mereció la pena? ¿Para quién?",
  attribution: "¿Qué se puede atribuir?",
  origin: "Procedencia declarada",
  verification: "Comprobación descrita",
  integration: "Ser y hacer (opcional)",
  metabrainbox: "La herramienta y su carga",
  decision: "Decisión",
  bb_antes: "Observación de partida",
  bb_hizo: "Qué se hizo, según mi registro",
  bb_paso: "Qué ocurrió",
  bb_valor: "Valor para mí",
  bb_coste: "Costes y condiciones",
  bb_atribucion: "Qué puedo atribuir a la acción",
  bb_procedencia: "Procedencia del registro",
  bb_fuente: "De dónde sale lo que cuento",
  bb_criterio_previsto: "Criterio preparado antes de actuar",
  bb_procedimiento_previsto: "Cómo iba a comprobarlo",
  bb_decision: "Decisión después del retorno",
  bb_siguiente: "Condición que cambiaré",
  bb_alineacion: "Relación entre sentir y hacer",
  bb_vueltas: "Dirección de las ocasiones observadas",
  bb_metacarga: "Carga que añadió la prueba",
  bb_disponibilidad: "Información disponible",
};
function reviewValue(key, value) {
  const choices = {
    done: {
      si: "Sí, según mi registro",
      "no-sabemos": "Todavía no lo sé",
      "no-ocurrio": "No ocurrió",
      "no-observado": "No lo vimos",
      "no-compartido": "La persona prefirió no contarlo",
    },
    bb_valor: {
      ayudo: "Me ha ayudado en esta situación",
      igual: "No noté un cambio",
      carga: "Ha añadido carga",
      incierto: "Todavía no puedo valorarlo",
      reservado: "Prefiero no valorarlo",
    },
    bb_decision: {
      mantener: "Mantener",
      ajustar: "Ajustar",
      indagar: "Buscar un dato que falta",
      pausar: "Pausar",
      sustituir: "Probar otra opción",
      dejar: "Dejar esta prueba",
    },
    bb_alineacion: {
      juntos: "En esa ocasión iban juntos",
      separados: "En esa ocasión iban separados",
      mixto: "Hubo de las dos cosas",
      reservado: "Prefiero no compararlo",
    },
  };
  return choices[key] && Object.hasOwn(choices[key], value)
    ? choices[key][value]
    : value;
}
function reviewModal(actionId = "") {
  if (Store.get().reviews.length >= Store.LIMITS.reviews) {
    toast(
      "Has llegado a 300 revisiones. Exporta una copia antes de iniciar un espacio nuevo; tus registros actuales se conservan.",
    );
    return;
  }
  const a = Store.get().actions.find((x) => x.id === actionId),
    f = a?.fields || {};
  modal(
    "BrainBox · revisar y decidir",
    `<p class="muted small">${esc(a?.title || "Una situación que quieras revisar")}. Las cuatro preguntas se consideran por separado. Un retorno no tiene que ser favorable para ayudar a decidir.</p>${a ? `<details><summary>Recordar el retorno que preparaste</summary><p>${esc(f.bb_rev_que || f.review || "No consta un criterio previo; puedes reconocer esa limitación al revisar.")}</p><p class="small">Quién: ${esc(f.bb_rev_quien || "sin concretar")} · Cuándo: ${esc(f.bb_rev_cuando || f.reviewDate || "sin concretar")}</p><p class="small">Criterio: ${esc(f.bb_rev_criterio || "sin concretar")}</p><p class="small">Procedimiento: ${esc(f.bb_rev_como || "sin concretar")}</p></details>` : ""}<form id="review-form" data-draft-context="${esc(actionId || "new")}"><div class="field"><label for="done">1. ¿Se hizo?</label><select name="done" id="done"><option value="no-sabemos">Todavía no lo sé</option><option value="si">Sí, según la información disponible</option><option value="no-ocurrio">No ocurrió / no se hizo</option><option value="no-observado">No lo vimos</option><option value="no-compartido">La persona prefirió no contarlo</option></select></div>${field("note", "2. ¿Qué pasó, cuándo y quién lo vio?", "", "Describe lo ocurrido y su procedencia. Lo no observado no equivale a lo no ocurrido.", "textarea", true)}${field("worth", "3. ¿Mereció la pena y para quién?", "", "Beneficios, costes, carga y conflictos. Puede que todavía no lo sepas.")}${field("attribution", "4. ¿Qué se puede atribuir a lo hecho?", "", "Que ocurra después no demuestra que lo haya causado. ¿Qué otras condiciones influyeron?")}<div class="field"><label for="result">Cómo describes el resultado, sin puntuarlo</label><select id="result" name="result">${Store.REVIEW_RESULTS.map((x) => `<option ${x === "Todavía no lo sé" ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></div><details><summary>Procedencia y contraste del retorno</summary><div class="field"><label for="origin">Procedencia que declaras</label><select id="origin" name="origin"><option value="declarado">Declarado: lo cuento yo o me lo han contado</option><option value="simulado">Simulado: es un ejemplo o ensayo ficticio</option><option value="verificado">Verificación independiente descrita por mí</option></select></div>${field("verification", "Quién lo comprobó, cómo y cuándo", "", "Para describirlo como verificado: persona o rol independiente, procedimiento y ocasión. No escribas datos identificativos.")}<p class="small muted">CareLab conserva tu declaración; no comprueba ni certifica por sí mismo una verificación externa. Un ejemplo simulado no prueba un resultado real.</p></details><details><summary>Ser y hacer, y el uso de CareLab (opcional)</summary>${field("integration", "Mientras lo hacías, ¿lo que sentías y hacías iban juntos o separados?", "", "Pregunta exploratoria del método. Puedes no responder; no mide ni etiqueta.")}${field("metabrainbox", "¿Usar esta herramienta ayudó o añadió carga?", "", "Qué simplificarías, quitarías o necesitarías. Se conserva aquí; no se envía al equipo.")}</details><div class="field"><label for="decision">Decisión a partir del retorno</label><select id="decision" name="decision"><option>Mantener</option><option>Ajustar</option><option selected>Indagar</option><option>Pausar</option><option>Sustituir</option><option>Dejar</option></select></div>${field("next", "¿Qué harás ahora o qué pausa has decidido?")}<button class="btn">Guardar retorno</button></form>`,
    (d) => {
      const form = $("#review-form", d);
      $("#origin", d).onchange = (e) => {
        $("#verification", d).required = e.target.value === "verificado";
      };
      form.onsubmit = (e) => {
        e.preventDefault();
        const values = Object.fromEntries(new FormData(form));
        if (!values.note.trim()) {
          toast("Describe lo ocurrido o lo que todavía no puedes saber.");
          return;
        }
        if (values.origin === "verificado" && !values.verification.trim()) {
          toast("Describe quién comprobó el retorno, cómo y cuándo.");
          return;
        }
        const { result, note, next, ...fields } = values;
        Store.get().reviews.push({
          id: Store.uid(),
          date: new Date().toISOString(),
          actionId,
          result,
          note,
          next,
          fields,
        });
        clearFormDraft(form);
        sync();
        d.close();
        render();
        toast(
          Store.getStorageStatus().error ||
            "Retorno registrado. Revisar también permite pausar o cambiar.",
        );
      };
    },
  );
}
function revisionPage() {
  view.innerHTML =
    header(
      "EL RETORNO",
      "Mirar lo ocurrido.<br>Hacer sitio al ajuste.",
      "Lo que no funcionó también aporta información. No es una nota sobre ti.",
    ) +
    `<div class="grid two"><div class="card"><h2 style="font-size:1.9rem">¿Qué quieres revisar?</h2><p class="muted">Usa los criterios que preparaste o describe lo que has observado. Distingue hechos, impresiones y lo que aún no sabes.</p><button class="btn" id="new-review">Registrar una revisión</button></div><div class="card soft"><h3>Preguntas que ayudan</h3><ol class="step-list"><li>¿Se hizo?</li><li>¿Qué pasó y quién lo vio?</li><li>¿Mereció la pena y para quién?</li><li>¿Qué se puede atribuir a lo hecho?</li></ol></div></div><section class="section">${link("plan", "Volver a mis acciones", "text-link")}</section>`;
  $("#new-review").onclick = () => reviewModal();
}
function networkPage() {
  const s = Store.get();
  view.innerHTML =
    header(
      "MI RED",
      "Que la ayuda<br>tenga forma concreta.",
      "Una lista de personas no es todavía una red disponible. Registra qué se ha propuesto y qué está confirmado.",
      `<div class="row section"><button class="btn" id="add-person">${icon("plus", 18)} Añadir apoyo</button>${link("tool/reparto", "Preparar una petición", "btn secondary")}</div>`,
    ) +
    saveNotice() +
    `<div class="grid two">${s.people.map((p) => `<article class="card"><span class="tag ${p.accepted ? "" : "orange"}">${p.accepted ? "Disponibilidad confirmada por ti" : "Por preguntar o confirmar"}</span><h3 style="margin-top:18px">${esc(p.name)}</h3><p class="small">${esc(p.help)}</p><p class="small muted">${esc(p.availability)}</p><div class="row"><button class="text-link" data-person-edit="${esc(p.id)}">Editar</button><button class="text-link" data-person-delete="${esc(p.id)}">Eliminar</button></div></article>`).join("")}</div>${!s.people.length ? empty("No tienes que inventar una red que no existe", "Puedes empezar por pedir orientación en servicios sociales o preparar una petición pequeña y concreta.", "tool/consulta", "Preparar un contacto") : ""}<div class="boundary section">No se envían invitaciones ni se comparten datos. Las personas registradas no tienen acceso a tu espacio. Los acuerdos deben hablarse y confirmarse fuera de CareLab.</div>`;
  $("#add-person").onclick = () => personModal();
  $$("[data-person-edit]").forEach(
    (b) => (b.onclick = () => personModal(b.dataset.personEdit)),
  );
  $$("[data-person-delete]").forEach(
    (b) =>
      (b.onclick = () =>
        confirmAction(
          "Eliminar este apoyo",
          "Se eliminará el registro local, no un acuerdo ni una relación.",
          () => {
            s.people = s.people.filter((p) => p.id !== b.dataset.personDelete);
            clearFormDraft("person/" + b.dataset.personDelete);
            sync();
            render();
          },
          "Eliminar",
        )),
  );
}
function personModal(id) {
  if (!id && Store.get().people.length >= Store.LIMITS.people) {
    toast(
      "Has llegado a 80 apoyos. Puedes editar o eliminar un registro que ya no necesites; exporta antes si quieres conservarlo.",
    );
    return;
  }
  const p = Store.get().people.find((x) => x.id === id) || {};
  modal(
    p.id ? "Editar apoyo" : "Añadir un apoyo",
    `<form id="person-form" data-draft-context="${esc(p.id || "new")}">${field("name", "Rol o iniciales", p.name || "", "Por ejemplo, hermana o compañero de turno.", "text", true)}${field("help", "¿En qué podría ayudar?", p.help || "")}${field("availability", "¿Cuándo y con qué condiciones?", p.availability || "")}<label class="row small"><input type="checkbox" name="accepted" ${p.accepted ? "checked" : ""}> Lo he hablado y ha confirmado que puede hacerlo.</label><button class="btn section">Guardar apoyo</button></form>`,
    (d) => {
      $("#person-form", d).onsubmit = (e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.target));
        const next = {
          ...f,
          accepted: f.accepted === "on",
          id: p.id || Store.uid(),
        };
        if (p.id)
          Store.get().people = Store.get().people.map((x) =>
            x.id === p.id ? next : x,
          );
        else Store.get().people.push(next);
        clearFormDraft(e.target);
        sync();
        d.close();
        render();
      };
    },
  );
}
function programmePage(moduleId) {
  if (!program) {
    view.innerHTML =
      header(
        "PROGRAMA",
        "No hemos podido cargar el programa.",
        "Comprueba la conexión y vuelve a intentarlo.",
      ) + '<button class="btn" id="retry-program">Volver a intentar</button>';
    $("#retry-program").onclick = loadProgram;
    return;
  }
  const s = Store.get();
  const module = program.modules.find((m) => m.id === moduleId);
  if (module) {
    view.innerHTML =
      header(
        "MI PROGRAMA · " + esc(module.id.replace("m", "MÓDULO ")),
        esc(module.title),
        esc(module.summary),
        `<div class="row section">${link("programa", "Todos los módulos", "text-link", "back")}</div>`,
      ) +
      `<div class="stack">${module.unitIds
        .map((id, i) => {
          const u = program.units.find((u) => u.id === id);
          return `<a class="card clickable" href="#/unidad/${id}"><div class="row between"><span class="tag">PRÁCTICA ${i + 1}${s.settings.gamification && s.completed.includes(id) ? " · EXPLORADA" : ""}</span><span class="small muted">${esc(u.duration)}</span></div><h2 style="font-size:1.8rem;margin-top:20px">${esc(u.title)}</h2><p class="muted">${esc(u.summary)}</p><span class="text-link">Preparar ${esc(tools[u.tool]?.output.toLowerCase() || "un paso")} ${icon("arrow", 17)}</span></a>`;
        })
        .join("")}</div>`;
    return;
  }
  view.innerHTML =
    header(
      "TU PROGRAMA PRÁCTICO",
      "Aprender a cuidar.<br>Sin desaparecer en el intento.",
      "Doce módulos para trabajar la carga total del cuidado. Todos están abiertos: elige lo que te sirva ahora, sin examen ni plazo.",
    ) +
    `<div class="card soft row between"><div><strong>Tu vida marca el ritmo.</strong><p class="small muted" style="margin:4px 0 0">Cada práctica termina en un instrumento para preparar una acción real.</p></div>${s.settings.gamification ? link("logros", "Ver mi recorrido", "text-link", "arrow") : ""}</div>${s.profile === "multiple" ? '<p class="note section">Por tu contexto, puede interesarte el módulo 09: varios cuidados y continuidad.</p>' : s.profile === "acompanar" ? '<p class="note section">Por tu contexto, puede interesarte el módulo 10: cuidar a quien cuida.</p>' : ""}<section class="section grid three">${program.modules
      .map((m, i) => {
        const n = m.unitIds.filter((id) => s.completed.includes(id)).length;
        return `<a href="#/programa/${m.id}" class="card clickable module-card"><div class="row between"><span class="module-number">${String(i + 1).padStart(2, "0")}</span>${s.settings.gamification ? `<span class="tag neutral">${n}/3 exploradas</span>` : ""}</div><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p>${s.settings.gamification ? `<div class="progress" aria-label="${n} de 3 prácticas exploradas"><span style="width:${(n / 3) * 100}%"></span></div>` : ""}<div class="row between"><small>3 prácticas · a tu ritmo</small>${icon("arrow", 18)}</div></a>`;
      })
      .join(
        "",
      )}</section><div class="boundary section">Programa educativo y de organización del cuidado. No es un máster acreditado ni una intervención clínica. ${boundary}</div>`;
}
function unitPage(id) {
  const unit = program?.units.find((x) => x.id === id);
  if (!unit) {
    notFound();
    return;
  }
  mountGuidedPractice(view, {
    unit,
    program,
    Store,
    tools,
    notify: toast,
    readText,
  });
}

async function getLibrary() {
  if (library) return library;
  if (!libraryPromise)
    libraryPromise = fetch("data/biblioteca.json")
      .then((r) => {
        if (!r.ok) throw new Error("No se pudo cargar la biblioteca.");
        return r.json();
      })
      .then((d) => {
        library = d;
        library.items.forEach(
          (x) =>
            (x._search = norm(
              [x.title, x.summary, x.category, ...x.dimensions].join(" "),
            )),
        );
        return d;
      })
      .catch((e) => {
        libraryPromise = null;
        throw e;
      });
  return libraryPromise;
}
async function libraryPage() {
  const requested = route;
  view.innerHTML = header(
    "BIBLIOTECA",
    "Consulta lo que necesitas.<br>A tu ritmo.",
    "Cargando las fichas del proyecto…",
  );
  try {
    const data = await getLibrary();
    if (route !== requested) return;
    view.innerHTML =
      header(
        "BIBLIOTECA",
        "Consulta lo que necesitas.<br>A tu ritmo.",
        "Palabras, herramientas, cultura y guías. Busca una necesidad o abre una colección; no hace falta leerlo todo.",
      ) +
      `<div class="library-toolbar"><div class="filter-bar"><div class="searchbox"><label class="visually-hidden" for="library-search">Buscar en la biblioteca</label><input id="library-search" type="search" placeholder="¿Qué necesitas entender o resolver?" value="${esc(filter.q)}"></div><label class="visually-hidden" for="collection">Colección</label><select id="collection" style="width:auto"><option value="">Todas las colecciones</option>${Object.entries(
        data.counts,
      )
        .filter(([k]) => k !== "total")
        .map(
          ([k, n]) =>
            `<option value="${esc(k)}" ${filter.collection === k ? "selected" : ""}>${esc(k)} · ${n}</option>`,
        )
        .join(
          "",
        )}</select></div><div class="filter-bar"><label class="visually-hidden" for="lib-dimension">Dimensión del cuidado</label><select id="lib-dimension" style="width:auto"><option value="">Cualquier dimensión</option>${dimensions.map(([id, l]) => `<option value="${id}" ${filter.dimension === id ? "selected" : ""}>${l}</option>`).join("")}</select><button id="reset-search" class="pill">Limpiar filtros</button><span id="result-count" class="small muted" role="status" style="align-self:center"></span></div></div><div id="library-results" class="grid three"></div><div id="library-pages" class="row section"></div><p class="small muted section">Las fuentes conservan la fecha de revisión del corpus. Disponibilidad, requisitos y enlaces externos pueden cambiar.</p>`;
    let timer;
    $("#library-search").oninput = (e) => {
      filter.q = e.target.value;
      filter.page = 0;
      clearTimeout(timer);
      timer = setTimeout(libraryResults, 120);
    };
    $("#collection").onchange = (e) => {
      filter.collection = e.target.value;
      filter.page = 0;
      libraryResults();
    };
    $("#lib-dimension").onchange = (e) => {
      filter.dimension = e.target.value;
      filter.page = 0;
      libraryResults();
    };
    $("#reset-search").onclick = () => {
      Object.assign(filter, { q: "", collection: "", dimension: "", page: 0 });
      libraryPage();
    };
    libraryResults();
  } catch {
    if (route !== requested) return;
    view.innerHTML =
      header(
        "BIBLIOTECA",
        "La biblioteca no se ha podido cargar.",
        "Puedes seguir utilizando tus planes. Comprueba la conexión y vuelve a intentar.",
      ) + '<button id="retry-library" class="btn">Volver a cargar</button>';
    $("#retry-library").onclick = libraryPage;
  }
}
function libraryResults() {
  if (!library || !$("#library-results")) return;
  const terms = norm(filter.q).split(/\s+/).filter(Boolean);
  const results = library.items.filter(
    (x) =>
      (!filter.collection || x.collection === filter.collection) &&
      (!filter.dimension || x.dimensions.includes(filter.dimension)) &&
      terms.every((t) => x._search.includes(t)),
  );
  const start = filter.page * 18,
    visible = results.slice(start, start + 18);
  $("#result-count").textContent =
    `${results.length.toLocaleString("es-ES")} resultados`;
  $("#library-results").innerHTML = visible.length
    ? visible
        .map(
          (x) =>
            `<article class="card library-card"><div class="row between"><span class="tag">${esc(x.collection)}</span>${x.level === "profesional" ? '<span class="tag orange">Uso profesional</span>' : ""}</div><h3>${esc(x.title)}</h3><p>${esc(short(x.summary, 160))}</p>${link("ficha/" + x.id, "Abrir ficha", "text-link")}</article>`,
        )
        .join("")
    : empty(
        "No hay resultados con esos filtros",
        "Prueba una palabra más breve o quita algún filtro.",
      );
  $("#library-pages").innerHTML =
    `<button class="btn secondary" id="prev-results" ${filter.page === 0 ? "disabled" : ""}>Anterior</button><span class="small muted">${results.length ? start + 1 : 0}–${Math.min(start + 18, results.length)} de ${results.length}</span><button class="btn secondary" id="next-results" ${start + 18 >= results.length ? "disabled" : ""}>Siguiente</button>`;
  $("#prev-results").onclick = () => {
    filter.page--;
    libraryResults();
    $(".library-toolbar").scrollIntoView({ block: "start" });
  };
  $("#next-results").onclick = () => {
    filter.page++;
    libraryResults();
    $(".library-toolbar").scrollIntoView({ block: "start" });
  };
}
function safeURL(url) {
  try {
    const u = new URL(url);
    return /^https?:$/.test(u.protocol) ? esc(u.href) : "";
  } catch {
    return "";
  }
}
async function detailPage(id) {
  const requested = route;
  view.innerHTML = '<p class="loading">Abriendo la ficha…</p>';
  try {
    const data = await getLibrary();
    if (route !== requested) return;
    const x = data.items.find((x) => x.id === id);
    if (!x) {
      notFound();
      return;
    }
    view.innerHTML = `<div class="reading">${header(esc(x.collection), esc(x.title), esc(x.summary), `<div class="row section">${link("biblioteca", "Volver a la biblioteca", "text-link", "back")}<button class="btn secondary small" id="read-detail">${icon("volume", 17)} Escuchar resumen</button></div>`)}${librarySafetyNotice(x.id)}<div class="note">${esc(x.usage || "Consulta informativa. Respeta las condiciones y límites de cada recurso.")}${x.level === "profesional" ? "<br><strong>Su aplicación requiere competencia o supervisión profesional. Esta ficha no habilita para aplicarlo.</strong>" : ""}</div>${x.body.map((b, i) => `<details ${i < 2 ? "open" : ""}><summary>${esc(b.label)}</summary><div class="detail-text">${esc(b.text)}</div></details>`).join("")}<section class="section card soft"><h3>De comprender a preparar</h3><p class="small muted">Elige una herramienta de organización cotidiana; esta ficha no se convierte automáticamente en una intervención.</p>${isSensitiveResource(x.id) ? link("ayuda", "Encontrar apoyo", "btn secondary") : link("herramientas", "Ver instrumentos prácticos", "btn secondary")}</section><details class="section"><summary>Fuentes y procedencia</summary><p class="small muted">${esc(x.source?.path || "Corpus MEPRE")} · ${esc(x.source?.id || x.id)}</p><ul class="source-list">${x.links
      .filter((l) => safeURL(l.url))
      .map(
        (l) =>
          `<li><a href="${safeURL(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.title || l.url)} ↗</a></li>`,
      )
      .join(
        "",
      )}</ul><p class="small muted">Los enlaces abren páginas externas. Sus condiciones de acceso y privacidad son propias.</p></details></div>`;
    $("#read-detail").onclick = () =>
      readText(x.title, [
        ...(isSensitiveResource(x.id) ? [SAFETY_COPY] : []),
        x.summary,
        x.usage || "",
        ...x.body.slice(0, 2).map((b) => `${b.label}. ${b.text}`),
      ]);
  } catch {
    view.innerHTML =
      header(
        "BIBLIOTECA",
        "No se pudo abrir la ficha.",
        "Comprueba la conexión y vuelve a la biblioteca.",
      ) + link("biblioteca", "Volver a intentar");
  }
}
function achievements() {
  const s = Store.get();
  view.innerHTML =
    header(
      "TU RECORRIDO",
      "Lo pequeño<br>también cuenta.",
      "Reconocer lo que has preparado o explorado puede ayudar a verlo. No hay comparaciones, rachas ni recompensas que te quiten contenido.",
    ) +
    `${
      !s.settings.gamification
        ? '<p class="note">Los marcadores están apagados. Puedes activarlos en Ajustes. Todas las prácticas siguen abiertas.</p>'
        : `<div class="badges">${badges()
            .map(
              ([id, t, d, earned, i]) =>
                `<article class="badge ${earned ? "earned" : ""}">${icon(i, 30)}<strong>${t}</strong><span>${earned ? d : "Cuando tenga sentido para ti."}</span><div style="margin-top:8px">${earned ? "Reconocido" : "A tu ritmo"}</div></article>`,
            )
            .join("")}</div>`
    }<section class="section"><div class="section-head"><h2>Ensayar otra mirada</h2><span class="small muted">Situaciones ficticias · sin puntuación</span></div><div class="grid three">${scenarios.map((s) => `<a class="card clickable" href="#/practica/${s.id}"><span class="tag">${Store.get().settings.gamification && Store.get().practice.includes(s.id) ? "Explorada" : "Situación interactiva"}</span><h3 style="margin-top:16px">${s.title}</h3><p class="small muted">${short(s.scene, 110)}</p><span class="text-link">Probar ${icon("arrow", 16)}</span></a>`).join("")}</div></section><p class="small muted section">Puedes desactivar los logros en <a class="text-link" href="#/ajustes">Tu espacio</a>. El progreso solo refleja tus registros.</p>`;
}
function practicePage(id) {
  const s = scenarios.find((x) => x.id === id);
  if (!s) {
    notFound();
    return;
  }
  view.innerHTML = `<div class="reading">${header("UNA SITUACIÓN PARA PRACTICAR", s.title, s.scene)}<p class="muted small">Elige la opción que quieras explorar. No es una evaluación.</p><div id="practice-options">${s.options.map((x, i) => `<button class="practice-choice" data-answer="${i}">${esc(x)}</button>`).join("")}</div><div id="practice-feedback" role="status"></div>${link("logros", "Todas las situaciones", "text-link", "back")}</div>`;
  $$("[data-answer]").forEach(
    (b) =>
      (b.onclick = () => {
        const chosen = Number(b.dataset.answer);
        if (!Store.get().practice.includes(id)) Store.get().practice.push(id);
        sync();
        $("#practice-feedback").innerHTML =
          `<section class="card ${chosen === s.best ? "soft" : "peach"} section"><p class="mini-heading">${chosen === s.best ? "UNA OPCIÓN QUE PUEDE ABRIR ESPACIO" : "OTRA POSIBILIDAD PARA CONSIDERAR"}</p><p>${esc(s.feedback)}</p><p class="small muted">Base: ${esc(s.source)}</p>${link("tool/" + s.tool, "Prepararlo para mi situación", "btn")}</section>`;
        $$("[data-answer]").forEach((x) =>
          x.setAttribute("aria-pressed", String(x === b)),
        );
      }),
  );
}
function exportBackup() {
  modal(
    "Guardar una copia en un archivo",
    `<p>La copia incluye tus acciones, reflexiones, red y revisiones. Es un archivo sin cifrar: guárdalo donde solo acceda quien tú decidas.</p><p class="small muted">Exportar no comparte ni envía el archivo. El navegador puede conservarlo en Descargas.</p><button class="btn" id="download-backup">Descargar mi copia</button>`,
    (d) => {
      $("#download-backup", d).onclick = () => {
        let checked;
        try {
          checked = Store.validate(Store.get());
        } catch (error) {
          toast("No se pudo exportar una copia restaurable: " + error.message);
          return;
        }
        const blob = new Blob([JSON.stringify(checked)], {
            type: "application/json",
          }),
          url = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = url;
        a.download = `CareLab-mi-espacio-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        d.close();
        toast("Copia descargada. Protégela como cualquier documento personal.");
      };
    },
  );
}
function settingsPage() {
  const s = Store.get();
  view.innerHTML =
    header(
      "TU ESPACIO",
      "Que se adapte a ti.",
      "Elige qué conservar, cómo verlo y qué experiencia prefieres.",
    ) +
    `<div class="grid two"><section class="card"><h2 style="font-size:1.8rem">Tus datos, a tu elección</h2><p class="small muted">${esc(storageCopy())}</p><p class="small">El guardado no está cifrado. Quien use este mismo perfil del navegador puede acceder a él. No hay cuenta, servidor de notas ni sincronización entre dispositivos.</p><button class="btn" id="toggle-save">${Store.isPersistent() ? "Dejar de guardar en este dispositivo" : "Activar guardado en este dispositivo"}</button><div class="hr"></div><div class="row"><button class="btn secondary" id="export-backup">Exportar copia</button><button class="btn secondary" id="import-backup">Restaurar copia</button></div><input type="file" id="backup-file" accept="application/json,.json" hidden><p class="small muted section">Una copia permite trasladar tu espacio a otro navegador. No se restaura automáticamente.</p><button class="text-link" id="erase-data">Borrar mi espacio de CareLab</button></section><section class="card"><h2 style="font-size:1.8rem">Tu experiencia</h2><label class="field">Modo de visualización<select data-theme-choice><option value="light">Claro</option><option value="system">Sistema</option><option value="dark">Oscuro</option></select></label><p class="small muted">Sistema sigue la preferencia del dispositivo. Puedes cambiarlo desde la barra superior en cualquier página. Las preferencias siguen tu elección de guardado. Si el navegador no puede conservar un cambio, te avisaremos.</p><div class="switch-row"><label for="gamification">Logros y avances visibles<small>Opcionales y apagados al empezar. No son una puntuación de salud. Desde esta actualización requieren una elección nueva; tus registros se conservan.</small></label><input id="gamification" type="checkbox" ${s.settings.gamification ? "checked" : ""}></div><div class="switch-row"><label for="motion">Movimiento suave<small>Siempre se respeta también la preferencia de movimiento reducido del dispositivo.</small></label><input id="motion" type="checkbox" ${s.settings.motion ? "checked" : ""}></div><div class="switch-row"><label for="largeText">Texto más grande<small>También puedes usar el zoom de tu navegador.</small></label><input id="largeText" type="checkbox" ${s.settings.largeText ? "checked" : ""}></div><div class="hr"></div><h3>Tu contexto de cuidado</h3><p class="small muted">${{ familia: "En mi entorno", profesional: "Por trabajo", multiple: "En varios ámbitos", acompanar: "Acompaño a otras personas cuidadoras", "sin-elegir": "Sin elegir" }[s.profile]}</p><button class="btn secondary" id="change-profile">Cambiar contexto</button></section><section class="card"><h3>Consultar sin conexión</h3><p class="small muted">Prepara la aplicación, el programa y la biblioteca para este navegador. Los enlaces externos necesitan conexión. La música se descarga aparte; la lectura en voz depende de las voces locales del dispositivo.</p><button class="btn secondary" id="prepare-offline">Preparar acceso sin conexión</button><p class="small muted" id="offline-status" role="status"></p><button class="text-link small" id="prepare-music">Descargar las 2 piezas de música (12 MB)</button><p class="small muted" id="music-status" role="status"></p></section><section class="card"><h3>Privacidad y límites</h3><p class="small muted">CareLab no incluye analítica ni publicidad y no envía tus notas. El alojamiento recibe las solicitudes de páginas y archivos, con datos técnicos como la dirección IP. Las webs externas tienen sus propias condiciones.</p><p class="small muted">No guardes contraseñas, datos bancarios, documentos clínicos ni información identificativa innecesaria. Eliminar aquí no borra archivos exportados, copias compartidas ni datos de versiones anteriores.</p>${link("acerca", "Conocer el proyecto", "text-link")}<p>${link("feedback", "Ayúdanos a mejorar", "text-link")}</p></section></div>`;
  $("#toggle-save").onclick = () => {
    if (Store.isPersistent())
      confirmAction(
        "Dejar de guardar",
        "Se borrará la copia de este navegador. Tu trabajo seguirá disponible al recargar esta pestaña. El navegador podría restaurar una sesión cerrada: usa Borrar mi espacio para retirar la copia.",
        () => {
          if (Store.disable()) {
            applySettings();
            render();
            toast("Guardado desactivado. La sesión sigue abierta.");
          } else toast(Store.takeError());
        },
        "Borrar copia y usar esta pestaña",
      );
    else
      confirmAction(
        "Activar guardado local",
        "Tus respuestas quedarán en este navegador sin cifrar. Evítalo en dispositivos compartidos. Puedes exportar o borrar después.",
        () => {
          if (Store.enable()) {
            applySettings();
            render();
            toast("Guardado activado en este dispositivo.");
          } else toast(Store.takeError());
        },
        "Activar guardado",
      );
  };
  $("#export-backup").onclick = exportBackup;
  $("#import-backup").onclick = () => $("#backup-file").click();
  $("#backup-file").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > Store.MAX_BACKUP_BYTES) {
      toast(
        "La copia supera el límite de 50 MB. No se ha cambiado tu espacio.",
      );
      return;
    }
    try {
      const candidate = Store.validate(JSON.parse(await file.text()));
      confirmAction(
        "Restaurar esta copia",
        `Contiene ${candidate.actions.length} acciones, ${candidate.people.length} apoyos y ${candidate.completed.length} prácticas. Sustituirá el espacio actual y sus borradores de acciones. Guarda esos borradores y exporta antes si quieres conservarlos.`,
        () => {
          try {
            Store.restore(candidate);
          } catch (error) {
            toast(error.message);
            return;
          }
          drafts = Store.get().drafts.tools;
          applySettings();
          render();
          toast(Store.takeError() || "Copia restaurada.");
        },
        "Sustituir y restaurar",
      );
    } catch (err) {
      toast("No se pudo restaurar: " + err.message);
    }
  };
  $("#erase-data").onclick = () =>
    confirmAction(
      "¿Borrar tu espacio?",
      "Se eliminarán las acciones, notas, red, mapas y avances de esta pestaña y de la copia guardada en el dispositivo. Cierra o borra también otras pestañas abiertas de CareLab. Las copias exportadas y las versiones anteriores no se borran.",
      () => {
        stopMedia();
        if (Store.reset()) {
          drafts = Store.get().drafts.tools;
          clearBrainBoxDrafts();
          clearFeedbackDraft();
          applySettings();
          render();
          toast("Espacio borrado. Puedes empezar de nuevo.");
        } else toast(Store.takeError());
      },
      "Borrar mi espacio",
    );
  ["gamification", "motion", "largeText"].forEach(
    (k) =>
      ($("#" + k).onchange = (e) => {
        s.settings[k] = e.target.checked;
        if (k === "gamification") s.settings.gamificationChoice = true;
        sync();
      }),
  );
  $("#change-profile").onclick = chooseProfile;
  $("#prepare-offline").onclick = () => prepareOffline();
  $("#prepare-music").onclick = () => prepareOffline(true);
  applyTheme();
}
async function prepareOffline(music = false) {
  const status = $("#" + (music ? "music-status" : "offline-status"));
  const button = $("#" + (music ? "prepare-music" : "prepare-offline"));
  if (!("serviceWorker" in navigator)) {
    status.textContent =
      "Este navegador no admite el acceso sin conexión de CareLab.";
    return;
  }
  status.textContent = music
    ? "Descargando las dos piezas de música (12 MB)…"
    : "Preparando aplicación, programa y biblioteca…";
  button.disabled = true;
  let channel = null;
  try {
    const reg = await navigator.serviceWorker.register("sw.js");
    const worker = reg.installing || reg.waiting || reg.active;
    if (!worker) throw new Error("No worker");
    await new Promise((resolve, reject) => {
      if (worker.state === "activated") {
        resolve();
        return;
      }
      const finish = () => {
        if (worker.state === "activated" || worker.state === "redundant") {
          clearTimeout(timer);
          worker.removeEventListener("statechange", finish);
          worker.state === "activated"
            ? resolve()
            : reject(new Error("Install failed"));
        }
      };
      const timer = setTimeout(() => {
        worker.removeEventListener("statechange", finish);
        reject(new Error("timeout"));
      }, 90000);
      worker.addEventListener("statechange", finish);
      finish();
    });
    channel = new MessageChannel();
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 90000);
      channel.port1.onmessage = (e) => {
        clearTimeout(timer);
        resolve(e.data);
      };
      reg.active.postMessage(
        { type: music ? "CACHE_MEDIA" : "CACHE_OFFLINE" },
        [channel.port2],
      );
    });
    status.textContent = result.ok
      ? music
        ? "Música descargada. Estas dos piezas ya pueden escucharse sin conexión."
        : "Preparado. Abre esta misma dirección en este navegador para consultar los contenidos descargados. La música tiene su propia descarga."
      : "No se completó la descarga. Comprueba tu conexión y el espacio disponible.";
  } catch {
    status.textContent =
      "No se ha podido confirmar la preparación. Comprueba la conexión y vuelve a intentarlo. Tu espacio personal se conserva.";
  } finally {
    channel?.port1.close();
    button.disabled = false;
  }
}
function aboutPage() {
  view.innerHTML = `<div class="reading">${header("CARELAB · CUIDAR SIN DESAPARECER", "Del cuidado que te desborda<br>a un plan que puedes mover.", "Un espacio práctico para hacer visible, organizar y compartir la carga total del cuidado.")}<section class="card soft"><h2 style="font-size:1.8rem">El camino que proponemos</h2><div class="row"><button class="pill active" data-story="0">1. Ver</button><button class="pill" data-story="1">2. Elegir</button><button class="pill" data-story="2">3. Preparar</button><button class="pill" data-story="3">4. Revisar</button></div><p id="story-text" style="margin-top:20px">De una sensación de carga difusa a un mapa de las partes que la componen, incluyendo lo invisible.</p><p class="small muted">Es el recorrido de la aplicación, no una sustitución de los pasos del Método BrainBox.</p></section><h2>Lo que puedes resolver aquí</h2><ul><li>Hacer visible el trabajo práctico, mental, emocional y de organización.</li><li>Preparar acciones, peticiones, límites, relevos y preguntas para consultas.</li><li>Registrar acuerdos confirmados y revisar lo ocurrido.</li><li>Practicar con 36 unidades y consultar 1.087 fichas sin salir a documentos.</li><li>Conservar tu espacio por elección, exportarlo y usar contenido descargado.</li></ul><h2>Lo que necesita al mundo real</h2><p>La disponibilidad de una persona, un servicio, dinero, atención profesional o un derecho no se crea al registrarlo. CareLab ayuda a preparar, organizar y revisar esos pasos. Los acuerdos se confirman hablando con las partes.</p><h2>De dónde viene</h2><p>CareLab aplica el proyecto MEPRE del cuidado y el Método BrainBox 1.2 a la organización cotidiana. Integra investigación, Cuidopedia, Cuidoteca, CareTools, las tres guías transversales y Cuidosfera. El Método MEPRE 1.0 conserva su carácter preliminar.</p><div class="boundary">${boundary}</div><h2>Calidad y evidencia</h2><p>Esta versión es una prueba de concepto funcional. La revisión clínica externa está pendiente; el modo grupo se ofrece como preparación y demostración, no como una intervención aprobada. Los recorridos guiados son adaptaciones educativas del Método BrainBox 1.2; no son una evaluación clínica ni una IA que interpreta emociones. Las escenas de ejemplo son ficticias y las decisiones personales las toma quien usa la herramienta. La aprobación editorial, la trazabilidad de fuentes y las pruebas de software no demuestran eficacia clínica ni reducción de sobrecarga. La utilidad debe contrastarse con personas cuidadoras y sus contextos.</p><p>Las dimensiones del mapa y los logros son registros personales, no escalas diagnósticas. Las actividades no sustituyen terapia, valoración clínica, asesoramiento legal ni servicios públicos.</p><h2>Audio y accesibilidad</h2><p>Las narraciones editoriales tienen texto completo y se leen en tu dispositivo. Puedes elegir únicamente voces que el navegador identifica como locales; su disponibilidad depende del dispositivo. Nunca se leen notas personales automáticamente.</p><p>Controles por teclado, tamaño de texto, movimiento reducido y contenidos alternativos forman parte del diseño. Las pruebas técnicas no equivalen a una certificación universal de accesibilidad.</p><h2>Imagen y ambiente</h2><p>La ventana de naturaleza es una imagen creada con IA (imagegen de OpenAI) para CareLab, no una fotografía de un lugar identificado. El movimiento y el sonido son opcionales. Las piezas de piano conservan sus créditos y licencia en el reproductor.</p><h2>Cómo se ha elaborado y revisado</h2><p>Osman Salazar es el autor del proyecto y de sus decisiones metodológicas. ChatGPT y Codex (OpenAI) han asistido en la redacción, programación y comprobaciones técnicas. CareLab muestra contenidos fijos: no hay una IA interpretando tus respuestas. Los textos de ayuda y los materiales de consulta no tienen todavía una revisión clínica externa acreditada.</p><p>Cuatro personas aportaron comentarios de uso que motivaron mejoras. Ese retorno no equivale a un ensayo ni demuestra eficacia. Los teléfonos y directorios de esta actualización se cotejaron con fuentes oficiales el 16 de octubre de 2026; los originales del corpus conservan su procedencia.</p><h2>Autoría y condiciones</h2><p>Proyecto de Osman Salazar. Contenidos originales del repositorio: CC BY 4.0. Código: MIT. Tipografías Inter y Fraunces: SIL OFL. Obras, cuestionarios, marcas y materiales externos conservan sus derechos y condiciones. Consultar una ficha profesional no habilita para aplicar su instrumento.</p><p class="small muted">Corte del corpus: 15 de octubre de 2026. Experiencia CareLab 3.0.4, actualizada con la MEPRE del cuidado 2.0 (borrador) y reconstruida a partir del primer feedback de uso. Conservamos la procedencia de cada ficha. Enlaces externos y disponibilidad de recursos deben comprobarse al utilizarlos.</p><div class="row section">${link("hoy", "Volver a mi espacio")}${link("ajustes", "Privacidad y guardado", "btn secondary")}</div></div>`;
  $$("[data-story]").forEach(
    (b) =>
      (b.onclick = () => {
        $$("[data-story]").forEach((x) =>
          x.classList.toggle("active", x === b),
        );
        $("#story-text").textContent = [
          "De una sensación de carga difusa a un mapa de las partes que la componen, incluyendo lo invisible.",
          "De intentar resolver todo a escoger una parte concreta, ajustada a tu capacidad y a los apoyos disponibles.",
          "De una intención a un plan editable: quién, qué, cuándo, qué falta y cuándo conviene parar.",
          "De suponer que ha servido a observar qué ocurrió y decidir si mantener, adaptar o pedir otra ayuda.",
        ][b.dataset.story];
      }),
  );
}
function notFound() {
  view.innerHTML =
    header(
      "VOLVER AL CAMINO",
      "No encontramos esa página.",
      "Tu plan sigue disponible. Puedes volver a tu espacio para continuar.",
    ) + link("hoy", "Volver al inicio");
}
function render() {
  cleanup?.();
  cleanup = null;
  route = location.hash.replace(/^#\/?/, "") || "hoy";
  const [page, id, editId] = route.split("/");
  document.body.classList.toggle("is-arrival", ["hoy", "bienvenida"].includes(page));
  drawNav(
    ["unidad"].includes(page)
      ? "programa"
      : page === "ficha"
        ? "biblioteca"
        : page === "tool"
          ? "herramientas"
          : page,
  );
  document.title = titleFor(page) + " · CareLab";
  view.classList.remove("enter");
  void view.offsetWidth;
  view.classList.add("enter");
  const handlers = {
    feedback: () => {
      view.replaceChildren();
      addCleanup(mountEvaluation(view));
    },
    hoy: () =>
      addCleanup(
        mountNow(view, { Store, notify: toast, summary: getLivingSummary }),
      ),
    bienvenida: () => addCleanup(mountWelcome(view, { Store, notify: toast })),
    explorar: () => mountExplore(view),
    micamino: () => mountPath(view, { Store, summary: getLivingSummary }),
    pausa: () =>
      addCleanup(mountPause(view, { Store, startTrack, stopMedia, readText })),
    vivir: () => livingPage(id),
    volver: () => livingPage(id, true),
    brainbox: () => (id ? brainboxPage(id) : livingPage()),
    profundizar: () => addCleanup(mountMethodUse(view)),
    grupo: () => addCleanup(mountGroup(view)),
    apoyos: () => addCleanup(mountSupportDirectory(view, id)),
    tramites: () => addCleanup(mountProcedures(view)),
    recursos: () => resourcesPage(id),
    mapa: mapPage,
    plan: planPage,
    herramientas: () => toolsPage(id),
    tool: () => toolPage(id, editId),
    programa: () => programmePage(id),
    unidad: () => unitPage(id),
    biblioteca: libraryPage,
    ficha: () => detailPage(id),
    revision: revisionPage,
    red: networkPage,
    logros: achievements,
    practica: () => practicePage(id),
    ayuda: () => { stopMedia(); addCleanup(mountHelp(view, id)); },
    ajustes: settingsPage,
    acerca: aboutPage,
    media: () => {
      view.innerHTML = header(
        "AUDIO Y MULTIMEDIA",
        "Un espacio para escuchar.<br>Y volver a ti.",
        "Escucha a tu ritmo, lee la transcripción o abre un archivo audiovisual de tu dispositivo.",
      );
      const container = document.createElement("div");
      view.append(container);
      cleanup = mountMediaPage(container);
    },
  };
  (Object.hasOwn(handlers, page) ? handlers[page] : notFound)();
  if (
    ![
      "hoy",
      "bienvenida",
      "vivir",
      "volver",
      "brainbox",
      "micamino",
      "explorar",
      "pausa",
    ].includes(page)
  )
    augmentPage(page, id);
  window.scrollTo({ top: 0, behavior: "instant" });
  view.focus({ preventScroll: true });
}
async function loadProgram() {
  try {
    const r = await fetch("data/programa.json");
    if (!r.ok) throw Error();
    program = await r.json();
  } catch {
    program = null;
  }
  render();
}
document.addEventListener("carelab:preference-change", () => {
  applySettings();
  const error = Store.takeError();
  if (error) toast(error);
});
document.addEventListener("click", (e) => {
  const b = e.target.closest(".pause-card [data-track]");
  if (b) startTrack(b.dataset.track);
});
$("#font-toggle").onclick = () => {
  Store.get().settings.largeText = !Store.get().settings.largeText;
  sync();
};
window.addEventListener("hashchange", render);
window.addEventListener("beforeunload", (e) => {
  if (hasFeedbackDraft() || Store.getStorageStatus().hasUnstoredChanges) {
    e.preventDefault();
    e.returnValue = "";
  }
});
$(".skip")?.addEventListener("click", (e) => {
  e.preventDefault();
  view.focus({ preventScroll: true });
  view.scrollIntoView({ block: "start", behavior: "instant" });
});
// Keep the image behind the header without assuming a fixed height at large text sizes.
const headerSize = new ResizeObserver(([entry]) => {
  document.documentElement.style.setProperty("--header-height", `${entry.target.getBoundingClientRect().height}px`);
});
headerSize.observe($(".quiet-header"));
applySettings();
mountPlayer();
installSafetySignpost({ stopMedia });
installFormDrafts();
await loadProgram();
const initialError = Store.takeError();
if (initialError) toast(initialError);

function addCleanup(fn) {
  const previous = cleanup;
  cleanup = () => {
    previous?.();
    fn?.();
  };
}
function livingPage(id, returning = false) {
  view.replaceChildren();
  const options = {
    id,
    Store,
    notify: toast,
    readText,
    onAction(action) {
      const state = Store.get();
      const existing = state.actions.findIndex((item) => item.id === action.id);
      if (existing < 0 && state.actions.length >= Store.LIMITS.actions)
        throw new Error(
          "Tu espacio ha llegado al límite de acciones. Revisa tus planes antes de añadir otro.",
        );
      if (existing >= 0) state.actions[existing] = action;
      else state.actions.push(action);
      sync();
      return action;
    },
    onReview() {
      sync();
    },
  };
  addCleanup(
    (returning ? mountLivingReturn : mountLivingJourney)(view, options),
  );
}
function resourcesPage(need) {
  view.innerHTML = header(
    "CUIDOTECA EN EL MOMENTO OPORTUNO",
    "Algo que te sirva.<br>Sin añadir ruido.",
    "Elige una necesidad. Recibe una propuesta práctica y hasta dos recursos relacionados.",
  );
  const slot = document.createElement("div");
  view.append(slot);
  addCleanup(
    mountRecommendations(slot, {
      need,
      source: need
        ? "la situación que elegiste trabajar; puedes cambiarla"
        : "tu elección",
      compact: Boolean(need),
    }),
  );
}
function contextualResources(need, source) {
  const details = document.createElement("details");
  details.className = "section no-print";
  details.innerHTML =
    "<summary>Un recurso relacionado, si te viene bien</summary><div></div>";
  view.append(details);
  let mounted = false;
  details.addEventListener("toggle", () => {
    if (details.open && !mounted) {
      mounted = true;
      addCleanup(
        mountRecommendations(details.querySelector("div"), {
          need,
          source,
          compact: true,
        }),
      );
    }
  });
}
function augmentPage(page, id) {
  if (["hoy", "programa", "herramientas"].includes(page)) {
    const band = document.createElement("section");
    band.className = "brainbox-band section";
    band.innerHTML =
      '<div><p class="mini-heading">NUESTRO MÉTODO · BRAINBOX 1.2</p><h2>Entender. Hacer. Integrar. Crear.</h2><p class="small muted">Partir de lo que te ocurre, contrastar lo que supones y preparar algo que puedas probar. Después, volver con lo ocurrido.</p></div><a class="btn" href="#/brainbox">Abrir mi BrainBox</a>';
    const anchor =
      page === "hoy"
        ? view.querySelector(".hero")
        : view.querySelector(".page-head");
    anchor?.after(band);
  }
  if (page === "unidad") {
    const cta = view.querySelector(".card.dark");
    cta?.insertAdjacentHTML(
      "beforeend",
      '<p class="small" style="margin-top:16px">Puedes situar esta necesidad y trabajar los cuatro ejes en tu episodio.</p><a class="btn light" href="#/brainbox">Llevarlo a mi BrainBox</a>',
    );
  }
  if (page === "hoy") {
    const section = document.createElement("section");
    section.className = "section card soft";
    section.innerHTML =
      '<div class="row between"><div><p class="mini-heading">AYUDA SIN SATURACIÓN</p><h2 style="font-size:1.6rem">El recurso que encaja con este momento.</h2><p class="small muted">Música, escucha, aprendizaje o una herramienta práctica. Elige qué necesitas; te proponemos poco y te explicamos por qué.</p></div><a class="btn secondary" href="#/recursos">Encontrar un recurso</a></div>';
    view.append(section);
  }
  if (page === "mapa") {
    const slot = document.createElement("section");
    slot.className = "section card";
    view.append(slot);
    addCleanup(mountCareMap(slot, Store.get().dimensions));
  }
  if (page === "tool" && id === "contingencia") {
    view.querySelector(".page-head")?.insertAdjacentHTML("afterend", librarySafetyNotice("p12"));
  }
  if (page === "tool" && Object.hasOwn(tools, id))
    contextualResources(
      dimensionNeed[tools[id].dimension],
      "la herramienta que estás utilizando",
    );
  if (page === "unidad") {
    const unit = program?.units.find((u) => u.id === id);
    contextualResources(
      dimensionNeed[unit?.dimensions?.[0]] || "comprender",
      "el tema de esta práctica",
    );
  }
  if (page === "media") {
    const section = document.createElement("section");
    section.className = "section card soft";
    section.innerHTML =
      '<h2 style="font-size:1.7rem">¿Qué te vendría bien escuchar o conocer?</h2><p class="small muted">Música y recursos elegidos por su relación con lo que necesitas. Sin reproducción automática ni listas interminables.</p><a class="btn secondary" href="#/recursos">Elegir según mi necesidad</a>';
    view.append(section);
    if (videoTutorial?.src) {
      const box = document.createElement("section");
      box.className = "section card";
      box.innerHTML = `<h2 style="font-size:1.8rem">Del peso invisible a un acuerdo</h2><p class="small muted">Un recorrido visual breve. Es un ejemplo de uso de CareLab; los pasos del Método BrainBox tienen su propio recorrido.</p><video class="local-video" controls preload="none" playsinline poster="${esc(videoTutorial.poster || "")}"><source src="${esc(videoTutorial.src)}" type="video/mp4"><track kind="captions" src="${esc(videoTutorial.captions)}" srclang="es" label="Español" default></video><label class="small">Velocidad <select data-video-speed><option value="0.75">0,75×</option><option value="1" selected>1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label><details><summary>Leer la alternativa al vídeo</summary><p class="small">Ver: anticipar, preparar y comprobar también ocupa atención. Elegir: decide qué parte cotidiana quieres cambiar. Preparar: una petición requiere capacidad, consentimiento y aceptación, no solo escribir un nombre. Revisar: comprueba si se hizo, qué ayudó y qué carga añadió, antes de mantener o ajustar.</p><a class="text-link" href="assets/video/recorrido-transcripcion.txt">Transcripción completa</a></details>`;
      view.append(box);
      const video = box.querySelector("video");
      box.querySelector("[data-video-speed]").onchange = (e) =>
        (video.playbackRate = Number(e.target.value));
      video.addEventListener("play", () => stopMedia());
      addCleanup(() => video.pause());
    }
  }
}

let printClosedDetails = [];
window.addEventListener("beforeprint", () => {
  printClosedDetails = [...view.querySelectorAll("details:not([open])")];
  printClosedDetails.forEach((d) => (d.open = true));
});
window.addEventListener("afterprint", () => {
  printClosedDetails.forEach((d) => (d.open = false));
  printClosedDetails = [];
});

function brainboxPage(id) {
  const action = id
    ? Store.get().actions.find((a) => a.id === id && a.fields?.bb_version)
    : null;
  if (id && !action) {
    notFound();
    return;
  }
  view.innerHTML = "";
  const slot = document.createElement("div");
  view.append(slot);
  addCleanup(
    mountBrainBox(slot, {
      action,
      onSave: async (candidate) => {
        const state = Store.get(),
          exists = state.actions.some((a) => a.id === candidate.id);
        if (!exists && state.actions.length >= Store.LIMITS.actions)
          throw new Error(
            "Has llegado a 300 acciones. Exporta una copia y revisa las anteriores.",
          );
        const proposal = {
          ...state,
          actions: exists
            ? state.actions.map((a) => (a.id === candidate.id ? candidate : a))
            : [candidate, ...state.actions],
        };
        const checked = Store.validate(proposal),
          saved = checked.actions.find((a) => a.id === candidate.id);
        state.actions = checked.actions;
        sync();
        history.replaceState(null, "", `#/brainbox/${saved.id}`);
        route = `brainbox/${saved.id}`;
        return saved;
      },
      onReview: reviewModal,
    }),
  );
  const note = document.createElement("div");
  note.className = "small muted section";
  note.innerHTML = saveNotice();
  view.append(note);
  if (action) {
    const button = document.createElement("button");
    button.className = "text-link";
    button.textContent = "Eliminar este episodio";
    button.onclick = () =>
      confirmAction(
        "¿Eliminar este episodio?",
        "Se eliminará el plan. Los retornos ya registrados seguirán en tu historial.",
        () => {
          Store.get().actions = Store.get().actions.filter(
            (a) => a.id !== action.id,
          );
          clearBrainBoxDrafts(action.id);
          sync();
          location.hash = "#/plan";
          toast(Store.getStorageStatus().error || "Episodio eliminado.");
        },
        "Eliminar episodio",
      );
    view.append(button);
  }
}

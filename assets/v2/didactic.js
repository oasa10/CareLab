/* Original CareLab teaching figures. No clinical assessment or automated routing. */
import { icon } from "./icons.js";

let sequence = 0;
const mounts = new WeakMap();

function prepare(container) {
  if (!(container instanceof Element))
    throw new TypeError(
      "CareLab necesita un elemento donde mostrar el esquema.",
    );
  mounts.get(container)?.();
  const controller = new AbortController();
  const cleanup = () => {
    controller.abort();
    if (mounts.get(container) === cleanup) mounts.delete(container);
  };
  mounts.set(container, cleanup);
  return { signal: controller.signal, cleanup, id: `cl-figure-${++sequence}` };
}

const journey = [
  {
    title: "Ver",
    kicker: "Nombrar lo que no se ve",
    icon: "map",
    heading: "No es sólo hacer la compra.",
    description:
      "Detectar lo que falta, preparar el pedido y comprobar la entrega también ocupa atención. Elige una cadena cotidiana; no hace falta registrar toda tu vida.",
    quote: "«Aunque otra persona vaya a comprar, yo sigo recordándolo todo».",
    output: "Una responsabilidad visible, de principio a fin.",
    action: "Hacer visible mi carga",
    href: "#/tool/mapa",
    alt: "Una persona concentra cuatro tareas conectadas: prever, preparar, encargar y comprobar. El esquema hace visible la coordinación que rodea a la compra.",
    source: "AC07 · CC04 · MC07",
  },
  {
    title: "Elegir",
    kicker: "Una necesidad que importa",
    icon: "plan",
    heading: "¿Qué necesitas dejar de sostener?",
    description:
      "La necesidad puede ser recuperar atención, no terminar más encargos. Conserva una sola cadena para conversar y distingue lo que deseas de lo que ya está acordado.",
    quote: "«Quiero poder dejar de estar pendiente de este abastecimiento».",
    output: "Una finalidad concreta y una propuesta por preparar.",
    action: "Preparar un paso",
    href: "#/tool/plan",
    alt: "De varias tareas se elige una cadena: detectar una necesidad, preparar el encargo y confirmar su cierre. Las otras tareas quedan al margen sin desaparecer ni convertirse en obligaciones nuevas.",
    source: "AC02 · AC07 · AC17",
  },
  {
    title: "Preparar",
    kicker: "Proponer no es confirmar",
    icon: "people",
    heading: "Un acuerdo necesita aceptación.",
    description:
      "Pregunta quién puede asumir la cadena completa, con qué información y dentro de qué límites. Una propuesta permanece pendiente hasta que la otra persona acepte y tenga capacidad.",
    quote:
      "«¿Puedes prever, encargar y confirmar esta parte? Si no puedes, buscaremos otra cobertura».",
    output: "Responsable, alcance, aceptación y alternativa por confirmar.",
    action: "Preparar una petición",
    href: "#/tool/reparto",
    alt: "Dos personas se conectan mediante una propuesta que incluye tarea completa, aceptación y alternativa. Una línea discontinua representa el acuerdo todavía por confirmar, no ayuda ya recibida.",
    source: "CC05 · CC06 · CC07 · CC17",
  },
  {
    title: "Revisar",
    kicker: "Lo ocurrido informa la decisión",
    icon: "spark",
    heading: "Que se hiciera no dice todo.",
    description:
      "Prepara la revisión antes del acuerdo. Después distingue si se realizó, si liberó atención y qué coste añadió. Podéis mantener, ajustar o pedir otra respuesta: no hace falta un resultado favorable.",
    quote:
      "«¿Qué dejó de depender de mí? ¿Qué siguió pendiente y para quién?».",
    output:
      "Una decisión basada en lo ocurrido, sin culpa ni resultados inventados.",
    action: "Preparar una revisión",
    href: "#/tool/revision",
    alt: "Tres preguntas separadas —si se hizo, si liberó atención y qué coste añadió— conducen a mantener, ajustar o pedir apoyo. No se muestran respuestas observadas ni una mejora garantizada.",
    source: "AC17 · CC18 · MC17",
  },
];

function journeyFigure(index) {
  const common =
    'viewBox="0 0 640 286" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"';
  const pill = (x, y, w, text, kind = "soft") =>
    `<g class="cl-j-pill ${kind}"><rect x="${x}" y="${y}" width="${w}" height="44" rx="15"/><text x="${x + w / 2}" y="${y + 27}" text-anchor="middle">${text}</text></g>`;
  const path = (d) => `<path class="cl-j-path" d="${d}"/>`;
  if (index === 0)
    return `<svg ${common}>
    <circle class="cl-j-halo" cx="320" cy="143" r="99"/><circle class="cl-j-orbit" cx="320" cy="143" r="120"/>
    ${path("M320 112 178 58M352 127 494 67M352 158 498 219M291 164 162 223")}
    ${pill(40, 28, 180, "Detectar lo que falta")}${pill(418, 38, 190, "Preparar el pedido")}
    ${pill(41, 205, 170, "Encargar la compra")}${pill(416, 201, 186, "Confirmar la entrega")}
    <circle class="cl-j-core" cx="320" cy="143" r="46"/><text class="cl-j-core-label" x="320" y="149" text-anchor="middle">Yo</text>
    <circle class="cl-j-dot" cx="228" cy="92" r="5"/><circle class="cl-j-dot" cx="414" cy="184" r="5"/>
    </svg>`;
  if (index === 1)
    return `<svg ${common}>
    <rect class="cl-j-halo" x="36" y="78" width="568" height="132" rx="38"/>
    ${pill(52, 122, 142, "Detectar", "strong")}${pill(250, 122, 140, "Preparar", "strong")}${pill(446, 122, 142, "Confirmar", "strong")}
    ${path("M200 144h43m-9-7 9 7-9 7M397 144h43m-9-7 9 7-9 7")}
    <text class="cl-j-label" x="320" y="56" text-anchor="middle">UNA CADENA COMPLETA</text>
    <path class="cl-j-bracket" d="M68 228v13h504v-13"/>
    <text class="cl-j-caption" x="320" y="269" text-anchor="middle">Que esta responsabilidad no vuelva siempre a ti.</text>
    </svg>`;
  if (index === 2)
    return `<svg ${common}>
    <circle class="cl-j-halo" cx="128" cy="132" r="66"/><circle class="cl-j-halo" cx="512" cy="132" r="66"/>
    <circle class="cl-j-core" cx="128" cy="113" r="21"/><path class="cl-j-person" d="M88 165c0-39 80-39 80 0"/>
    <circle class="cl-j-core" cx="512" cy="113" r="21"/><path class="cl-j-person" d="M472 165c0-39 80-39 80 0"/>
    <path class="cl-j-pending" d="M194 132h252"/>
    ${pill(239, 111, 162, "Por acordar", "warm")}
    <text class="cl-j-label" x="128" y="221" text-anchor="middle">QUIEN NECESITA APOYO</text>
    <text class="cl-j-label" x="512" y="221" text-anchor="middle">QUIEN PUEDE OFRECERLO</text>
    <text class="cl-j-caption" x="320" y="267" text-anchor="middle">Alcance · capacidad · aceptación · alternativa</text>
    </svg>`;
  return `<svg ${common}>
    ${pill(30, 50, 170, "¿Se realizó?")}${pill(235, 50, 170, "¿Liberó atención?")}${pill(440, 50, 170, "¿Qué coste tuvo?")}
    ${path("M115 101v41h205m0-41v41m205-41v41H320m0 0v40")}
    <rect class="cl-j-core" x="178" y="178" width="284" height="58" rx="20"/>
    <text class="cl-j-core-label" x="320" y="214" text-anchor="middle">Mantener · ajustar · pedir apoyo</text>
    <text class="cl-j-caption" x="320" y="270" text-anchor="middle">Primero se prepara la revisión; después se registra lo ocurrido.</text>
    </svg>`;
}

/** Interactive teaching sequence; no progress, scores or data are saved. */
export function mountJourney(container) {
  const { signal, cleanup, id } = prepare(container);
  container.innerHTML = `<section class="cl-didactic cl-journey" aria-labelledby="${id}-title">
    <div class="cl-didactic-heading"><p class="eyebrow">UN ACUERDO, PASO A PASO</p><h2 id="${id}-title">De una carga difusa<br>a una conversación concreta.</h2><p class="cl-didactic-intro">Explora un ejemplo de reparto. Puedes abrir cualquier momento; no es una secuencia obligatoria.</p></div>
    <div class="cl-journey-buttons" role="group" aria-label="Explorar los cuatro momentos del ejemplo">${journey.map((s, i) => `<button type="button" class="cl-journey-button" data-journey="${i}" aria-pressed="${i === 0}" aria-controls="${id}-detail"><span class="cl-step-number" aria-hidden="true">${i + 1}</span><span>${s.title}<small>${s.kicker}</small></span>${icon(s.icon, 22)}</button>`).join("")}</div>
    <figure class="cl-journey-figure"><div class="cl-journey-drawing"></div><figcaption class="cl-drawing-caption"></figcaption></figure>
    <div class="cl-journey-detail" id="${id}-detail" aria-live="polite" aria-atomic="true"></div>
    <details class="cl-didactic-footnote"><summary>Texto completo del esquema y sus límites</summary><p>Ejemplo original y ficticio sobre una responsabilidad doméstica. No se ha aplicado ni observado ningún resultado. Las figuras ilustran el paso de trabajo invisible a una propuesta de reparto; los acuerdos reales necesitan personas, capacidad y aceptación.</p><ol>${journey.map((s) => `<li><strong>${s.title}.</strong> ${s.alt}</li>`).join("")}</ol><p>Fuentes del proyecto: ${[...new Set(journey.flatMap((s) => s.source.split(" · ")))].join(" · ")}. Ante riesgo o situación médica, psicológica o legal, STOP: no aplicar BrainBox y pedir ayuda competente. Esto no suspende los cuidados ordinarios ni el acceso a atención.</p></details>
  </section>`;
  const select = (index) => {
    const s = journey[index];
    container
      .querySelectorAll("[data-journey]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(Number(b.dataset.journey) === index),
        ),
      );
    container.querySelector(".cl-journey-drawing").innerHTML =
      journeyFigure(index);
    container.querySelector(".cl-drawing-caption").textContent = s.alt;
    container.querySelector(".cl-journey-detail").innerHTML =
      `<div><p class="cl-didactic-kicker">${s.kicker}</p><h3>${s.heading}</h3><p>${s.description}</p><blockquote>${s.quote}</blockquote></div><div class="cl-journey-output"><span class="cl-didactic-kicker">LO QUE PREPARAS</span><p>${s.output}</p><a class="btn" href="${s.href}">${s.action} ${icon("arrow", 18)}</a><small>Ejemplo ficticio · ${s.source}</small></div>`;
  };
  container.querySelectorAll("[data-journey]").forEach((button) => {
    button.addEventListener(
      "click",
      () => select(Number(button.dataset.journey)),
      { signal },
    );
    button.addEventListener(
      "keydown",
      (event) => {
        const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const i = Number(button.dataset.journey);
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? 3
              : (i + (event.key === "ArrowRight" ? 1 : 3)) % 4;
        const target = container.querySelector(`[data-journey="${next}"]`);
        select(next);
        target.focus();
      },
      { signal },
    );
  });
  select(0);
  return cleanup;
}

const careNodes = [
  {
    id: "tiempo",
    label: "Tiempo",
    icon: "time",
    x: 400,
    y: 58,
    lines: ["Tiempo"],
    description:
      "Tareas, esperas, desplazamientos y el tiempo en que sigues disponible. No todo aparece en el calendario.",
    connections: [
      [
        "mente",
        "Una gestión puede terminar y dejarte aún pendiente de recordarla o comprobarla.",
      ],
      [
        "apoyos",
        "Una pausa sólo existe si la cobertura necesaria está realmente aceptada.",
      ],
      [
        "organizacion",
        "Dos demandas a la misma hora piden un acuerdo, no disponibilidad simultánea.",
      ],
    ],
    source: "AC04 · AC07 · CC06",
  },
  {
    id: "cuerpo",
    label: "Cuerpo y energía",
    icon: "leaf",
    x: 626,
    y: 119,
    lines: ["Cuerpo y", "energía"],
    description:
      "Tu cuerpo también necesita atención, alimentación, descanso, accesibilidad y condiciones de trabajo posibles.",
    connections: [
      [
        "tiempo",
        "Atender una necesidad propia requiere que exista una oportunidad para hacerlo.",
      ],
      [
        "apoyos",
        "Acudir a una consulta puede necesitar transporte o un relevo competente.",
      ],
      [
        "organizacion",
        "El espacio, el material y la cobertura condicionan el esfuerzo físico.",
      ],
    ],
    source: "AC03 · AC05 · AC12",
  },
  {
    id: "mente",
    label: "Carga mental",
    icon: "spark",
    x: 696,
    y: 270,
    lines: ["Carga", "mental"],
    description:
      "Anticipar, recordar, preparar, decidir y comprobar también es trabajo, aunque otra persona ejecute la tarea.",
    connections: [
      [
        "organizacion",
        "Repartir una cadena completa puede cambiar quién conserva la coordinación.",
      ],
      [
        "relaciones",
        "Los límites y canales acordados evitan que cada mensaje se convierta en una obligación.",
      ],
      [
        "apoyos",
        "Un encargo sin aceptación sigue siendo una posibilidad, no una responsabilidad transferida.",
      ],
    ],
    source: "AC07 · AC14 · CC07",
  },
  {
    id: "emociones",
    label: "Emociones",
    icon: "heart",
    x: 626,
    y: 421,
    lines: ["Emociones"],
    description:
      "Cómo vives lo que ocurre tiene lugar, sin exigir una emoción correcta ni contar intimidades para merecer apoyo.",
    connections: [
      [
        "relaciones",
        "Una conversación puede ofrecer escucha cuando se acuerda qué necesitas y qué no quieres compartir.",
      ],
      [
        "apoyos",
        "El apoyo psicológico, cuando se necesita, tiene su vía competente fuera de BrainBox.",
      ],
      [
        "tiempo",
        "Un espacio elegido puede ser compañía, silencio o una actividad que no tenga que ser productiva.",
      ],
    ],
    source: "AC06 · AC08 · CC03",
  },
  {
    id: "relaciones",
    label: "Relaciones",
    icon: "people",
    x: 400,
    y: 482,
    lines: ["Relaciones"],
    description:
      "La voz, la intimidad y los límites de quien cuida y de quien recibe apoyo necesitan consideración propia.",
    connections: [
      [
        "apoyos",
        "Ofrecer, aceptar y recibir ayuda son momentos diferentes del acuerdo.",
      ],
      [
        "organizacion",
        "Un reparto útil incluye preferencias y no asigna funciones a personas ausentes.",
      ],
      [
        "emociones",
        "Puedes pedir escucha sin consejos y conservar partes de tu experiencia en privado.",
      ],
    ],
    source: "AC09 · AC10 · MC06",
  },
  {
    id: "dinero",
    label: "Dinero y trabajo",
    icon: "money",
    x: 174,
    y: 421,
    lines: ["Dinero y", "trabajo"],
    description:
      "Pagos, empleo, gestiones y costes asumidos sin cobrar. Una ayuda pendiente no es dinero disponible.",
    connections: [
      [
        "tiempo",
        "El tiempo de cuidado y la pérdida de oportunidades se registran aparte del dinero.",
      ],
      [
        "apoyos",
        "Transporte, precio y condiciones de acceso pueden volver inutilizable un recurso anunciado.",
      ],
      [
        "organizacion",
        "Un ahorro del servicio puede trasladar trabajo o gastos a hogares y trabajadoras.",
      ],
    ],
    source: "AC13 · CC09 · MC07",
  },
  {
    id: "organizacion",
    label: "Organización",
    icon: "plan",
    x: 104,
    y: 270,
    lines: ["Organización"],
    description:
      "Quién acepta cada función, cómo se coordina y qué ocurre si falla una pieza. Las instituciones conservan sus responsabilidades.",
    connections: [
      [
        "mente",
        "Detectar, preparar, ejecutar y cerrar deben quedar claros al repartir.",
      ],
      [
        "tiempo",
        "Los horarios necesitan considerar esperas, trayectos y cuidados simultáneos.",
      ],
      [
        "apoyos",
        "Un plan de continuidad sólo cuenta con alternativas capaces y confirmadas.",
      ],
    ],
    source: "CC07 · CC15 · MC14",
  },
  {
    id: "apoyos",
    label: "Apoyos",
    icon: "shield",
    x: 174,
    y: 119,
    lines: ["Apoyos"],
    description:
      "Personas, recursos y servicios que pueden ofrecer una ayuda concreta, aceptada y utilizable en tu vida real.",
    connections: [
      [
        "relaciones",
        "La cercanía o el parentesco no demuestran disponibilidad ni consentimiento.",
      ],
      [
        "tiempo",
        "El apoyo se revisa por el tiempo realmente liberado, no sólo por haber estado presente.",
      ],
      [
        "dinero",
        "Horario, coste, lengua y transporte forman parte del acceso efectivo.",
      ],
    ],
    source: "AC11 · CC08 · MC09",
  },
];
const careById = Object.fromEntries(careNodes.map((n) => [n.id, n]));
const edgeKey = (a, b) => [a, b].sort().join("--");

/** Systemic concept map. Input values are never scored, classified or interpreted. */
export function mountCareMap(container, dimensions = {}) {
  const { signal, cleanup: baseCleanup, id } = prepare(container);
  const entries = new Set(
    careNodes
      .filter(
        (n) =>
          dimensions &&
          Object.prototype.hasOwnProperty.call(dimensions, n.id) &&
          Number.isInteger(dimensions[n.id]) &&
          dimensions[n.id] >= 0 &&
          dimensions[n.id] <= 3,
      )
      .map((n) => n.id),
  );
  const edges = new Map();
  careNodes.forEach((n) =>
    n.connections.forEach(([target]) =>
      edges.set(edgeKey(n.id, target), [n, careById[target]]),
    ),
  );
  container.innerHTML = `<section class="cl-didactic cl-care-map" aria-labelledby="${id}-title">
    <div class="cl-didactic-heading"><p class="eyebrow">TODO ESTÁ CONECTADO</p><h2 id="${id}-title">Tu cuidado tiene<br>más de una dimensión.</h2><p class="cl-didactic-intro">Toca una dimensión para ver conexiones concretas y elegir una herramienta. No hay una puntuación global ni una ruta obligatoria.</p></div>
    <div class="cl-map-layout"><div class="cl-map-visual"><div class="cl-map-graphic" aria-label="Mapa interactivo de ocho dimensiones del cuidado">
      <svg viewBox="0 0 800 540" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true" focusable="false">
        <ellipse class="cl-map-orbit" cx="400" cy="270" rx="294" ry="211"/>
        ${[...edges].map(([key, [a, b]]) => `<path class="cl-map-edge" data-edge="${key}" d="M${a.x} ${a.y} Q400 270 ${b.x} ${b.y}"/>`).join("")}
        <circle class="cl-map-halo" cx="400" cy="270" r="104"/><circle class="cl-map-center" cx="400" cy="270" r="81"/>
        <text class="cl-map-coretext" x="400" y="258" text-anchor="middle">Vidas que</text><text class="cl-map-coretext" x="400" y="285" text-anchor="middle">cuidar</text><text class="cl-map-coresub" x="400" y="311" text-anchor="middle">también la tuya</text>
      </svg>
      ${careNodes.map((n) => `<button type="button" class="cl-map-node${entries.has(n.id) ? " has-entry" : ""}" style="left:${n.x / 8}%;top:${n.y / 5.4}%" data-map-node="${n.id}" aria-pressed="false" aria-controls="${id}-detail" aria-label="${n.label}${entries.has(n.id) ? ". Dimensión anotada en tu mapa" : ""}">${icon(n.icon, 23)}<span>${n.lines.join("<br>")}</span>${entries.has(n.id) ? '<i class="cl-map-entry-dot" aria-hidden="true"></i>' : ""}</button>`).join("")}
    </div><p class="cl-map-help" id="${id}-help">Las líneas relacionan condiciones que pueden influirse; no predicen efectos ni evalúan tu salud.${entries.size ? " Los puntos señalan dimensiones que has anotado, sin interpretar sus valores." : ""}</p>
    <details class="cl-map-alternative"><summary>Explorar las dimensiones sin el gráfico</summary><div class="cl-map-list" role="group" aria-label="Dimensiones del cuidado">${careNodes.map((n) => `<button type="button" data-map-list="${n.id}" aria-pressed="false" aria-controls="${id}-detail">${icon(n.icon, 18)}<span>${n.label}</span>${entries.has(n.id) ? '<span class="cl-map-entry-label">Anotada</span>' : ""}</button>`).join("")}</div></details></div>
    <div class="cl-map-detail" id="${id}-detail" aria-live="polite" aria-atomic="true"></div></div>
    <p class="cl-didactic-limit">Estas dimensiones conectan persona, relaciones, red, servicios y entorno. Si aparece riesgo o una situación médica, psicológica o legal, no apliques BrainBox: busca ayuda competente. La organización cotidiana y la preparación de consultas conservan su lugar.</p>
  </section>`;
  let selected = "tiempo";
  const select = (nodeId) => {
    const node = careById[nodeId];
    if (!node) return;
    selected = nodeId;
    container
      .querySelectorAll("[data-map-node],[data-map-list]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String((button.dataset.mapNode || button.dataset.mapList) === nodeId),
        ),
      );
    const activeEdges = new Set(
      node.connections.map(([to]) => edgeKey(nodeId, to)),
    );
    container
      .querySelectorAll("[data-edge]")
      .forEach((path) =>
        path.classList.toggle(
          "is-connected",
          activeEdges.has(path.dataset.edge),
        ),
      );
    container.querySelector(".cl-map-detail").innerHTML =
      `<p class="cl-didactic-kicker">UNA DIMENSIÓN, VARIAS CONEXIONES</p><div class="cl-map-detail-title">${icon(node.icon, 28)}<h3>${node.label}</h3></div><p>${node.description}</p><ul class="cl-map-connections">${node.connections.map(([target, description]) => `<li><button type="button" data-map-go="${target}" aria-label="Explorar la conexión con ${careById[target].label}"><strong>${careById[target].label} ${icon("arrow", 15)}</strong><span>${description}</span></button></li>`).join("")}</ul><a class="btn" href="#/herramientas/${node.id}">Ver herramientas para ${node.id === "mente" ? "la carga mental" : node.label.toLocaleLowerCase("es")} ${icon("arrow", 17)}</a><p class="cl-map-provenance">Conexiones editoriales del proyecto · ${node.source}</p>`;
  };
  container.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest(
        "[data-map-node],[data-map-list],[data-map-go]",
      );
      if (!button || !container.contains(button)) return;
      const nodeId =
        button.dataset.mapNode ||
        button.dataset.mapList ||
        button.dataset.mapGo;
      const fromConnection = Boolean(button.dataset.mapGo);
      select(nodeId);
      // The activated connection is replaced. Keep keyboard focus in a stable control.
      if (fromConnection) {
        const mobile = window.matchMedia("(max-width:620px)").matches;
        container
          .querySelector(`[data-map-${mobile ? "list" : "node"}="${nodeId}"]`)
          ?.focus({ preventScroll: true });
      }
    },
    { signal },
  );
  const narrow = window.matchMedia("(max-width:620px)");
  const adapt = () => {
    if (narrow.matches)
      container.querySelector(".cl-map-alternative").open = true;
  };
  narrow.addEventListener("change", adapt);
  adapt();
  select(selected);
  const cleanup = () => {
    narrow.removeEventListener("change", adapt);
    if (mounts.get(container) === cleanup) mounts.delete(container);
    baseCleanup();
  };
  mounts.set(container, cleanup);
  return cleanup;
}

// Supplied as a content descriptor; callers choose where to mount the native player.
// No autoplay. Captions and the complete text are available without watching.
export const videoTutorial = {
  title: "Del peso difuso a un acuerdo concreto",
  src: "assets/video/recorrido.mp4",
  poster: "assets/video/recorrido-poster.png",
  captions: "assets/video/recorrido.es.vtt",
  transcript:
    "Ver: nombra una cadena de trabajo, también lo que recuerdas y coordinas. Elegir: conserva una necesidad concreta y qué tendría que cambiar. Preparar: propone una responsabilidad completa; confirma capacidad, aceptación y alternativa. Revisar: distingue qué se hizo, qué ayudó y qué coste añadió, y decide si mantener o ajustar. Este vídeo es mudo y presenta un ejemplo educativo original. No muestra resultados de uso ni garantiza una mejora. Ante riesgo o situación médica, psicológica o legal, no aplicar BrainBox y pedir ayuda competente.",
  duration: 24,
  silent: true,
  sourceRefs: ["AC07", "AC02", "CC07", "CC17", "AC17", "MC17"],
};

// Local, opt-in persistence. No personal state is sent to a server.
import { tools } from "./tools.js";
export const KEY = "carelab:v2:workspace";
export const LIMITS = Object.freeze({
  actions: 300,
  people: 80,
  reviews: 300,
  mapHistory: 100,
  entries: 100,
  text: 4000,
  title: 220,
  shortText: 500,
  fields: 30,
});
export const MAX_BACKUP_BYTES = 50_000_000;
export const REVIEW_RESULTS = Object.freeze([
  "Me ha ayudado",
  "No he notado un cambio",
  "Ha añadido carga",
  "No pude probarlo",
  "Todavía no lo sé",
]);
export const fresh = () => ({
  schema: 2,
  profile: "sin-elegir",
  dimensions: {},
  mapHistory: [],
  actions: [],
  people: [],
  completed: [],
  reflections: {},
  reviews: [],
  practice: [],
  settings: {
    gamification: true,
    motion: true,
    largeText: false,
    theme: "system",
  },
  updatedAt: "",
});
const fail = (message) => {
  throw new Error(message + " No se ha modificado tu espacio.");
};
const record = (value, label, optional = false) => {
  if (value === undefined && optional) return {};
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(`El apartado «${label}» no tiene un formato válido.`);
  return value;
};
const text = (value, max = LIMITS.text, label = "texto") => {
  if (value === undefined) return "";
  if (typeof value !== "string")
    fail(`El campo «${label}» debe contener texto.`);
  if (value.length > max)
    fail(
      `El campo «${label}» supera ${max} caracteres; no se recortará automáticamente.`,
    );
  return value;
};
const list = (value, max, label) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) fail(`El apartado «${label}» debe ser una lista.`);
  if (value.length > max)
    fail(
      `La copia supera el límite de ${max} registros en «${label}»; no se eliminarán registros automáticamente.`,
    );
  return value;
};
const validId = (value, fallback = "") => {
  if (value === undefined || value === "") return fallback;
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(value))
    fail("La copia contiene un identificador no válido.");
  return value;
};
const choice = (value, allowed, fallback, label) => {
  if (value === undefined) return fallback;
  if (!allowed.includes(value))
    fail(`El campo «${label}» contiene una opción no válida.`);
  return value;
};
const unique = (items, label) => {
  if (new Set(items.map((x) => x.id)).size !== items.length)
    fail(`La copia contiene ${label} con identificadores repetidos.`);
  return items;
};
const boolean = (value, fallback, label) => {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") fail(`El campo «${label}» debe ser sí o no.`);
  return value;
};
const dims = [
  "tiempo",
  "cuerpo",
  "mente",
  "emociones",
  "relaciones",
  "dinero",
  "organizacion",
  "apoyos",
];
function dimensions(value) {
  const input = record(value, "dimensiones", true),
    out = {};
  for (const [key, v] of Object.entries(input)) {
    if (!dims.includes(key) || ![0, 1, 2, 3].includes(v))
      fail("La copia contiene una dimensión o respuesta no válida.");
    out[key] = v;
  }
  return out;
}
function textRecord(value, maxEntries, keyPattern, label) {
  const entries = Object.entries(record(value, label, true));
  if (entries.length > maxEntries)
    fail(
      `El apartado «${label}» supera ${maxEntries} campos; no se recortará.`,
    );
  return Object.fromEntries(
    entries.map(([key, v]) => {
      if (
        !keyPattern.test(key) ||
        ["__proto__", "constructor", "prototype"].includes(key)
      )
        fail(`El apartado «${label}» contiene un campo no válido.`);
      return [key, text(v, LIMITS.text, label)];
    }),
  );
}
export function validate(input) {
  record(input, "copia");
  if (input.schema !== 2)
    fail("Esta copia no tiene el formato de CareLab 2.0.");
  const s = fresh();
  s.profile = choice(
    input.profile,
    ["sin-elegir", "familia", "profesional", "multiple", "acompanar"],
    "sin-elegir",
    "contexto",
  );
  s.dimensions = dimensions(input.dimensions);
  s.actions = unique(
    list(input.actions, LIMITS.actions, "acciones").map((value, i) => {
      const x = record(value, "acción");
      if (typeof x.tool !== "string" || !Object.hasOwn(tools, x.tool))
        fail("La copia contiene una herramienta no reconocida.");
      const title = text(x.title, LIMITS.title, "nombre del plan");
      if (!title.trim()) fail("Hay una acción sin nombre.");
      return {
        id: validId(x.id, `import-${i}`),
        title,
        tool: x.tool,
        owner: text(x.owner, LIMITS.shortText, "responsable"),
        due: text(x.due, LIMITS.shortText, "ocasión"),
        status: choice(
          x.status,
          ["propuesto", "aceptado", "realizado", "pausado"],
          "propuesto",
          "estado",
        ),
        fields: textRecord(
          x.fields,
          LIMITS.fields,
          /^[a-zA-Z0-9_]{1,40}$/,
          "campos de la acción",
        ),
        createdAt: text(x.createdAt, 40, "fecha de creación"),
        updatedAt: text(x.updatedAt, 40, "fecha de actualización"),
      };
    }),
    "acciones",
  );
  s.people = unique(
    list(input.people, LIMITS.people, "apoyos").map((value, i) => {
      const x = record(value, "apoyo"),
        name = text(x.name, LIMITS.shortText, "rol o iniciales");
      if (!name.trim()) fail("Hay un apoyo sin nombre o rol.");
      return {
        id: validId(x.id, `person-${i}`),
        name,
        help: text(x.help),
        availability: text(x.availability),
        accepted: boolean(x.accepted, false, "disponibilidad confirmada"),
      };
    }),
    "apoyos",
  );
  s.completed = [
    ...new Set(
      list(input.completed, LIMITS.entries, "prácticas exploradas").map((x) =>
        validId(x),
      ),
    ),
  ];
  s.practice = [
    ...new Set(
      list(input.practice, LIMITS.entries, "situaciones exploradas").map((x) =>
        validId(x),
      ),
    ),
  ];
  s.reflections = textRecord(
    input.reflections,
    LIMITS.entries,
    /^[\w-]{1,80}$/,
    "reflexiones",
  );
  s.reviews = unique(
    list(input.reviews, LIMITS.reviews, "revisiones").map((value, i) => {
      const x = record(value, "revisión");
      return {
        id: validId(x.id, `review-${i}`),
        date: text(x.date, 40, "fecha de revisión"),
        actionId: validId(x.actionId),
        result: choice(
          x.result,
          REVIEW_RESULTS,
          "Todavía no lo sé",
          "resultado de la revisión",
        ),
        note: text(x.note),
        next: text(x.next),
        fields: textRecord(
          x.fields,
          20,
          /^[a-zA-Z0-9_]{1,40}$/,
          "detalle del retorno",
        ),
      };
    }),
    "revisiones",
  );
  s.mapHistory = list(
    input.mapHistory,
    LIMITS.mapHistory,
    "mapas anteriores",
  ).map((value) => {
    const x = record(value, "mapa");
    return {
      date: text(x.date, 40, "fecha del mapa"),
      dimensions: dimensions(x.dimensions),
    };
  });
  const settings = record(input.settings, "preferencias", true);
  s.settings = {
    gamification: boolean(settings.gamification, true, "logros"),
    motion: boolean(settings.motion, true, "movimiento"),
    largeText: boolean(settings.largeText, false, "texto grande"),
    theme: choice(
      settings.theme,
      ["light", "system", "dark"],
      "system",
      "aspecto",
    ),
  };
  s.updatedAt = text(input.updatedAt, 40, "última actualización");
  if (new TextEncoder().encode(JSON.stringify(s)).byteLength > MAX_BACKUP_BYTES)
    fail("La copia supera el tamaño de 50 MB admitido para restauración.");
  return s;
}
let state = fresh(),
  persistent = false,
  error = "";
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    state = validate(JSON.parse(raw));
    persistent = true;
  }
} catch {
  error =
    "No se pudo recuperar el guardado. Se abre una sesión temporal; la copia anterior no se sobrescribirá.";
}
export const get = () => state;
export const isPersistent = () => persistent;
export function takeError() {
  const x = error;
  error = "";
  return x;
}
export function save() {
  state.updatedAt = new Date().toISOString();
  if (persistent) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      persistent = false;
      error =
        "El navegador no ha podido guardar. Tu trabajo sigue en esta pestaña: exporta una copia antes de cerrarla.";
    }
  }
  return state;
}
export function enable() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    persistent = true;
    return true;
  } catch {
    error = "No se pudo activar el guardado. Puedes exportar una copia.";
    return false;
  }
}
export function disable() {
  try {
    localStorage.removeItem(KEY);
    persistent = false;
    return true;
  } catch {
    error =
      "No se pudo borrar el guardado. Revisa los datos de este sitio en tu navegador.";
    return false;
  }
}
export function reset() {
  if (!disable()) return false;
  state = fresh();
  return true;
}
export function restore(candidate) {
  const next = validate(candidate);
  state = next;
  save();
}
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `cl-${Date.now()}-${Math.random().toString(36).slice(2)}`;

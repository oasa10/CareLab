// Recoverable tab sessions by default; device persistence only by explicit opt-in.
// No personal state is transmitted. The legacy device key remains compatible.
import { tools } from "./tools.js";
import { freshJourney, validateJourney } from "../v3/journey-state.js";
export const KEY = "carelab:v2:workspace";
export const SESSION_KEY = "carelab:v3:session";
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
  drafts: 100,
  brainboxFields: 60,
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
  journey: freshJourney(),
  drafts: { tools: {}, brainbox: {}, forms: {} },
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
function validateDrafts(value) {
  const source = record(value, "borradores", true);
  if (
    Object.keys(source).some(
      (key) => !["tools", "brainbox", "forms"].includes(key),
    )
  )
    fail(
      "Los borradores contienen un apartado desconocido; no se eliminará silenciosamente.",
    );
  const toolEntries = Object.entries(
    record(source.tools, "borradores de herramientas", true),
  );
  const brainboxEntries = Object.entries(
    record(source.brainbox, "borradores BrainBox", true),
  );
  if (
    toolEntries.length > LIMITS.drafts ||
    brainboxEntries.length > LIMITS.drafts
  )
    fail(
      "Hay más de 100 borradores en una colección; no se eliminarán registros automáticamente.",
    );
  const formEntries = Object.entries(
    record(source.forms, "borradores de formularios", true),
  );
  if (formEntries.length > LIMITS.drafts)
    fail(
      "Hay más de 100 borradores de formularios; no se eliminarán registros automáticamente.",
    );
  const statusOptions = ["propuesto", "aceptado", "realizado", "pausado"];
  return {
    forms: Object.fromEntries(
      formEntries.map(([key, value]) => {
        const [kind, context, extra] = key.split("/");
        if (
          !["person", "review"].includes(kind) ||
          !context ||
          !/^[a-zA-Z0-9_-]{1,80}$/.test(context) ||
          extra !== undefined ||
          ["__proto__", "constructor", "prototype"].includes(context)
        )
          fail("El borrador del formulario tiene un contexto no válido.");
        const fields = textRecord(
          value,
          LIMITS.fields,
          /^[a-zA-Z0-9_]{1,40}$/,
          "respuestas del formulario",
        );
        const allowed =
          kind === "person"
            ? ["name", "help", "availability", "accepted"]
            : [
                "done",
                "note",
                "worth",
                "attribution",
                "result",
                "origin",
                "verification",
                "integration",
                "metabrainbox",
                "decision",
                "next",
              ];
        if (Object.keys(fields).some((field) => !allowed.includes(field)))
          fail(
            "El borrador del formulario contiene campos desconocidos; no se recortará.",
          );
        if (kind === "person") {
          if (fields.name !== undefined)
            text(fields.name, LIMITS.shortText, "rol o iniciales");
          if (
            fields.accepted !== undefined &&
            !["true", "false"].includes(fields.accepted)
          )
            fail("La disponibilidad del borrador debe indicar sí o no.");
        }
        return [key, fields];
      }),
    ),
    tools: Object.fromEntries(
      toolEntries.map(([key, value]) => {
        const [tool, editId, extra] = key.split("/");
        if (
          !Object.hasOwn(tools, tool) ||
          editId === undefined ||
          extra !== undefined ||
          (editId && !/^[a-zA-Z0-9_-]{1,80}$/.test(editId))
        )
          fail(
            "El borrador contiene una herramienta o identificador no válido.",
          );
        const x = record(value, "borrador de herramienta");
        if (
          Object.keys(x).some(
            (k) => !["title", "owner", "due", "status", "fields"].includes(k),
          )
        )
          fail(
            "Un borrador de herramienta contiene campos desconocidos; no se recortará.",
          );
        return [
          key,
          {
            title: text(x.title, LIMITS.title, "título del borrador"),
            owner: text(x.owner, LIMITS.shortText, "responsable del borrador"),
            due: text(x.due, LIMITS.shortText, "ocasión del borrador"),
            status: choice(
              x.status,
              statusOptions,
              "propuesto",
              "estado del borrador",
            ),
            fields: textRecord(
              x.fields,
              LIMITS.fields,
              /^[a-zA-Z0-9_]{1,40}$/,
              "campos del borrador",
            ),
          },
        ];
      }),
    ),
    brainbox: Object.fromEntries(
      brainboxEntries.map(([key, value]) => {
        if (
          !/^[a-zA-Z0-9_-]{1,80}$/.test(key) ||
          ["__proto__", "constructor", "prototype"].includes(key)
        )
          fail("El borrador BrainBox contiene un identificador no válido.");
        const x = record(value, "borrador BrainBox");
        if (
          Object.keys(x).some((k) => !["draft", "stage", "entered"].includes(k))
        )
          fail(
            "Un borrador BrainBox contiene campos desconocidos; no se recortará.",
          );
        const draft = textRecord(
          x.draft,
          LIMITS.brainboxFields,
          /^[a-zA-Z0-9_]{1,40}$/,
          "respuestas del borrador BrainBox",
        );
        if (draft.title !== undefined)
          text(draft.title, LIMITS.title, "título del borrador");
        if (draft.owner !== undefined)
          text(draft.owner, LIMITS.shortText, "responsable del borrador");
        if (draft.due !== undefined)
          text(draft.due, LIMITS.shortText, "ocasión del borrador");
        if (draft.status !== undefined)
          choice(
            draft.status,
            statusOptions,
            "propuesto",
            "estado del borrador",
          );
        const stage = x.stage ?? 0;
        if (!Number.isInteger(stage) || stage < 0 || stage > 6)
          fail("El borrador BrainBox contiene un paso no válido.");
        return [
          key,
          {
            draft,
            stage,
            entered: boolean(x.entered, false, "ámbito del borrador"),
          },
        ];
      }),
    ),
  };
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
  s.journey = validateJourney(
    input.journey,
    new Set(s.actions.map((x) => x.id)),
  );
  s.drafts = validateDrafts(input.drafts);
  if (new TextEncoder().encode(JSON.stringify(s)).byteLength > MAX_BACKUP_BYTES)
    fail("La copia supera el tamaño de 50 MB admitido para restauración.");
  return s;
}
let state = fresh();
let persistent = false;
let error = "";
let sessionBlocked = false;
let knownDeviceRaw = null;
let status = {
  mode: "memory",
  recoverable: false,
  deviceSaved: false,
  hasUnstoredChanges: false,
  error: "",
};
const storage = (name) => {
  const value = globalThis[name];
  if (!value) throw new Error("Storage unavailable");
  return value;
};
const read = (name, key) => storage(name).getItem(key);
const write = (name, key, value) => storage(name).setItem(key, value);
const remove = (name, key) => storage(name).removeItem(key);
const envelope = (workspace, mode) =>
  JSON.stringify({ version: 1, mode, workspace });
function result({
  session = false,
  device = false,
  message = "",
  dirty = true,
} = {}) {
  status = {
    mode: device ? "device" : session ? "session" : "memory",
    recoverable: session || device,
    deviceSaved: device,
    hasUnstoredChanges: dirty && !session && !device,
    error: message,
  };
  error = message;
}
function parseSession(raw) {
  const value = JSON.parse(raw);
  if (
    !value ||
    value.version !== 1 ||
    !["session", "device"].includes(value.mode)
  )
    throw new Error("Invalid session");
  return { mode: value.mode, workspace: validate(value.workspace) };
}
function trySession(workspace, mode, replaceInvalid = false) {
  if (sessionBlocked && !replaceInvalid) return false;
  try {
    write("sessionStorage", SESSION_KEY, envelope(workspace, mode));
    if (replaceInvalid) sessionBlocked = false;
    return true;
  } catch {
    return false;
  }
}
function recover() {
  let savedSession = null,
    savedDevice = null,
    sessionProblem = "",
    deviceProblem = "";
  try {
    const raw = read("sessionStorage", SESSION_KEY);
    if (raw) {
      try {
        savedSession = parseSession(raw);
      } catch {
        sessionBlocked = true;
        sessionProblem =
          "No se pudo leer la sesión anterior. Se conserva sin sobrescribir; puedes restaurar una copia o borrar el espacio.";
      }
    }
  } catch {
    sessionProblem =
      "El navegador no permite recuperar esta pestaña. Activa el guardado o exporta antes de cerrar o recargar.";
  }
  try {
    knownDeviceRaw = read("localStorage", KEY);
    if (knownDeviceRaw) {
      try {
        savedDevice = validate(JSON.parse(knownDeviceRaw));
      } catch {
        deviceProblem =
          "No se pudo leer la copia del dispositivo. Se conserva sin sobrescribir; puedes restaurar una copia o borrar el espacio.";
      }
    }
  } catch {
    deviceProblem =
      "El navegador no permite acceder al guardado del dispositivo.";
  }
  // A tab explicitly using session mode never silently adopts another tab's device copy.
  if (savedSession?.mode === "session") {
    state = savedSession.workspace;
    result({ session: true, dirty: false, message: sessionProblem });
  } else if (savedDevice) {
    state = savedDevice;
    persistent = true;
    const mirrored = trySession(state, "device");
    result({
      session: mirrored,
      device: true,
      dirty: false,
      message: sessionProblem,
    });
  } else if (savedSession) {
    state = savedSession.workspace;
    trySession(state, "session");
    result({ session: true, dirty: false, message: deviceProblem });
  } else {
    result({
      dirty: false,
      message: [sessionProblem, deviceProblem].filter(Boolean).join(" "),
    });
  }
}
recover();
export const get = () => state;
export const isPersistent = () => persistent;
export const getStorageStatus = () => ({ ...status });
export function takeError() {
  const value = error;
  error = "";
  return value;
}
// Use this for JSON download. It always includes the journey and never truncates data.
export const exportSnapshot = () => validate(state);
function snapshot() {
  const checked = validate({ ...state, updatedAt: new Date().toISOString() });
  state.updatedAt = checked.updatedAt;
  // Keep references held by active forms intact while severing deleted-plan links.
  const sessions = new Map(checked.journey.sessions.map((x) => [x.id, x]));
  for (const session of state.journey.sessions)
    session.actionId = sessions.get(session.id).actionId;
  return checked;
}
export function save() {
  let checked;
  try {
    checked = snapshot();
  } catch (failure) {
    result({ message: "No se pudo guardar: " + failure.message });
    return state;
  }
  const serialized = JSON.stringify(checked);
  let device = false,
    problem = "";
  if (persistent) {
    try {
      if (read("localStorage", KEY) !== knownDeviceRaw)
        throw new Error("changed");
      write("localStorage", KEY, serialized);
      knownDeviceRaw = serialized;
      device = true;
    } catch (failure) {
      persistent = false;
      problem =
        failure.message === "changed"
          ? "La copia del dispositivo cambió en otra pestaña. No se ha sobrescrito. Tu trabajo continúa separado en esta sesión; exporta o decide qué copia conservar."
          : "No se pudo actualizar la copia del dispositivo; la anterior se conserva. El guardado permanente ha quedado desactivado para esta pestaña.";
    }
  }
  const session = trySession(checked, device ? "device" : "session");
  if (!session && !device)
    problem +=
      (problem ? " " : "") +
      "No se pudo recuperar este cambio tras una recarga. Tu texto sigue en pantalla: exporta una copia antes de cerrar o recargar.";
  else if (!session && device)
    problem +=
      (problem ? " " : "") +
      "La copia del dispositivo está guardada, pero no se pudo actualizar la sesión de esta pestaña.";
  else if (problem)
    problem += " Los cambios sí están recuperables al recargar esta pestaña.";
  result({ session, device, message: problem });
  return state;
}
export function enable() {
  try {
    const checked = snapshot(),
      raw = JSON.stringify(checked);
    write("localStorage", KEY, raw);
    knownDeviceRaw = raw;
    persistent = true;
    const session = trySession(checked, "device");
    result({
      session,
      device: true,
      message: session
        ? ""
        : "La copia del dispositivo está guardada; no se pudo actualizar la sesión de esta pestaña.",
    });
    return true;
  } catch (failure) {
    error =
      "No se pudo activar el guardado del dispositivo. Tu estado actual no se ha eliminado; exporta una copia. " +
      (failure.message || "");
    status = { ...status, error };
    return false;
  }
}
export function disable() {
  let previousSession;
  try {
    const checked = validate(state);
    previousSession = read("sessionStorage", SESSION_KEY);
    // Make a recoverable tab copy before removing the device copy.
    write("sessionStorage", SESSION_KEY, envelope(checked, "session"));
    try {
      remove("localStorage", KEY);
    } catch (failure) {
      if (previousSession === null) remove("sessionStorage", SESSION_KEY);
      else write("sessionStorage", SESSION_KEY, previousSession);
      throw failure;
    }
    sessionBlocked = false;
    persistent = false;
    knownDeviceRaw = null;
    result({ session: true });
    return true;
  } catch {
    error =
      "No se pudo dejar una sesión recuperable y borrar la copia del dispositivo. No se ha eliminado tu trabajo; revisa el almacenamiento del navegador.";
    status = { ...status, error };
    return false;
  }
}
export function reset() {
  let oldDevice, oldSession;
  try {
    oldDevice = read("localStorage", KEY);
    oldSession = read("sessionStorage", SESSION_KEY);
    remove("localStorage", KEY);
    try {
      remove("sessionStorage", SESSION_KEY);
    } catch (failure) {
      if (oldDevice !== null) write("localStorage", KEY, oldDevice);
      throw failure;
    }
    state = fresh();
    persistent = false;
    knownDeviceRaw = null;
    sessionBlocked = false;
    result({ dirty: false });
    return true;
  } catch {
    error =
      "No se pudo confirmar el borrado completo. Tu trabajo sigue en esta pestaña; revisa los datos de este sitio en el navegador.";
    status = { ...status, error };
    return false;
  }
}
export function restore(candidate) {
  const next = validate(candidate);
  next.updatedAt = new Date().toISOString();
  const raw = JSON.stringify(next);
  // Commit to the currently selected authoritative store before replacing memory.
  // A failed write leaves both the current workspace and its stored copy intact.
  try {
    if (persistent) {
      if (read("localStorage", KEY) !== knownDeviceRaw)
        throw new Error("changed");
      write("localStorage", KEY, raw);
    } else write("sessionStorage", SESSION_KEY, envelope(next, "session"));
  } catch {
    const message =
      "No se pudo guardar la copia restaurada. El espacio actual y su copia anterior se conservan.";
    error = message;
    status = { ...status, error: message };
    throw new Error(message);
  }
  state = next;
  if (persistent) {
    knownDeviceRaw = raw;
    const session = trySession(next, "device", true);
    result({
      session,
      device: true,
      message: session
        ? ""
        : "Copia restaurada en el dispositivo; no se pudo actualizar la sesión de esta pestaña.",
    });
  } else {
    sessionBlocked = false;
    result({ session: true });
  }
  return state;
}
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `cl-${Date.now()}-${Math.random().toString(36).slice(2)}`;

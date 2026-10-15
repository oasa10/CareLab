// Validated editorial workflow state. No clinical history or automatic inference.
export const JOURNEY_LIMITS = Object.freeze({
  sessions: 100,
  fields: 60,
  text: 4000,
  title: 220,
  timestamp: 40,
});
export const SCENARIOS = Object.freeze(["relevo", "mente", "pausa", "limites"]);
export const SESSION_STATES = Object.freeze([
  "draft",
  "planned",
  "paused",
  "reviewed",
]);
export const freshJourney = () => ({
  version: 1,
  onboarded: false,
  currentId: "",
  sessions: [],
});
const fail = (message) => {
  throw new Error(message + " No se ha modificado tu espacio.");
};
const object = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(`El apartado «${label}» no tiene un formato válido.`);
  return value;
};
const keys = (value, allowed, label) => {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    fail(
      `El apartado «${label}» contiene campos desconocidos; no se eliminarán silenciosamente.`,
    );
};
const text = (value, max, label) => {
  if (value === undefined) return "";
  if (typeof value !== "string")
    fail(`El campo «${label}» debe contener texto.`);
  if (value.length > max)
    fail(
      `El campo «${label}» supera ${max} caracteres; no se recortará automáticamente.`,
    );
  return value;
};
const id = (value, required = false) => {
  if ((value === undefined || value === "") && !required) return "";
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(value))
    fail("El recorrido contiene un identificador no válido.");
  return value;
};
const integer = (value, max, label) => {
  if (value === undefined) return 0;
  if (!Number.isInteger(value) || value < 0 || value > max)
    fail(`El paso «${label}» está fuera del recorrido.`);
  return value;
};
const choice = (value, options, fallback, label) => {
  if (value === undefined) return fallback;
  if (!options.includes(value))
    fail(`El campo «${label}» contiene una opción no válida.`);
  return value;
};
function fields(value) {
  if (value === undefined) return {};
  object(value, "respuestas del recorrido");
  const entries = Object.entries(value);
  if (entries.length > JOURNEY_LIMITS.fields)
    fail(
      `El recorrido supera ${JOURNEY_LIMITS.fields} campos; no se recortará.`,
    );
  return Object.fromEntries(
    entries.map(([key, value]) => {
      if (
        !/^[a-zA-Z0-9_]{1,40}$/.test(key) ||
        ["__proto__", "constructor", "prototype"].includes(key)
      )
        fail("El recorrido contiene un campo no válido.");
      return [key, text(value, JOURNEY_LIMITS.text, key)];
    }),
  );
}
export function validateJourney(value, actionIds = new Set()) {
  if (value === undefined) return freshJourney(); // Original schema-2 backups migrate losslessly.
  object(value, "recorrido");
  keys(value, ["version", "onboarded", "currentId", "sessions"], "recorrido");
  if (value.version !== 1) fail("Esta versión del recorrido no es compatible.");
  if (value.onboarded !== undefined && typeof value.onboarded !== "boolean")
    fail("La presentación del recorrido debe ser sí o no.");
  const input = value.sessions === undefined ? [] : value.sessions;
  if (!Array.isArray(input))
    fail("Las sesiones del recorrido deben ser una lista.");
  if (input.length > JOURNEY_LIMITS.sessions)
    fail(
      `El recorrido supera ${JOURNEY_LIMITS.sessions} sesiones; no se eliminarán registros automáticamente.`,
    );
  const sessions = input.map((value) => {
    const x = object(value, "sesión del recorrido");
    keys(
      x,
      [
        "id",
        "title",
        "scenario",
        "step",
        "returnStep",
        "status",
        "actionId",
        "fields",
        "createdAt",
        "updatedAt",
        "completedAt",
      ],
      "sesión del recorrido",
    );
    const actionId = id(x.actionId);
    return {
      id: id(x.id, true),
      title: text(x.title, JOURNEY_LIMITS.title, "título del recorrido"),
      scenario: choice(x.scenario, SCENARIOS, "relevo", "situación"),
      step: integer(x.step, 12, "preparación"),
      returnStep: integer(x.returnStep, 6, "retorno"),
      status: choice(x.status, SESSION_STATES, "draft", "estado del recorrido"),
      // Removing a plan never removes the person's reflections or recreates that plan.
      actionId: actionIds.has(actionId) ? actionId : "",
      fields: fields(x.fields),
      createdAt: text(
        x.createdAt,
        JOURNEY_LIMITS.timestamp,
        "fecha de creación",
      ),
      updatedAt: text(
        x.updatedAt,
        JOURNEY_LIMITS.timestamp,
        "fecha de actualización",
      ),
      completedAt: text(
        x.completedAt,
        JOURNEY_LIMITS.timestamp,
        "fecha de finalización",
      ),
    };
  });
  const ids = new Set(sessions.map((x) => x.id));
  if (ids.size !== sessions.length)
    fail("El recorrido contiene sesiones con identificadores repetidos.");
  const currentId = id(value.currentId);
  if (currentId && !ids.has(currentId))
    fail("La sesión actual del recorrido no existe en la copia.");
  return {
    version: 1,
    onboarded: value.onboarded ?? false,
    currentId,
    sessions,
  };
}

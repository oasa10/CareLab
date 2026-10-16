import { SHARED_SUPPORT_NOTICE } from "./support.js";

// Presentation overlay: stable source IDs and original evidence remain intact.
// Eleven current entries cover the eight sensitive topics in the original glossary.
export const SENSITIVE_RESOURCE_IDS = Object.freeze([
  "cp-a001", "cp-a030", "cp-a012", "cp-a014", "cp-a022", "cp-a023", "cp-a024",
  "cp-a150", "cp-b070", "cp-b071", "cp-a151",
  "gu-ac01", "gu-ac03", "gu-ac06", "gu-cc01", "gu-cc14", "gu-mc14", "p12",
]);
const ids = new Set(SENSITIVE_RESOURCE_IDS);
export const SAFETY_COPY = SHARED_SUPPORT_NOTICE;
export const isSensitiveResource = (id) => ids.has(id);
export const hasSensitiveSources = (sourceRefs = []) => sourceRefs.some(id => ids.has("gu-" + id.toLowerCase()));
export function librarySafetyNotice(id) {
  if (!ids.has(id)) return "";
  return `<aside class="library-safety" aria-label="Límites y ayuda"><p>${SHARED_SUPPORT_NOTICE}</p><a class="text-link" href="#/ayuda">Encontrar apoyo</a></aside>`;
}

import { startTrack } from "./media.js";
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const needs = {
  pausa: [
    "Un momento de pausa",
    "descanso",
    "Preparar una pausa con cobertura",
  ],
  descanso: [
    "Hacer sitio al descanso",
    "descanso",
    "Reservar un descanso posible",
  ],
  soledad: [
    "Sentirme acompañada",
    "reparto",
    "Preparar una petición de compañía",
  ],
  limites: ["Expresar un límite", "limites", "Preparar una conversación"],
  reparto: ["Compartir la carga", "reparto", "Pedir una ayuda concreta"],
  tramites: ["Aclarar una gestión", "economia", "Ordenar mi próxima consulta"],
  comprender: ["Entender lo que ocurre", "mapa", "Hacer visible la carga"],
  multiple: ["Cuidar en varios ámbitos", "contingencia", "Preparar un relevo"],
};
export const dimensionNeed = {
  tiempo: "reparto",
  cuerpo: "descanso",
  mente: "comprender",
  emociones: "pausa",
  relaciones: "limites",
  dinero: "tramites",
  organizacion: "multiple",
  apoyos: "reparto",
};
let pending;
export async function loadResources() {
  if (!pending)
    pending = fetch(
      new URL("../../data/recursos-multimedia.json", import.meta.url),
    )
      .then((r) => {
        if (!r.ok) throw Error("No disponible");
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data.resources)) throw Error("Catálogo no válido");
        return data;
      })
      .catch((e) => {
        pending = null;
        throw e;
      });
  return pending;
}
function durationLabel(minutes) {
  const seconds = Math.round(minutes * 60);
  return `${Math.floor(seconds / 60)} min${seconds % 60 ? " " + (seconds % 60) + " s" : ""}`;
}
function safeURL(value) {
  try {
    const u = new URL(value);
    return /^https?:$/.test(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}
// Editorial, deterministic matching. It does not inspect free text or infer health conditions.
export function selectResources(
  resources,
  {
    need,
    format = "all",
    minutes = 0,
    offset = 0,
    preferences = [],
    context = null,
  } = {},
) {
  if (!Object.hasOwn(needs, need)) return [];
  const matches = resources.filter(
    (r) =>
      r.recommendationEnabled !== false &&
      r.needs?.includes(need) &&
      safeURL(r.url) &&
      (!r.optInOnly || preferences.includes(r.preference)) &&
      (!r.requiresContext ||
        r.requiresContext === context ||
        (context === "alzheimer-familiar" &&
          r.requiresContext === "demencia")) &&
      (format === "all" ||
        (format === "listen"
          ? ["audio", "musica"].includes(r.format)
          : format === "read"
            ? r.format === "lectura" || r.accessibleText === true
            : r.format === "video")) &&
      (!minutes ||
        (Number.isFinite(r.durationMinutes) &&
          r.durationMinutes > 0 &&
          r.durationMinutes <= minutes)),
  );
  const sorted = [...matches].sort(
    (a, b) =>
      Number(Boolean(b.optInOnly)) - Number(Boolean(a.optInOnly)) ||
      Number(Boolean(b.integratedTrackId)) -
        Number(Boolean(a.integratedTrackId)) ||
      Number(b.language === "es") - Number(a.language === "es") ||
      String(a.id).localeCompare(String(b.id)),
  );
  return sorted.slice(offset, offset + 2);
}
export function mountRecommendations(
  container,
  { need = null, source = "tu elección", compact = false } = {},
) {
  let current = Object.hasOwn(needs, need) ? need : null,
    format = "all",
    minutes = 0,
    offset = 0,
    preferences = [],
    context = null,
    disposed = false,
    catalog = null,
    loading = false;
  container.classList.add("recommendations");
  container.innerHTML = `<section class="card soft"><div class="row between"><div><p class="mini-heading">UN RECURSO, CUANDO TE SIRVA</p><h2 style="font-size:1.7rem">¿Qué te vendría bien ahora?</h2></div><button type="button" class="text-link small" data-hide>Ocultar</button></div><p class="small muted">Una propuesta práctica y hasta dos recursos. Tú eliges; nada empieza a reproducirse solo.</p><div class="row need-choices" aria-label="Elegir una necesidad">${Object.entries(
    needs,
  )
    .map(
      ([id, [label]]) =>
        `<button type="button" class="pill" data-need="${id}" aria-pressed="${id === current}">${label}</button>`,
    )
    .join(
      "",
    )}</div><details class="section" ${compact ? "" : "open"}><summary>Ajustar formato y tiempo</summary><div class="grid two"><label class="field">Prefiero<select data-format><option value="all">Cualquier formato</option><option value="listen">Escuchar</option><option value="read">Leer o tener texto</option><option value="video">Ver un vídeo</option></select></label><label class="field">Tiempo del recurso<select data-minutes><option value="0">Sin filtro de duración</option><option value="5">Hasta 5 minutos</option><option value="15">Hasta 15 minutos</option><option value="30">Hasta 30 minutos</option></select></label></div><details><summary>Preferencias y contexto (opcional)</summary><label class="row small"><input type="checkbox" data-preference="meditacion"> Quiero incluir meditación guiada.</label><label class="row small"><input type="checkbox" data-preference="contemplativa-budista"> Quiero incluir prácticas de tradición budista.</label><label class="field">Solo si encaja con mi situación<select data-context><option value="">Sin contexto específico</option><option value="demencia">Cuido a alguien con demencia</option><option value="alzheimer-familiar">Soy familiar de alguien con Alzheimer</option><option value="mujer-cuidadora">Busco un programa para mujeres cuidadoras</option><option value="discapacidad-neurologica">Cuido a alguien con discapacidad neurológica</option><option value="persona-mayor">Cuido a una persona mayor</option></select></label><p class="small muted">Estas elecciones solo se usan en este panel; no se guardan como perfil de salud.</p></details><p class="small muted">Si filtras por tiempo solo se muestran duraciones comprobadas. Una pausa es opcional: puede que lo necesario sea un relevo o apoyo real.</p></details><div data-results aria-live="polite"></div><p class="small muted section">Relacionamos lo que eliges y el contexto de esta página con un catálogo revisado. No leemos tus notas para diagnosticar necesidades, ni enviamos tu elección a servicios externos.</p></section>`;
  const q = (s) => container.querySelector(s);
  const show = () => {
    if (disposed) return;
    container.querySelectorAll("[data-need]").forEach((b) => {
      b.classList.toggle("active", b.dataset.need === current);
      b.setAttribute("aria-pressed", String(b.dataset.need === current));
    });
    if (!current) {
      q("[data-results]").innerHTML =
        '<p class="small section">Elige una necesidad para ver propuestas. También puedes seguir sin usar recursos.</p>';
      return;
    }
    const [label, tool, action] = needs[current];
    const selected = catalog
      ? selectResources(catalog.resources, {
          need: current,
          format,
          minutes,
          offset,
          preferences,
          context,
        })
      : [];
    q("[data-results]").innerHTML =
      `<p class="small section">Puede encajar con <strong>${escapeHTML(label.toLowerCase())}</strong>, según ${escapeHTML(source)}. Puedes cambiarlo arriba.</p><article class="resource-action"><span class="tag">DENTRO DE CARELAB</span><h3>${action}</h3><p class="small muted">Un instrumento editable para convertir la necesidad en una propuesta concreta. Los apoyos se acuerdan con las personas implicadas.</p><a class="btn secondary" href="#/tool/${tool}">Prepararlo aquí</a></article><div class="grid two section">${selected.map((r) => `<article class="resource-card"><span class="tag">${escapeHTML({ audio: "Audio", musica: "Música", video: "Vídeo", lectura: "Lectura", curso: "Curso" }[r.format] || "Recurso")} · ${r.durationMinutes ? durationLabel(r.durationMinutes) : "Duración variable"}</span><h3>${escapeHTML(r.title)}</h3><p class="small">${escapeHTML(r.description)}</p><p class="small muted"><strong>Por qué aparece:</strong> ${escapeHTML(r.why || "Su contenido está relacionado con la necesidad que has seleccionado.")}</p><div class="row">${r.integratedTrackId ? `<button class="btn secondary" data-resource-track="${escapeHTML(r.integratedTrackId)}">Escuchar aquí</button>` : ""}<a href="${escapeHTML(safeURL(r.url))}" target="_blank" rel="noopener noreferrer" class="text-link">${r.integratedTrackId ? "Fuente y créditos" : "Abrir recurso externo"} ↗</a></div><details><summary>Acceso, procedencia y condiciones</summary><p>${escapeHTML(r.provider)} · ${escapeHTML(r.language)}. ${escapeHTML(r.access || "Consulta las condiciones del proveedor.")}</p><p>${escapeHTML(r.license?.reason || "Se facilita un enlace; no se reproduce la obra.")}</p><p class="small muted">Revisado: ${escapeHTML(r.checkedAt || catalog.checkedAt)}. La disponibilidad puede cambiar.</p>${r.cuidotecaIds?.length ? `<p class="small muted">Relación con el corpus: ${escapeHTML(r.cuidotecaRelation || "Ficha relacionada")}</p>` : ""}${(r.cuidotecaIds || []).map((id) => `<a class="text-link" href="#/ficha/${encodeURIComponent(id)}">Ver ficha relacionada en la Cuidoteca</a>`).join("<br>")}</details></article>`).join("")}</div>${!catalog ? `<p class="small muted section">${loading ? "Buscando en el catálogo de CareLab…" : "No se pudo cargar el catálogo. Puedes usar la herramienta de arriba."}</p>` : selected.length ? "" : `<p class="note section">No hay recursos verificados con esta combinación. Puedes ampliar el tiempo o cambiar el formato. No vamos a rellenar el espacio con recomendaciones poco relacionadas.</p>`}<div class="row section">${catalog ? '<button class="text-link" data-more>Ver otras opciones</button>' : ""}<a class="text-link" href="#/biblioteca">Explorar la biblioteca</a></div><p class="small muted section">Los enlaces externos solo contactan con el proveedor cuando los abres, con sus condiciones de privacidad. Música y meditación son opciones de ocio o práctica personal; no sustituyen un apoyo necesario ni se prescriben como tratamiento.</p>`;
    container
      .querySelectorAll("[data-resource-track]")
      .forEach((b) => (b.onclick = () => startTrack(b.dataset.resourceTrack)));
    const more = q("[data-more]");
    if (more)
      more.onclick = () => {
        offset += 2;
        if (
          !selectResources(catalog.resources, {
            need: current,
            format,
            minutes,
            offset,
            preferences,
            context,
          }).length
        )
          offset = 0;
        show();
        q("[data-results]").scrollIntoView({
          block: "start",
          behavior: "instant",
        });
      };
  };
  const load = async () => {
    if (catalog || loading || !current) return;
    loading = true;
    show();
    try {
      catalog = await loadResources();
    } catch {
    } finally {
      loading = false;
      show();
    }
  };
  q("[data-hide]").onclick = () => {
    container.hidden = true;
  };
  container.querySelectorAll("[data-need]").forEach(
    (b) =>
      (b.onclick = () => {
        current = b.dataset.need;
        source = "tu elección";
        offset = 0;
        show();
        load();
      }),
  );
  q("[data-format]").onchange = (e) => {
    format = e.target.value;
    offset = 0;
    show();
  };
  container.querySelectorAll("[data-preference]").forEach(
    (b) =>
      (b.onchange = () => {
        preferences = [
          ...container.querySelectorAll("[data-preference]:checked"),
        ].map((x) => x.dataset.preference);
        offset = 0;
        show();
      }),
  );
  q("[data-context]").onchange = (e) => {
    context = e.target.value || null;
    offset = 0;
    show();
  };
  q("[data-minutes]").onchange = (e) => {
    minutes = Number(e.target.value);
    offset = 0;
    show();
  };
  show();
  load();
  return () => {
    disposed = true;
  };
}

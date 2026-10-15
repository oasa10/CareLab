const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function mountGuidedPractice(
  container,
  { unit: u, program, Store, tools, notify, readText },
) {
  let stage = Math.max(
    0,
    Math.min(3, Number(Store.get().reflections["stage-" + u.id]) || 0),
  );
  const save = () => {
    Store.save();
    const e = Store.takeError();
    if (e) notify(e);
  };
  function render() {
    const state = Store.get(),
      done = state.completed.includes(u.id);
    const body = [
      `<p class="lv-lead">${esc(u.summary)}</p><div class="lv-example"><p class="quiet-eyebrow">UNA ESCENA PARA RECONOCERLO</p><p>${esc(u.example)}</p></div><button class="lv-primary" data-next>Ver qué cambia la mirada</button>`,
      `<p class="lv-lead">${esc(u.why)}</p><blockquote class="lv-quote">${esc(u.reflection)}</blockquote><p class="lv-note">No hace falta responder por escrito. Conserva la pregunta mientras miras la próxima escena de tu día.</p><button class="lv-primary" data-next>Llevarlo a una acción</button>`,
      `<p class="lv-lead">${esc(tools[u.tool]?.output || u.summary)}</p><ol class="step-list">${u.steps.map((s, i) => `<li><details ${i === 0 ? "open" : ""}><summary>Paso ${i + 1}</summary><p>${esc(s)}</p></details></li>`).join("")}</ol><div class="lv-actions"><a class="lv-primary" href="#/tool/${u.tool}">Preparar con la herramienta</a><button class="lv-secondary" data-next>Ya tengo algo que revisar</button></div><p class="lv-note">Preparar la acción no la marca como realizada. Cuando haya una ocasión real, vuelve para observar lo ocurrido.</p>`,
      `<p class="lv-lead">Lo aprendido no depende de que salga bien. Puedes registrar qué hiciste, qué ocurrió y qué necesita cambiar.</p><div class="lv-actions"><a class="lv-primary" href="#/plan">Revisar mi acción en el plan</a><button class="lv-secondary" data-explored>${done ? "Retirar mi marca de exploración" : "He explorado esta práctica"}</button></div><details><summary>Conservar una reflexión, si me sirve</summary><label class="lv-field">${esc(u.reflection)}<textarea class="lv-input" name="reflection" maxlength="4000" rows="4">${esc(state.reflections[u.id] || "")}</textarea></label><p class="lv-note">Se guarda al escribir, según tu elección de guardado.</p></details><p class="lv-note">Explorada no significa aprendida, realizada ni eficaz. Es solo una marca que tú decides.</p>`,
    ][stage];
    container.innerHTML = `<section class="lv-shell"><div class="lv-top"><a class="lv-quiet" href="#/programa/${u.moduleId}">Volver al módulo</a><a class="lv-quiet" href="#/ayuda">Ayuda</a></div><nav class="practice-stages" aria-label="Momentos de esta práctica">${["Ver", "Entender", "Probar", "Volver"].map((x, i) => `<button class="${stage === i ? "active" : ""}" data-stage="${i}" aria-current="${stage === i ? "step" : "false"}">${x}</button>`).join("")}</nav><p class="lv-kicker">APRENDER HACIENDO · ${esc(u.id.toUpperCase())}</p><h1 class="lv-title" tabindex="-1">${esc(u.title)}</h1>${body}<div class="lv-actions">${stage ? '<button class="lv-quiet" data-back>Atrás</button>' : ""}<button class="lv-quiet" data-audio>Escuchar esta parte</button></div><p><a class="lv-quiet" href="#/recursos">Encontrar un recurso para este momento</a></p><details class="lv-method"><summary>Límites y fuentes</summary><p>${esc(u.boundary)}</p><p>Adaptación educativa del proyecto. Las guías originales siguen disponibles en la biblioteca.</p><ul>${u.sourceRefs.map((r) => `<li><a href="#/ficha/gu-${r.toLowerCase()}">${esc(r)} · ${esc(program.sources.find((x) => x.id === r)?.title || "Capítulo de guía")}</a></li>`).join("")}</ul></details></section>`;
    container
      .querySelectorAll("[data-stage]")
      .forEach((b) => (b.onclick = () => move(Number(b.dataset.stage))));
    container
      .querySelector("[data-next]")
      ?.addEventListener("click", () => move(stage + 1));
    container
      .querySelector("[data-back]")
      ?.addEventListener("click", () => move(stage - 1));
    container
      .querySelector("[data-explored]")
      ?.addEventListener("click", () => {
        state.completed = done
          ? state.completed.filter((x) => x !== u.id)
          : [...state.completed, u.id];
        save();
        render();
      });
    container
      .querySelector("[name=reflection]")
      ?.addEventListener("input", (e) => {
        state.reflections[u.id] = e.target.value;
        save();
      });
    container.querySelector("[data-audio]").onclick = () =>
      readText(
        u.title,
        [
          u.summary,
          u.example,
          u.why,
          u.steps.join("\n\n"),
          "Puedes volver a tu plan para revisar qué ocurrió.",
        ][stage === 0 ? 0 : stage === 1 ? 2 : stage === 2 ? 3 : 4],
      );
  }
  function move(n) {
    stage = n;
    Store.get().reflections["stage-" + u.id] = String(stage);
    save();
    render();
    container.querySelector("h1").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  render();
}

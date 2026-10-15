// Only the two local workspace dialogs participate. Feedback is deliberately excluded.
import * as Store from "../v2/store.js";

const installed = new WeakMap();
const completed = new WeakSet();
const kinds = Object.freeze({
  "person-form": "person",
  "review-form": "review",
});
const contextPattern = /^[a-zA-Z0-9_-]{1,80}$/;
function keyFor(form) {
  if (!form || !kinds[form.id]) return "";
  const context = form.dataset.draftContext;
  if (
    !context ||
    !contextPattern.test(context) ||
    ["__proto__", "constructor", "prototype"].includes(context)
  )
    return "";
  return `${kinds[form.id]}/${context}`;
}
export function clearFormDraft(formOrKey) {
  const key = typeof formOrKey === "string" ? formOrKey : keyFor(formOrKey);
  if (!key) return;
  if (typeof formOrKey !== "string") completed.add(formOrKey);
  delete Store.get().drafts.forms[key];
  // The caller commits this together with its successful record creation/deletion.
}
function statusText() {
  const status = Store.getStorageStatus();
  if (status.error) return status.error;
  if (status.hasUnstoredChanges)
    return "El borrador sigue en esta pestaña, pero no está asegurado al recargar. Exporta una copia antes de cerrar.";
  if (status.mode === "device")
    return "Borrador guardado en este dispositivo. Aún no es un registro confirmado.";
  if (status.mode === "session")
    return "Borrador recuperable al volver a abrir este formulario en esta pestaña. Aún no es un registro confirmado.";
  return "Lo que escribas se conservará como borrador en esta sesión del navegador; no se envía.";
}
function bind(form) {
  const key = keyFor(form);
  if (!key || installed.has(form)) return;
  const workspace = Store.get();
  const controls = Array.from(form.elements).filter(
    (x) =>
      x.name &&
      /^(INPUT|TEXTAREA|SELECT)$/.test(x.tagName) &&
      !["file", "password", "hidden"].includes(x.type),
  );
  const draft = workspace.drafts.forms[key];
  if (draft) {
    for (const control of controls) {
      if (!Object.hasOwn(draft, control.name)) continue;
      const value = draft[control.name];
      if (control.type === "checkbox") control.checked = value === "true";
      else if (
        control.tagName !== "SELECT" ||
        Array.from(control.options).some((x) => x.value === value)
      )
        control.value = value;
    }
    if (form.elements.origin && form.elements.verification)
      form.elements.verification.required =
        form.elements.origin.value === "verificado";
  }
  const notice = document.createElement("p");
  notice.className = "small muted";
  notice.setAttribute("role", "status");
  notice.dataset.formDraftStatus = "";
  notice.textContent = draft
    ? statusText()
    : "Lo que escribas se conservará como borrador en esta sesión del navegador; no se envía.";
  form.append(notice);
  const save = () => {
    if (
      completed.has(form) ||
      !form.isConnected ||
      Store.get() !== workspace ||
      keyFor(form) !== key
    )
      return;
    workspace.drafts.forms[key] = Object.fromEntries(
      controls.map((control) => [
        control.name,
        control.type === "checkbox" ? String(control.checked) : control.value,
      ]),
    );
    Store.save();
    notice.textContent = statusText();
  };
  form.addEventListener("input", save);
  form.addEventListener("change", save);
  installed.set(form, save);
}
export function installFormDrafts(root = document) {
  const scan = () =>
    root.querySelectorAll("#person-form,#review-form").forEach(bind);
  scan();
  const observer = new MutationObserver(scan);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-draft-context"],
  });
  return () => observer.disconnect();
}

// A narrow, local signpost, not clinical triage or crisis detection assurance.
// No text is retained or sent. Quotations and false positives can be dismissed.
export function explicitRisk(text) {
  const value = String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const expressions = [
    /\b(?:quiero|voy a|pienso) (?:suicidarme|matarme|hacerme dano)\b/g,
    /\bvoy a (?:hacerle dano|matarle|matarla)\b/g,
    /\bno puedo (?:mantenerme|mantenerle|mantenerla) a salvo\b/g,
  ];
  for (const expression of expressions)
    for (const match of value.matchAll(expression)) {
      const prefix = value.slice(Math.max(0, match.index - 20), match.index);
      if (!/\b(?:no|nunca|jamas)\s*$/.test(prefix)) return true;
    }
  return false;
}
export function installSafetySignpost({ stopMedia }) {
  const seen = new WeakMap();
  function inspect(event) {
    const field = event.target;
    if (
      !field.matches('textarea,input[type="text"],input:not([type])') ||
      !field.closest("main") ||
      field.closest("#feedback-form") ||
      !explicitRisk(field.value) ||
      seen.get(field) === field.value
    )
      return;
    seen.set(field, field.value);
    stopMedia();
    const dialog = document.createElement("dialog");
    dialog.className = "quiet-safety-dialog";
    dialog.setAttribute("aria-labelledby", "safety-title");
    dialog.innerHTML =
      '<p class="quiet-eyebrow">PRIMERO, TU SEGURIDAD</p><h2 id="safety-title">Hagamos una pausa.</h2><p>Lo escrito podría describir una situación de peligro. No puedo saberlo por una frase. ¿Está pasando ahora?</p><div class="lv-actions"><a class="lv-primary" href="#/ayuda" data-support>Necesito apoyo ahora</a><button class="lv-secondary" data-dismiss>No describe un peligro actual</button></div><p class="quiet-caption">Este aviso se produce solo en tu dispositivo. CareLab no vigila tu seguridad ni avisa a nadie.</p>';
    document.body.append(dialog);
    dialog.addEventListener(
      "close",
      () => {
        dialog.remove();
        if (field.isConnected) field.focus();
      },
      { once: true },
    );
    dialog.querySelector("[data-dismiss]").onclick = () => dialog.close();
    dialog.querySelector("[data-support]").onclick = () => dialog.close();
    dialog.showModal();
  }
  document.addEventListener("focusout", inspect);
  return () => document.removeEventListener("focusout", inspect);
}

import { feedbackEndpoint } from "./feedback-config.js";

const categories = [
  ["uso", "Me cuesta usar algo"],
  ["error", "Algo no funciona"],
  ["idea", "Echo algo en falta"],
  ["otro", "Otra sugerencia"],
];
let draft = { category: "otro", message: "" };
let generation = 0;
export const hasFeedbackDraft = () => Boolean(draft.message.trim());
export function clearFeedbackDraft() {
  draft = { category: "otro", message: "" };
  generation++;
}

function receiver(value) {
  if (!value) return null;
  try {
    const url = new URL(value, location.href);
    if (url.username || url.password || url.hash || url.search) return null;
    if (
      url.protocol !== "https:" &&
      !(
        url.origin === location.origin &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      )
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

/** No workspace imports: feedback can only contain what is written in this form. */
export function mountFeedback(container, { endpoint = feedbackEndpoint } = {}) {
  const destination = receiver(endpoint);
  let mounted = true,
    sending = false,
    controller = null,
    sent = false;
  const initialGeneration = generation;
  let requestId = draft.requestId || "";
  container.innerHTML = `
    <header class="page-head"><p class="eyebrow">CARELAB SE CONSTRUYE ESCUCHANDO</p>
    <h1>¿Qué podemos<br>hacer mejor?</h1><p class="intro">Con una frase basta. Tu experiencia nos ayuda a mejorar.</p></header>
    <section class="card feedback-card"><form id="feedback-form">
      <fieldset class="feedback-options"><legend>¿Sobre qué? <span class="muted small">Opcional</span></legend>
        <div class="feedback-choices">${categories.map(([id, label]) => `<label><input type="radio" name="category" value="${id}"><span>${label}</span></label>`).join("")}</div>
      </fieldset>
      <div class="field"><label for="feedback-message">¿Qué cambiarías?</label>
        <textarea id="feedback-message" name="message" rows="5" maxlength="1200" required placeholder="Por ejemplo: me ayudaría encontrar antes…" aria-describedby="feedback-privacy feedback-count"></textarea>
        <span class="small muted feedback-count" id="feedback-count">0 / 1.200</span></div>
      <p class="small muted" id="feedback-privacy">No hace falta tu nombre ni tu correo. No incluyas datos de salud ni de otras personas. Tus planes y notas no se adjuntan.</p>
      ${destination ? '<p class="small muted">Al enviar, compartes tu sugerencia con el equipo de CareLab en un buzón privado.</p><details class="small feedback-privacy-details"><summary>Qué se envía y cómo se conserva</summary><p>Se guardan la categoría, el texto, la fecha y una referencia del envío hasta que el equipo los elimina. No se adjuntan tus planes ni tus notas. No enviamos correos ni recogemos una dirección para responderte.</p><p>El servicio procesa datos técnicos de conexión y usa contadores temporales para evitar abusos. El buzón no guarda direcciones IP en claro. El alojamiento tiene sus propios registros técnicos.</p><p>Puedes pedir que eliminemos tu sugerencia indicando su referencia en otra sugerencia o a la persona que te invitó a CareLab. Este canal no ofrece atención urgente.</p></details>' : '<div class="feedback-availability"><strong>El envío directo todavía no está disponible.</strong><p class="small">Puedes copiar la sugerencia y compartirla por el canal que ya tengas con la persona que te invitó a CareLab. Copiar o descargar no la envía al equipo.</p></div>'}
      <div class="row feedback-actions"><button class="btn" type="submit">${destination ? "Enviar sugerencia" : "Copiar sugerencia"}</button>
        ${destination ? '<button class="btn secondary" type="button" data-feedback-copy>Copiar</button>' : ""}
        <button class="text-link" type="button" data-feedback-download>Descargar texto</button></div>
      <p class="small feedback-status" role="status" aria-live="polite"></p>
      <details class="feedback-receipt small" hidden><summary>Referencia de tu sugerencia</summary><p>Conserva esta referencia si después quieres solicitar su eliminación.</p><code></code></details>
      <div class="feedback-copy-fallback" hidden><label for="feedback-copy-text">Selecciona y copia este texto</label><textarea id="feedback-copy-text" readonly rows="6"></textarea></div>
      <p class="small muted feedback-session">El borrador permanece solo mientras esta pestaña siga abierta. No se incorpora a tu copia del espacio personal.</p>
    </form></section>
    <p class="small muted section">Si necesitas apoyo ahora, <a class="text-link" href="#/ayuda">encuéntralo aquí</a>. Este formulario es para mejorar la herramienta.</p>`;

  const form = container.querySelector("form");
  const input = container.querySelector("#feedback-message");
  const counter = container.querySelector("#feedback-count");
  const status = container.querySelector(".feedback-status");
  input.value = draft.message;
  form.elements.category.value = draft.category;
  const update = () => {
    if (initialGeneration !== generation) return;
    draft = {
      category: form.elements.category.value || "otro",
      message: input.value,
    };
    counter.textContent = `${input.value.length.toLocaleString("es-ES")} / 1.200`;
    sent = false;
    container.querySelector(".feedback-receipt").hidden = true;
    requestId = "";
    if (destination && !sending) {
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = false;
      submit.textContent = "Enviar sugerencia";
    }
  };
  counter.textContent = `${input.value.length.toLocaleString("es-ES")} / 1.200`;
  form.addEventListener("input", update);
  function values() {
    if (!input.value.trim()) {
      input.setCustomValidity("Escribe una frase con tu sugerencia.");
      input.reportValidity();
      return null;
    }
    input.setCustomValidity("");
    if (!form.reportValidity()) return null;
    return {
      category: form.elements.category.value || "otro",
      message: input.value.trim(),
    };
  }
  input.addEventListener("input", () => input.setCustomValidity(""));
  const asText = (value) =>
    `Sugerencia para CareLab\n\n${categories.find(([id]) => id === value.category)?.[1] || "Otra sugerencia"}\n\n${value.message}\n`;
  async function copy() {
    const value = values();
    if (!value) return;
    const text = asText(value);
    try {
      await navigator.clipboard.writeText(text);
      if (mounted)
        status.textContent =
          "Sugerencia copiada. Todavía no se ha enviado; puedes pegarla en tu canal de contacto habitual.";
    } catch {
      if (!mounted) return;
      const fallback = container.querySelector(".feedback-copy-fallback");
      fallback.hidden = false;
      const area = fallback.querySelector("textarea");
      area.value = text;
      area.focus();
      area.select();
      status.textContent =
        "El navegador no pudo copiar. Puedes seleccionar el texto. Todavía no se ha enviado.";
    }
  }
  container
    .querySelector("[data-feedback-copy]")
    ?.addEventListener("click", copy);
  container
    .querySelector("[data-feedback-download]")
    .addEventListener("click", () => {
      const value = values();
      if (!value) return;
      const url = URL.createObjectURL(
        new Blob([asText(value)], { type: "text/plain;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "CareLab-mi-sugerencia.txt";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent =
        "Se ha preparado el archivo. Descargarlo no lo envía al equipo.";
    });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!destination) {
      await copy();
      return;
    }
    const value = values();
    if (!value || sending || sent) return;
    sending = true;
    controller = new AbortController();
    const buttons = [...form.querySelectorAll("button")];
    buttons.forEach((button) => (button.disabled = true));
    input.readOnly = true;
    form.querySelector("fieldset").disabled = true;
    status.textContent = "Enviando tu sugerencia…";
    requestId ||= crypto.randomUUID();
    if (initialGeneration === generation) draft.requestId = requestId;
    const timeout = setTimeout(() => controller?.abort(), 15000);
    try {
      // Request a short-lived token only after an explicit submission. No
      // background requests, cookies or personal workspace data are involved.
      const tokenUrl = new URL("feedback-token", destination);
      const tokenResponse = await fetch(tokenUrl, {
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "no-store",
        signal: controller.signal,
      });
      const authorization = await tokenResponse.json().catch(() => null);
      if (!tokenResponse.ok || !authorization?.token)
        throw new Error(tokenResponse.status === 429 ? "rate" : "token");
      const response = await fetch(destination, {
        method: "POST",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestId,
          "X-Feedback-Token": authorization.token,
        },
        body: JSON.stringify(value),
        signal: controller.signal,
      });
      const receipt = await response.json().catch(() => null);
      if (
        !response.ok ||
        receipt?.ok !== true ||
        receipt?.status !== "recorded" ||
        receipt?.receiptId !== requestId
      )
        throw new Error(response.status === 429 ? "rate" : "receipt");
      sent = true;
      if (initialGeneration === generation)
        draft = { category: "otro", message: "" };
      if (mounted) {
        form.querySelector('button[type="submit"]').textContent =
          "Sugerencia recibida";
        status.textContent =
          "Gracias. Tu sugerencia ya está en el buzón privado de CareLab.";
        const receiptView = container.querySelector(".feedback-receipt");
        receiptView.hidden = false;
        receiptView.querySelector("code").textContent = receipt.receiptId;
      }
    } catch (error) {
      if (mounted)
        status.textContent =
          error.message === "rate"
            ? "Hay demasiados envíos seguidos. Tu texto sigue aquí; puedes intentarlo más tarde o copiarlo."
            : "No hemos podido confirmar la recepción. Tu texto sigue aquí; puedes copiarlo o volver a intentarlo.";
    } finally {
      clearTimeout(timeout);
      sending = false;
      if (mounted) {
        buttons.forEach((button) => (button.disabled = false));
        form.querySelector('button[type="submit"]').disabled = sent;
        input.readOnly = false;
        form.querySelector("fieldset").disabled = false;
      }
    }
  });
  return () => {
    mounted = false;
    controller?.abort();
  };
}

import { icon } from "./icons.js";

// Only original CareLab editorial material is supplied to these narrations.
// Private plans, diary entries, imported data and user notes must never be passed
// to readText(). Device speech is restricted to voices reporting localService.
export const tracks = [
  {
    id: "pausa",
    title: "Un poco de espacio",
    description:
      "Una pausa sin ejercicios ni metas. Para reconocer lo que necesitas, a tu manera.",
    src: null,
    transcript:
      "Un poco de espacio para ti.\n\nNo tienes que terminar nada durante este audio. Puedes escucharlo, mirar alrededor o pararlo cuando quieras. No hay una forma correcta de hacer esta pausa.\n\nSi este momento te lo permite y las necesidades de cuidado están cubiertas, deja por un instante la siguiente tarea. Quizá te venga bien sentarte, cambiar de postura o simplemente estar sin añadir otra obligación. Elige lo que resulte cómodo y posible para ti.\n\nPuedes preguntarte qué has ido dejando para después. A lo mejor es beber algo, comer con tranquilidad, ir al baño o disponer de unos minutos sin mensajes. No hace falta hacer una lista ni resolverlo todo ahora.\n\nSi una necesidad depende de que otra persona te releve, esa condición importa. Una pausa breve no sustituye un apoyo que falta. Tampoco tienes que aprender a soportar indefinidamente una situación que necesita cambiar.\n\nAl terminar, puedes continuar como estabas, cerrar la herramienta o elegir una sola cosa para atenderte. También puedes guardar esa necesidad para hablarla con alguien que pueda ayudar.\n\nEste momento no es una prueba. No hay que conseguir calma ni demostrar que lo has aprovechado. Tu descanso tiene valor aunque el día siga siendo difícil.",
    cover: "green",
    duration: null,
    durationLabel: "Lectura de 1–2 min",
    playback: "local-tts",
    author: "CareLab",
    mediaType: "narracion",
  },
  {
    id: "paso",
    title: "Un paso que quepa hoy",
    description:
      "Aclarar una dificultad cotidiana y elegir un cambio pequeño que puedas revisar.",
    src: null,
    transcript:
      "Elegir un paso que quepa en tu día.\n\nCuando hay muchas cosas pendientes, elegir una puede costar. No necesitas ordenar toda tu vida para empezar. Piensa, si te sirve, en una dificultad cotidiana que te esté quitando margen.\n\nPonle una frase concreta. Por ejemplo: sigo pendiente de todas las compras aunque otra persona las recoja. Esa frase permite ver algo distinto de una sensación general de tener demasiado encima.\n\nAhora separa lo que puedes decidir de lo que requiere un acuerdo o un recurso externo. Puedes preparar una propuesta. No puedes decidir que otra persona la acepte, ni garantizar que llegue un servicio que todavía no está disponible.\n\nUn paso pequeño podría ser escribir quién necesita asumir también la lista, el pedido y la confirmación. O pedir una conversación breve para aclararlo. El paso debe caber en tus condiciones reales y respetar las decisiones de las personas afectadas.\n\nAntes de probarlo, elige cómo sabrás si ayudó. Quizá baste comprobar si la compra quedó resuelta sin que tú tuvieras que recordar cada detalle. Si añadió trabajo, puedes cambiarlo o dejarlo.\n\nNo hace falta hacerlo hoy. Y si aparece un riesgo o una situación médica, psicológica o legal, detén esta práctica y busca ayuda competente. Aquí estamos preparando una decisión cotidiana, no resolviendo esas situaciones.",
    cover: "peach",
    duration: null,
    durationLabel: "Lectura de 1–2 min",
    playback: "local-tts",
    author: "CareLab",
    mediaType: "narracion",
  },
  {
    id: "ayuda",
    title: "Pedir una ayuda concreta",
    description:
      "Preparar una petición con alcance, respuesta y responsabilidades claras.",
    src: null,
    transcript:
      "Pedir una ayuda concreta.\n\nPedir ayuda no debería convertirse en otra jornada de coordinación. A veces, una petición más clara permite saber qué se ofrece y qué sigue faltando. No garantiza una respuesta favorable, pero puede evitar acuerdos confusos.\n\nPiensa en una tarea cotidiana que otra persona pueda asumir con seguridad. Por ejemplo, recoger un pedido, llevar un documento o acompañarte a una gestión. Comprueba qué permisos y condiciones hacen falta. Ser familiar no autoriza por sí solo a decidir o actuar por otra persona.\n\nPuedes preparar una frase como esta: necesito que te encargues de esta tarea el jueves. Incluye prepararla y avisarme cuando esté terminada. ¿Puedes hacerlo? Si no puedes, prefiero saberlo para buscar otra opción.\n\nDeja espacio para que la respuesta sea sí, no o una propuesta diferente. Si hay acuerdo, concreta qué se hará, cuándo, con qué información y a quién acudir si surge una dificultad. Una aceptación no es una promesa ilimitada para el futuro.\n\nDespués, comprueba si recibiste la ayuda acordada o si toda la coordinación volvió a ti. Nombrar esa diferencia permite ajustar el reparto.\n\nSi no hay nadie disponible, el problema no es que hayas pedido mal. Puede hacer falta una respuesta profesional, comunitaria o institucional. Mereces apoyo aunque tu red todavía no pueda ofrecerlo.",
    cover: "blue",
    duration: null,
    durationLabel: "Lectura de 1–2 min",
    playback: "local-tts",
    author: "CareLab",
    mediaType: "narracion",
  },
  {
    id: "piano-meditation",
    title: "Meditation Impromptu 02",
    description:
      "Piano instrumental, sin palabras. Para acompañar una pausa cuando te apetezca escuchar.",
    src: "assets/audio/piano-meditation/audio.mp3",
    playback: "file",
    transcript:
      "Pieza instrumental de piano, sin palabras.\n\nMeditation Impromptu 02 — Kevin MacLeod (incompetech.com).\nLicencia Creative Commons Atribución 4.0 Internacional.\nArchivo original sin modificar.\n\nLa selección responde a una preferencia de escucha; no es un tratamiento ni garantiza relajación.",
    cover: "green",
    duration: 249,
    durationLabel: "4 min 09 s",
    author: "Kevin MacLeod",
    mediaType: "musica",
    credit: {
      title: "Meditation Impromptu 02",
      author: "Kevin MacLeod",
      provider: "Incompetech",
      isrc: "USUAN1100162",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      sourceUrl:
        "https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1100162",
      downloadUrl:
        "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Meditation%20Impromptu%2002.mp3",
      metadataUrl: "https://incompetech.com/music/royalty-free/pieces.json",
      changes: "Ninguno: archivo original sin modificar.",
      checkedAt: "2026-10-15",
      sha256:
        "4e7ead76cfdda0979ff7d771fbbc3dbb312ca80ce25b78f3cdcaef07fcc7c2da",
      bytes: 8261798,
      catalogDuration: "00:04:09",
    },
  },
  {
    id: "piano-luminous",
    title: "Luminous Rain",
    description:
      "Una pieza breve de piano. Puedes escucharla sin convertir este momento en otra tarea.",
    src: "assets/audio/piano-luminous/audio.mp3",
    playback: "file",
    transcript:
      "Pieza instrumental de piano, sin palabras.\n\nLuminous Rain — Kevin MacLeod (incompetech.com).\nLicencia Creative Commons Atribución 4.0 Internacional.\nArchivo original sin modificar.\n\nLa selección responde a una preferencia de escucha; no es un tratamiento ni garantiza relajación.",
    cover: "blue",
    duration: 114,
    durationLabel: "1 min 54 s",
    author: "Kevin MacLeod",
    mediaType: "musica",
    credit: {
      title: "Luminous Rain",
      author: "Kevin MacLeod",
      provider: "Incompetech",
      isrc: "USUAN1100169",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      sourceUrl:
        "https://incompetech.com/music/royalty-free/index.html?Search=Search&isrc=USUAN1100169",
      downloadUrl:
        "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Luminous%20Rain.mp3",
      metadataUrl: "https://incompetech.com/music/royalty-free/pieces.json",
      changes: "Ninguno: archivo original sin modificar.",
      checkedAt: "2026-10-15",
      sha256:
        "73825cc2c4aba34e200e99a6a737ab792f683bbd875f643ca5b00016349a0a24",
      bytes: 3744555,
      catalogDuration: "00:01:54",
    },
  },
];

const rates = [0.75, 1, 1.25, 1.5, 2];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const assetURL = (path) => new URL("../../" + path, import.meta.url).href;
const time = (value) => {
  if (!Number.isFinite(value)) return "0:00";
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};
const synth = () =>
  "speechSynthesis" in window ? window.speechSynthesis : null;
const localMedia = new Set();
const pageCleanups = new WeakMap();
const activePageCleanups = new Set();
let root,
  audio,
  mode = null,
  activeTrack = null,
  returnFocus = null;
let rate = 1,
  volume = 0.4,
  message = "",
  sourceTitle = "";
let paragraphs = [],
  paragraphIndex = 0,
  speechState = "idle",
  utterance = null;
let speechGeneration = 0,
  speechTimer = null,
  voiceURI = "",
  voiceListenerMounted = false;
let isSeeking = false;

function localVoices() {
  const voices = synth()?.getVoices?.() || [];
  const score = (voice) =>
    (/^es(?:[-_]|$)/i.test(voice.lang) ? 100 : 0) +
    (/premium/i.test(voice.name)
      ? 20
      : /enhanced|mejorada/i.test(voice.name)
        ? 10
        : 0);
  return voices
    .filter((voice) => voice.localService === true)
    .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
}

function selectedVoice() {
  const voices = localVoices();
  const found =
    voices.find((voice) => voice.voiceURI === voiceURI) || voices[0];
  if (found) voiceURI = found.voiceURI;
  return found;
}

function creditHTML(track, className = "small") {
  const c = track.credit;
  if (!c) return "";
  return `<p class="${esc(className)}" style="margin-top:12px">${esc(c.title)} — <a href="${esc(c.sourceUrl)}" target="_blank" rel="noopener noreferrer">Kevin MacLeod · Incompetech</a>.<br><a href="${esc(c.licenseUrl)}" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · Archivo original sin modificar.</p>`;
}

function rateOptions() {
  return rates
    .map(
      (value) =>
        `<option value="${value}"${value === rate ? " selected" : ""}>${String(value).replace(".", ",")}×</option>`,
    )
    .join("");
}

function voiceOptions() {
  const voices = localVoices();
  selectedVoice();
  return voices.length
    ? voices
        .map(
          (voice) =>
            `<option value="${esc(voice.voiceURI)}"${voice.voiceURI === voiceURI ? " selected" : ""}>${esc(voice.name)} · ${esc(voice.lang)}</option>`,
        )
        .join("")
    : '<option value="">Sin voces locales disponibles</option>';
}

function cancelSpeech() {
  speechGeneration += 1;
  if (speechTimer !== null) window.clearTimeout(speechTimer);
  speechTimer = null;
  if (utterance) {
    utterance.onend = null;
    utterance.onerror = null;
    utterance.onstart = null;
    utterance.onpause = null;
    utterance.onresume = null;
  }
  utterance = null;
  synth()?.cancel();
  if (synth()?.paused) synth().resume();
  speechState = "idle";
}

function pauseLocalMedia() {
  for (const media of localMedia) media.pause();
}

function clearGlobal({ restoreFocus = false } = {}) {
  cancelSpeech();
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    audio = null;
  }
  mode = null;
  activeTrack = null;
  message = "";
  if (root) {
    root.replaceChildren();
    root.hidden = true;
  }
  document.body.classList.remove("has-player");
  if (restoreFocus && returnFocus?.isConnected)
    returnFocus.focus({ preventScroll: true });
}

export function stopMedia() {
  clearGlobal({ restoreFocus: true });
  pauseLocalMedia();
}

function showMessage(text) {
  message = text;
  updatePlayer();
}

export function mountPlayer() {
  root = document.getElementById("player-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "player-root";
    root.hidden = true;
    document.body.append(root);
  }
  if (!voiceListenerMounted && synth()?.addEventListener) {
    voiceListenerMounted = true;
    synth().addEventListener("voiceschanged", () => {
      if (mode !== "speech") return;
      const selector = root.querySelector("[data-voice]");
      if (selector) selector.innerHTML = voiceOptions();
      if (localVoices().length && speechState === "idle") {
        message =
          "Hay una voz local disponible. Pulsa Reproducir para escuchar.";
      }
      updatePlayer();
    });
  }
  return root;
}

function renderPlayer() {
  mountPlayer();
  root.hidden = false;
  document.body.classList.add("has-player");
  const isAudio = mode === "audio";
  const title = isAudio ? activeTrack.title : sourceTitle;
  const transcript = isAudio ? activeTrack.transcript : paragraphs.join("\n\n");
  root.innerHTML = `<section class="player-dock" role="region" aria-label="Reproductor de CareLab">
    <div class="player-top"><div><div class="player-title">${esc(title)}</div>
      <div class="player-caption">${isAudio ? esc("Piano instrumental · " + activeTrack.author) : "Lectura del contenido editorial · voz del dispositivo"}</div></div>
      <button type="button" data-close aria-label="Cerrar y detener el reproductor" title="Cerrar y detener">${icon("close")}</button></div>
    <div class="player-controls">
      <button type="button" data-play aria-label="Reproducir" title="Reproducir">${icon("play")}</button>
      <button type="button" data-stop aria-label="Detener y volver al inicio" title="Detener y volver al inicio">${icon("stop")}</button>
      ${
        isAudio
          ? `<button type="button" data-skip="-10" aria-label="Retroceder diez segundos" title="Retroceder diez segundos">−10 s</button>
      <button type="button" data-skip="10" aria-label="Avanzar diez segundos" title="Avanzar diez segundos">+10 s</button>
      <label for="media-seek" class="visually-hidden">Posición del audio, en segundos</label><input id="media-seek" type="range" min="0" max="0" value="0" step="0.1" disabled data-seek>
      <span class="player-time" data-time aria-hidden="true">0:00 / 0:00</span>`
          : `<button type="button" data-paragraph="-1" aria-label="Párrafo anterior" title="Párrafo anterior">${icon("back")}</button>
      <button type="button" data-paragraph="1" aria-label="Párrafo siguiente" title="Párrafo siguiente">${icon("arrow")}</button>
      <span class="player-time" data-paragraph-count></span>`
      }
      <label for="media-rate" class="visually-hidden">Velocidad de reproducción</label><select id="media-rate" data-rate>${rateOptions()}</select>
      <label for="media-volume" class="visually-hidden">Volumen del reproductor</label>${icon("volume", 18)}<input id="media-volume" data-volume type="range" min="0" max="1" step="0.05" value="${volume}" aria-label="Volumen del reproductor" style="max-width:100px">
      ${isAudio ? "" : `<label for="media-voice" class="visually-hidden">Voz local para la lectura</label><select id="media-voice" data-voice>${voiceOptions()}</select>`}
    </div>
    <p class="player-caption" data-status role="status" aria-live="polite" aria-atomic="true" style="margin:8px 0 0"></p>
    <details style="padding:6px 0 0;border-color:#58766a"><summary style="font-size:.75rem;min-height:26px">${isAudio ? "Información de la pieza y créditos" : "Leer el texto y las opciones de voz"}</summary>
      ${isAudio ? "" : '<p class="player-caption">Solo se utilizan voces que el navegador identifica como locales. Puedes cambiar de párrafo; la lectura de voz no permite saltos medidos en segundos. Si no hay una voz local, sigue leyendo o elige una de las piezas de música de «Un respiro».</p>'}
      <div style="max-height:180px;overflow:auto;white-space:pre-line;font-size:.85rem;padding:8px 2px" tabindex="0" aria-label="${isAudio ? "Transcripción del audio" : "Texto de la lectura"}">${esc(transcript)}</div>
      ${isAudio ? creditHTML(activeTrack, "player-caption") : ""}
    </details>
  </section>`;
  root.querySelector("[data-close]").addEventListener("click", stopMedia);
  root.querySelector("[data-play]").addEventListener("click", togglePlay);
  root.querySelector("[data-stop]").addEventListener("click", stopTransport);
  root.querySelector("[data-rate]").addEventListener("change", (event) => {
    rate = Number(event.target.value);
    if (audio) audio.playbackRate = rate;
    else if (mode === "speech" && speechState === "speaking") speakParagraph();
    else if (mode === "speech" && speechState === "paused") {
      cancelSpeech();
      speechState = "paused";
      showMessage(
        "Velocidad cambiada. Al continuar se leerá de nuevo este párrafo.",
      );
    }
  });
  root.querySelector("[data-volume]").addEventListener("input", (event) => {
    volume = Number(event.target.value);
    if (audio) audio.volume = volume;
    else if (mode === "speech" && speechState === "speaking") {
      // Web Speech only applies volume when a new utterance starts.
      showMessage("El nuevo volumen se aplicará al siguiente párrafo.");
    }
  });
  root.querySelector("[data-volume]").addEventListener("change", () => {
    if (mode === "speech" && speechState === "speaking") {
      speakParagraph();
      showMessage("Volumen aplicado. Se retoma el párrafo actual.");
    } else if (mode === "speech" && speechState === "paused") {
      cancelSpeech();
      speechState = "paused";
      showMessage(
        "Volumen cambiado. Al continuar se leerá de nuevo este párrafo.",
      );
    }
  });
  if (isAudio) {
    root
      .querySelectorAll("[data-skip]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          seekAudio(Number(button.dataset.skip)),
        ),
      );
    const seek = root.querySelector("[data-seek]");
    seek.addEventListener("pointerdown", () => {
      isSeeking = true;
    });
    seek.addEventListener("pointerup", () => {
      isSeeking = false;
    });
    seek.addEventListener("pointercancel", () => {
      isSeeking = false;
    });
    seek.addEventListener("input", () => {
      if (audio && Number.isFinite(audio.duration))
        audio.currentTime = Math.min(audio.duration, Number(seek.value));
      updatePlayer();
    });
    seek.addEventListener("change", () => {
      isSeeking = false;
      updatePlayer();
    });
  } else {
    root
      .querySelectorAll("[data-paragraph]")
      .forEach((button) =>
        button.addEventListener("click", () =>
          moveParagraph(Number(button.dataset.paragraph)),
        ),
      );
    root.querySelector("[data-voice]").addEventListener("change", (event) => {
      voiceURI = event.target.value;
      const wasSpeaking = speechState === "speaking";
      cancelSpeech();
      if (wasSpeaking) speakParagraph();
      else
        showMessage(
          "Voz cambiada. Pulsa Reproducir para escuchar este párrafo con la voz elegida.",
        );
    });
  }
  updatePlayer();
}

function updatePlayer() {
  if (!mode || !root) return;
  const play = root.querySelector("[data-play]");
  const status = root.querySelector("[data-status]");
  if (!play || !status) return;
  const playing =
    mode === "audio" ? audio && !audio.paused : speechState === "speaking";
  const label = playing ? "Pausar" : "Reproducir";
  if (play.getAttribute("aria-label") !== label) {
    play.setAttribute("aria-label", label);
    play.title = label;
    play.innerHTML = icon(playing ? "pause" : "play");
  }
  let statusText = "";
  if (mode === "audio" && audio) {
    const available = Number.isFinite(audio.duration) && audio.duration > 0;
    const seek = root.querySelector("[data-seek]");
    seek.disabled = !available;
    seek.max = available ? String(audio.duration) : "0";
    if (!isSeeking) seek.value = String(audio.currentTime || 0);
    seek.setAttribute(
      "aria-valuetext",
      `${time(audio.currentTime)} de ${available ? time(audio.duration) : "duración pendiente"}`,
    );
    root.querySelector("[data-time]").textContent =
      `${time(audio.currentTime)} / ${time(audio.duration)}`;
    root.querySelectorAll("[data-skip]").forEach((button) => {
      button.disabled = !available;
    });
    statusText =
      message ||
      (audio.ended
        ? "Audio terminado. Puedes volver a escucharlo o cerrar el reproductor."
        : playing
          ? "Reproduciendo."
          : "En pausa.");
  } else if (mode === "speech") {
    const voices = localVoices();
    play.disabled = !voices.length;
    root.querySelector("[data-voice]").disabled = !voices.length;
    root.querySelector("[data-paragraph-count]").textContent =
      `Párrafo ${paragraphIndex + 1} de ${paragraphs.length}`;
    root.querySelector('[data-paragraph="-1"]').disabled = paragraphIndex === 0;
    root.querySelector('[data-paragraph="1"]').disabled =
      paragraphIndex >= paragraphs.length - 1;
    statusText =
      message ||
      (playing
        ? `Leyendo el párrafo ${paragraphIndex + 1} de ${paragraphs.length}.`
        : speechState === "paused"
          ? "Lectura en pausa."
          : "Lectura detenida.");
  }
  // Avoid repeated live-region announcements on every audio timeupdate.
  if (status.textContent !== statusText) status.textContent = statusText;
}

function seekAudio(delta) {
  if (audio && Number.isFinite(audio.duration)) {
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration, audio.currentTime + delta),
    );
    updatePlayer();
  }
}

async function playAudio() {
  if (!audio) return;
  const current = audio;
  message = "";
  pauseLocalMedia();
  try {
    await current.play();
    if (audio === current) updatePlayer();
  } catch (error) {
    if (audio !== current || error?.name === "AbortError") return;
    showMessage(
      error?.name === "NotAllowedError"
        ? "El navegador ha bloqueado el inicio del audio. Pulsa Reproducir para iniciarlo."
        : "No se ha podido reproducir este audio. Puedes leer la transcripción e intentarlo de nuevo.",
    );
  }
}

export async function startTrack(id) {
  const track = tracks.find((entry) => entry.id === id);
  if (!track) return false;
  if (track.playback === "local-tts")
    return readText(track.title, track.transcript);
  const focus = document.activeElement;
  clearGlobal();
  pauseLocalMedia();
  returnFocus = focus;
  mode = "audio";
  activeTrack = track;
  isSeeking = false;
  const current = new Audio();
  audio = current;
  current.preload = "metadata";
  current.src = assetURL(track.src);
  current.playbackRate = rate;
  current.volume = volume;
  if ("preservesPitch" in current) current.preservesPitch = true;
  for (const name of [
    "loadedmetadata",
    "durationchange",
    "timeupdate",
    "pause",
    "ended",
  ]) {
    current.addEventListener(name, () => {
      if (audio === current) updatePlayer();
    });
  }
  current.addEventListener("playing", () => {
    if (audio === current) {
      message = "";
      updatePlayer();
    }
  });
  current.addEventListener("waiting", () => {
    if (audio === current)
      showMessage("Preparando el audio… La transcripción está disponible.");
  });
  current.addEventListener("error", () => {
    if (audio === current)
      showMessage(
        "El audio no está disponible o este navegador no admite su formato. Puedes leer la transcripción.",
      );
  });
  renderPlayer();
  await playAudio();
  return true;
}

function stopTransport() {
  message = "";
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  } else {
    cancelSpeech();
    paragraphIndex = 0;
  }
  showMessage("Detenido. Puedes volver a reproducir desde el principio.");
}

function togglePlay() {
  if (mode === "audio") {
    if (!audio) return;
    if (audio.paused) playAudio();
    else {
      audio.pause();
      message = "";
      updatePlayer();
    }
    return;
  }
  if (mode !== "speech") return;
  if (speechState === "speaking") {
    // If an utterance is still scheduled, cancel it rather than allowing it to
    // start behind a paused UI.
    if (speechTimer !== null) cancelSpeech();
    else synth()?.pause();
    speechState = "paused";
    message = "";
    updatePlayer();
  } else if (speechState === "paused" && utterance && synth()?.paused) {
    synth().resume();
    speechState = "speaking";
    message = "";
    updatePlayer();
  } else {
    speakParagraph();
  }
}

function speakParagraph() {
  cancelSpeech();
  const voice = selectedVoice();
  if (!voice || !("SpeechSynthesisUtterance" in window) || !synth()) {
    showMessage(
      "No hay una voz local disponible en este navegador. Puedes leer el texto o elegir una de las piezas de música de «Un respiro».",
    );
    return;
  }
  pauseLocalMedia();
  const generation = speechGeneration;
  speechState = "speaking";
  message = "";
  updatePlayer();
  // One queued utterance only. A generation guard prevents cancelled utterances
  // from advancing or restarting after a voice/speed/paragraph change.
  speechTimer = window.setTimeout(() => {
    speechTimer = null;
    if (generation !== speechGeneration || mode !== "speech") return;
    const part = new SpeechSynthesisUtterance(paragraphs[paragraphIndex]);
    part.voice = voice;
    part.lang = voice.lang;
    part.rate = rate;
    part.volume = volume;
    utterance = part;
    part.onstart = () => {
      if (generation === speechGeneration) {
        speechState = "speaking";
        updatePlayer();
      }
    };
    part.onend = () => {
      if (generation !== speechGeneration || mode !== "speech") return;
      utterance = null;
      if (paragraphIndex + 1 < paragraphs.length) {
        paragraphIndex += 1;
        speakParagraph();
      } else {
        speechState = "idle";
        paragraphIndex = 0;
        showMessage(
          "Lectura terminada. Puedes escucharla de nuevo o cerrar el reproductor.",
        );
      }
    };
    part.onerror = (event) => {
      if (generation !== speechGeneration || mode !== "speech") return;
      utterance = null;
      speechState = "idle";
      showMessage(
        event.error === "not-allowed"
          ? "El navegador ha bloqueado la lectura. Pulsa Reproducir para intentarlo de nuevo."
          : "La voz local no ha podido continuar. Puedes elegir otra voz local, leer el texto o escuchar las piezas de música.",
      );
    };
    synth().speak(part);
  }, 65);
}

function moveParagraph(delta) {
  const next = Math.max(
    0,
    Math.min(paragraphs.length - 1, paragraphIndex + delta),
  );
  if (next === paragraphIndex) return;
  const wasPlaying = speechState === "speaking";
  cancelSpeech();
  paragraphIndex = next;
  if (wasPlaying) speakParagraph();
  else
    showMessage(
      `Párrafo ${paragraphIndex + 1} seleccionado. Pulsa Reproducir para escucharlo.`,
    );
}

export function readText(title, editorialParagraphs) {
  const input = Array.isArray(editorialParagraphs)
    ? editorialParagraphs
    : [editorialParagraphs];
  const text = input
    .flatMap((value) => {
      if (typeof value === "string") return value.split(/\n\s*\n/);
      if (value && typeof value.text === "string")
        return [value.label, ...value.text.split(/\n\s*\n/)];
      return [];
    })
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());
  if (!text.length) return false;
  const focus = document.activeElement;
  clearGlobal();
  pauseLocalMedia();
  returnFocus = focus;
  mode = "speech";
  sourceTitle = typeof title === "string" ? title : "Lectura de CareLab";
  paragraphs = text;
  paragraphIndex = 0;
  selectedVoice();
  renderPlayer();
  speakParagraph();
  return true;
}

export function mountMediaPage(container) {
  if (!container) return () => {};
  pageCleanups.get(container)?.();
  container.innerHTML = `<div class="grid three">${tracks
    .map(
      (track) => `<article class="card">
      <div class="audio-cover ${esc(track.cover)}" aria-hidden="true"><div class="pause-orb"></div></div>
      <span class="tag">${esc(track.durationLabel)} · ${track.playback === "local-tts" ? "Texto original" : "Piano instrumental"}</span><h2 style="font-size:1.6rem;margin:18px 0 12px">${esc(track.title)}</h2>
      <p class="muted">${esc(track.description)}</p><button class="btn" type="button" data-track="${esc(track.id)}">${icon("play", 18)} ${track.playback === "local-tts" ? "Escuchar con voz local" : "Escuchar música"} <span class="visually-hidden">${esc(track.title)}</span></button>
      ${creditHTML(track)}
      <details style="margin-top:16px"><summary>${track.playback === "local-tts" ? "Leer el texto" : "Información de la pieza"}</summary><div class="detail-text">${esc(track.transcript)}</div></details>
    </article>`,
    )
    .join("")}</div>
    <p class="fact" style="margin-top:18px">Tú eliges cuándo escuchar y cuándo parar. Los textos de CareLab se leen con las voces locales disponibles en tu dispositivo; si no hay una, puedes leerlos. La música se reproduce aquí y conserva sus créditos. Ninguna propuesta sustituye los apoyos que faltan.</p>
    <section class="card section" data-local-section><p class="eyebrow">Tu propio espacio</p><h2>Escucha o mira un archivo tuyo.</h2>
      <p class="muted">Elige música, audio o vídeo de tu dispositivo. El archivo se abre aquí, no se envía a un servidor y no se guarda en CareLab. Al salir de esta página se libera del reproductor.</p>
      <div class="field"><label for="carelab-local-media">Archivo de audio o vídeo, hasta 200 MB</label>
      <input id="carelab-local-media" class="file-input" type="file" accept="audio/*,video/*,.m4a,.mp3,.wav,.aac,.ogg,.opus,.mp4,.mov,.webm,.ogv">
      <small>La compatibilidad depende del formato y de tu navegador. Elige solo archivos que tengas derecho a utilizar.</small></div>
      <p data-local-status class="small" role="status" aria-live="polite">Todavía no has elegido ningún archivo.</p><div data-local-player></div>
    </section>`;
  const localSection = container.querySelector("[data-local-section]");
  const input = container.querySelector("#carelab-local-media");
  const status = container.querySelector("[data-local-status]");
  const player = container.querySelector("[data-local-player]");
  let objectURL = null,
    media = null,
    destroyed = false;
  function release() {
    if (media) {
      media.pause();
      media.removeAttribute("src");
      media.load();
      localMedia.delete(media);
      media = null;
    }
    if (objectURL) URL.revokeObjectURL(objectURL);
    objectURL = null;
    player.replaceChildren();
  }
  function onChoose() {
    const file = input.files?.[0];
    if (!file) return;
    release();
    if (file.size > 200 * 1024 * 1024) {
      status.textContent =
        "Este archivo supera los 200 MB. Elige uno más pequeño.";
      input.value = "";
      return;
    }
    const supported =
      /^(audio|video)\//.test(file.type) ||
      /\.(m4a|mp3|wav|aac|ogg|opus|mp4|mov|webm|ogv)$/i.test(file.name);
    if (!supported) {
      status.textContent =
        "Elige un archivo de audio o vídeo. No se ha abierto este archivo.";
      input.value = "";
      return;
    }
    const video =
      file.type.startsWith("video/") ||
      /\.(mp4|mov|webm|ogv)$/i.test(file.name);
    objectURL = URL.createObjectURL(file);
    media = document.createElement(video ? "video" : "audio");
    const current = media;
    current.controls = true;
    current.preload = "metadata";
    current.setAttribute("aria-label", `Archivo local: ${file.name}`);
    if (video) {
      current.className = "local-video";
      current.playsInline = true;
    } else {
      current.style.width = "100%";
      current.style.margin = "16px 0";
    }
    current.src = objectURL;
    localMedia.add(current);
    player.append(current);
    const controls = document.createElement("div");
    controls.className = "row";
    controls.innerHTML = `<button type="button" class="btn secondary small" data-local-skip="-10" disabled aria-label="Retroceder diez segundos en el archivo local">−10 segundos</button>
      <button type="button" class="btn secondary small" data-local-skip="10" disabled aria-label="Avanzar diez segundos en el archivo local">+10 segundos</button>
      <label for="local-media-rate" class="small">Velocidad</label><select id="local-media-rate" style="width:auto" aria-label="Velocidad del archivo local">${rates.map((value) => `<option value="${value}"${value === 1 ? " selected" : ""}>${String(value).replace(".", ",")}×</option>`).join("")}</select>
      <button type="button" class="btn secondary small" data-local-remove>Retirar archivo</button>`;
    player.append(controls);
    controls.querySelectorAll("[data-local-skip]").forEach((button) =>
      button.addEventListener("click", () => {
        if (media === current && Number.isFinite(current.duration))
          current.currentTime = Math.max(
            0,
            Math.min(
              current.duration,
              current.currentTime + Number(button.dataset.localSkip),
            ),
          );
      }),
    );
    controls.querySelector("select").addEventListener("change", (event) => {
      current.playbackRate = Number(event.target.value);
    });
    controls
      .querySelector("[data-local-remove]")
      .addEventListener("click", () => {
        release();
        input.value = "";
        status.textContent =
          "Archivo retirado del reproductor. No se ha guardado ni enviado.";
        input.focus();
      });
    current.addEventListener("loadedmetadata", () => {
      if (media !== current) return;
      const duration = Number.isFinite(current.duration)
        ? time(current.duration)
        : "duración no disponible";
      status.textContent = `${file.name} · ${duration} · solo en este dispositivo. Pulsa Reproducir para empezar.`;
      controls.querySelectorAll("[data-local-skip]").forEach((button) => {
        button.disabled = !Number.isFinite(current.duration);
      });
    });
    current.addEventListener("play", () => {
      if (media !== current || destroyed) return;
      clearGlobal();
      for (const other of localMedia) if (other !== current) other.pause();
    });
    current.addEventListener("error", () => {
      if (media === current)
        status.textContent =
          "Este archivo no se puede reproducir aquí. Puede estar dañado o usar un formato que el navegador no admite. Prueba otro archivo.";
    });
    status.textContent = `${file.name} seleccionado. Preparando el archivo local…`;
  }
  function onPageClick(event) {
    const button = event.target.closest("[data-track]");
    if (button && container.contains(button)) startTrack(button.dataset.track);
  }
  input.addEventListener("change", onChoose);
  container.addEventListener("click", onPageClick);
  const observer = new MutationObserver(() => {
    if (!localSection.isConnected) cleanup();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  function cleanup() {
    if (destroyed) return;
    destroyed = true;
    observer.disconnect();
    input.removeEventListener("change", onChoose);
    container.removeEventListener("click", onPageClick);
    release();
    pageCleanups.delete(container);
    activePageCleanups.delete(cleanup);
  }
  pageCleanups.set(container, cleanup);
  activePageCleanups.add(cleanup);
  return cleanup;
}

window.addEventListener("pagehide", () => {
  clearGlobal();
  pauseLocalMedia();
  for (const cleanup of [...activePageCleanups]) cleanup();
});

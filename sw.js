/* Public app assets only. Personal work stays in the app's separate local storage.
 * Bump RELEASE whenever the public core changes: each version is cached as one unit.
 * Registration is initiated by the user's offline-preparation button, not at startup.
 */
const RELEASE = "20261016-2";
const SCOPE = self.registration.scope;
const PREFIX = `carelab-offline:${encodeURIComponent(new URL(SCOPE).pathname)}:`;
const CORE_CACHE = `${PREFIX}core-${RELEASE}`;
const MEDIA_CACHE = `${PREFIX}music-20261015-1`;
const CORE_FILES = [
  "",
  "index.html",
  "manifest.webmanifest",
  "assets/v2/style.css",
  "assets/v2/app.js",
  "assets/v2/store.js",
  "assets/v2/icons.js",
  "assets/v2/tools.js",
  "assets/v2/media.js",
  "assets/v2/didactic.js",
  "assets/v2/didactic.css",
  "assets/v2/brainbox.js",
  "assets/v2/brainbox.css",
  "assets/v2/theme.js",
  "assets/v2/theme.css",
  "assets/v2/recommendations.js",
  "assets/v2/recommendations.css",
  "assets/v2/feedback.js",
  "assets/v2/feedback.css",
  "assets/v2/feedback-config.js",
  "assets/v3/style.css",
  "assets/v3/sanctuary.js",
  "assets/v3/journey.js",
  "assets/v3/journey-content.js",
  "assets/v3/journey-state.js",
  "assets/v3/practice.js",
  "assets/v3/safety.js",
  "assets/v3/form-drafts.js",
  "assets/v3/images/ventana-lago.png",
  "assets/img/icono.svg",
  "assets/img/icono-180.png",
  "assets/fonts/inter-latin-wght.woff2",
  "assets/fonts/fraunces-latin-wght.woff2",
  "assets/fonts/OFL-Inter.txt",
  "assets/fonts/OFL-Fraunces.txt",
  "data/programa.json",
  "data/biblioteca.json",
  "data/recursos-multimedia.json",
  "assets/audio/manifest.json",
  "assets/audio/pausa/transcript.txt",
  "assets/audio/paso/transcript.txt",
  "assets/audio/ayuda/transcript.txt",
  "assets/audio/piano-meditation/credits.json",
  "assets/audio/piano-meditation/transcript.txt",
  "assets/audio/piano-luminous/credits.json",
  "assets/audio/piano-luminous/transcript.txt",
  "assets/video/recorrido.mp4",
  "assets/video/recorrido-poster.png",
  "assets/video/recorrido.es.vtt",
  "assets/video/recorrido-transcripcion.txt",
  "assets/video/recorrido-01-ver.png",
  "assets/video/recorrido-02-elegir.png",
  "assets/video/recorrido-03-preparar.png",
  "assets/video/recorrido-04-revisar.png",
];
const MUSIC_FILES = [
  "assets/audio/piano-meditation/audio.mp3",
  "assets/audio/piano-luminous/audio.mp3",
];
const absolute = (file) => new URL(file, SCOPE).href;
const CORE_URLS = CORE_FILES.map(absolute);
const MUSIC_URLS = MUSIC_FILES.map(absolute);
const CORE_SET = new Set(CORE_URLS);
const MUSIC_SET = new Set(MUSIC_URLS);
const MARKER = absolute("__carelab_offline_ready__");
let corePreparation;
let musicPreparation;

async function completeCache(name, urls) {
  if (!(await caches.has(name))) return false;
  const cache = await caches.open(name);
  if (!(await cache.match(MARKER))) return false;
  for (const url of urls) {
    const response = await cache.match(url);
    if (!response || response.status !== 200) return false;
  }
  return true;
}

async function prepare(name, urls) {
  if (await completeCache(name, urls)) return;
  try {
    const cache = await caches.open(name);
    // Cache.addAll commits its batch only when every response succeeds. A missing
    // module, quota failure or interrupted download therefore cannot replace the
    // previously active version. The final marker is written only after the batch.
    await cache.addAll(
      urls.map(
        (url) =>
          new Request(url, {
            cache: "reload",
            credentials: "same-origin",
          }),
      ),
    );
    await cache.put(
      MARKER,
      new Response(JSON.stringify({ release: RELEASE }), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    if (!(await completeCache(name, urls)))
      throw new Error("Incomplete download");
  } catch (error) {
    await caches.delete(name);
    throw error;
  }
}
function prepareCore() {
  if (!corePreparation)
    corePreparation = prepare(CORE_CACHE, CORE_URLS).finally(() => {
      corePreparation = undefined;
    });
  return corePreparation;
}
function prepareMusic() {
  if (!musicPreparation)
    musicPreparation = prepare(MEDIA_CACHE, MUSIC_URLS).finally(() => {
      musicPreparation = undefined;
    });
  return musicPreparation;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await prepareCore();
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Never clean previous versions until the complete new core is available.
      if (!(await completeCache(CORE_CACHE, CORE_URLS)))
        throw new Error("Core unavailable");
      for (const name of await caches.keys()) {
        if (
          name.startsWith(PREFIX) &&
          name !== CORE_CACHE &&
          name !== MEDIA_CACHE
        ) {
          await caches.delete(name);
        } else if (name.startsWith("carelab-v2-")) {
          // Migrate only legacy caches demonstrably belonging to this scope.
          const legacy = await caches.open(name);
          const requests = await legacy.keys();
          if (
            requests.some(
              (request) =>
                request.url === SCOPE || request.url === absolute("index.html"),
            ) &&
            requests.every((request) => request.url.startsWith(SCOPE))
          ) {
            await caches.delete(name);
          }
        }
      }
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("message", (event) => {
  const type = event.data?.type;
  if (!["CACHE_OFFLINE", "CACHE_MEDIA", "OFFLINE_STATUS"].includes(type))
    return;
  // A client of another application on the same origin cannot trigger downloads.
  if (event.source?.url && !event.source.url.startsWith(SCOPE)) return;
  event.waitUntil(
    (async () => {
      try {
        if (type === "CACHE_OFFLINE") await prepareCore();
        if (type === "CACHE_MEDIA") {
          await prepareCore();
          await prepareMusic();
        }
        event.ports[0]?.postMessage({
          ok: true,
          version: RELEASE,
          coreReady: await completeCache(CORE_CACHE, CORE_URLS),
          mediaReady: await completeCache(MEDIA_CACHE, MUSIC_URLS),
          ...(type === "CACHE_MEDIA" ? { media: true } : {}),
        });
      } catch {
        event.ports[0]?.postMessage({
          ok: false,
          version: RELEASE,
          media: type === "CACHE_MEDIA",
        });
      }
    })(),
  );
});

async function ranged(response, range) {
  const bytes = await response.arrayBuffer();
  const length = bytes.byteLength;
  const invalid = () =>
    new Response(null, {
      status: 416,
      headers: {
        "Content-Range": `bytes */${length}`,
        "Accept-Ranges": "bytes",
      },
    });
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
  if (!match || (!match[1] && !match[2])) return invalid();
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return invalid();
    start = Math.max(0, length - suffix);
    end = length - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : length - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end))
      return invalid();
    end = Math.min(end, length - 1);
  }
  if (start < 0 || start > end || start >= length) return invalid();
  const headers = new Headers(response.headers);
  headers.delete("Content-Encoding");
  headers.set("Content-Range", `bytes ${start}-${end}/${length}`);
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Accept-Ranges", "bytes");
  return new Response(bytes.slice(start, end + 1), { status: 206, headers });
}
const unavailable = () =>
  new Response("Este contenido no está descargado. Conecta para prepararlo.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  url.search = "";
  url.hash = "";
  const key = url.href;
  if (!CORE_SET.has(key) && !MUSIC_SET.has(key)) return;
  event.respondWith(
    (async () => {
      const name = CORE_SET.has(key) ? CORE_CACHE : MEDIA_CACHE;
      const cache = await caches.open(name);
      const cached = await cache.match(key);
      if (cached) {
        if (request.headers.has("Range"))
          return ranged(cached, request.headers.get("Range"));
        return cached;
      }
      // Coherent core versions are only populated in the atomic preparation above.
      // Music requires its separate download button; listening alone never implies
      // that the complete file (rather than a partial HTTP range) is stored offline.
      try {
        return await fetch(request);
      } catch {
        return unavailable();
      }
    })(),
  );
});

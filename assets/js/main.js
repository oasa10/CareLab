// CareLab: carga los datos, gestiona las rutas (#/...), el tema, la letra grande y el botón de ayuda.
import { h, storage, pararVoz, perfil, alCambiarPerfil, PERFILES } from './lib.js';

const VISTAS = {
  '': () => import('./views/inicio.js'),
  episodio: () => import('./views/episodio.js'),
  vuelta: () => import('./views/episodio.js'),
  grupo: () => import('./views/episodio.js'),
  palabras: () => import('./views/palabras.js'),
  palabra: () => import('./views/palabra.js'),
  ayuda: () => import('./views/ayuda.js'),
  tramites: () => import('./views/tramites.js'),
  reto: () => import('./views/reto.js'),
  cuaderno: () => import('./views/cuaderno.js'),
  conocer: () => import('./views/conocer.js'),
};
// qué sección del menú se marca en cada ruta
const NAV = { palabra: 'palabras', vuelta: 'cuaderno', episodio: '' };
const ALIAS = { clase: 'grupo', grupos: 'grupo', acerca: 'conocer', 'necesito-ayuda': 'ayuda/ahora', mito: 'reto' };

const app = document.getElementById('app');
let ctx = null, actual = null, primera = true;

async function cargar() {
  const get = u => fetch(u, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
  const [episodios, palabras, recursos, tramites, mitos] = await Promise.all([
    get('data/episodios.json'), get('data/palabras.json'), get('data/recursos.json'), get('data/tramites.json'), get('data/mitos.json')]);
  const porId = new Map(palabras.map(x => [x.id, x]));
  const epDe = new Map(episodios.map(e => [e.ficha, e]));
  return { episodios, palabras, porId, epDe, recursos, tramites, mitos };
}

function leerRuta() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(qs || '') };
}

async function ir() {
  const { parts, q } = leerRuta();
  const nombre = parts[0] || '';
  if (ALIAS[nombre]) { location.replace(`#/${ALIAS[nombre]}${parts.length > 1 ? '/' + parts.slice(1).map(encodeURIComponent).join('/') : ''}`); return; }
  const activo = nombre in NAV ? NAV[nombre] : nombre;
  for (const a of document.querySelectorAll('.nav a')) {
    if (a.getAttribute('href').slice(2) === activo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  document.body.classList.toggle('en-ayuda', nombre === 'ayuda' && parts[1] === 'ahora');
  pararVoz();
  if (actual?.destroy) { try { actual.destroy(); } catch (e) { /* nada */ } }
  actual = null;
  const cargarVista = VISTAS[nombre];
  const root = h('div', { class: 'wrap' });
  app.replaceChildren(root);
  if (!cargarVista) { noEncontrado(root); return; }
  try {
    const mod = await cargarVista();
    actual = (await mod.render(root, ctx, parts.slice(1), q, nombre)) || null;
  } catch (e) {
    console.error(e);
    root.replaceChildren(h('div', { class: 'empty' }, h('h1', null, 'Algo ha fallado'), h('p', null, 'No se ha podido mostrar esta página. Prueba a recargarla.'),
      h('p', null, h('a', { class: 'btn', href: '#/ayuda/ahora' }, 'Necesito ayuda ahora'))));
  }
  if (!primera) { window.scrollTo(0, 0); app.focus({ preventScroll: true }); }
  primera = false;
}

function noEncontrado(root) {
  document.title = 'Página no encontrada · CareLab';
  root.append(h('div', { class: 'empty' }, h('h1', null, 'Página no encontrada'), h('p', null, 'Esta dirección no existe en CareLab.'),
    h('p', null, h('a', { class: 'btn', href: '#/' }, 'Volver al inicio'))));
}

function tema() {
  const cambiar = () => {
    const oscuro = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const nuevo = oscuro ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    storage('tema', nuevo);
  };
  for (const b of document.querySelectorAll('#tema')) b.addEventListener('click', cambiar);
}

// Letra grande y una cosa por pantalla, para los días de cansancio (CL11)
function letra() {
  const b = document.getElementById('letra');
  const pon = on => { document.documentElement.classList.toggle('grande', on); b.setAttribute('aria-pressed', String(on)); };
  pon(!!storage('grande'));
  b.addEventListener('click', () => { const on = !document.documentElement.classList.contains('grande'); storage('grande', on); pon(on); });
}

function pie() {
  const el = document.getElementById('perfil-pie');
  if (!el) return;
  const pinta = () => { const k = perfil(); el.textContent = k ? `Cuidas: ${PERFILES[k].corto.toLowerCase()}.` : ''; };
  pinta(); alCambiarPerfil(pinta);
}

(async function inicio() {
  tema(); letra(); pie();
  try { ctx = await cargar(); } catch (e) {
    console.error(e);
    app.replaceChildren(h('div', { class: 'wrap empty' }, h('h1', null, 'No se han podido cargar los datos'), h('p', null, 'Comprueba la conexión y recarga la página. Si necesitas ayuda ahora: 112 ante una urgencia, 024 ante ideas de suicidio.')));
    return;
  }
  // el motor del episodio es un script clásico: esperamos a que esté
  if (!window.Episodio) await new Promise(r => window.addEventListener('load', r, { once: true }));
  window.addEventListener('hashchange', ir);
  ir();
})();

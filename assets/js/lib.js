// Utilidades comunes de CareLab: DOM, textos fijos, voz, imágenes y las piezas que se repiten en toda la web.

export const URL_BASE = 'https://oasa10.github.io/CareLab/';
export const REPO = 'https://github.com/oasa10/CareLab';
export const VERSION = '1.0 (beta)';
export const AUTORIA = 'Salazar, Osman (2026)';

export const PROMESA = 'Cuidas de alguien. CareLab te ayuda a que cuidar no te borre.';
export const FIRMA = 'Cuidar sin desaparecer';
export const PARA_QUE = [
  ['entender', 'Entender lo que te pasa', 'Las palabras del cuidar, contadas con escenas de todos los días.'],
  ['paso', 'Dar un paso para cuidarte', 'Un episodio de unos siete minutos que termina en una acción pequeña, para ti.'],
  ['ayuda', 'Saber a quién pedir ayuda', 'Teléfonos comprobados, servicios y trámites, primero en Euskadi.'],
];

// Las seis familias de palabras del cuidar (MEPRE, apartado 6)
export const FAMILIAS = {
  1: { nombre: 'Lo que pesa', corto: 'Lo que pesa' },
  2: { nombre: 'Lo que pasa por dentro', corto: 'Por dentro' },
  3: { nombre: 'Lo que protege y lo que da', corto: 'Lo que protege' },
  4: { nombre: 'El desgaste en el trabajo', corto: 'En el trabajo' },
  5: { nombre: 'El entorno', corto: 'El entorno' },
  6: { nombre: 'Cuando ya es otra cosa', corto: 'Señales' },
};

// «¿A quién cuidas?»: cambia ejemplos, orden y recursos, no la experiencia
export const PERFILES = {
  casa: { t: 'A alguien de mi familia o de mi entorno', corto: 'En casa' },
  trabajo: { t: 'Es mi trabajo', corto: 'Por trabajo' },
  dos: { t: 'Las dos cosas', corto: 'En casa y por trabajo' },
};
export const PARA = { casa: 'Para quien cuida en casa', trabajo: 'Para quien cuida por trabajo', dos: 'Para quien cuida en casa y por trabajo' };

// ---------- DOM
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') { for (const [p, x] of Object.entries(v)) { if (p.startsWith('--')) el.style.setProperty(p, x); else el.style[p] = x; } }
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) {
    if (k === null || k === undefined || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}
// append que se salta los vacíos (Element.append escribiría «null»)
export const pon = (el, ...kids) => el.append(...kids.flat(Infinity).filter(k => k !== null && k !== undefined && k !== false));
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// **negrita** y *cursiva*, nada más
export const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
export const p = (texto, attrs = {}) => h('p', Object.assign({ html: fmt(texto) }, attrs));
export function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

export function storage(key, val) {
  try {
    if (val === undefined) return JSON.parse(localStorage.getItem('carelab:' + key));
    if (val === null) { localStorage.removeItem('carelab:' + key); return null; }
    localStorage.setItem('carelab:' + key, JSON.stringify(val));
  } catch (e) { return null; }
}

// «¿A quién cuidas?»: se guarda solo en este dispositivo
const avisos = new Set();
export const perfil = () => storage('perfil');
export function ponerPerfil(k) { storage('perfil', k); avisos.forEach(f => f(k)); }
export function alCambiarPerfil(f) { avisos.add(f); return () => avisos.delete(f); }
// lo que encaja con tu perfil va primero
export function primeroLoTuyo(lista, campo = 'perfil') {
  const k = perfil();
  if (!k || k === 'dos') return lista;
  const peso = x => (x[campo] === k ? 0 : x[campo] === 'dos' ? 1 : 2);
  return lista.map((x, i) => [x, i]).sort((a, b) => peso(a[0]) - peso(b[0]) || a[1] - b[1]).map(([x]) => x);
}

// ---------- voz: «Escuchar» en todas las pantallas (CL11)
export const HAY_VOZ = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
let alParar = null;
export function pararVoz() {
  if (HAY_VOZ) { try { speechSynthesis.cancel(); } catch (e) { /* nada */ } }
  const f = alParar; alParar = null; if (f) f();
}
export function leerEnVoz(texto, alFin) {
  if (!HAY_VOZ) return;
  pararVoz();
  const limpio = String(texto).replace(/\*\*?|_/g, '').replace(/\s+/g, ' ').trim();
  const trozos = limpio.match(/[^.!?¿¡…]{1,220}[.!?…»]*|.{1,220}/g) || [];
  const voces = speechSynthesis.getVoices().filter(v => /^es(-|_)ES/i.test(v.lang));
  alParar = alFin || null;
  trozos.forEach((t, i) => {
    const u = new SpeechSynthesisUtterance(t.trim());
    u.lang = 'es-ES'; u.rate = 0.95; if (voces.length) u.voice = voces[0];
    if (i === trozos.length - 1) u.onend = () => { const f = alParar; alParar = null; if (f) f(); };
    speechSynthesis.speak(u);
  });
}
export function botonEscuchar(texto, etiqueta = 'Escuchar') {
  if (!HAY_VOZ) return null;
  const b = h('button', { class: 'btn small escuchar', type: 'button', 'aria-pressed': 'false' });
  const pon = on => { b.setAttribute('aria-pressed', String(on)); b.replaceChildren(h('span', { 'aria-hidden': 'true' }, on ? '■ ' : '🔊 '), on ? 'Parar' : etiqueta); };
  pon(false);
  b.addEventListener('click', () => {
    if (b.getAttribute('aria-pressed') === 'true') { pararVoz(); return; }
    pon(true);
    leerEnVoz(texto(), () => pon(false));
  });
  return b;
}
// lee lo marcado con .leer dentro de la página
export const textoDe = raiz => () => Array.from(raiz.querySelectorAll('.leer')).map(n => n.innerText.trim()).filter(Boolean).join('. ');

// ---------- piezas
export function cabeza(raiz, titulo, lead, ...extra) {
  return h('header', { class: 'page-head' },
    h('div', { class: 'ph-fila' }, h('h1', { class: 'leer' }, titulo), botonEscuchar(textoDe(raiz))),
    lead ? h('p', { class: 'lead leer', html: fmt(lead) }) : null, ...extra);
}
export function recuadro(tipo, titulo, ...kids) {
  return h('aside', { class: `callout ${tipo}` }, titulo ? h('b', { class: 'ct' }, titulo) : null, h('div', null, ...kids));
}
export const migas = (...items) => h('nav', { class: 'crumbs', 'aria-label': 'Estás en' },
  items.map((x, i) => [i ? ' › ' : '', Array.isArray(x) ? h('a', { href: x[0] }, x[1]) : x]));

// ---------- textos fijos de ayuda (CL10). Nunca los genera una IA; antes de usarse con grupos los revisa una persona clínica.
export const TEL = {
  112: { n: '112', t: 'Emergencias', h: 'Las 24 horas' },
  '024': { n: '024', t: 'Línea de atención a la conducta suicida', h: 'Gratuita, confidencial, las 24 horas' },
  '016': { n: '016', t: 'Violencia contra las mujeres', h: 'Las 24 horas. También por WhatsApp: 600 000 016' },
  anar: { n: '900 20 20 10', tel: '900202010', t: 'Fundación ANAR, para niñas, niños y adolescentes', h: 'Gratuito, las 24 horas' },
};
export const telLink = (k, cls = 'tel') => { const x = TEL[k]; return h('a', { class: cls, href: 'tel:' + (x.tel || x.n.replace(/\s/g, '')) }, x.n); };
export const AYUDA_LINEA = 'Si hay un peligro ahora, llama al 112. Si piensas en hacerte daño, al 024.';

export function cajaAviso(nivel) {
  if (!nivel) return null;
  if (nivel === 'stop') return h('aside', { class: 'aviso stop', role: 'note' },
    h('b', null, 'Esto ya no es para hacerlo a solas.'),
    h('p', null, 'Si hay un peligro ahora, para ti o para la persona que cuidas, llama al ', telLink(112), '. Si piensas en hacerte daño, al ', telLink('024'), ', gratuito y a cualquier hora. No tienes que pasarlo a solas.'),
    h('a', { class: 'btn ayuda-btn', href: '#/ayuda/ahora' }, 'Necesito ayuda ahora'));
  if (nivel === 'rojo') return h('aside', { class: 'aviso rojo', role: 'note' },
    h('b', null, 'Esto pide el apoyo de una profesional.'),
    h('p', null, 'Si dura semanas o te pesa cada día, habla con tu médica de familia, con psicología o con los servicios sociales. Si es en el trabajo, también con el servicio de prevención. Pedirlo no es un fallo: es lo que toca.'),
    h('a', { href: '#/ayuda' }, 'Dónde pedir ayuda →'));
  return h('aside', { class: 'aviso ambar', role: 'note' },
    h('b', null, 'Si te pasa a menudo, un solo paso.'),
    h('p', null, 'Cuéntaselo a tu médica de familia o a la trabajadora social de tu ayuntamiento. Pregunta también por el respiro: es un derecho que se puede pedir.'),
    h('a', { href: '#/ayuda' }, 'Dónde pedir ayuda →'));
}

// ---------- imágenes sencillas, sin caras (CL18): una por familia de palabras
const SVG = (cuerpo, vb = '0 0 48 48') => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${cuerpo}</svg>`;
export const DIBUJOS = {
  // 1 Lo que pesa: una piedra sobre los hombros
  1: SVG('<path d="M14 18c0-5 4.5-8 10-8s10 3 10 8-4.5 7-10 7-10-2-10-7Z" fill="currentColor" fill-opacity=".14"/><path d="M10 40c0-7 6-12 14-12s14 5 14 12"/><path d="M17 29l-2-3M31 29l2-3"/>'),
  // 2 Lo que pasa por dentro: un corazón con una ola
  2: SVG('<path d="M24 40S8 30.5 8 19.5A8 8 0 0 1 24 15a8 8 0 0 1 16 4.5C40 30.5 24 40 24 40Z" fill="currentColor" fill-opacity=".14"/><path d="M15 24c3-3 5 3 9 0s6 3 9 0"/>'),
  // 3 Lo que protege y lo que da: un paraguas
  3: SVG('<path d="M7 24a17 17 0 0 1 34 0Z" fill="currentColor" fill-opacity=".14"/><path d="M24 7v3M24 24v12a4 4 0 0 1-8 0"/>'),
  // 4 El desgaste en el trabajo: una batería casi vacía
  4: SVG('<rect x="9" y="15" width="27" height="18" rx="3.5" fill="currentColor" fill-opacity=".08"/><path d="M39 21v6"/><rect x="13" y="19" width="6" height="10" rx="1.5" fill="currentColor" stroke="none"/>'),
  // 5 El entorno: una casa con tres personas
  5: SVG('<path d="M8 22 24 9l16 13" /><path d="M12 19v20h24V19" fill="currentColor" fill-opacity=".08"/><circle cx="18" cy="29" r="2.4" fill="currentColor"/><circle cx="24" cy="31" r="2.4" fill="currentColor"/><circle cx="30" cy="29" r="2.4" fill="currentColor"/>'),
  // 6 Cuando ya es otra cosa: un salvavidas
  6: SVG('<circle cx="24" cy="24" r="15" fill="currentColor" fill-opacity=".1"/><circle cx="24" cy="24" r="6.5"/><path d="M13.4 13.4l6 6M34.6 13.4l-6 6M13.4 34.6l6-6M34.6 34.6l-6-6"/>'),
};
export function imgFamilia(n, grande = false) {
  return h('span', { class: `fimg f${n}${grande ? ' grande' : ''}`, style: { '--c': `var(--f${n})` }, html: DIBUJOS[n] || '', title: FAMILIAS[n] ? FAMILIAS[n].nombre : '' });
}

// «¿Cómo vas hoy con el cuidado?»: la bicicleta (Rueda, Cuesta arriba, Pedaleo en vacío) y el Stop
const bici = extra => SVG(`<circle cx="13" cy="31" r="7"/><circle cx="35" cy="31" r="7"/><path d="M13 31l7-12h9l6 12M20 19l4 12h5M27 15h5"/>${extra}`);
export const ESTADOS = {
  A: { t: 'Voy rodando', s: 'A veces me canso, pero cuidar tiene sentido y queda sitio para mí.', img: bici('<path d="M4 41h40" stroke-dasharray="2 4"/>'), ruta: 'Lo que ya funciona' },
  B: { t: 'Cuesta arriba', s: 'El cuidado lo ocupa todo y lo mío se ha ido apagando.', img: SVG('<g transform="rotate(-14 24 30)"><circle cx="13" cy="31" r="7"/><circle cx="35" cy="31" r="7"/><path d="M13 31l7-12h9l6 12M20 19l4 12h5M27 15h5"/></g><path d="M4 46 44 34"/>'), ruta: 'Un apoyo que existe' },
  C: { t: 'Pedaleo y no avanzo', s: 'Le doy mil vueltas, me pesa la culpa o he leído demasiado.', img: bici('<path d="M24 31c-3-4 3-6 0-10" stroke-dasharray="2 3"/><path d="M41 12a4 4 0 1 1-3-3" />') },
  D: { t: 'Hoy no puedo más', s: 'Necesito ayuda, no un ejercicio.', img: DIBUJOS[6], salir: true },
};

export function plural(n, uno, varios) { return `${n} ${n === 1 ? uno : varios}`; }
export function fechaHoy() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export function fechaLarga(s) { const d = new Date(s + 'T12:00:00'); return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; }

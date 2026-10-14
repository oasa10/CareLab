// El reto «¿Mito o dato?» (CL17): frases que circulan sobre cuidar, con su respuesta y su fuente, y el peldaño a la vista.
// Sin puntos y sin el error a la vista: se marca la respuesta, no a quien falla.
import { h, pon, fmt, cabeza, storage, primeroLoTuyo } from '../lib.js';

const VEREDICTO = { mito: 'Mito', dato: 'Dato', depende: 'Depende' };
const ESCALERA = [['Ruido', 'lo has oído'], ['Datos', 'sabes de dónde viene'], ['Información', 'sabes para qué se usa']];
const RONDA = 6;

export function render(root, ctx) {
  document.title = '¿Mito o dato? · CareLab';
  const M = ctx.mitos || [];
  const est = () => storage('reto') || { vistos: [] };
  const nivel = s => (s.vistos.length >= M.length && M.length ? 2 : s.vistos.length ? 1 : 0);
  const caja = h('div', { class: 'reto' });
  let ronda = [], i = 0;

  function escalera(n) {
    return h('ol', { class: 'escalera', 'aria-label': 'Tu peldaño' }, ESCALERA.slice().reverse().map(([t, d], k) => {
      const idx = ESCALERA.length - 1 - k;
      return h('li', { class: idx === n ? 'aqui' : idx < n ? 'bajo' : '' }, h('b', null, t), ' ', d);
    }));
  }
  function empezar() {
    const vistos = new Set(est().vistos);
    const orden = primeroLoTuyo(M);
    const nuevas = orden.filter(x => !vistos.has(x.id));
    const resto = orden.filter(x => vistos.has(x.id)).sort(() => Math.random() - 0.5);
    ronda = nuevas.concat(resto).slice(0, RONDA);
    i = 0; pinta();
  }
  function pinta() {
    if (i >= ronda.length) return fin();
    const x = ronda[i];
    const res = h('div', { class: 'reto-res', 'aria-live': 'polite' });
    const ops = h('div', { class: 'reto-ops', role: 'group', 'aria-label': 'Tu respuesta' });
    const sig = h('button', { class: 'btn primary', type: 'button', disabled: true, onclick: () => { i++; pinta(); } }, i === ronda.length - 1 ? 'Ver tu peldaño' : 'Siguiente');
    Object.entries(VEREDICTO).forEach(([k, t]) => ops.append(h('button', { class: 'btn reto-op', type: 'button', onclick: ev => {
      if (ops.dataset.hecho) return; ops.dataset.hecho = '1';
      ops.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.dataset.k === x.veredicto) b.classList.add('bien'); else if (b === ev.currentTarget) b.classList.add('elegida'); });
      const s = est(); if (!s.vistos.includes(x.id)) s.vistos.push(x.id); storage('reto', s);
      const ficha = ctx.porId.get(x.ficha);
      res.replaceChildren(
        h('p', { class: 'leer' }, h('b', null, `${VEREDICTO[x.veredicto]}. `), h('span', { html: fmt(x.respuesta) })),
        h('p', { class: 'small muted' }, 'Fuente: ', x.url ? h('a', { href: x.url, target: '_blank', rel: 'noopener' }, x.fuente) : x.fuente,
          ficha ? [' · ', h('a', { href: `#/palabra/${encodeURIComponent(ficha.id)}` }, `La palabra: ${ficha.palabra}`)] : null));
      sig.disabled = false; sig.focus();
    }, 'data-k': k }, t)));
    caja.replaceChildren(
      h('p', { class: 'reto-n small muted' }, `${i + 1} de ${ronda.length}`),
      h('p', { class: 'reto-frase leer', html: fmt(x.frase) }),
      h('p', { class: 'small muted' }, '¿Es un mito, es un dato o depende?'),
      ops, res, h('div', { class: 'btns' }, sig));
  }
  function fin() {
    const n = nivel(est());
    caja.replaceChildren(
      h('h2', null, 'Tu peldaño'),
      escalera(n),
      h('p', { class: 'leer', html: fmt(n >= 2 ? 'Has visto todas las frases: ya sabes de dónde viene cada una y para qué se dice. Llévalas a una conversación.' : 'Con estas frases subes a **Datos**: ya sabes de dónde viene cada una. Cuando las hayas visto todas, subes a **Información**.') }),
      h('div', { class: 'btns' }, h('button', { class: 'btn primary', type: 'button', onclick: empezar }, 'Otra ronda'), h('a', { class: 'btn', href: '#/palabras' }, 'Las palabras del cuidar')));
  }

  pon(root,
    cabeza(root, '¿Mito o dato?', 'Frases que se dicen sobre cuidar. Algunas hacen daño, otras suenan exageradas y son ciertas, y muchas dependen. Cada respuesta lleva su fuente. **Sin puntos**: aquí no se gana ni se pierde.'),
    h('div', { class: 'reto-peldano' }, h('p', { class: 'small muted' }, 'Tu peldaño ahora'), escalera(nivel(est()))),
    caja,
    h('p', { class: 'small muted' }, 'En grupo, se juega por equipos: se proyecta, cada equipo decide y después se abre la respuesta.'));
  empezar();
}

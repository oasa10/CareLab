// Las palabras del cuidar (CL6, CL7): unas cincuenta fichas en seis familias, con buscador y «para quién».
import { h, pon, cabeza, imgFamilia, FAMILIAS, PARA, norm, primeroLoTuyo } from '../lib.js';

export function render(root, ctx, parts, q) {
  document.title = 'Las palabras del cuidar · CareLab';
  let fam = q.get('familia') || '';
  let para = q.get('para') || '';
  let texto = q.get('q') || '';
  const lista = h('div', { class: 'pal-grid' });
  const cuenta = h('p', { class: 'small muted', 'aria-live': 'polite' });
  const buscar = h('input', { type: 'search', id: 'buscar', placeholder: 'Busca: «no puedo más», «culpa», «residencia»…', value: texto, 'aria-label': 'Buscar una palabra', autocomplete: 'off' });
  const form = h('form', { class: 'buscador', role: 'search', onsubmit: ev => { ev.preventDefault(); buscar.blur(); lista.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }, buscar, h('button', { class: 'btn', type: 'submit' }, 'Buscar'));
  buscar.addEventListener('input', () => { texto = buscar.value; pinta(); });

  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Familias' });
  const chip = (k, t, img) => h('button', { type: 'button', class: 'chip', 'aria-pressed': String(fam === k), style: k ? { '--c': `var(--f${k})` } : null, onclick: () => { fam = fam === k ? '' : k; pinta(); } }, img, t);
  const pintaChips = () => chips.replaceChildren(chip('', 'Todas'), ...Object.entries(FAMILIAS).map(([k, f]) => chip(k, f.nombre, imgFamilia(+k))));
  const paraSel = h('div', { class: 'chips', role: 'group', 'aria-label': 'Para quién' });
  const pintaPara = () => paraSel.replaceChildren(...[['', 'Todas'], ['casa', 'En casa'], ['trabajo', 'Por trabajo']].map(([k, t]) =>
    h('button', { type: 'button', class: 'chip', 'aria-pressed': String(para === k), onclick: () => { para = k; pinta(); } }, t)));

  function pinta() {
    pintaChips(); pintaPara();
    const n = norm(texto.trim());
    let xs = primeroLoTuyo(ctx.palabras, 'para').filter(x => (!fam || String(x.familia) === fam) && (!para || x.para === para || x.para === 'dos'));
    if (n) xs = xs.filter(x => norm([x.palabra, x.tecnico, ...(x.buscar || []), x.basico && x.basico.que_es].join(' ')).includes(n));
    cuenta.textContent = xs.length === ctx.palabras.length ? `${xs.length} palabras` : `${xs.length} de ${ctx.palabras.length} palabras`;
    lista.replaceChildren(...xs.map(x => h('a', { class: 'card pal-card', href: `#/palabra/${encodeURIComponent(x.id)}`, style: { '--c': `var(--f${x.familia})` } },
      imgFamilia(x.familia),
      h('div', null, h('h3', null, x.palabra), x.tecnico ? h('p', { class: 'tecnico' }, x.tecnico) : null,
        h('p', { class: 'small muted' }, x.basico ? x.basico.que_es : ''),
        h('p', { class: 'meta' }, FAMILIAS[x.familia].nombre, x.para !== 'dos' ? ` · ${PARA[x.para].replace('Para quien ', '')}` : '', x.aviso ? ' · pide ayuda' : '')))));
    if (!xs.length) lista.append(h('p', { class: 'empty' }, 'No hay ninguna con eso. Prueba con otra palabra o ', h('a', { href: '#/ayuda' }, 'mira dónde pedir ayuda'), '.'));
    const qs = new URLSearchParams(); if (fam) qs.set('familia', fam); if (para) qs.set('para', para); if (texto) qs.set('q', texto);
    history.replaceState(null, '', `#/palabras${qs.toString() ? '?' + qs : ''}`);
  }

  pon(root,
    cabeza(root, 'Las palabras del cuidar', 'Lo que te pasa tiene nombre, y saberlo ayuda a pedir. Cada palabra empieza con una escena; debajo, lo básico, una acción pequeña y, plegado, lo técnico.'),
    form, h('div', { class: 'filtros' }, h('p', { class: 'flabel' }, 'Familias'), chips, h('p', { class: 'flabel' }, 'Para quién'), paraSel), cuenta, lista);
  pinta();
}

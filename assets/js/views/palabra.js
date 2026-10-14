// Una palabra del cuidar (CL6): primero una escena, después lo básico en lectura fácil, una acción mínima y, plegado, «Saber más».
import { h, pon, fmt, migas, botonEscuchar, textoDe, imgFamilia, FAMILIAS, PARA, cajaAviso, storage, fechaHoy, recuadro } from '../lib.js';

export function render(root, ctx, parts, q) {
  const x = ctx.porId.get(parts[0]);
  if (!x) { location.replace('#/palabras'); return; }
  document.title = `${x.palabra} · CareLab`;
  const B = x.basico || {};
  const ep = ctx.epDe.get(x.id);
  const art = h('article', { class: 'ficha', style: { '--c': `var(--f${x.familia})` } });

  if (q.get('tras') === 'episodio') art.append(recuadro('ok', 'Has terminado el episodio', 'Esta es la palabra que lo sostiene. Léela cuando quieras: tu paso ya está en ', h('a', { href: '#/cuaderno' }, 'tu cuaderno'), '.'));

  const apuntado = h('p', { class: 'small', 'aria-live': 'polite' });
  const apuntar = h('button', { class: 'btn small', type: 'button', onclick: () => {
    const xs = storage('acciones') || [];
    if (!xs.some(a => a.id === x.id && a.fecha === fechaHoy())) xs.push({ id: x.id, palabra: x.palabra, texto: B.accion_minima, fecha: fechaHoy() });
    storage('acciones', xs);
    apuntado.replaceChildren('Apuntada en ', h('a', { href: '#/cuaderno' }, 'tu cuaderno'), ', solo en este dispositivo.');
  } }, 'Apuntarla en mi cuaderno');

  pon(art,
    migas(['#/palabras', 'Las palabras del cuidar'], h('a', { href: `#/palabras?familia=${x.familia}` }, FAMILIAS[x.familia].nombre)),
    x.escena ? h('p', { class: 'escena leer', html: fmt(x.escena) }) : null,
    h('header', { class: 'ficha-cab' }, imgFamilia(x.familia, true),
      h('div', null, h('h1', { class: 'leer' }, x.palabra), x.tecnico ? h('p', { class: 'tecnico' }, `En los estudios: ${x.tecnico}`) : null,
        h('p', { class: 'meta' }, PARA[x.para] || ''))),
    h('div', { class: 'ficha-acc' }, botonEscuchar(textoDe(art), 'Escuchar la ficha')),
    cajaAviso(x.aviso),
    h('section', { class: 'basico', 'aria-label': 'Lo básico' },
      bloque('Qué es', B.que_es), bloque('Cómo se nota en tu día', B.como_se_nota), bloque('Qué no es', B.que_no_es)),
    B.accion_minima ? h('section', { class: 'accion' }, h('h2', null, 'Una acción mínima'), h('p', { class: 'leer', html: fmt(B.accion_minima) }),
      h('p', { class: 'small muted' }, 'Pequeña, elegida y para ti. Si no es el momento, no pasa nada.'), apuntar, apuntado) : null,
    ep ? h('p', { class: 'con-ep' }, h('a', { class: 'btn primary', href: `#/episodio/${encodeURIComponent(ep.id)}` }, `▶ El episodio «${ep.palabra}»`), ' ', h('span', { class: 'small muted' }, 'Siete tiempos, unos siete minutos.')) : null,
    x.saber_mas ? h('details', { class: 'saber-mas' }, h('summary', null, 'Saber más'), h('div', { html: fmt(x.saber_mas) })) : null,
    x.fuentes && x.fuentes.length ? h('section', { class: 'fuentes' }, h('h2', null, 'Fuentes'),
      h('ul', null, x.fuentes.map(f => h('li', null, f.url ? h('a', { href: f.url, target: '_blank', rel: 'noopener' }, f.cita) : f.cita)))) : null,
    x.relacionadas && x.relacionadas.length ? h('section', { class: 'rel' }, h('h2', null, 'Palabras cerca'),
      h('div', { class: 'chips' }, x.relacionadas.map(id => ctx.porId.get(id)).filter(Boolean).map(r =>
        h('a', { class: 'chip', href: `#/palabra/${encodeURIComponent(r.id)}`, style: { '--c': `var(--f${r.familia})` } }, imgFamilia(r.familia), r.palabra)))) : null);
  pon(root, art);
}

function bloque(t, texto) {
  if (!texto) return null;
  return h('div', { class: 'b' }, h('h2', { class: 'leer' }, t), h('p', { class: 'leer', html: fmt(texto) }));
}

// Trámites básicos (CL9): información general, con enlaces oficiales y sin asesorar casos.
import { h, pon, fmt, cabeza, migas, recuadro, botonEscuchar, textoDe, primeroLoTuyo, PARA } from '../lib.js';

export function render(root, ctx, parts) {
  const T = ctx.tramites || [];
  const x = parts[0] && T.find(t => t.id === parts[0]);
  if (x) return uno(root, x);
  document.title = 'Trámites básicos · CareLab';
  pon(root,
    cabeza(root, 'Trámites básicos', 'Qué existe, para qué sirve y dónde se pide. Es **información general**: cada caso lo resuelven los servicios sociales de tu ayuntamiento o tu diputación, y los enlaces llevan a sus webs oficiales.'),
    h('div', { class: 'tram-grid' }, primeroLoTuyo(T).map(t => h('a', { class: 'card tram', href: `#/tramites/${encodeURIComponent(t.id)}` },
      h('h3', null, t.titulo), h('p', { class: 'small muted', html: fmt(t.resumen) }), t.perfil === 'trabajo' ? h('p', { class: 'meta' }, 'Por trabajo') : null))),
    recuadro('aclaracion', 'Una ley recién nacida', 'La Ley 4/2026 reforma la ley de dependencia. Su desarrollo depende de reglamentos y de cada comunidad, así que CareLab explica lo que dice el texto y enlaza al BOE, sin prometer plazos ni cuantías.'));
}

function uno(root, t) {
  document.title = `${t.titulo} · CareLab`;
  const art = h('article', { class: 'tramite' });
  pon(art,
    migas(['#/tramites', 'Trámites básicos'], t.titulo),
    h('header', { class: 'page-head' }, h('div', { class: 'ph-fila' }, h('h1', { class: 'leer' }, t.titulo), botonEscuchar(textoDe(art))),
      h('p', { class: 'lead leer', html: fmt(t.resumen) }), t.perfil && t.perfil !== 'dos' ? h('p', { class: 'meta' }, PARA[t.perfil]) : null),
    t.pasos && t.pasos.length ? h('section', null, h('h2', null, 'Paso a paso'), h('ol', { class: 'pasos' }, t.pasos.map(s => h('li', { class: 'leer', html: fmt(s) })))) : null,
    t.donde ? h('section', null, h('h2', null, 'Dónde se pide'), h('p', { class: 'leer', html: fmt(t.donde) })) : null,
    t.enlaces && t.enlaces.length ? h('section', null, h('h2', null, 'Enlaces oficiales'), h('ul', { class: 'enlaces' }, t.enlaces.map(e => h('li', null, h('a', { href: e.url, target: '_blank', rel: 'noopener' }, e.t))))) : null,
    t.saber_mas ? h('details', { class: 'saber-mas' }, h('summary', null, 'Saber más'), h('div', { html: fmt(t.saber_mas) })) : null,
    t.fuente ? h('p', { class: 'small muted' }, 'Fuente: ', /^https?:/.test(t.fuente) ? h('a', { href: t.fuente, target: '_blank', rel: 'noopener' }, t.fuente) : t.fuente) : null,
    recuadro('aclaracion', null, 'CareLab no asesora casos concretos. Para el tuyo, pregunta en los servicios sociales de tu ayuntamiento: es su trabajo y es gratuito.'));
  pon(root, art);
}

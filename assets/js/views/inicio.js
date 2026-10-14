// La portada (CL1, CL2): la promesa, una sola puerta (un episodio cuando puedas) y, un paso más abajo, todo lo demás.
import { h, pon, FIRMA, PARA_QUE, PERFILES, perfil, ponerPerfil, alCambiarPerfil, botonEscuchar, textoDe, DIBUJOS } from '../lib.js';
import { obtener } from '../episodio.js';

const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="lleno" cx="32" cy="21" r="8.5"/><path class="lleno" d="M32 33C22 33 14.5 40 14.5 52H32Z"/><circle cx="38.6" cy="34.6" r="2.9" style="fill:var(--l1)"/><circle cx="44.2" cy="38.4" r="2.9" style="fill:var(--l2)"/><circle cx="47.9" cy="44.2" r="2.9" style="fill:var(--l3)"/><circle cx="49.6" cy="50.6" r="2.9" style="fill:var(--l4)"/></svg>';

export function render(root, ctx) {
  document.title = 'CareLab · Cuidar sin desaparecer';
  const E = obtener(ctx);
  const puerta = h('div', { class: 'puerta' });
  E.portada(puerta, {
    boton: 'Empieza',
    alAbrir: id => { location.hash = `#/episodio/${encodeURIComponent(id)}`; },
    alVolver: id => { location.hash = `#/vuelta/${encodeURIComponent(id)}`; },
  });

  const quien = h('p', { class: 'quien small' });
  const pintaQuien = () => {
    const k = perfil();
    quien.replaceChildren(k ? `Cuidas ${PERFILES[k].corto.toLowerCase()}. ` : '¿A quién cuidas? Te lo preguntamos al empezar. ',
      ...Object.entries(PERFILES).filter(([id]) => id !== k).map(([id, x], i) => [i ? ' · ' : '', h('button', { class: 'linkbtn', type: 'button', onclick: () => { ponerPerfil(id); E.portada(puerta, { boton: 'Empieza', alAbrir: j => { location.hash = `#/episodio/${encodeURIComponent(j)}`; }, alVolver: j => { location.hash = `#/vuelta/${encodeURIComponent(j)}`; } }); } }, k ? `Cambiar a «${x.corto.toLowerCase()}»` : x.corto)]));
  };
  pintaQuien();
  const quitar = alCambiarPerfil(pintaQuien);

  const hero = h('section', { class: 'hero' },
    h('div', { class: 'hero-logo', html: LOGO }),
    h('h1', { class: 'promesa leer' }, h('span', null, 'Cuidas de alguien.'), ' ', h('span', null, 'CareLab te ayuda a que cuidar no te borre.')),
    h('p', { class: 'firma' }, FIRMA),
    h('div', { class: 'hero-acc' }, botonEscuchar(textoDe(root))),
    puerta, quien,
    h('p', { class: 'small muted leer' }, 'CareLab es una puerta a la ayuda de personas. No es una terapia ni una evaluación, y no guarda nada fuera de tu dispositivo.'));

  const sirve = h('section', { class: 'sirve', 'aria-label': 'Para qué te sirve' },
    PARA_QUE.map(([k, t, d], i) => h('div', { class: 'sirve-i' }, h('span', { class: 'n' }, String(i + 1)), h('div', null, h('b', { class: 'leer' }, t), h('p', { class: 'small muted leer' }, d)))));

  const I = (svg, n) => h('span', { class: 'fimg', style: { '--c': `var(--f${n})` }, html: svg });
  const S = c => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${c}</svg>`;
  const ICO = {
    palabras: S('<path d="M8 12c6-2 11-1 16 3v24c-5-4-10-5-16-3Z" fill="currentColor" fill-opacity=".12"/><path d="M40 12c-6-2-11-1-16 3v24c5-4 10-5 16-3Z"/>'),
    tramites: S('<path d="M13 7h15l8 8v26H13Z" fill="currentColor" fill-opacity=".1"/><path d="M28 7v8h8M18 24h12M18 30h12M18 36h7"/>'),
    grupo: S('<circle cx="16" cy="18" r="4.5"/><circle cx="32" cy="18" r="4.5"/><circle cx="24" cy="14" r="4.5" fill="currentColor" fill-opacity=".15"/><path d="M8 36c0-5 3.5-8 8-8M40 36c0-5-3.5-8-8-8M15 38c0-6 4-10 9-10s9 4 9 10"/>'),
    reto: S('<circle cx="24" cy="24" r="16" fill="currentColor" fill-opacity=".1"/><path d="M19 19a5 5 0 1 1 7 4.6c-1.3.6-2 1.6-2 3V28"/><circle cx="24" cy="34" r="1.2" fill="currentColor"/>'),
    cuaderno: S('<rect x="11" y="7" width="26" height="34" rx="3" fill="currentColor" fill-opacity=".1"/><path d="M17 7v34M22 16h10M22 22h10"/>'),
  };
  const T = (href, img, t, d) => h('a', { class: 'card tarjeta', href }, img, h('div', null, h('h3', null, t), h('p', { class: 'small muted' }, d)));
  const mas = h('section', { class: 'mas' },
    h('h2', null, 'Un paso más abajo'),
    h('div', { class: 'tarjetas' },
      T('#/palabras', I(ICO.palabras, 2), 'Las palabras del cuidar', `${ctx.palabras.length} palabras, cada una con una escena, lo básico y una acción pequeña.`),
      T('#/ayuda', I(DIBUJOS[6], 6), 'Dónde pedir ayuda', 'Teléfonos comprobados y servicios. Primero Euskadi, después España.'),
      T('#/tramites', I(ICO.tramites, 5), 'Trámites básicos', 'La dependencia, el respiro, la prestación y lo que cambia la ley de 2026.'),
      T('#/grupo', I(ICO.grupo, 3), 'Para grupos', 'Una sesión de 45 minutos para proyectar, sin nombres y sin cuentas.'),
      T('#/reto', I(ICO.reto, 1), '¿Mito o dato?', 'Frases que circulan sobre cuidar, con su respuesta y su fuente.'),
      T('#/cuaderno', I(ICO.cuaderno, 4), 'Tu cuaderno', 'Tus pasos y tus historias, solo en este dispositivo. Se puede imprimir.')));

  pon(root, hero, sirve, mas);
  return { destroy: () => { quitar(); E.parar(); } };
}

// Tu cuaderno (CL13): misiones, vueltas, historias y acciones apuntadas, solo en este dispositivo. Se puede imprimir.
import { h, pon, cabeza, storage, perfil, ponerPerfil, PERFILES, fechaLarga, recuadro } from '../lib.js';
import { obtener } from '../episodio.js';

export function render(root, ctx) {
  document.title = 'Tu cuaderno · CareLab';
  const E = obtener(ctx);
  const ep = h('div', { class: 'cuaderno-ep' });
  E.cuaderno(ep, {
    alVolver: id => { location.hash = `#/vuelta/${encodeURIComponent(id)}`; },
    alAbrir: id => { location.hash = `#/episodio/${encodeURIComponent(id)}`; },
  });

  const acc = h('section', { class: 'ep-c-sec' }, h('h3', null, 'Acciones apuntadas desde las palabras'));
  const pintaAcc = () => {
    const xs = storage('acciones') || [];
    acc.replaceChildren(h('h3', null, 'Acciones apuntadas desde las palabras'));
    if (!xs.length) { acc.append(h('p', { class: 'ep-nota' }, 'Aún ninguna. En cada palabra hay una acción mínima que puedes apuntar aquí.')); return; }
    acc.append(h('ul', { class: 'acciones' }, xs.slice().reverse().map((a, k) => h('li', null,
      h('b', null, a.palabra), ` · ${fechaLarga(a.fecha)}`, h('p', null, a.texto),
      h('button', { class: 'linkbtn small no-print', type: 'button', onclick: () => { const ys = storage('acciones') || []; ys.splice(ys.length - 1 - k, 1); storage('acciones', ys); pintaAcc(); } }, 'Quitar')))));
  };
  pintaAcc();

  const quien = h('div', { class: 'chips', role: 'group', 'aria-label': 'A quién cuidas' });
  const pintaQuien = () => quien.replaceChildren(...Object.entries(PERFILES).map(([k, x]) =>
    h('button', { class: 'chip', type: 'button', 'aria-pressed': String(perfil() === k), onclick: () => { ponerPerfil(k); pintaQuien(); } }, x.t)));
  pintaQuien();

  pon(root,
    cabeza(root, 'Tu cuaderno', 'Lo que haces en CareLab se queda aquí, **solo en este dispositivo**. Nadie más lo ve, ni siquiera quien hizo la web. Puedes imprimirlo para llevarlo a tu médica, a la trabajadora social o a tu grupo.'),
    h('div', { class: 'btns no-print' }, h('button', { class: 'btn primary', type: 'button', onclick: () => window.print() }, 'Imprimir mi cuaderno')),
    h('p', { class: 'solo-print' }, `CareLab · mi cuaderno · ${fechaLarga(new Date().toISOString().slice(0, 10))}`),
    ep, acc,
    h('section', { class: 'ajustes no-print' }, h('h2', null, 'Ajustes'),
      h('p', { class: 'flabel' }, '¿A quién cuidas?'), quien,
      h('p', { class: 'small muted' }, 'Cambia los ejemplos de los episodios, el orden y los recursos que salen primero.'),
      h('p', { class: 'small' }, 'La letra grande se cambia con el botón «Aa» de arriba.')),
    recuadro('aclaracion', 'Sin cuentas y sin datos', 'CareLab no tiene registro, ni cookies, ni analítica. Si borras los datos del navegador, el cuaderno se borra también.'));
  return { destroy: () => E.parar() };
}

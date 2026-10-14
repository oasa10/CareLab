// El episodio (CL2 a CL5), la vuelta y el modo grupo (CL14), el uso principal de CareLab.
import { h, pon, fmt, cabeza, recuadro, migas, imgFamilia, FAMILIAS, primeroLoTuyo } from '../lib.js';
import { obtener } from '../episodio.js';

export function render(root, ctx, parts, q, ruta) {
  const E = obtener(ctx);
  if (ruta === 'grupo') return parts[0] ? proyectar(root, ctx, E, parts[0]) : grupo(root, ctx);
  if (ruta === 'vuelta') {
    document.title = 'Tu vuelta · CareLab';
    const caja = h('div', { class: 'ep-sitio' });
    pon(root, migas(['#/cuaderno', 'Tu cuaderno'], 'Tu vuelta'), caja);
    E.vuelta(caja, parts[0]);
    return { destroy: () => E.parar() };
  }
  // #/episodio y #/episodio/<id>
  const ep = ctx.episodios.find(e => e.id === parts[0]) || E.deHoy();
  document.title = `${ep ? ep.palabra + ' · ' : ''}Episodio · CareLab`;
  const caja = h('div', { class: 'ep-sitio' });
  const todos = h('div');
  pon(root,
    migas(['#/', 'Inicio'], 'Episodio'),
    caja,
    h('details', { class: 'ep-todos' }, h('summary', null, `Los ${ctx.episodios.length} episodios`),
      h('p', { class: 'small muted' }, 'Todos están abiertos: haz uno cuando puedas y repítelo si te sirve. Para un grupo, mejor el ', h('a', { href: '#/grupo' }, 'modo grupo'), '.'),
      todos));
  E.abrir(caja, ep && ep.id);
  E.lista(todos, { alAbrir: id => { location.hash = `#/episodio/${encodeURIComponent(id)}`; } });
  return { destroy: () => E.parar() };
}

// Modo grupo: quien acompaña elige un episodio, lo proyecta y el grupo vota sin nombres
function grupo(root, ctx) {
  document.title = 'Para grupos · CareLab';
  const SESION = [
    ['0 a 5', 'La pregunta de entrada', '«¿Cómo vas hoy con el cuidado?», en voz alta y sin nombres: cada persona elige su imagen en un papel, para sí.'],
    ['5 a 20', 'El episodio, proyectado', 'El grupo vota el Reflejo a mano alzada y comenta el Giro. Se cuenta el grupo, nunca a una persona.'],
    ['20 a 35', 'Cada persona, su paso', 'Cada una elige su misión y la escribe con su día. Quien quiera, la dice en voz alta.'],
    ['35 a 45', '¿Mito o dato?', 'Por equipos, con el reto. Se cierra con los recursos de la zona: tened a mano «Dónde pedir ayuda».'],
    ['Siguiente sesión', 'La vuelta', '¿Lo hicisteis?, ¿qué pasó?, ¿mereció la pena? Y un episodio nuevo.'],
  ];
  const lista = primeroLoTuyo(ctx.episodios);
  pon(root,
    cabeza(root, 'Para grupos', 'CareLab funciona mejor **con alguien**. Para quien acompaña a un grupo de personas que cuidan: una asociación de familiares, un grupo de apoyo del centro de salud o la formación de un equipo de cuidados. Con un proyector y sin cuentas.'),
    h('h2', null, 'Una sesión de 45 minutos'),
    h('ol', { class: 'tiempos' }, SESION.map(([min, t, d]) => h('li', null, h('span', { class: 'min' }, min === 'Siguiente sesión' ? min : `${min} min`), h('div', null, h('b', { class: 'leer' }, t), h('p', { class: 'small leer' }, d))))),
    recuadro('cuidado', 'Las reglas del grupo',
      h('ul', null,
        h('li', null, 'Nunca se habla de una persona concreta del grupo ni de la persona que cada una cuida.'),
        h('li', null, 'Contar es siempre voluntario. Nadie tiene que decir su imagen, su misión ni su historia.'),
        h('li', null, 'El episodio no sustituye a nadie: si alguien no puede más, se para y se abre ', h('a', { href: '#/ayuda/ahora' }, 'Necesito ayuda ahora'), '.'))),
    recuadro('aclaracion', 'Lo que no se guarda', 'En modo grupo no se guarda nada en el dispositivo: ni votos, ni misiones, ni historias. El Reflejo no lleva reloj, como en toda la web.'),
    h('h2', null, 'Elige un episodio'),
    h('div', { class: 'grupo-grid' }, lista.map(e => h('article', { class: 'card grupo-card', style: { '--c': `var(--f${e.familia})` } },
      h('div', { class: 'grupo-cab' }, imgFamilia(e.familia), h('div', null, h('h3', null, e.palabra), h('p', { class: 'small muted' }, `${FAMILIAS[e.familia] ? FAMILIAS[e.familia].nombre : ''}${e.perfil === 'trabajo' ? ' · por trabajo' : ''}`))),
      h('p', { class: 'small', html: fmt(e.choque.frase) }),
      h('div', { class: 'btns' },
        h('a', { class: 'btn small primary', href: `#/grupo/${encodeURIComponent(e.id)}` }, '▶ Proyectar'),
        e.ficha ? h('a', { class: 'btn small', href: `#/palabra/${encodeURIComponent(e.ficha)}`, target: '_blank', rel: 'noopener' }, 'Ficha (guion)') : null)))));
}

function proyectar(root, ctx, E, id) {
  const ep = ctx.episodios.find(e => e.id === id);
  if (!ep) { location.replace('#/grupo'); return; }
  document.title = `${ep.palabra} · Modo grupo · CareLab`;
  const caja = h('div', { class: 'ep-sitio' });
  pon(root,
    migas(['#/grupo', 'Para grupos'], ep.palabra),
    caja,
    ep.ficha ? h('p', { class: 'small muted', style: { textAlign: 'center' } }, 'Guion para quien acompaña: ',
      h('a', { href: `#/palabra/${encodeURIComponent(ep.ficha)}`, target: '_blank', rel: 'noopener' }, 'la ficha de la palabra, en otra pestaña'), '.') : null);
  E.abrir(caja, ep.id, { grupo: true });
  return { destroy: () => E.parar() };
}

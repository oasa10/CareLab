// Dónde pedir ayuda (CL8) y «Necesito ayuda ahora» (CL10). Los textos de ayuda son fijos: nunca los escribe una IA.
// Siguen las recomendaciones de Samaritans para servicios digitales y de la OMS para hablar del suicidio:
// tono amable y sin juicio, frases cortas, qué hace y qué no hace CareLab, y ayuda disponible las 24 horas.
import { h, pon, cabeza, recuadro, telLink, TEL, perfil, primeroLoTuyo, fechaLarga, botonEscuchar, textoDe, REPO } from '../lib.js';

const AMBITO = { euskadi: 'Euskadi', bizkaia: 'Bizkaia', gipuzkoa: 'Gipuzkoa', alava: 'Álava', espana: 'España' };
const ORDEN_AMBITO = { euskadi: 0, bizkaia: 1, gipuzkoa: 1, alava: 1, espana: 2 };

export function render(root, ctx, parts) {
  if (parts[0] === 'ahora') return ahora(root, ctx);
  document.title = 'Dónde pedir ayuda · CareLab';
  const R = ctx.recursos || { grupos: [] };
  const SEMAFORO = [
    ['verde', 'Verde', 'Cansancio de todos los días, dudas, ganas de entender.', 'Un episodio y las palabras del cuidar.'],
    ['ambar', 'Ámbar', 'Mucho cansancio, culpa o rabia que no se van, dormir mal, no tener ni un rato.', 'Un solo paso: pregunta por el respiro y a quién pedirlo. Habla con tu médica de familia o con la trabajadora social.'],
    ['rojo', 'Rojo', 'Tristeza o angustia de semanas, la salud que se resiente, un conflicto fuerte en la familia o en el trabajo.', 'Apoyo profesional: centro de salud, psicología o servicios sociales. Si es en el trabajo, también el servicio de prevención.'],
    ['stop', 'Stop', 'Ideas de hacerte daño, miedo de hacer daño a la persona que cuidas, violencia, maltrato o una urgencia.', 'No hay episodio: 112 ante una urgencia; 024 ante ideas de suicidio; 016 ante violencia contra una mujer.'],
  ];
  const k = perfil();
  const grupos = (R.grupos || []).slice();
  // quien cuida por trabajo ve primero sus recursos
  if (k === 'trabajo') grupos.sort((a, b) => (a.id === 'urgencia' ? -2 : a.id === 'trabajo' ? -1 : 0) - (b.id === 'urgencia' ? -2 : b.id === 'trabajo' ? -1 : 0));
  pon(root,
    cabeza(root, 'Dónde pedir ayuda', 'Pedir ayuda no es un fallo: es parte de cuidar. Aquí tienes qué hacer según cómo estés y a quién llamar, **primero en Euskadi** y después en toda España.'),
    h('p', null, h('a', { class: 'btn ayuda-btn grande', href: '#/ayuda/ahora' }, 'Necesito ayuda ahora')),
    h('h2', null, 'Según cómo estés'),
    h('ol', { class: 'semaforo' }, SEMAFORO.map(([c, n, cuando, que]) => h('li', { class: c },
      h('span', { class: 'luz', 'aria-hidden': 'true' }), h('div', null, h('b', { class: 'leer' }, n), h('p', { class: 'leer' }, cuando), h('p', { class: 'que leer' }, que))))),
    ...grupos.map(g => h('section', { class: 'rec-grupo', id: 'g-' + g.id },
      h('h2', null, g.titulo), g.intro ? h('p', { class: 'muted' }, g.intro) : null,
      h('div', { class: 'rec-grid' }, primeroLoTuyo(g.items || []).slice().sort((a, b) => (ORDEN_AMBITO[a.ambito] ?? 3) - (ORDEN_AMBITO[b.ambito] ?? 3)).map(it =>
        h('article', { class: 'card rec' },
          h('p', { class: 'meta' }, AMBITO[it.ambito] || '', it.perfil === 'trabajo' ? ' · por trabajo' : ''),
          h('h3', null, it.nombre),
          it.para ? h('p', { class: 'small' }, it.para) : null,
          it.telefono ? h('p', { class: 'telrow' }, h('a', { class: 'tel', href: 'tel:' + (it.tel || it.telefono.replace(/\D/g, '')) }, it.telefono), it.horario ? h('span', { class: 'small muted' }, it.horario) : null) : (it.horario ? h('p', { class: 'small muted' }, it.horario) : null),
          it.otros ? h('p', { class: 'small' }, it.otros) : null,
          it.nota ? h('p', { class: 'small muted' }, it.nota) : null,
          it.url ? h('p', { class: 'small' }, h('a', { href: it.url, target: '_blank', rel: 'noopener' }, 'Web oficial')) : null))))),
    h('p', { class: 'small muted comprobado' }, R.comprobado ? `Teléfonos y horarios comprobados en las webs oficiales el ${fechaLarga(R.comprobado)}. ` : '', 'Lo que no se pudo confirmar no se publica. Si ves un dato que ha cambiado, ', h('a', { href: `${REPO}/issues/new?title=${encodeURIComponent('Dato que ha cambiado en «Dónde pedir ayuda»')}`, target: '_blank', rel: 'noopener' }, 'avísanos'), '.'),
    recuadro('aclaracion', 'Qué es CareLab y qué no', 'CareLab es una puerta a la ayuda de personas. No es un servicio de emergencias, no es una terapia y no evalúa a nadie. No sustituye a tu médica de familia, a la trabajadora social ni a los servicios de emergencia.'));
}

// La pantalla del Stop: sin método, sin preguntas, sin ejercicio. Solo dónde pedir ayuda, ahora.
function ahora(root, ctx) {
  document.title = 'Necesito ayuda ahora · CareLab';
  const items = ((ctx.recursos && ctx.recursos.grupos) || []).flatMap(g => g.items || []);
  const consejo = items.find(x => /consejo sanitario/i.test(x.nombre || ''));
  const B = (titulo, ...kids) => h('section', { class: 'ya' }, h('h2', { class: 'leer' }, titulo), h('div', { class: 'leer' }, ...kids));
  const c = h('div', { class: 'ahora' });
  pon(c,
    h('header', { class: 'page-head' }, h('div', { class: 'ph-fila' }, h('h1', { class: 'leer' }, 'Si ahora no puedes más'), botonEscuchar(textoDe(c))),
      h('p', { class: 'lead leer' }, 'Has hecho bien en pararte. Aquí no hay ejercicio ni preguntas: solo a quién llamar, ahora.')),
    B('Si hay una urgencia, o alguien corre peligro', h('p', null, 'También si el peligro es para ti o para la persona que cuidas. Llama al ', telLink(112, 'tel grande'), '.'), h('p', { class: 'small muted' }, TEL[112].h + '.')),
    B('Si piensas en quitarte la vida, o te preocupa alguien cercano', h('p', null, 'Llama al ', telLink('024', 'tel grande'), '. Te escucha una persona.'), h('p', { class: 'small muted' }, TEL['024'].h + '.')),
    B('Si temes perder el control con la persona que cuidas, o ella te hace daño', h('p', null, 'No tienes que pasarlo a solas. Es una señal para pedir apoyo, no un fallo tuyo. Si hay peligro, ', telLink(112), '. Si no, habla hoy con tu médica de familia o con los servicios sociales de tu ayuntamiento.')),
    B('Si sufres violencia por ser mujer', h('p', null, 'Llama al ', telLink('016', 'tel grande'), '.'), h('p', { class: 'small muted' }, TEL['016'].h + '.')),
    B('Si eres menor de edad y cuidas de alguien', h('p', null, 'Llama a la Fundación ANAR: ', telLink('anar', 'tel grande'), '.'), h('p', { class: 'small muted' }, TEL.anar.h + '.')),
    B('Si no es una urgencia, pero no puedes más', h('p', null, 'Pide cita en tu centro de salud y dilo así: «No puedo más con el cuidado». Es motivo de consulta.'),
      consejo && consejo.telefono ? h('p', null, `En Euskadi, ${consejo.nombre}: `, h('a', { class: 'tel', href: 'tel:' + (consejo.tel || consejo.telefono.replace(/\D/g, '')) }, consejo.telefono), consejo.horario ? `, ${consejo.horario.toLowerCase()}.` : '.') : null),
    h('p', { class: 'small muted ahora-pie' }, 'CareLab no es un servicio de emergencias ni una terapia, y no evalúa a nadie. Esta pantalla es fija: no la escribe una inteligencia artificial.'),
    h('p', null, h('a', { href: '#/ayuda' }, 'Ver todos los recursos y servicios →')));
  pon(root, c);
}

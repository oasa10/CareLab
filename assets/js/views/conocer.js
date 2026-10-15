// Conocer CareLab (CL15, CL16, CL21, CL22): qué es y qué no, por qué está hecha así, los frenos, las capas,
// la privacidad, quién la hace, cómo citarla, las fuentes y la licencia.
import { h, pon, fmt, cabeza, recuadro, PROMESA, FIRMA, AUTORIA, VERSION, URL_BASE, REPO } from '../lib.js';

const P = t => h('p', { class: 'leer', html: fmt(t) });

export function render(root, ctx) {
  document.title = 'Conocer CareLab';
  const sec = (id, t, ...kids) => h('section', { id, class: 'conocer-sec' }, h('h2', null, t), ...kids);
  const indice = [['que-es', 'Qué es y qué no'], ['para-quien', 'Para quién'], ['evidencia', 'Por qué es así'], ['chat', 'Frente a un chat'], ['frenos', 'Los frenos'],
    ['capas', 'Ética, IA y entorno'], ['no-hace', 'Lo que no hace'], ['privacidad', 'Privacidad y accesibilidad'], ['quien', 'Quién la hace'], ['citar', 'Cómo citar'], ['licencia', 'Fuentes y licencia']];
  const tabla = (cab, filas) => h('div', { class: 'tabla-scroll' }, h('table', { class: 'tabla' }, h('thead', null, h('tr', null, cab.map(c => h('th', null, c)))),
    h('tbody', null, filas.map(f => h('tr', null, f.map(c => h('td', { html: fmt(c) })))))));

  pon(root,
    cabeza(root, 'Conocer CareLab', `${PROMESA} ${FIRMA}.`),
    h('nav', { class: 'indice', 'aria-label': 'En esta página' }, indice.map(([id, t]) => h('a', { href: `#/conocer`, onclick: ev => { ev.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); } }, t))),

    sec('que-es', 'Qué es y qué no',
      P('CareLab es una web **gratuita, sin registro y sin datos** para personas que cuidan. Se entra por un episodio de unos siete minutos que termina en una acción pequeña, para ti y fuera de la pantalla. Debajo están las palabras del cuidar, dónde pedir ayuda, los trámites básicos y un modo para grupos.'),
      recuadro('atencion', 'Lo que no es', 'CareLab no es una terapia, no evalúa a nadie y no sustituye a la médica de familia, a la trabajadora social ni a los servicios de emergencia. Es una puerta a la ayuda de personas.')),

    sec('para-quien', 'Para quién',
      P('Para quien cuida a alguien de su familia o de su entorno, y para quien cuida por trabajo: gerocultoras, auxiliares de ayuda a domicilio, trabajadoras del hogar, internas y enfermería. Comparten casi todo (el cansancio, la culpa, no llegar, no poder parar) y se diferencian en algunas palabras y en los recursos. Por eso hay una sola entrada y una pregunta dentro: «¿A quién cuidas?».'),
      h('p', { class: 'leer' }, 'Y para quien ', h('b', null, 'acompaña'), ' a personas que cuidan: una asociación de familiares, un grupo de apoyo del centro de salud, una trabajadora social o la formación de un equipo de cuidados. Para ellas está el ', h('a', { href: '#/grupo' }, 'modo grupo'), '.'),
      P('CareLab empieza en **Euskadi**: sus recursos van primero, y después los de toda España. Es gratuita y abierta, y a partir de ella se pueden hacer versiones propias para una residencia, un servicio o una asociación.')),

    sec('evidencia', 'Por qué es así',
      P('CareLab no es la primera web para personas que cuidan, y lo que pasó con las anteriores decide cómo está hecha.'),
      h('ul', { class: 'lista-ev' },
        h('li', { html: fmt('**Sola, una web ayuda poco.** Los programas a distancia para cuidadoras de personas con demencia, comparados con la atención habitual, apenas cambiaron la carga o la depresión (González-Fraile et al., 2021). Y muchas personas los usaron muy poco (Windle et al., 2025).') }),
        h('li', { html: fmt('**Con alguien, funciona mejor.** Cuando hay una persona que acompaña, un grupo o algo de personalización, los efectos crecen y el abandono baja (Atefi et al., 2024; Xiao et al., 2024). Por eso el modo grupo es el uso principal.') }),
        h('li', { html: fmt('**Corto y completo.** Los programas breves funcionan igual o mejor que los largos (Liang et al., 2026), y una sola sesión ya tiene un efecto pequeño pero real (Schleider et al., 2025). Cada episodio sirve aunque no vuelvas.') }),
        h('li', { html: fmt('**Los puntos no suman; las historias, sí.** En las aplicaciones de salud mental, puntos, rachas e insignias no mejoran ni el efecto ni la constancia (Six et al., 2021). Una historia bien contada ayudó a cuidadoras más que un folleto (Gallagher-Thompson et al., 2015).') }))),

    sec('chat', 'Frente a un chat',
      P('Una conversación con una inteligencia artificial puede dar información y compañía. CareLab da cinco cosas que un chat no garantiza:'),
      tabla(['CareLab', 'Qué quiere decir'], [
        ['**Un camino**', 'Cada episodio termina en una acción pequeña con su día y una vuelta para contar cómo fue.'],
        ['**Datos comprobados**', 'Cada hecho lleva su fuente, y lo que no se confirma no se publica.'],
        ['**Recursos de aquí**', 'Teléfonos y servicios de Euskadi y de España, comprobados en sus webs oficiales.'],
        ['**Nada guardado fuera**', 'Lo que haces se queda en tu dispositivo.'],
        ['**Un freno**', 'Cuando hace falta, te manda a una persona: «Necesito ayuda ahora» está en todas las pantallas.'],
      ])),

    sec('frenos', 'Los frenos',
      P('Quien cuida ya vive con prisa. CareLab lleva más frenos que ninguna otra web del proyecto:'),
      tabla(['Lo que no hay', 'Por qué'], [
        ['**Reloj**', 'Ninguna decisión tiene cuenta atrás.'],
        ['**Puntos, rachas e insignias**', 'Con este público no ayudan y pueden echar. Tus pasos van al cuaderno, sin contar nada.'],
        ['**Avisos**', 'CareLab no te escribe ni te manda notificaciones. Vuelves cuando puedes.'],
        ['**Un episodio al día**', 'Todos están abiertos: uno cuando puedas.'],
        ['**El error a la vista**', 'En las preguntas se marca la respuesta, no a quien falla.'],
        ['**Culpa**', 'Nunca se culpa a quien cuida. Si falta un recurso, se dice que falta.'],
        ['**Sonidos y vibración**', 'Solo «Escuchar», y se apaga cuando quieras.'],
      ])),

    sec('capas', 'Ética, IA y entorno',
      h('ul', { class: 'lista-ev' },
        h('li', { html: fmt('**Ética: ¿para quién y quién paga?** El cuidado lo sostienen sobre todo mujeres, muchas veces sin sueldo o con sueldos bajos, y cada vez más mujeres migrantes. Preguntar quién paga los costes del cuidado es parte de CareLab.') }),
        h('li', { html: fmt('**IA: ¿con qué ayuda?** CareLab no usa inteligencia artificial: ni en la web ni en los textos de ayuda, que son fijos. Si algún día tiene un asistente, dirá que es una IA, no evaluará riesgos ni atenderá crisis, no dará consejo clínico, no buscará que vuelvas, no guardará lo que le cuentes y no prometerá lo que no se ha demostrado.') }),
        h('li', { html: fmt('**Entorno: ¿dónde y con qué?** Los servicios, la familia, el trabajo, la casa y el dinero. **La falta de recursos no se carga a quien cuida**: si no hay plaza en el centro de día, eso no es un fallo de organización personal.') }))),

    sec('no-hace', 'Lo que no hace',
      tabla(['No hace', 'Lo que hace en su lugar'], [
        ['Decirte que tienes «el síndrome» o que estás «quemada»', 'Describir lo que te pasa con palabras comunes y, si hay señales, llevarte a tu médica de familia'],
        ['Ponerte una puntuación', 'Una pregunta de imágenes que lee cómo va tu día, no cómo eres'],
        ['Hablar de la persona cuidada como «una carga»', 'Hablar de lo que pesa el cuidado'],
        ['Convertir el autocuidado en otra obligación', 'Una acción pequeña, elegida y con su vuelta'],
        ['Responder al desgaste en el trabajo solo con «resiliencia»', 'Nombrar las condiciones de trabajo y los recursos laborales'],
        ['Alarmar', 'Cada cifra con su población y su fuente, y también lo que cuidar da'],
        ['Contar la historia real de nadie', 'Escenas inventadas o compuestas'],
      ])),

    sec('privacidad', 'Privacidad y accesibilidad',
      P('**Sin registro, sin cookies, sin analítica** y sin nada que salga de tu dispositivo. Tu cuaderno y tus respuestas se guardan solo en tu navegador, y puedes borrarlos cuando quieras.'),
      P('**Para leer mejor:** contraste alto, «Lo básico» en lectura fácil, navegación con teclado, textos alternativos, el botón «Escuchar» en todas las pantallas (usa la voz de tu dispositivo) y una letra grande con el botón «Aa». También funciona en modo oscuro.')),

    sec('quien', 'Quién la hace',
      h('p', { class: 'leer' }, 'Idea y dirección: ', h('b', null, 'Osman Salazar'), '. Hecha con el Método BrainBox. CareLab es hermana de ',
        h('a', { href: 'https://oasa10.github.io/PostLab/', target: '_blank', rel: 'noopener' }, 'PostLab'), ' y de ',
        h('a', { href: 'https://oasa10.github.io/NeuroLab/', target: '_blank', rel: 'noopener' }, 'NeuroLab'), '.'),
      P('Las pantallas de ayuda siguen las recomendaciones de Samaritans para servicios digitales y de la OMS para hablar del suicidio. Antes de usarse con grupos, las revisa una profesional de la salud mental.')),

    sec('citar', 'Cómo citar',
      h('p', { class: 'cita' }, `${AUTORIA}. CareLab. Cuidar sin desaparecer. Versión ${VERSION}. Con el Método BrainBox. ${URL_BASE}`)),

    sec('licencia', 'Fuentes y licencia',
      P('Cada palabra, episodio, frase del reto y recurso lleva su fuente. Los datos se pueden descargar:'),
      h('ul', { class: 'descargas' }, ['episodios', 'palabras', 'mitos', 'recursos', 'tramites'].map(n => h('li', null, h('a', { href: `data/${n}.json`, download: '' }, `${n}.json`)))),
      P('Los contenidos se publican con licencia **CC BY 4.0**: puedes usarlos y adaptarlos citando la fuente. El código, con licencia **MIT**.'),
      h('p', { class: 'small' }, h('a', { href: REPO, target: '_blank', rel: 'noopener' }, 'El repositorio de CareLab en GitHub')),
      h('h3', null, 'Versiones'),
      h('ul', null, h('li', { html: fmt(`**${VERSION}**, 15 de octubre de 2026. «Escuchar» nuevo: lee párrafo a párrafo, con pausas y marcando lo que suena; eliges la voz (las más naturales primero) y la velocidad, y puedes ir al párrafo anterior o al siguiente, pausar y parar.`) }), h('li', { html: fmt(`**1.0 (beta)**, octubre de 2026. La primera: 20 episodios, ${ctx.palabras.length} palabras, ${ctx.mitos.length} frases del reto, los recursos de Euskadi y de España, los trámites básicos y el modo grupo.`) }))));
}

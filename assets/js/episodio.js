// El episodio de CareLab con el motor común (assets/vendor/episodio). Con más frenos que en ninguna otra web (CL10):
// sin reloj, sin sonido, sin rachas ni marcadores, el error sin marcar y un episodio cuando puedas, no uno al día.
import { storage, perfil, ponerPerfil, PERFILES, ESTADOS, fechaHoy } from './lib.js';

let motor = null;

// «¿Cómo vas hoy con el cuidado?» se guarda solo para hoy; «Hoy no puedo más» no se guarda: lleva a la ayuda
const llegadaHoy = () => { const x = storage('llegada'); return x && x.dia === fechaHoy() ? x.k : null; };

export function obtener(ctx) {
  if (motor) return motor;
  motor = window.Episodio.crear({
    sitio: 'carelab', nombre: 'CareLab', episodios: ctx.episodios,
    porDentro: false, grupo: true, demo: true, unoAlDia: false, minutos: 7,
    reloj: false, sonido: false, marcadores: false, errorVisible: false,
    textoMision: 'Elige una, para ti y fuera de la pantalla. Pequeña, con su día y su vuelta.',
    ayuda: '<a href="#/ayuda/ahora">Necesito ayuda ahora</a> · <a href="#/ayuda">Dónde pedir ayuda</a>',
    // quien cuida por trabajo ve primero sus cinco episodios
    ordenar: lista => (perfil() === 'trabajo' ? lista.filter(e => e.perfil === 'trabajo').concat(lista.filter(e => e.perfil !== 'trabajo')) : lista),
    perfil: {
      pregunta: '¿A quién cuidas?',
      ayuda: 'Cambia los ejemplos, el orden y los recursos. La experiencia es la misma.',
      opciones: Object.entries(PERFILES).map(([id, x]) => ({ id, t: x.t })),
      hoy: () => perfil(),
      elegir: k => ponerPerfil(k),
    },
    llegada: {
      pregunta: '¿Cómo vas hoy con el cuidado?',
      ayuda: 'Elige la imagen que más se parezca a tu día. No es un test ni una puntuación.',
      opciones: Object.entries(ESTADOS).map(([id, x]) => ({ id, t: x.t, s: x.s, img: x.img, salir: !!x.salir })),
      corta: 'C',
      rutas: { A: ESTADOS.A.ruta, B: ESTADOS.B.ruta },
      hoy: llegadaHoy,
      elegir: k => {
        if (ESTADOS[k] && ESTADOS[k].salir) { location.hash = '#/ayuda/ahora'; return; }
        storage('llegada', { dia: fechaHoy(), k });
      },
      cuidado: 'Si hoy no puedes más, no hace falta ningún ejercicio: <a href="#/ayuda/ahora">Necesito ayuda ahora</a>. Ante un peligro, 112; ante ideas de suicidio, 024.',
    },
    alSalir: ep => {
      const q = new URLSearchParams(location.hash.split('?')[1] || '');
      if (location.hash.startsWith('#/grupo')) location.hash = '#/grupo';
      else if (location.hash.startsWith('#/vuelta')) location.hash = '#/cuaderno';
      else if (ep && ep.ficha && !q.get('volver')) location.hash = `#/palabra/${encodeURIComponent(ep.ficha)}?tras=episodio`;
      else location.hash = '#/';
    },
  });
  return motor;
}

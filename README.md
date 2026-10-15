# CareLab

**Cuidas de alguien. CareLab te ayuda a que cuidar no te borre.**

*Cuidar sin desaparecer.*

Web: https://oasa10.github.io/CareLab/

CareLab es una web gratuita, sin registro y sin datos para personas que cuidan: a alguien de su familia o de su entorno, o por trabajo (gerocultoras, auxiliares de ayuda a domicilio, trabajadoras del hogar, internas y enfermería). Empieza en Euskadi y sirve para toda España.

CareLab no es una terapia, no evalúa a nadie y no es un servicio de emergencias. Si hay un peligro ahora: 112. Si piensas en hacerte daño: 024 (gratuito, a cualquier hora). En la web, el botón **Necesito ayuda ahora** está en todas las pantallas.

## Qué hay dentro

Se entra por **un episodio** de unos siete minutos (Choque, Reflejo, Giro, Peldaño, Misión, Tu historia y Vuelta) que termina en una acción pequeña, para ti y fuera de la pantalla. Antes de empezar, dos preguntas: **¿A quién cuidas?** (una sola vez; cambia los ejemplos y el orden) y **¿Cómo vas hoy con el cuidado?**, con cuatro imágenes. Si vas pedaleando sin avanzar, el episodio se acorta a una pregunta y una acción; si hoy no puedes más, CareLab no te da un ejercicio: te lleva a quién llamar.

Hay veinte episodios, todos abiertos. Debajo están:

- **Las palabras del cuidar** (`#/palabras`): cincuenta fichas en lectura fácil, en seis familias, con qué es, cómo se nota, qué no es, una acción mínima y sus fuentes.
- **Dónde pedir ayuda** (`#/ayuda`): qué hacer según cómo estés y a quién llamar, primero en Euskadi y después en España. La pantalla **Necesito ayuda ahora** (`#/ayuda/ahora`) es fija: no la escribe ninguna inteligencia artificial.
- **Trámites básicos** (`#/tramites`): la dependencia, el respiro y los derechos de quien cuida, con sus enlaces oficiales.
- **Para grupos** (`#/grupo`): el uso principal. Quien acompaña a un grupo de personas que cuidan proyecta un episodio en una sesión de 45 minutos. En modo grupo no se guarda nada.
- **¿Mito o dato?** (`#/reto`): frases que se dicen sobre cuidar, con su respuesta y su fuente. Sin puntos.
- **Tu cuaderno** (`#/cuaderno`): tus misiones, vueltas, historias y acciones, solo en tu dispositivo. Se puede imprimir.

CareLab lleva frenos a propósito: sin reloj, sin sonidos, sin puntos ni rachas, sin avisos y sin marcar el error. Cada pantalla tiene **Escuchar** (la voz del dispositivo) y un botón **Aa** para la letra grande.

## Cómo está hecho

- Sitio estático sin compilar: `index.html`, `assets/js/main.js` (rutas `#/…`), `lib.js`, `episodio.js` y una vista por sección en `assets/js/views/`. El episodio usa un motor común a las webs del proyecto, sin dependencias, en `assets/vendor/episodio/`.
- Datos en `data/`: `episodios.json`, `palabras.json`, `recursos.json`, `tramites.json` y `mitos.json`. Cada hecho lleva su fuente; los teléfonos y recursos se comprobaron en sus webs oficiales, con la fecha en `recursos.json`.
- El cuaderno, tus respuestas, el tema y la letra se guardan solo en tu navegador (`localStorage`). Sin cookies, analítica ni llamadas a terceros.
- Sin servidor ni conexión, la web entera cabe en un solo archivo que se abre con doble clic: `python3 tools/build_html.py` crea `dist/CareLab.html`.
- Webs hermanas: [PostLab](https://oasa10.github.io/PostLab/) y [NeuroLab](https://oasa10.github.io/NeuroLab/).

Hecha con el Método BrainBox.

## Versiones

- **1.0.1 (beta)** (15 de octubre de 2026): «Escuchar» nuevo, con el Lector común: lee párrafo a párrafo, con pausas y marcando lo que suena; eliges la voz (las más naturales primero) y la velocidad, y puedes ir al párrafo anterior o al siguiente, pausar y parar.
- **1.0 (beta)** (octubre de 2026): la primera. Veinte episodios, cincuenta palabras, el reto, los recursos de Euskadi y de España, los trámites básicos, el modo grupo y el HTML de doble clic.

## Cómo citar

Salazar, Osman (2026). *CareLab. Cuidar sin desaparecer*. Versión 1.0 (beta). Con el Método BrainBox. https://oasa10.github.io/CareLab/

## Licencias

Datos y textos: [CC BY 4.0](data/LICENCIA.md). Código: [MIT](LICENSE), también el del motor del episodio. Tipografías Inter y Fraunces: SIL Open Font License.

## Errores

Si un teléfono, un recurso o un dato está mal o ha cambiado, abre una incidencia en este repositorio y añade la fuente.

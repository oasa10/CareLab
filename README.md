# CareLab 2.0 · Cuidar sin desaparecer

Un espacio para hacer visible, organizar y compartir la carga total de cuidar, con el Método BrainBox 1.2 y el proyecto MEPRE.

**Web:** https://oasa10.github.io/CareLab/

## Qué permite hacer

- Preparar un episodio BrainBox mediante siete momentos accesibles, cuatro ejes y cinco pasos del método: situar, comprender/elegir, preparar, hacer/observar, revisar/decidir. Acción mínima viable y retorno preparados antes de actuar.
- Trabajar con un mapa personal de ocho dimensiones, nueve herramientas, acciones, propuestas de reparto, apoyos y revisiones. Un registro no acredita aceptación por otras personas.
- Aprender haciendo con 12 módulos y 36 unidades, sin bloqueos, rachas ni obligación de completarlas en orden.
- Consultar 1.087 fichas integradas: Cuidopedia (550), CareTools (276), Cuidoteca (190), Cuidosfera (17) y guías transversales (54).
- Elegir una necesidad y recibir una propuesta práctica y hasta dos recursos. Catálogo multimedia de 26 referencias; meditación y contextos específicos requieren selección expresa.
- Escuchar tres narraciones mediante voces locales, dos piezas instrumentales con licencia CC BY 4.0, ver un tutorial original con subtítulos y abrir archivos audiovisuales del propio dispositivo.
- Cambiar entre claro, sistema y oscuro en cualquier pantalla; ampliar texto y reducir movimiento.
- Usar una sesión temporal o activar guardado local, exportar/restaurar una copia validada y preparar el acceso sin conexión. La música se descarga aparte (12 MB).
- Enviar una sugerencia breve a un buzón privado sin adjuntar el espacio personal. No pide registro ni correo. El navegador sólo conoce la dirección pública de recepción, nunca credenciales ni una dirección de correo del equipo. La lectura de sugerencias queda restringida al propietario mediante las herramientas de Sites; no hay lectura pública.

## Límites y privacidad

Es una prueba de concepto funcional para pilotaje. La trazabilidad documental y las pruebas de software no demuestran eficacia clínica ni reducción de carga. BrainBox se detiene ante riesgo o ante una situación médica, psicológica o legal, para solicitar ayuda competente. Esto no implica interrumpir cuidados ordinarios o indicaciones profesionales.

No hay cuentas de cuidadores, sincronización, diagnóstico, IA conversacional ni invitaciones automáticas a otras personas. Las notas permanecen en el dispositivo. El guardado local y los archivos exportados no están cifrados. El alojamiento recibe solicitudes técnicas; los sitios externos tienen sus propias condiciones. El envío voluntario de una sugerencia es un flujo separado: sólo categoría y texto, sin adjuntar planes o notas. El buzón añade fecha, referencia e información de integridad y protege la escritura mediante contadores temporales de abuso. No envía correos. Los comentarios se conservan hasta que el propietario los elimina; su referencia permite solicitarlo.

La biblioteca conserva fuentes y límites de acceso. No redistribuye íntegramente obras ajenas ni instrumentos profesionales restringidos. Los enlaces heredados del corpus no equivalen a una revisión de disponibilidad de cada destino el día de uso.

## Ejecutar y mantener

La aplicación funciona sin compilación ni dependencias de producción. Sirve esta carpeta por HTTP y abre la dirección local; no uses `file://` para los módulos y el acceso sin conexión.

```sh
python3 -m http.server 8765 --bind 127.0.0.1
node tools/verify.mjs
node --test tests/*.test.mjs
```

Los módulos activos están en `assets/v2/`, el corpus en `data/biblioteca.json` y el programa en `data/programa.json`. `sw.js` sólo conserva archivos públicos; nunca guarda el espacio personal. Instala una versión completa antes de sustituir el núcleo anterior.

`tools/build_biblioteca.py` y `tools/build_programa.py` materializan las fuentes locales autorizadas. Necesitan el corpus original del proyecto, que no se duplica íntegramente en este repositorio. La comprobación continua de GitHub valida sintaxis, integridad del catálogo, referencias y pruebas de restauración.

Los archivos anteriores de `assets/js/` y datos 1.x se conservan para trazabilidad y no se cargan desde el nuevo `index.html`. `tools/build_html.py` pertenece a 1.x: su archivo único no representa CareLab 2.0. Las copias de 1.x no se importan como si fueran del nuevo esquema.

## Licencias y atribución

Código: [MIT](LICENSE). Contenido original del proyecto: [CC BY 4.0](data/LICENCIA.md). Inter y Fraunces: SIL Open Font License. Materiales externos, marcas y cuestionarios conservan sus condiciones.

Música incorporada: **Meditation Impromptu 02** y **Luminous Rain**, de Kevin MacLeod (Incompetech), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), archivos originales sin modificar. Créditos, procedencia, tamaño y huellas de integridad en `assets/audio/manifest.json` y en el reproductor. No se distribuyen grabaciones de voces del sistema.

Salazar, Osman (2026). *CareLab. Cuidar sin desaparecer*. Versión 2.0, prueba de concepto. Con el Método BrainBox 1.2. https://oasa10.github.io/CareLab/

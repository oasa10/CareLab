# CareLab 3.0.1 · Cuidar sin desaparecer

Un espacio para hacer visible, organizar y compartir la carga total de cuidar, con el Método BrainBox 1.2 y el proyecto MEPRE.

**Web:** https://oasa10.github.io/CareLab/

## Qué permite hacer

- Entrar por una escena cotidiana: pedir relevo, compartir carga mental, hacer sitio para uno mismo o poner un límite. Separar emoción, reacción y pensamiento; contrastar ejemplos con respuesta explicada; subir o bajar por la escalera del saber; ensayar una petición y adaptar una acción viable.
- Preparar el retorno antes de actuar y volver con lo sucedido, incluido «no pude», «no lo vimos» o «prefiero no contarlo». Revisar costes, atribución, ciclos y relato sin inventar resultados ni clasificar personas. El episodio BrainBox abierto y todos sus instrumentos siguen disponibles en «Profundizar».
- Llegar mediante tres pantallas de bienvenida; elegir un camino breve o detenerse en una ventana de naturaleza con sonido opcional. Tres entradas principales: Ahora, Mi camino y Explorar. Las prestaciones aparecen por contexto.
- Trabajar con un mapa personal de ocho dimensiones, nueve herramientas, acciones, propuestas de reparto, apoyos y revisiones. Un registro no acredita aceptación por otras personas.
- Aprender haciendo con 12 módulos y 36 unidades, sin bloqueos, rachas ni obligación de completarlas en orden.
- Consultar 1.087 fichas integradas: Cuidopedia (550), CareTools (276), Cuidoteca (190), Cuidosfera (17) y guías transversales (54).
- Elegir una necesidad y recibir una propuesta práctica y hasta dos recursos. Catálogo multimedia de 26 referencias; meditación y contextos específicos requieren selección expresa.
- Escuchar tres narraciones mediante voces locales, dos piezas instrumentales con licencia CC BY 4.0, ver un tutorial original con subtítulos y abrir archivos audiovisuales del propio dispositivo.
- Cambiar entre claro, sistema y oscuro en cualquier pantalla; ampliar texto y reducir movimiento.
- Conservar cada interacción y los borradores en la pestaña, también tras recargar; activar guardado en el dispositivo para volver después. Recuperar copias v2, exportar/restaurar y preparar acceso sin conexión. Los fallos de almacenamiento se informan: no se garantiza recuperación si el navegador impide guardar. La música se descarga aparte (12 MB).
- Enviar una sugerencia breve a un buzón privado sin adjuntar el espacio personal. No pide registro ni correo. El navegador sólo conoce la dirección pública de recepción, nunca credenciales ni una dirección de correo del equipo. La lectura de sugerencias queda restringida al propietario mediante las herramientas de Sites; no hay lectura pública.

## Límites y privacidad

Es una prueba de concepto funcional para pilotaje. La trazabilidad documental y las pruebas de software no demuestran eficacia clínica ni reducción de carga. BrainBox se detiene ante riesgo o ante una situación médica, psicológica o legal, para solicitar ayuda competente. Esto no implica interrumpir cuidados ordinarios o indicaciones profesionales.

No hay cuentas de cuidadores, sincronización, diagnóstico, IA conversacional ni invitaciones automáticas a otras personas. Algunas expresiones explícitas de peligro abren una comprobación local de seguridad: se puede descartar si no describe una urgencia actual. No es vigilancia ni detección fiable de todas las crisis; no avisa a terceros ni infiere ubicación. «Ayuda» está siempre disponible. Las notas permanecen en el dispositivo. El guardado local y los archivos exportados no están cifrados. El alojamiento recibe solicitudes técnicas; los sitios externos tienen sus propias condiciones. El envío voluntario de una sugerencia es un flujo separado: sólo categoría y texto, sin adjuntar planes o notas. El buzón añade fecha, referencia e información de integridad y protege la escritura mediante contadores temporales de abuso. No envía correos. Los comentarios se conservan hasta que el propietario los elimina; su referencia permite solicitarlo.

La biblioteca conserva fuentes y límites de acceso. No redistribuye íntegramente obras ajenas ni instrumentos profesionales restringidos. Los enlaces heredados del corpus no equivalen a una revisión de disponibilidad de cada destino el día de uso.

## Ejecutar y mantener

La aplicación funciona sin compilación ni dependencias de producción. Sirve esta carpeta por HTTP y abre la dirección local; no uses `file://` para los módulos y el acceso sin conexión.

```sh
python3 -m http.server 8765 --bind 127.0.0.1
node tools/verify.mjs
node --test tests/*.test.mjs
```

Los módulos activos están en `assets/v2/` y `assets/v3/`, el corpus en `data/biblioteca.json` y el programa en `data/programa.json`. `sw.js` sólo conserva archivos públicos; nunca guarda el espacio personal. Instala una versión completa antes de sustituir el núcleo anterior.

`tools/build_biblioteca.py` y `tools/build_programa.py` materializan las fuentes locales autorizadas. Necesitan el corpus original del proyecto, que no se duplica íntegramente en este repositorio. En la Metaestructura Maestra buscan `mepre-ubicaciones.json` en los directorios superiores. También admiten `--locations REGISTRO`, la variable `MEPRE_LOCATIONS` o una raíz de corpus explícita. Las rutas físicas se resuelven únicamente durante la construcción; no se incorporan al navegador. Los localizadores de fuentes como `caretools/registros/datos_integrados.json` son identidades lógicas estables, no enlaces a carpetas privadas. El registro maestro mantiene su correspondencia con la ubicación física actual. El mapa exacto de migración tiene prioridad; después se aplica el prefijo coincidente más largo. Los alias absolutos de originales externos pertenecen al registro privado y no se admiten como entradas del constructor público.

```sh
python3 tools/build_biblioteca.py --locations /ruta/al/mepre-ubicaciones.json
python3 tools/build_programa.py --locations /ruta/al/mepre-ubicaciones.json
python3 tests/corpus_locations_test.py
```

Ambos generadores admiten `--output ARCHIVO` para reconstruir en una carpeta de comprobación y comparar antes de sustituir los datos. Requieren Python 3.10 o posterior. La comprobación continua de GitHub valida sintaxis, integridad del catálogo, referencias, restauración y resolución portable con un corpus ficticio; nunca necesita las fuentes privadas.

El directorio `app` es la única raíz publicable de este producto. La operación del buzón, documentos fuente, registros maestros, copias de seguridad y resultados de pruebas permanecen fuera de él. Mover esta carpeta no altera la web ya publicada. Actualizar contenido sí exige reconstruir, comprobar y preparar la versión completa antes de publicar.

Los archivos anteriores de `assets/js/` y datos 1.x se conservan para trazabilidad y no se cargan desde el nuevo `index.html`. `tools/build_html.py` pertenece a 1.x: su archivo único no representa CareLab 3.0. Las copias de 1.x no se importan como si fueran del nuevo esquema.

## Licencias y atribución

Código: [MIT](LICENSE). Contenido original del proyecto: [CC BY 4.0](data/LICENCIA.md). Inter y Fraunces: SIL Open Font License. Materiales externos, marcas y cuestionarios conservan sus condiciones.

Música incorporada: **Meditation Impromptu 02** y **Luminous Rain**, de Kevin MacLeod (Incompetech), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), archivos originales sin modificar. Créditos, procedencia, tamaño y huellas de integridad en `assets/audio/manifest.json` y en el reproductor. No se distribuyen grabaciones de voces del sistema.

La ventana de naturaleza es una imagen original generada para CareLab. No es una fotografía de un lugar identificado. Procedencia, prompt y huella en `assets/v3/images/manifest.json`. Las referencias estéticas Portal, WindowSwap y A Soft Murmur se usaron como orientación de amplitud, naturaleza y control voluntario; no se copiaron sus imágenes, grabaciones ni código.

Salazar, Osman (2026). _CareLab. Cuidar sin desaparecer_. Versión 3.0, prueba de concepto. Con el Método BrainBox 1.2. https://oasa10.github.io/CareLab/

## Actualización de compatibilidad 3.0.1

Conecta los generadores con el registro de ubicaciones de la Metaestructura Maestra y actualiza las fichas CareLab de Cuidopedia (D099) y CareTools (D049) a su edición publicada 3.0. Conserva los 1.087 identificadores de la biblioteca, las 36 unidades, los recorridos y los datos personales. La caché recibe una nueva edición para incorporar la biblioteca completa de forma atómica. Esta revisión documental y técnica no añade evidencia de eficacia.

# Episodio en siete tiempos · motor común

Motor sin dependencias y sin servidor que usan las webs del proyecto (BrainBox, PostLab, NeuroLab, CareLab…). Versión 1.1. Funciona también dentro de un HTML de doble clic. Todo se guarda solo en el dispositivo (`localStorage`, claves `<sitio>:episodios` —o `cfg.clave`— y `<sitio>:ajustes-episodio`). La clave del cuaderno del episodio va aparte de la del cuaderno de la web; si encuentra datos del episodio en la antigua `<sitio>:cuaderno`, los copia una vez a la nueva sin borrar nada.

## Uso

```html
<link rel="stylesheet" href="episodio.css">
<script src="episodio.js"></script>
<script>
  const ep = Episodio.crear({ sitio: 'postlab', nombre: 'PostLab', episodios: LISTA,
    porDentro: false, grupo: true, demo: true, unoAlDia: true, minutos: 7, alSalir: ep => {} });
  ep.portada(el, { boton, alAbrir, alVolver });   // la puerta: el episodio de hoy y la vuelta pendiente
  ep.abrir(el, id);                               // un episodio; con { grupo: true }, en modo grupo y sin guardar nada
  ep.vuelta(el, idMision);                        // contar cómo fue la misión
  ep.lista(el, { alAbrir });  ep.cuaderno(el, { alVolver, alAbrir });
</script>
```

En modo grupo quien guía puede abrir cualquier episodio, aunque no sea el del día, y no se guarda nada personal.

**La pregunta de llegada (opcional).** Con `llegada: { pregunta, ayuda, opciones: [{ id, t, s }], corta: 'C', hoy: () => id | null, elegir: id => {}, cuidado: '<html>' }`, antes del episodio se pregunta cómo llega la persona (si `hoy()` aún no lo sabe). Si elige la opción `corta` y el episodio tiene `corto`, recibe la versión corta: una pregunta y una acción pequeña, que puede apuntar en su cuaderno con vuelta a tres días, y un botón para ver el episodio completo. `cuidado` es una línea fija al pie de esa versión (por ejemplo, el 024 y el 112). En modo grupo no se pregunta.

**Los frenos (1.1, opcionales).** Todo viene encendido, como en 1.0. `reloj: false` quita la cuenta atrás del Reflejo y su ajuste; `sonido: false` quita los sonidos y su ajuste; `marcadores: false` quita aciertos, palabras ganadas y cuentas (en la portada, el resultado y el cuaderno); `errorVisible: false` no marca la respuesta equivocada: marca la elegida y da la buena. Con `unoAlDia: false` todos los episodios están abiertos. `textoMision` cambia la frase de la Misión y `ayuda` (html) se añade al aviso de un episodio (por ejemplo, el enlace a «Necesito ayuda ahora»).

**El orden y el perfil (1.1, opcionales).** `ordenar: lista => lista` decide el orden de los episodios (el de hoy y la lista). Con `perfil: { pregunta, ayuda, opciones: [{ id, t, s, img }], hoy: () => id | null, elegir: id => {} }`, la primera vez se pregunta a quién va dirigido (en CareLab, «¿A quién cuidas?») y cada episodio puede traer `variantes[perfil]`, que sustituyen sus campos a un nivel (por ejemplo, otro `reflejo`). En modo grupo no se pregunta y se usa la versión base.

**La llegada en 1.1.** Las opciones aceptan `img` (un SVG que se pinta a la izquierda) y `salir: true` (llama a `elegir` y no abre el episodio: la web decide adónde lleva, por ejemplo a una pantalla de ayuda). Con `rutas: { A: 'título', B: 'título' }`, si la persona eligió A o B y el episodio trae `rutas[A|B]`, la Misión muestra ese camino en un recuadro.

## Formato de un episodio

| Campo | Qué es |
|---|---|
| `id`, `palabra`, `resumen` | Identificador, la palabra y una línea que la resume |
| `riesgo` | `true` si el tema es delicado: el Reflejo va sin reloj |
| `segundos` | Segundos del Reflejo (5 si no se dice) |
| `choque` | `frase` y `opciones` (`id`, `e` emoji, `t` texto) |
| `reflejo` | `situacion` y `opciones` (`id`, `t`) |
| `giro` | `hecho`, `fuente`, `url`, `busca` (lo que buscaba la frase) y `saltos` (`t`, `p`) |
| `peldano` | `preguntas` (`p`, `o` opciones, `ok` índice, `por`) y `sabias` |
| `mision` | `opciones` (`corta`, `t`, `historia`) y `retorno` |
| `historia` | `pensaba` (por id del choque), `hice` (por id del reflejo, más `tiempo`) y `ahora`, con `{mision}` |
| `vuelta` | `siguiente`: el id del episodio que se abre después |
| `saber_mas` | Lo técnico, plegado en «Saber más» |
| `corto` | Opcional: `pregunta` y `accion` de la versión corta (ver la pregunta de llegada) |
| `escena` | 1.1, opcional: una escena breve que se lee antes de la frase del Choque |
| `aviso` | 1.1, opcional: una línea al pie del Giro, seguida de `cfg.ayuda` |
| `rutas` | 1.1, opcional: `{ A, B }`, el texto del camino según la llegada |
| `variantes` | 1.1, opcional: `{ <perfil>: { campo: valor } }`, ver el perfil |

Los textos admiten `**negrita**` y `*cursiva*`. Cada web puede añadir sus propios campos (PostLab: `valor`, `termino` e `historia_humana`; CareLab: `perfil`, `familia` y `ficha`). Si una opción del Reflejo ya trae sus comillas «», no se citan dos veces.

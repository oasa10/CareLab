/** Original practical CareLab scenarios. They are teaching examples, not reports of a user's life.
 * Canon: Método BrainBox 1.2, 14-10-2026, §§2–9, §14.3 and its extracted tables.
 * No claim of clinical effectiveness or automatic assessment. */
export const SOURCE =
  "Método BrainBox 1.2 · §§4.1–4.4, 5.1–5.2, 7 y 9. Adaptación didáctica de CareLab.";
export const SCENARIOS = {
  relevo: {
    id: "relevo",
    title: "Pedir un relevo",
    subtitle:
      "Convertir «necesito ayuda» en una petición que pueda responderse.",
    icon: "↗",
    scene:
      "Llevas un rato pensando en pedir un relevo. Abres el mensaje y acabas escribiendo: «Cuando puedas, échame una mano». Todavía no hay un acuerdo.",
    feelings: [
      "Cansancio",
      "Culpa al pedir",
      "Temor a la respuesta",
      "No quiero ponerle una palabra",
    ],
    reactions: [
      "Lo hago yo sin preguntar",
      "Pido ayuda sin concretar",
      "Aplazo el mensaje",
      "Mi reacción es otra",
    ],
    thoughts: [
      "Si lo pido, voy a molestar",
      "Nadie podrá hacerlo como yo",
      "Si no lo ofrecen, no les importa",
      "No quiero elegir una interpretación",
    ],
    validation:
      "Sentir culpa, cansancio o temor al pedir merece espacio. Esa experiencia no demuestra lo que la otra persona piensa ni te obliga a enviar nada.",
    contrast: [
      {
        text: "Alex respondió: «El jueves puedo acompañar veinte minutos».",
        kind: "hecho",
        why: "En esta escena hay una respuesta concreta con una ocasión. Respalda esa disponibilidad declarada, no que el relevo ya haya ocurrido ni que cualquier tarea sea posible.",
      },
      {
        text: "Si Alex tarda en contestar, significa que no le importo.",
        kind: "supuesto",
        why: "La tardanza no permite conocer su motivo. Antes de concluirlo faltan una respuesta y su contexto. El malestar que produzca esperar sí puede reconocerse.",
      },
      {
        text: "Me siento culpable al pedirlo.",
        kind: "experiencia",
        why: "Es un dato de la experiencia que la persona cuenta. No hace falta negar esa culpa; tampoco demuestra que pedir un relevo sea injusto.",
      },
    ],
    observations: [
      "Todavía no he hecho una petición concreta",
      "Hice una petición y aún no tengo respuesta",
      "Tengo una respuesta concreta que puedo consultar",
      "No lo he observado todavía",
    ],
    question:
      "¿Qué tarea y qué ocasión puede aceptar realmente la otra persona?",
    knowledge: [
      "«No tengo ayuda»: aún falta delimitar qué petición y cuándo.",
      "Una petición y la respuesta recibida, si existen.",
      "Ordenar qué se pidió, a quién y para qué ocasión.",
      "Un acuerdo concreto con sus condiciones; no una regla sobre todas las personas.",
      "Saber cuándo ese acuerdo sirve y cuándo necesita revisarse.",
    ],
    misleading: [
      "La misma incertidumbre inicial; todavía no hay respaldo suficiente.",
      "Dar por recibida una respuesta que nadie dio.",
      "Mostrar sólo una negativa y ocultar otras respuestas relevantes.",
      "«Si me quisiera, siempre estaría disponible»: regla sin respaldo.",
      "Mantener esa regla aunque los hechos la contradigan.",
    ],
    doing: [
      "Comprobar que hay alguien a quien preguntar y una ocasión viable.",
      "Ensayar una petición con tarea, ocasión y posibilidad de decir no.",
      "Poder decirla sin añadir exigencias que deshagan la petición.",
      "Hacer la petición en el contexto real y escuchar la respuesta.",
      "Revisar qué acuerdos funcionaron y adaptar la próxima petición.",
    ],
    rehearsal: [
      {
        text: "«Cuando puedas, échame una mano».",
        response:
          "Expresa necesidad, pero deja sin acordar la tarea y la ocasión. La otra persona tendría que adivinarlas.",
      },
      {
        text: "«¿Puedes acompañar veinte minutos en una ocasión que acordemos? Si no, prefiero saberlo».",
        response:
          "Hace una petición concreta y permite una respuesta. Aún falta confirmar ocasión y condiciones; pedir no equivale a conseguir el relevo.",
      },
      {
        text: "«Si de verdad te importara, ya lo habrías hecho».",
        response:
          "Une la petición a un juicio sobre la relación. Puedes conservar la necesidad y probar una formulación que no exija demostrar afecto.",
      },
    ],
    rehearsalBest: 1,
    action:
      "Pedir a una persona de confianza un relevo de veinte minutos y acordar una ocasión si acepta.",
    message:
      "Necesito un relevo breve. ¿Puedes acompañar durante veinte minutos en una ocasión que acordemos? Antes concretaríamos qué hace falta y cómo avisarnos si algo cambia. Si no puedes, dímelo para buscar otra opción.",
    support:
      "Que la otra persona pueda y acepte; acordar una tarea cotidiana y mantener cubiertas las necesidades indispensables.",
    stop: "Si no hay aceptación o no están cubiertas las necesidades indispensables, no doy el relevo por hecho: busco otra opción o pauso.",
    observe:
      "Si hice la petición, qué respuesta recibí y si quedó una ocasión acordada.",
    procedure:
      "Revisar el mensaje o anotar la respuesta literal y la ocasión, sin difundir datos de la persona cuidada.",
    criterion:
      "Si hay aceptación y condiciones viables, concretaré el relevo. Si no, cambiaré la petición o buscaré otro apoyo; no daré el silencio por aceptación.",
    afterOptions: [
      "Hice la petición; no hubo respuesta todavía",
      "Hubo una negativa explícita",
      "Quedó un acuerdo concreto",
      "El relevo ocurrió según lo acordado",
      "No tengo una observación que añadir",
    ],
    signal: "Aparece una necesidad de descanso.",
    effect: "Queda una petición sin concretar y el relevo sigue pendiente.",
    inversion:
      "Cambiar «¿por qué no lo ofrecen?» por «¿qué petición concreta puedo hacer sin disponer de su voluntad?»",
    nextAsk: "Qué disponibilidad real existe, antes de diseñar otra petición.",
  },
  mente: {
    id: "mente",
    title: "Sacar algo de mi cabeza",
    subtitle: "Dar un lugar y un responsable a una preocupación que vuelve.",
    icon: "≈",
    scene:
      "Mientras haces una tarea, recuerdas una compra pendiente. Más tarde vuelves a recordarla y preguntas de nuevo. La tarea sigue viviendo en tu cabeza.",
    feelings: [
      "Saturación",
      "Irritación",
      "Inquietud por olvidar",
      "No quiero ponerle una palabra",
    ],
    reactions: [
      "Interrumpo lo que estaba haciendo",
      "Lo recuerdo varias veces a otras personas",
      "Lo resuelvo yo sin acordarlo",
      "Mi reacción es otra",
    ],
    thoughts: [
      "Si dejo de vigilar, se olvidará",
      "Tenerlo apuntado debería bastar",
      "Sólo yo veo lo que falta",
      "No quiero elegir una interpretación",
    ],
    validation:
      "Estar pendiente de lo invisible puede cansar. Reconocer ese cansancio no exige demostrar que las demás personas se desentienden.",
    contrast: [
      {
        text: "La compra está en la lista, pero el campo de responsable está vacío.",
        kind: "hecho",
        why: "La escena permite comprobar dos elementos del registro. Tener una tarea escrita no prueba que alguien la haya aceptado.",
      },
      {
        text: "Si no lo recuerdo yo, nadie lo hará nunca.",
        kind: "supuesto",
        why: "Es una predicción general. Haría falta observar una tarea concreta, un responsable que la acepte y qué pasa después.",
      },
      {
        text: "Siento la cabeza llena cuando vuelvo a recordarlo.",
        kind: "experiencia",
        why: "Describe una experiencia válida de quien la cuenta. No identifica por sí sola la causa ni mide la carga de todo el equipo.",
      },
    ],
    observations: [
      "Una tarea vuelve a mi cabeza sin responsable acordado",
      "La tarea está anotada, pero nadie la ha aceptado",
      "Alguien la aceptó y falta acordar cómo avisará",
      "No lo he observado todavía",
    ],
    question:
      "¿Qué falta para que esta tarea tenga responsable y una señal de cierre?",
    knowledge: [
      "«Tengo que pensarlo todo»: aún falta elegir una tarea.",
      "Una tarea concreta y su registro o acuerdo actual.",
      "Relacionar recordatorios, responsable y ocasión de cierre.",
      "Un acuerdo operativo que diga quién hace qué y cómo avisa.",
      "Ver cuándo ese acuerdo evita repetir la vigilancia y cuándo falla.",
    ],
    misleading: [
      "La mezcla inicial no demuestra todavía qué está pasando.",
      "Dar por acordado un responsable que nunca aceptó.",
      "Presentar como olvido un plazo que aún no había llegado.",
      "«Quien no recuerda igual que yo no se compromete»: regla sin respaldo.",
      "Aplicar esa regla aunque un acuerdo distinto sí se cumpla.",
    ],
    doing: [
      "Disponer de un lugar accesible para una sola tarea.",
      "Escribir tarea, responsable propuesto y señal de cierre.",
      "Poder consultarlo sin crear otra lista paralela.",
      "Usarlo en una ocasión real con quien acepta la tarea.",
      "Revisar si redujo recordatorios repetidos y simplificarlo.",
    ],
    rehearsal: [
      {
        text: "«Acuérdate de todo lo que falta».",
        response:
          "La responsabilidad sigue abierta y obliga a interpretar qué incluye «todo».",
      },
      {
        text: "«Dejo esta compra apuntada. ¿La puedes asumir y avisar aquí cuando esté?».",
        response:
          "Nombra una tarea y una señal de cierre. Falta la aceptación; anotarla por sí sola no la transfiere.",
      },
      {
        text: "«Lo apunto en tres sitios para asegurarme».",
        response:
          "Puede duplicar vigilancia. Para esta prueba basta un lugar que ambas partes puedan consultar.",
      },
    ],
    rehearsalBest: 1,
    action:
      "Elegir una tarea no clínica, anotarla en un único lugar y pedir aceptación y señal de cierre a quien podría asumirla.",
    message:
      "Quiero que esta tarea deje de depender de recordatorios repetidos. La anotaré en un solo lugar. ¿Puedes asumirla y avisar ahí cuando esté hecha? Si no te encaja, acordamos otra opción.",
    support:
      "Un lugar accesible para las personas implicadas y aceptación explícita de la tarea y su ocasión.",
    stop: "No dejo de atender una necesidad indispensable sólo porque esté escrita. Si nadie acepta o el registro no es accesible, cambio el acuerdo.",
    observe:
      "Si hubo aceptación, si se registró el cierre y si tuve que volver a recordarlo.",
    procedure:
      "Consultar sólo esa tarea en el registro y anotar los recordatorios que recuerde, indicando si el registro es incompleto.",
    criterion:
      "Si se cumple el acuerdo sin añadir vigilancia, lo mantendré para esa tarea. Si obliga a duplicar recordatorios, simplificaré o cambiaré el reparto.",
    afterOptions: [
      "La tarea quedó anotada, sin aceptación",
      "Alguien aceptó; todavía no llegó la ocasión",
      "Se registró el cierre sin otro recordatorio",
      "Tuve que volver a recordar la tarea",
      "No tengo una observación que añadir",
    ],
    signal: "Recuerdo una tarea pendiente.",
    effect: "La resuelvo o vigilo sin un acuerdo que cierre la vuelta.",
    inversion:
      "Cambiar «tengo que recordar mejor» por «¿qué acuerdo permitiría que esta tarea no dependiera de recordarla yo?»",
    nextAsk: "Qué impidió usar el lugar o la señal acordados.",
  },
  pausa: {
    id: "pausa",
    title: "Descansar sin resolverlo todo",
    subtitle: "Preparar una pausa posible sin convertirla en otra obligación.",
    icon: "◌",
    scene:
      "Hay un momento disponible. Piensas en sentarte, miras lo que queda pendiente y vuelves a levantarte. La pausa no empieza.",
    feelings: [
      "Culpa",
      "Cansancio",
      "Inquietud",
      "No quiero ponerle una palabra",
    ],
    reactions: [
      "Me levanto y busco otra tarea",
      "Miro varias veces si falta algo",
      "Pospongo la pausa hasta terminarlo todo",
      "Mi reacción es otra",
    ],
    thoughts: [
      "Descansar ahora sería egoísta",
      "Primero tendría que acabar todo",
      "Si sigo pendiente, descanso igual",
      "No quiero elegir una interpretación",
    ],
    validation:
      "La culpa puede estar presente aunque haya una pausa posible. No necesitas expulsarla ni contar una historia positiva para comprobar qué condiciones harían viable detenerte.",
    contrast: [
      {
        text: "Otra persona aceptó cubrir esta tarea hasta las seis.",
        kind: "hecho",
        why: "En la escena hay un acuerdo concreto. Hay que respetar sus límites; no demuestra que cualquier necesidad quede cubierta ni que la pausa ya haya ocurrido.",
      },
      {
        text: "Si descanso, significa que me importa menos la persona cuidada.",
        kind: "supuesto",
        why: "Une una pausa con una conclusión sobre el afecto. Esa conclusión no se deduce de la pausa: hay que mirar condiciones y consecuencias reales.",
      },
      {
        text: "Noto culpa cuando intento sentarme.",
        kind: "experiencia",
        why: "Es una experiencia contada, no un veredicto moral. Puede reconocerse sin usarla como prueba de que descansar está mal.",
      },
    ],
    observations: [
      "Cuando intento parar, vuelvo a una tarea pendiente",
      "Hay una pausa posible con cobertura acordada",
      "No hay cobertura ni una ocasión segura ahora",
      "No lo he observado todavía",
    ],
    question:
      "¿Qué tendría que estar cubierto para que una pausa elegida sea posible?",
    knowledge: [
      "«No puedo parar»: aún hay que delimitar la ocasión.",
      "Una ocasión y qué necesidades indispensables quedarían cubiertas.",
      "Distinguir tareas que pueden esperar de necesidades que requieren cobertura.",
      "Un acuerdo de pausa con límites y forma de avisar.",
      "Reconocer cuándo la pausa es viable y cuándo faltan apoyos.",
    ],
    misleading: [
      "La mezcla inicial pide delimitar, no juzgar el descanso.",
      "Suponer que hay cobertura sin que nadie la haya aceptado.",
      "Omitir una necesidad indispensable al describir la ocasión.",
      "«Una buena persona cuidadora nunca descansa»: regla sin respaldo.",
      "Mantener esa regla aun cuando el coste del no descanso sea visible.",
    ],
    doing: [
      "Comprobar una ocasión y cobertura suficiente.",
      "Ensayar decir qué pausa quiero y qué queda cubierto.",
      "Poder iniciar la pausa sin añadir una lista nueva.",
      "Probarla en la ocasión real, con los límites acordados.",
      "Revisar si fue viable y qué condiciones conviene mantener.",
    ],
    rehearsal: [
      {
        text: "«No pararé hasta terminarlo todo».",
        response:
          "Hace depender la pausa de una meta que puede no terminar. Puedes elegir una ocasión con condiciones concretas.",
      },
      {
        text: "«Quiero parar unos minutos cuando quede cubierta esta necesidad. Lo demás lo retomaré después».",
        response:
          "Distingue cobertura y tareas aplazables. Es una propuesta que debe encajar con la situación, no una orden de descansar.",
      },
      {
        text: "«Me obligaré a descansar perfectamente».",
        response:
          "Añade una exigencia. La prueba puede ser simplemente iniciar una pausa elegida y observar qué pasó, sin evaluar si descansaste bien.",
      },
    ],
    rehearsalBest: 1,
    action:
      "Comprobar una ocasión con las necesidades indispensables cubiertas y probar una pausa breve elegida, si las condiciones lo permiten.",
    message:
      "Quiero reservar una pausa breve cuando queden cubiertas las necesidades indispensables. Acordemos qué queda a cargo de quién y cómo avisarnos si algo cambia. Si hoy no es posible, buscaré otra ocasión o apoyo.",
    support:
      "Cobertura suficiente y una ocasión real; la pausa puede ser sentarse, mirar por la ventana o elegir otra actividad sencilla.",
    stop: "Si falta cobertura o aparecen necesidades que no pueden esperar, pauso el ejercicio y organizo apoyo; no abandono una necesidad indispensable.",
    observe:
      "Si hubo ocasión, si inicié la pausa y qué la interrumpió, si ocurrió.",
    procedure:
      "Anotar después si la pausa se hizo y una interrupción concreta, sin exigir sentirme mejor.",
    criterion:
      "Si fue viable sin desatender necesidades, podré repetir las condiciones. Si no lo fue o añadió tensión, cambiaré la ocasión o el apoyo.",
    afterOptions: [
      "No hubo una ocasión viable",
      "La pausa empezó y terminó en la ocasión acordada",
      "La pausa se interrumpió por una necesidad concreta",
      "Volví a una tarea que podía esperar",
      "No tengo una observación que añadir",
    ],
    signal: "Aparece una ocasión de pausa.",
    effect: "Vuelvo a una tarea y la pausa sigue pendiente.",
    inversion:
      "Cambiar «¿me merezco descansar?» por «¿qué condiciones hacen posible una pausa sin desatender lo indispensable?»",
    nextAsk:
      "Qué cobertura u ocasión faltó, en vez de exigirme descansar mejor.",
  },
  limites: {
    id: "limites",
    title: "Poner un límite que se pueda cuidar",
    subtitle: "Decir lo que puedo asumir y lo que necesita otra solución.",
    icon: "↔",
    scene:
      "Llega una nueva petición mientras ya estás atendiendo otras cosas. Respondes «sí» de inmediato. Después intentas encajarla sin saber cómo.",
    feelings: [
      "Presión",
      "Miedo a decepcionar",
      "Enfado",
      "No quiero ponerle una palabra",
    ],
    reactions: [
      "Digo que sí antes de comprobarlo",
      "Me callo y luego intento hacerlo todo",
      "Respondo de golpe y cierro la conversación",
      "Mi reacción es otra",
    ],
    thoughts: [
      "Si digo que no, estoy fallando",
      "El límite tiene que ser aceptado para ser válido",
      "Sólo tengo dos opciones: hacerlo todo o abandonar",
      "No quiero elegir una interpretación",
    ],
    validation:
      "La presión o el miedo a decepcionar pueden acompañar un límite. Reconocerlo no obliga a confrontar a nadie ni garantiza una respuesta favorable.",
    contrast: [
      {
        text: "Ya tengo una tarea acordada para esa misma hora.",
        kind: "hecho",
        why: "Una coincidencia concreta puede comprobarse. Ayuda a hablar de capacidad y alternativas, sin concluir nada sobre la intención de quien pide.",
      },
      {
        text: "Si digo que hoy no puedo, me rechazarán.",
        kind: "supuesto",
        why: "Es una anticipación de una respuesta. Si hay intimidación o riesgo real, no corresponde ensayar aquí una confrontación: toca apoyo competente.",
      },
      {
        text: "Siento presión al escuchar la petición.",
        kind: "experiencia",
        why: "Describe lo que se vive. La presión merece reconocimiento; por sí sola no permite saber qué ocurrirá si cambias la respuesta.",
      },
    ],
    observations: [
      "Acepté una petición sin mirar lo que ya tenía",
      "Dos tareas acordadas coinciden en la misma ocasión",
      "Todavía no he respondido a la nueva petición",
      "No lo he observado todavía",
    ],
    question:
      "¿Qué puedo comprometer realmente y qué necesita un acuerdo diferente?",
    knowledge: [
      "«Me lo piden todo»: falta delimitar esta petición.",
      "Una petición, una ocasión y lo que ya está comprometido.",
      "Ordenar qué cabe y qué requeriría cambiar otro acuerdo.",
      "Un límite concreto con una alternativa si existe.",
      "Distinguir cuándo negociar y cuándo parar por falta de condiciones o riesgo.",
    ],
    misleading: [
      "La mezcla inicial no permite concluir qué puede asumir cada cual.",
      "Dar por aceptada una tarea que sólo se sugirió.",
      "Ocultar compromisos previos al describir la disponibilidad.",
      "«Poner un límite equivale a abandonar»: regla sin respaldo.",
      "Repetir esa regla aunque impida atender compromisos indispensables.",
    ],
    doing: [
      "Comprobar capacidad, obligaciones reales y seguridad de la conversación.",
      "Ensayar una frase que diga lo que sí puedo y lo que no puedo prometer.",
      "Sostener una frase clara sin añadir justificaciones interminables.",
      "Usarla en el contexto real y escuchar qué alternativa existe.",
      "Revisar consecuencias y adaptar el siguiente acuerdo.",
    ],
    rehearsal: [
      {
        text: "«Sí, ya veré cómo lo hago».",
        response:
          "Acepta antes de comprobar capacidad. Puedes reservarte el tiempo de mirar los compromisos.",
      },
      {
        text: "«Antes de decirte que sí, necesito ver qué tengo acordado. Hoy no puedo prometer esa tarea».",
        response:
          "Separa comprobar de comprometerse. No exige una respuesta favorable y evita disponer del tiempo de otra persona.",
      },
      {
        text: "«Haz lo que quieras, yo ya no hago nada».",
        response:
          "Cierra el acuerdo de forma amplia. Si la situación permite hablar con seguridad, puedes delimitar una tarea concreta sin plantearlo como todo o nada.",
      },
    ],
    rehearsalBest: 1,
    action:
      "Antes de aceptar una petición cotidiana, comprobar mis compromisos y expresar lo que puedo asumir sin prometer lo que no cabe.",
    message:
      "Antes de decirte que sí, necesito comprobar lo que ya tengo acordado. Hoy no puedo prometer esa tarea. Podemos mirar otra ocasión o quién podría asumirla, sin darlo por hecho.",
    support:
      "Una conversación segura, tiempo para mirar los compromisos y una alternativa sólo si existe realmente.",
    stop: "Si hay coerción, intimidación o un conflicto médico, psicológico o legal, no uso este ensayo para confrontarlo: paro y busco apoyo competente.",
    observe:
      "Qué dije, qué respuesta recibí y qué compromiso quedó realmente acordado.",
    procedure:
      "Anotar la petición, mi respuesta y el acuerdo final, o indicar que no hubo acuerdo.",
    criterion:
      "Si quedó un compromiso viable, lo mantendré. Si sigue siendo imposible o hay presión, buscaré apoyo o pausaré; no llamaré acuerdo a una imposición.",
    afterOptions: [
      "Comprobé mis compromisos antes de responder",
      "Expresé el límite y no hubo acuerdo todavía",
      "Quedó una alternativa concreta",
      "Acepté de nuevo algo que no cabía",
      "No tengo una observación que añadir",
    ],
    signal: "Llega una nueva petición.",
    effect: "La acepto sin comprobar si cabe y se acumulan compromisos.",
    inversion:
      "Cambiar «tengo que conseguir que acepte mi límite» por «¿qué puedo comprometer de forma responsable y segura?»",
    nextAsk: "Qué apoyo o condición faltó para sostener un acuerdo viable.",
  },
};
export const KNOWING = [
  {
    id: "ruido",
    title: "Ruido",
    text: "Lo que todavía no está delimitado ni contrastado.",
    down: "Punto de partida",
    warning:
      "Es neutro. Una emoción contada tiene valor como dato de experiencia; no se usa «ruido» para invalidarla.",
  },
  {
    id: "datos",
    title: "Datos",
    text: "Observaciones o registros con procedencia.",
    down: "Pseudodato",
    warning: "Algo sin procedencia o inventado que se presenta como dato.",
  },
  {
    id: "informacion",
    title: "Información",
    text: "Datos ordenados respecto a una pregunta que reducen incertidumbre.",
    down: "Desinformación",
    warning:
      "Datos ordenados para confundir. Una falta de información no prueba intención de engañar.",
  },
  {
    id: "conocimiento",
    title: "Conocimiento",
    text: "Una explicación o regla respaldada, con sus condiciones.",
    down: "Pseudoconocimiento",
    warning: "Una regla sin respaldo que parece saber.",
  },
  {
    id: "entendimiento",
    title: "Entendimiento",
    text: "Saber cuándo y cómo usar o adaptar una regla.",
    down: "Insensatez",
    warning:
      "Aplicar reglas falsas sin ver cuándo fallan. Se describe una operación en una situación, nunca a una persona.",
  },
];
export const DOING = [
  {
    id: "aptitud",
    title: "Aptitud",
    text: "Capacidades y condiciones de partida, incluidos los apoyos.",
    down: "Inaptitud",
    warning:
      "Faltan condiciones para esta tarea; no es un techo fijo ni un juicio sobre la persona.",
  },
  {
    id: "habilidad",
    title: "Habilidad",
    text: "Poder ejecutar las operaciones necesarias.",
    down: "Torpeza",
    warning:
      "Las operaciones de esta tarea aún no salen. Recitar instrucciones no basta.",
  },
  {
    id: "destreza",
    title: "Destreza",
    text: "Ejecutarlas de forma integrada, fluida y fácil.",
    down: "Nombre pendiente en 1.2",
    warning:
      "Sale, pero forzado o a trompicones. La rapidez sola no es calidad.",
  },
  {
    id: "competencia",
    title: "Competencia",
    text: "Hacerlo en el entorno real, con juicio y apoyos.",
    down: "Incompetencia",
    warning:
      "Entrenando sale, pero en el entorno real no. No exige hacerlo sin ayuda.",
  },
  {
    id: "experiencia",
    title: "Experiencia cultivada",
    text: "Aprender de la práctica revisada y adaptarse.",
    down: "Nombre pendiente en 1.2",
    warning: "Repetir durante años no prueba aprendizaje si no se revisa.",
  },
];
export const KINDS = [
  ["hecho", "Un hecho observable en la escena"],
  ["experiencia", "Una experiencia que la persona cuenta"],
  ["supuesto", "Una interpretación o suposición"],
];
export const ROUTES = [
  [
    "cuidado",
    "Algo ya funciona y quiero sostenerlo",
    "Conserva lo que sirve: puedes ir directamente a preparar una prueba y su retorno.",
  ],
  [
    "apoyo",
    "Lo que siento y lo que hago se han separado",
    "Usa sólo el contraste y el ensayo que ayuden a volver a conectarlos.",
  ],
  [
    "gestion",
    "Llevo tiempo explicándolo y no doy un paso",
    "Delimita una sola decisión; una pregunta concreta o una pausa también pueden ser el siguiente paso.",
  ],
];
export const DECISIONS = [
  [
    "mantener",
    "Mantener",
    "Repetiré las condiciones que sí se observaron, sin generalizarlas.",
  ],
  [
    "ajustar",
    "Ajustar",
    "Cambiaré una condición concreta y prepararé otro retorno.",
  ],
  [
    "indagar",
    "Buscar un dato que falta",
    "Primero aclararé algo que pueda cambiar la siguiente acción.",
  ],
  ["pausar", "Pausar", "No tengo condiciones para continuar ahora."],
  [
    "sustituir",
    "Probar otra opción",
    "Esta vía no encaja; elegiré otra acción o recurso.",
  ],
  [
    "dejar",
    "Dejar esta prueba",
    "Dejarla es una decisión; no tengo que justificar una mejora inexistente.",
  ],
];
export const CYCLE_TYPES = [
  [
    "sano",
    "En estas vueltas el ciclo se ha vuelto más sano",
    "La señal se calma o se convierte en aprendizaje.",
  ],
  [
    "transicion",
    "Está en transición / en vaivén",
    "Unas vueltas ayudan, otras refuerzan la señal o siguen igual. El nombre definitivo está pendiente en 1.2.",
  ],
  [
    "viciado",
    "En estas vueltas el ciclo se ha viciado",
    "El efecto refuerza la señal. Describe estas interacciones, nunca el valor de las personas.",
  ],
  [
    "insuficiente",
    "Aún no tengo vueltas suficientes",
    "Puedo dejarlo sin clasificar y observar una ocasión más.",
  ],
];

// Optional lenses for a provisional account. None states that an event happened,
// that an explanation is true, or that the caregiver acquired a new identity.
export const NARRATIVE_LENSES = {
  relevo: {
    reframe: [
      [
        "peticion",
        "Miraré esta petición y su respuesta, sin convertirlas en una medida del afecto.",
        "Reencuadrar aquí es cambiar la pregunta: una respuesta concreta permite revisar un acuerdo; no permite medir toda una relación.",
      ],
      [
        "abierto",
        "Si falta respuesta, dejaré abierto lo que piensa la otra persona.",
        "Conservar la incertidumbre evita rellenar el silencio con una intención que no se ha observado.",
      ],
    ],
    context: [
      [
        "condiciones",
        "Comprobaré tarea, ocasión y aceptación antes de hablar de disponibilidad.",
        "Recontextualizar añade las condiciones del relevo. No supone que ya existan ni atribuye una causa al resultado.",
      ],
      [
        "apoyos",
        "Si la petición no basta, miraré qué apoyo o alternativa falta.",
        "El resultado puede depender de recursos y acuerdos. Esta mirada evita convertir una limitación del entorno en culpa personal.",
      ],
    ],
    meaning: [
      [
        "ensayo",
        "Puedo tomar esta vuelta como una prueba de una petición, no de mi valor.",
        "Resignificar propone un sentido limitado para seguir decidiendo; no convierte una negativa en una victoria.",
      ],
      [
        "suspender",
        "Por ahora prefiero que esta experiencia no tenga una conclusión sobre mí ni sobre la relación.",
        "También es válido suspender el significado. No hace falta obtener una enseñanza positiva.",
      ],
    ],
  },
  mente: {
    reframe: [
      [
        "acuerdo",
        "Miraré una tarea y su acuerdo, en vez de explicar toda la carga de memoria de una vez.",
        "Reencuadrar acota la unidad de trabajo: una anotación puede observarse; la idea de que siempre depende todo de una persona requiere más respaldo.",
      ],
      [
        "distinguir",
        "Separaré que una tarea esté escrita de que alguien haya aceptado hacerla.",
        "La distinción cambia qué se comprueba después, sin inventar aceptación ni cumplimiento.",
      ],
    ],
    context: [
      [
        "acceso",
        "Comprobaré quién podía consultar el registro y cómo estaba previsto avisar.",
        "Recontextualizar busca condiciones de uso. No atribuye automáticamente el resultado a desinterés o falta de memoria.",
      ],
      [
        "coste",
        "Miraré si el acuerdo añadió listas, avisos o vigilancia a alguien.",
        "El contexto incluye el coste del sistema para todas las partes; tener un registro nuevo no demuestra que la carga haya bajado.",
      ],
    ],
    meaning: [
      [
        "provisional",
        "Esta vuelta puede servir para revisar un acuerdo concreto; no demuestra que yo deba supervisarlo todo.",
        "Resignificar limita la conclusión a la tarea observada, sin prometer autonomía ni reparto definitivo.",
      ],
      [
        "suspender",
        "Prefiero conservar el registro sin sacar todavía una conclusión sobre mi forma de cuidar.",
        "No obtener una nueva historia es una opción completa cuando faltan observaciones.",
      ],
    ],
  },
  pausa: {
    reframe: [
      [
        "viabilidad",
        "Miraré si la pausa fue posible, sin usar la culpa como veredicto sobre si la merecía.",
        "Reencuadrar distingue la emoción de una conclusión moral. La culpa puede seguir presente y no se niega.",
      ],
      [
        "ocasion",
        "Miraré esta ocasión y sus interrupciones, sin exigir que represente todo mi descanso.",
        "Una pausa concreta ofrece información limitada; no permite concluir que descansar siempre funciona o nunca es posible.",
      ],
    ],
    context: [
      [
        "cobertura",
        "Comprobaré qué cobertura y qué necesidades indispensables había en esa ocasión.",
        "Recontextualizar coloca la pausa dentro de las condiciones reales del cuidado, sin dar la cobertura por supuesta.",
      ],
      [
        "apoyo",
        "Si no hubo ocasión, miraré qué apoyo faltó antes de exigirme hacerlo mejor.",
        "La falta de apoyo es una pregunta que comprobar, no un defecto de voluntad ni una explicación automáticamente cierta.",
      ],
    ],
    meaning: [
      [
        "permiso",
        "Puedo dejar que esta vuelta hable de condiciones para parar, sin convertirla en un examen de buena persona cuidadora.",
        "Resignificar cambia el sentido que propongo a la experiencia; no promete bienestar ni afirma que la pausa haya ocurrido.",
      ],
      [
        "suspender",
        "No necesito transformar lo vivido en una lección positiva sobre descansar.",
        "Conservar una experiencia incómoda o inconclusa también respeta lo observado.",
      ],
    ],
  },
  limites: {
    reframe: [
      [
        "capacidad",
        "Miraré qué compromiso era viable, sin reducir la situación a hacerlo todo o abandonar.",
        "Reencuadrar abre una pregunta concreta sobre capacidad y responsabilidad; no elimina obligaciones ni riesgos.",
      ],
      [
        "respuesta",
        "Distinguiré expresar un límite de que la otra persona lo acepte.",
        "La respuesta ajena aporta información para decidir. No demuestra por sí sola que el límite sea adecuado o inadecuado.",
      ],
    ],
    context: [
      [
        "compromisos",
        "Comprobaré compromisos previos, apoyos y alternativas que realmente existían.",
        "Recontextualizar añade condiciones comprobables sin inventar otra persona disponible ni un acuerdo posible.",
      ],
      [
        "seguridad",
        "Miraré si había condiciones seguras para conversar; si no, priorizaré apoyo competente.",
        "No se pide ensayar una confrontación frente a coerción o peligro. La seguridad puede cambiar por completo el siguiente paso.",
      ],
    ],
    meaning: [
      [
        "responsable",
        "Puedo entender esta vuelta como una revisión de lo que puedo comprometer, sin convertirla en un juicio sobre mí.",
        "Resignificar deja un sentido provisional y acotado. No transforma un conflicto en éxito ni obliga a sostener una identidad nueva.",
      ],
      [
        "suspender",
        "Prefiero no sacar todavía una conclusión sobre mí o la relación a partir de esta petición.",
        "Puede faltar información o apoyo. No es obligatorio resolver ahora el significado de lo vivido.",
      ],
    ],
  },
};

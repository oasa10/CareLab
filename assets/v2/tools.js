export const dimensions = [
  ["tiempo", "Tiempo", "Tareas, interrupciones y disponibilidad", "time"],
  [
    "cuerpo",
    "Cuerpo y energía",
    "Descanso, necesidades propias y esfuerzo",
    "leaf",
  ],
  [
    "mente",
    "Carga mental",
    "Recordar, anticipar, organizar y decidir",
    "spark",
  ],
  ["emociones", "Emociones", "Cómo estás viviendo el cuidado", "heart"],
  [
    "relaciones",
    "Relaciones",
    "Límites, acuerdos y espacio personal",
    "people",
  ],
  [
    "dinero",
    "Dinero y trabajo",
    "Gastos, empleo y gestiones pendientes",
    "money",
  ],
  [
    "organizacion",
    "Organización",
    "Relevos, imprevistos y varios cuidados",
    "plan",
  ],
  ["apoyos", "Apoyos", "Ayuda real, accesible y aceptada", "shield"],
];
export const tools = {
  mapa: {
    title: "Sacar la carga de la cabeza",
    subtitle: "Lo que anticipas y recuerdas también ocupa espacio.",
    icon: "map",
    dimension: "mente",
    output: "Lista visible y primera decisión",
    fields: [
      [
        "situation",
        "¿Qué estás sosteniendo que nadie ve?",
        "Preparar citas, recordar compras, estar pendiente del teléfono…",
      ],
      [
        "simplify",
        "¿Qué podrías simplificar o dejar para después?",
        "Una tarea concreta que no comprometa cuidados necesarios.",
      ],
      [
        "support",
        "¿Quién podría asumir una parte completa?",
        "Incluir acordar, organizar y comprobar; no solo ejecutar.",
      ],
    ],
    prompt: "Hacer visible una tarea y acordar qué cambiar",
    source: "AC07 · CC04 · MC07",
  },
  plan: {
    title: "Un paso que sí cabe",
    subtitle: "Convierte una intención en una acción posible y revisable.",
    icon: "plan",
    dimension: "tiempo",
    output: "Acción mínima y revisión preparada",
    fields: [
      [
        "situation",
        "¿Qué quieres que cambie?",
        "Una situación cotidiana, concreta.",
      ],
      [
        "action",
        "¿Qué harás, en qué ocasión y durante cuánto?",
        "Un paso pequeño que dependa de ti o de un acuerdo confirmado.",
      ],
      [
        "support",
        "¿Qué apoyos o acuerdos necesitas antes?",
        "Qué falta, quién puede ayudar y qué necesita aceptar.",
      ],
      [
        "stop",
        "¿Cuándo pararás o cambiarás el plan?",
        "Si falta el relevo, aparece malestar o cambia la situación.",
      ],
      [
        "review",
        "¿Qué observarás, quién lo revisará y cómo?",
        "Qué resultado esperarías, cómo lo comprobarás y con qué información.",
      ],
    ],
    prompt: "Mi próximo paso posible",
    source: "BrainBox 1.2 · AMV y REV · AC02 · AC17 · MC18",
  },
  reparto: {
    title: "Pedir y repartir ayuda",
    subtitle: "Una petición concreta permite hablar de un reparto real.",
    icon: "people",
    dimension: "apoyos",
    output: "Petición lista para conversar",
    fields: [
      [
        "situation",
        "¿Qué necesitas dejar de sostener a solas?",
        "Una responsabilidad, incluyendo la preparación y el seguimiento.",
      ],
      [
        "action",
        "¿Qué propones que haga la otra persona?",
        "Tarea, frecuencia y duración; sin suponer que está disponible.",
      ],
      [
        "support",
        "¿Qué información o condiciones necesita?",
        "Capacidad, consentimiento de la persona cuidada y límites.",
      ],
      [
        "fallback",
        "¿Qué harás si no puede o no acepta?",
        "Otra propuesta, servicio o cambio de organización.",
      ],
    ],
    prompt: "Proponer un reparto concreto",
    source: "AC10 · CC05 · CC07 · CC17",
  },
  limites: {
    title: "Preparar una conversación",
    subtitle: "Expresa una necesidad, un límite y una alternativa.",
    icon: "heart",
    dimension: "relaciones",
    output: "Guion editable para conversar",
    fields: [
      [
        "situation",
        "Describe lo que ocurre sin atribuir intenciones",
        "Cuando cambia el horario sin avisar…",
      ],
      [
        "impact",
        "¿Cómo te afecta y qué necesitas?",
        "Me resulta difícil organizarme y necesito previsión.",
      ],
      [
        "action",
        "¿Qué vas a pedir o qué límite necesitas expresar?",
        "Puedo hacer esto; para aquello necesitamos otro acuerdo.",
      ],
      [
        "fallback",
        "¿Qué alternativa es posible y segura?",
        "Concretar otro momento o pedir una tercera persona de apoyo.",
      ],
    ],
    prompt: "Conversar sobre un límite",
    source: "AC10 · CC02 · CC03 · MC06",
  },
  descanso: {
    title: "Hacer sitio para descansar",
    subtitle: "Una pausa necesita tiempo y, a veces, cobertura.",
    icon: "leaf",
    dimension: "cuerpo",
    output: "Pausa con cobertura y alternativa",
    fields: [
      [
        "action",
        "¿Qué pausa te resultaría posible y agradable?",
        "Sentarme sin tareas, caminar, escuchar música o ver a alguien.",
      ],
      [
        "situation",
        "¿Qué está impidiendo ese espacio?",
        "Interrupciones, culpa, falta de relevo…",
      ],
      [
        "support",
        "¿Quién cubrirá lo necesario y lo ha aceptado?",
        "Si hace falta supervisión, confirma primero un relevo capaz.",
      ],
      [
        "fallback",
        "¿Cuál es la alternativa si el relevo no llega?",
        "Reorganizar el momento sin dejar una necesidad desatendida.",
      ],
    ],
    prompt: "Reservar un espacio de descanso",
    source: "AC04 · CC05 · CC06",
  },
  consulta: {
    title: "Preparar una consulta",
    subtitle: "Ordena lo que quieres trasladar a quien puede ayudarte.",
    icon: "shield",
    dimension: "apoyos",
    output: "Notas para llevar a la consulta",
    outside: true,
    fields: [
      [
        "situation",
        "¿Qué has observado y desde cuándo?",
        "Describe hechos; evita diagnósticos propios o datos identificativos innecesarios.",
      ],
      [
        "impact",
        "¿Cómo afecta al día a día?",
        "Qué ha cambiado y qué apoyo falta.",
      ],
      [
        "questions",
        "¿Qué preguntas quieres resolver?",
        "Prioriza dos o tres preguntas.",
      ],
      [
        "action",
        "¿Qué paso de contacto vas a realizar?",
        "Pedir cita, contactar con trabajo social o solicitar orientación.",
      ],
    ],
    prompt: "Preparar mi próxima consulta",
    source: "AC03 · CC08 · CC14",
  },
  economia: {
    title: "Ordenar gastos y gestiones",
    subtitle: "Distingue lo que sabes, lo que falta y a quién preguntar.",
    icon: "money",
    dimension: "dinero",
    output: "Lista de gestión y próxima consulta",
    outside: true,
    fields: [
      [
        "situation",
        "¿Qué gasto o trámite necesitas aclarar?",
        "Describir una gestión, sin números de cuenta ni documentos personales.",
      ],
      [
        "known",
        "¿Qué información ya tienes?",
        "Fecha, organismo, justificantes disponibles.",
      ],
      [
        "questions",
        "¿Qué falta por comprobar?",
        "Requisitos, plazos, compatibilidad y documentación según tu territorio.",
      ],
      [
        "action",
        "¿Con quién lo vas a contrastar?",
        "Servicios sociales u organismo competente; no se determina aquí tu derecho.",
      ],
    ],
    prompt: "Aclarar una gestión pendiente",
    source: "AC13 · CC09 · MC07 · MC11",
  },
  contingencia: {
    title: "Preparar un relevo o imprevisto",
    subtitle: "Acuerda qué ocurrirá si tú no puedes estar.",
    icon: "plan",
    dimension: "organizacion",
    output: "Plan de continuidad acordable",
    fields: [
      [
        "situation",
        "¿Qué situación quieres prever?",
        "Un cambio de turno, una cita propia o una ausencia.",
      ],
      [
        "action",
        "¿Qué cuidados cotidianos deben quedar cubiertos?",
        "Seguir las indicaciones profesionales existentes; no cambiar pautas aquí.",
      ],
      [
        "support",
        "¿Quién puede hacerlo y qué debe aceptar?",
        "Capacidad, disponibilidad, consentimiento e información mínima.",
      ],
      [
        "fallback",
        "¿Qué alternativa usarás si la primera falla?",
        "Otra persona o servicio realmente disponible.",
      ],
      [
        "stop",
        "¿Qué señales exigen pedir ayuda competente?",
        "Señales y contactos según el plan profesional, si existe.",
      ],
    ],
    prompt: "Acordar un plan de continuidad",
    source: "AC11 · CC06 · CC13 · MC14",
  },
  revision: {
    title: "Revisar sin juzgarte",
    subtitle: "Un plan que no encaja necesita cambios, no culpa.",
    icon: "spark",
    dimension: "organizacion",
    output: "Decisión de mantener, adaptar o parar",
    fields: [
      [
        "situation",
        "¿Qué habías acordado intentar?",
        "Qué acción, en qué contexto y con qué apoyos.",
      ],
      [
        "observed",
        "¿Qué ocurrió realmente?",
        "Qué información tienes, de quién procede y qué no sabes aún.",
      ],
      [
        "impact",
        "¿Qué ayudó y qué añadió carga?",
        "Incluye el tiempo de usar la propia herramienta.",
      ],
      [
        "action",
        "¿Qué mantendrás, cambiarás o pararás?",
        "Elegir una decisión concreta sin atribuir causas que no has comprobado.",
      ],
    ],
    prompt: "Ajustar mi forma de cuidar",
    source: "AC17 · CC18 · MC17 · MC18",
  },
};
export const scenarios = [
  {
    id: "invisible",
    title: "«Solo tienes que pedirlo»",
    scene:
      "Una persona ofrece ayudarte, pero espera que le recuerdes cada tarea. Tú sigues pendiente de todo.",
    options: [
      "Acordar una responsabilidad completa y cómo revisarla.",
      "Prepararle una lista cada mañana, aunque ya no puedas más.",
      "Dar por hecho que se encargará de todo.",
    ],
    best: 0,
    feedback:
      "Puedes proponer que asuma también anticipar y organizar esa parte. Comprobad su disponibilidad, capacidad y aceptación: ofrecer ayuda no equivale todavía a un acuerdo.",
    tool: "reparto",
    source: "Carga mental del cuidado · AC07 · CC05 · CC07 · MC07",
  },
  {
    id: "pausa",
    title: "Una pausa que no encuentra hueco",
    scene:
      "Te proponen un descanso, pero nadie ha concretado quién cubre una necesidad de supervisión.",
    options: [
      "Irte y confiar en que alguien se hará cargo.",
      "Acordar un relevo capaz y una alternativa antes.",
      "Renunciar a cualquier descanso.",
    ],
    best: 1,
    feedback:
      "Descansar puede requerir reorganizar el cuidado. La pausa se vuelve posible cuando existe cobertura aceptada; si no la hay, la necesidad de apoyo sigue siendo real.",
    tool: "descanso",
    source: "Respiro y relevo · AC04 · CC06 · CC17",
  },
  {
    id: "limite",
    title: "Otra tarea más",
    scene:
      "Te piden una gestión no urgente que podrías hacer, pero ya habías reservado ese tiempo para una necesidad tuya.",
    options: [
      "Aceptar siempre para evitar una conversación.",
      "Decir que no sin posibilidad de acuerdo.",
      "Explicar lo que puedes asumir y proponer otra distribución.",
    ],
    best: 2,
    feedback:
      "Un límite puede describir capacidad, necesidad y alternativa. La respuesta concreta depende de tu contexto. Si hay amenaza, coerción o violencia, busca apoyo competente y no uses esta práctica para resolverla.",
    tool: "limites",
    source: "Límites y acuerdos · AC10 · CC16 · MC06",
  },
  {
    id: "autonomia",
    title: "Hacerlo todo por otra persona",
    scene:
      "Una persona quiere participar en una tarea cotidiana que puede realizar con los apoyos adecuados. Hacerla tú resulta más rápido.",
    options: [
      "Preguntar qué quiere hacer y acordar qué apoyo necesita.",
      "Hacerlo siempre tú porque acabas antes.",
      "Retirar todo apoyo para que sea independiente.",
    ],
    best: 0,
    feedback:
      "La autonomía incluye participar y elegir apoyos. Ni sustituir por rapidez ni abandonar por principio: escucha preferencias y capacidades, respetando el plan profesional si corresponde.",
    tool: "plan",
    source: "Autonomía y proporcionalidad · MC04 · MC05 · CC02",
  },
  {
    id: "revision",
    title: "El plan no salió",
    scene:
      "Habías previsto repartir una gestión, pero el apoyo finalmente no estuvo disponible.",
    options: [
      "Concluir que no te esfuerzas lo suficiente.",
      "Revisar la dependencia que falló y adaptar el acuerdo.",
      "Marcarlo como completado para avanzar.",
    ],
    best: 1,
    feedback:
      "El retorno sirve para aprender qué ocurrió. Una dependencia que falla pide renegociación o alternativa. No demuestra un fallo personal ni la eficacia o ineficacia general de una herramienta.",
    tool: "revision",
    source: "Revisión y retorno · AC17 · CC18 · MC17",
  },
  {
    id: "multiple",
    title: "Dos cuidados a la misma hora",
    scene:
      "Coinciden dos responsabilidades cotidianas en ámbitos distintos. Ambas dependen de ti por costumbre.",
    options: [
      "Prometer atender ambas a la vez.",
      "Abandonar una sin comunicarlo.",
      "Hacer visible el conflicto y acordar prioridades y cobertura.",
    ],
    best: 2,
    feedback:
      "El multicuidado requiere mostrar necesidades, tiempos y límites en conjunto. Un acuerdo explícito puede cambiar el reparto. Las prioridades clínicas o de seguridad necesitan valoración competente.",
    tool: "contingencia",
    source: "Policuidado · Cuidosfera POL · AC13 · AC18 · CC07 · MC08",
  },
];

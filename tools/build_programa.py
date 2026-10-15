#!/usr/bin/env python3
"""Materializa el programa práctico original de CareLab 2.0 y verifica sus fuentes.

Las unidades son adaptaciones educativas de las guías del proyecto, no nuevos
protocolos clínicos ni adaptaciones abreviadas de intervenciones manualizadas.
El script se ejecuta desde cualquier carpeta. No modifica los documentos fuente.
"""
from __future__ import annotations

import argparse
import json
from corpus_locations import CorpusLocations
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
TOOLS = {"mapa", "plan", "reparto", "limites", "descanso", "consulta", "economia", "contingencia", "revision"}
DIMENSIONS = {"tiempo", "cuerpo", "mente", "emociones", "relaciones", "dinero", "organizacion", "apoyos"}

MODULES = [
    ("m01", "Empezar por lo que importa", "Elige una necesidad real, distingue lo que puedes decidir y prepara una salida suficiente. Puedes entrar aquí o ir directamente a cualquier otro módulo."),
    ("m02", "Ver la carga completa", "Haz visible lo que haces, recuerdas y coordinas, incluidos los costes que no aparecen en una lista de tareas."),
    ("m03", "Recuperar tiempo y descanso", "Convierte una pausa anunciada en una oportunidad con cobertura real y conserva un espacio que siga siendo tuyo."),
    ("m04", "Dar espacio a tu propia vida", "Prepara acceso a tu atención, apoyo elegido e intimidad. Las decisiones de salud se atienden fuera de BrainBox con ayuda competente."),
    ("m05", "Pedir y repartir de verdad", "Pasa de «avisa si necesitas algo» a encargos aceptados, responsabilidad compartida y relevos que pueden funcionar."),
    ("m06", "Límites y relaciones habitables", "Expresa disponibilidad, protege la voz de cada persona y conserva vínculos sin convertir el cuidado en control o deuda."),
    ("m07", "Dinero, trabajo y condiciones", "Aclara costes y pendientes, prepara conversaciones laborales y localiza quién debe responder por las condiciones materiales."),
    ("m08", "Conseguir apoyos utilizables", "Distingue un contacto de una ayuda recibida y prepara el acceso con horario, transporte, idioma y seguimiento posibles."),
    ("m09", "Varios cuidados y continuidad", "Organiza las colisiones entre papeles, las interrupciones y los cambios de servicio sin asignarte todo por defecto."),
    ("m10", "Cuidar a quien cuida", "Ofrece ayuda que se pueda aceptar o rechazar, concreta cambios organizativos y revisa también los límites de quien apoya."),
    ("m11", "Cuidado con el cuidado", "Examina una rutina, una tecnología o un cambio del entorno por sus efectos en todas las personas implicadas."),
    ("m12", "Cambiar, revisar y seguir", "Prepara transiciones y conserva sólo lo que ayuda. Revisa resultados reales sin convertir el programa en otra obligación."),
]

UNITS = []


def unit(n, title, summary, why, steps, example, reflection, tool, refs, boundary, dimensions, minutes=4):
    UNITS.append({
        "id": f"u{n:02d}", "moduleId": f"m{(n - 1) // 3 + 1:02d}",
        "title": title, "summary": summary,
        "duration": f"Unos {minutes} minutos de lectura. La práctica no tiene plazo: puedes pausar o terminar aquí.",
        "why": why, "steps": steps, "example": "Ejemplo ficticio. " + example,
        "reflection": reflection, "tool": tool, "sourceRefs": refs.split(),
        "boundary": boundary, "dimensions": dimensions.split(),
    })


unit(1, "Una necesidad, una salida posible",
     "Sal con una frase que explique qué te falta y qué condición necesita cambiar.",
     "Cuando casi todo pesa, añadir una lista de hábitos puede aumentar el trabajo. Una escena concreta permite separar una necesidad de la primera solución que se te ocurre y reconocer lo que depende de otras personas o servicios.",
     ["Elige una escena reciente que quieras cambiar: una comida interrumpida, una gestión repetida o un encuentro cancelado. En Mapa escribe lo ocurrido, sin juzgar tu capacidad.",
      "Completa: «Necesito…; ahora lo impide…». Descansar es una necesidad; apuntarte a un curso es sólo una opción, que puede encajar o no.",
      "Señala qué querrías conservar. Una mejora no debería borrar una relación, una preferencia o un apoyo que sí funciona.",
      "Elige una salida suficiente para este momento: aclarar algo, preparar una petición, simplificar una tarea o reconocer una necesidad sin cobertura. No hace falta resolverlo todo para cerrar."],
     "Mar quiere comer cuando tiene hambre, pero no alcanza los utensilios de la cocina compartida. Anota que necesita acceso, no un plan de motivación. Queda pendiente acordar una solución accesible y solicitar valoración si la adaptación la requiere.",
     "Si sólo pudiera cambiar una condición de esta escena, ¿cuál abriría más margen sin crear otro problema?",
     "mapa", "AC01 AC02 MC01", "Si la escena implica riesgo o una situación médica, psicológica o legal, no la resuelvas con BrainBox. Busca ayuda competente; puedes preparar la consulta y su logística por separado.",
     "tiempo mente organizacion apoyos")

unit(2, "Separar tarea, condiciones y experiencia",
     "Localiza el problema donde se puede cambiar y evita asignártelo entero.",
     "Una misma escena tiene trabajo que realizar, condiciones que lo hacen posible y una experiencia personal. Sentirte desbordado no demuestra que te organices mal. Tener un calendario tampoco crea una segunda persona disponible.",
     ["En Mapa describe una tarea con un verbo: acompañar, comprar, coordinar o esperar una respuesta. Incluye el tiempo de estar pendiente, si eso es lo que pesa.",
      "Anota la condición que falta: cobertura, información comprensible, permiso, material, transporte o una decisión del servicio. Conserva lo que no sabes como pendiente.",
      "Si quieres, añade cómo te afecta con tus palabras. Puedes omitir emociones e intimidades; no son un requisito para solicitar apoyo.",
      "Identifica quién tiene capacidad sobre esa condición: tú, alguien que acepte colaborar, una organización o un servicio. Una petición que puedes hacer y una decisión que otra parte debe tomar son acciones distintas."],
     "Una auxiliar no consigue hacer su pausa porque continúa siendo el único contacto del turno. El mapa distingue la pausa deseada, la falta de cobertura y su cansancio. La decisión de asignar cobertura corresponde a la organización; no se sustituye por un consejo para relajarse.",
     "¿Estoy intentando cambiar una emoción cuando lo que falta es un recurso o una decisión ajena?",
     "mapa", "AC07 CC04 MC02", "El mapa no diagnostica malestar ni evalúa riesgos. Si aparecen necesidades clínicas, protección o cuestiones jurídicas, corresponde su respuesta competente, fuera del método.",
     "mente emociones organizacion apoyos")

unit(3, "Preparar una acción que se pueda revisar",
     "Convierte una decisión cotidiana en un plan con apoyos, límites y una revisión preparada antes de actuar.",
     "Una acción pequeña sólo sirve si es suficiente para su finalidad. En BrainBox, la AMV prepara la acción y el REV prepara qué permitirá decidir después. Hacer algo, obtener un cambio y que ese cambio compense su coste son cuestiones distintas.",
     ["Comprueba primero el alcance. Ante riesgo o situación médica, psicológica o legal, STOP: no apliques BrainBox y pide ayuda competente. Las herramientas de consulta y organización logística pueden servir sin aplicar el método.",
      "Para una decisión cotidiana pertinente, abre Mi plan y escribe qué se hará, para qué, quién acepta hacerlo, qué apoyos necesita y qué dependencia sigue pendiente.",
      "Prepara ahora la revisión: qué observarás, quién lo contará o comprobará, cuándo tendrá sentido revisarlo y qué decisión permitirá. Puedes usar una conversación en lugar de un registro continuo.",
      "Añade qué haría parar o cambiar el plan. Una alternativa sin confirmar, una carga no aceptada o una necesidad que excede tu competencia impiden darlo por listo.",
      "Guarda sólo el siguiente paso. No necesitas explorar todos los ejes ni redactar un relato; puedes cerrar sin actuar si todavía falta una condición esencial."],
     "Joel quiere dejar de coordinar una compra semanal. Su hermana acepta detectar faltantes, encargar y confirmar la entrega. Antes de probarlo acuerdan revisar si Joel tuvo que seguir recordándolo. Aún no hay resultado: el plan permite comprobarlo después.",
     "¿Mi plan dice cómo sabremos si ayudó, o sólo qué tarea quedará marcada como hecha?",
     "plan", "AC17 CC18 MC18", "El STOP de BrainBox detiene el método, no los cuidados ordinarios ni el acceso a ayuda. Esta unidad explica una adaptación educativa; no acredita eficacia o seguridad clínica del programa.",
     "mente organizacion apoyos", 5)

unit(4, "Sacar de tu cabeza una cadena completa",
     "Elige una responsabilidad invisible y delimita todo lo que incluye antes de repartirla.",
     "Recordar, anticipar, decidir y confirmar también es cuidar. Delegar sólo la ejecución puede dejarte la dirección completa del trabajo. Hacer visible una cadena permite hablar de responsabilidad sin llevar un registro de cada minuto.",
     ["Elige un asunto cotidiano recurrente y no clínico, por ejemplo abastecimiento doméstico, transporte o agenda. En Mapa anota cómo comienza y cuándo puede darse por cerrado.",
      "Describe sus partes: detectar la necesidad, preparar, hacer y comprobar. Señala cuáles sigues sosteniendo aunque otra persona ejecute el encargo.",
      "Distingue lo imprescindible de lo que se mantiene por costumbre. No reduzcas necesidades asistenciales; empieza por duplicaciones o expectativas domésticas negociables.",
      "Escoge qué parte debe desaparecer, simplificarse o cambiar de responsable. Si quieres transferir la cadena, prepara el encargo en Reparto y deja su aceptación pendiente hasta recibirla."],
     "Nuria pide a un hermano que compre productos, pero ella revisa existencias, busca precios y recuerda cada encargo. Nombra la cadena completa y propone que él asuma el abastecimiento doméstico acordado. Los productos y decisiones clínicas conservan su canal profesional.",
     "Después del cambio, ¿dejaré de recordar algo o sólo tendré una nueva tarea de supervisión?",
     "mapa", "AC07 MC07", "No transfieras decisiones, claves o tareas profesionales para las que no exista autorización o competencia. Si una parte es clínica o jurídica, delimita y consulta esa parte fuera de BrainBox.",
     "tiempo mente organizacion")

unit(5, "Contar lo que el calendario no muestra",
     "Reconoce esperas, desplazamientos y colisiones entre papeles sin convertir tu día en una auditoría.",
     "Dos tareas de media hora pueden ocupar una mañana por los trayectos o la disponibilidad que exigen. El cuidado familiar, el empleo y el apoyo comunitario pueden recaer a la vez en la misma persona. Comparar sólo horas visibles oculta esas diferencias.",
     ["Elige un día o una escena representativa que recuerdes. En Mapa identifica trabajo directo, coordinación, espera y desplazamiento; basta con describirlos, sin medir cada minuto.",
      "Añade qué oportunidad impidió cada tramo: trabajar, comer, descansar, estudiar o atender otro cuidado. No sumes experiencias distintas en una puntuación de carga.",
      "Señala una colisión concreta y a quién afecta. Incluye tus necesidades de accesibilidad, idioma, energía o transporte si condicionan el arreglo.",
      "Busca una modificación en el origen: agrupar gestiones compatibles, cambiar una coordinación, pedir un horario utilizable o trasladar un encargo completo. Si nadie puede asumirlo, deja visible la cobertura que falta."],
     "Luis acompaña a su madre a una cita de veinte minutos en otra localidad, pero pierde cuatro horas entre transporte y espera. Al negociar ayuda describe el trayecto entero y el turno laboral afectado, sin tratar la consulta breve como una tarea pequeña.",
     "¿Qué parte de mi disponibilidad está siendo contada como tiempo libre por otras personas?",
     "mapa", "AC13 AC15 CC07", "Un mapa de tiempo no determina derechos laborales ni seguridad asistencial. Las decisiones sobre permisos, riesgos o atención deben consultarse por sus vías competentes.",
     "tiempo cuerpo dinero organizacion apoyos")

unit(6, "Reducir ruido, avisos y búsquedas",
     "Prepara un acuerdo de comunicación que reduzca interrupciones sin perder información necesaria.",
     "Un grupo de mensajes o una aplicación pueden crear trabajo de mantener datos, contestar y verificar. La información ayuda cuando cambia una decisión. Acumular enlaces, alarmas o búsquedas no garantiza estar mejor acompañado.",
     ["Elige un canal que te interrumpa. En Límites escribe qué función debe cumplir y qué mensajes se repiten sin aportar una decisión.",
      "Propón quién recopilará los asuntos no urgentes y cómo se comunicarán, con aceptación de esa persona. Mantén el canal necesario para incidencias del plan asistencial vigente.",
      "Antes de buscar otro recurso, formula una pregunta concreta: qué necesitas saber y quién puede responder con competencia. Cierra la búsqueda cuando tengas información suficiente o identifiques que falta consulta.",
      "Comprueba con quienes participan qué datos mínimos necesitan y qué alternativa utilizará quien no accede al canal. No agregues contactos ni reenvíes informes por defecto.",
      "En la revisión observa interrupciones y trabajo de mantenimiento. Si el nuevo sistema añade más comprobaciones, simplifícalo o vuelve a un formato más sencillo."],
     "Cuatro familiares preguntan cada día lo mismo a Ana. Una persona acepta reunir novedades logísticas en un mensaje acordado. No recibe acceso general a la historia clínica y los contactos asistenciales necesarios siguen por su cauce.",
     "¿La nueva herramienta me ahorra una decisión o me hace responsable de otro lugar que revisar?",
     "limites", "AC14 MC12 CC10", "No silencies avisos asistenciales necesarios ni modifiques un circuito de seguridad por tu cuenta. Las decisiones clínicas, jurídicas y de tratamiento de datos profesional requieren su revisión competente.",
     "tiempo mente organizacion relaciones", 5)

unit(7, "Una pausa con cobertura real",
     "Deja preparado qué necesitas para estar fuera de servicio durante una franja que elijas.",
     "Tener a alguien cerca no equivale a poder descansar. Hace falta una cobertura capaz, aceptada y con límites claros. El tiempo ofrecido, el tiempo realmente libre y sentir recuperación son resultados diferentes.",
     ["En Descanso escribe qué quieres poder hacer: dormir, salir, estar a solas o simplemente no responder. No necesitas justificarlo como una actividad productiva.",
      "Define qué necesidades deben seguir cubiertas durante esa franja y quién podría asumirlas. No cuentes un nombre como cobertura hasta que la persona acepte y pueda realizar la función.",
      "Acordad sólo la información necesaria, el canal ante incidencias y cómo se devuelve la responsabilidad. Las tareas específicas deben seguir el plan profesional vigente y su formación correspondiente.",
      "Comprueba la alternativa si falla el relevo. Si no está confirmada, marca el descanso como pendiente de cobertura y prepara la petición al apoyo o servicio adecuado.",
      "Después de una pausa realizada, revisa si hubo tiempo realmente libre, qué coordinación exigió y qué deseas cambiar. No te pongas nota por haber descansado más o menos."],
     "Rosa propone acompañar a Daniel para que Carmen vea a una amiga. Antes de confirmarlo, comprueban que las necesidades de esa franja caben en las capacidades de Rosa y que Daniel acepta la visita. Si no hay cobertura suficiente, la franja sigue pendiente.",
     "¿Podré dejar de dirigir el cuidado a distancia durante esta pausa?",
     "descanso", "AC04 CC06", "No reduzcas atención necesaria para cumplir el descanso. Los problemas de sueño y las decisiones nocturnas de salud requieren valoración competente, fuera de BrainBox; el relevo se organiza conforme a ella.",
     "tiempo cuerpo mente apoyos", 5)

unit(8, "Proteger una necesidad básica",
     "Organiza una oportunidad concreta para comer, usar el baño o hacer una pausa que ahora se interrumpe.",
     "El cuidado del cuerpo necesita condiciones materiales. Una recomendación genérica de comer mejor o moverte más puede ignorar falta de tiempo, dinero, accesibilidad o cobertura. Primero conviene quitar el obstáculo que desplaza tu necesidad.",
     ["Elige una necesidad cotidiana que quieras proteger y describe qué la interrumpe. En Mi plan anota una ocasión concreta, no una meta de hábitos perfectos.",
      "Identifica qué se puede preparar o simplificar y qué tiene que asumir otra persona. Por ejemplo, recoger una compra acordada, disponer un espacio accesible o responder consultas no urgentes.",
      "Si eliges una actividad por disfrute, comprueba acceso, desplazamiento, apoyo y compatibilidad con tus posibilidades. No conviertas el esfuerzo de cuidar en una obligación de hacer más ejercicio.",
      "Deja preparado qué observarás: si existió la oportunidad y qué coste añadió. Si sólo se consiguió perdiendo sueño, aumentando molestias o cargando a alguien sin acuerdo, necesita ajustes."],
     "María termina comiendo tarde porque las entregas y llamadas coinciden con su comida. Un familiar ofrece recoger el pedido y agrupar preguntas no urgentes. No se diseña una dieta: se prepara una ocasión para que María pueda comer lo elegido.",
     "¿Qué podría simplificarse para atender esta necesidad sin añadir otra tarea de autocuidado?",
     "plan", "AC05 CC05", "Esta unidad no prescribe alimentación, ejercicio ni manejo de fatiga. Ante dolor, enfermedad, dudas de tolerancia o cualquier situación médica, busca orientación competente y no la resuelvas mediante BrainBox.",
     "cuerpo tiempo organizacion apoyos")

unit(9, "Un espacio que siga siendo tuyo",
     "Prepara una oportunidad elegida de ocio, amistad, cultura, silencio o sentido personal.",
     "Tu vida tiene valor aunque una actividad no mejore tu rendimiento al cuidar. La cultura puede acompañar o simplemente gustarte. No necesitas elegir contenidos sobre cuidados ni convertir el descanso en un curso obligatorio.",
     ["Elige algo que te interese ahora: música, lectura, una conversación, una práctica espiritual, un paseo accesible o no hacer nada. Puedes cambiar de preferencia respecto a antes.",
      "En Mi plan escribe qué condición permitiría esa oportunidad: privacidad, transporte, una franja sin interrupciones o compañía deseada. Si el cuidado requiere cobertura, prepárala por separado.",
      "Si deseas un recurso cultural, explora la Cuidoteca integrada por interés y formato. Lee sus avisos de contenido cuando los tenga y permite que la elección sea algo ajeno al cuidado.",
      "Acuerda la ayuda mínima necesaria sin contar intimidades que no quieras compartir. Después pregunta si existió el espacio y si lo deseas repetir; no si lo aprovechaste lo suficiente."],
     "Txomin quiere asistir a una conversación de lectura, pero no tiene transporte de vuelta. Su siguiente paso es comprobar un trayecto posible. Ir no demostraría recuperación emocional ni le obligaría a seguir asistiendo.",
     "¿Qué elegiría si no tuviera que explicar para qué sirve o cuánto me relaja?",
     "plan", "AC08 MC03", "La cultura, la música y el ocio no se ofrecen aquí como tratamientos. Si un contenido aumenta tu malestar puedes dejarlo; las necesidades psicológicas se atienden por su vía competente.",
     "tiempo emociones relaciones apoyos")

unit(10, "Preparar tu propia consulta",
     "Sal con preguntas concretas y con la logística necesaria para poder acudir a tu atención.",
     "Acompañar a otra persona a consultas no sustituye un espacio para tu salud. Tampoco trabajar en sanidad elimina tus necesidades como paciente. Esta unidad prepara acceso e información; las decisiones de salud quedan con los profesionales y contigo.",
     ["En Preparar consulta elige los asuntos que más te preocupan. Describe qué has observado, desde cuándo y cómo afecta a tu vida, sin convertirlo automáticamente en un efecto del cuidado.",
      "Anota qué pregunta quieres aclarar y qué información te han indicado llevar. Evita copiar una historia completa si no hace falta; usa los canales sanitarios apropiados para datos clínicos.",
      "Comprueba cita, transporte, comunicación y cobertura del cuidado. Una reserva no resuelve el acceso si todavía nadie puede sustituirte.",
      "Durante la consulta, pide aclaración de lo que no comprendas. Al volver, conserva el siguiente paso que hayas entendido y quién lo realizará; confirma las indicaciones clínicas con el profesional."],
     "Una enfermera ha aplazado varias veces su consulta porque coincide con el cuidado familiar. Prepara dos preguntas propias y solicita cobertura para poder asistir. Su experiencia laboral no se utiliza para autodiagnosticarse ni ajustar tratamientos.",
     "¿Qué barrera material tiene que resolverse para que mi atención pueda suceder?",
     "consulta", "AC03 AC05", "Esta actividad es preparación de consulta fuera de BrainBox. No interpreta síntomas, establece diagnósticos ni cambia tratamientos. Ante peligro inmediato o síntomas preocupantes de aparición intensa o repentina, accede a atención urgente sin esperar a terminar.",
     "cuerpo mente tiempo apoyos")

unit(11, "Elegir el apoyo que necesitas hoy",
     "Prepara una petición de escucha, compañía o ayuda práctica sin tener que contar toda tu vida.",
     "Se puede querer a alguien y estar enfadado con las condiciones de cuidado. No hay una emoción correcta que alcanzar. Una conversación puede servir si respeta lo que deseas y no intenta interpretar desde fuera lo que sientes.",
     ["Elige, si quieres, una frase sencilla sobre lo que necesitas ahora: «quiero hablar sin consejos», «necesito compañía» o «prefiero ayuda con esta gestión». Puedes saltarte cualquier relato emocional.",
      "En Límites prepara a quién podrías pedirlo, qué sí quieres compartir y qué prefieres mantener privado. La otra persona puede decir honestamente qué puede ofrecer.",
      "Aclara el tipo de respuesta que te ayudaría y cuándo quieres terminar la conversación. No te comprometas a seguir un ejercicio, meditar o pensar en positivo si no te sirve.",
      "Si deseas atención profesional, utiliza Preparar consulta para expresar la necesidad y facilitar el acceso. Después revisa si el apoyo respondió a lo pedido y cuánto esfuerzo exigió."],
     "Teresa quiere que su amiga la escuche sobre una semana difícil, sin organizar una reunión familiar. Lo dice antes de hablar y pide que no se comparta lo contado. La amiga ofrece ese rato, sin prometer resolver la situación ni diagnosticarla.",
     "¿Quiero que me escuchen, que me acompañen o que alguien asuma algo concreto? Puede ser más de una cosa.",
     "limites", "AC06 CC03", "Esta unidad organiza una petición de apoyo; no aplica BrainBox a una situación psicológica ni ofrece terapia. Si hay malestar persistente, miedo o daño posible, busca atención competente; ante peligro inmediato, atención urgente.",
     "emociones relaciones apoyos")

unit(12, "Intimidad y privacidad también para ti",
     "Prepara un límite cotidiano sobre espacio, visitas o información, conservando la voz de cada persona.",
     "El hogar puede convertirse en un lugar de trabajo y atención donde nadie dispone de privacidad. La intimidad de quien cuida y de quien recibe apoyos son necesidades distintas. Pedir tiempo privado no exige revelar detalles de tu vida afectiva o sexual.",
     ["Identifica una situación material que quieras cambiar: entrar sin avisar, visitas no acordadas, conversación privada que se interrumpe o datos que se comparten de más.",
      "En Límites formula una petición específica: avisar antes de entrar, acordar visitas o reservar un espacio. Incluye a quienes se verán afectados y admite que expresen necesidades diferentes.",
      "Comprueba qué cobertura o adaptación hace posible el acuerdo. El tiempo privado no se convierte en una obligación de contacto afectivo o sexual.",
      "Después permite que cada persona diga por separado si pudo expresar su preferencia y si el acuerdo funcionó. Mantén fuera del registro los detalles íntimos que no cambian la organización."],
     "Rocío y su pareja desean cerrar la puerta durante un rato. Acuerdan una regla de aviso con las visitas y comprueban la cobertura necesaria para la familiar que vive con ellas. No tienen que explicar qué harán en privado.",
     "¿Estoy pidiendo una condición para mi intimidad o intentando decidir la intimidad de otra persona?",
     "limites", "AC09 MC06", "Las dudas sobre consentimiento, salud sexual, capacidad, coacción o derechos requieren apoyo competente y quedan fuera de BrainBox. Si existe miedo o violencia, una conversación conjunta puede no ser segura.",
     "relaciones cuerpo emociones organizacion")

unit(13, "Una petición que se pueda responder",
     "Redacta un encargo concreto, con condiciones y una alternativa si la respuesta es no.",
     "«Necesito ayuda» nombra una realidad, pero a veces deja sin aclarar qué se está pidiendo. Una solicitud concreta permite saber qué se acepta. Si ya has recibido negativas, no significa que te falte habilidad: puede faltar capacidad real en la red.",
     ["En Reparto elige una tarea que pueda asumir otra persona y explica para qué serviría. Incluye sus límites: qué abarca y qué no autoriza a decidir.",
      "Prepara una frase con tarea, ocasión y respuesta necesaria: «¿Puedes encargarte de… y confirmarme si es posible?». Comparte únicamente la información que necesita para responder.",
      "Marca el estado como propuesto hasta que exista aceptación. Si la respuesta es parcial, registra sólo lo realmente aceptado; no lo completes por suposición.",
      "Si la respuesta es no, distingue entre adaptar el encargo, contactar con otra ayuda o acudir a un servicio. No conviertas cada negativa en obligación de persuadir mejor."],
     "En lugar de pedir a su hermano que se implique más, Maite propone que asuma la recogida de un pedido ya acordado y confirme entrega. Su hermano sólo puede una vez: esa ayuda queda acotada, sin presentarla como cobertura semanal.",
     "¿La otra persona sabrá exactamente qué está aceptando y podrá decir que no?",
     "reparto", "AC10 CC02 CC04", "La cercanía no concede competencia clínica ni representación. No asignes una tarea que necesite formación o autorización sin resolverlas con quien corresponda; ante riesgo, salud o derecho, no apliques BrainBox.",
     "relaciones tiempo apoyos organizacion")

unit(14, "Repartir responsabilidad, no sólo recados",
     "Deja preparado un acuerdo que incluya detectar, preparar, hacer y confirmar una tarea.",
     "La corresponsabilidad no exige que todas las personas dediquen las mismas horas. Sí requiere que las cargas, las capacidades y los compromisos sean visibles. Quien vive cerca, es mujer o tiene experiencia sanitaria no queda encargado por defecto.",
     ["Escoged una cadena cotidiana que no requiera decisiones especializadas. En Reparto escribid las partes que puede asumir su responsable de principio a fin.",
      "Escuchad las preferencias de quien recibe el apoyo y la disponibilidad de quienes participan. No asignéis tareas a personas ausentes como si hubieran aceptado.",
      "Concretad qué inicia la responsabilidad, qué permite darla por terminada, cómo avisar de un cambio y qué información mínima necesita circular.",
      "Separad responsables confirmados, propuestas y tareas sin cubrir. Una contribución económica o un recado ocasional no borra automáticamente otras necesidades.",
      "Preparad una revisión sobre trabajo que ha dejado de recaer en la persona habitual y carga que ha aparecido en otras. Cambiad el acuerdo si sólo mueve el trabajo invisible de una persona a otra sin aceptación."],
     "La familia acuerda que una hermana gestione los desplazamientos ordinarios: comprobar horario, reservar el servicio y confirmar el viaje. Las consultas y decisiones sanitarias siguen con sus interlocutores. La hermana acepta esa función, con un límite de disponibilidad y aviso de cambios.",
     "¿Quién tendrá que recordar este acuerdo para que suceda? ¿Ha aceptado también esa coordinación?",
     "reparto", "CC05 CC07 CC17", "Si hay amenazas, control económico o temor a represalias, no fuerces una reunión de reparto: busca apoyo independiente competente. Un acuerdo de tareas no sustituye un contrato, un plan asistencial ni una autorización jurídica.",
     "tiempo mente relaciones organizacion apoyos", 5)

unit(15, "De promesa de relevo a cobertura confirmada",
     "Comprueba si la ayuda propuesta puede cubrir realmente la función antes de contar con ella.",
     "Buena voluntad y presencia no garantizan relevo. Hay que comprobar capacidades, preferencias y condiciones. La falta de cobertura no se soluciona llamando «plan B» a una persona que nunca ha aceptado.",
     ["En Plan B describe la franja o función que necesitas cubrir y qué tareas incluye. Separa el acompañamiento cotidiano de lo que exige formación o intervención profesional.",
      "Comprueba con quien releva qué acepta y puede hacer. Si falta aprendizaje específico, solicita preparación competente antes de considerar disponible ese relevo.",
      "Aclara qué información vigente puede conocer, por qué canal y a quién contactar. No copies instrucciones clínicas de memoria ni improvises un plan de emergencia.",
      "Registra una alternativa sólo si está confirmada. Si no existe, deja el hueco visible y prepara el contacto con la red o el servicio responsable de buscar cobertura.",
      "Antes de la ocasión, comprueba si sigue vigente el acuerdo. Después, revisa si se realizó y si liberó la función prevista, sin confundir esa comprobación con una evaluación de salud."],
     "Jon ofrece acompañar a su hermana, pero no tiene preparación para una ayuda física que podría ser necesaria. Su presencia no se cuenta como relevo completo. Puede asumir otra tarea mientras se consulta qué cobertura y formación hacen falta.",
     "¿Qué dato me permite afirmar que la alternativa existe, además de tener un teléfono apuntado?",
     "contingencia", "CC06 CC08 AC11", "Si falla cobertura esencial, activa el apoyo competente; no dejes una necesidad sin atender para cumplir el plan. Riesgo y decisiones médicas, psicológicas o legales activan el STOP del método.",
     "apoyos organizacion tiempo cuerpo", 5)

unit(16, "Decir hasta dónde puedes llegar",
     "Prepara un límite que nombre tu disponibilidad y la necesidad que sigue pendiente.",
     "Un límite no necesita demostrar que eres quien más sufre. Tampoco garantiza que el entorno coopere. Puede servir para dejar de presentar como disponible una ayuda imposible y localizar quién debe organizar otra respuesta.",
     ["Elige una demanda concreta. En Límites escribe qué puedes asumir de verdad y qué parte no puedes continuar ofreciendo.",
      "Prepara una frase clara: «Puedo ocuparme de…; para… necesitamos otra cobertura». Evita prometer una disponibilidad futura que todavía no tienes.",
      "Señala a quién debe llegar el cambio y qué continuidad hay que organizar. Si el cuidado es empleo o voluntariado organizado, utiliza sus responsables y procedimientos.",
      "Distingue comunicar un límite de tener la necesidad resuelta. Si no aparece alternativa, conserva ese déficit como pendiente y busca el interlocutor capaz de responder.",
      "Revisa si el acuerdo se respeta y si puedes expresar desacuerdo sin castigo. No midas el éxito sólo por haber pronunciado la frase."],
     "Un profesional que cuida también en casa comunica que no puede seguir siendo el coordinador familiar durante su turno laboral. Propone transferir una gestión completa y pide confirmación de cobertura. Su especialidad no lo convierte en contacto permanente.",
     "¿Qué sigo ofreciendo por escrito o por costumbre aunque ya no puedo sostenerlo?",
     "limites", "AC10 CC14 MC06", "Si el límite puede poner en riesgo vivienda, ingresos o seguridad, busca asesoramiento independiente antes de exponerte. Amenazas, violencia o cuestiones jurídicas no se resuelven con una plantilla ni con BrainBox.",
     "relaciones tiempo emociones apoyos")

unit(17, "Dos voces en una misma decisión",
     "Prepara una conversación que conserve tus límites y las preferencias de quien recibe apoyo.",
     "Necesitar ayuda no borra la autonomía. Necesitar descanso tampoco obliga a quien cuida a estar siempre disponible. Las dos necesidades pueden coexistir sin que una parte tenga que desaparecer para que la otra sea legítima.",
     ["Escoge una decisión cotidiana que admita acuerdo, como una visita o una actividad. Anota por separado qué quiere conservar cada persona y qué apoyo acepta.",
      "Comprueba qué hace falta para participar: lenguaje sencillo, tiempo, interpretación o apoyo de comunicación. No presupongas una preferencia por edad, diagnóstico, parentesco o identidad.",
      "En Mi plan conserva lo acordado y también lo que sigue en desacuerdo. No transformes el silencio, la ausencia o la dependencia de ayuda en consentimiento.",
      "Explorad una alternativa que respete ambas posiciones. Si aún no existe, identificad la barrera y quién puede ayudar; no llaméis egoísmo al límite ni imprudencia al deseo de participar."],
     "Leire quiere acudir a una actividad y su hermano no puede acompañarla toda la tarde. Anotan el deseo de participar y el límite de disponibilidad. Comprueban accesibilidad y otros apoyos sin decidir por ella ni dar por cubierto lo que falta.",
     "¿Pueden ambas personas decir qué prefieren y qué no aceptan sin perder todo el apoyo?",
     "plan", "MC04 MC05 CC11", "Este ejercicio no determina capacidad jurídica, consentimiento clínico ni riesgos aceptables. Ante dudas de salud, riesgo, derechos o coacción, pide valoración competente y no apliques BrainBox.",
     "relaciones apoyos organizacion emociones")

unit(18, "Conservar vínculos sin deuda permanente",
     "Elige una forma de relación que no esté ocupada siempre por tareas, explicaciones o gratitud obligatoria.",
     "Familia, amistades, pareja, comunidad o creencias pueden sostener la vida, pero también imponer expectativas. El apoyo puede ser valioso sin comprar acceso a tu intimidad ni imponer una interpretación positiva del cuidado.",
     ["Identifica un vínculo o espacio que quieras conservar por elección propia. Puede ser una familia elegida, una amistad, un grupo o una actividad comunitaria.",
      "En Límites prepara qué encuentro o contacto deseas y qué no quieres que ocupe ese espacio: preguntas de cuidado, consejos, exposición pública o compromisos nuevos.",
      "Comprueba condiciones materiales y de trato: accesibilidad, idioma, transporte, coste, libertad para escuchar sin hablar y posibilidad de salir del grupo.",
      "Si quieres un recurso cultural o comunitario, utiliza las fichas integradas para elegir por interés. Decide después si deseas mantener el contacto; no tienes que agradecer mediante disponibilidad ilimitada."],
     "Una cuidadora desea encontrarse con una amiga para hablar de cine. Pide que esa tarde no sea una revisión de su situación familiar. Si la conversación cambia, puede recordarlo o terminar el encuentro sin deber un relato íntimo.",
     "¿Este vínculo me permite tener una vida propia y discrepar, o tengo que representar siempre un papel?",
     "limites", "AC08 CC11 MC03", "Si una relación contiene coacción, amenazas o violencia, prioriza protección y apoyo competente. No utilices una conversación de límites como prueba obligatoria antes de pedir ayuda.",
     "relaciones emociones tiempo apoyos")

unit(19, "Ver el coste que realmente puedes asumir",
     "Ordena gastos e ingresos relevantes para una decisión, dejando separados el dinero y el tiempo.",
     "El coste del cuidado incluye pagos, transporte, coordinación y oportunidades que cambian. Una ayuda solicitada todavía no es ingreso disponible. Hacer visible un déficit permite pedir apoyo; una tabla no lo convierte en un problema de disciplina personal.",
     ["En Economía elige un periodo útil y una decisión concreta, por ejemplo comparar dos apoyos. Anota sólo los datos necesarios y evita detalles de cuentas de otras personas sin autorización.",
      "Separa gastos confirmados, estimaciones y costes aún por consultar. Añade transporte, acceso y coordinación cuando cambien la viabilidad de la opción.",
      "Distingue ingresos y ayudas confirmadas de solicitudes pendientes. Registra el tiempo o la pérdida de oportunidades aparte: no son dinero disponible para pagar.",
      "Señala qué coste compromete necesidades básicas y qué información necesitas antes de decidir. Si hay insuficiencia, prepara una consulta social o económica pertinente.",
      "Revisa la opción por su coste completo y por quién lo asume. Lo que una organización ahorra puede convertirse en trabajo o gasto de una familia o una trabajadora."],
     "Un centro de día parece asequible, pero el transporte de ida y vuelta exige varios trayectos. La comparación añade ese desembolso y el tiempo de organización por separado. Una prestación pedida sigue marcada como pendiente.",
     "¿Qué coste estoy dejando fuera porque todavía lo absorbe alguien sin cobrar o sin decirlo?",
     "economia", "AC13 CC09 MC07", "Este registro no ofrece asesoramiento financiero, tributario o jurídico ni confirma prestaciones. Para decisiones de contratación, patrimonio o derechos, consulta a quien corresponda fuera de BrainBox.",
     "dinero tiempo organizacion apoyos", 5)

unit(20, "Preparar una conversación sobre trabajo",
     "Documenta una condición que necesita respuesta del empleador o del servicio y formula una petición concreta.",
     "Pausas, cobertura, horarios, material y canales de incidencia no dependen sólo del esfuerzo personal. El afecto por quien recibe cuidados no convierte el trabajo en disponibilidad ilimitada. Tener además responsabilidades familiares cuenta al preparar la conversación.",
     ["Describe un hecho del trabajo que se repite: una pausa interrumpida, una función sin cobertura o una tarea para la que falta material. Evita incluir datos identificativos de pacientes o usuarios.",
      "En Preparar consulta anota qué condición quieres aclarar y quién tiene capacidad de decidir. Separa organización de tareas, prevención, condiciones laborales y apoyo emocional.",
      "Prepara la pregunta sobre medidas posibles, responsable y seguimiento. Si valoras cambios de jornada o empleo, pide información competente sobre consecuencias antes de decidir.",
      "Registra la respuesta recibida y lo que sigue pendiente. Una sesión de bienestar no sustituye una medida sobre cobertura; comprueba ambas necesidades por separado."],
     "Un equipo recibe una oferta de escucha tras una semana difícil, pero las pausas siguen sin relevo. La responsable recoge ambas necesidades: espacio de apoyo con confidencialidad clara y decisión organizativa sobre cobertura. No da una por resuelta con la otra.",
     "¿Quién puede cambiar esta condición y qué respuesta concreta necesito de esa persona u órgano?",
     "consulta", "AC13 CC15 MC10", "La valoración de riesgos laborales, los derechos y las decisiones clínicas corresponden a profesionales y procedimientos competentes. Esta es preparación de consulta fuera de BrainBox, no asesoramiento laboral.",
     "tiempo cuerpo dinero organizacion apoyos")

unit(21, "Seguir un trámite sin perseguirlo a ciegas",
     "Deja claro el siguiente paso de una solicitud y distingue información, resolución y apoyo recibido.",
     "Un enlace o una solicitud registrada no prueban que una ayuda vaya a concederse o a llegar a tiempo. El seguimiento sirve cuando identifica interlocutor y respuesta pendiente, sin obligarte a rehacer una historia en cada contacto.",
     ["Elige un trámite existente. En Preparar consulta anota organismo, canal y referencia sólo si es necesaria. No copies documentos completos ni claves de acceso.",
      "Describe su estado con precisión: información solicitada, solicitud recibida, documentación pendiente, resolución comunicada o apoyo iniciado.",
      "Copia un plazo únicamente desde la notificación oficial vigente y conserva su fuente. Si no lo entiendes, prepara la pregunta; CareLab no calcula vencimientos legales.",
      "Define quién hará el siguiente contacto, qué respuesta necesita y por qué canal. Si alguien te ayuda, debe actuar dentro de su autorización.",
      "Si la respuesta no llega o el apoyo no cubre la necesidad, pide orientación sobre alternativas y seguimiento formal al interlocutor competente. Deja constancia breve de lo que falta."],
     "Una familia ha entregado documentos para solicitar apoyo. En el registro figura «solicitud recibida», no «relevo disponible». Preparan una pregunta sobre el próximo paso y sobre cómo atender la necesidad mientras continúa el procedimiento.",
     "¿Sé qué espero de la próxima llamada y quién puede contestarlo?",
     "consulta", "CC09 MC11", "No se interpretan normas, plazos, representación o elegibilidad en esta unidad. Cualquier cuestión jurídica queda fuera de BrainBox y necesita comprobación competente en el territorio y fecha correspondientes.",
     "mente dinero organizacion apoyos", 5)

unit(22, "De una lista de contactos a una red real",
     "Clasifica cada apoyo por lo que ofrece, lo que ha aceptado y lo que todavía falta.",
     "Una familia numerosa, un directorio o muchos mensajes no garantizan ayuda disponible. Una red útil puede combinar apoyos informales, comunitarios y profesionales, con funciones y límites distintos.",
     ["En Reparto empieza por una necesidad concreta de apoyo. Identifica personas, servicios o grupos que podrían responder, sin dar por supuesta disponibilidad por parentesco o cercanía.",
      "Para cada opción, anota función, condiciones y estado: por contactar, propuesta, aceptada o realmente recibida. No hace falta dibujar toda tu red social.",
      "Comprueba si la función requiere preparación profesional. Una amistad puede asumir transporte o compañía sin convertirse en sustituto de un servicio especializado.",
      "Elige el primer contacto y quién lo hará. Si no hay una opción suficiente, conserva el hueco y prepara la consulta social o institucional pertinente.",
      "Tras una ayuda recibida, pregunta si fue utilizable y qué esfuerzo de coordinación dejó. Actualiza la red cuando una ayuda repetidamente no se cumple."],
     "Una vecina puede recoger compras, un amigo ofrece un viaje ocasional y un servicio debe valorar relevo. El mapa conserva esas funciones diferentes. No presenta tres contactos como tres personas disponibles para cualquier cuidado.",
     "¿Qué apoyo existe hoy de verdad y cuál es todavía una posibilidad?",
     "reparto", "AC11 CC08 MC09", "Los recursos integrados orientan, pero no confirman plazas, requisitos ni atención local actual. No delegues una necesidad esencial en una opción sin verificar ni uses la red informal para resolver una crisis.",
     "apoyos organizacion relaciones tiempo")

unit(23, "Comprobar que un recurso se puede usar",
     "Examina una opción por sus condiciones reales antes de invertir más esfuerzo.",
     "Un apoyo pertinente puede seguir siendo inaccesible por horario, dinero, transporte, lectura, lengua o falta de sustitución. Esas barreras piden cambios en la oferta o en el acceso; no prueban falta de interés.",
     ["Elige una ficha de CareTools o Cuidoteca integrada que responda a tu necesidad. Anota qué función esperas obtener, sin asumir que el nombre del recurso garantiza un resultado.",
      "En Preparar consulta reúne las dudas que cambian la decisión: disponibilidad, requisitos, coste total, formato, idioma, accesibilidad, transporte y cobertura del cuidado.",
      "Comprueba las condiciones en el canal responsable. Una ficha del proyecto es un punto de partida; las fechas, plazas y requisitos pueden cambiar.",
      "Pide una adaptación o alternativa concreta cuando falle una condición: otra modalidad, apoyo de comunicación, acceso presencial o un horario posible. No asignes por defecto la traducción a un menor.",
      "Decide continuar, comparar otra opción o dejar la necesidad pendiente con un interlocutor. No necesitas completar un curso para demostrar que intentaste cuidarte."],
     "Un taller parece adecuado, pero obliga a desplazarse cuando no hay relevo. La persona pregunta por otra convocatoria o formato y por cobertura disponible. La inscripción no se marca como apoyo recibido.",
     "¿Qué exige esta opción que en mi vida real todavía no está disponible?",
     "consulta", "AC15 CC10 CC11", "No se garantiza disponibilidad territorial ni se traslada una prestación entre comunidades. Los programas profesionales conservan sus requisitos, licencia, formación y alcance; una lectura abreviada no los reproduce.",
     "apoyos tiempo dinero cuerpo organizacion", 5)

unit(24, "Cuando el apoyo no llega o no encaja",
     "Prepara una comunicación breve sobre la necesidad pendiente y la respuesta que falta.",
     "Reconocimiento, acceso, suficiencia y continuidad son etapas distintas. Haber recibido una resolución o un servicio no obliga a afirmar que resuelve tu necesidad. Un registro proporcionado puede ayudar a pedir una corrección sin trasladarte toda la gestión del sistema.",
     ["En Revisión separa qué se ofreció, qué se recibió y qué necesidad sigue sin cubrir. Utiliza hechos concretos: horario incompatible, cancelación, barrera de comunicación o falta de transporte.",
      "Anota la consecuencia práctica y para quién: no hubo relevo, se perdió una cita o la coordinación siguió recayendo en ti. No necesitas una puntuación de sufrimiento.",
      "Identifica el referente o canal competente y formula la respuesta que necesitas: aclaración, ajuste, alternativa o seguimiento de una falta de cobertura.",
      "Conserva el próximo contacto o compromiso recibido y comprueba si cambia la experiencia real. El cierre administrativo de una incidencia no demuestra que la necesidad esté atendida."],
     "El transporte asignado llega después del comienzo del recurso. El registro no dice «la familia no participa»: describe la incompatibilidad, pide una alternativa al referente y mantiene el acceso como pendiente hasta comprobarlo.",
     "¿La respuesta cambió la situación o sólo produjo otro documento?",
     "revision", "CC08 MC11 MC17", "Las reclamaciones, protección de derechos y responsabilidades requieren los canales competentes. Ante daño o falta de cobertura esencial, prioriza la atención correspondiente; no esperes a completar una revisión BrainBox.",
     "apoyos organizacion tiempo relaciones")

unit(25, "Cuando cuidas en varios lugares",
     "Separa papeles y localiza una colisión que necesita redistribución, sin hacerte disponible para todos a la vez.",
     "Puedes cuidar a hijos y ascendientes, trabajar en cuidados y atender a familiares, acompañar a distancia o necesitar apoyos propios. La experiencia de un papel no elimina los límites del otro. Los menores no deben convertirse en la alternativa automática.",
     ["En Mapa nombra tus escenarios de cuidado con etiquetas generales, sin datos íntimos: hogar, empleo, familia a distancia o apoyo comunitario. Añade tus propias necesidades.",
      "Elige una colisión entre escenarios: dos demandas en la misma franja, mensajes fuera del turno o viajes que impiden otro compromiso. Distingue demanda, obligación confirmada y expectativa ajena.",
      "Identifica qué responsabilidad corresponde a cada red u organización. Prepara una transferencia o una consulta específica; no unas todos los problemas en un plan que sólo tú debas coordinar.",
      "Si hay niños o adolescentes sosteniendo responsabilidades adultas, plantea la respuesta a adultos y servicios competentes, escuchando su voz. No les encargues gestionar el reparto.",
      "Guarda una primera colisión para trabajar con Reparto o Límites. Las demás pueden seguir visibles sin convertirse en deberes para hoy."],
     "Joel termina un turno de atención domiciliaria y recibe gestiones de su padre porque la familia cree que «él sabe». Propone que una hermana asuma una gestión autorizada completa; el trabajo mantiene sus propios canales. Su saber profesional no implica disponibilidad familiar ilimitada.",
     "¿Qué expectativa se está transfiriendo de un papel a otro sin que la haya aceptado?",
     "mapa", "AC13 AC18 CC12 MC08", "Esta ruta es para organización adulta. Las necesidades de protección de menores, los riesgos y las decisiones médicas, psicológicas o legales exigen apoyo competente y no se resuelven mediante BrainBox.",
     "tiempo mente relaciones organizacion apoyos", 5)

unit(26, "Un plan B que exista de verdad",
     "Prepara una respuesta logística para una interrupción concreta y comprueba sus dependencias.",
     "La organización puede funcionar mientras nadie falta. Una enfermedad de quien cuida, una cancelación o un fallo de equipo revelan responsabilidades sin alternativa. Prever una interrupción no exige prepararte para todas las catástrofes ni asumir funciones de los servicios.",
     ["En Plan B elige una interrupción relevante: ausencia de quien acompaña, cancelación de transporte o indisponibilidad de un servicio. Describe qué necesidad quedaría sin cobertura.",
      "Identifica qué persona o servicio debe coordinar la respuesta y qué alternativa se ha confirmado. Registra por separado lo que sólo parece posible.",
      "Acordad dónde está la información vigente y quién puede acceder legítimamente. Para pautas asistenciales utiliza el canal profesional autorizado; no copies indicaciones de memoria.",
      "Comprueba con la alternativa qué puede asumir y cuándo habría que activar otro apoyo. Si la función exige competencia técnica o clínica, solicita su preparación específica.",
      "Elige cuándo volver a comprobar disponibilidad, según el cambio real de la situación. Un contacto antiguo no es garantía permanente."],
     "Una familia prevé que el transporte habitual no pueda acudir. Confirma una segunda opción para ese trayecto y conserva el contacto del servicio responsable si ambas fallan. No presupone que cualquier vecino puede asumir todas las necesidades del desplazamiento.",
     "¿Qué pieza seguiría sin resolver si mañana faltara la persona habitual?",
     "contingencia", "MC14 CC13", "Este es un plan de continuidad logística, no un protocolo de emergencias. Ante peligro inmediato utiliza la atención urgente local. Riesgo y situaciones médicas, psicológicas o legales activan el STOP de BrainBox.",
     "organizacion apoyos tiempo mente", 5)

unit(27, "Entregar responsabilidad y confirmar recepción",
     "Prepara un cambio de servicio, apoyo o lugar sin dar por hecho que enviar información equivale a recibir cuidado.",
     "Un alta, una entrada en residencia o un cambio de persona de apoyo pueden añadir tareas nuevas. La información entregada no demuestra que existan medios, comprensión o aceptación de responsabilidades.",
     ["En Plan B escribe qué cambia, desde cuándo y quién entrega y recibe cada función. Separa tareas del servicio de tareas que tú has aceptado.",
      "Prepara con la persona afectada qué preferencias y apoyos de comunicación deben conservarse. No envíes información íntima que no cambia la función del relevo.",
      "Pide al equipo pertinente que aclare las tareas nuevas, la preparación necesaria y el contacto para resolver dudas. Expresa lo que no comprendes, no puedes realizar o no has aceptado.",
      "Confirma recepción con quien asume la siguiente parte. Mantén como pendientes los materiales, apoyos o responsables que todavía no estén disponibles.",
      "Después de la transición, revisa la cobertura y tus funciones reales. Un cambio residencial no exige visitas permanentes ni sustituye las responsabilidades del centro por las de la familia."],
     "Tras el ingreso residencial de su madre, Pilar sigue haciendo gestiones que nadie ha aclarado. Con acuerdo de ambas, prepara una conversación con el referente para distinguir funciones del centro, apoyo familiar aceptado y canal de novedades.",
     "¿Quién ha confirmado que recibe la responsabilidad y qué sigue pendiente en el nuevo lugar?",
     "contingencia", "AC16 CC13 MC14", "Las decisiones de alta, indicaciones clínicas, capacidad o representación se resuelven por sus vías competentes, fuera de BrainBox. No aceptes tareas inseguras ni interpretes documentos clínicos con esta herramienta.",
     "organizacion relaciones apoyos tiempo", 5)

unit(28, "Ofrecer ayuda sin dirigir otra vida",
     "Formula una oferta acotada que la persona cuidadora pueda aceptar, cambiar o rechazar.",
     "Querer ayudar no permite decidir qué necesita otra persona. Rechazar una oferta puede proteger intimidad, responder a una experiencia previa o indicar que la propuesta no encaja. La ayuda no debe depender de que la persona cuente más de lo que desea.",
     ["Aclara qué puedes ofrecer de verdad y desde qué papel: amistad, familia, voluntariado o servicio. No prometas «todo» si sólo puedes una tarea concreta.",
      "Pregunta qué sería útil y qué no quiere que hagas. Distingue escuchar de organizar, acompañar de representar y ofrecer de haber sido aceptado.",
      "En Reparto prepara la oferta con función, condiciones y límite. Deja la respuesta pendiente; no planifiques cambios en la casa, datos o rutinas de otras personas sin acuerdo.",
      "Si la persona rechaza, acepta la respuesta. Puedes aclarar una vez si hay una variante menos invasiva, sin convertir cada encuentro en persuasión.",
      "Si acepta, revisa después si la ayuda se realizó como se pidió y si añadió llamadas, explicaciones o incomodidad. Mantén el vínculo aunque la tarea no continúe."],
     "Inés ofrece ordenar la casa de Teresa, que no desea cambios en sus objetos. Inés propone recoger un pedido elegido y dejarlo a la hora acordada, sin entrar. Teresa puede aceptar esa segunda oferta o no continuar.",
     "¿Mi oferta responde a lo que la persona pide o a lo que a mí me gustaría hacer?",
     "reparto", "CC01 CC02 CC03", "El apoyo informal no te convierte en terapeuta o representante. Ante riesgo, daño o asuntos médicos, psicológicos o legales, recurre a ayuda competente sin usar BrainBox para decidirlos.",
     "relaciones apoyos organizacion emociones")

unit(29, "Si coordinas un equipo, cambia una condición",
     "Prepara una medida con responsable y recursos sobre una barrera que el equipo no puede resolver individualmente.",
     "Una organización cuida a quienes cuidan haciendo posible el trabajo. Pedir autocuidado mientras faltan cobertura o materiales puede trasladar la responsabilidad a quien no decide esos recursos. La participación tampoco debe convertirse en trabajo adicional gratuito.",
     ["Elige con el equipo una discrepancia concreta entre lo que se pide y los medios disponibles. Registra el hecho sin usar datos identificativos de personas atendidas.",
      "En Mi plan distingue qué puede cambiar el equipo y qué requiere dirección, prevención u otro responsable. Asigna la decisión a quien tenga capacidad real, con su aceptación.",
      "Concreta recursos, cobertura y continuidad necesarios antes de activar el cambio. Un plan sin dotación sigue siendo una propuesta.",
      "Prepara una revisión que incluya si la medida se realizó, si mejoró la condición y si desplazó trabajo o interrupciones a otra persona o turno.",
      "Mantén separado el apoyo reflexivo del control de desempeño. No recojas confidencias privadas para demostrar que una medida organizativa funciona."],
     "La responsable de un servicio propone cobertura definida para una pausa y un canal para preguntas del turno. Antes de considerarlo resuelto confirma quién asume la función y con qué medios. El espacio de apoyo emocional mantiene sus reglas y propósito propios.",
     "¿Qué recurso pongo realmente a disposición cuando pido este cambio al equipo?",
     "plan", "CC15 MC10", "La evaluación preventiva, las decisiones asistenciales, las obligaciones laborales y los incidentes de riesgo requieren sus responsables y procedimientos. El método no sustituye esas competencias ni debe demorar medidas de protección.",
     "organizacion tiempo cuerpo relaciones apoyos", 5)

unit(30, "Cuidar también los límites de quien apoya",
     "Revisa una oferta de ayuda para que siga siendo posible, aceptada y con salida preparada.",
     "Quien acompaña puede sentirse imprescindible o sostener una disponibilidad que ya no existe. Revisar el compromiso antes del agotamiento protege la relación. La persona apoyada no debe convertirse en responsable de consolar a quien la ayuda.",
     ["Elige una ayuda que estás ofreciendo. En Límites escribe qué puedes sostener hoy, qué ha cambiado y qué parte necesita preparación o apoyo propio.",
      "Revisa tiempo, dinero, energía y efecto en otras relaciones. No hace falta llegar al límite para pedir ajustar un compromiso.",
      "Prepara cómo comunicar el cambio con respeto y qué continuidad necesita organizarse. En un rol profesional, utiliza los procedimientos del puesto; no equipares una obligación laboral a un favor.",
      "Aclara a quién puedes acudir tú sin revelar información innecesaria de terceros: una persona elegida, un referente o apoyo profesional pertinente.",
      "Decide mantener, reducir, transferir o cerrar la tarea con los acuerdos necesarios. La gratitud no forma parte de lo que otra persona te debe para conservar ayuda."],
     "Un voluntario ya no puede sostener dos acompañamientos. Lo comunica al referente, delimita lo que sí puede ofrecer y participa en preparar la transición. No utiliza fotos ni relatos privados para justificar públicamente su esfuerzo.",
     "¿Mi oferta sigue siendo verdadera y posible, o se mantiene por culpa y expectativa?",
     "limites", "CC16 CC17 MC09", "No prolongues una situación insegura por cumplir una promesa. Riesgo, salud o problemas jurídicos requieren ayuda competente. El cierre de una función profesional o esencial necesita su procedimiento y cobertura.",
     "emociones tiempo relaciones apoyos organizacion")

unit(31, "Revisar una rutina: suficiente y respetuosa",
     "Examina una ayuda por la necesidad que atiende, la voz que conserva y la carga que produce.",
     "Más cuidado no siempre significa mejor cuidado; menos intervención tampoco garantiza autonomía. Una rutina puede ayudar, sustituir decisiones por comodidad o dejar una necesidad sin cubrir. La cantidad por sí sola no responde qué conviene.",
     ["En Revisión elige una rutina concreta que genere fricción. Describe su finalidad y distingue una necesidad profesionalmente indicada de una costumbre organizativa.",
      "Pregunta a quienes viven sus efectos qué les aporta y qué les impide. Admite respuestas distintas y evita que la reunión silencie a quien depende de los demás.",
      "Identifica qué parte cotidiana podría adaptarse sin alterar cuidados necesarios. Si afecta a salud, riesgo, restricciones o derechos, prepara una consulta competente antes de proponer cambios.",
      "Registra tres preguntas por separado: ¿se atiende la necesidad?, ¿se conserva participación?, ¿el esfuerzo es sostenible? No sumes respuestas para compensar una vulneración con un resultado favorable.",
      "Decide mantener, consultar o preparar un cambio permitido. Conserva un criterio de revisión y una vía para que cualquier persona diga que el arreglo no le sirve."],
     "Una familia considera inamovible una hora de visita que en realidad se eligió por costumbre. Al revisarla, la persona que recibe apoyo expresa otra preferencia. Las actuaciones profesionales con horario indicado se mantienen y consultan por su vía propia.",
     "¿Esta rutina responde a una necesidad real o a la comodidad de quien tiene más poder para imponerla?",
     "revision", "MC04 MC05 MC06", "No se usan esta unidad ni BrainBox para decidir restricciones, capacidad, tratamiento o riesgo aceptable. Las omisiones esenciales, coacción o daño exigen respuesta competente, no una negociación informal.",
     "relaciones organizacion apoyos cuerpo", 5)

unit(32, "Elegir tecnología con control humano",
     "Prueba una función con datos mínimos y una alternativa clara antes de incorporarla al cuidado.",
     "Una aplicación, un sensor o una IA pueden ayudar y también añadir vigilancia, dependencia o trabajo. Ver una pantalla no equivale a tener un cuidado cubierto. Guardar algo en un dispositivo no lo hace privado si otras personas pueden acceder.",
     ["En Revisión define una sola tarea que la tecnología debería facilitar y qué resultado cotidiano permitiría juzgarla. Utiliza datos ficticios en la primera prueba cuando sea posible.",
      "Comprueba qué datos y permisos pide, quién accede, qué cuesta mantenerla y cómo se retira el acceso. Escucha a todas las personas afectadas, incluidas trabajadoras y visitas cuando corresponda.",
      "Conserva una alternativa humana o no digital y un responsable si falla. No introduzcas datos identificables de terceros en herramientas no evaluadas para ese uso.",
      "Si usas IA para un borrador genérico, verifica sus afirmaciones en una fuente competente. No le delegues decisiones de salud, crisis, derechos o capacidad.",
      "Tras la prueba, decide continuar, adaptar o retirar según utilidad, accesibilidad, privacidad y esfuerzo. Cambiar de herramienta no es fracasar."],
     "Una red prueba una agenda para organizar viajes con nombres ficticios. Comprueba si evita mensajes y quién actualiza los cambios. Mantiene una llamada para quien no usa la aplicación y no carga informes clínicos para organizar un trayecto.",
     "¿Qué problema concreto resuelve y quién responde cuando se equivoca o deja de funcionar?",
     "revision", "AC14 MC13 CC10", "Sensores, vigilancia, datos de salud e IA asistencial pueden exigir valoración técnica, clínica y jurídica. Se consultan fuera de BrainBox. Una prueba funcional no certifica seguridad, eficacia ni cumplimiento normativo.",
     "mente organizacion relaciones apoyos", 5)

unit(33, "Un entorno que sostenga, sin trasladar costes",
     "Prepara una mejora del espacio o los recursos atendiendo a accesibilidad, trabajo y continuidad.",
     "El hogar y el lugar de trabajo deben ser habitables para quien recibe y quien presta cuidado. Una compra puede no encajar; un ahorro puede crear más trabajo para otra persona. La sostenibilidad exige mirar seguridad, accesibilidad y costes trasladados.",
     ["Elige una dificultad concreta del entorno: alcanzar algo, disponer de un asiento, una entrega que se duplica o un espacio ocupado. Describe a quién afecta y cuándo.",
      "En Mi plan diferencia una decisión doméstica sencilla de una adaptación que necesita valoración técnica, asistencial o preventiva. No compres por impulso un producto de apoyo sin comprobar adecuación.",
      "Pregunta quién gana facilidad y quién asume dinero, mantenimiento, agua, energía, tiempo o pérdida de privacidad. Incluye a quienes realizan el trabajo y a quienes reciben apoyo.",
      "Antes de una modificación, comprueba permisos, coste y posibilidad real de ejecución. Si implica higiene, productos asistenciales o equipos esenciales, conserva las pautas vigentes y solicita valoración competente.",
      "Revisa si el cambio facilita la función sin crear obstáculos o una carga no aceptada. Evitar una compra innecesaria puede ser suficiente; no necesitas calcular una huella ambiental personal."],
     "Una entidad quiere sustituir desplazamientos por videollamadas para ahorrar. Antes de hacerlo comprueba acceso, privacidad y quién asumiría los equipos y la ayuda técnica. No declara mejora ambiental o de atención sin datos que la sostengan.",
     "¿La comodidad o el ahorro que anunciamos descansa en trabajo que otra persona absorberá?",
     "plan", "AC12 MC16 MC02", "No modifiques técnicas de movilización, higiene, residuos asistenciales o equipamiento esencial con esta unidad. Riesgo y decisiones médicas o legales se atienden con competencia específica, fuera de BrainBox.",
     "cuerpo dinero organizacion apoyos", 5)

unit(34, "Cuando el cuidado cambia o termina",
     "Aclara qué responsabilidades continúan y qué apoyo quieres conservar durante una transición.",
     "Recuperación, ingreso, traslado o fallecimiento pueden cambiar tareas, vínculos e ingresos. No hay obligación de volver rápidamente a una vida anterior ni de encontrar una enseñanza positiva. El apoyo puede seguir siendo necesario cuando las tareas directas terminan.",
     ["En Mi plan separa qué termina, qué continúa y qué aparece. Puedes hacerlo con alguien elegido y dejar fuera cualquier relato que no quieras compartir.",
      "Identifica responsabilidades que necesitan nuevo acuerdo y quién debe confirmar su recepción. No mantengas una tarea sólo para demostrar compromiso o afecto.",
      "Elige un apoyo material o de contacto que quieras conservar: una gestión, compañía, transporte, privacidad o una consulta propia. Puedes modificarlo después.",
      "Si hay trámites con plazos, pide confirmación competente antes de aplazarlos. No conviertas el resto de la vida en un calendario de recuperación.",
      "Revisa cuando tenga sentido qué necesidad ha cambiado y si el apoyo sigue encajando. Puedes cerrar la aplicación sin cerrar tu experiencia ni redactar una historia de crecimiento."],
     "Después de terminar el cuidado, Txomin quiere resolver una gestión con ayuda y recuperar un encuentro cuando pueda. No necesita hablar de duelo para recibir esa ayuda, ni asistir a una actividad demuestra que su malestar esté resuelto.",
     "¿Qué apoyo sigue siendo necesario aunque otras personas piensen que el cuidado ya terminó?",
     "plan", "AC16 CC13 MC15", "La atención al duelo, las decisiones sobre final de vida y los trámites jurídicos requieren sus apoyos competentes. Esta unidad organiza continuidad logística fuera de esas decisiones; no aplica BrainBox para resolverlas.",
     "emociones relaciones dinero organizacion apoyos", 5)

unit(35, "Revisar si ocurrió y si valió la pena",
     "Contrasta el acuerdo con lo sucedido y decide mantener, ajustar, pedir apoyo o parar.",
     "Una acción realizada no demuestra que la necesidad se atendiera. Una buena experiencia tampoco prueba que el programa la causó. La revisión sirve para decidir y puede ser útil aunque informe un resultado desfavorable o que todavía no sabemos.",
     ["Abre Revisión y recupera qué esperabas observar antes de actuar. Si no lo habías preparado, dilo; no inventes una previsión retrospectiva.",
      "Separa ejecución, resultado y valor: qué se hizo, qué ocurrió y para quién compensó. Añade esfuerzo, dinero o efectos no deseados y escucha discrepancias.",
      "Indica la procedencia de lo que registras: experiencia declarada, confirmación de una tarea o comprobación independiente. Una escena ficticia o una previsión nunca son resultados de uso.",
      "Pregunta qué otras condiciones pudieron influir. Conserva «no lo sabemos» cuando no puedes atribuir el cambio a una acción concreta.",
      "Elige una decisión: mantener, ajustar, retirar o pedir otra respuesta. Asigna el siguiente paso a quien lo acepta y tenga capacidad; no abras un nuevo ciclo sólo para producir un informe."],
     "Se realizó el relevo previsto, pero Carmen pasó la tarde contestando preguntas. La ejecución está confirmada; el tiempo libre esperado no llegó. La revisión permite ajustar preparación y límites, sin afirmar que Carmen no supo descansar.",
     "¿Qué cambiará a partir de esta revisión? Si nada necesita cambiar, ¿podemos terminar aquí?",
     "revision", "AC17 CC18 MC17", "No utilices resultados de uso como diagnóstico, prueba de eficacia clínica o evaluación profesional. Si aparece daño o riesgo, atiéndelo por su vía competente antes de revisar el método.",
     "tiempo mente organizacion relaciones apoyos", 5)

unit(36, "Tu programa, sin otra obligación encima",
     "Conserva las piezas que ayudan, retira las que sobran y elige libremente por dónde continuar.",
     "Las unidades están abiertas: no hay secuencia obligatoria, puntos ni plazos para completarlas. Un programa completo ofrece opciones para necesidades distintas; no exige que una persona las use todas. Cuidar con cuidado incluye revisar la propia herramienta.",
     ["En Revisión identifica una función de CareLab que hayas usado o intentado usar. Distingue qué facilitó una decisión y qué añadió lectura, registro o confusión.",
      "Conserva sólo los planes que siguen siendo útiles. Corrige, archiva o elimina lo que no quieras mantener mediante los controles disponibles; revisa antes cualquier copia que hayas compartido.",
      "Si necesitas otra pieza, entra por su función: Cuidopedia para aclarar, Cuidoteca para elegir cultura o formación, CareTools para preparar recursos y las guías para ampliar una decisión. No hace falta consultar todo.",
      "Puedes elegir otra unidad, regresar más adelante o parar. El programa debe adaptarse a tu papel personal, profesional, de apoyo o de cuidado múltiple; no te asigna un tipo de cuidador.",
      "Si quieres comunicar una mejora del producto, describe la dificultad y la función deseada sin incluir datos íntimos de terceros. Una sugerencia permite revisar el diseño; no equivale a un resultado de investigación."],
     "Una persona descubre que el reparto le sirve, pero no desea registrar reflexiones. Mantiene ese instrumento y deja el resto. Otra usa sólo Preparar consulta. Ninguna tiene que completar módulos para merecer apoyo o para considerar válida su experiencia.",
     "¿Qué tendría que hacer menos esta herramienta para ayudarme mejor?",
     "revision", "MC18 AC18 CC18", "CareLab es un recurso educativo y de organización en evaluación, no un máster acreditado ni una intervención con eficacia demostrada. Se mantiene el STOP amplio de BrainBox y el acceso a ayuda competente ante riesgo o situaciones médicas, psicológicas o legales.",
     "mente tiempo organizacion apoyos", 5)


def build(locations=None, destination=None):
    locations = locations or CorpusLocations.discover()
    sources = []
    for name in ("AC_autocuidado", "CC_cuidar_cuidadores", "MC_meta_cuidado"):
        relative = f"guias_transversales/partes/{name}.json"
        guide = locations.read_json(relative)
        for index, chapter in enumerate(guide["chapters"]):
            sources.append({
                "id": chapter["id"],
                "title": f'{guide["title"]} · {chapter["title"]}',
                "locator": f'{relative}#/chapters/{index} ({chapter["id"]})',
            })
    source_ids = {s["id"] for s in sources}
    assert len(UNITS) == 36 and len(MODULES) == 12
    assert len({u["id"] for u in UNITS}) == len(UNITS)
    for u in UNITS:
        assert u["tool"] in TOOLS, u["id"]
        assert set(u["dimensions"]) <= DIMENSIONS and u["dimensions"], u["id"]
        assert set(u["sourceRefs"]) <= source_ids and u["sourceRefs"], u["id"]
        assert 3 <= len(u["steps"]) <= 5, u["id"]
        assert all(isinstance(s, str) and s for s in u["steps"]), u["id"]
        assert u["example"].startswith("Ejemplo ficticio."), u["id"]
    coverage = {ref for u in UNITS for ref in u["sourceRefs"]}
    assert coverage == source_ids, f"Capítulos sin traza: {source_ids - coverage}"
    modules = [
        {"id": mid, "title": title, "summary": summary,
         "unitIds": [u["id"] for u in UNITS if u["moduleId"] == mid]}
        for mid, title, summary in MODULES
    ]
    assert all(len(m["unitIds"]) == 3 for m in modules)
    output = {"version": "2.0", "modules": modules, "units": UNITS, "sources": sources}
    destination = destination or APP / "data" / "programa.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"CareLab: {len(modules)} módulos, {len(UNITS)} unidades, {len(coverage)} capítulos fuente; {destination}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("corpus_root", nargs="?", type=Path)
    parser.add_argument("--locations", type=Path, help="Private MEPRE location registry")
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    build(CorpusLocations.discover(corpus_root=args.corpus_root, registry=args.locations), args.output)

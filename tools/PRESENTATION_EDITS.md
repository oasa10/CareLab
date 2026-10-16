# Adaptaciones de presentación de CareLab

`presentation_edits.json` registra los cambios D22 aprobados para la interfaz de
consulta. Solo contiene nombres relativos de conjuntos, IDs y los textos públicos
exactos antes/después. No es una edición de los documentos fuente ni sustituye sus
identificadores, hashes o referencias bibliográficas.

`presentation_edits.py` aplica una copia del conjunto y falla antes de escribir si
un ID, campo o texto ha cambiado. Admite el texto inicial exacto o el resultado
final exacto: ejecutarlo otra vez no añade cambios. No busca palabras ni sustituye
masculinos de manera global. Las citas y los títulos originales se conservan; el
título de presentación de AC06 está adaptado de forma individual y trazable.

## Biblioteca

`build_biblioteca.py` llama automáticamente al postproceso después de extraer el
corpus y antes de escribir `data/biblioteca.json`. La generación conserva las
adaptaciones sin modificar el corpus. Si cambia una fuente, revisar el conflicto
concreto y el registro, no desactivar su comprobación.

## Programa y multimedia

El generador `build_programa.py` también aplica automáticamente el postproceso
antes de escribir. Desde la raíz de la aplicación:

```sh
python3 tools/build_programa.py
```

Para aplicar el registro a una salida de programa obtenida con un generador
anterior, se puede usar `presentation_edits.py data/programa.json --input ARCHIVO
--output data/programa.json`.

`data/recursos-multimedia.json` es una selección editorial mantenida directamente;
no tiene generador en `tools`. Si se sustituye por una copia anterior, ejecutar:

```sh
python3 tools/presentation_edits.py data/recursos-multimedia.json --output data/recursos-multimedia.json
```

Comprobación sin escribir, válida para cualquiera de los tres conjuntos:

```sh
python3 tools/presentation_edits.py data/biblioteca.json --check
python3 tools/presentation_edits.py data/programa.json --check
python3 tools/presentation_edits.py data/recursos-multimedia.json --check
python3 -m unittest discover -s tests -p presentation_edits_test.py
```

Los cambios de lenguaje en JavaScript se mantienen en sus archivos de código;
este mecanismo solo interviene en los tres JSON enumerados. Los campos nuevos,
las nuevas revisiones y los cambios de fuentes exigen una decisión editorial
nueva, no la ampliación automática del registro.

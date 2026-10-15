#!/usr/bin/env python3
"""Build CareLab's embedded library from the approved, local MEPRE corpus.

Usage: python3 tools/build_biblioteca.py [CORPUS_ROOT] [--output FILE]
       python3 tools/build_biblioteca.py --locations REGISTRY [--output FILE]
No network calls, absolute source paths, clinical scoring or copied third-party
works are added. Source wording and its evidence/access limits are preserved.
The web renderer must escape every string and retain newlines in body text.
"""

from __future__ import annotations

import argparse
from collections import Counter
from corpus_locations import CorpusLocations
import hashlib
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urlsplit


DIMENSIONS = ("tiempo", "cuerpo", "mente", "emociones", "relaciones", "dinero", "organizacion", "apoyos")
EXPECTED = {"Cuidopedia": 550, "CareTools": 276, "Cuidoteca": 190, "Cuidosfera": 17, "Guías": 54}
GUIDES = ("AC_autocuidado.json", "CC_cuidar_cuidadores.json", "MC_meta_cuidado.json")
CULTURE = ("A_pantallas.json", "B_lecturas.json", "C_apoyos.json", "D_cultura.json")
REF_PATTERN = re.compile(r"\b[A-Z]{2,3}-[EL]\d{2}\b")

# Navigation tags only: these are not scales, diagnostic dimensions or scores.
CATEGORY_DIMENSIONS = {
    "Carga y estrés": ["mente", "emociones", "tiempo"],
    "Medición y evaluación": ["organizacion"],
    "Sistemas servicios y calidad": ["apoyos", "organizacion"],
    "Derechos y ética": ["relaciones", "apoyos"],
    "Relaciones, redes y transiciones": ["relaciones", "apoyos"],
    "Personas y perfiles de cuidado": ["relaciones", "apoyos"],
    "Condiciones clínicas y cuidado básico": ["cuerpo", "apoyos"],
    "Vocabulario MEPRE": ["organizacion", "mente"],
    "Sociedad y organización del cuidado": ["organizacion", "apoyos"],
    "Accesibilidad y apoyos cotidianos": ["apoyos", "cuerpo"],
    "Lenguaje de la evidencia": ["organizacion"],
    "Experiencia psicológica": ["emociones", "mente"],
    "Salud física y recuperación": ["cuerpo"],
    "Afrontamiento e identidad": ["emociones", "mente"],
    "Trabajo y derechos laborales": ["dinero", "tiempo"],
    "Economía y protección social": ["dinero", "apoyos"],
    "Intervenciones y prácticas": ["apoyos", "organizacion"],
    "Tecnología y vida digital": ["organizacion", "apoyos"],
    "Comunicación": ["relaciones"],
    "Marcos conceptuales": ["organizacion"],
    "Recuperación funcional y cuidado cotidiano": ["cuerpo", "apoyos"],
    "Cultura y representación": ["emociones", "relaciones"],
    "Vida cotidiana y participación": ["relaciones", "tiempo"],
    "Cuidados paliativos y final de vida": ["cuerpo", "apoyos", "emociones"],
    "Pérdida y duelo": ["emociones", "relaciones"],
    "Salud y experiencia psicológica": ["emociones", "mente"],
    "Conceptos generales": ["organizacion"],
    "Programas para cuidadores": ["apoyos", "emociones"],
    "Apoyo psicológico y afrontamiento": ["emociones", "mente"],
    "Seguridad y cuidado cotidiano": ["cuerpo", "apoyos"],
    "Valoración clínica y funcional": ["cuerpo", "apoyos"],
    "Comunicación y decisiones": ["relaciones"],
    "Economía y conciliación": ["dinero", "tiempo"],
    "Productos de apoyo y competencias": ["apoyos", "cuerpo"],
    "Derechos y planificación administrativa": ["apoyos", "organizacion"],
    "Pérdidas y transiciones": ["emociones", "apoyos"],
    "Acuerdos y comunicación": ["relaciones", "organizacion"],
    "Valoración del cuidado": ["organizacion", "apoyos"],
    "Evaluación complementaria de la persona cuidadora": ["apoyos", "mente"],
    "Tecnología de apoyo": ["apoyos", "organizacion"],
    "Datos y continuidad digital": ["organizacion"],
    "Diseño e implantación": ["organizacion"],
    "Planes y coordinación": ["organizacion", "tiempo"],
    "Transiciones y alta": ["apoyos", "organizacion"],
    "Coordinación digital": ["organizacion", "tiempo"],
    "Selección y accesibilidad digital": ["apoyos", "organizacion"],
    "Apoyo a profesionales": ["apoyos", "emociones"],
    "Autocuidado sostenible": ["cuerpo", "tiempo", "emociones"],
    "Expresión y conexión": ["emociones", "relaciones"],
    "Seguridad farmacoterapéutica": ["cuerpo", "apoyos"],
    "Apoyo interpersonal": ["relaciones", "apoyos"],
    "Aplicación del marco MEPRE": ["organizacion", "mente"],
    "Cambio y afrontamiento": ["emociones", "mente"],
    "Cuidados paliativos": ["cuerpo", "apoyos", "emociones"],
    "Apoyo inicial": ["apoyos", "emociones"],
    "Aprendizaje profesional en red": ["apoyos", "organizacion"],
    "Organización profesional calidad y prevención": ["organizacion", "apoyos"],
}
CS_DIMENSIONS = {
    "POL": ["tiempo", "organizacion", "apoyos"], "COC": ["organizacion", "relaciones", "apoyos"],
    "INT": ["relaciones", "apoyos"], "TRA": ["organizacion", "apoyos"],
    "HIP": ["relaciones", "apoyos"], "TEL": ["organizacion", "relaciones", "apoyos"],
    "CRI": ["mente", "tiempo", "organizacion"], "BIO": ["cuerpo", "relaciones", "apoyos"],
    "ANA": ["relaciones", "apoyos", "tiempo"], "PAR": ["relaciones", "apoyos"],
    "HPO": ["apoyos", "organizacion", "cuerpo"], "PRO": ["organizacion", "tiempo", "apoyos"],
    "DEO": ["emociones", "relaciones", "dinero"], "ANT": ["relaciones", "apoyos"],
    "TEC": ["organizacion", "apoyos"], "HOL": ["organizacion", "apoyos"],
    "PAN": ["mente", "relaciones", "organizacion"],
}
KEYWORDS = {
    "tiempo": ("tiempo", "descanso", "relevo", "turno", "concili", "horario", "pausa", "agenda", "sueño"),
    "cuerpo": ("cuerpo", "fisic", "salud", "dolor", "aliment", "hidrat", "sueño", "movili", "higien", "bucodental", "ejercicio", "rehabilit"),
    "mente": ("cognitiv", "mental", "memoria", "anticip", "atencion", "record", "preocup", "rumia", "estres"),
    "emociones": ("emocion", "culpa", "duelo", "perdida", "ansiedad", "afecto", "malestar", "soledad", "sentido", "identidad"),
    "relaciones": ("relacion", "familia", "amistad", "conversa", "comunica", "consent", "autonomia", "pareja", "recipro", "vincul", "conflict", "escucha"),
    "dinero": ("dinero", "econom", "ingreso", "empleo", "laboral", "coste", "salario", "gasto", "financ", "prestacion", "presupuesto"),
    "organizacion": ("organiz", "plan", "coordina", "gestion", "reparto", "responsab", "acuerdo", "contingen", "tramite", "digital", "registro"),
    "apoyos": ("apoyo", "servicio", "recurso", "ayuda", "accesib", "derecho", "comunidad", "red", "proteccion"),
}


def normalize(value: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", value.lower()) if not unicodedata.combining(c))


def as_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return "; ".join(as_text(v) for v in value)
    if isinstance(value, dict):
        return "; ".join(f"{k}: {as_text(v)}" for k, v in value.items())
    return str(value).strip()


def dimensions(title: str, category: str, extra: str = "") -> list[str]:
    result = list(CATEGORY_DIMENSIONS.get(category, []))
    text = normalize(title + " " + extra)
    scores = {dim: sum(normalize(word) in text for word in words) for dim, words in KEYWORDS.items()}
    for dim in sorted(DIMENSIONS, key=lambda d: (-scores[d], DIMENSIONS.index(d))):
        if scores[dim] and dim not in result:
            result.append(dim)
    return (result or ["apoyos"])[:4]


def web_url(value) -> str | None:
    if not isinstance(value, str):
        return None
    value = value.strip()
    parsed = urlsplit(value)
    if parsed.scheme in ("http", "https") and parsed.netloc and not re.search(r"[\x00-\x20]", value):
        return value
    return None


def blocks_text(blocks: list[dict]) -> str:
    """Retain every paragraph and table cell, with explicit table headers."""
    out = []
    for block in blocks:
        kind = block["type"]
        if kind in ("p", "heading"):
            out.append(block["text"])
        elif kind in ("bullets", "steps"):
            for index, entry in enumerate(block["items"], 1):
                out.append((f"{index}. " if kind == "steps" else "• ") + as_text(entry))
        elif kind == "table":
            headers = block["headers"]
            for row in block["rows"]:
                assert len(row) == len(headers), "Table headers and cells must match"
                out.append(" | ".join(f"{header}: {as_text(value)}" for header, value in zip(headers, row)))
        else:
            raise ValueError(f"Unsupported source block: {kind}")
    return "\n\n".join(out)


def reference_text(ref: dict) -> str:
    lines = []
    for key, label in (
        ("author", "Autoría"), ("authors", "Autoría"), ("organization", "Responsable"),
        ("year", "Año"), ("citation", "Referencia"), ("journal", "Publicación"),
        ("bibliographic_note", "Nota bibliográfica"), ("locator", "Localización"),
        ("scope", "Fundamento utilizado"), ("support_scope", "Alcance"),
        ("source_scope", "Alcance de la fuente"), ("access", "Consulta de la fuente"),
        ("access_level", "Nivel de acceso"), ("limit", "Límite"),
        ("checked_date", "Consulta registrada"), ("accessed", "Consulta registrada"),
    ):
        if ref.get(key):
            line = f"{label}: {as_text(ref[key])}."
            if line not in lines:
                lines.append(line)
    if ref.get("tipo") == "local" or ref.get("local") or (ref.get("url") and not web_url(ref["url"])):
        lines.insert(0, "Fuente documental del proyecto; se conserva su referencia, sin enlace a un archivo privado.")
    return " ".join(lines)


class Library:
    def __init__(self, root: Path | CorpusLocations):
        self.locations = root if isinstance(root, CorpusLocations) else CorpusLocations.discover(corpus_root=root)
        self.root = self.locations.root
        self.items = []
        self.sources = {}

    def read(self, path: str):
        content = self.locations.read_bytes(path)
        self.sources[path] = {"path": path, "sha256": hashlib.sha256(content).hexdigest()}
        return json.loads(content)

    def source(self, path: str, identity: str):
        return {"path": path, "id": identity, "sha256": self.sources[path]["sha256"]}

    def references(self, item: dict, references: list[dict]):
        known = set()
        for ref in references:
            rid = ref.get("id", "")
            title = ref.get("title") or ref.get("citation") or rid
            label = (f"[{rid}] " if rid else "") + title
            text = reference_text(ref)
            if text or rid:
                item["body"].append({"label": label, "text": text or "Referencia de la ficha original."})
            for field, suffix in (("url", ""), ("verification_url", " · verificación"), ("supplementary_access_url", " · acceso complementario")):
                url = web_url(ref.get(field))
                if url and url not in known:
                    item["links"].append({"title": label + suffix, "url": url})
                    known.add(url)

    def add(self, identity, collection, title, summary, category, path, source_id, *, level="consulta", usage="", dims=None, aliases=None):
        item = {
            "id": identity, "collection": collection, "title": title, "summary": summary,
            "category": category, "dimensions": dims or dimensions(title, category),
            "body": [], "links": [], "source": self.source(path, source_id),
            "level": level, "usage": usage, "aliases": aliases or [],
        }
        self.items.append(item)
        return item

    @staticmethod
    def fields(item, entry, fields):
        for key, label in fields:
            if entry.get(key) not in (None, "", [], {}):
                item["body"].append({"label": label, "text": as_text(entry[key])})

    def encyclopedia(self):
        path = "cuidopedia/registros/datos_integrados.json"
        data = self.read(path)
        refs = {ref["id"]: ref for ref in data["sources"]}
        for entry in data["entries"]:
            item = self.add("cp-" + entry["id"].lower(), "Cuidopedia", entry["term"], entry["definition"], entry["domain"], path, entry["id"],
                            usage="Consultar y comprender. Una definición no permite diagnosticar ni sustituye una valoración profesional.",
                            aliases=list(dict.fromkeys(entry.get("aliases", []) + entry.get("search_labels", []))))
            self.fields(item, entry, (("status", "Cómo se utiliza este término"), ("definition", "Qué significa"),
                                     ("distinction", "Qué conviene distinguir"), ("aliases", "También se conoce como"), ("related", "Conceptos relacionados")))
            item["related"] = entry.get("related", [])
            item["basis"] = entry.get("basis", [])
            self.references(item, [refs[rid] for rid in entry["sources"]])

    def tools(self):
        path = "caretools/registros/datos_integrados.json"
        data = self.read(path)
        refs = {ref["id"]: ref for ref in data["sources"]}
        level_map = {"cotidiano": "personal", "acompañado": "acompañado", "profesional": "profesional", "institucional": "profesional"}
        usage = {
            "cotidiano": "Orientación para el uso cotidiano. Comprueba requisitos y límites antes de adaptar la propuesta a tu situación.",
            "acompañado": "Para explorar con acompañamiento y con las condiciones indicadas en la ficha. Leerla no equivale a completar el programa.",
            "profesional": "Para conocer opciones y preparar una consulta. Su aplicación requiere profesionales, formación o supervisión según la ficha.",
            "institucional": "Para conocer y solicitar cambios organizativos. Su implantación corresponde a una organización y a responsables con competencia y recursos.",
        }
        for entry in data["entries"]:
            item = self.add("ct-" + entry["id"].lower(), "CareTools", entry["name"], entry["need"], entry["category"], path, entry["id"],
                            level=level_map[entry["level"]], usage=usage[entry["level"]], aliases=entry.get("aliases", []))
            item["sourceLevel"] = entry["level"]
            item["kind"] = entry["kind"]
            item["editorial"] = entry["editorial"]
            item["basis"] = entry.get("basis", [])
            item["related"] = entry.get("related", [])
            self.fields(item, entry, (("need", "Para qué sirve"), ("operation", "Cómo funciona"), ("requirements", "Qué necesita"),
                                     ("output", "Qué resultado permite preparar"), ("limits", "Límites"), ("access", "Acceso y condiciones"),
                                     ("support", "Fundamento y alcance"), ("scale", "Ámbito"), ("stage", "Momento de uso"), ("related", "Relacionadas")))
            self.references(item, [refs[rid] for rid in entry["sources"]])

    def culture(self):
        for filename in CULTURE:
            path = "cuidoteca/partes/" + filename
            data = self.read(path)
            for entry in data["resources"]:
                item = self.add("cu-" + entry["id"].lower(), "Cuidoteca", entry["title"], entry["description"], entry["category"], path, entry["id"],
                                usage="Exploración voluntaria de cultura y apoyos. La ficha no incluye la obra completa ni atribuye efectos terapéuticos a su uso.",
                                dims=dimensions(entry["title"], entry["category"], as_text(entry["themes"])))
                item["themes"] = entry["themes"]
                item["creator"] = entry["creator"]
                self.fields(item, entry, (("creator", "Autoría o responsable"), ("year", "Año"), ("subcategory", "Formato"),
                                         ("description", "Qué encontrarás"), ("use", "Una forma posible de explorar"), ("caution", "Antes de elegir"),
                                         ("access", "Acceso"), ("time", "Duración o ritmo"), ("languages", "Idiomas y accesibilidad"),
                                         ("country", "Contexto"), ("themes", "Temas"), ("audience", "Público"),
                                         ("verification", "Qué se comprobó en la investigación")))
                self.references(item, entry["sources"])

    def guides(self):
        for filename in GUIDES:
            path = "guias_transversales/partes/" + filename
            data = self.read(path)
            ref_by_id = {ref["id"]: ref for ref in data["references"]}
            for index, chapter in enumerate(data["chapters"]):
                first = next((b["text"] for b in chapter["blocks"] if b["type"] == "p"), chapter["title"])
                item = self.add("gu-" + chapter["id"].lower(), "Guías", chapter["title"], first, data["title"], path, chapter["id"],
                                level="personal", usage="Orientación práctica del proyecto: elige la parte que necesitas. Las situaciones médicas, psicológicas o legales requieren la ayuda competente.",
                                dims=dimensions(chapter["title"], "", first[:400]))
                item["guide"] = data["code"]
                item["guideTitle"] = data["title"]
                if index == 0:
                    item["body"].append({"label": "Para quién y cómo usar esta guía", "text": data["audience"] + "\n\n" + "\n\n".join(data["opening"])})
                item["body"].append({"label": chapter["id"] + " · " + chapter["title"], "text": blocks_text(chapter["blocks"])})
                cited = set(REF_PATTERN.findall(json.dumps(item["body"], ensure_ascii=False)))
                assert cited <= ref_by_id.keys(), f"Unresolved guide citations: {cited - ref_by_id.keys()}"
                self.references(item, [ref for ref in data["references"] if ref["id"] in cited])

    def sphere(self):
        axes_path = "cuidosfera/registros/ejes_y_terminos.json"
        terms = self.read(axes_path)["terms"]
        for term in terms:
            code = term["code"]
            path = f"cuidosfera/partes/{code}_investigacion.json"
            guide_path = f"cuidosfera/partes/{code}_guia.json"
            data = self.read(path)
            guide = self.read(guide_path)
            item = self.add("cs-" + code.lower(), "Cuidosfera", term["title"], data["definition_proposed"], term["primary_lens"], path, code,
                            usage="Mapa para comprender situaciones y elegir apoyos. No es un diagnóstico, un test ni una etiqueta para clasificar personas.",
                            dims=CS_DIMENSIONS[code], aliases=[data["title"], term["descriptor"]])
            item["additionalSources"] = [self.source(guide_path, code), self.source(axes_path, code)]
            item["status"] = data["status"]
            item["body"].extend([
                {"label": "Estatus del término", "text": data["status"]},
                {"label": "Qué permite mirar", "text": data["definition_proposed"]},
                {"label": "Una distinción esencial", "text": term["limit"]},
                {"label": "Distinguir antes de actuar", "text": as_text(data.get("distinctions", []))},
                {"label": "Investigación y límites de evidencia", "text": blocks_text(data["blocks"])},
            ])
            for finding in data.get("findings", []):
                text = finding["claim"]
                for key, label in (("certainty", "Certeza"), ("limits", "Límite")):
                    if finding.get(key): text += f"\n{label}: {finding[key]}"
                if finding.get("refs"): text += "\nReferencias: " + ", ".join(finding["refs"])
                item["body"].append({"label": "Hallazgo documentado", "text": text})
            for scene in data.get("scenarios", []):
                text = scene["description"]
                for key, label in (("setting", "Ámbito"), ("actors", "Participantes"), ("evidence_status", "Naturaleza del ejemplo"),
                                   ("limits", "Límites"), ("refs", "Referencias"), ("overlap_codes", "Conexiones")):
                    if scene.get(key): text += f"\n{label}: {as_text(scene[key])}"
                item["body"].append({"label": scene["id"] + " · Situación", "text": text})
            item["body"].append({"label": guide["title"] + " · Orientación de uso", "text": guide["audience"] + "\n\n" + "\n\n".join(guide["opening"])})
            for chapter in guide["chapters"]:
                item["body"].append({"label": chapter["id"] + " · " + chapter["title"], "text": blocks_text(chapter["blocks"])})
            # Same-id research/guide references must point to the same publication.
            # Preserve both declared scopes when the guide and research differ.
            refs = {}
            for ref in data["references"] + guide["references"]:
                rid = ref["id"]
                if rid in refs:
                    assert refs[rid].get("url") == ref.get("url"), f"Reference conflict: {code}/{rid}"
                    for field in ("scope", "limit", "locator", "access", "access_level"):
                        if ref.get(field) and ref[field] != refs[rid].get(field):
                            refs[rid][field] = as_text(refs[rid].get(field, "")) + " | Guía: " + as_text(ref[field])
                else:
                    refs[rid] = dict(ref)
            cited = set(REF_PATTERN.findall(json.dumps(item["body"], ensure_ascii=False)))
            assert cited <= refs.keys(), f"Unresolved Cuidosfera citations: {cited - refs.keys()}"
            self.references(item, list(refs.values()))

    def build(self):
        self.encyclopedia()
        self.tools()
        self.culture()
        self.sphere()
        self.guides()
        counts = dict(Counter(item["collection"] for item in self.items))
        assert counts == EXPECTED, f"Corpus coverage changed; review intentionally: {counts}"
        assert len({item["id"] for item in self.items}) == len(self.items), "Duplicate item IDs"
        for item in self.items:
            assert item["title"] and item["summary"] and item["body"]
            assert set(item["dimensions"]) <= set(DIMENSIONS) and item["dimensions"]
            assert item["level"] in ("personal", "acompañado", "profesional", "consulta")
            assert all(web_url(link["url"]) for link in item["links"])
            assert all(isinstance(block["text"], str) and isinstance(block["label"], str) for block in item["body"])
        counts["total"] = len(self.items)
        return {
            "version": "2.0", "cutoff": "2026-10-15", "items": self.items, "counts": counts,
            "sources": [self.sources[path] for path in sorted(self.sources)],
            "scope": {
                "coverage": "Incluye todas las fichas de los cinco conjuntos indicados, con 54 capítulos transversales y las 17 guías de Cuidosfera. No pretende inventariar todos los recursos existentes fuera del corpus.",
                "classification": "Las dimensiones son etiquetas editoriales de navegación, no una escala ni una recomendación clínica automática.",
                "references": "Enlaces conservados de las fuentes del proyecto y restringidos a HTTP(S). Su consulta previa y sus límites se indican en cada ficha; esta transformación no revalida su disponibilidad actual.",
                "copyright": "Se incorporan fichas, explicaciones y guías originales del proyecto, no obras culturales, cuestionarios licenciados ni manuales de terceros completos.",
                "formats": "La aplicación incluye contenido textual estructurado; no publica los archivos DOCX/PDF del corpus ni crea enlaces privados rotos.",
                "safety": "Ante riesgo o situación médica, psicológica o legal: STOP, no aplicar BrainBox y pedir ayuda o derivar. La biblioteca sirve para consultar y preparar apoyo, no para resolver crisis ni diagnosticar.",
                "effectiveness": "La aprobación editorial de los materiales no demuestra eficacia de CareLab. La utilidad del producto requiere evaluación con uso real.",
            },
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("corpus_root", nargs="?", type=Path)
    parser.add_argument("--locations", type=Path, help="Private MEPRE location registry")
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "data" / "biblioteca.json")
    args = parser.parse_args()
    locations = CorpusLocations.discover(corpus_root=args.corpus_root, registry=args.locations)
    data = Library(locations).build()
    output = args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    assert str(locations.root) not in payload, "Absolute corpus path leaked"
    assert "/Users/" not in payload and "file://" not in payload, "Private path leaked"
    output.write_text(payload, encoding="utf-8")
    print(json.dumps({"output": "data/biblioteca.json", "counts": data["counts"], "source_files": len(data["sources"]),
                      "bytes": len(payload.encode("utf-8")), "sha256": hashlib.sha256(payload.encode("utf-8")).hexdigest()}, ensure_ascii=False))


if __name__ == "__main__":
    main()

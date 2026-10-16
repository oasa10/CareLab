#!/usr/bin/env python3
"""Apply reviewed presentation edits to exact IDs/fields, never to source records.

The registry contains public, relative dataset names and exact before/after text.
A changed or missing source field fails closed; no partial output is written.
"""
from __future__ import annotations

import argparse
from copy import deepcopy
import json
from pathlib import Path
import re

APP = Path(__file__).resolve().parents[1]
REGISTRY = Path(__file__).with_name("presentation_edits.json")
DATASETS = {
    "data/biblioteca.json": ("items", re.compile(r"(?:title|summary|category|body\.[0-9]+\.(?:label|text))\Z")),
    "data/programa.json": ("units", re.compile(r"(?:why|steps\.[0-9]+)\Z")),
    "data/recursos-multimedia.json": ("resources", re.compile(r"why\Z")),
}


def read_registry(path: Path = REGISTRY) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("schema") != 1 or not isinstance(data.get("datasets"), list):
        raise ValueError("Unsupported presentation-edit registry")
    seen_files = set()
    for dataset in data["datasets"]:
        name = dataset.get("file")
        if name not in DATASETS or name in seen_files:
            raise ValueError("Unknown or duplicate presentation dataset")
        seen_files.add(name)
        key, allowed = DATASETS[name]
        if dataset.get("collection") != key:
            raise ValueError("Presentation collection does not match its dataset")
        if not isinstance(dataset.get("revision"), dict) or not dataset["revision"].get("id"):
            raise ValueError("Missing presentation revision")
        if not isinstance(dataset.get("changes"), list):
            raise ValueError("Invalid presentation changes")
        seen = set()
        for change in dataset["changes"]:
            identity, field = change.get("id"), change.get("field")
            if not isinstance(identity, str) or not re.fullmatch(r"[A-Za-z0-9_-]+", identity):
                raise ValueError("Invalid presentation record ID")
            if not isinstance(field, str) or not allowed.fullmatch(field):
                raise ValueError("Only reviewed presentation fields may be changed")
            if (identity, field) in seen:
                raise ValueError("Duplicate presentation field; consolidate its exact edit chain")
            seen.add((identity, field))
            if not all(isinstance(change.get(k), str) for k in ("before", "after")):
                raise ValueError("Presentation before/after values must be exact strings")
            if change["before"] == change["after"]:
                raise ValueError("Presentation edit has no effect")
    return data


def _field(record: dict, path: str):
    node = record
    parts = path.split(".")
    try:
        for part in parts[:-1]:
            node = node[int(part)] if isinstance(node, list) else node[part]
        final = int(parts[-1]) if isinstance(node, list) else parts[-1]
        return node, final, node[final]
    except (KeyError, IndexError, TypeError, ValueError) as exc:
        raise ValueError(f"Presentation field no longer exists: {record.get('id', '?')}/{path}") from exc


def apply_presentation(data: dict, dataset: str, registry: dict | None = None) -> dict:
    """Return a patched copy, or raise without changing the input.

    Both an original value and the exact final value are accepted. No substring
    replacement, fuzzy match, reference rewrite or global language substitution.
    """
    registry = registry if registry is not None else read_registry()
    spec = next((x for x in registry["datasets"] if x["file"] == dataset), None)
    if spec is None:
        raise ValueError("Dataset has no reviewed presentation edits")
    output = deepcopy(data)
    records = output.get(spec["collection"])
    if not isinstance(records, list) or not all(isinstance(x, dict) and isinstance(x.get("id"), str) for x in records):
        raise ValueError("Invalid presentation dataset records")
    by_id = {x["id"]: x for x in records}
    if len(by_id) != len(records):
        raise ValueError("Duplicate record IDs prevent a safe presentation update")
    for change in spec["changes"]:
        identity, field = change["id"], change["field"]
        if identity not in by_id:
            raise ValueError(f"Presentation record no longer exists: {identity}")
        record = by_id[identity]
        node, key, original = _field(record, field)
        if field.startswith("body."):
            block = record["body"][int(field.split(".")[1])]
            # Bibliographic blocks are never editorial substitutes.
            if str(block.get("label", "")).startswith("["):
                raise ValueError(f"Presentation change targets a reference: {identity}/{field}")
        if original not in (change["before"], change["after"]):
            raise ValueError(f"Source text changed; review presentation edit before rebuilding: {identity}/{field}")
        node[key] = change["after"]
    revision = output.get("presentationRevision")
    if revision is not None and revision != spec["revision"]:
        raise ValueError("A different presentation revision requires reconciliation")
    output["presentationRevision"] = deepcopy(spec["revision"])
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset", choices=DATASETS)
    parser.add_argument("--input", type=Path, help="Generated JSON; defaults to the named application dataset")
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--output", type=Path, help="Write only after every exact edit has been validated")
    target.add_argument("--check", action="store_true", help="Check idempotence without writing")
    args = parser.parse_args()
    source = args.input or APP / args.dataset
    data = json.loads(source.read_text(encoding="utf-8"))
    output = apply_presentation(data, args.dataset)
    if args.check:
        if data != output:
            raise SystemExit("Presentation edits still need to be applied")
    else:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"dataset": args.dataset, "revision": output["presentationRevision"]["id"], "idempotent": apply_presentation(output, args.dataset) == output, "written": not args.check}, ensure_ascii=False))


if __name__ == "__main__":
    main()

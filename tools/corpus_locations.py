"""Resolve stable corpus locators without exposing private filesystem locations.

The catalogue stores logical identifiers (for example caretools/registros/...).
A private MEPRE location registry maps these to the physical master structure.
Only this build-time module reads the registry; it is not loaded by the web app.
"""
from __future__ import annotations

import json
import os
from pathlib import Path, PurePosixPath


REGISTRY_NAME = "mepre-ubicaciones.json"


class CorpusLocations:
    """A single registry is authoritative; missing mappings fail closed."""

    def __init__(self, root: Path, prefixes: dict[str, str] | None = None, exact: dict[str, str] | None = None):
        self.root = root.resolve(strict=True)
        if not self.root.is_dir():
            raise ValueError("The corpus root must be a directory")
        self.prefixes = prefixes
        self.exact = exact or {}
        for logical, physical in self.exact.items():
            self._relative(logical)
            self._relative(physical)
        if prefixes is not None:
            if not isinstance(prefixes, dict) or not prefixes:
                raise ValueError("The location registry needs nonempty prefixes")
            for logical, physical in prefixes.items():
                self._relative(logical)
                self._relative(physical)

    @staticmethod
    def _relative(value: str) -> PurePosixPath:
        if not isinstance(value, str) or not value or "\\" in value:
            raise ValueError("Source locators must be nonempty POSIX relative paths")
        path = PurePosixPath(value)
        if path.is_absolute() or ".." in path.parts or ":" in value:
            raise ValueError("Source locators cannot be absolute, URLs or traversals")
        return path

    @classmethod
    def from_registry(cls, registry: Path):
        registry = registry.resolve(strict=True)
        data = json.loads(registry.read_text(encoding="utf-8"))
        if data.get("version") != "1.0":
            raise ValueError("Unsupported MEPRE location registry schema")
        root_value = data.get("root", ".")
        if not isinstance(root_value, str) or Path(root_value).is_absolute():
            raise ValueError("Registry root must be relative to the registry")
        # The trusted registry may live under governance and refer to its parent.
        root = (registry.parent / root_value).resolve(strict=True)
        # The project registry also retains absolute aliases for external originals.
        # CareLab accepts relative logical identities only; those aliases are not read.
        prefixes = {key: value for key, value in data["prefixes"].items()
                    if not PurePosixPath(key).is_absolute()}
        exact = {}
        if data.get("exact_map"):
            cls._relative(data["exact_map"])
            map_path = (root / data["exact_map"]).resolve(strict=True)
            if not map_path.is_relative_to(root):
                raise ValueError("Migration map escapes the registered corpus")
            rows = json.loads(map_path.read_text(encoding="utf-8"))["entries"]
            for row in rows:
                logical, physical = row["old_path"], row["new_path"]
                if PurePosixPath(logical).is_absolute():
                    continue
                if logical in exact and exact[logical] != physical:
                    raise ValueError(f"Ambiguous source mapping: {logical}")
                exact[logical] = physical
        return cls(root, prefixes, exact)

    @classmethod
    def discover(cls, *, corpus_root: Path | None = None,
                 registry: Path | None = None, anchor: Path | None = None):
        if registry is not None:
            if corpus_root is not None:
                raise ValueError("Choose --locations or corpus_root, not both")
            return cls.from_registry(registry)
        if corpus_root is not None:
            registered = corpus_root / REGISTRY_NAME
            return cls.from_registry(registered) if registered.is_file() else cls(corpus_root)
        if os.environ.get("MEPRE_LOCATIONS"):
            return cls.from_registry(Path(os.environ["MEPRE_LOCATIONS"]))
        if os.environ.get("MEPRE_CORPUS_ROOT"):
            return cls.discover(corpus_root=Path(os.environ["MEPRE_CORPUS_ROOT"]))
        anchor = (anchor or Path(__file__)).resolve()
        ancestors = [anchor] + list(anchor.parents) if anchor.is_dir() else list(anchor.parents)
        for parent in ancestors:
            registry = parent / REGISTRY_NAME
            if registry.is_file():
                return cls.from_registry(registry)
        for parent in ancestors:
            if (parent / "caretools/registros/datos_integrados.json").is_file() and (parent / "guias_transversales/partes").is_dir():
                return cls(parent)
        raise FileNotFoundError(
            "Corpus not found. Supply --locations REGISTRY, MEPRE_LOCATIONS, "
            "or an explicit corpus root. The public app does not contain source documents."
        )

    def path(self, logical: str) -> Path:
        self._relative(logical)
        physical = logical
        if logical in self.exact:
            physical = self.exact[logical]
        elif self.prefixes is not None:
            matches = [key for key in self.prefixes if logical == key or logical.startswith(key.rstrip("/") + "/")]
            if not matches:
                raise KeyError(f"Unregistered source locator: {logical}")
            prefix = max(matches, key=len)
            physical = self.prefixes[prefix].rstrip("/") + logical[len(prefix):]
        target = (self.root / physical).resolve(strict=True)
        if not target.is_relative_to(self.root):
            raise ValueError(f"Source escapes the registered corpus: {logical}")
        if not target.is_file():
            raise ValueError(f"Source is not a file: {logical}")
        return target

    def read_bytes(self, logical: str) -> bytes:
        return self.path(logical).read_bytes()

    def read_json(self, logical: str):
        return json.loads(self.read_bytes(logical))

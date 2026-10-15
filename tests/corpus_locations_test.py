"""Portable build contracts using temporary synthetic corpus files only."""
from pathlib import Path
import json
import os
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from corpus_locations import CorpusLocations


class LocationsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name).resolve()
        self.source = self.root / "02_library/tools/records/data.json"
        self.source.parent.mkdir(parents=True)
        self.source.write_text('{"id":"CT-001"}', encoding="utf-8")
        self.registry = self.root / "mepre-ubicaciones.json"
        self.registry.write_text(json.dumps({"version":"1.0", "root":".", "prefixes":{"caretools":"02_library/tools", "caretools/registros":"02_library/tools/records"}}))

    def test_longest_prefix_preserves_logical_identity(self):
        locations = CorpusLocations.from_registry(self.registry)
        self.assertEqual(locations.path("caretools/registros/data.json"), self.source)
        self.assertEqual(locations.read_json("caretools/registros/data.json"), {"id":"CT-001"})

    def test_ancestor_discovery_after_moving_app(self):
        app = self.root / "04_apps/CareLab/app/tools"
        app.mkdir(parents=True)
        with patch.dict(os.environ, {}, clear=True):
            locations = CorpusLocations.discover(anchor=app)
            self.assertEqual(locations.path("caretools/registros/data.json"), self.source)

    def test_explicit_root_uses_registry_if_present(self):
        self.assertEqual(CorpusLocations.discover(corpus_root=self.root).path("caretools/registros/data.json"), self.source)

    def test_env_registry(self):
        with patch.dict(os.environ, {"MEPRE_LOCATIONS":str(self.registry)}, clear=True):
            self.assertEqual(CorpusLocations.discover().root, self.root)

    def test_plain_legacy_root_remains_supported(self):
        self.assertEqual(CorpusLocations(self.root).path("02_library/tools/records/data.json"), self.source)

    def test_missing_mapping_and_source_fail(self):
        locations = CorpusLocations.from_registry(self.registry)
        with self.assertRaises(KeyError): locations.path("unknown/data.json")
        with self.assertRaises(FileNotFoundError): locations.path("caretools/registros/missing.json")

    def test_traversals_and_urls_fail(self):
        locations = CorpusLocations.from_registry(self.registry)
        for value in ("../secret", "/etc/passwd", "file://x", "caretools/../../secret", "caretools\\x"):
            with self.subTest(value=value), self.assertRaises(ValueError): locations.path(value)

    def test_symlink_escape_fails(self):
        with tempfile.TemporaryDirectory() as outside:
            target = Path(outside)/"data.json"
            target.write_text('{}')
            (self.source.parent/"escape.json").symlink_to(target)
            with self.assertRaises(ValueError): CorpusLocations.from_registry(self.registry).path("caretools/registros/escape.json")

    def test_exact_migration_map_takes_precedence(self):
        target = self.root / "different/data.json"
        target.parent.mkdir()
        target.write_text('{"id":"exact"}')
        (self.root / "migration.json").write_text(json.dumps({"entries":[{"old_path":"caretools/registros/data.json", "new_path":"different/data.json"}]}))
        registry = json.loads(self.registry.read_text())
        registry["exact_map"] = "migration.json"
        self.registry.write_text(json.dumps(registry))
        self.assertEqual(CorpusLocations.from_registry(self.registry).read_json("caretools/registros/data.json"), {"id":"exact"})

    def test_external_absolute_alias_does_not_block_relative_sources(self):
        registry = json.loads(self.registry.read_text())
        registry["prefixes"]["/external/original.pdf"] = "01_sources/original.pdf"
        self.registry.write_text(json.dumps(registry))
        locations = CorpusLocations.from_registry(self.registry)
        self.assertEqual(locations.path("caretools/registros/data.json"), self.source)
        with self.assertRaises(ValueError): locations.path("/external/original.pdf")

    def test_invalid_registry_version_fails(self):
        self.registry.write_text('{"version":"2.0","prefixes":{"x":"x"}}')
        with self.assertRaises(ValueError): CorpusLocations.from_registry(self.registry)

    def test_conflicting_arguments_fail(self):
        with self.assertRaises(ValueError): CorpusLocations.discover(corpus_root=self.root, registry=self.registry)

if __name__ == "__main__": unittest.main()

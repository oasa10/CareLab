"""Bibliographic identity must survive access alternatives and withdrawn links."""
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from build_biblioteca import Library
from corpus_locations import CorpusLocations


class ReferencesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.library = Library(CorpusLocations(Path(self.tmp.name)))
        self.item = {"body": [], "links": []}

    def test_alternative_labels_destination_but_preserves_citation(self):
        self.library.references(self.item, [{
            "id": "REF01", "title": "Historical report", "year": 2013,
            "url": "https://example.org/current-help", "link_title": "Current help; alternative",
            "bibliographic_note": "This is not the historical report.",
            "verification_url": "https://example.org/catalogue",
        }])
        self.assertEqual(self.item["body"][0]["label"], "[REF01] Historical report")
        self.assertIn("2013", self.item["body"][0]["text"])
        self.assertIn("not the historical report", self.item["body"][0]["text"])
        self.assertEqual(self.item["links"][0]["title"], "[REF01] Current help; alternative")
        self.assertEqual(self.item["links"][1]["title"], "[REF01] Historical report · verificación")

    def test_withdrawal_retains_work_and_note_without_link(self):
        self.library.references(self.item, [{
            "id": "REF02", "title": "Historical article", "url": None,
            "bibliographic_note": "Exact download could not be corroborated.",
        }])
        self.assertEqual(self.item["links"], [])
        self.assertEqual(self.item["body"][0]["label"], "[REF02] Historical article")
        self.assertIn("could not be corroborated", self.item["body"][0]["text"])

    def test_existing_official_site_is_not_duplicated_by_retired_dossier(self):
        self.library.references(self.item, [
            {"title": "Official site", "url": "https://example.org/"},
            {"title": "Old dossier", "url": None, "bibliographic_note": "Use the official site already cited."},
        ])
        self.assertEqual(len(self.item["links"]), 1)
        self.assertEqual(self.item["body"][0]["label"], "Old dossier")


if __name__ == "__main__":
    unittest.main()

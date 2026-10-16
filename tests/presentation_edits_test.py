"""Exact presentation adaptations are idempotent and preserve source identity."""
from copy import deepcopy
import json
from pathlib import Path
import sys
import unittest

APP = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP / "tools"))
from presentation_edits import apply_presentation, read_registry


class PresentationEditsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registry = read_registry()
        cls.spec = cls.registry["datasets"][0]
        cls.current = json.loads((APP / cls.spec["file"]).read_text(encoding="utf-8"))

    def test_all_public_datasets_are_idempotent(self):
        for spec in self.registry["datasets"]:
            with self.subTest(dataset=spec["file"]):
                original = json.loads((APP / spec["file"]).read_text(encoding="utf-8"))
                output = apply_presentation(original, spec["file"])
                self.assertEqual(original, output)
                self.assertEqual(apply_presentation(output, spec["file"]), output)

    def test_replay_changes_only_the_enumerated_fields(self):
        original = deepcopy(self.current)
        original.pop("presentationRevision")
        by_id = {record["id"]: record for record in original["items"]}
        for change in self.spec["changes"]:
            node = by_id[change["id"]]
            pieces = change["field"].split(".")
            for piece in pieces[:-1]:
                node = node[int(piece)] if isinstance(node, list) else node[piece]
            key = int(pieces[-1]) if isinstance(node, list) else pieces[-1]
            node[key] = change["before"]
        snapshot = deepcopy(original)
        output = apply_presentation(original, self.spec["file"])
        self.assertEqual(output, self.current)
        self.assertEqual(original, snapshot, "Inputs and original source wording must not be mutated")
        self.assertEqual(output["sources"], original["sources"])
        for old, new in zip(original["items"], output["items"]):
            for key in ("id", "source", "additionalSources", "links"):
                self.assertEqual(old.get(key), new.get(key), (old["id"], key))
            self.assertEqual([b for b in old["body"] if b["label"].startswith("[")],
                             [b for b in new["body"] if b["label"].startswith("[")])

    def test_conflict_is_transactional(self):
        original = deepcopy(self.current)
        change = self.spec["changes"][0]
        record = next(x for x in original["items"] if x["id"] == change["id"])
        record["body"][2]["text"] = "A new editorial source text must be reviewed."
        snapshot = deepcopy(original)
        with self.assertRaisesRegex(ValueError, "Source text changed"):
            apply_presentation(original, self.spec["file"])
        self.assertEqual(original, snapshot)

    def test_missing_record_is_not_silently_skipped(self):
        original = deepcopy(self.current)
        identity = self.spec["changes"][0]["id"]
        original["items"] = [x for x in original["items"] if x["id"] != identity]
        with self.assertRaisesRegex(ValueError, "no longer exists"):
            apply_presentation(original, self.spec["file"])

    def test_new_revision_is_not_overwritten(self):
        original = deepcopy(self.current)
        original["presentationRevision"] = {"id": "future-review"}
        with self.assertRaisesRegex(ValueError, "requires reconciliation"):
            apply_presentation(original, self.spec["file"])

    def test_registry_has_no_private_paths(self):
        payload = json.dumps(self.registry, ensure_ascii=False)
        self.assertNotIn("/Users/", payload)
        self.assertNotIn("file://", payload)
        self.assertEqual(len(self.spec["changes"]), 59)


if __name__ == "__main__":
    unittest.main()

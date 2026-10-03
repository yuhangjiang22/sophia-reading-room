#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).parent))
import interest_utils

spec = importlib.util.spec_from_file_location("sync_interests", Path(__file__).with_name("sync-interests.py"))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class InterestSyncTests(unittest.TestCase):
    def test_validates_and_imports_explicit_export(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            export = root / "sophia-reading-interests-test.json"
            export.write_text(json.dumps({
                "format": sync.FORMAT,
                "exported_at": "2026-10-03T04:00:00Z",
                "items": [{"id": "sleep-study", "title": "Sleep study", "topic": "睡眠与情绪",
                           "source_url": "https://pubmed.ncbi.nlm.nih.gov/123/"}],
            }), encoding="utf-8")
            queue = root / "private" / "interest-queue.json"
            self.assertEqual(sync.main(["--file", str(export), "--queue", str(queue)]), 0)
            saved = json.loads(queue.read_text(encoding="utf-8"))
            self.assertEqual(saved["items"][0]["id"], "sleep-study")
            self.assertEqual(saved["items"][0]["signal"], "saved")
            self.assertEqual(queue.stat().st_mode & 0o777, 0o600)

    def test_latest_export_replaces_previous_snapshot(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            downloads, queue = root / "Downloads", root / "private" / "queue.json"
            downloads.mkdir()
            queue.parent.mkdir()
            older = {"format": sync.FORMAT, "exported_at": "2026-10-01T00:00:00Z",
                     "items": [{"id": "old-paper", "title": "Old", "topic": "心理治疗"}]}
            queue.write_text(json.dumps({**older, "imported_at": "2026-10-01T00:01:00+00:00"}))
            newer = {"format": sync.FORMAT, "exported_at": "2026-10-02T00:00:00Z",
                     "items": [{"id": "new-paper", "title": "New", "topic": "睡眠与情绪"}]}
            (downloads / "sophia-reading-interests-latest.json").write_text(json.dumps(newer))
            self.assertEqual(sync.main(["--downloads-dir", str(downloads), "--queue", str(queue)]), 0)
            self.assertEqual(json.loads(queue.read_text())["items"][0]["id"], "new-paper")

    def test_invalid_scheme_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.json"
            path.write_text(json.dumps({"format": sync.FORMAT, "exported_at": "2026-10-03T00:00:00Z",
                                       "items": [{"id": "bad", "title": "Bad", "topic": "x",
                                                  "source_url": "javascript:alert(1)"}]}))
            with self.assertRaises(ValueError):
                sync.validate_snapshot(path)

    def test_topic_matching_is_soft_and_conservative(self):
        self.assertEqual(interest_utils.matching_preferences("CBT for Insomnia", ["睡眠与情绪"]), ["睡眠与情绪"])
        self.assertEqual(interest_utils.matching_preferences("A study of school meals", ["睡眠与情绪"]), [])


if __name__ == "__main__":
    unittest.main()

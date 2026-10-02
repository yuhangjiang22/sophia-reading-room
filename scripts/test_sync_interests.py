import importlib.util
import re
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("sync-interests.py")
spec = importlib.util.spec_from_file_location("sync_interests", MODULE_PATH)
sync_interests = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(sync_interests)


class InterestQueueTests(unittest.TestCase):
    def test_queue_filters_unknown_ids_and_invalid_feedback(self):
        source = (sync_interests.ROOT / "candidates.js").read_text(encoding="utf-8")
        known, second = re.findall(r"\bid:'([a-z0-9-]+)'", source)[:2]
        result = sync_interests.valid_queue({"items": [
            {"id": known, "feedback": "interested", "updatedAt": 1700000000000},
            {"id": "missing-candidate", "feedback": "interested", "updatedAt": 1700000000000},
            {"id": known, "feedback": "unexpected", "updatedAt": 1700000000000},
            {"id": second, "feedback": "interested", "updatedAt": "bad"},
            {"id": [], "feedback": "interested", "updatedAt": 1700000000000},
        ]})
        self.assertEqual([item["id"] for item in result["items"]], [known])

    def test_private_queue_file_is_atomic_and_private(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "private" / "interest-queue.json"
            sync_interests.save_private({"retrievedAt": "today", "items": []}, path)
            self.assertEqual(path.stat().st_mode & 0o777, 0o600)
            self.assertEqual(path.parent.stat().st_mode & 0o777, 0o700)
            self.assertEqual(path.read_text(encoding="utf-8").find('"items": []') >= 0, True)
            self.assertEqual(list(path.parent.glob(".interest-queue-*")), [])


if __name__ == "__main__":
    unittest.main()

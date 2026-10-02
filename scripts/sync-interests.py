#!/usr/bin/env python3
"""Fetch the private candidate-interest queue for the local editorial workflow."""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
QUEUE = ROOT / "content" / "private" / "interest-queue.json"
KEYCHAIN_SERVICE = "sophia-reading-room-workflow"


def api_base() -> str:
    override = os.environ.get("SOPHIA_SYNC_API_URL", "").strip().rstrip("/")
    if override:
        return override
    config = (ROOT / "sync-config.js").read_text(encoding="utf-8")
    match = re.search(r"apiBase\s*:\s*(['\"])(.*?)\1", config)
    return (match.group(2) if match else "").rstrip("/")


def workflow_key() -> str:
    value = os.environ.get("SOPHIA_WORKFLOW_SYNC_KEY", "").strip()
    if value:
        return value
    if sys.platform == "darwin":
        result = subprocess.run(
            ["security", "find-generic-password", "-s", KEYCHAIN_SERVICE, "-w"],
            capture_output=True, text=True, check=False,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    return ""


def valid_queue(payload: object) -> dict:
    if not isinstance(payload, dict) or not isinstance(payload.get("items"), list):
        raise ValueError("API returned an invalid queue")
    source = (ROOT / "candidates.js").read_text(encoding="utf-8")
    known_ids = set(re.findall(r"\bid:'([a-z0-9-]+)'", source))
    items = []
    seen = set()
    for item in payload["items"]:
        if not isinstance(item, dict):
            continue
        paper_id, feedback = item.get("id"), item.get("feedback")
        if not isinstance(paper_id, str) or paper_id not in known_ids or paper_id in seen or feedback not in {"interested", "skip"}:
            continue
        updated_at = item.get("updatedAt")
        if not isinstance(updated_at, int) or isinstance(updated_at, bool) or updated_at < 1:
            continue
        seen.add(paper_id)
        items.append({"id": paper_id, "feedback": feedback, "updatedAt": updated_at})
    retrieved_at = payload.get("retrievedAt")
    return {"retrievedAt": retrieved_at[:64] if isinstance(retrieved_at, str) else None, "items": items}


def save_private(payload: dict, destination: Path = QUEUE) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    try:
        destination.parent.chmod(0o700)
    except OSError:
        pass
    data = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    fd, temporary = tempfile.mkstemp(prefix=".interest-queue-", dir=destination.parent, text=True)
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as output:
            output.write(data)
            output.flush()
            os.fsync(output.fileno())
        os.replace(temporary, destination)
        try:
            destination.chmod(0o600)
        except OSError:
            pass
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def sync() -> int:
    base, key = api_base(), workflow_key()
    if not base or not key:
        print("Private interest sync is not configured; remote preferences are unavailable.", file=sys.stderr)
        return 2
    request = urllib.request.Request(
        base + "/workflow/interests", headers={"X-Workflow-Key": key, "Accept": "application/json"}
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            payload = json.loads(response.read())
        queue = valid_queue(payload)
        save_private(queue)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, json.JSONDecodeError) as error:
        print(f"Private interest sync failed ({type(error).__name__}); do not publish based on stale preferences.", file=sys.stderr)
        return 1
    interested = sum(item["feedback"] == "interested" for item in queue["items"])
    skipped = len(queue["items"]) - interested
    print(f"Synced private paper interests: {interested} interested, {skipped} set aside.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--optional", action="store_true", help="Warn and continue if no remote sync is configured")
    args = parser.parse_args()
    result = sync()
    return 0 if args.optional and result == 2 else result


if __name__ == "__main__":
    raise SystemExit(main())

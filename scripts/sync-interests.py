#!/usr/bin/env python3
"""Import an explicitly exported reading-room interest snapshot into the private local queue.

No API, browser credential, or website secret is used. The export is a public-paper
bookmark list, not an authorization to write, publish, or automatically approve content.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_QUEUE = ROOT / "content" / "private" / "interest-queue.json"
FORMAT = "sophia-reading-room-interest-v1"
MAX_BYTES = 2 * 1024 * 1024
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,99}$")


def parse_time(value: str) -> dt.datetime:
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("exported_at must include a timezone")
    return parsed.astimezone(dt.timezone.utc)


def validate_snapshot(path: Path) -> dict:
    if path.stat().st_size > MAX_BYTES:
        raise ValueError("interest export is unexpectedly large")
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict) or payload.get("format") != FORMAT:
        raise ValueError("unrecognized interest export format")
    exported_at = parse_time(payload.get("exported_at", ""))
    items = payload.get("items")
    if not isinstance(items, list) or len(items) > 500:
        raise ValueError("items must be a list of at most 500 saved papers")
    clean = []
    seen = set()
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("each interest must be an object")
        paper_id = str(item.get("id", ""))
        title = str(item.get("title", "")).strip()
        topic = str(item.get("topic", "")).strip()
        source_url = str(item.get("source_url", "")).strip()
        if not ID_RE.fullmatch(paper_id) or paper_id in seen:
            raise ValueError("paper ids must be unique lowercase ids")
        if not title or len(title) > 500 or len(topic) > 160:
            raise ValueError("title or topic is missing or too long")
        if source_url:
            parsed = urlparse(source_url)
            if parsed.scheme != "https" or not parsed.hostname:
                raise ValueError("source_url must be an HTTPS URL")
        seen.add(paper_id)
        clean.append({
            "id": paper_id,
            "title": title,
            "topic": topic,
            "type": str(item.get("type", ""))[:160],
            "source_title": str(item.get("source_title", ""))[:500],
            "source_url": source_url,
            "signal": "saved",
        })
    return {"exported_at": exported_at, "items": clean}


def atomic_write(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    try:
        os.chmod(path.parent, 0o700)
    except OSError:
        pass
    fd, temporary = tempfile.mkstemp(prefix=".interest-queue-", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temporary, 0o600)
        os.replace(temporary, path)
        os.chmod(path, 0o600)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def load_existing(path: Path) -> dict | None:
    if not path.exists():
        return None
    if path.stat().st_size > MAX_BYTES:
        raise ValueError("private interest queue is unexpectedly large")
    existing = json.loads(path.read_text(encoding="utf-8"))
    if existing.get("format") != FORMAT or not isinstance(existing.get("items"), list):
        raise ValueError("private interest queue has an unsupported format")
    return existing


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", type=Path, help="explicit JSON export to import")
    parser.add_argument("--downloads-dir", type=Path, default=Path.home() / "Downloads")
    parser.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    args = parser.parse_args(argv)
    queue_path = args.queue.expanduser().resolve()

    try:
        existing = load_existing(queue_path)
        candidates = [args.file.expanduser()] if args.file else sorted(
            args.downloads_dir.expanduser().glob("sophia-reading-interests-*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        imported = None
        for candidate in candidates:
            if candidate.is_file():
                imported = (candidate.resolve(), validate_snapshot(candidate))
                break

        if imported:
            source, snapshot = imported
            previous_time = None
            if existing and existing.get("exported_at"):
                previous_time = parse_time(existing["exported_at"])
            if previous_time is None or snapshot["exported_at"] > previous_time:
                now = dt.datetime.now(dt.timezone.utc).isoformat()
                queue = {
                    "format": FORMAT,
                    "exported_at": snapshot["exported_at"].isoformat(),
                    "imported_at": now,
                    "source_export": source.name,
                    "items": snapshot["items"],
                    "usage": "Preference signal only; requires full-text and editorial review before drafting or publication.",
                }
                atomic_write(queue_path, queue)
                print(f"已导入兴趣快照：{len(queue['items'])} 篇收藏论文，主题偏好已写入被忽略的本地队列。")
                print("这些收藏仅用于选题优先级；不会自动通过全文审核、生成定稿或发布。")
                return 0

        if existing:
            print(f"已读取最近兴趣快照：{len(existing['items'])} 篇收藏论文（{existing.get('exported_at', '时间未知')}）。")
            print("当前没有更新的导出文件；沿用上次本地快照。")
            return 0

        print("本轮无法读取 Sophia 的偏好：没有找到兴趣快照导出文件，也没有本地兴趣队列。", file=sys.stderr)
        print("请在网站“我的书架”点击“导出兴趣快照”，再把下载文件留在 Downloads；半月任务会自动导入。", file=sys.stderr)
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"兴趣快照同步失败：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

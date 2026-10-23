# -*- coding: utf-8 -*-
"""
PrismQuant — export A2 (political monitor) data to data/political.json.

Run with the A2 backend's venv (which has psycopg):

    cd <political-monitor>
    .venv\\Scripts\\python.exe <path-to>/tools/export_political.py \
        --out "<path-to>/data/political.json"

Reads people + sources + public_records straight from PostgreSQL and writes a
snapshot the web client can render when the live backend isn't reachable
(e.g. on GitHub Pages). Read-only.

The shape matches the live API contract (items + source_name / publisher_name
joined from sources), so the frontend's existing rendering path just works.
"""
import argparse
import json
import os
import sys
from datetime import date, datetime, timezone


def iso(dt):
    if dt is None:
        return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    if isinstance(dt, date):
        return dt.isoformat()
    return dt


def connect(cfg):
    try:
        import psycopg
    except ImportError:
        sys.stderr.write(
            "psycopg not found. Run this with the A2 venv python "
            "(political-monitor\\.venv\\Scripts\\python.exe).\n"
        )
        sys.exit(1)
    return psycopg.connect(
        host=cfg["host"], port=cfg["port"], dbname=cfg["name"],
        user=cfg["user"], password=cfg["password"],
    )


def fetch(conn, cfg):
    cur = conn.cursor()

    cur.execute(
        "SELECT person_id, name_original, name_zh, aliases, country_codes, "
        "monitoring_enabled FROM people ORDER BY name_original"
    )
    people = [
        {
            "person_id": str(r[0]),
            "name_original": r[1],
            "name_zh": r[2],
            "aliases": list(r[3] or []),
            "country_codes": list(r[4] or []),
            "monitoring_enabled": bool(r[5]),
        }
        for r in cur.fetchall()
    ]

    cur.execute(
        "SELECT source_id, name, publisher_name, provenance_type "
        "FROM sources ORDER BY name"
    )
    src = {str(r[0]): {"name": r[1], "publisher": r[2], "prov": r[3]}
           for r in cur.fetchall()}

    cur.execute(
        "SELECT record_id, source_id, person_id, title, content_type, "
        "provenance_type, original_url, published_at, page_date, language, "
        "verification_status, body_text "
        "FROM public_records ORDER BY published_at DESC NULLS LAST, "
        "first_seen_at DESC NULLS LAST"
    )
    records = []
    for r in cur.fetchall():
        s = src.get(str(r[1]), {})
        records.append({
            "record_id": str(r[0]),
            "source_id": str(r[1]),
            "source_name": s.get("name") or "",
            "publisher_name": s.get("publisher") or "",
            "person_id": str(r[2]) if r[2] else None,
            "title": r[3] or "",
            "content_type": r[4] or "public_statement",
            "provenance_type": r[5] or "official",
            "original_url": r[6],
            "published_at": iso(r[7]),
            "page_date": iso(r[8]),
            "language": r[9],
            "verification_status": r[10] or "needs_review",
            "body_text": r[11] or "",
        })
    return people, records


def main():
    ap = argparse.ArgumentParser(description="Export A2 data to a static JSON snapshot")
    ap.add_argument("--out", default="data/political.json")
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=5432)
    ap.add_argument("--db", default="prismquant_political")
    ap.add_argument("--user", default="prismquant_app")
    ap.add_argument("--password", default=None)
    args = ap.parse_args()

    password = args.password
    if not password:
        password = os.environ.get("PQ_DB_PASSWORD", "")

    cfg = {"host": args.host, "port": args.port, "name": args.db,
           "user": args.user, "password": password}

    conn = connect(cfg)
    try:
        people, records = fetch(conn, cfg)
    finally:
        conn.close()

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "postgresql://%s@%s:%s/%s" % (cfg["user"], cfg["host"], cfg["port"], cfg["name"]),
        "people_count": len(people),
        "records_count": len(records),
        "people": people,
        "records": records,
    }

    out = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    print("wrote %s  (%d people, %d records, %d bytes)"
          % (out, len(people), len(records), os.path.getsize(out)))


if __name__ == "__main__":
    main()

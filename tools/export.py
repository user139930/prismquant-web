"""
PrismQuant — data exporters for A1 (news) and A3 (backtest).

The web client can read two static JSON files instead of the sample fixtures:

    data/news.json       <- from news-main/data/news.sqlite3
    data/backtests.json  <- from ndxbots backtest output (curve.csv)

Static JSON works on GitHub Pages too, so no server has to be running for the
demo. It is a snapshot, not a live feed.

Usage
-----
    # 1. inspect what is inside the database (run this first, send me the output)
    python tools/export.py news --db "<path>/news.sqlite3" --report

    # 2. export
    python tools/export.py news --db "<path>/news.sqlite3" --out data/news.json --limit 60

    # 3. backtest curve
    python tools/export.py backtest --curve "<path>/curve.csv" --out data/backtests.json \
        --name "多因子评分轮动" --benchmark "<path>/benchmark.csv"

Nothing here talks to the network and nothing modifies the source files.
"""

import argparse
import csv
import json
import math
import os
import sqlite3
import sys
from datetime import datetime, timezone

POS = {"positive", "pos", "bullish", "up", "利多", "正面"}
NEG = {"negative", "neg", "bearish", "down", "利空", "负面"}


def die(msg):
    print("ERROR: " + msg, file=sys.stderr)
    sys.exit(1)


def parse_json(value):
    if not value:
        return {}
    try:
        return json.loads(value)
    except Exception:
        return {}


def deep_find(obj, keys, depth=0):
    """First value found for any of `keys`, searched breadth-first."""
    if depth > 4 or not isinstance(obj, dict):
        return None
    for k in keys:
        if k in obj and obj[k] not in (None, "", []):
            return obj[k]
    for v in obj.values():
        if isinstance(v, dict):
            got = deep_find(v, keys, depth + 1)
            if got not in (None, "", []):
                return got
    return None


# --------------------------------------------------------------------------- news

def cmd_news(args):
    if not os.path.exists(args.db):
        die("database not found: " + args.db)

    con = sqlite3.connect("file:%s?mode=ro" % args.db.replace("\\", "/"), uri=True)
    con.row_factory = sqlite3.Row

    tables = [r["name"] for r in con.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
    if "articles" not in tables:
        die("no `articles` table. tables present: " + ", ".join(tables))

    cols = [r["name"] for r in con.execute("PRAGMA table_info(articles)")]

    if args.report:
        print("tables :", ", ".join(tables))
        print("columns:", ", ".join(cols))
        for status, n in con.execute(
                "SELECT status, COUNT(*) FROM articles GROUP BY status ORDER BY 2 DESC"):
            print("  status %-12s %d" % (status, n))
        row = con.execute(
            "SELECT * FROM articles WHERE analysis_json IS NOT NULL "
            "ORDER BY published_sort DESC LIMIT 1").fetchone()
        if row is None:
            print("no analysed rows yet — run the analyser in the Streamlit app first")
            return
        meta = parse_json(row["metadata_json"])
        analy = parse_json(row["analysis_json"])
        print("\nmetadata_json top-level keys :", sorted(meta.keys()))
        print("analysis_json top-level keys :", sorted(analy.keys()))
        print("\nmetadata sample:")
        print(json.dumps({k: meta[k] for k in list(meta)[:12]}, ensure_ascii=False, indent=2)[:1200])
        print("\nanalysis sample:")
        print(json.dumps(analy, ensure_ascii=False, indent=2)[:1600])
        return

    order = "published_sort" if "published_sort" in cols else "id"
    rows = con.execute(
        "SELECT * FROM articles WHERE analysis_json IS NOT NULL "
        "ORDER BY %s DESC LIMIT ?" % order, (args.limit,)).fetchall()

    items = []
    for row in rows:
        r = dict(row)
        meta = parse_json(r.get("metadata_json"))
        analy = parse_json(r.get("analysis_json"))

        direction = str(deep_find(analy, ["direction", "sentiment", "stance"]) or "").lower()
        sentiment = "pos" if direction in POS else "neg" if direction in NEG else "neu"

        conf = deep_find(analy, ["confidence"])
        try:
            conf = float(conf)
        except (TypeError, ValueError):
            conf = None

        impacts = deep_find(analy, ["impacts", "impact", "assets", "tickers"]) or []
        tickers = []
        if isinstance(impacts, list):
            for it in impacts:
                if isinstance(it, dict):
                    t = it.get("ticker") or it.get("symbol")
                    if t:
                        tickers.append(str(t))

        items.append({
            "id": r.get("id"),
            "title": deep_find(meta, ["title", "headline"]) or deep_find(analy, ["fact"]) or "(untitled)",
            "url": r.get("canonical_url"),
            "source": deep_find(meta, ["source", "publisher", "site", "feed"]) or "",
            "published_at": deep_find(meta, ["published", "published_at", "date"]) or r.get("published_sort"),
            "summary": deep_find(meta, ["summary", "description", "excerpt"]) or deep_find(analy, ["fact"]) or "",
            "sentiment": sentiment,
            "topic": deep_find(analy, ["event_type", "topic", "category"]) or "",
            "reasoning": deep_find(analy, ["reasoning", "rationale"]) or "",
            "confidence": conf,
            "tickers": tickers[:6],
        })

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": os.path.basename(args.db),
        "count": len(items),
        "items": items,
    }
    write_out(args.out, payload, "news items")


# ----------------------------------------------------------------------- backtest

def read_curve(path):
    if not os.path.exists(path):
        die("curve file not found: " + path)
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        die("curve file is empty: " + path)

    keys = [k.lower() for k in rows[0].keys()]
    def pick(*cands):
        for c in cands:
            if c in keys:
                return list(rows[0].keys())[keys.index(c)]
        return None

    date_k = pick("date", "dt", "day", "time", "timestamp")
    nav_k = pick("nav", "equity", "value", "close", "net_asset_value", "capital")
    if nav_k is None:
        die("cannot find a NAV column. columns are: " + ", ".join(rows[0].keys()))

    xs, ys = [], []
    for r in rows:
        try:
            y = float(r[nav_k])
        except (TypeError, ValueError):
            continue
        ys.append(y)
        xs.append(r[date_k] if date_k else str(len(xs)))
    if len(ys) < 10:
        die("only %d numeric rows in the curve" % len(ys))
    return xs, ys


def stats_of(ys):
    first, last = ys[0], ys[-1]
    total = (last / first - 1) * 100
    peak, mdd = ys[0], 0.0
    for v in ys:
        peak = max(peak, v)
        mdd = min(mdd, (v / peak - 1) * 100)
    rets = [ys[i] / ys[i - 1] - 1 for i in range(1, len(ys))]
    mean = sum(rets) / len(rets)
    sd = math.sqrt(sum((x - mean) ** 2 for x in rets) / len(rets))
    sharpe = (mean / sd * math.sqrt(252)) if sd else 0.0
    ann = ((last / first) ** (252 / len(ys)) - 1) * 100
    return {"total": round(total, 2), "ann": round(ann, 2), "mdd": round(mdd, 2),
            "sharpe": round(sharpe, 2), "vol": round(sd * math.sqrt(252) * 100, 2)}


def cmd_backtest(args):
    xs, ys = read_curve(args.curve)
    item = {"id": args.id, "name": args.name, "market": args.market,
            "dates": xs, "nav": [round(v, 4) for v in ys], "stats": stats_of(ys)}

    if args.benchmark:
        _, by = read_curve(args.benchmark)
        item["benchmark"] = [round(v, 4) for v in by]
        item["benchmark_stats"] = stats_of(by)

    payload = {"generated_at": datetime.now(timezone.utc).isoformat(),
               "items": [item]}
    write_out(args.out, payload, "backtest series")


def write_out(path, payload, what):
    os.makedirs(os.path.dirname(os.path.abspath(path)) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    print("wrote %s  (%s, %d bytes)" % (path, what, os.path.getsize(path)))


def main():
    ap = argparse.ArgumentParser(description="Export A1/A3 data for the PrismQuant web client")
    sub = ap.add_subparsers(dest="cmd", required=True)

    n = sub.add_parser("news", help="export analysed news articles from news.sqlite3")
    n.add_argument("--db", required=True)
    n.add_argument("--out", default="data/news.json")
    n.add_argument("--limit", type=int, default=60)
    n.add_argument("--report", action="store_true", help="print schema and one sample record")
    n.set_defaults(func=cmd_news)

    b = sub.add_parser("backtest", help="export a backtest curve to JSON")
    b.add_argument("--curve", required=True)
    b.add_argument("--benchmark", default=None)
    b.add_argument("--out", default="data/backtests.json")
    b.add_argument("--id", default="MF")
    b.add_argument("--name", default="多因子评分轮动")
    b.add_argument("--market", default="US / HK 股票")
    b.set_defaults(func=cmd_backtest)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

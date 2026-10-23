"""
Shared readers for the A1 (news) and A3 (backtest) data sources.

Used by both tools/export.py (write JSON to disk) and tools/api_server.py
(serve the same JSON over HTTP). Read-only: never writes to the source files.
"""

import csv
import json
import math
import os
import sqlite3
from datetime import datetime, timezone

POS = {"positive", "pos", "bullish", "up", "利多", "正面"}
NEG = {"negative", "neg", "bearish", "down", "利空", "负面"}


class DataError(Exception):
    pass


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

def open_news(db_path):
    if not db_path or not os.path.exists(db_path):
        raise DataError("news database not found: %s" % db_path)
    con = sqlite3.connect("file:%s?mode=ro" % db_path.replace("\\", "/"), uri=True)
    con.row_factory = sqlite3.Row
    tables = [r["name"] for r in con.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")]
    if "articles" not in tables:
        raise DataError("no `articles` table. tables present: " + ", ".join(tables))
    return con


def news_schema(db_path):
    con = open_news(db_path)
    cols = [r["name"] for r in con.execute("PRAGMA table_info(articles)")]
    counts = [(r[0], r[1]) for r in con.execute(
        "SELECT status, COUNT(*) FROM articles GROUP BY status ORDER BY 2 DESC")]
    con.close()
    return cols, counts


def news_sample(db_path):
    con = open_news(db_path)
    row = con.execute(
        "SELECT * FROM articles WHERE analysis_json IS NOT NULL "
        "ORDER BY published_sort DESC LIMIT 1").fetchone()
    con.close()
    if row is None:
        return None, None
    return parse_json(row["metadata_json"]), parse_json(row["analysis_json"])


def news_items(db_path, limit=60):
    con = open_news(db_path)
    cols = [r["name"] for r in con.execute("PRAGMA table_info(articles)")]
    order = "published_sort" if "published_sort" in cols else "id"
    rows = con.execute(
        "SELECT * FROM articles WHERE analysis_json IS NOT NULL "
        "ORDER BY %s DESC LIMIT ?" % order, (limit,)).fetchall()
    con.close()

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
    return items


def news_payload(db_path, limit=60):
    items = news_items(db_path, limit)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": os.path.basename(db_path),
        "count": len(items),
        "items": items,
    }


# ----------------------------------------------------------------------- backtest

def read_curve(path):
    if not path or not os.path.exists(path):
        raise DataError("curve file not found: %s" % path)
    with open(path, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        raise DataError("curve file is empty: " + path)

    keys = [k.lower() for k in rows[0].keys()]

    def pick(*cands):
        for c in cands:
            if c in keys:
                return list(rows[0].keys())[keys.index(c)]
        return None

    date_k = pick("date", "dt", "day", "time", "timestamp")
    nav_k = pick("nav", "equity", "value", "close", "net_asset_value", "capital")
    if nav_k is None:
        raise DataError("cannot find a NAV column. columns are: " + ", ".join(rows[0].keys()))

    xs, ys = [], []
    for r in rows:
        try:
            y = float(r[nav_k])
        except (TypeError, ValueError):
            continue
        ys.append(y)
        xs.append(r[date_k] if date_k else str(len(xs)))
    if len(ys) < 10:
        raise DataError("only %d numeric rows in the curve" % len(ys))
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


def backtest_payload(curve_path, benchmark_path=None, ident="MF",
                     name="多因子评分轮动", market="US / HK 股票"):
    xs, ys = read_curve(curve_path)
    item = {"id": ident, "name": name, "market": market,
            "dates": xs, "nav": [round(v, 4) for v in ys], "stats": stats_of(ys)}
    if benchmark_path:
        _, by = read_curve(benchmark_path)
        item["benchmark"] = [round(v, 4) for v in by]
        item["benchmark_stats"] = stats_of(by)
    return {"generated_at": datetime.now(timezone.utc).isoformat(), "items": [item]}

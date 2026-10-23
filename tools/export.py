"""
PrismQuant — export A1 (news) and A3 (backtest) data to JSON for the web client.

    python tools/export.py news --db "<path>/news.sqlite3" --report
    python tools/export.py news --db "<path>/news.sqlite3" --out data/news.json
    python tools/export.py backtest --curve "<path>/curve.csv" --out data/backtests.json

Read-only. Nothing is uploaded anywhere. See tools/pqdata.py for the mapping.
"""

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pqdata  # noqa: E402


def write_out(path, payload, what):
    os.makedirs(os.path.dirname(os.path.abspath(path)) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1)
    print("wrote %s  (%s, %d bytes)" % (path, what, os.path.getsize(path)))


def cmd_news(args):
    if args.report:
        cols, counts = pqdata.news_schema(args.db)
        print("columns:", ", ".join(cols))
        for status, n in counts:
            print("  status %-12s %d" % (status, n))
        meta, analy = pqdata.news_sample(args.db)
        if meta is None:
            print("no analysed rows yet — run the analyser in the Streamlit app first")
            return
        print("\nmetadata_json keys :", sorted(meta.keys()))
        print("analysis_json keys :", sorted(analy.keys()))
        print("\nmetadata sample:")
        print(json.dumps(meta, ensure_ascii=False, indent=2)[:1000])
        print("\nanalysis sample:")
        print(json.dumps(analy, ensure_ascii=False, indent=2)[:1400])
        return

    payload = pqdata.news_payload(args.db, args.limit)
    write_out(args.out, payload, "news items")


def cmd_backtest(args):
    payload = pqdata.backtest_payload(args.curve, args.benchmark, args.id, args.name, args.market)
    write_out(args.out, payload, "backtest series")


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
    try:
        args.func(args)
    except pqdata.DataError as exc:
        print("ERROR: %s" % exc, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

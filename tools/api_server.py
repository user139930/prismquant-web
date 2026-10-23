"""
PrismQuant — a tiny local API for A1 (news) and A3 (backtest) data.

No dependencies: standard library only. Point it at the two source files and it
serves

    GET /health
    GET /api/v1/news/events?limit=60        (from news.sqlite3)
    GET /api/v1/strategy/backtests          (from curve.csv)

It also serves the web client itself, and it answers `/data/news.json` and
`/data/backtests.json` from the live sources — which means the existing
index.html picks up real data with **no frontend changes at all**.

    python tools/api_server.py --news-db "<path>/news.sqlite3" --curve "<path>/curve.csv"
    # then open http://localhost:8020/

Both arguments are optional: omit one and that module keeps using the sample
data in the client.
"""

import argparse
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pqdata  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = {"news_db": None, "curve": None, "benchmark": None, "limit": 60}


class Handler(SimpleHTTPRequestHandler):
    server_version = "PrismQuantDev/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))

    def _json(self, payload, code=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _fail(self, message, code=503):
        self._json({"detail": {"code": "unavailable", "message": message}}, code)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.send_header("Access-Control-Allow-Headers", "Accept, Content-Type")
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        path = url.path

        if path in ("/healthz", "/api/v1/health"):
            return self._json({
                "status": "ok",
                "news_db": bool(CONFIG["news_db"]),
                "curve": bool(CONFIG["curve"]),
            })

        if path == "/api/v1/news/events" or path == "/data/news.json":
            if not CONFIG["news_db"]:
                return self._fail("未提供 --news-db，無法讀取新聞資料")
            limit = CONFIG["limit"]
            if path.startswith("/api/"):
                try:
                    limit = int((parse_qs(url.query).get("limit") or [limit])[0])
                except ValueError:
                    return self._fail("limit 必須是整數", 422)
            try:
                return self._json(pqdata.news_payload(CONFIG["news_db"], limit))
            except pqdata.DataError as exc:
                return self._fail(str(exc))
            except Exception as exc:
                return self._fail("讀取資料庫失敗：%s" % exc)

        if path == "/api/v1/strategy/backtests" or path == "/data/backtests.json":
            if not CONFIG["curve"]:
                return self._fail("未提供 --curve，無法讀取回測資料")
            try:
                return self._json(pqdata.backtest_payload(
                    CONFIG["curve"], CONFIG["benchmark"]))
            except pqdata.DataError as exc:
                return self._fail(str(exc))
            except Exception as exc:
                return self._fail("讀取回測檔失敗：%s" % exc)

        return super().do_GET()


def main():
    ap = argparse.ArgumentParser(description="Local API + static server for PrismQuant")
    ap.add_argument("--news-db", default=None, help="path to news.sqlite3 (A1)")
    ap.add_argument("--curve", default=None, help="path to a backtest curve.csv (A3)")
    ap.add_argument("--benchmark", default=None, help="optional benchmark curve.csv")
    ap.add_argument("--limit", type=int, default=60)
    ap.add_argument("--port", type=int, default=8020)
    ap.add_argument("--host", default="127.0.0.1")
    args = ap.parse_args()

    CONFIG["news_db"] = args.news_db
    CONFIG["curve"] = args.curve
    CONFIG["benchmark"] = args.benchmark
    CONFIG["limit"] = args.limit

    if args.news_db and not os.path.exists(args.news_db):
        print("WARNING: news db not found: %s" % args.news_db, file=sys.stderr)
    if args.curve and not os.path.exists(args.curve):
        print("WARNING: curve not found: %s" % args.curve, file=sys.stderr)

    url = "http://%s:%d/" % (args.host, args.port)
    print("")
    print("  PrismQuant local API")
    print("  --------------------")
    print("  news db : %s" % (args.news_db or "(not set - sample data)"))
    print("  curve   : %s" % (args.curve or "(not set - sample data)"))
    print("")
    print("  open    : %s" % url)
    print("  api     : %sapi/v1/news/events?limit=5" % url)
    print("            %sapi/v1/strategy/backtests" % url)
    print("  stop    : Ctrl+C")
    print("")

    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()

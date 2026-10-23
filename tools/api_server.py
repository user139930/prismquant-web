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
import subprocess
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pqdata  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = {"news_db": None, "curve": None, "benchmark": None, "limit": 60,
          "news_dir": None, "news_python": None, "collect_per_source": 3,
          "collect_analyze": False}


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
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Accept, Content-Type")
        self.end_headers()

    def do_POST(self):
        url = urlparse(self.path)
        if url.path == "/api/v1/news/collect":
            return self._collect()
        return self._fail("未知的 POST 路徑", 404)

    def _collect(self):
        """Trigger one RSS collection run in news-main (subprocess), then read back."""
        if not (CONFIG["news_dir"] and CONFIG["news_python"]):
            return self._fail("未提供 --news-dir / --news-python，無法觸發採集", 503)
        if not os.path.isdir(CONFIG["news_dir"]):
            return self._fail("news 目錄不存在：%s" % CONFIG["news_dir"], 503)
        cmd = [CONFIG["news_python"], "-m", "src.rss_pipeline",
               "--limit-per-source", str(CONFIG["collect_per_source"])]
        if CONFIG["collect_analyze"]:
            cmd.append("--analyze")
        try:
            proc = subprocess.run(
                cmd, cwd=CONFIG["news_dir"], capture_output=True, text=True,
                timeout=120, encoding="utf-8", errors="replace")
        except subprocess.TimeoutExpired:
            return self._fail("採集超時（>120 秒）；已抓到的內容可能已寫入資料庫，請重新讀取", 504)
        except Exception as exc:
            return self._fail("觸發採集失敗：%s" % exc)
        report = {}
        out = proc.stdout or ""
        try:
            report = json.loads(out.strip())
        except Exception:
            # stdout may carry leading log lines; grab the last balanced JSON object.
            try:
                report = json.loads(out[out.rfind("{"):].strip())
            except Exception:
                report = {"raw": out[-2000:]}
        if proc.returncode not in (0,):
            report["exit_code"] = proc.returncode
            report.setdefault("stderr", (proc.stderr or "")[-500:])
        # read back what the DB now has
        try:
            payload = pqdata.news_payload(CONFIG["news_db"], CONFIG["limit"])
            report["now"] = {"count": payload["count"], "analysed": payload["analysed"]}
        except Exception:
            pass
        return self._json({"collected_at": __import__("datetime").datetime.now().isoformat(),
                           "report": report})

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
    ap.add_argument("--news-dir", default=None, help="news-main project dir (to trigger collection)")
    ap.add_argument("--news-python", default=None, help="news-main venv python.exe (to trigger collection)")
    ap.add_argument("--collect-per-source", type=int, default=3, help="items fetched per source per collection")
    ap.add_argument("--collect-analyze", action="store_true", help="run LLM analysis after collection")
    args = ap.parse_args()

    CONFIG["news_db"] = args.news_db
    CONFIG["curve"] = args.curve
    CONFIG["benchmark"] = args.benchmark
    CONFIG["limit"] = args.limit
    CONFIG["news_dir"] = args.news_dir
    CONFIG["news_python"] = args.news_python
    CONFIG["collect_per_source"] = args.collect_per_source
    CONFIG["collect_analyze"] = args.collect_analyze

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
    if args.news_dir and args.news_python:
        print("  collect : POST /api/v1/news/collect  (fetch RSS from news-main)")
    print("")
    print("  open    : %s" % url)
    print("  api     : %sapi/v1/news/events?limit=5" % url)
    print("            %sapi/v1/strategy/backtests" % url)
    print("  stop    : Ctrl+C")
    print("")

    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()

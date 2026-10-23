#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PrismQuant one-click launcher (Python, encoding-safe).

Double-click `start-all.cmd` (which just calls this) OR run:
    python start-all.py

It does four things, in order:
  1. make sure PostgreSQL is running (tries to start it if not)
  2. start the A2 backend in its own console window (so it keeps running)
  3. start the A1 news service (live read + RSS collection trigger)
  4. serve this folder and open the browser already pointed at both APIs

Keep the launcher window open while you use the app.
"""
import os
import subprocess
import sys
import time
import urllib.request
import webbrowser

HERE = os.path.dirname(os.path.abspath(__file__))

# --- config -------------------------------------------------------------
# A2 backend directory (edit if you moved it). Unicode is fine here.
A2_DIR = r"C:\Users\Admin\Downloads\group1-main\一些功能\political-monitor"
A2_PY = os.path.join(A2_DIR, ".venv", "Scripts", "python.exe")
API = "http://127.0.0.1:8000"
PORT = 5173
PG_SERVICE = "postgresql-x64-18"

# A1 news collection service (api_server.py). It reads news.sqlite3 live and
# triggers a real RSS fetch via news-main's venv on POST /api/v1/news/collect.
A1_DIR = r"C:\Users\Admin\Downloads\news-main\news-main"
A1_PY = os.path.join(A1_DIR, ".venv", "Scripts", "python.exe")
A1_DB = os.path.join(A1_DIR, "data", "news.sqlite3")
A1_PORT = 8020
A1_API = "http://127.0.0.1:%d" % A1_PORT
PY = r"C:\Users\Admin\.workbuddy\binaries\python\versions\3.13.12\python.exe"

def log(msg):
    print("   " + msg, flush=True)


def pg_running():
    try:
        r = subprocess.run(
            ["sc", "query", PG_SERVICE],
            capture_output=True, text=True, timeout=10,
        )
        return "RUNNING" in r.stdout.upper()
    except Exception:
        return False


def api_ready(url, timeout=2.0):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.status == 200
    except Exception:
        return False


def main():
    print()
    print("   ============================================")
    print("     PrismQuant - one-click launch")
    print("   ============================================")
    print()

    # 1. PostgreSQL ------------------------------------------------------
    print("   [1/3] Checking PostgreSQL ...")
    if pg_running():
        log("already running.")
    else:
        log("not running - trying to start ...")
        subprocess.run(["net", "start", PG_SERVICE], capture_output=True)
        time.sleep(1)
        log("running." if pg_running() else "[WARN] could not start PostgreSQL.")

    # 2. A2 backend ------------------------------------------------------
    print("   [2/4] Starting A2 backend ...")
    if not os.path.exists(A2_PY):
        log("[ERROR] A2 venv not found at:")
        log("        " + A2_PY)
        log("        Edit A2_DIR inside start-all.py and retry.")
    else:
        # CREATE_NEW_CONSOLE gives it its own window that outlives this launcher.
        DETACHED = 0x00000008
        NEW_CONSOLE = 0x00000010
        subprocess.Popen(
            [A2_PY, "-m", "app"],
            cwd=A2_DIR,
            creationflags=NEW_CONSOLE,
        )
        log("waiting for A2 to come up ...")
        up = False
        for _ in range(30):
            if api_ready(API + "/health"):
                up = True
                break
            time.sleep(1)
        log("A2 is up at " + API if up else "[WARN] A2 did not respond in 30s.")

    # 3. A1 news collection service --------------------------------------
    print("   [3/4] Starting A1 news service ...")
    if not (os.path.exists(A1_PY) and os.path.exists(A1_DB)):
        log("[WARN] A1 not found at %s (news page will use snapshot)" % A1_DIR)
    else:
        NEW_CONSOLE = 0x00000010
        api_server = os.path.join(HERE, "tools", "api_server.py")
        subprocess.Popen(
            [PY, api_server, "--news-db", A1_DB, "--news-dir", A1_DIR,
             "--news-python", A1_PY, "--port", str(A1_PORT)],
            cwd=HERE, creationflags=NEW_CONSOLE,
        )
        log("waiting for A1 news service ...")
        up = False
        for _ in range(15):
            if api_ready(A1_API + "/healthz"):
                up = True
                break
            time.sleep(1)
        log("A1 news service up at " + A1_API if up else "[WARN] A1 service did not respond in 15s.")

    # 4. frontend --------------------------------------------------------
    print("   [4/4] Serving frontend at http://localhost:%d" % PORT)
    print()
    url = "http://localhost:%d/index.html?api=%s&news_api=%s" % (PORT, API, A1_API)
    print("   Opening browser ... if it does not open, visit:")
    print("     " + url)
    print()
    print("   Keep this window open. Press Ctrl+C to stop the server.")
    print()

    # open browser after a short delay, then serve this folder
    def _open():
        time.sleep(2.0)
        webbrowser.open(url)
    import threading
    threading.Thread(target=_open, daemon=True).start()

    # serve this folder (equivalent of: python -m http.server PORT)
    import http.server
    import socketserver
    os.chdir(HERE)
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n   Stopped.")

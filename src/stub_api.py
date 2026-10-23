"""Local contract stub for QA only: mirrors the shapes in FRONTEND_INTEGRATION.md.
Not part of the deliverable. Run: python stub_api.py [port]
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

NOW = datetime.now(timezone.utc)
LAGARDE = '6d46c161-c1d3-58e8-8a09-bbe9118d9b9e'
TRUMP = 'ccc1c525-60b7-55cf-b400-04680252257f'

PEOPLE = [
    {"person_id": LAGARDE, "name_original": "Christine Lagarde", "name_zh": "拉加德",
     "aliases": ["Lagarde"], "country_codes": ["EU"], "monitoring_enabled": True,
     "created_at": (NOW - timedelta(days=40)).isoformat(), "updated_at": NOW.isoformat()},
    {"person_id": TRUMP, "name_original": "Donald J. Trump", "name_zh": "特朗普",
     "aliases": ["Trump"], "country_codes": ["US"], "monitoring_enabled": True,
     "created_at": (NOW - timedelta(days=39)).isoformat(), "updated_at": NOW.isoformat()},
]

BODIES = {
    "r1": "Thank you, Chair. Let me start with the inflation outlook.\n\nThe disinflation path is now confirmed on the data we have. Headline inflation has returned close to our target, and core inflation has continued to decline, although services prices — and in particular services wages — remain stronger than we would like.\n\nWe are not pre-committing to a particular rate path. Decisions will remain meeting-by-meeting and data-dependent.",
    "r2": "The Governing Council today decided to keep the three key ECB interest rates unchanged.\n\nIncoming information suggests that the disinflation process is on track.",
    "r3": "We will be looking very carefully at the advanced packaging side. Certain technologies should not be leaving this country without a conversation first.\n\nWe are asking the Department of Commerce to open a public comment period.",
    "r4": "Great meeting with the semiconductor executives today. Tremendous numbers coming in.",
    "r5": "On growth: the euro area economy is weaker than we projected in June, mainly because of manufacturing and construction.",
    "r6": "We talked about the plants, we talked about jobs, and we talked about what happens if they don't build here.",
    "r7": "Labour markets remain resilient, which supports household income, but surveys point to slower hiring in the coming quarters.",
}

RECORDS = []
_meta = [
    ("r1", LAGARDE, "ECB 官网", "European Central Bank", "Hearing at the Committee on Economic and Monetary Affairs", "official", "verified_page_attribution", 0, "https://www.ecb.europa.eu"),
    ("r2", LAGARDE, "ECB 官网", "European Central Bank", "Monetary policy statement — September meeting recap", "official", "verified_page_attribution", 1, "https://www.ecb.europa.eu"),
    ("r5", LAGARDE, "ECB 官网", "European Central Bank", "Introductory remarks on the growth outlook", "official", "verified_page_attribution", 2, "https://www.ecb.europa.eu"),
    ("r7", LAGARDE, "Reuters", "Reuters", "Lagarde signals patience on further rate cuts", "third_party_archive", "media_quote_only", 3, None),
    ("r3", TRUMP, "第三方归档", "Archive mirror", "Statement on semiconductor export controls", "third_party_archive", "archive_only", 4, None),
    ("r4", TRUMP, "第三方归档", "Archive mirror", "Remarks before the meeting with industry executives", "third_party_archive", "archive_only", 5, None),
    ("r6", TRUMP, "第三方归档", "Archive mirror", "Remarks on domestic manufacturing investment", "third_party_archive", "archive_only", 6, None),
]
for rid, pid, sname, pub, title, prov, ver, idx, url in _meta:
    RECORDS.append({
        "record_id": rid, "source_id": "s-" + pid[:4], "source_name": sname, "publisher_name": pub,
        "person_id": pid, "person_name_original": "Christine Lagarde" if pid == LAGARDE else "Donald J. Trump",
        "person_name_zh": "拉加德" if pid == LAGARDE else "特朗普",
        "title": title, "content_type": "public_statement", "provenance_type": prov,
        "original_url": url, "retrieved_url": url or "https://archive.example/x",
        "published_at": None if idx == 4 else (NOW - timedelta(hours=idx * 7 + 1)).isoformat(),
        "page_date": None if idx == 4 else (NOW - timedelta(days=idx)).date().isoformat(),
        "first_seen_at": (NOW - timedelta(hours=idx * 7)).isoformat(),
        "language": "en", "verification_status": ver,
        "created_at": (NOW - timedelta(hours=idx * 7)).isoformat(),
    })

PAGE = 3


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Accept, Content-Type')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Access-Control-Allow-Headers', 'Accept, Content-Type')
        self.end_headers()

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        if u.path == '/health':
            return self._send({"status": "ok", "service": "PrismQuant Political Monitoring API",
                               "version": "0.1.0", "scope": "api_process"})
        if u.path == '/api/v1/system-status':
            return self._send({
                "checked_at": NOW.isoformat(),
                "database": {"status": "ok", "unfinished_runs": 0, "sources": [
                    {"source": "ecb", "pause_reason": None, "last_finished_at": (NOW - timedelta(minutes=18)).isoformat()},
                    {"source": "trump", "pause_reason": None, "last_finished_at": (NOW - timedelta(minutes=12)).isoformat()}]},
                "collector": {"status": "ok", "active": True, "heartbeat_at": (NOW - timedelta(minutes=3)).isoformat(),
                              "heartbeat_age_seconds": 190, "phase": "idle", "cycle_count": 412},
                "guardian": {"status": "ok", "active": True, "enabled": True, "restart_count": 0},
                "backup": {"status": "ok", "finished_at": (NOW - timedelta(hours=5)).isoformat(),
                           "bytes": 18432000, "archive_verified": True, "restore_tested": True},
            })
        if u.path == '/api/v1/people':
            return self._send({"items": PEOPLE, "next_cursor": None})
        if u.path == '/api/v1/public-records':
            pid = (q.get('person_id') or [None])[0]
            rows = [r for r in RECORDS if (not pid or r['person_id'] == pid)]
            rows.sort(key=lambda r: (r['published_at'] is None, r['published_at'] or ''), reverse=False)
            rows.sort(key=lambda r: (r['published_at'] is not None, r['published_at'] or ''), reverse=True)
            start = int((q.get('cursor') or ['0'])[0]) if (q.get('cursor') or [''])[0].isdigit() else 0
            chunk = rows[start:start + PAGE]
            nxt = str(start + PAGE) if start + PAGE < len(rows) else None
            return self._send({"items": chunk, "next_cursor": nxt})
        if u.path.startswith('/api/v1/public-records/'):
            rid = u.path.rsplit('/', 1)[1]
            row = next((r for r in RECORDS if r['record_id'] == rid), None)
            if not row:
                return self._send({"detail": {"code": "not_found", "message": "记录不存在或已被移除。"}}, 404)
            out = dict(row)
            out['body_text'] = BODIES.get(rid, '')
            out['speaker_evidence'] = None
            out['content_hash'] = 'sha256:' + rid
            out['published_raw'] = None
            out['archive_post'] = None
            if rid == 'r3':
                out['archive_post'] = {
                    "record_id": rid, "archive_author": "Archive mirror", "archive_handle": "@mirror",
                    "archive_post_type": "original", "archive_removed_raw": None, "title_origin": "archive_rss",
                    "page_post_published_at": None, "page_post_published_raw": None,
                    "archive_captured_at": NOW.isoformat(), "archive_capture_raw": None,
                    "image_count": 2, "video_count": 0,
                    "inline_quotes": [], "quoted_posts": [],
                    "archive_media_notes": [{"position": 1, "text": "Image described as a podium shot", "attachment_ref": None,
                                             "owner_archive_url": None, "association_status": "unresolved"}],
                    "parser_version": "1.4.0", "snapshot_hash": "abc123", "created_at": NOW.isoformat(),
                }
            return self._send(out)
        return self._send({"detail": {"code": "not_found", "message": "unknown"}}, 404)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print('stub on', port, flush=True)
    HTTPServer(('127.0.0.1', port), H).serve_forever()

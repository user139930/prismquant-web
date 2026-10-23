import os
import re
import subprocess
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, 'src')
SHOTS = os.path.join(SRC, 'shots')
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

PARTS = ['p1_head.html', 'p2_body.html', 'p0_hant.js', 'p3_data.js', 'p4a_views.js',
         'p4b_political_strategy.js', 'p4c_risk_chat_pf.js', 'p5_boot.js']

ROUTES = ['briefing', 'news', 'political', 'strategy', 'risk', 'chat', 'portfolio', 'academy']


def build():
    html = ''.join(open(os.path.join(SRC, p), encoding='utf-8').read().rstrip() + '\n' for p in PARTS)
    out = os.path.join(BASE, 'index.html')
    open(out, 'w', encoding='utf-8').write(html)

    bad = []
    for i, s in enumerate(re.findall(r'<script>(.*?)</script>', html, re.S)):
        f = os.path.join(SRC, 'shots', 'chk_%d.js' % i)
        os.makedirs(os.path.dirname(f), exist_ok=True)
        open(f, 'w', encoding='utf-8').write(s)
        r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
        if r.returncode:
            bad.append((f, r.stderr[:600]))
        os.remove(f)

    print('built %s (%d bytes)  script errors: %d'
          % (out, len(html.encode('utf-8')), len(bad)))
    for f, e in bad:
        print(f, e)
    return not bad


def shot(name, route, w=1440, h=1000, extra=''):
    os.makedirs(SHOTS, exist_ok=True)
    out = os.path.join(SHOTS, name + '.png')
    url = 'file:///' + os.path.join(BASE, 'index.html').replace('\\', '/') + '?skip=1' + extra + '#/' + route
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                    '--no-sandbox', '--force-device-scale-factor=1',
                    '--window-size=%d,%d' % (w, h), '--virtual-time-budget=3500',
                    '--screenshot=' + out, url], capture_output=True, text=True, timeout=120)
    print(' ', name, os.path.getsize(out) if os.path.exists(out) else 'FAIL')


if __name__ == '__main__':
    if not build():
        sys.exit(1)
    for r in (sys.argv[1:] or ROUTES):
        shot(r, r)

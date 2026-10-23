const fs = require('fs');
const http = require('http');

const PORT = process.env.CDP_PORT || '9222';

function getJson() {
  return new Promise((res, rej) => {
    http.get({ host: '127.0.0.1', port: PORT, path: '/json' }, r => {
      let b = ''; r.on('data', c => b += c); r.on('end', () => res(JSON.parse(b)));
    }).on('error', rej);
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const t = (await getJson()).find(x => x.type === 'page');
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 0; const p = new Map();
  const send = (m, pa = {}) => new Promise((res, rej) => {
    const i = ++id; p.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method: m, params: pa }));
  });
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && p.has(m.id)) { p.get(m.id).res(m.result); p.delete(m.id); } };
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:5174/index.html?skip=1#/news' });

  let n = 0;
  for (let i = 0; i < 20; i++) {
    const r = await send('Runtime.evaluate', { expression: 'document.querySelectorAll(".news-item").length', returnByValue: true });
    n = r.result && r.result.value;
    if (n > 0) break;
    await sleep(500);
  }
  const q = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return r.result && r.result.value;
  };
  console.log('news-items:', n);
  console.log('body:', JSON.stringify(await q('document.body.innerText.slice(0,160)')));
  console.log('banner:', JSON.stringify(await q('document.body.innerText.includes("只做了采集")')));
  console.log('snapshot tag:', JSON.stringify(await q('document.body.innerText.includes("数据快照")')));
  await sleep(400);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const out = process.argv[2] || 'news-live.png';
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('saved', out, fs.statSync(out).size);
  ws.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });

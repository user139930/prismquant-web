<script>
/* ============================ shell render ============================ */
function renderTicker() {
  const el = $('#ticker');
  if (!el) return;
  if (!TICKS.length) {
    el.hidden = true;
    document.body.classList.add('no-ticker');
    return;
  }
  el.hidden = false;
  document.body.classList.remove('no-ticker');
  const html = TICKS.map(x => {
    const d = x.chg > 0 ? '▲' : x.chg < 0 ? '▼' : '·';
    const last = x.last >= 1000 ? nf(x.last, 0) : nf(x.last, x.last >= 100 ? 2 : 3);
    return `<div class="tick"><span class="sym">${esc(x.sym)}</span><b>${last}</b>
      <span class="chg ${signCls(x.chg)}">${d} ${Math.abs(x.chg).toFixed(2)}%</span></div>`;
  }).join('');
  $('#ticker').innerHTML = html + `<div class="tick-end">${esc(isZh() ? '延迟 15 分钟 · 示例数据' : 'DELAYED 15 MIN · SAMPLE')}</div>`;
}

const NAVS = [
  { g: 'g.today', items: [['overview', 0], ['briefing', 0], ['chat', 0]] },
  { g: 'g.research', items: [['news', LIVE.news ? LIVE.news.items.length : 0], ['political', 0], ['strategy', 0], ['academy', 0]] },
  { g: 'g.exec', items: [['risk', 0], ['portfolio', 0]] }
];
function renderNav(cur) {
  $('#side').innerHTML = NAVS.map(grp => `<div class="navgroup">
    <div class="navgroup-t">${esc(t(grp.g))}</div>
    ${grp.items.map(([id, c]) => `<a class="navlink ${cur === id ? 'active' : ''}" href="#/${id}">
      <span>${esc(t('nav.' + id))}</span>${c ? `<span class="cnt">${id === 'political' && A2.live ? (A2.records.length || '·') : c}</span>` : ''}
    </a>`).join('')}
  </div>`).join('');
  $('#brand-sub').textContent = t('brand.sub');
  const p = $('#plan-badge');
  if (p) p.textContent = isZh() ? 'PROFESSIONAL · 试用' : 'PROFESSIONAL · TRIAL';
}

/* ============================ connection ============================ */
function setConn(kind) {
  const el = $('#conn'); if (!el) return;
  el.className = 'conn ' + kind;
  const hasAnySnap = !!(LIVE.news || LIVE.pol || LIVE.bt);
  $('#conn-text').textContent = kind === 'ok'
    ? t('ui.live')
    : (hasAnySnap ? (isZh() ? '快照数据' : 'Snapshot') : (isZh() ? '数据源未接入' : 'No source'));
  const note = $('#conn-note');
  if (note) {
    if (kind === 'ok') {
      note.textContent = isZh() ? 'A2 政治监控读取真实后端 · 其余页面为真实快照或空状态' : 'A2 reads the live backend; other pages are real snapshots or empty';
    } else {
      const hasNews = !!(LIVE.news && LIVE.news.items && LIVE.news.items.length);
      const hasBt = !!(LIVE.bt && LIVE.bt.items && LIVE.bt.items.length);
      const hasPol = !!(LIVE.pol && LIVE.pol.records && LIVE.pol.records.length);
      const parts = [];
      if (A2.snapshot) parts.push(isZh() ? 'A2 快照已导入' : 'A2 snapshot imported');
      if (hasNews) parts.push(isZh() ? 'A1 快照已导入' : 'A1 snapshot imported');
      if (hasBt) parts.push(isZh() ? 'A3 回测已导入' : 'A3 backtest imported');
      const summary = parts.join(' · ');
      note.textContent = isZh()
        ? (location.protocol === 'file:'
          ? 'file:// 打开时无法连接本机 API · 请用 start-all.cmd'
          : (summary
            ? summary + ' · 页面只显示真实数据'
            : 'A2 未连接 · A1/A3 未导入快照 · 页面只显示真实数据'))
        : (summary
          ? summary + ' — only real data is shown'
          : 'A2 offline, no snapshots imported — only real data is shown');
    }
  }
}
let NEWS_API = 'http://127.0.0.1:8020';
function apiUrl(p) { return (A2.base || '') + p; }
async function apiGet(path, params, signal) {
  const q = new URLSearchParams();
  Object.keys(params || {}).forEach(k => {
    const v = params[k];
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  const url = apiUrl(path) + (q.toString() ? '?' + q.toString() : '');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  if (signal) { if (signal.aborted) ctrl.abort(); else signal.addEventListener('abort', () => ctrl.abort(), { once: true }); }
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctrl.signal });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const map = { 404: isZh() ? '记录不存在或已被移除。' : 'Record not found.', 422: isZh() ? '请求参数不正确，请刷新页面后重试。' : 'Bad request.', 503: isZh() ? '数据库暂不可用，请稍后重试。' : 'Database unavailable.' };
      const msg = (body && body.detail && body.detail.message) || map[res.status] || ('HTTP ' + res.status);
      throw new Error(msg);
    }
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(isZh() ? '请求超时，请检查后端服务。' : 'Request timed out.');
    if (e instanceof TypeError) throw new Error(isZh() ? '无法连接后端：请确认服务已启动，或把本页加入后端 CORS 白名单。' : 'Cannot reach backend: check the service and CORS allow-list.');
    throw e;
  } finally { clearTimeout(timer); }
}
async function apiPost(path, body) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(apiUrl(path), {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : '{}',
      signal: ctrl.signal
    });
    if (!res.ok) {
      const b = await res.json().catch(() => null);
      throw new Error((b && b.detail && b.detail.message) || ('HTTP ' + res.status));
    }
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(isZh() ? '采集超时' : 'Collection timed out.');
    if (e instanceof TypeError) throw new Error(isZh() ? '无法连接后端' : 'Cannot reach backend.');
    throw e;
  } finally { clearTimeout(timer); }
}
async function collectNews() {
  // Trigger a real RSS collection run in A1, then reload news from its API.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 150000);
  try {
    const res = await fetch(NEWS_API + '/api/v1/news/collect', {
      method: 'POST', headers: { Accept: 'application/json' }, signal: ctrl.signal
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    const rep = d.report || {};
    const saved = (rep.added || 0) + (rep.updated || 0);
    const dup = rep.duplicates || 0;
    const analysed = (rep.analysis && rep.analysis.analyzed) || 0;
    return { ok: true, saved, dup, analysed, report: rep };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally { clearTimeout(timer); }
}
async function loadNewsFromApi() {
  // Read news straight from the A1 API (live), returns null if unreachable.
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(NEWS_API + '/api/v1/news/events?limit=60', { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const d = await res.json();
    if (d && Array.isArray(d.items) && d.items.length) { LIVE.news = d; return d; }
    return null;
  } catch (e) { return null; }
}
async function probe() {
  A2.checking = true;
  try {
    await apiGet('/health');
    A2.live = true; setConn('ok');
    loadSys(); loadPeople();
    if (routeName() === 'political') loadRecords(false);
  } catch (e) {
    A2.live = false; setConn('demo');
    applyPoliticalSnapshot();
  } finally { A2.checked = true; A2.checking = false; }
  renderNav(routeName());
  if (routeName() === 'political') render();
}
async function autoConnect() {
  const st = $('#ac-status');
  if (st) st.textContent = isZh() ? '状态：正在探测 127.0.0.1:8000 …' : 'Status: probing 127.0.0.1:8000 …';
  await probe();
  if (A2.live) {
    toast(isZh() ? '已连接到 A2 后端' : 'Connected to the A2 backend');
  } else {
    const s2 = $('#ac-status');
    if (s2) s2.innerHTML = isZh()
      ? '状态：<b>未连接</b> —— 后端没在跑。请双击 <code>start-all.cmd</code> 一键启动，再回来点一次。'
      : 'Status: <b>offline</b> — backend not running. Double-click <code>start-all.cmd</code>, then retry.';
    toast(isZh() ? '未连接：请先启动后端（start-all.cmd）' : 'Not connected: start the backend first');
  }
}
async function loadSys() {
  try { A2.sys = await apiGet('/api/v1/system-status'); A2.sysErr = null; }
  catch (e) { A2.sysErr = e.message; }
  refreshPolDom();
}
async function loadPeople() {
  try {
    const d = await apiGet('/api/v1/people', { limit: 100 });
    A2.people = (d.items || []); A2.peopleErr = null;
  } catch (e) { A2.peopleErr = e.message; }
  refreshPolDom();
}
async function loadRecords(append, quiet) {
  const rid = ++A2.reqId;
  if (!quiet) { A2.loading = true; A2.err = null; refreshPolDom(); }
  try {
    const params = { limit: 20, order: 'published_desc' };
    if (A2.sel) params.person_id = A2.sel;
    if (append && A2.next) params.cursor = A2.next;
    const d = await apiGet('/api/v1/public-records', params);
    if (rid !== A2.reqId) return;
    A2.records = append ? A2.records.concat(d.items || []) : (d.items || []);
    A2.next = d.next_cursor || null;
  } catch (e) {
    if (rid !== A2.reqId) return;
    A2.err = e.message;
    if (!append) { A2.records = []; A2.next = null; }
  } finally {
    if (rid === A2.reqId) { A2.loading = false; refreshPolDom(); renderNav(routeName()); }
  }
}
async function loadDetail(id) {
  A2.detailId = id; A2.detail = null; A2.detailErr = null;
  if (!A2.live) { A2.detailLoading = false; refreshPolDom(); return; }
  A2.detailLoading = true; refreshPolDom();
  try { A2.detail = await apiGet('/api/v1/public-records/' + encodeURIComponent(id)); }
  catch (e) { A2.detailErr = e.message; }
  finally { A2.detailLoading = false; refreshPolDom(); }
}

/* ============================ chat ============================ */
function sendChat(q) {
  q = (q || '').trim();
  if (!q) return;
  if (!CHAT) chatInit();
  const d = new Date();
  const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  CHAT.push({ me: true, html: '<p>' + esc(q) + '</p>', time: hm });
  const r = a5Reply(q);
  CHAT.push({ me: false, html: r.html, ev: r.ev });
  const box = $('#msgs');
  if (box) { box.innerHTML = CHAT.map(msgHtml).join(''); box.scrollTop = box.scrollHeight; }
  const inp = $('#chat-input'); if (inp) inp.value = '';
}

/* ============================ router ============================ */
const ROUTES = {
  overview: viewOverview, briefing: viewBriefing, news: viewNews, political: viewPolitical, strategy: viewStrategy,
  risk: viewRisk, chat: viewChat, portfolio: viewPortfolio, academy: viewAcademy
};
function routeName() {
  const h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
  return ROUTES[h] ? h : 'overview';
}
let renderGuard = 0;
function render() {
  const cur = routeName();
  const v = $('#view');
  if (!v) return;
  v.innerHTML = ROUTES[cur]();
  renderNav(cur);
  setConn(A2.live ? 'ok' : (A2.checked ? 'demo' : 'demo'));
  if (cur === 'political') {
    refreshPolDom();
    const q = $('#pol-q');
    if (q) q.addEventListener('input', e => { A2.q = e.target.value; const rc = $('#pol-records'); if (rc) rc.innerHTML = recordsHtml(); const cnt = $('#pol-rcount'); if (cnt) cnt.textContent = polRecords().length; });
    const pv = $('#pol-prov');
    if (pv) pv.addEventListener('change', e => { A2.prov = e.target.value; const rc = $('#pol-records'); if (rc) rc.innerHTML = recordsHtml(); const cnt = $('#pol-rcount'); if (cnt) cnt.textContent = polRecords().length; });
    const more = $('#pol-more');
    if (more) more.addEventListener('click', () => loadRecords(true));
  }
  if (cur === 'chat') { const box = $('#msgs'); if (box) box.scrollTop = box.scrollHeight; }
  window.scrollTo(0, 0);
}

/* ============================ refresh ============================ */
async function hardRefresh() {
  const route = routeName();
  if (route === 'news') {
    // Try a live collect+read from the A1 API first, fall back to snapshot.
    toast(isZh() ? '正在采集新闻（抓取 RSS）…' : 'Collecting news (fetching RSS)…');
    const col = await collectNews();
    if (col.ok) {
      const live = await loadNewsFromApi();
      if (live) {
        render();
        if (col.saved > 0) {
          toast(isZh() ? ('采集到 ' + col.saved + ' 条新内容' + (col.analysed ? '，已分析 ' + col.analysed + ' 条' : '') + '，已刷新') : ('Collected ' + col.saved + ' new items' + (col.analysed ? ', ' + col.analysed + ' analysed' : '')));
        } else {
          toast(isZh() ? ('采集完成，本次无新内容（已存在 ' + col.dup + ' 条）') : ('Collected, no new items (' + col.dup + ' already present)'));
        }
        return;
      }
    }
    // A1 API unavailable → snapshot fallback
    const before = (LIVE.news && LIVE.news.generated_at) || '';
    const got = await loadSnapshots(true);
    render();
    if (!got) { toast(isZh() ? '没有可读取的数据' : 'No data available'); return; }
    const after = (LIVE.news && LIVE.news.generated_at) || '';
    if (after && after !== before) {
      toast((isZh() ? '已更新到 ' : 'Updated to ') + after.slice(0, 16).replace('T', ' '));
    } else {
      toast(isZh() ? '没有新数据（快照 ' + after.slice(0, 10) + '，A1 服务未运行）' : 'No new data (snapshot ' + after.slice(0, 10) + ', A1 API not running)');
    }
    return;
  }
  if (route === 'strategy') {
    const before = (LIVE.bt && LIVE.bt.generated_at) || '';
    const got = await loadSnapshots(true);
    render();
    if (!got) { toast(isZh() ? '没有可读取的数据' : 'No data available'); return; }
    const after = (LIVE.bt && LIVE.bt.generated_at) || '';
    if (after && after !== before) {
      toast((isZh() ? '已更新到 ' : 'Updated to ') + after.slice(0, 16).replace('T', ' '));
    } else {
      toast(isZh() ? '没有新数据（快照 ' + after.slice(0, 10) + '）' : 'No new data (snapshot ' + after.slice(0, 10) + ')');
    }
    return;
  }
  if (route === 'political') {
    if (!A2.live) { probe(); toast(isZh() ? '正在尝试连接后端…' : 'Probing backend…'); return; }
    toast(isZh() ? '正在触发采集（抓取 ECB / Trump）…' : 'Triggering collection (ECB / Trump)…');
    let colMsg = null;
    try {
      const col = await apiPost('/api/v1/operations/collect');
      const saved = (col.items || []).reduce((n, x) => n + (x.saved || 0), 0);
      const states = (col.items || []).map(x => x.status).join(', ');
      if (saved > 0) colMsg = isZh() ? ('采集到 ' + saved + ' 条新内容') : ('Collected ' + saved + ' new items');
      else colMsg = isZh() ? ('采集完成，本次无新内容（' + states + '）') : ('Collected, no new items (' + states + ')');
    } catch (e) { colMsg = e.message; }
    await Promise.all([loadSys(), loadRecords(false, true)]);
    toast(colMsg || (isZh() ? '已重新读取后端数据' : 'Re-read from the backend'));
    return;
  }
  render();
  toast(isZh() ? '已重新渲染（本页为示例数据）' : 'Re-rendered (sample data)');
}
let pollTimer = null;
function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    if (document.hidden) return;
    if (routeName() !== 'political') return;
    if (!A2.live || A2.loading) return;
    loadSys();
    loadRecords(false, true);
  }, 60000);
}

/* ============================ events ============================ */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act],[data-person],[data-rec],[data-strat],[data-news],[data-article],[data-ask]');
  if (!el) return;
  const act = el.getAttribute('data-act');
  if (act) {
    if (act === 'refresh') { hardRefresh(); }
    else if (act === 'confirm') { toast(isZh() ? '已确认 3 张意图，进入模拟撮合队列' : '3 intents confirmed into the simulated queue'); }
    else if (act === 'pause') { toast(isZh() ? '已暂停新开仓（模拟）· 持仓保留' : 'New entries paused (simulated); positions kept'); }
    else if (act === 'flatten') { toast(isZh() ? '紧急平仓需二次确认；演示环境未发送任何委托' : 'Flatten requires confirmation; nothing routed in demo'); }
    else if (act === 'refresh-pol') { if (A2.live) { loadRecords(false); loadSys(); } else { probe(); toast(isZh() ? '正在尝试连接后端…' : 'Probing backend…'); } }
    else if (act === 'auto-connect') { autoConnect(); }
    else if (act === 'open-settings') { openSettings(); }
    else if (act === 'copy-body') {
      const b = document.querySelector('#pol-detail .body-text');
      if (b && navigator.clipboard) navigator.clipboard.writeText(b.textContent).then(() => toast(t('ui.copied'))).catch(() => toast(t('ui.copied')));
    }
    else if (act === 'acad-back') { ACAD = null; render(); }
    return;
  }
  const person = el.getAttribute('data-person');
  if (person !== null && el.classList.contains('person')) {
    A2.sel = person || null; A2.q = ''; A2.prov = '';
    A2.records = []; A2.next = null; A2.detailId = null; A2.detail = null; A2.reqId++;
    refreshPolDom();
    if (A2.live) loadRecords(false);
    return;
  }
  const rec = el.getAttribute('data-rec');
  if (rec) { loadDetail(rec); return; }
  const strat = el.getAttribute('data-strat');
  if (strat) { STRAT = strat; render(); return; }
  const nf2 = el.getAttribute('data-news');
  if (nf2) { NEWS_FILTER = nf2; render(); return; }
  const art = el.getAttribute('data-article');
  if (art) { e.preventDefault(); ACAD = art; render(); return; }
  const ask = el.getAttribute('data-ask');
  if (ask) { sendChat(ask); return; }
});

document.addEventListener('submit', e => {
  if (e.target.id === 'chat-form') {
    e.preventDefault();
    sendChat($('#chat-input').value);
  }
  if (e.target.id === 'login-form') {
    e.preventDefault();
    enterApp();
  }
});

window.addEventListener('hashchange', render);

/* ============================ dialogs ============================ */
function openSettings() {
  const dlg = $('#dlg-settings');
  $('#api-base').value = A2.base || '';
  $('#settings-err').textContent = '';
  dlg.showModal();
}
function initSettings() {
  const dlg = $('#dlg-settings');
  $('#settings-save').addEventListener('click', async ev => {
    ev.preventDefault();
    const raw = $('#api-base').value.trim();
    let base = '';
    if (raw) {
      try {
        const u = new URL(raw);
        if (!['http:', 'https:'].includes(u.protocol) || u.pathname !== '/' || u.search || u.hash) throw new Error('bad');
        base = u.origin;
      } catch (err) {
        $('#settings-err').textContent = isZh() ? '请填写不带路径或参数的 HTTP(S) 地址。' : 'Enter a plain HTTP(S) origin.';
        return;
      }
    }
    A2.base = base;
    lsSet('pq_api_base', base);
    dlg.close();
    A2.records = []; A2.people = []; A2.detail = null; A2.detailId = null; A2.next = null;
    await probe();
    render();
    toast(base ? (isZh() ? '已保存，正在重连…' : 'Saved, reconnecting…') : (isZh() ? '已切回同源' : 'Back to same origin'));
  });
  $('#btn-settings').addEventListener('click', openSettings);
  $('#btn-account').addEventListener('click', () => {
    $('#account-body').innerHTML = `<p>${isZh() ? '当前方案：PROFESSIONAL（试用）— 研究、半自动与全自动能力，配额见下。' : 'Plan: PROFESSIONAL (trial) — research, semi-auto and full-auto with quotas below.'}</p>
      <table class="t" style="margin:6px 0 4px"><tbody>
        <tr><td style="color:#7b8492">${isZh() ? '月度回测任务' : 'Backtests / month'}</td><td class="r">200 / 500</td></tr>
        <tr><td style="color:#7b8492">${isZh() ? '监控人物' : 'Watched figures'}</td><td class="r">2 / 50</td></tr>
        <tr><td style="color:#7b8492">${isZh() ? '模拟组合' : 'Sim portfolios'}</td><td class="r">1 / 3</td></tr>
        <tr><td style="color:#7b8492">${isZh() ? '实盘下单' : 'Live routing'}</td><td class="r">${isZh() ? '关闭' : 'Off'}</td></tr>
      </tbody></table>
      <p style="margin-top:12px">${isZh() ? '账户：LIU Tsz Ho · 250139930 · ITE4116M Group 1。演示环境不涉及真实扣费。' : 'Account: LIU Tsz Ho · 250139930 · ITE4116M Group 1. No real billing in the demo.'}</p>`;
    $('#dlg-account').showModal();
  });
}

/* ============================ boot ============================ */
function enterApp() {
  const b = $('#boot');
  if (b) b.remove();
  ssSet('pq_entered', '1');
}
const BOOT_I18N = {
  zh: {
    title: '把隔夜的信息，<br>收敛成三张可以执行的意图。',
    sub: '多市场中低频量化 · 五代理决策链路 · 顾问模式，不下单。',
    f1: '新闻、政要公开表态、因子评分与风险闸门收敛成一份十分钟可读完的晨报。',
    f2: '执行代理的每一张意图都必须通过 A4；否决必须留下规则编号与触发值。',
    f3: '每条建议都带证据链与来源，禁止没有依据的「必涨」结论。',
    cardTitle: '登录终端', email: '工作邮箱', pwd: '密码',
    remember: '记住本设备', forgot: '忘记密码', enter: '进入终端',
    note: '课程演示账户 · 任意密码可进入 · 当前为顾问模式（不下单）',
    or: '或', guest: '以访客身份查看演示'
  },
  en: {
    title: 'Overnight information,<br>reduced to three executable intents.',
    sub: 'Multi-market medium-to-low-frequency quant · five-agent chain · advisory mode.',
    f1: 'News, public statements, factor scores and risk gates collapse into a ten-minute morning read.',
    f2: 'Every intent from the execution agent must clear A4; a veto records the rule id and trigger value.',
    f3: 'Every recommendation carries an evidence chain and sources; no unfounded calls.',
    cardTitle: 'Sign in', email: 'Work email', pwd: 'Password',
    remember: 'Remember this device', forgot: 'Forgot password', enter: 'Enter terminal',
    note: 'Demo account · any password works · advisory mode, no orders',
    or: 'or', guest: 'Continue as guest'
  }
};
function applyBoot() {
  const dict = BOOT_I18N[LANG] || BOOT_I18N.zh;
  document.querySelectorAll('[data-boot]').forEach(el => {
    let v = dict[el.getAttribute('data-boot')];
    if (v === undefined) return;
    if (LANG === 'hant') v = toHant(v);
    el.innerHTML = v;
  });
}

let HANT_OBS = null;
function hantNode(node) {
  if (!node || node.__h) return;
  if (/^[\s\S]*[\u4e00-\u9fff][\s\S]*$/.test(node.nodeValue)) node.nodeValue = toHant(node.nodeValue);
  node.__h = 1;
}
function hantAttrs(el) {
  ['placeholder', 'title', 'aria-label'].forEach(a => {
    const v = el.getAttribute && el.getAttribute(a);
    if (v && /[\u4e00-\u9fff]/.test(v)) el.setAttribute(a, toHant(v));
  });
}
function hantWalk(root) {
  if (!root) return;
  if (root.nodeType === 3) { hantNode(root); return; }
  if (root.nodeType !== 1) return;
  hantAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let n;
  while ((n = w.nextNode())) {
    if (n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName)) continue;
    hantNode(n);
  }
  Array.prototype.forEach.call(root.querySelectorAll('[placeholder],[title],[aria-label]'), hantAttrs);
}
function enableHant() {
  if (document.title) document.title = toHant(document.title);
  hantWalk(document.body);
  if (HANT_OBS) return;
  HANT_OBS = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(n => hantWalk(n));
      }
    }
  });
  HANT_OBS.observe(document.body, { childList: true, subtree: true });
}
function disableHant() {
  if (HANT_OBS) { HANT_OBS.disconnect(); HANT_OBS = null; }
}
function setLang(l, silent) {
  LANG = (l === 'hant' || l === 'en') ? l : 'zh';
  document.documentElement.lang = LANG === 'zh' ? 'zh-Hans' : LANG === 'hant' ? 'zh-Hant' : 'en';
  ['zh', 'hant', 'en'].forEach(k => {
    const b = document.getElementById('lang-' + k);
    if (b) { b.classList.toggle('on', LANG === k); b.setAttribute('aria-pressed', LANG === k); }
    const b2 = document.querySelector('.boot-lang [data-lang="' + k + '"]');
    if (b2) b2.classList.toggle('on', LANG === k);
  });
  applyBoot();
  disableHant();
  renderTicker();
  if (document.querySelector('#view')) render();
  if (LANG === 'hant') enableHant();
  if (!silent) lsSet('pq_lang', LANG);
}
function initLang() {
  const saved = lsGet('pq_lang');
  const lm = (location.search.match(/[?&]lang=(zh|hant|en)/) || [])[1] || saved || 'hant';
  setLang(lm, true);
  ['zh', 'hant', 'en'].forEach(k => {
    const b = document.getElementById('lang-' + k);
    if (b) b.addEventListener('click', () => setLang(k));
    const b2 = document.querySelector('.boot-lang [data-lang="' + k + '"]');
    if (b2) b2.addEventListener('click', () => setLang(k));
  });
}

(function boot() {
  const skip = /(\?|&)skip=1/.test(location.search) || ssGet('pq_entered');
  if (skip) { const b = $('#boot'); if (b) b.remove(); }
  const guest = $('#boot-demo');
  if (guest) guest.addEventListener('click', enterApp);
  const lf = $('#login-form');
  if (lf) {
    const submit = lf.querySelector('.boot-submit');
    if (submit) submit.addEventListener('click', ev => { ev.preventDefault(); enterApp(); });
    lf.addEventListener('submit', ev => { ev.preventDefault(); enterApp(); });
  }
  const saved = lsGet('pq_api_base');
  A2.base = saved !== null ? saved : (location.protocol === 'file:' ? 'http://127.0.0.1:8000' : '');
  const am = (location.search.match(/[?&]api=([^&]+)/) || [])[1];
  if (am) {
    try {
      const u = new URL(decodeURIComponent(am));
      if (['http:', 'https:'].includes(u.protocol) && u.pathname === '/') {
        A2.base = u.origin;
        lsSet('pq_api_base', A2.base);
      }
    } catch (e) { /* ignore malformed override */ }
  }
  const nm = (location.search.match(/[?&]news_api=([^&]+)/) || [])[1];
  if (nm) {
    try {
      const u = new URL(decodeURIComponent(nm));
      if (['http:', 'https:'].includes(u.protocol)) {
        NEWS_API = u.origin;
        lsSet('pq_news_api', NEWS_API);
      }
    } catch (e) { /* ignore malformed override */ }
  } else {
    const savedNews = lsGet('pq_news_api');
    if (savedNews) NEWS_API = savedNews;
  }
  renderTicker();
  initSettings();
  initLang();
  render();
  setConn(A2.checked ? 'demo' : 'demo');
  probe();
  startPolling();
  loadSnapshots().then(changed => {
    setConn(A2.live ? 'ok' : 'demo');
    // If the backend isn't up but a political snapshot exists, render it.
    if (!A2.live) {
      const applied = applyPoliticalSnapshot();
      if (applied && routeName() === 'political') render();
    }
    if (changed && (routeName() === 'news' || routeName() === 'strategy')) render();
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/[?&]nosw=1/.test(location.search)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
  }
})();
</script>
</body>
</html>

<script>
/* ============================ political (A2, live) ============================ */
const A2 = {
  base: '', live: false, checked: false, checking: false,
  people: [], peopleErr: null,
  sel: null,
  records: [], next: null, loading: false, err: null,
  detail: null, detailErr: null, detailLoading: false, detailId: null,
  sys: null, sysErr: null,
  q: '', prov: '', reqId: 0
};

const POL_DEMO_PEOPLE = [
  { person_id: '6d46c161-c1d3-58e8-8a09-bbe9118d9b9e', name_original: 'Christine Lagarde', name_zh: '拉加德', country_codes: ['EU'], monitoring_enabled: true },
  { person_id: 'ccc1c525-60b7-55cf-b400-04680252257f', name_original: 'Donald J. Trump', name_zh: '特朗普', country_codes: ['US'], monitoring_enabled: true }
];
const POL_DEMO_RECORDS = [
  { record_id: 'd-1', person_id: '6d46c161-c1d3-58e8-8a09-bbe9118d9b9e', source_name: 'ECB 官网', publisher_name: 'European Central Bank', title: 'Hearing at the Committee on Economic and Monetary Affairs', content_type: 'public_statement', provenance_type: 'official', verification_status: 'verified_page_attribution', published_at: '2026-10-23T07:12:00Z', page_date: '2026-10-22', original_url: 'https://www.ecb.europa.eu', language: 'en' },
  { record_id: 'd-2', person_id: '6d46c161-c1d3-58e8-8a09-bbe9118d9b9e', source_name: 'ECB 官网', publisher_name: 'European Central Bank', title: 'Monetary policy statement — September meeting recap', content_type: 'public_statement', provenance_type: 'official', verification_status: 'verified_page_attribution', published_at: '2026-10-21T13:45:00Z', page_date: '2026-10-21', original_url: 'https://www.ecb.europa.eu', language: 'en' },
  { record_id: 'd-3', person_id: 'ccc1c525-60b7-55cf-b400-04680252257f', source_name: '第三方归档', publisher_name: 'Archive mirror', title: 'Statement on semiconductor export controls', content_type: 'public_statement', provenance_type: 'third_party_archive', verification_status: 'archive_only', published_at: '2026-10-23T02:30:00Z', page_date: '2026-10-22', original_url: null, language: 'en' },
  { record_id: 'd-4', person_id: 'ccc1c525-60b7-55cf-b400-04680252257f', source_name: '第三方归档', publisher_name: 'Archive mirror', title: 'Remarks before the meeting with industry executives', content_type: 'public_statement', provenance_type: 'third_party_archive', verification_status: 'archive_only', published_at: null, page_date: null, original_url: null, language: 'en' }
];
const POL_DEMO_BODY = {
  'd-1': `Thank you, Chair. Let me start with the inflation outlook.\n\nThe disinflation path is now confirmed on the data we have. Headline inflation has returned close to our target, and core inflation has continued to decline, although services prices — and in particular services wages — remain stronger than we would like.\n\nWe are not pre-committing to a particular rate path. Decisions will remain meeting-by-meeting and data-dependent. But I want to be clear that the direction of travel has not changed.\n\nOn growth: the euro area economy is weaker than we projected in June, mainly because of manufacturing and construction. Labour markets remain resilient, which supports household income, but surveys point to slower hiring in the coming quarters.`,
  'd-2': `The Governing Council today decided to keep the three key ECB interest rates unchanged.\n\nIncoming information suggests that the disinflation process is on track. The September staff projections foresee average inflation of 2.1% in 2026 and 1.9% in 2027, broadly unchanged from June.\n\nWe will continue to follow a data-dependent and meeting-by-meeting approach.`,
  'd-3': `We will be looking very carefully at the advanced packaging side. Certain technologies should not be leaving this country without a conversation first.\n\nWe are asking the Department of Commerce to open a public comment period. Nothing is decided. But the direction should be obvious to everyone.\n\nThe companies that cooperate will find this government very easy to work with.`,
  'd-4': `Great meeting with the semiconductor executives today. Tremendous numbers coming in. Tremendous.\n\nWe talked about the plants, we talked about jobs, and we talked about what happens if they don't build here. They will build here.`
};

function polList() {
  const src = A2.live ? A2.people : POL_DEMO_PEOPLE;
  return src;
}
function polRecords() {
  let arr = A2.live ? A2.records : POL_DEMO_RECORDS;
  if (A2.sel) arr = arr.filter(r => r.person_id === A2.sel);
  if (A2.prov) arr = arr.filter(r => r.provenance_type === A2.prov);
  if (A2.q.trim()) {
    const q = A2.q.trim().toLowerCase();
    arr = arr.filter(r => (r.title || '').toLowerCase().includes(q) || (r.source_name || '').toLowerCase().includes(q));
  }
  return arr;
}
function polName(p) {
  if (!p) return '—';
  return isZh() ? (p.name_zh || p.name_original) : (p.name_original || p.name_zh);
}
function polInitials(p) {
  const n = p.name_original || p.name_zh || '?';
  const parts = n.replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : n.slice(0, 2)).toUpperCase();
}
function verTag(v) {
  if (v === 'verified_page_attribution') return `<span class="tag green">${esc(t('pol.official'))}</span>`;
  if (v === 'archive_only') return `<span class="tag amber">${esc(t('pol.archive'))}</span>`;
  if (v === 'media_quote_only') return `<span class="tag amber">${isZh() ? '媒体转述' : 'Media quote'}</span>`;
  return `<span class="tag">${isZh() ? '待核对' : 'Needs review'}</span>`;
}

function viewPolitical() {
  if (!A2.live) {
    const note = (isZh()
      ? '这一页直接读 A2 的 <code>/api/v1/*</code>，不内置任何示例发言。点下面的按钮，我会去探测本机后端；若后端没在跑，请双击 <code>start-all.cmd</code> 一键启动，再回来点一下。'
      : "This page reads A2's <code>/api/v1/*</code> directly and ships no sample statements. Click the button below to probe the backend; if it isn't running, double-click <code>start-all.cmd</code> then come back.")
      + (location.protocol === 'file:'
        ? (isZh()
          ? '<br><br><b>你现在是用 file:// 双击打开的。</b>浏览器会封堵这种页面发出的跨域请求，所以永远连不上本机 API —— 这是浏览器安全规定，不是程序的问题。请改按下面的做法：<br>① 双击 <code>start-all.cmd</code>；② 用 <code>http://localhost:5173</code> 打开。<br><a href="http://localhost:5173/index.html?skip=1&api=http://127.0.0.1:8000#/political" style="color:#c8453a">点这里直接试 →</a>'
          : '<br><br><b>You opened this via file://.</b> Browsers block cross-origin requests from such pages, so it can never reach the local API. Double-click <code>start-all.cmd</code> and open via <code>http://localhost:5173</code> instead.')
        : '');
    const actionHtml = `<div style="margin-top:16px;display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap">
        <button class="btn" data-act="auto-connect" style="font-size:13px">⟳ ${isZh() ? '自动连接 A2 后端' : 'Auto-connect A2 backend'}</button>
        <span class="micro" id="ac-status" style="color:#a9b0bb">${isZh() ? '状态：未探测' : 'Status: not probed'}</span>
      </div>`;
    return emptyPage('POLITICAL MONITOR / A2', t('page.political.t'), t('page.political.s'), [
      [isZh() ? '运行中的 A2 后端（FastAPI，默认 :8000）' : 'A2 backend on :8000', '<span class="tag amber">未连接</span>'],
      [isZh() ? 'PostgreSQL 数据库 + 一次采集' : 'PostgreSQL + one collection run', '<span class="tag amber">待运行</span>']
    ], note + actionHtml);
  }
  const demo = !A2.live;
  const recordsCount = demo ? POL_DEMO_RECORDS.length : A2.records.length;
  return pageHead('POLITICAL MONITOR / A2', t('page.political.t'), t('page.political.s'),
    `<span class="stamp" id="pol-stamp">${demo ? esc(t('ui.mock')) : esc(t('ui.live'))}</span>
     <button class="btn sm" data-act="refresh-pol">↻ ${esc(t('ui.refresh'))}</button>`)
    + `<div class="statebar" id="pol-sys">${sysBarHtml()}</div>
    <div class="pol">
      <aside class="panel">
        <div class="panel-h" style="padding:11px 12px"><h2 style="font-size:11px"><span class="accent"></span>${esc(t('pol.people'))}</h2><span class="num" style="font-size:10px;color:#a9b0bb" id="pol-pcount">${polList().length}</span></div>
        <div style="padding:8px" id="pol-people">${peopleHtml()}</div>
        <div style="padding:10px 12px;border-top:1px solid var(--line);font-size:10px;color:#b7bdc7;line-height:1.8">
          ${isZh() ? '只处理公开发言，保留原始链接；不做隐蔽追踪。' : 'Public statements only, original links retained; no covert tracking.'}
        </div>
      </aside>
      <section class="panel">
        <div class="panel-h"><h2><span class="accent"></span>${esc(t('pol.records'))}</h2>
          <div class="right"><span id="pol-rcount">${recordsCount}</span> ${isZh() ? '条' : 'items'} · ${isZh() ? '发布时间倒序' : 'newest first'}</div></div>
        <div class="filterbar">
          <label class="search"><span>⌕</span><input id="pol-q" type="search" placeholder="${esc(t('ui.search'))}" value="${esc(A2.q)}"></label>
          <select class="sel" id="pol-prov">
            <option value="">${esc(isZh() ? '全部来源' : 'All sources')}</option>
            <option value="official" ${A2.prov === 'official' ? 'selected' : ''}>${esc(isZh() ? '官方来源' : 'Official')}</option>
            <option value="third_party_archive" ${A2.prov === 'third_party_archive' ? 'selected' : ''}>${esc(isZh() ? '第三方归档' : 'Archive')}</option>
          </select>
        </div>
        <div id="pol-records" class="rec-list polrec"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-top:1px solid var(--line)">
          <span style="font-size:10px;color:#a9b0bb">${esc(isZh() ? '时间按本机时区显示' : 'local timezone')}</span>
          <button class="btn sm" id="pol-more" ${demo || !A2.next ? 'hidden' : ''}>${esc(t('ui.more'))}</button>
        </div>
      </section>
      <aside class="panel detail" id="pol-detail" aria-live="polite">${detailHtml()}</aside>
    </div>
    <section class="panel" style="margin-top:12px">
      <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '数据口径与合规边界' : 'Data basis and compliance'}</h2><div class="right">A2 / ${isZh() ? '仅公开信息' : 'public only'}</div></div>
      <div class="panel-b" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px">
        ${[
      [isZh() ? '时间' : 'Time', isZh() ? '接口统一返回 UTC，前端转为本机时区；未知时间显示「时间未知」，不替换为当前时间。page_date 为纯日期，不再按 UTC 偏移。' : 'API returns UTC; converted locally. Unknown time is shown as unknown, never substituted.'],
      [isZh() ? '归属' : 'Attribution', isZh() ? 'verified_page_attribution 只表示页面归属匹配，不代表事实已独立核实；archive_only 表示第三方归档，原帖未验证。' : 'verified_page_attribution means page attribution only, not independent fact-checking.'],
      [isZh() ? '正文' : 'Body', isZh() ? '正文按纯文本渲染并保留换行，不注入 HTML；外链只接受 HTTP(S)，新窗口使用 noopener noreferrer。' : 'Body rendered as plain text with line breaks; only HTTP(S) links open in a new window with noopener.'],
      [isZh() ? '边界' : 'Boundary', isZh() ? '只处理公开发言与官方公告，保留原始链接；不做隐蔽追踪，不采集非公开信息，不绕过付费墙。' : 'Public statements and official releases only. No covert tracking, no non-public data, no paywall circumvention.']
    ].map(([k, v]) => `<div><div class="micro" style="margin-bottom:5px">${k}</div><p style="font-size:11px;line-height:1.85;color:#7b8492">${v}</p></div>`).join('')}
      </div>
    </section>
    <style>
      .pol{display:grid;grid-template-columns:180px minmax(0,1fr) minmax(310px,.92fr);gap:12px;align-items:start}
      @media(max-width:1400px){.pol{grid-template-columns:170px minmax(0,1fr)}.pol .detail{grid-column:1/-1;position:static;max-height:none;min-height:0}}
      @media(max-width:820px){.pol{grid-template-columns:minmax(0,1fr)}}
      .pol .rec-item h4{font-weight:600}
      .polrec{max-height:calc(100vh - 330px);overflow:auto}
      @media(max-width:1400px){.polrec{max-height:none}}
      @media(max-width:820px){.pol .hint{display:none}}
    </style>` + footer();
}

function sysBarHtml() {
  if (!A2.live) {
    return `<span class="warn">${isZh() ? '未连接后端：以下为演示记录' : 'Backend not connected: sample records'}</span>
      <span class="warn">${isZh() ? '接口地址 ' + (A2.base || 'http://127.0.0.1:8000') : 'API ' + (A2.base || 'http://127.0.0.1:8000')}</span>
      <button class="btn-link" data-act="open-settings" style="margin-left:auto">${esc(t('ui.settings'))}</button>`;
  }
  const s = A2.sys || {};
  const db = s.database && s.database.status === 'ok';
  const col = s.collector || {};
  const gd = s.guardian || {};
  const bk = s.backup || {};
  const heart = col.heartbeat_age_seconds;
  const colOk = col.status === 'ok' || col.status === 'active' || (typeof heart === 'number' && heart < 900);
  return `<span class="${db ? '' : 'bad'}">${isZh() ? '数据库' : 'Database'}：${db ? (isZh() ? '正常' : 'ok') : (isZh() ? '不可用' : 'unavailable')}</span>
    <span class="${colOk ? '' : 'warn'}">${isZh() ? '采集进程' : 'Collector'}：${colOk ? (isZh() ? '心跳正常' : 'healthy') : (isZh() ? '需检查' : 'check')}${typeof heart === 'number' ? ' · ' + Math.round(heart / 60) + (isZh() ? ' 分钟前' : 'm ago') : ''}</span>
    <span class="${gd.status === 'ok' || gd.active ? '' : 'warn'}">${isZh() ? '守护' : 'Guardian'}：${gd.active === false ? (isZh() ? '未启用' : 'off') : (gd.status || 'unknown')}</span>
    <span class="${bk.status === 'ok' ? '' : 'warn'}">${isZh() ? '最近备份' : 'Backup'}：${bk.status === 'ok' ? fmtTime(bk.finished_at) : (bk.status || 'never')}</span>
    <span style="margin-left:auto;color:#a9b0bb">${isZh() ? '读自 /api/v1/system-status' : 'via /api/v1/system-status'}</span>`;
}
function peopleHtml() {
  const list = polList();
  const allSel = !A2.sel;
  let html = `<button class="person ${allSel ? 'on' : ''}" data-person="">
    <span class="pav all">◎</span>
    <span class="pbody"><span class="pname">${esc(t('pol.all'))}</span><span class="psub">${isZh() ? '浏览全部公开动态' : 'All statements'}</span></span>
    <span class="pc">›</span></button>`;
  html += list.map(p => `<button class="person ${A2.sel === p.person_id ? 'on' : ''}" data-person="${esc(p.person_id)}">
    <span class="pav">${esc(polInitials(p))}</span>
    <span class="pbody"><span class="pname">${esc(polName(p))}</span><span class="psub">${esc((p.country_codes || []).join(' · ') || p.name_original || '')}</span></span>
    <span class="pc">›</span></button>`).join('');
  if (!list.length) html += `<div style="padding:14px 10px;font-size:11px;color:#a9b0bb">${esc(A2.peopleErr || t('ui.empty'))}</div>`;
  return html;
}
function recordsHtml() {
  if (A2.loading) return `<div class="empty"><div class="sym">⋯</div><p>${esc(t('ui.loading'))}</p></div>`;
  if (A2.err) return `<div class="empty"><div class="sym">!</div><h4>${esc(isZh() ? '读取失败' : 'Request failed')}</h4><p>${esc(A2.err)}</p><button class="btn sm" style="margin-top:10px" data-act="refresh-pol">${esc(t('ui.retry'))}</button></div>`;
  const arr = polRecords();
  if (!arr.length) return `<div class="empty"><div class="sym">◇</div><h4>${esc(isZh() ? '没有匹配的发言' : 'No statements')}</h4><p>${esc(isZh() ? '换一个人物，或清空搜索与来源筛选。' : 'Try another figure, or clear filters.')}</p></div>`;
  return arr.map(r => `<button class="rec-item ${A2.detailId === r.record_id ? 'on' : ''}" data-rec="${esc(r.record_id)}">
      <h4>${esc(r.title || (isZh() ? '（无标题）' : '(untitled)'))}</h4>
      <div class="mm">${verTag(r.verification_status)}<span>${esc(r.source_name || '')}</span><span>·</span><span>${esc(fmtTime(r.published_at))}</span></div>
    </button>`).join('');
}
function detailHtml() {
  if (A2.detailLoading) return `<div class="empty"><div class="sym">⋯</div><p>${esc(t('ui.loading'))}</p></div>`;
  if (A2.detailErr) return `<div class="empty"><div class="sym">!</div><h4>${esc(A2.detailErr)}</h4></div>`;
  const d = A2.live ? A2.detail : (A2.detailId ? {
    record_id: A2.detailId,
    title: (POL_DEMO_RECORDS.find(r => r.record_id === A2.detailId) || {}).title,
    source_name: (POL_DEMO_RECORDS.find(r => r.record_id === A2.detailId) || {}).source_name,
    publisher_name: (POL_DEMO_RECORDS.find(r => r.record_id === A2.detailId) || {}).publisher_name,
    published_at: (POL_DEMO_RECORDS.find(r => r.record_id === A2.detailId) || {}).published_at,
    verification_status: (POL_DEMO_RECORDS.find(r => r.record_id === A2.detailId) || {}).verification_status,
    original_url: (POL_DEMO_RECORDS.find(r => r.record_id === A2.detailId) || {}).original_url,
    body_text: POL_DEMO_BODY[A2.detailId] || ''
  } : null);
  if (!d) return `<div class="empty"><div class="sym">↗</div><h4>${esc(t('pol.pick'))}</h4><p>${esc(t('pol.pickdesc'))}</p><div class="rule"></div><span class="micro">CONTEXT MATTERS</span></div>`;
  const u = safeUrl(d.original_url);
  return `<div class="detail-b">
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">${verTag(d.verification_status)}<span class="tag outline">${esc(d.source_name || '')}</span></div>
    <h2>${esc(d.title || '')}</h2>
    <div style="font-size:10px;color:#8a929f;line-height:1.9">${esc(d.publisher_name || '')} · ${esc(fmtTime(d.published_at))}${d.page_date ? ' · ' + esc(d.page_date) : ''}</div>
    ${d.verification_status === 'archive_only' ? `<div class="notice">${esc(isZh() ? '这条内容来自第三方归档，原始帖子未经核验；归档媒体的描述与人物本人正文分开呈现。' : 'Third-party archive; original post unverified. Media notes are kept separate from the speaker body.')}</div>` : ''}
    <div style="height:1px;background:var(--line);margin:14px 0"></div>
    <div class="body-text">${esc(d.body_text || '')}</div>
    <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">
      ${u ? `<a class="btn sm" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(isZh() ? '原始链接 ↗' : 'Original ↗')}</a>` : ''}
      <button class="btn sm" data-act="copy-body" data-id="${esc(d.record_id)}">${esc(t('ui.copy'))}</button>
    </div>
  </div>`;
}
function refreshPolDom() {
  const pc = $('#pol-people'); if (pc) pc.innerHTML = peopleHtml();
  const rc = $('#pol-records'); if (rc) rc.innerHTML = recordsHtml();
  const dt = $('#pol-detail'); if (dt) dt.innerHTML = detailHtml();
  const sb = $('#pol-sys'); if (sb) sb.innerHTML = sysBarHtml();
  const cnt = $('#pol-rcount'); if (cnt) cnt.textContent = polRecords().length;
  const more = $('#pol-more'); if (more) more.hidden = !(A2.live && A2.next);
}

/* ============================ strategy ============================ */
let STRAT = 'MF';
const SERIES = { MF: NAV, TF: TF_S, EV: EV_S };
function btSource() {
  if (!LIVE.bt) return null;
  const it = LIVE.bt.items[0];
  if (!it || !Array.isArray(it.nav) || it.nav.length < 10) return null;
  return {
    name: it.name,
    series: it.nav,
    st: it.stats || statsOf(it.nav),
    bench: Array.isArray(it.benchmark) && it.benchmark.length === it.nav.length ? it.benchmark : null
  };
}
function viewStrategy() {
  if (!LIVE.bt) return emptyPage('STRATEGY ENGINE / A3', t('page.strategy.t'), t('page.strategy.s'), [
    [isZh() ? 'A3 导出的回测快照 <code>data/backtests.json</code>' : 'A3 snapshot <code>data/backtests.json</code>', '<span class="tag amber">未导入</span>'],
    [isZh() ? '完整五分钟 K 线（回测必需）' : 'native 5-min bars', '<span class="tag outline">额度不足</span>']
  ], isZh()
    ? '回测需要原生五分钟 K 线，富途接口按账号额度计费，一次完整回测远超现有额度。需要 A3 的 <code>equity.csv</code>，或用 <code>tools/export.py backtest</code> 导出。'
    : 'The backtest needs native 5-minute bars and exceeds the current quote quota. A3 needs to provide <code>equity.csv</code>.');
  const live = LIVE.bt.items[0];
  const STRATS = [{
    id: 'MF', name: live.name || (isZh() ? '回测' : 'Backtest'), en: '', mkt: live.market || '',
    desc: isZh() ? '由 A3 导出的真实回测结果，非示例数据。' : 'Real backtest exported from A3, not sample data.',
    ann: (live.stats || {}).ann || 0, mdd: (live.stats || {}).mdd || 0,
    sharpe: (live.stats || {}).sharpe || 0, turnover: 0, st: live.stats || statsOf(live.nav)
  }];
  const s = STRATS.find(x => x.id === STRAT) || STRATS[0];
  const bt = (STRAT === 'MF') ? btSource() : null;
  const st = bt ? bt.st : (s.st || ST);
  const series = bt ? bt.series : (SERIES[s.id] || NAV);
  const bench = (bt && bt.bench) ? bt.bench : BENCH;
  const mret = monthReturns(series, 21);
  const rows = STRATS.map(x => {
    const live = (x.id === 'MF' && bt) ? bt.st : null;
    return `<tr style="cursor:pointer" data-strat="${x.id}">
      <td><div class="sym">${esc(x.name)}</div><div class="sub">${esc(x.en)}</div></td>
      <td class="w" style="font-size:11px;color:#7b8492">${esc(x.mkt)}</td>
      <td class="r ${((live ? live.ann : x.ann) >= 0) ? 'up' : 'down'}">${pct(live ? live.ann : x.ann)}</td>
      <td class="r down">${(live ? live.mdd : x.mdd).toFixed(2)}%</td>
      <td class="r">${(live ? live.sharpe : x.sharpe).toFixed(2)}</td>
      <td class="r">${x.turnover ? x.turnover.toFixed(1) + "x" : "—"}</td>
      <td class="w">${STRAT === x.id ? `<span class="tag green">${isZh() ? '当前查看' : 'viewing'}</span>` : `<span class="tag outline">${isZh() ? '查看' : 'view'}</span>`}</td>
    </tr>`;
  }).join('');

  return pageHead('STRATEGY ENGINE / A3', t('page.strategy.t'), t('page.strategy.s'),
    (bt
      ? `<span class="tag green">${isZh() ? 'A3 真实回测' : 'A3 backtest'}</span><span class="stamp">${esc((LIVE.bt.generated_at || '').slice(0, 16).replace('T', ' '))} UTC</span>`
      : `<span class="tag outline">${isZh() ? '回测区间' : 'Backtest'} 2025-11 → 2026-10</span>`)
     + `<button class="btn sm" data-act="refresh">↻ ${esc(t('ui.refresh'))}</button>`)
    + `<div class="stats">
      <div class="stat"><div class="k">${isZh() ? '年化收益' : 'Annualised'}</div><div class="v up">${pct(st.ann)}</div><div class="d">${isZh() ? '基准 ' : 'Benchmark '}${pct(BST.ann)}</div></div>
      <div class="stat"><div class="k">${isZh() ? '最大回撤' : 'Max drawdown'}</div><div class="v down">${st.mdd.toFixed(2)}<small>%</small></div><div class="d">${isZh() ? '基准 ' : 'Benchmark '}${BST.mdd.toFixed(2)}%</div></div>
      <div class="stat"><div class="k">Sharpe</div><div class="v">${st.sharpe.toFixed(2)}</div><div class="d">${isZh() ? '无风险利率按 0 计' : 'rf = 0'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '年化波动' : 'Volatility'}</div><div class="v">${st.vol.toFixed(2)}<small>%</small></div><div class="d">${isZh() ? '目标 10%' : 'target 10%'}</div></div>
     </div>
     <section class="panel">
       <div class="panel-h"><h2><span class="accent"></span>${esc(t('str.nav'))} — ${esc(bt ? (bt.name || s.name) : s.name)}</h2>
         <div class="legend"><span><i style="background:#c8453a"></i>${esc(isZh() ? '策略净值' : 'Strategy')}</span><span><i style="background:#b8c0cb"></i>${esc(isZh() ? '基准 NDX 100' : 'Benchmark')}</span></div></div>
       <div class="panel-b" style="padding:10px 8px 4px">${navSvg(series, bench, 980, 268)}</div>
     </section>
     <div class="split c2e" style="margin-top:14px">
       <section class="panel">
         <div class="panel-h"><h2><span class="accent"></span>${esc(t('str.drawdown'))}</h2><div class="right">${isZh() ? '峰谷口径' : 'peak-to-trough'} ${st.mdd.toFixed(2)}%</div></div>
         <div class="panel-b" style="padding:8px 6px 2px">${ddSvg(drawdowns(series), 480, 150)}</div>
       </section>
       <section class="panel">
         <div class="panel-h"><h2><span class="accent"></span>${esc(t('str.monthly'))}</h2><div class="right">${isZh() ? '按 21 交易日切分' : '21 trading days'}</div></div>
         <div class="panel-b">${heatSvg(mret, ['11', '12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10'])}</div>
       </section>
     </div>
     <div class="split c2" style="margin-top:14px">
       <section class="panel">
         <div class="panel-h"><h2><span class="accent"></span>${esc(t('str.family'))}</h2><div class="right">${isZh() ? '点击切换图表' : 'click to switch'}</div></div>
         <table class="t"><thead><tr><th>${esc(t('str.family'))}</th><th>${isZh() ? '市场' : 'Market'}</th><th style="text-align:right">${isZh() ? '年化' : 'Ann.'}</th><th style="text-align:right">${isZh() ? '回撤' : 'MDD'}</th><th style="text-align:right">Sharpe</th><th style="text-align:right">${isZh() ? '换手' : 'Turnover'}</th><th></th></tr></thead><tbody>${rows}</tbody></table>
         <div class="panel-b" style="border-top:1px solid var(--line);font-size:11px;line-height:1.9;color:#67707d">${esc(s.desc)}</div>
       </section>
       <div class="stack">
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${esc(t('str.attrib'))}</h2><div class="right">${bt ? `<span class="tag outline" style="margin-right:6px">${isZh() ? '示例' : 'sample'}</span>` : ''}${isZh() ? '累计' : 'cumulative'} ${pct(ST.total, 1)}</div></div>
           <div class="panel-b">
             ${barsHtml([
      { k: isZh() ? '动量因子' : 'Momentum', v: 8.1 },
      { k: isZh() ? '质量因子' : 'Quality', v: 5.6 },
      { k: isZh() ? '价值因子' : 'Value', v: 3.8 },
      { k: isZh() ? '事件叠加' : 'Event overlay', v: 2.1 },
      { k: isZh() ? '交易成本' : 'Costs', v: -1.2 },
      { k: isZh() ? '现金拖累' : 'Cash drag', v: -0.4 },
      { k: isZh() ? '其他' : 'Other', v: 0.4 }
    ])}
           </div>
         </section>
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${esc(t('str.params'))}</h2></div>
           <table class="t"><tbody>
             <tr><td style="color:#7b8492">${isZh() ? '换仓频率' : 'Rebalance'}</td><td class="r">${isZh() ? '半月 / 月度' : 'Bi-weekly'}</td></tr>
             <tr><td style="color:#7b8492">${isZh() ? '持仓上限' : 'Max holdings'}</td><td class="r">12</td></tr>
             <tr><td style="color:#7b8492">${isZh() ? '单票上限' : 'Max weight'}</td><td class="r">8.0%</td></tr>
             <tr><td style="color:#7b8492">${isZh() ? '滑点假设' : 'Slippage'}</td><td class="r">8 bps</td></tr>
             <tr><td style="color:#7b8492">${isZh() ? '手续费' : 'Commission'}</td><td class="r">3 bps</td></tr>
             <tr><td style="color:#7b8492">${isZh() ? '样本外区间' : 'Out-of-sample'}</td><td class="r">2026-07 → 10</td></tr>
           </tbody></table>
         </section>
       </div>
     </div>
     <div class="panel" style="margin-top:14px">
       <div class="panel-b" style="font-size:11px;color:#8a7448;line-height:1.95">
         ${isZh() ? '回测为日频、含结算与合约展期假设，未计入融资成本与税费。所有曲线为历史模拟，不代表未来收益；样本外区间较短，参数稳定性仍需观察。' : 'Daily-frequency backtest with settlement and roll assumptions; financing and taxes excluded. Historical simulation only.'}
       </div>
     </div>` + footer();
}
</script>

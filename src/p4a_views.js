<script>
/* ============================ charts ============================ */
const MONTHS = ['2025-11', '2026-02', '2026-05', '2026-08', '2026-10'];

function navSvg(series, bench, w, h) {
  const padL = 46, padR = 10, padT = 12, padB = 24;
  const all = series.concat(bench);
  let lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
  const sp = hi - lo;
  lo = Math.floor((lo - sp * 0.03) / 5) * 5; hi = Math.ceil((hi + sp * 0.03) / 5) * 5;
  const X = i => padL + (w - padL - padR) * i / (series.length - 1);
  const Y = v => padT + (h - padT - padB) * (1 - (v - lo) / (hi - lo));
  const line = arr => arr.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  const area = line(series) + ' L' + X(series.length - 1).toFixed(1) + ' ' + Y(lo).toFixed(1) + ' L' + padL + ' ' + Y(lo).toFixed(1) + ' Z';
  let grid = '', labs = '';
  for (let g = 0; g <= 4; g++) {
    const v = lo + (hi - lo) * g / 4, y = Y(v);
    grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - padR}" y2="${y.toFixed(1)}" stroke="#eef0f4" stroke-width="1"/>`;
    labs += `<text x="${padL - 7}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="10" fill="#a9b0bb" font-family="Georgia,serif">${v.toFixed(0)}</text>`;
  }
  let xl = '';
  MONTHS.forEach((m, k) => {
    const i = Math.round(k * (series.length - 1) / (MONTHS.length - 1));
    xl += `<text x="${X(i).toFixed(1)}" y="${h - 6}" text-anchor="${k === 0 ? 'start' : k === MONTHS.length - 1 ? 'end' : 'middle'}" font-size="10" fill="#a9b0bb" font-family="Georgia,serif">${m}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="净值曲线">
    <defs><linearGradient id="navg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c8453a" stop-opacity=".18"/><stop offset="100%" stop-color="#c8453a" stop-opacity="0"/>
    </linearGradient></defs>
    ${grid}${labs}
    <path d="${area}" fill="url(#navg)"/>
    <path d="${line(bench)}" fill="none" stroke="#b8c0cb" stroke-width="1" stroke-dasharray="3 3"/>
    <path d="${line(series)}" fill="none" stroke="#c8453a" stroke-width="1.7" stroke-linejoin="round"/>
    <circle cx="${X(series.length - 1).toFixed(1)}" cy="${Y(series[series.length - 1]).toFixed(1)}" r="2.6" fill="#c8453a"/>
    ${xl}
  </svg>`;
}

function ddSvg(dd, w, h) {
  const padL = 40, padR = 10, padT = 8, padB = 16;
  const lo = Math.min.apply(null, dd);
  const X = i => padL + (w - padL - padR) * i / (dd.length - 1);
  const Y = v => padT + (h - padT - padB) * (v / (lo || -1));
  const line = dd.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  const area = line + ` L${X(dd.length - 1).toFixed(1)} ${Y(0).toFixed(1)} L${padL} ${Y(0).toFixed(1)} Z`;
  let grid = '';
  [0, lo / 2, lo].forEach(v => {
    const y = Y(v);
    grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - padR}" y2="${y.toFixed(1)}" stroke="#eef0f4" stroke-width="1"/>
    <text x="${padL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="10" fill="#a9b0bb" font-family="Georgia,serif">${v.toFixed(0)}%</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="回撤曲线">
    ${grid}
    <path d="${area}" fill="#f6ecea"/>
    <path d="${line}" fill="none" stroke="#c8453a" stroke-width="1.2"/>
  </svg>`;
}

function monthReturns(series, per) {
  const out = [];
  for (let i = per; i <= series.length - 1; i += per) out.push((series[i] / series[i - per] - 1) * 100);
  return out;
}
function heatSvg(vals, months) {
  const max = Math.max.apply(null, vals.map(Math.abs)) || 1;
  const cells = vals.map(v => {
    const a = Math.min(1, Math.abs(v) / max);
    const bg = v >= 0 ? `rgba(200,69,58,${(0.08 + a * 0.66).toFixed(2)})` : `rgba(31,122,99,${(0.08 + a * 0.58).toFixed(2)})`;
    return `<i title="${v.toFixed(2)}%" style="background:${bg}"></i>`;
  }).join('');
  const ml = (months || []).slice(0, vals.length).map(m => `<span>${m}</span>`).join('');
  return `<div class="heat">${cells}</div><div class="hmonths">${ml}</div>
  <div class="hlegend"><span style="background:rgba(31,122,99,.62)"></span><span style="background:rgba(31,122,99,.24)"></span>
  <span style="background:#eef0f4"></span><span style="background:rgba(200,69,58,.3)"></span><span style="background:rgba(200,69,58,.72)"></span>
  <em>${Math.min.apply(null, vals).toFixed(1)}% → ${Math.max.apply(null, vals).toFixed(1)}%</em></div>`;
}
function barsHtml(rows) {
  const max = Math.max.apply(null, rows.map(r => Math.abs(r.v))) || 1;
  return rows.map(r => `<div style="display:grid;grid-template-columns:88px 1fr 54px;gap:10px;align-items:center;padding:5px 0">
    <span style="font-size:11px;color:#67707d">${esc(r.k)}</span>
    <span class="bar ${r.v >= 0 ? 'ok' : 'bad'}" style="height:5px"><i style="width:${(Math.abs(r.v) / max * 100).toFixed(0)}%;background:${r.v >= 0 ? '#c8453a' : '#1f7a63'}"></i></span>
    <span class="num" style="font-size:11px;text-align:right;color:${r.v >= 0 ? '#c8453a' : '#1f7a63'}">${pct(r.v, 1)}</span>
  </div>`).join('');
}

/* ============================ shared bits ============================ */
function pageHead(eyebrow, title, sub, actions) {
  return `<div class="page-head">
    <div><div class="eyebrow">${esc(eyebrow)}</div><h1 class="page-title">${esc(title)}</h1><p class="page-sub">${esc(sub)}</p></div>
    <div class="head-actions">${actions || ''}</div>
  </div>`;
}
function footer() {
  return `<div class="footer"><span><b>PRISMQUANT</b> &nbsp;/&nbsp; ${esc(t('foot.left'))}</span><span>${esc(t('foot.right'))}</span></div>`;
}
function stateDot(s) {
  const map = { ok: 'green', warn: 'amber', bad: 'red' };
  return `<span class="tag ${map[s] || ''}"><span class="dot"></span>${s === 'ok' ? (isZh() ? '正常' : 'OK') : s === 'warn' ? (isZh() ? '留意' : 'Watch') : (isZh() ? '触发' : 'Tripped')}</span>`;
}

/* ============================ briefing ============================ */

/* ============================ empty / overview ============================ */
function emptyPage(eyebrow, title, sub, rows, note) {
  const table = `<table class="t" style="border-top:1px solid var(--line)">
      <thead><tr><th>${isZh() ? '需要什么' : 'Needed'}</th><th style="text-align:right">${isZh() ? '现状' : 'Status'}</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td style="color:#3b4552">${r[0]}</td><td class="w" style="text-align:right">${r[r.length - 1]}</td></tr>`).join('')}</tbody>
    </table>`;
  return pageHead(eyebrow, title, sub, `<span class="tag amber">${isZh() ? '暂无数据' : 'No data'}</span>`)
    + `<section class="panel"><div class="panel-b" style="padding:0">
        <div class="empty" style="padding:52px 32px 38px">
          <div class="sym">◇</div>
          <h4>${isZh() ? '这一页还没有可显示的数据' : 'Nothing to show yet'}</h4>
          <p style="max-width:58ch;margin:12px auto 0;text-align:left;line-height:1.95">${note || ''}</p>
          <div class="rule"></div>
          <span class="micro">WAITING FOR UPSTREAM</span>
        </div>
        ${table}
      </div></section>` + footer();
}

function viewOverview() {
  const ok = '<span class="tag green"><span class="dot"></span>' + (isZh() ? '已接入' : 'live') + '</span>';
  const no = '<span class="tag amber"><span class="dot"></span>' + (isZh() ? '未接入' : 'missing') + '</span>';
  const na = '<span class="tag outline">' + (isZh() ? '无代码' : 'no code') + '</span>';
  const agents = [
    ['A1', isZh() ? '新闻代理' : 'News', 'news-main · Streamlit', isZh() ? '无 HTTP 接口' : 'no HTTP API', LIVE.news ? ok : no],
    ['A2', isZh() ? '政治监控' : 'Political', 'political-monitor · FastAPI', isZh() ? '需 PostgreSQL + 采集' : 'needs PG', A2.live ? ok : no],
    ['A3', isZh() ? '执行代理' : 'Execution', 'ndxbots · CLI', isZh() ? '回测需五分钟数据' : 'needs 5-min bars', LIVE.bt ? ok : no],
    ['A4', isZh() ? '风险控制' : 'Risk', isZh() ? '未提供代码' : 'not provided', na],
    ['A5', isZh() ? '指挥官' : 'Commander', isZh() ? '未提供代码' : 'not provided', na]
  ];
  const rows = agents.map(a => `<div class="agent-row">
      <span class="agent-id">${a[0]}</span>
      <div><div class="agent-name">${esc(a[1])}</div><div class="agent-desc">${esc(a[2])} · ${esc(a[3])}</div></div>
      <div class="agent-meta"></div>${a[4]}
    </div>`).join('');
  return pageHead('SYSTEM STATUS', isZh() ? '接入状态' : 'Integration status',
    isZh() ? '这一版只显示真实数据。五个代理里，只有接入的服务才会出现在对应页面。' : 'Only real data is shown. A page has content only if its service is connected.',
    `<span class="stamp">${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC</span>`)
    + `<div class="split c2">
      <section class="panel">
        <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '五个代理' : 'Five agents'}</h2><div class="right">A1 – A5</div></div>
        <div class="panel-b tight">${rows}</div>
        <div class="panel-b" style="border-top:1px solid var(--line);font-size:11px;line-height:1.9;color:#8a7448">
          ${isZh() ? 'A4 与 A5 目前没有可运行的代码，因此「风控闸门」「代理对话」「晨报」三页只显示空状态，不放示例内容。' : 'A4 and A5 have no runnable code yet, so risk, commander and briefing stay empty rather than showing invented content.'}
        </div>
      </section>
      <div class="stack">
        <section class="panel">
          <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '三个数据源' : 'Three sources'}</h2></div>
          <div class="panel-b" style="font-size:11.5px;line-height:2;color:#67707d">
            <div style="display:flex;justify-content:space-between;gap:10px"><span>A1 ${isZh() ? '新闻快照' : 'news snapshot'}</span>${LIVE.news ? ok : no}</div>
            <div style="display:flex;justify-content:space-between;gap:10px"><span>A2 ${isZh() ? '政治监控 API' : 'political API'}</span>${A2.live ? ok : no}</div>
            <div style="display:flex;justify-content:space-between;gap:10px"><span>A3 ${isZh() ? '回测快照' : 'backtest snapshot'}</span>${LIVE.bt ? ok : no}</div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '怎么让它们出现' : 'How to fill them'}</h2></div>
          <div class="panel-b" style="font-size:11.5px;line-height:1.95;color:#67707d">
            <p style="margin-bottom:8px"><b>A1</b> — ${isZh() ? '跑一次采集，导出 ' : 'run a collection, export '}<code>data/news.json</code></p>
            <p style="margin-bottom:8px"><b>A2</b> — ${isZh() ? '启动 FastAPI 并跑一次采集' : 'start the FastAPI and run a collection'}</p>
            <p><b>A3</b> — ${isZh() ? '用五分钟数据跑回测，导出 ' : 'run a backtest, export '}<code>data/backtests.json</code></p>
          </div>
        </section>
      </div>
    </div>` + footer();
}

function viewBriefing() {
  return emptyPage('MORNING BRIEF / A5', t('page.briefing.t'), t('page.briefing.s'), [
    [isZh() ? 'A5 指挥官产出的一份晨报（run 记录 + 四张意图）' : 'One A5 briefing run', '<span class="tag outline">' + (isZh() ? '未提供代码' : 'no code') + '</span>'],
    [isZh() ? 'A4 风控闸门状态与当日干预记录' : 'A4 gate state and interventions', '<span class="tag outline">' + (isZh() ? '未提供代码' : 'no code') + '</span>'],
    [isZh() ? 'A1/A3 的输入（事件簇、执行意图）' : 'A1/A3 inputs', LIVE.news || LIVE.bt ? '<span class="tag green">部分就绪</span>' : '<span class="tag amber">未接入</span>']
  ], isZh()
    ? '晨报由 A5 指挥官聚合 A1–A4 的产出生成。A5 目前没有可运行的代码，所以这里不放任何编造的摘要或推荐。'
    : 'The briefing is produced by A5 from A1–A4 output. A5 has no runnable code yet, so no summary is invented here.');
}

function topicBars() {
  if (LIVE.news) {
    const c = {};
    LIVE.news.items.forEach(x => { const k = x.topic || (isZh() ? '未分类' : 'Uncategorised'); c[k] = (c[k] || 0) + 1; });
    return Object.keys(c).map(k => [k, c[k]]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }
  return [[isZh() ? 'AI 资本开支' : 'AI capex', 9], [isZh() ? '利率路径' : 'Rate path', 7],
          [isZh() ? '出口管制' : 'Export controls', 5], [isZh() ? '资金流' : 'Fund flows', 4],
          [isZh() ? '能源' : 'Energy', 3]];
}
function newsItems() {
  if (!LIVE.news) return D.events;
  return LIVE.news.items.map((x, i) => ({
    id: String(x.id || ('N-' + i)).slice(0, 12),
    time: x.published_at ? fmtTime(x.published_at, false) : '',
    srcCount: 1,
    sentiment: (x.sentiment === 'pos' || x.sentiment === 'neg') ? x.sentiment : 'neu',
    topic: x.topic || (isZh() ? '未分类' : 'Uncategorised'),
    title: x.title || (isZh() ? '（无标题）' : '(untitled)'),
    summary: x.summary || x.reasoning || '',
    tags: (x.tickers || []).slice(0, 4),
    sources: x.source ? [x.source] : [],
    analyzed: !!x.analyzed,
    conf: typeof x.confidence === 'number' ? x.confidence : null
  }));
}
function liveNewsStats(items) {
  const c = { pos: 0, neg: 0, neu: 0 };
  items.forEach(x => c[x.sentiment] = (c[x.sentiment] || 0) + 1);
  const confs = items.map(x => x.conf).filter(v => typeof v === 'number');
  const avg = confs.length ? (confs.reduce((a, b) => a + b, 0) / confs.length) : null;
  const src = (LIVE.news.source || 'news.sqlite3');
  return `<div class="stats">
    <div class="stat"><div class="k">${isZh() ? '条目' : 'Items'}</div><div class="v">${items.length}</div><div class="d">${isZh() ? '已分析 ' + items.filter(x => x.analyzed).length + ' 条 · ' : ''}${esc(src)}</div></div>
    <div class="stat"><div class="k">${isZh() ? '平均置信度' : 'Mean confidence'}</div><div class="v">${avg === null ? '—' : (avg * 100).toFixed(0) + '<small>%</small>'}</div><div class="d">${isZh() ? '由 A1 分析器给出' : 'from the A1 analyser'}</div></div>
    <div class="stat"><div class="k">${isZh() ? '情绪分布' : 'Sentiment'}</div><div class="v" style="font-size:17px;letter-spacing:1px"><span class="up">${c.pos}</span> / <span style="color:#8a929f">${c.neu}</span> / <span class="down">${c.neg}</span></div><div class="d">${isZh() ? '利多 / 中性 / 利空' : 'bull / neutral / bear'}</div></div>
    <div class="stat"><div class="k">${isZh() ? '快照时间' : 'Snapshot'}</div><div class="v" style="font-size:17px">${esc((LIVE.news.generated_at || '').slice(5, 10).replace('-', '/'))}</div><div class="d">${isZh() ? '静态导出，非实时' : 'static export, not live'}</div></div>
  </div>`;
}
function viewNews() {
  if (!LIVE.news) return emptyPage('NEWS INTELLIGENCE / A1', t('page.news.t'), t('page.news.s'), [
    [isZh() ? 'A1 导出的新闻快照 <code>data/news.json</code>' : 'A1 snapshot <code>data/news.json</code>', '<span class="tag amber">未导入</span>'],
    [isZh() ? '或 A1 的只读 HTTP 接口' : 'or a read-only endpoint', '<span class="tag outline">不存在</span>']
  ], isZh()
    ? '新闻来自 A1（news-main：Streamlit + SQLite）。它没有 HTTP 接口，所以先用 <code>tools/export.py</code> 把数据库导出成 JSON，或直接跑 <code>tools/api_server.py</code>。'
    : 'News lives in A1 (Streamlit + SQLite) with no HTTP API. Export it with <code>tools/export.py</code>, or run <code>tools/api_server.py</code>.');
  const SRC = newsItems();
  const totalSrc = SRC.reduce((a, b) => a + b.srcCount, 0);
  const list = SRC.filter(e => NEWS_FILTER === 'all' || e.sentiment === NEWS_FILTER).map((e, i) => {
    const sents = { pos: ['red', isZh() ? '利多' : 'Bullish'], neg: ['green', isZh() ? '利空' : 'Bearish'], neu: ['', isZh() ? '中性' : 'Neutral'] }[e.sentiment];
    return `<details class="news-item" ${i === 0 ? 'open' : ''}>
      <summary>
        <div class="news-top"><span class="num" style="font-size:10px">${esc(e.time)}</span><span>·</span><span>${esc(e.id)}</span>
          <span class="tag ${sents[0]}">${sents[1]}</span><span class="tag outline">${esc(e.topic)}</span></div>
        <div class="news-title">${esc(e.title)}</div>
        <div class="news-foot">
          <span class="tag">${e.srcCount} ${esc(t('news.sources'))}</span>
          ${e.tags.map(x => `<span class="tag blue">${esc(x)}</span>`).join('')}
          ${e.political ? `<span class="tag violet">A2 ${isZh() ? '联动' : 'linked'}</span>` : ''}
        </div>
      </summary>
      <span class="chev" aria-hidden="true">▾</span>
      <div style="padding:11px 0 3px;border-top:1px dashed #eef0f4;margin-top:10px">
        <p style="font-size:11px;line-height:1.95;color:#5c6675">${esc(e.summary)}</p>
        <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px;align-items:center">
          <span class="micro">${isZh() ? '来源' : 'SOURCES'}</span>
          ${e.sources.map(s => `<span style="font-size:10px;color:#7b8492;border-bottom:1px dotted #d7dce3">${esc(s)}</span>`).join('<span style="color:#d7dce3">·</span>')}
        </div>
      </div>
    </details>`;
  }).join('');

  const chips = [['all', isZh() ? '全部' : 'All'], ['pos', isZh() ? '利多' : 'Bullish'], ['neg', isZh() ? '利空' : 'Bearish'], ['neu', isZh() ? '中性' : 'Neutral']]
    .map(([k, v]) => `<button class="chip ${NEWS_FILTER === k ? 'on' : ''}" data-news="${k}">${v}</button>`).join('');

  const stamp = LIVE.news
    ? `<span class="tag green">${isZh() ? 'A1 数据快照' : 'A1 snapshot'}</span><span class="stamp">${esc((LIVE.news.generated_at || '').slice(0, 16).replace('T', ' '))} UTC</span>`
    : `<span class="stamp">06:00 → 08:00</span>`;
  return pageHead('NEWS INTELLIGENCE / A1', t('page.news.t'), t('page.news.s'),
    stamp + `<button class="btn sm" data-act="refresh">↻ ${esc(t('ui.refresh'))}</button>`)
    + (LIVE.news ? liveNewsStats(SRC) : `<div class="stats">
      <div class="stat"><div class="k">${isZh() ? '事件簇' : 'Event clusters'}</div><div class="v">6</div><div class="d">${isZh() ? '由 38 条原始新闻归并' : 'from 38 raw items'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '去重率' : 'Dedup rate'}</div><div class="v">84.2<small>%</small></div><div class="d">${isZh() ? '相似度阈值 0.86' : 'threshold 0.86'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '平均来源数' : 'Sources / cluster'}</div><div class="v">3.2</div><div class="d">${isZh() ? '最高 5（NVDA 数据中心）' : 'max 5'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '情绪分布' : 'Sentiment'}</div><div class="v" style="font-size:17px;letter-spacing:1px"><span class="up">3</span> / <span style="color:#8a929f">1</span> / <span class="down">2</span></div><div class="d">${isZh() ? '利多 / 中性 / 利空' : 'bull / neutral / bear'}</div></div>
     </div>`)
     + `<div class="split c2">
       <section class="panel">
         <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '事件簇' : 'Event clusters'}</h2><div class="right">${totalSrc} ${isZh() ? '条原始新闻' : 'raw items'}</div></div>
         <div class="filterbar">${chips}<span style="margin-left:auto;font-size:10px;color:#a9b0bb">${isZh() ? '按事件权重排序' : 'by event weight'}</span></div>
         <div>${list}</div>
       </section>
       <div class="stack">
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '处理管线' : 'Pipeline'}</h2><div class="right">A1</div></div>
           <div class="panel-b" style="font-size:11px;color:#67707d;line-height:2">
             ${['采集：12 个 RSS 源，轮询 300 秒', '清洗：正文抽取、语言识别、时间归一', '去重：向量相似度 0.86 阈值聚类', '映射：实体 → 标的代码（人工词典 + 规则）', '打标：情绪、主题、可信度粗标', '输出：事件对象 + 每日主题热力图'].map((s, i) =>
      `<div style="display:flex;gap:9px;padding:4px 0"><span class="num" style="color:#c3cad4;font-size:10px;width:14px">${i + 1}</span><span>${s}</span></div>`).join('')}
           </div>
         </section>
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '主题热度' : 'Topic heat'}</h2><div class="right">${isZh() ? '今日' : 'today'}</div></div>
           <div class="panel-b">
             ${(() => {
      const bars = topicBars();
      const max = Math.max.apply(null, bars.map(b => b[1])) || 1;
      return bars.map(([k, v]) => `<div style="display:grid;grid-template-columns:82px 1fr 20px;gap:10px;align-items:center;padding:4px 0">
        <span style="font-size:11px;color:#67707d">${esc(k)}</span>
        <span class="bar" style="height:4px"><i style="width:${(v / max * 100).toFixed(0)}%;background:#3b4552"></i></span>
        <span class="num" style="font-size:10px;text-align:right;color:#7b8492">${v}</span></div>`).join('');
    })()}
           </div>
         </section>
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '已知限制' : 'Known limits'}</h2></div>
           <div class="panel-b" style="font-size:11px;color:#8a7448;line-height:1.95">
             ${isZh()
      ? '情绪标签由规则与词表生成，对反讽与否定句式识别有限；跨语言事件可能被拆成两个簇；主题热力图只反映已采集来源，不代表全市场。'
      : 'Sentiment is rule/lexicon based; irony and negation are weakly handled. Cross-language events may split into two clusters. The heatmap reflects collected sources only.'}
           </div>
         </section>
       </div>
     </div>` + footer();
}
</script>

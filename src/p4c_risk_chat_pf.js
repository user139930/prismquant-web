<script>
/* ============================ risk ============================ */
function viewRisk() {
  const rows = D.limits.map(l => {
    const r = l.limit ? Math.min(999, l.used / l.limit * 100) : 0;
    const st = r > 100 ? 'bad' : r > 80 ? 'warn' : 'ok';
    const u = l.unit === 'x' ? l.used + 'x' : l.used + (l.unit === 'ρ' ? '' : '%');
    const lim = l.limit === null ? (isZh() ? '未触发' : 'not tripped') : (l.unit === 'x' ? l.limit + 'x' : l.limit + (l.unit === 'ρ' ? '' : '%'));
    return `<tr>
      <td><div class="sym" style="font-weight:500">${esc(isZh() ? l.name : l.en)}</div><div class="sub">${isZh() ? esc(l.en) : ''}</div></td>
      <td class="r" style="color:#7b8492">${esc(lim)}</td>
      <td class="r">${esc(u)}</td>
      <td style="width:210px"><div style="display:flex;align-items:center;gap:10px">
        <div class="bar ${st}" style="height:5px;flex:1;min-width:90px"><i style="width:${Math.min(100, r).toFixed(0)}%"></i></div>
        <span class="num" style="font-size:10px;width:34px;text-align:right;color:${r > 100 ? '#c8453a' : r > 80 ? '#a9762b' : '#7b8492'}">${l.limit ? r.toFixed(0) + '%' : '—'}</span></div></td>
      <td class="w">${stateDot(st)}</td>
    </tr>`;
  }).join('');

  const vetoes = D.vetoes.map(v => `<div style="padding:12px 16px;border-bottom:1px solid #f1f3f6">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="tag ${v.action === 'reject' ? 'red' : v.action === 'pause' ? 'amber' : ''}">${v.action === 'reject' ? (isZh() ? '否决' : 'REJECT') : v.action === 'pause' ? (isZh() ? '暂停' : 'PAUSE') : (isZh() ? '降级' : 'DEGRADE')}</span>
      <span class="num" style="font-size:10px;color:#a9b0bb;white-space:nowrap">${esc(v.time)}</span>
      <span class="tag outline">${esc(v.agent)}</span>
      ${v.ref !== '—' ? `<a href="#/news" class="tag blue" style="text-decoration:none">${esc(v.ref)}</a>` : ''}
    </div>
    <div style="font-size:11px;line-height:1.85;color:#5c6675;margin-top:7px">${esc(v.text)}</div>
  </div>`).join('');

  return pageHead('RISK CONTROL / A4', t('page.risk.t'), t('page.risk.s'),
    `<span class="stamp">${esc(isZh() ? '闸门阈值来自配置，非模型推断' : 'thresholds from config, not inferred')}</span>
     <button class="btn sm danger" data-act="pause">⏸ ${esc(t('risk.pause'))}</button>
     <button class="btn sm danger" data-act="flatten">⊘ ${esc(t('risk.flatten'))}</button>`)
    + `<div class="stats">
      <div class="stat"><div class="k">${esc(t('risk.trip'))}</div><div class="v" style="color:#c8453a">1</div><div class="d">${isZh() ? '单行业集中度 31.4%' : 'sector 31.4%'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '今日干预' : 'Interventions'}</div><div class="v">2</div><div class="d">${isZh() ? '否决 1 · 降级 1' : '1 veto · 1 degrade'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '熔断状态' : 'Circuit breaker'}</div><div class="v" style="font-size:20px;color:#1f7a63">${isZh() ? '未触发' : 'Clear'}</div><div class="d">${isZh() ? '最近一次 昨日 15:22' : 'last: yesterday 15:22'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '实盘下单' : 'Live routing'}</div><div class="v" style="font-size:20px">${isZh() ? '关闭' : 'Off'}</div><div class="d">${isZh() ? '模拟撮合 · 需显式开启' : 'simulated · opt-in'}</div></div>
     </div>
     <section class="panel">
       <div class="panel-h"><h2><span class="accent"></span>${esc(t('risk.gate'))}</h2><div class="right">${isZh() ? 'A4 是必经检查点，不可跳过' : 'mandatory checkpoint'}</div></div>
       <div class="panel-b">
         <div class="chain">
           <div class="cn"><b>A1</b><span>${isZh() ? '新闻' : 'News'}</span></div>
           <span class="ar">→</span>
           <div class="cn"><b>A2</b><span>${isZh() ? '政要' : 'Political'}</span></div>
           <span class="ar">→</span>
           <div class="cn"><b>A3</b><span>${isZh() ? '执行意图' : 'Intent'}</span></div>
           <span class="ar">→</span>
           <div class="cn gate"><b>A4</b><span>${isZh() ? '风险闸门' : 'Risk gate'}</span></div>
           <span class="ar">→</span>
           <div class="cn"><b>A5</b><span>${isZh() ? '指挥官' : 'Commander'}</span></div>
           <span class="ar">→</span>
           <div class="cn dim"><b>AD</b><span>${isZh() ? '适配器（关）' : 'Adapter (off)'}</span></div>
         </div>
         <div style="font-size:11px;color:#8a7448;background:#fbf8f1;border-left:2px solid #ddc9a5;padding:7px 10px;margin-top:14px;line-height:1.9">
           ${isZh() ? '任何意图绕过 A4 都会被拒绝写入；否决记录包含规则编号、触发值与理由，可在下方逐条查看。' : 'Any intent bypassing A4 is rejected at write time; each veto carries rule id, trigger value and reason.'}
         </div>
       </div>
     </section>
     <div class="split c2" style="margin-top:14px">
       <section class="panel">
         <div class="panel-h"><h2><span class="accent"></span>${esc(t('risk.limits'))}</h2><div class="right">${isZh() ? '实时' : 'live'}</div></div>
         <table class="t"><thead><tr><th>${isZh() ? '规则' : 'Rule'}</th><th style="text-align:right">${isZh() ? '上限' : 'Limit'}</th><th style="text-align:right">${isZh() ? '当前' : 'Used'}</th><th>${isZh() ? '使用率' : 'Utilisation'}</th><th>${esc(t('ui.status'))}</th></tr></thead><tbody>${rows}</tbody></table>
       </section>
       <div class="stack">
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${esc(t('risk.veto'))}</h2><div class="right">3</div></div>
           <div style="max-height:290px;overflow:auto">${vetoes}</div>
         </section>
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '紧急控制' : 'Emergency controls'}</h2></div>
           <div class="panel-b">
             <p style="font-size:11px;color:#7b8492;line-height:1.9;margin-bottom:11px">${isZh() ? '暂停会阻止新开仓，已有持仓保留；紧急平仓会按市价撤出全部持仓并进入只读模式。演示环境不发送任何真实委托。' : 'Pause blocks new entries and keeps positions; flatten exits everything at market and enters read-only. Nothing is routed in the demo.'}</p>
             <div style="display:flex;gap:8px;flex-wrap:wrap">
               <button class="btn danger" data-act="pause">⏸ ${esc(t('risk.pause'))}</button>
               <button class="btn danger" data-act="flatten">⊘ ${esc(t('risk.flatten'))}</button>
             </div>
           </div>
         </section>
       </div>
     </div>
     <style>
       .chain{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
       .cn{border:1px solid var(--line2);border-radius:5px;padding:7px 13px;min-width:74px;text-align:center;background:#fff}
       .cn b{display:block;font:400 11px var(--serif);letter-spacing:.6px}
       .cn span{display:block;font-size:10px;color:#a9b0bb;margin-top:1px}
       .cn.gate{border-color:var(--red);background:var(--red-soft)}
       .cn.gate span{color:var(--red)}
       .cn.dim{opacity:.55;border-style:dashed}
       .ar{color:#c3cad4;font-size:11px}
     </style>` + footer();
}

/* ============================ chat ============================ */
let CHAT = null;
function chatInit() {
  CHAT = [{ me: false, html: `<p>${isZh() ? '早上好。隔夜信息已经收敛完毕，现在是 08:16，距美股开盘还有 5 小时 44 分。' : 'Good morning. Overnight intake is complete; 08:16 now, 5h44m to the US open.'}</p>
    <p>${isZh() ? '今天只有一件事值得你先看：<b>半导体行业敞口已经顶到 31.4%</b>，超过 30% 的硬上限。所以 AVGO 的加仓被 A4 挡掉了，其余三张意图可以走。' : 'One thing matters most: <b>semiconductor exposure is at 31.4%</b>, above the 30% hard cap. The AVGO add was vetoed by A4; the other three intents can proceed.'}</p>
    <p>${isZh() ? '另外 BTC 趋势因子转负，建议把仓位从 6.2% 降到 3.0%，分批做。' : 'BTC trend factor turned negative; reduce from 6.2% to 3.0% in tranches.'}</p>`, ev: 'run_id: R-20261023-0816\nA5 <- A1(6 clusters) / A2(12 statements) / A3(4 intents) / A4(1 veto, 1 degrade)\ngate: sector_concentration = 31.4% > limit 30.0%' }];
}
function viewChat() {
  if (!CHAT) chatInit();
  return pageHead('COMMANDER / A5', t('page.chat.t'), t('page.chat.s'),
    `<span class="tag outline">${esc(t('chat.note'))}</span>`)
    + `<div class="chat-wrap">
      <section class="panel">
        <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '对话' : 'Dialogue'}</h2><div class="right">run R-20261023-0816</div></div>
        <div class="msgs" id="msgs">${CHAT.map(m => msgHtml(m)).join('')}</div>
        <div class="quick">
          ${[isZh() ? '今天该做什么？' : 'What should I do today?', isZh() ? '风控挡了什么？' : 'What did risk block?', isZh() ? '为什么减 BTC？' : 'Why cut BTC?', isZh() ? 'NVDA 还能加吗？' : 'Can I add NVDA?'].map(q => `<button class="chip" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}
        </div>
        <form class="composer" id="chat-form">
          <input id="chat-input" placeholder="${esc(t('chat.placeholder'))}" autocomplete="off">
          <button class="btn primary" type="submit">${esc(t('chat.send'))}</button>
        </form>
      </section>
      <div class="stack">
        <section class="panel">
          <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '本次运行' : 'This run'}</h2></div>
          <div class="panel-b" style="font-size:11px;line-height:2;color:#67707d">
            <div style="display:flex;justify-content:space-between"><span>run_id</span><span class="num">R-20261023-0816</span></div>
            <div style="display:flex;justify-content:space-between"><span>${isZh() ? '触发' : 'Trigger'}</span><span>${isZh() ? '定时 08:00' : 'schedule 08:00'}</span></div>
            <div style="display:flex;justify-content:space-between"><span>${isZh() ? '参与代理' : 'Agents'}</span><span>A1 A2 A3 A4</span></div>
            <div style="display:flex;justify-content:space-between"><span>${isZh() ? '耗时' : 'Latency'}</span><span class="num">41.2s</span></div>
            <div style="display:flex;justify-content:space-between"><span>${isZh() ? '证据条目' : 'Evidence'}</span><span class="num">19</span></div>
          </div>
        </section>
        <section class="panel">
          <div class="panel-h"><h2><span class="accent"></span>${isZh() ? '引用来源' : 'Citations'}</h2></div>
          <div class="panel-b" style="padding:6px 0">
            ${D.events.slice(0, 4).map(e => `<a href="#/news" style="display:block;padding:8px 14px;border-bottom:1px solid #f1f3f6;text-decoration:none">
              <div style="font-size:10px;color:#a9b0bb" class="num">${esc(e.id)} · ${e.srcCount} ${isZh() ? '源' : 'src'}</div>
              <div style="font-size:11px;line-height:1.6;color:#4c5663;margin-top:2px">${esc(e.title)}</div></a>`).join('')}
          </div>
        </section>
        <section class="panel">
          <div class="panel-b" style="font-size:10px;color:#8a7448;line-height:1.9">
            ${isZh() ? 'A5 不会绕过 A4，也不会给出没有依据的结论。若证据不足，它会直接说「无法判断」。' : 'A5 cannot bypass A4 and will not assert unsupported conclusions; when evidence is thin it says so.'}
          </div>
        </section>
      </div>
    </div>` + footer();
}
function msgHtml(m) {
  if (m.me) {
    return `<div class="msg"><span class="mav me">${isZh() ? '我' : 'ME'}</span>
      <div class="mbody"><div class="mhead"><b>${isZh() ? '你' : 'You'}</b><span>${esc(m.time || '')}</span></div>
      <div class="mtext">${m.html}</div></div></div>`;
  }
  return `<div class="msg"><span class="mav a5">A5</span>
    <div class="mbody"><div class="mhead"><b>Commander</b><span>${isZh() ? '指挥官代理' : 'Commander agent'}</span><span>·</span><span>41.2s</span></div>
    <div class="mtext">${m.html}</div>
    ${m.ev ? `<details class="evidence"><summary>${esc(t('chat.trace'))} · ${m.ev.split('\n').length} ${isZh() ? '条' : 'lines'}</summary><div class="ev-b">${esc(m.ev)}</div></details>` : ''}
    </div></div>`;
}
function a5Reply(q) {
  const s = q.toLowerCase();
  if (/风控|風險|risk|挡|擋|否|block|veto/.test(s)) {
    return {
      html: `<p>${isZh() ? '今天 A4 拦了两件事：' : 'A4 intervened twice today:'}</p>
        <ul><li><b>拒绝</b> — AVGO 加仓至 9.2%。触发规则 <code>sector_concentration</code>：半导体 31.4% &gt; 上限 30.0%。</li>
        <li><b>降级</b> — TSLA 买入意图改为「仅提示」，理由是财报事件窗口的波动率预估超出单笔风险预算。</li></ul>
        <p>${isZh() ? '这不是模型判断，是配置里的硬阈值。要改只能改配置并留下版本记录。' : 'These are hard config thresholds, not model judgement. Changing them requires a config version record.'}</p>`,
      ev: 'rule: sector_concentration\nlimit: 30.0%\nobserved: 31.4%\naction: reject\nintent: AVGO add -> 9.2% NAV\n---\nrule: event_window_vol\nobserved: implied_vol_p95 = 61%\naction: degrade to notify\ntarget: TSLA'
    };
  }
  if (/btc|比特|bitcoin|crypto|减|減/.test(s)) {
    return {
      html: `<p>${isZh() ? 'BTC 的趋势因子在昨天收盘后转负，30 日实现波动率从 41% 抬到 62%。A3 原本给的仓位是 6.2%，A4 建议压到 3.0%。' : 'BTC trend factor turned negative after yesterday close; 30d realised vol rose from 41% to 62%. A3 sized 6.2%, A4 recommends 3.0%.'}</p>
        <p>${isZh() ? '我选择分批而不是一次性：先减 1.6 个点，剩下 1.6 个点在 88,500 附近挂限价。理由是这条腿与其他持仓相关性只有 0.21，一次性砍掉会让组合分散度下降过快。' : 'I chose tranches over a single exit: cut 1.6pp now, rest near 88,500. Correlation to the rest of the book is 0.21; a full exit would cut diversification too fast.'}</p>`,
      ev: 'factor: trend_30d = -0.42 (prev +0.11)\nvol_30d: 41% -> 62%\ncorr_to_book: 0.21\naction: reduce 6.2% -> 3.0% in 2 tranches'
    };
  }
  if (/nvda|英伟达|nvidia|加|买/.test(s)) {
    return {
      html: `<p>${isZh() ? '不能加。行业敞口已经 31.4%，任何新增半导体都会把数字推得更高，A4 会直接拒绝。' : 'No. Sector exposure is already 31.4%; any semiconductor add pushes it higher and A4 rejects it.'}</p>
        <p>${isZh() ? '但这不是看空。NVDA 评分 87.4 仍是四张意图里最高的，只是组合层面没有空间。可选路径有两条：一是等 AVGO 仓位自然回落到 30% 以下，二是先减掉一个低分半导体标的腾出额度。第二条我没有主动建议，因为会触发额外交易成本。' : 'This is not a bearish call. NVDA scores 87.4, the highest of the four. There is simply no room at portfolio level. Two options: wait for AVGO to drift below the cap, or trim a lower-scored semi first — the latter adds cost, so I did not propose it.'}</p>`,
      ev: 'score: NVDA 87.4 (rank 1/4)\nsector: semis = 31.4% (limit 30.0%)\nheadroom: -1.4pp\nrecommendation: hold, revisit after E-1044 comment window'
    };
  }
  if (/今天|做什么|做什麼|today|what/.test(s)) {
    return {
      html: `<p>${isZh() ? '三件事，按顺序：' : 'Three things, in order:'}</p>
        <ol style="margin:6px 0;padding-left:18px"><li>${isZh() ? '确认 3 张意图（NVDA 增持、0700.HK 增持、BTC 减持），AVGO 那张维持不动。' : 'Confirm three intents (add NVDA, add 0700.HK, trim BTC); leave AVGO unchanged.'}</li>
        <li>${isZh() ? '把 E-1044（先进封装出口管制征求意见）加入 30 天观察队列，意见期结束前不要新增半导体敞口。' : 'Queue E-1044 for 30 days; no new semi exposure until the comment window closes.'}</li>
        <li>${isZh() ? '检查港股通资金流是否延续第 12 日 — 这是 0700.HK 那张意图的主要支撑。' : 'Check whether southbound inflows extend to day 12 — that is the main support for the 0700.HK intent.'}</li></ol>
        <p>${isZh() ? '不需要盯盘。中低频率的意思是，你一天看两次就够了。' : 'No need to watch the tape. Medium-to-low frequency means twice a day is enough.'}</p>`,
      ev: 'pending_intents: 3 confirmed / 1 vetoed\nwatchlist_add: E-1044 (30d)\nmonitor: southbound_flow (day 11)'
    };
  }
  return {
    html: `<p>${isZh() ? '这个问题我需要更具体的指向。目前我手上的上下文是：6 个事件簇、12 条政要发言、4 张执行意图、2 次风控干预。' : 'I need a narrower question. Current context: 6 event clusters, 12 statements, 4 intents, 2 risk interventions.'}</p>
      <p>${isZh() ? '你可以问「某只标的能不能加」「某条事件影响哪些持仓」「风控为什么挡了某张单」。' : 'Try asking: can I add X, which holdings does event Y affect, or why did risk block Z.'}</p>`,
    ev: 'context: clusters=6 statements=12 intents=4 interventions=2'
  };
}

/* ============================ portfolio ============================ */
function viewPortfolio() {
  const total = D.positions.reduce((a, p) => a + p.mv, 0);
  const eq = D.positions.filter(p => p.sym !== '现金').reduce((a, p) => a + p.mv, 0);
  const pnl = D.positions.filter(p => p.avg).reduce((a, p) => a + p.mv * p.pnl / 100, 0);
  const rows = D.positions.map(p => `<tr>
    <td><div class="sym">${esc(p.sym)}</div><div class="sub">${esc(p.name)}</div></td>
    <td class="w" style="font-size:11px;color:#7b8492">${esc(p.mkt)}</td>
    <td class="r">${esc(p.qty)}</td>
    <td class="r">${p.avg ? nf(p.avg, 2) : '—'}</td>
    <td class="r">${p.last ? nf(p.last, 2) : '—'}</td>
    <td class="r">${nf(p.mv, 0)}</td>
    <td class="r ${signCls(p.pnl)}">${p.avg ? pct(p.pnl) : '—'}</td>
    <td class="r" style="color:#7b8492">${(p.mv / total * 100).toFixed(1)}%</td>
  </tr>`).join('');
  const exp = [
    { k: isZh() ? '美股' : 'US equity', v: D.positions.filter(p => p.mkt === 'US').reduce((a, p) => a + p.mv, 0) },
    { k: isZh() ? '港股' : 'HK equity', v: D.positions.filter(p => p.mkt === 'HK').reduce((a, p) => a + p.mv, 0) },
    { k: isZh() ? '加密' : 'Crypto', v: D.positions.filter(p => p.mkt === 'CRYPTO').reduce((a, p) => a + p.mv, 0) },
    { k: isZh() ? '现金' : 'Cash', v: D.positions.filter(p => p.sym === '现金').reduce((a, p) => a + p.mv, 0) }
  ].map(x => `<div style="display:grid;grid-template-columns:64px 1fr 48px;gap:9px;align-items:center;padding:5px 0">
      <span style="font-size:11px;color:#67707d">${esc(x.k)}</span>
      <span class="bar" style="height:5px"><i style="width:${(x.v / total * 100).toFixed(0)}%;background:#3b4552"></i></span>
      <span class="num" style="font-size:11px;text-align:right">${(x.v / total * 100).toFixed(1)}%</span>
    </div>`).join('');

  return pageHead('PORTFOLIO / F-09', t('page.portfolio.t'), t('page.portfolio.s'),
    `<span class="tag amber">${esc(t('ui.sim'))}</span><button class="btn sm" data-act="refresh">↻ ${esc(t('ui.refresh'))}</button>`)
    + `<div class="stats">
      <div class="stat"><div class="k">${isZh() ? '总市值' : 'Market value'}</div><div class="v">${nf(total, 0)}<small>USD</small></div><div class="d">${isZh() ? '含现金折算' : 'incl. cash'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '持仓浮动盈亏' : 'Unrealised P&L'}</div><div class="v ${pnl >= 0 ? 'up' : 'down'}">${nf(pnl, 0)}</div><div class="d">${pct(pnl / (eq - pnl) * 100, 2)} ${isZh() ? '对成本' : 'on cost'}</div></div>
      <div class="stat"><div class="k">${isZh() ? '风险资产占比' : 'Risk assets'}</div><div class="v">${(eq / total * 100).toFixed(1)}<small>%</small></div><div class="d">${isZh() ? '现金 ' : 'cash '}${(100 - eq / total * 100).toFixed(1)}%</div></div>
      <div class="stat"><div class="k">${isZh() ? '组合 Beta' : 'Portfolio beta'}</div><div class="v">0.86</div><div class="d">${isZh() ? '对 NDX 100，60 日' : 'to NDX 100, 60d'}</div></div>
     </div>
     <div class="split c2">
       <section class="panel">
         <div class="panel-h"><h2><span class="accent"></span>${esc(t('pf.positions'))}</h2><div class="right">${D.positions.length - 1} ${isZh() ? '个标的' : 'instruments'}</div></div>
         <table class="t"><thead><tr><th>${isZh() ? '标的' : 'Instrument'}</th><th>${isZh() ? '市场' : 'Mkt'}</th><th style="text-align:right">${isZh() ? '数量' : 'Qty'}</th><th style="text-align:right">${isZh() ? '成本' : 'Avg'}</th><th style="text-align:right">${isZh() ? '现价' : 'Last'}</th><th style="text-align:right">${isZh() ? '市值 USD' : 'MV USD'}</th><th style="text-align:right">${isZh() ? '盈亏' : 'P&L'}</th><th style="text-align:right">${isZh() ? '权重' : 'Weight'}</th></tr></thead><tbody>${rows}</tbody></table>
         <div class="panel-b" style="border-top:1px solid var(--line);font-size:10px;color:#a9b0bb;line-height:1.8">${isZh() ? '港股按 1 HKD = 7.82 USD 折算；所有价格为模拟撮合口径，非真实成交。' : 'HK positions converted at 7.82 HKD/USD. Prices are simulated, not executed.'}</div>
       </section>
       <div class="stack">
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${esc(t('pf.exposure'))}</h2></div>
           <div class="panel-b">${exp}</div>
         </section>
         <section class="panel">
           <div class="panel-h"><h2><span class="accent"></span>${esc(t('pf.contrib'))}</h2><div class="right">${isZh() ? '按代理' : 'by agent'}</div></div>
           <div class="panel-b">
             ${barsHtml([
      { k: 'A3 ' + (isZh() ? '因子选股' : 'factors'), v: 7.4 },
      { k: 'A1 ' + (isZh() ? '新闻事件' : 'news'), v: 2.9 },
      { k: 'A2 ' + (isZh() ? '政要事件' : 'political'), v: 0.7 },
      { k: 'A4 ' + (isZh() ? '风控减损' : 'risk saved'), v: 1.1 },
      { k: isZh() ? '市场 Beta' : 'Market beta', v: 4.2 }
    ])}
           </div>
         </section>
       </div>
     </div>` + footer();
}

/* ============================ academy ============================ */
let ACAD = null;
function viewAcademy() {
  if (!ACAD) {
    const feat = D.academy[0], rest = D.academy.slice(1);
    const cards = rest.map(a => `<a class="acad-card" href="#/academy" data-article="${a.id}">
      <div style="display:flex;align-items:center;gap:7px"><span class="tag outline">${esc(a.tag)}</span><span class="micro">${a.min} ${esc(t('acad.min'))}</span></div>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.sum)}</p>
      <div class="meta"><span>${isZh() ? '展开' : 'Open'} →</span></div>
    </a>`).join('');
    return pageHead('ACADEMY', t('page.academy.t'), t('page.academy.s'),
      `<span class="stamp">${isZh() ? '订阅用户可读' : 'subscribers only'}</span>`)
      + `<section class="panel" style="margin-bottom:14px">
        <div class="panel-b" style="display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);gap:30px;padding:26px 26px 24px">
          <div>
            <div class="micro">FEATURED · ${esc(feat.tag)} · ${feat.min} ${esc(t('acad.min'))}</div>
            <h2 style="font:400 24px/1.5 var(--serif);margin:12px 0 10px;letter-spacing:.2px">${esc(feat.title)}</h2>
            <p style="font-size:12px;color:#6f7987;line-height:1.95;max-width:54ch">${esc(feat.sum)}</p>
            <a class="btn sm" href="#/academy" data-article="${feat.id}" style="margin-top:18px;display:inline-flex;text-decoration:none">${isZh() ? '开始阅读' : 'Start reading'} →</a>
          </div>
          <div style="border-left:1px solid var(--line);padding-left:26px">
            <div class="micro" style="margin-bottom:10px">${isZh() ? '课程目录' : 'SYLLABUS'}</div>
            ${D.academy.map((a, i) => `<div style="display:flex;gap:9px;padding:6px 0;font-size:11px;color:#67707d">
              <span class="num" style="color:#c3cad4;font-size:10px;width:14px">0${i + 1}</span>
              <span style="line-height:1.5">${esc(a.title.split('，')[0])}</span></div>`).join('')}
          </div>
        </div>
      </section>
      <div class="split c3" style="gap:12px">${cards}</div>` + footer();
  }
  const a = D.academy.find(x => x.id === ACAD);
  if (!a) { ACAD = null; return viewAcademy(); }
  return pageHead('ACADEMY / ' + a.tag, a.title, a.sum,
    `<button class="btn sm" data-act="acad-back">← ${esc(t('ui.back'))}</button>`)
    + `<section class="panel"><div class="panel-b" style="max-width:76ch">
      <div class="byline" style="margin-bottom:16px"><span class="tag outline">${esc(a.tag)}</span><span>${a.min} ${esc(t('acad.min'))}</span><span>·</span><span>PrismQuant Research</span></div>
      ${a.body.split('\n\n').map(p => `<p style="font:13px/2 var(--serif);color:#3b4552;margin-bottom:16px">${esc(p)}</p>`).join('')}
      <div class="notice" style="margin-top:22px">${isZh() ? '本文为产品内教育内容，不构成投资建议。' : 'Educational content, not investment advice.'}</div>
    </div></section>` + footer();
}
</script>

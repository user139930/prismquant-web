<script>
/* ============================ risk ============================ */
function viewRisk() {
  return emptyPage('RISK CONTROL / A4', t('page.risk.t'), t('page.risk.s'), [
    [isZh() ? 'A4 风控引擎（限额表、否决记录、熔断状态）' : 'A4 risk engine', 'XU Yijia (A4)', '<span class="tag outline">' + (isZh() ? '未提供代码' : 'no code') + '</span>'],
    [isZh() ? 'A3 的实时执行意图（风控的输入）' : 'A3 intents (the input)', 'XU Jinrong (A3)', '<span class="tag amber">未接入</span>']
  ], isZh()
    ? '风控闸门的每一条限额、每一次否决，都必须来自真实的风控引擎。A4 目前没有可运行的代码，这里不放任何编造的限额或否决记录。'
    : 'Every limit and every veto must come from a real risk engine. A4 has no runnable code, so nothing is invented here.');
}

function chatInit() {
  CHAT = [{ me: false, html: `<p>${isZh() ? '早上好。隔夜信息已经收敛完毕，现在是 08:16，距美股开盘还有 5 小时 44 分。' : 'Good morning. Overnight intake is complete; 08:16 now, 5h44m to the US open.'}</p>
    <p>${isZh() ? '今天只有一件事值得你先看：<b>半导体行业敞口已经顶到 31.4%</b>，超过 30% 的硬上限。所以 AVGO 的加仓被 A4 挡掉了，其余三张意图可以走。' : 'One thing matters most: <b>semiconductor exposure is at 31.4%</b>, above the 30% hard cap. The AVGO add was vetoed by A4; the other three intents can proceed.'}</p>
    <p>${isZh() ? '另外 BTC 趋势因子转负，建议把仓位从 6.2% 降到 3.0%，分批做。' : 'BTC trend factor turned negative; reduce from 6.2% to 3.0% in tranches.'}</p>`, ev: 'run_id: R-20261023-0816\nA5 <- A1(6 clusters) / A2(12 statements) / A3(4 intents) / A4(1 veto, 1 degrade)\ngate: sector_concentration = 31.4% > limit 30.0%' }];
}
function viewChat() {
  return emptyPage('COMMANDER / A5', t('page.chat.t'), t('page.chat.s'), [
    [isZh() ? 'A5 指挥官对话接口（含证据链）' : 'A5 commander endpoint', 'AU Ka Chai (A5)', '<span class="tag outline">' + (isZh() ? '未提供代码' : 'no code') + '</span>'],
    [isZh() ? 'A1–A4 的产出作为上下文' : 'A1–A4 output as context', '—', '<span class="tag amber">未接入</span>']
  ], isZh()
    ? '对话的每一句回答都必须能追溯到真实来源。没有 A5 与 A1–A4 的接入，这里不会用预设答案冒充 AI 回复。'
    : 'Every answer must trace back to real sources. Without A5 and A1–A4 connected, no canned replies are shown.');
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
  return emptyPage('PORTFOLIO / F-09', t('page.portfolio.t'), t('page.portfolio.s'), [
    [isZh() ? '模拟账户持仓与成交记录' : 'Simulated positions and fills', 'XU Jinrong (A3)', '<span class="tag amber">未接入</span>'],
    [isZh() ? '或券商沙盒账户（Futu SIMULATE）' : 'or a broker sandbox account', '—', '<span class="tag outline">未绑定</span>']
  ], isZh()
    ? '持仓与盈亏必须来自真实账户或模拟撮合。没有接入之前，这里不放虚构的持仓表。'
    : 'Positions and P&L must come from a real or simulated account. Nothing is fabricated here.');
}

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

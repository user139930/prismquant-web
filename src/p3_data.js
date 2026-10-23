<script>
'use strict';

/* ============================ i18n ============================ */
const I18N = {
  zh: {
    'brand.sub': '棱镜量化 · 多市场研究终端',
    'g.today': '今日', 'g.research': '研究', 'g.exec': '执行', 'g.account': '账户',
    'nav.briefing': '晨报', 'nav.news': '新闻情报', 'nav.political': '政要监控',
    'nav.strategy': '策略与回测', 'nav.risk': '风控闸门', 'nav.chat': '代理对话',
    'nav.portfolio': '持仓与绩效', 'nav.academy': '学院',
    'page.briefing.t': '晨报', 'page.briefing.s': 'A5 指挥官聚合四个专业代理的夜间产出，给出一份十分钟可读完的决策输入。',
    'page.news.t': '新闻情报', 'page.news.s': 'A1 新闻代理：多源去重、实体与标的映射、情绪与主题标签。',
    'page.political.t': '政要监控', 'page.political.s': 'A2 政治监控代理：只处理公开表态，保留原文与来源链接。',
    'page.strategy.t': '策略与回测', 'page.strategy.s': 'A3 执行代理的策略框架：多因子、趋势跟随与事件叠加。',
    'page.risk.t': '风控闸门', 'page.risk.s': 'A4 风险控制对每一张执行意图拥有否决权；否决必须留下理由。',
    'page.chat.t': '代理对话', 'page.chat.s': 'A5 是唯一面向用户的对话入口，任何结论都必须能回溯到证据。',
    'page.portfolio.t': '持仓与绩效', 'page.portfolio.s': '持仓、盈亏与代理贡献分解；当前为模拟撮合。',
    'page.academy.t': '学院', 'page.academy.s': '中低频率量化的基础概念，面向订阅用户。',
    'ui.refresh': '刷新', 'ui.updated': '更新于', 'ui.loading': '载入中…', 'ui.empty': '暂无内容',
    'ui.mock': '示例数据', 'ui.live': '已连接后端', 'ui.offline': '后端未连接',
    'ui.sim': '模拟撮合', 'ui.read': '阅读全文', 'ui.more': '加载更多', 'ui.search': '搜索已加载的标题',
    'ui.all': '全部', 'ui.source': '来源', 'ui.time': '时间', 'ui.status': '状态',
    'ui.settings': '连接设置', 'ui.back': '返回列表', 'ui.detail': '详情', 'ui.copy': '复制正文',
    'ui.copied': '已复制', 'ui.retry': '重试', 'ui.unknown_time': '时间未知',
    'brief.morning': '晨报', 'brief.readtime': '约 10 分钟', 'brief.intents': '今日执行意图',
    'brief.timeline': '隔夜事件时间线', 'brief.agents': '代理运行状态', 'brief.gate': '风控闸门摘要',
    'brief.dissent': '分歧与保留意见',
    'news.cluster': '事件簇', 'news.sources': '来源', 'news.impact': '影响标的', 'news.sentiment': '情绪',
    'pol.people': '监控人物', 'pol.all': '全部人物', 'pol.records': '公开发言', 'pol.runs': '采集记录',
    'pol.pick': '选择一条发言', 'pol.pickdesc': '查看完整正文、归属依据与归档说明。',
    'pol.official': '官方页面归属匹配', 'pol.archive': '第三方归档，未验证原帖',
    'str.nav': '净值曲线', 'str.drawdown': '回撤', 'str.monthly': '月度收益', 'str.params': '回测参数',
    'str.family': '策略家族', 'str.trades': '近 30 日成交', 'str.attrib': '收益归因',
    'risk.limits': '限额与使用率', 'risk.veto': '否决与降级记录', 'risk.gate': '闸门状态',
    'risk.trip': '今日触发', 'risk.pause': '一键暂停', 'risk.flatten': '紧急平仓',
    'pf.positions': '当前持仓', 'pf.contrib': '收益贡献', 'pf.exposure': '市场暴露',
    'chat.placeholder': '问 A5：今天该关注什么？', 'chat.send': '发送',
    'chat.note': '规则应答演示 · 未接入大模型', 'chat.trace': '证据链',
    'acad.min': '分钟阅读', 'acad.open': '展开', 'acad.close': '收起',
    'foot.left': 'PRISMQUANT / 顾问模式 · 不下单 · 不代客理财',
    'foot.right': '所有建议附带依据；模型可能出错，请自行判断。'
  },
  en: {
    'brand.sub': 'Multi-market research terminal',
    'g.today': 'Today', 'g.research': 'Research', 'g.exec': 'Execution', 'g.account': 'Account',
    'nav.briefing': 'Briefing', 'nav.news': 'News', 'nav.political': 'Political watch',
    'nav.strategy': 'Strategy', 'nav.risk': 'Risk gates', 'nav.chat': 'Commander',
    'nav.portfolio': 'Portfolio', 'nav.academy': 'Academy',
    'page.briefing.t': 'Morning briefing', 'page.briefing.s': 'A5 aggregates the overnight output of four specialist agents into a ten-minute decision input.',
    'page.news.t': 'News intelligence', 'page.news.s': 'A1: multi-source deduplication, entity and instrument mapping, sentiment and topic tags.',
    'page.political.t': 'Political watch', 'page.political.s': 'A2: public statements only, with original text and source links retained.',
    'page.strategy.t': 'Strategy and backtest', 'page.strategy.s': 'A3 strategy framework: multi-factor, trend following and event overlay.',
    'page.risk.t': 'Risk gates', 'page.risk.s': 'A4 holds veto power over every execution intent; a veto must carry a reason.',
    'page.chat.t': 'Commander', 'page.chat.s': 'A5 is the only user-facing dialogue entry; every claim must trace back to evidence.',
    'page.portfolio.t': 'Portfolio', 'page.portfolio.s': 'Positions, P&L and agent contribution; simulated matching only.',
    'page.academy.t': 'Academy', 'page.academy.s': 'Foundations of medium-to-low-frequency quant for subscribers.',
    'ui.refresh': 'Refresh', 'ui.updated': 'Updated', 'ui.loading': 'Loading…', 'ui.empty': 'Nothing here yet',
    'ui.mock': 'Sample data', 'ui.live': 'Backend connected', 'ui.offline': 'Backend offline',
    'ui.sim': 'Simulated', 'ui.read': 'Read', 'ui.more': 'Load more', 'ui.search': 'Search loaded titles',
    'ui.all': 'All', 'ui.source': 'Source', 'ui.time': 'Time', 'ui.status': 'Status',
    'ui.settings': 'Connection', 'ui.back': 'Back', 'ui.detail': 'Detail', 'ui.copy': 'Copy text',
    'ui.copied': 'Copied', 'ui.retry': 'Retry', 'ui.unknown_time': 'Time unknown',
    'brief.morning': 'Briefing', 'brief.readtime': '~10 min', 'brief.intents': 'Execution intents',
    'brief.timeline': 'Overnight timeline', 'brief.agents': 'Agent status', 'brief.gate': 'Risk gate summary',
    'brief.dissent': 'Dissenting views',
    'news.cluster': 'clusters', 'news.sources': 'sources', 'news.impact': 'Instruments', 'news.sentiment': 'Sentiment',
    'pol.people': 'Watched figures', 'pol.all': 'All figures', 'pol.records': 'Statements', 'pol.runs': 'Collection runs',
    'pol.pick': 'Select a statement', 'pol.pickdesc': 'Full text, attribution evidence and archive notes appear here.',
    'pol.official': 'Official page attribution', 'pol.archive': 'Third-party archive, original unverified',
    'str.nav': 'Net asset value', 'str.drawdown': 'Drawdown', 'str.monthly': 'Monthly returns', 'str.params': 'Parameters',
    'str.family': 'Strategy families', 'str.trades': 'Last 30 days', 'str.attrib': 'Return attribution',
    'risk.limits': 'Limits and utilisation', 'risk.veto': 'Veto and downgrade log', 'risk.gate': 'Gate status',
    'risk.trip': 'Tripped today', 'risk.pause': 'Pause all', 'risk.flatten': 'Emergency flatten',
    'pf.positions': 'Open positions', 'pf.contrib': 'Contribution', 'pf.exposure': 'Market exposure',
    'chat.placeholder': 'Ask A5: what matters today?', 'chat.send': 'Send',
    'chat.note': 'Canned responses · no LLM wired', 'chat.trace': 'Evidence chain',
    'acad.min': 'min read', 'acad.open': 'Expand', 'acad.close': 'Collapse',
    'foot.left': 'PRISMQUANT / advisory mode · no order routing · no custody',
    'foot.right': 'Every recommendation carries evidence; models err, judge for yourself.'
  }
};
let LANG = 'zh';
function t(k) {
  const dict = I18N[LANG] || I18N.zh;
  const s = dict[k] || I18N.zh[k] || k;
  return LANG === 'hant' ? toHant(s) : s;
}
const isZh = () => LANG !== 'en';
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* blocked */ } };
const ssGet = k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
const ssSet = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* blocked */ } };

/* ============================ helpers ============================ */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
function esc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeUrl(u) {
  if (!u) return null;
  try { const x = new URL(u, location.href); return (x.protocol === 'http:' || x.protocol === 'https:') ? x.href : null; }
  catch (e) { return null; }
}
const nf = (v, d = 2) => Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (v, d = 2) => (v > 0 ? '+' : '') + nf(v, d) + '%';
const signCls = v => (v > 0 ? 'up' : v < 0 ? 'down' : 'muted');
function fmtTime(iso, withDate) {
  if (!iso) return t('ui.unknown_time');
  const d = new Date(iso);
  if (isNaN(d)) return t('ui.unknown_time');
  const p = n => String(n).padStart(2, '0');
  const hm = p(d.getHours()) + ':' + p(d.getMinutes());
  return withDate === false ? hm : (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hm;
}
function relTime(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (isNaN(diff)) return '';
  if (diff < 90) return isZh() ? Math.round(diff) + ' 秒前' : Math.round(diff) + 's ago';
  if (diff < 5400) return isZh() ? Math.round(diff / 60) + ' 分钟前' : Math.round(diff / 60) + 'm ago';
  return fmtTime(iso);
}
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2200);
}

/* ============================ demo dataset ============================ */
function buildSeries(seed, n, vol, shockAt, shockSize, targetTotal) {
  let s = seed >>> 0, eps = [], sum = 0;
  const T = Math.log(1 + targetTotal);
  for (let attempt = 0; attempt < 400; attempt++) {
    const r = rng(s); eps = []; sum = 0;
    for (let i = 0; i < n; i++) {
      let e = gauss(r) * vol;
      if (shockAt && i >= shockAt && i < shockAt + 14) e -= shockSize;
      eps.push(e); sum += e;
    }
    if (Math.abs(sum) < 0.055) break;
    s = (s + 7919) >>> 0;
  }
  const drift = (T - sum) / n;
  let v = 100; const out = [v];
  for (let i = 0; i < n; i++) { v = v * (1 + drift + eps[i]); out.push(v); }
  return out;
}
const NAV_N = 253;
const NAV = buildSeries(20261023, 252, 0.0082, 196, 0.0062, 0.184);
const BENCH = buildSeries(77712, 252, 0.0106, 196, 0.0089, 0.112);
const TF_S = buildSeries(5150, 252, 0.0118, 150, 0.0075, 0.121);
const EV_S = buildSeries(8801, 252, 0.0046, 0, 0, 0.053);

function statsOf(series) {
  const first = series[0], last = series[series.length - 1];
  const total = (last / first - 1) * 100;
  let peak = series[0], mdd = 0;
  series.forEach(v => { if (v > peak) peak = v; mdd = Math.min(mdd, (v / peak - 1) * 100); });
  const rets = series.slice(1).map((v, i) => v / series[i] - 1);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length);
  const sharpe = sd ? (mean / sd) * Math.sqrt(252) : 0;
  const ann = (Math.pow(last / first, 252 / series.length) - 1) * 100;
  return { total, ann, mdd, sharpe, vol: sd * Math.sqrt(252) * 100 };
}
const ST = statsOf(NAV);
const BST = statsOf(BENCH);
const STF = statsOf(TF_S);
const STE = statsOf(EV_S);

function drawdowns(series) {
  let peak = series[0];
  return series.map(v => { if (v > peak) peak = v; return (v / peak - 1) * 100; });
}
const DD = drawdowns(NAV);

const D = {
  ticks: [
    { sym: 'NDX', label: '纳指 100', last: 21684.2, chg: 0.82 },
    { sym: 'HSI', label: '恒生指数', last: 25941.6, chg: 0.34 },
    { sym: 'SPX', label: '标普 500', last: 6412.8, chg: 0.41 },
    { sym: 'BTC', label: 'BTC/USD', last: 91850, chg: -4.71 },
    { sym: 'US10Y', label: '美债 10Y', last: 4.132, chg: -0.06 },
    { sym: 'DXY', label: '美元指数', last: 98.42, chg: -0.18 },
    { sym: 'XAU', label: '黄金', last: 4012.5, chg: 0.63 },
    { sym: 'CL', label: 'WTI 原油', last: 68.94, chg: -1.12 }
  ],
  agents: [
    { id: 'A1', name: '新闻代理', en: 'News', desc: '38 条新闻归并为 6 个事件簇', desc_en: '38 items merged into 6 clusters', state: 'ok', meta: '08:00', code: '38→6' },
    { id: 'A2', name: '政治监控', en: 'Political', desc: '2 位人物 · 12 条新发言', desc_en: '2 figures · 12 new statements', state: 'ok', meta: '07:12', code: '12 新增' },
    { id: 'A3', name: '执行代理', en: 'Execution', desc: '4 张意图，1 张被否', desc_en: '4 intents, 1 vetoed', state: 'ok', meta: '08:14', code: '4 意图' },
    { id: 'A4', name: '风险控制', en: 'Risk', desc: '否决 1 · 降级 1 · 熔断未触发', desc_en: '1 veto · 1 degrade · breaker clear', state: 'warn', meta: '08:14', code: '2 干预' },
    { id: 'A5', name: '指挥官', en: 'Commander', desc: '晨报已生成，等待确认', desc_en: 'Brief generated, awaiting confirm', state: 'ok', meta: '08:16', code: '1 份' }
  ],
  recs: [
    {
      sym: 'NVDA', name: 'NVIDIA Corp.', mkt: 'US', side: 'long', score: 87.4,
      target: '178.0 – 186.0', last: 171.06, chg: 2.14, horizon: '4–8 周',
      thesis: 'AI 资本开支预期上修，动量因子由负转正；A2 未检出相关政策风险事件；行业敞口 24.1%，通过 A4 检查。',
      votes: [1, 1, 1, 1], veto: false
    },
    {
      sym: 'AVGO', name: 'Broadcom Inc.', mkt: 'US', side: 'hold', score: 82.1,
      target: '402.0 – 418.0', last: 389.2, chg: 0.93, horizon: '6–10 周',
      thesis: '基本面评分居前三，但加仓意图被 A4 否决：半导体行业集中度 31.4%，超过 30% 上限，维持现有仓位。',
      votes: [1, 1, 1, 0], veto: true
    },
    {
      sym: '0700.HK', name: '腾讯控股', mkt: 'HK', side: 'long', score: 71.6,
      target: '585.0 – 612.0', last: 596.5, chg: 1.28, horizon: '4–6 周',
      thesis: '南向资金连续 11 日净流入；估值因子回到五年 34 分位；港币流动性边际改善。',
      votes: [1, 1, 1, 1], veto: false
    },
    {
      sym: 'BTC/USD', name: 'Bitcoin', mkt: 'CRYPTO', side: 'reduce', score: 34.2,
      target: '88,500 – 92,000', last: 91850, chg: -4.71, horizon: '1–3 周',
      thesis: '趋势因子转为负值，30 日波动率抬升至 62%；A4 建议仓位由 6.2% 降至 3.0%，分批执行。',
      votes: [0, -1, -1, 1], veto: false
    }
  ],
  events: [
    {
      id: 'E-1042', time: '06:12', srcCount: 3, sentiment: 'pos', topic: '宏观 / 利率',
      title: '美国 9 月核心 PCE 同比 2.6%，低于市场预期',
      summary: '商务部经济分析局公布 9 月核心 PCE 物价指数同比 2.6%（预期 2.7%），环比 0.2%。利率期货对 12 月降息概率的定价由 54% 升至 68%。',
      tags: ['NDX', 'US10Y', 'DXY'], sources: ['BEA', 'Reuters', 'Bloomberg']
    },
    {
      id: 'E-1043', time: '07:05', srcCount: 5, sentiment: 'pos', topic: '半导体 / AI 资本开支',
      title: 'NVIDIA 与中东主权基金共建 5GW 数据中心，分三期落地',
      summary: '五家来源交叉确认投资框架，首期 1.2GW 预计 2027 年投产。A1 将事件权重由 0.6 上调至 0.9，并映射至 NVDA、AVGO、VRT。',
      tags: ['NVDA', 'AVGO', 'VRT'], sources: ['Reuters', 'FT', 'WSJ', 'CNBC', '官方新闻稿']
    },
    {
      id: 'E-1044', time: '07:48', srcCount: 2, sentiment: 'neg', topic: '半导体 / 贸易政策',
      title: '商务部就先进封装设备出口管制征求公众意见',
      summary: '意见期 30 天，覆盖混合键合与硅通孔设备。当前对组合内标的收入影响估计低于 2%，但若扩围至量测设备则需重新评估。',
      tags: ['AVGO', 'AMAT', 'LRCX'], sources: ['商务部公告', 'Reuters']
    },
    {
      id: 'E-1045', time: '07:12', srcCount: 2, sentiment: 'neu', topic: '央行 / 欧元区',
      title: '拉加德：通胀回落路径确认，但服务业工资仍偏强',
      summary: 'A2 捕获欧洲议会听证会表态，措辞与 9 月会议纪要一致。A1 判定不改变 ECB 路径，维持 EUR 中性。',
      tags: ['EUR', 'EU50'], sources: ['ECB 官网', 'Reuters'], political: true
    },
    {
      id: 'E-1046', time: '05:30', srcCount: 4, sentiment: 'neg', topic: '能源',
      title: 'OPEC+ 维持 11 月增产节奏不变，日均 13.7 万桶',
      summary: '会议未讨论进一步减产。WTI 跌破 69 美元，能源板块相对强弱降至 12 分位。',
      tags: ['CL', 'XLE'], sources: ['OPEC 秘书处', 'Reuters', 'Bloomberg', 'Argus']
    },
    {
      id: 'E-1047', time: '08:02', srcCount: 3, sentiment: 'pos', topic: '资金流 / 港股',
      title: '南向资金连续 11 日净流入，累计 412 亿港元',
      summary: '主要流向互联网与高股息。0700.HK 单日净买入 28.4 亿港元，为近三个月最高。',
      tags: ['0700.HK', 'HSI'], sources: ['港交所', 'Wind', 'AAStocks']
    }
  ],
  limits: [
    { name: '单笔名义敞口', en: 'Single position', limit: 8.0, used: 5.6, unit: '% NAV', state: 'ok' },
    { name: '单日亏损', en: 'Daily loss', limit: 2.0, used: 0.4, unit: '% NAV', state: 'ok' },
    { name: '组合杠杆', en: 'Gross leverage', limit: 1.5, used: 1.12, unit: 'x', state: 'warn' },
    { name: '单行业集中度', en: 'Sector concentration', limit: 30.0, used: 31.4, unit: '%', state: 'bad' },
    { name: '持仓相关性', en: 'Pairwise correlation', limit: 0.75, used: 0.68, unit: 'ρ', state: 'warn' },
    { name: '事件熔断', en: 'Event circuit-breaker', limit: null, used: 0, unit: '', state: 'ok' }
  ],
  vetoes: [
    { time: '12:04', agent: 'A4', action: 'reject', text: '拒绝对 AVGO 加仓至 9.2%：半导体行业敞口将达 31.4%，超过 30% 上限。', ref: 'E-1044' },
    { time: '09:31', agent: 'A4', action: 'degrade', text: '将 TSLA 买入意图降级为「仅提示」：财报事件窗口内，波动率预估超出单笔风险预算。', ref: '—' },
    { time: '昨日 15:22', agent: 'A4', action: 'pause', text: '单日亏损触及 1.8%（阈值 2.0%），暂停新开仓 20 分钟后自动恢复。', ref: '—' }
  ],
  positions: [
    { sym: 'NVDA', name: 'NVIDIA Corp.', mkt: 'US', qty: '1,240', avg: 152.30, last: 171.06, mv: 212114, pnl: 12.31, w: 18.4 },
    { sym: 'MSFT', name: 'Microsoft', mkt: 'US', qty: '480', avg: 402.10, last: 428.60, mv: 205728, pnl: 6.59, w: 17.8 },
    { sym: 'AVGO', name: 'Broadcom', mkt: 'US', qty: '210', avg: 361.40, last: 389.20, mv: 81732, pnl: 7.69, w: 7.1 },
    { sym: '0700.HK', name: '腾讯控股', mkt: 'HK', qty: '1,800', avg: 561.00, last: 596.50, mv: 137302, pnl: 6.33, w: 11.6 },
    { sym: 'BTC/USD', name: 'Bitcoin', mkt: 'CRYPTO', qty: '0.85', avg: 96400, last: 91850, mv: 78073, pnl: -4.72, w: 6.8 },
    { sym: '现金', name: 'Cash & equivalents', mkt: '—', qty: '—', avg: null, last: null, mv: 468000, pnl: 0, w: 40.6 }
  ],
  strategies: [
    {
      id: 'MF', name: '多因子评分轮动', en: 'Multi-factor rotation', mkt: 'US / HK 股票',
      desc: '价值、质量、动量三因子等权打分，半月或月度换仓，持仓上限 12 只，单票不超过 8%。',
      ann: ST.ann, mdd: ST.mdd, sharpe: ST.sharpe, turnover: 3.8, win: 58.4, n: 24, st: ST
    },
    {
      id: 'TF', name: '趋势跟随', en: 'Trend following', mkt: '期货 / 外汇',
      desc: '日线或四小时通道突破，ATR 止损，波动率目标 10%，不做日内高频。',
      ann: STF.ann, mdd: STF.mdd, sharpe: STF.sharpe, turnover: 6.2, win: 44.1, n: 18, st: STF
    },
    {
      id: 'EV', name: '事件叠加层', en: 'Event overlay', mkt: '组合层',
      desc: '把 A1 / A2 的高置信事件作为仓位乘数或临时风险开关，而非独立开仓信号。',
      ann: STE.ann, mdd: STE.mdd, sharpe: STE.sharpe, turnover: 0.9, win: 61.2, n: 11, st: STE
    }
  ],
  academy: [
    {
      id: 'a1', tag: '基础', min: 6, title: '什么是中低频率策略，为什么我们不拼速度',
      sum: '持仓数天到数月，收益来自因子与风险溢价，而不是撮合延迟。',
      body: `高频与超高频策略依赖托管机房、专线和极低的撮合延迟，是资本与工程的重资产赛道。中低频率策略的持仓周期通常在数天到数月，年换手率显著低于高频，收益主要来自因子暴露（价值、质量、动量）、风险溢价与事件错价。\n\n对本项目而言，这意味着三件事：第一，不需要微秒级基础设施，普通云服务器和个人电脑足以完成研究与回测；第二，容量更友好，策略不会因为资金规模稍微变大就立刻失效；第三，可解释性更强，每一笔交易背后可以写清楚「为什么买」。\n\n代价是：中低频率的边际收益更依赖研究质量，而不是工程速度。因此本项目把重心放在因子框架、事件感知与风控闸门上，而不是行情推送的频率。`
    },
    {
      id: 'a2', tag: '因子', min: 8, title: '因子投资入门：价值、质量与动量',
      sum: '三个最常见、最容易解释的因子，以及它们为什么会失效。',
      body: `价值因子用估值指标（市盈率、市净率、自由现金流收益率）衡量「便宜」。它长期有效，但可能连续数年跑输，尤其在成长风格占优的阶段。\n\n质量因子关注盈利能力、盈利稳定性、低杠杆与现金流质量。它在信用收缩期往往表现更好，因为市场愿意为确定性付费。\n\n动量因子买过去 6–12 个月表现较好的标的。它与其他因子相关性低，能改善组合的分散度，但在趋势反转时会集中亏损。\n\n本项目把三者等权打分，是为了避免单一因子长期失效时组合完全失去方向；代价是任何一个因子特别强的时候，组合都不会跑得最好。`
    },
    {
      id: 'a3', tag: '风险', min: 7, title: '回撤、资金容量与「看起来很好」的回测',
      sum: '最大回撤比年化收益更能决定你能不能拿住一个策略。',
      body: `回测里最常见的问题是过拟合：参数调到刚好贴合历史，样本外立刻失效。判断方法不是看曲线有多漂亮，而是看参数微调后收益是否剧烈变化、不同市场阶段是否都还有正贡献。\n\n资金容量指策略在不显著恶化自身成交价格的前提下能管理的资金规模。中低频率策略容量通常较好，但仍受标的流动性与持仓集中度限制。本项目设置单票 8%、单行业 30% 的上限，一部分原因就是容量。\n\n最大回撤是持有体验的核心。一个年化 18%、最大回撤 9% 的策略，通常比年化 25%、最大回撤 35% 的策略更容易被真正执行——因为后者大概率会在最差的时点被放弃。`
    },
    {
      id: 'a4', tag: '合规', min: 5, title: '顾问模式、风险否决与不做的事',
      sum: '本系统默认只给建议，不代客下单、不托管资金。',
      body: `系统默认处于顾问模式：所有执行意图先以建议形式呈现，只有用户显式确认后才进入适配器。实盘下单默认关闭，演示环境使用模拟撮合。\n\n风险控制代理（A4）对执行代理（A3）拥有否决权。否决必须记录规则编号、触发值、动作与理由，用户可以在「风控闸门」页面逐条查看。这不是为了限制收益，而是为了让每一次「不交易」也有据可查。\n\n明确不做的事：不托管客户资金、不做收益分成、不提供高频做市、不采集非公开信息、不绕过付费墙抓取内容、不对政治人物做隐蔽追踪。`
    }
  ],
  chatSeed: [
    { me: false, html: `<p>早上好。隔夜信息已经收敛完毕，${isZh() ? '现在是 08:16，距美股开盘还有 5 小时 44 分。' : ''}</p><p>今天只有一件事值得你先看：<b>半导体行业敞口已经顶到 31.4%</b>，超过 30% 的硬上限。所以 AVGO 的加仓被 A4 挡掉了，其余三张意图可以走。</p><p>另外 BTC 趋势因子转负，建议把仓位从 6.2% 降到 3.0%，分批做。</p>`, ev: 'run_id: R-20261023-0816\nA5 ← A1(6 clusters) / A2(12 statements) / A3(4 intents) / A4(1 veto,1 degrade)\ngate: sector_concentration=31.4% > limit=30.0%' }
  ]
};
</script>

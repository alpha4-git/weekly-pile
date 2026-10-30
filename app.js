/* Weekly Pile core. All data lives in this browser's IndexedDB on the phone:
   exercises (library add-ons), plans (ordered set lists), logs (one record per set), meta (settings). */
'use strict';
const APP_VERSION = '1.3.12';

// ---------------------------------------------------------------- utilities
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = n => String(n).padStart(2, '0');
const dayKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const weekStart = d => { const m = new Date(d.getFullYear(), d.getMonth(), d.getDate()); m.setDate(m.getDate() - ((m.getDay() + 6) % 7)); return m; };
const fmtDay = d => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const fmtTime = d => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const fmtW = w => String(Math.round(w * 100) / 100);
const newId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const ID_RE = /^[a-z0-9][a-z0-9_-]{0,47}$/;
let toastT;
function toast(msg, ms = 2400) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms); }

// ---------------------------------------------------------------- IndexedDB
const DB = (() => {
  let dbp;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('weekly-pile', 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      d.createObjectStore('exercises', { keyPath: 'id' });
      d.createObjectStore('plans', { keyPath: 'id' });
      d.createObjectStore('logs', { keyPath: 'id' }).createIndex('t', 't');
      d.createObjectStore('meta', { keyPath: 'k' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const req = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const write = (store, fn) => open().then(d => new Promise((res, rej) => {
    const tx = d.transaction(store, 'readwrite'); fn(tx.objectStore(store));
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error || new Error('Write aborted'));
  }));
  return {
    all: store => open().then(d => req(d.transaction(store).objectStore(store).getAll())),
    get: (store, key) => open().then(d => req(d.transaction(store).objectStore(store).get(key))),
    put: (store, val) => write(store, s => s.put(val)),
    putMany: (store, vals) => write(store, s => vals.forEach(v => s.put(v))),
    del: (store, key) => write(store, s => s.delete(key)),
    delMany: (store, keys) => write(store, s => keys.forEach(k => s.delete(k))),
  };
})();

// ---------------------------------------------------------------- validation (imported files are untrusted)
const str = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
const num = (v, d) => (v !== null && v !== '' && Number.isFinite(+v)) ? +v : d;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const LEVELS = ['beginner', 'intermediate', 'expert'];
const EQUIP = { machine: 'Machines', cable: 'Cables', dumbbell: 'Dumbbells', barbell: 'Barbell', 'ez bar': 'EZ bar', bodyweight: 'Bodyweight', kettlebell: 'Kettlebells',
  bands: 'Bands', 'medicine ball': 'Medicine ball', 'exercise ball': 'Exercise ball', other: 'Other' };
// Database photos are loaded from a fixed commit of github.com/yuhonas/free-exercise-db, so the files can't change under us.
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/';
const IMG_RE = /^[A-Za-z0-9_\-()',.]{1,90}\/\d\.jpg$/;
function validExercise(o) {
  if (!o || o.type !== 'exercise' || !ID_RE.test(o.id || '')) throw new Error('not a valid exercise file');
  const credit = {};
  for (const [k, v] of Object.entries(o.credit || {})) if (ID_RE.test(k) && +v > 0 && +v <= 1) credit[k] = +v;
  const refs = (Array.isArray(o.refs) ? o.refs : []).filter(r => r && typeof r.url === 'string' && /^https:\/\/[^\s"'<>]+$/.test(r.url))
    .slice(0, 6).map(r => ({ title: str(r.title, 120) || r.url, url: r.url.slice(0, 500) }));
  const lo = clamp(Math.round(num(o.lo, 8)), 1, 100);
  return {
    type: 'exercise', schema: 1, id: o.id, version: Math.max(1, Math.floor(num(o.version, 1))),
    name: str(o.name, 80) || o.id, short: str(o.short, 24) || str(o.name, 24) || o.id, equipment: str(o.equipment, 120),
    equip: Object.hasOwn(EQUIP, o.equip) ? o.equip : 'other', level: LEVELS.includes(o.level) ? o.level : 'beginner',
    mechanic: o.mechanic === 'isolation' ? 'isolation' : 'compound', reviewed: o.reviewed === true, common: o.common === true, source: str(o.source, 60),
    variant: str(o.variant, 40), timed: o.timed === true,
    unit: o.unit === 'kg' ? 'kg' : 'lb', step: clamp(num(o.step, 5), 0.25, 50), perSide: !!o.perSide, rest: clamp(Math.round(num(o.rest, 120)), 15, 600),
    lo, hi: clamp(Math.round(num(o.hi, lo + 4)), lo, 100), credit,
    cues: (Array.isArray(o.cues) ? o.cues : []).filter(c => typeof c === 'string').slice(0, 24).map(c => c.slice(0, 800)),
    safety: str(o.safety, 400), refs, figure: { svg: typeof (o.figure && o.figure.svg) === 'string' ? o.figure.svg.slice(0, 200000) : '' },
    images: (Array.isArray(o.images) ? o.images : []).filter(p => typeof p === 'string' && IMG_RE.test(p)).slice(0, 2),
  };
}
const MONTH = 30.44, DAY = 864e5;
const WSTEP = 5;   // the weight +/- buttons always move 5 lb (smaller plates and dumbbell jumps are rare in practice)
function muscleMap(o, lo, hi) {
  const m = {};
  for (const [k, v] of Object.entries(o || {})) if (ID_RE.test(k) && Number.isFinite(+v)) m[k] = clamp(+v, lo, hi);
  return m;
}
function validPlan(o) {
  if (!o || o.type !== 'plan' || !str(o.id, 60)) throw new Error('not a valid plan file');
  const muscles = {};
  for (const [k, v] of Object.entries(o.muscles || {})) if (ID_RE.test(k)) muscles[k] = str(v, 60) || k;
  if (!Object.keys(muscles).length) throw new Error('plan lists no muscles');
  const items = (Array.isArray(o.items) ? o.items : []).filter(i => i && ID_RE.test(i.ex || '')).slice(0, 60).map(i => {
    const lo = clamp(Math.round(num(i.lo, 8)), 1, 100);
    const it = { ex: i.ex, sets: clamp(Math.round(num(i.sets, 3)), 1, 40), lo, hi: clamp(Math.round(num(i.hi, lo)), lo, 100) };
    if (num(i.rest, null) !== null) it.rest = clamp(Math.round(+i.rest), 15, 600);
    return it;
  });
  const muscleTarget = clamp(num(o.muscleTarget, 15), 0, 60);
  // Plans from version 1 have one weekly target for every muscle; convert it to sets per month.
  const targets = Object.assign(Object.fromEntries(Object.keys(muscles).map(k => [k, Math.round(muscleTarget * MONTH / 7)])), muscleMap(o.targets, 0, 400));
  const focus = Object.assign(Object.fromEntries(Object.keys(muscles).map(k => [k, 0])), muscleMap(o.focus, 0, 1));
  return { type: 'plan', schema: 2, id: str(o.id, 60), version: Math.max(1, Math.floor(num(o.version, 1))), name: str(o.name, 80) || o.id, created: str(o.created, 30), muscleTarget, muscles, targets, focus, items };
}
function validLog(o) {
  if (!o || !/^[A-Za-z0-9-]{1,40}$/.test(o.id || '') || !ID_RE.test(o.ex || '') || !Number.isFinite(+o.t)) throw new Error('not a valid set record');
  return { type: 'log', schema: 1, id: o.id, ex: o.ex, w: clamp(num(o.w, 0), 0, 5000), unit: o.unit === 'kg' ? 'kg' : 'lb', r: clamp(Math.round(num(o.r, 0)), 0, 500), t: +o.t, plan: str(o.plan, 60), edited: Number.isFinite(+o.edited) ? +o.edited : undefined };
}

// Rebuild figure SVG from a whitelist of drawing elements and attributes, so an imported file can't run code.
const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set(['svg', 'g', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'rect', 'path', 'text']);
const SVG_ATTRS = new Set(['viewBox', 'class', 'role', 'aria-label', 'x1', 'y1', 'x2', 'y2', 'points', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'x', 'y', 'width', 'height', 'stroke-width', 'text-anchor', 'fill', 'transform']);
function cleanSVG(src) {
  if (!src) return null;
  let doc;
  try { doc = new DOMParser().parseFromString(src, 'image/svg+xml'); } catch (e) { return null; }
  const root = doc.documentElement;
  if (!root || root.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) return null;
  const copy = n => {
    if (n.nodeType === 3) return document.createTextNode(n.nodeValue);
    if (n.nodeType !== 1 || !SVG_TAGS.has(n.localName)) return null;
    const e = document.createElementNS(SVG_NS, n.localName);
    for (const a of Array.from(n.attributes)) {
      const v = a.value;
      if (SVG_ATTRS.has(a.name) && !/javascript:|url\(|expression\(/i.test(v)) e.setAttribute(a.name, v);
      else if (a.name === 'style' && /^max-width:\s*\d+(\.\d+)?px;?$/.test(v.trim())) e.setAttribute('style', v.trim());
    }
    for (const c of Array.from(n.childNodes)) { const k = copy(c); if (k) e.appendChild(k); }
    return e;
  };
  return copy(root);
}

// ---------------------------------------------------------------- zip (export = stored, import = stored or deflate)
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
})();
function zipStore(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  let offset = 0;
  const now = new Date();
  const dt = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF;
  const dd = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
  for (const f of files) {
    const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = CRC(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, dt, true); h.setUint16(12, dd, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true);
    h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint16(10, 0, true); c.setUint16(12, dt, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((a, b) => a + b.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
  e.setUint32(12, cdSize, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/zip' });
}
async function unzip(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(buf), dec = new TextDecoder();
  let eo = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eo = i; break; }
  if (eo < 0) throw new Error('not a zip file');
  const n = dv.getUint16(eo + 10, true);
  let p = dv.getUint32(eo + 16, true);
  const out = [];
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('damaged zip file');
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (name.endsWith('/') || !name.toLowerCase().endsWith('.json')) continue;
    const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
    let data = u8.subarray(start, start + csize);
    if (method === 8) {
      if (typeof DecompressionStream === 'undefined') throw new Error('this browser can\'t unpack compressed zips');
      data = new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    } else if (method !== 0) throw new Error('unsupported zip compression');
    out.push({ name, text: dec.decode(data) });
  }
  return out;
}

// ---------------------------------------------------------------- state
const S = {
  ex: new Map(), plans: new Map(), plan: null, logs: [],
  ramp: 1, view: 'workout', cur: null, inputs: {}, editing: null, armed: null, rest: {}, goalSel: 'all', goalRange: 90,
  targets: {}, focus: {}, pool: null, hidden: new Set(), libVersion: 0, est: null, rank: null, libQ: '', openMus: new Set(),
  slot: null, picks: {}, dyDays: 1, beepVol: 100,
};
const DY_OPTS = [1, 2, 3, 4, 5];   // days in the DY window of the header counter
const volOk = v => Number.isInteger(v) && v >= 5 && v <= 100 && v % 5 === 0;   // beep peak, % of full scale
const volLabel = v => `${v}% (${v === 100 ? '0' : '−' + (-20 * Math.log10(v / 100)).toFixed(1)} dB)`;
function validPool(p) {
  const d = { levels: { beginner: true, intermediate: true, expert: false }, equip: {} };
  if (!p || typeof p !== 'object') return d;
  for (const l of LEVELS) if (p.levels && typeof p.levels[l] === 'boolean') d.levels[l] = p.levels[l];
  for (const k of Object.keys(EQUIP)) if (p.equip && p.equip[k] === false) d.equip[k] = false;
  return d;
}
const validHidden = a => (Array.isArray(a) ? a : []).filter(x => typeof x === 'string' && ID_RE.test(x)).slice(0, 2000);
S.pool = validPool(null);
async function loadAll() {
  const [ex, plans, logs, meta] = await Promise.all([DB.all('exercises'), DB.all('plans'), DB.all('logs'), DB.all('meta')]);
  const norm = (fn, o) => { try { return fn(o); } catch (e) { return null; } };   // older stored records gain the newer fields
  S.ex = new Map(ex.map(e => norm(validExercise, e)).filter(Boolean).map(e => [e.id, e]));
  S.plans = new Map(plans.map(p => norm(validPlan, p)).filter(Boolean).map(p => [p.id, p]));
  S.logs = logs.sort((a, b) => a.t - b.t);
  const m = Object.fromEntries(meta.map(r => [r.k, r.v]));
  S.ramp = [0.5, 0.75, 1].includes(m.ramp) ? m.ramp : 1;
  S.seenVersion = m.appVersion || null;
  S.rest = {}; for (const [k, r] of Object.entries(m.rest || {})) if (r && r.end > Date.now()) S.rest[k] = r;
  S.plan = S.plans.get(m.currentPlan) || [...S.plans.values()].sort((a, b) => String(b.created).localeCompare(String(a.created)))[0] || null;
  S.targets = muscleMap(m.targets, 0, 400);
  S.focus = muscleMap(m.focus, 0, 1);
  S.pool = validPool(m.pool);
  S.hidden = new Set(validHidden(m.hidden));
  S.libVersion = Number.isInteger(m.libVersion) ? m.libVersion : 0;
  S.sound = m.sound !== false;
  S.dyDays = DY_OPTS.includes(m.dyDays) ? m.dyDays : 1;
  S.beepVol = volOk(m.beepVol) ? m.beepVol : 100;
  S.picks = m.picks && m.picks.day === dayKey(new Date()) && typeof m.picks.p === 'object' ? m.picks.p : {};   // exercise choices last for the day
}
function setPick(m, id) { S.picks[m] = id; setMeta('picks', { day: dayKey(new Date()), p: S.picks }); }
const setMeta = (k, v) => DB.put('meta', { k, v }).catch(e => console.warn(e));

// week window
// rolling windows of whole days, today included
const daysBack = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (n - 1)); return d.getTime(); };
const countSince = t => { let n = 0; for (let i = S.logs.length - 1; i >= 0 && S.logs[i].t >= t; i--) n++; return n; };
// Header counter: sets in the last 7 days against the weekly set estimate, and how many sets today would bring
//   d: the last N days (N = S.dyDays, today included) up to N days' share of the weekly target (target ÷ 7 × N)
//   x: the last 7 days up to the weekly target
//   y: the 30-day average (the same window as the Goals 30-day line, so shorter until you have a month of history) up to it
function setTotals() {
  const W = S.plan ? estimate().sets : 0;
  const sum7 = countSince(daysBack(7));
  const first = S.logs.length ? new Date(S.logs[0].t).setHours(0, 0, 0, 0) : Date.now();
  const span = Math.max(7, Math.min(30, Math.round((daysBack(1) - first) / DAY) + 1));
  const sumSpan = countSince(daysBack(span));
  const N = S.dyDays, sumN = countSince(daysBack(N));
  const goal = n => Math.ceil(W * n / 7 - 1e-9);   // whole sets; the epsilon keeps 58 × 7 ÷ 7 from rounding up to 59
  const gN = goal(N), g7 = goal(7), gS = goal(span);
  return { W, sum7, span, sumSpan, N, sumN, gN, g7, gS, d: Math.max(0, gN - sumN), x: Math.max(0, g7 - sum7), y: Math.max(0, gS - sumSpan) };
}
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
const countToday = exId => { const t0 = startOfToday(); let n = 0; for (let i = S.logs.length - 1; i >= 0 && S.logs[i].t >= t0; i--) n += S.logs[i].ex === exId; return n; };

// ---------------------------------------------------------------- muscles, targets and the exercise pool
const muscleList = () => Object.entries((S.plan && S.plan.muscles) || {});
function muscleName(k) { return (S.plan && S.plan.muscles && S.plan.muscles[k]) || k; }
const shortMuscle = k => muscleName(k).replace(/ \(.+\)/, '');
const planTarget = m => (S.plan && S.plan.targets && S.plan.targets[m]) || 0;
const planFocus = m => (S.plan && S.plan.focus && S.plan.focus[m]) || 0;
const targetMonth = m => S.targets[m] != null ? S.targets[m] : planTarget(m);
const focusShare = m => S.focus[m] != null ? S.focus[m] : planFocus(m);
const targetWeek = m => targetMonth(m) * 7 / MONTH * S.ramp;
function inPool(e) {
  if (S.hidden.has(e.id) || !Object.keys(e.credit).length) return false;
  if (!e.reviewed) return false;               // only hand-reviewed exercises are ever suggested
  if (S.pool.levels[e.level] === false) return false;
  return S.pool.equip[e.equip] !== false;
}
const changed = () => { S.est = null; S.rank = null; S.prio = null; };

// ---------------------------------------------------------------- the ranking engine
// Per muscle, from the logged sets (credit 1 = a full, focused set for that muscle; 0.5 = a partial set):
//   avg     sets per week over the last 30 days (or since the first log, but never less than 7 days): same as the Goals 30-day line
//   avgDir  the same, counting only full (focused) sets
//   eff     effective volume = min(avg, avgDir / focus share): partial sets only count while enough focused sets back them,
//           so with a 60% minimum, 6 focused sets carry at most 10 sets in total
//   fat     recent load, each set decaying with an 18-hour time constant; readiness R = 1 − (fat / 6)³, so 0 at about 6 hard sets
// The value of one more set for a muscle = (gain in eff) × (target − eff) / target: worth most when far behind, nothing at target.
// When the focused share is short, a partial set gains nothing and a full set gains 1 / share (1.67 at 60%) until it recovers.
// Work on a muscle already at target costs a little (−0.15 per credit); work on a tired muscle costs more (−0.6 × (1 − R)).
// Exercise score = Σ over its muscles. Compounds win while several of their muscles are behind; once the big muscles are
// full, the remaining gaps (and focus requirements) belong to small muscles, so their isolation exercises rise to the top.
const OVER = 0.15, TIRED = 0.6, CAP = 6, FAT_TAU = 18 * 36e5;
const effOf = (L, D, p) => p > 0 ? Math.min(L, D / p) : L;
const STEADY = new Set(['machine', 'cable']);
function muscleState(now = Date.now()) {
  const st = {};
  for (const [k] of muscleList()) st[k] = { tot: 0, dir: 0, fat: 0 };
  let first = now;
  for (const l of S.logs) if (l.t <= now) { first = l.t; break; }
  const span = Math.max(7, Math.min(30, (now - first) / DAY)), from = now - span * DAY;
  for (let i = S.logs.length - 1; i >= 0; i--) {
    const l = S.logs[i];
    if (l.t > now) continue;
    if (l.t < from) break;
    const e = S.ex.get(l.ex); if (!e) continue;
    const decay = Math.exp(-(now - l.t) / FAT_TAU);
    for (const [m, c] of Object.entries(e.credit)) {
      const s = st[m]; if (!s) continue;
      s.tot += c; if (c >= 1) s.dir += 1; s.fat += c * decay;
    }
  }
  for (const [k, s] of Object.entries(st)) {
    const T = targetWeek(k), p = focusShare(k);
    s.T = T; s.p = p; s.k = 7 / span; s.avg = s.tot * s.k; s.avgDir = s.dir * s.k;
    s.eff = effOf(s.avg, s.avgDir, p);
    s.short = s.avg > s.eff + 1e-9;       // focused share below the minimum
    s.R = clamp(1 - Math.pow(s.fat / CAP, 3), 0, 1);
    s.open = T > 0 ? Math.max(0, T - s.eff) / T : 0;   // share of the target still open, for display
  }
  return st;
}
// value of one set that gives this muscle credit c (one set moves the 30-day average by k = 7 / span)
function creditValue(s, c) {
  let v = 0;
  if (s.T > 0) {
    const gap = s.T - s.eff;
    v = gap > 1e-9 ? (effOf(s.avg + c * s.k, s.avgDir + (c >= 1 ? s.k : 0), s.p) - s.eff) / s.k * gap / s.T : -OVER * c;
  }
  return (v > 0 ? v * s.R : v) - TIRED * c * (1 - s.R);
}
function scoreEx(e, st) {
  let s = 0;
  for (const [m, c] of Object.entries(e.credit)) if (st[m]) s += creditValue(st[m], c);
  return s;
}
const signature = e => Object.keys(e.credit).filter(m => e.credit[m] >= 1).sort().join('+') || 'partial';
function rank(now = Date.now()) {
  const st = muscleState(now), t0 = new Date(now).setHours(0, 0, 0, 0), last = new Map();
  for (const l of S.logs) if (l.t <= now) last.set(l.ex, l.t);
  const all = [];
  for (const e of S.ex.values()) {
    if (!inPool(e)) continue;
    let s = scoreEx(e, st);
    if (s <= 0.02) continue;
    const lt = last.get(e.id);
    // ties between exercises that do the same work: your original exercises (drawn figures), then common staples,
    // then simpler and machine/cable options; bands last (light, uneven resistance)
    s *= (e.source === 'weekly-pile' ? 1.05 : 1) * (e.common ? 1.04 : 1) * (e.level === 'beginner' ? 1.02 : e.level === 'expert' ? 0.95 : 1)
      * (STEADY.has(e.equip) ? 1.02 : e.equip === 'bands' ? 0.97 : 1);
    if (lt && now - lt < 28 * DAY) s *= 1.06;          // and ones you already know
    if (lt && lt >= t0 && now - lt < 6 * 36e5) s *= 1.05; // and the one you're in the middle of
    all.push({ e, s, last: lt });
  }
  all.sort((a, b) => b.s - a.s || a.e.name.localeCompare(b.e.name));
  // one row per group of exercises that give full sets to the same muscles; the rest are alternatives
  const groups = new Map();
  for (const r of all) { const k = signature(r.e); if (!groups.has(k)) groups.set(k, { top: r, alts: [] }); else groups.get(k).alts.push(r); }
  return { st, list: [...groups.values()], all };
}
const getRank = () => S.rank || (S.rank = rank());
// Sets per week needed to reach every target from zero, picking greedily like the engine (no fatigue), plus time with full rest.
function estimate() {
  if (S.est) return S.est;
  const keys = muscleList().map(([k]) => k), T = {}, P = {}, L = {}, D = {};
  for (const k of keys) { T[k] = targetWeek(k); P[k] = focusShare(k); L[k] = 0; D[k] = 0; }
  const reps = new Map();
  for (const e of S.ex.values()) if (inPool(e)) {
    const k = JSON.stringify(Object.entries(e.credit).sort());
    if (!reps.has(k) || (e.reviewed && !reps.get(k).reviewed)) reps.set(k, e);
  }
  const pool = [...reps.values()];
  let n = 0, secs = 0;
  const val = (m, c) => {   // [score, effective sets gained]
    if (!(T[m] > 0)) return [0, 0];
    const eff = effOf(L[m], D[m], P[m]), gap = T[m] - eff;
    if (gap <= 1e-9) return [-OVER * c, 0];
    const d = effOf(L[m] + c, D[m] + (c >= 1 ? 1 : 0), P[m]) - eff;
    return [d * gap / T[m], Math.min(d, gap)];
  };
  while (n < 600) {
    let best = null, bs = 0, bf = 0;
    for (const e of pool) {
      let s = 0, f = 0;
      for (const [m, c] of Object.entries(e.credit)) { const [v, fill] = val(m, c); s += v; f += fill; }
      if (s > bs) { bs = s; bf = f; best = e; }
    }
    if (!best || bf < 0.5) break;
    for (const [m, c] of Object.entries(best.credit)) if (m in L) { L[m] += c; if (c >= 1) D[m] += 1; }
    n++; secs += best.rest + 40;
  }
  return (S.est = { sets: n, hours: secs / 3600 });
}

// ---------------------------------------------------------------- import / export
async function readFiles(files) {
  const entries = [];
  for (const f of files) {
    if (f.size > 25e6) throw new Error(`${f.name} is too large`);
    const buf = await f.arrayBuffer();
    const isZip = new DataView(buf).byteLength > 4 && new DataView(buf).getUint32(0, true) === 0x04034b50;
    if (isZip) for (const z of await unzip(buf)) entries.push({ name: z.name, text: z.text });
    else entries.push({ name: f.name, text: new TextDecoder().decode(buf) });
  }
  return entries;
}
function classify(entries) {
  const got = { exercises: [], plans: [], logs: [], settings: null, errors: [] };
  const take = (o, name) => {
    if (!o || typeof o !== 'object') throw new Error('empty file');
    switch (o.type) {
      case 'exercise': got.exercises.push(validExercise(o)); break;
      case 'plan': got.plans.push(validPlan(o)); break;
      case 'log': got.logs.push(validLog(o)); break;
      case 'settings': got.settings = {
        ramp: [0.5, 0.75, 1].includes(o.ramp) ? o.ramp : null, currentPlan: str(o.currentPlan, 60), dyDays: DY_OPTS.includes(o.dyDays) ? o.dyDays : null,
        beepVol: volOk(o.beepVol) ? o.beepVol : null,
        targets: o.targets ? muscleMap(o.targets, 0, 400) : null, focus: o.focus ? muscleMap(o.focus, 0, 1) : null,
        pool: o.pool ? validPool(o.pool) : null, hidden: Array.isArray(o.hidden) ? validHidden(o.hidden) : null,
      }; break;
      case 'bundle':
        for (const x of [...(o.exercises || []), ...(o.plans || (o.plan ? [o.plan] : [])), ...(o.logs || [])]) {
          try { take(x, name); } catch (err) { got.errors.push(`${name} (${x && x.id}): ${err.message}`); }
        }
        break;
      case 'library-index': break;
      default: throw new Error('unknown file type');
    }
  };
  for (const e of entries) {
    try { take(JSON.parse(e.text), e.name); } catch (err) { got.errors.push(`${e.name}: ${err.message}`); }
  }
  return got;
}
async function applyImport(got, { makeCurrent = true } = {}) {
  const sum = { newEx: 0, updEx: 0, sameEx: 0, plans: 0, logs: 0, current: null, errors: got.errors };
  const exPut = [];
  for (const e of got.exercises) {
    const have = S.ex.get(e.id);
    if (!have) { sum.newEx++; exPut.push(e); }
    else if (e.version > have.version) { sum.updEx++; exPut.push(e); }
    else sum.sameEx++;
  }
  if (exPut.length) { await DB.putMany('exercises', exPut); exPut.forEach(e => S.ex.set(e.id, e)); }
  const changedPlans = got.plans.filter(p => !S.plans.has(p.id) || p.version > (S.plans.get(p.id).version || 1));
  if (changedPlans.length) {
    await DB.putMany('plans', changedPlans); changedPlans.forEach(p => S.plans.set(p.id, p)); sum.plans = changedPlans.length;
    if (S.plan && S.plans.get(S.plan.id) !== S.plan) S.plan = S.plans.get(S.plan.id);   // current plan was updated in place
  }
  let pick = got.settings && got.settings.currentPlan && S.plans.get(got.settings.currentPlan);
  if (!pick && makeCurrent && changedPlans.length) pick = changedPlans[changedPlans.length - 1];
  if (pick && (!S.plan || S.plan.id !== pick.id)) { S.plan = pick; await setMeta('currentPlan', pick.id); sum.current = pick.name; }
  else if (pick && changedPlans.includes(pick)) sum.current = pick.name;
  if (got.logs.length) {
    await DB.putMany('logs', got.logs);
    const m = new Map(S.logs.map(l => [l.id, l])); got.logs.forEach(l => m.set(l.id, l));
    S.logs = [...m.values()].sort((a, b) => a.t - b.t); sum.logs = got.logs.length;
  }
  const st = got.settings;
  if (st) {
    if (st.ramp) { S.ramp = st.ramp; await setMeta('ramp', S.ramp); }
    if (st.dyDays) { S.dyDays = st.dyDays; await setMeta('dyDays', S.dyDays); }
    if (st.beepVol) { S.beepVol = st.beepVol; await setMeta('beepVol', S.beepVol); }
    if (st.targets) { S.targets = st.targets; await setMeta('targets', S.targets); }
    if (st.focus) { S.focus = st.focus; await setMeta('focus', S.focus); }
    if (st.pool) { S.pool = st.pool; await setMeta('pool', S.pool); }
    if (st.hidden) { S.hidden = new Set(st.hidden); await setMeta('hidden', [...S.hidden]); }
  }
  changed();
  return sum;
}
function describe(sum) {
  const bits = [];
  if (sum.newEx) bits.push(`${sum.newEx} new exercise${sum.newEx > 1 ? 's' : ''}`);
  if (sum.updEx) bits.push(`${sum.updEx} updated`);
  if (sum.current) bits.push(`plan "${sum.current}" loaded`);
  else if (sum.plans) bits.push(`${sum.plans} plan${sum.plans > 1 ? 's' : ''} saved`);
  if (sum.logs) bits.push(`${sum.logs} set${sum.logs > 1 ? 's' : ''}`);
  if (sum.removed) bits.push(`${sum.removed} removed`);
  if (sum.retired) bits.push(`${sum.retired} retired (kept for your history)`);
  if (!bits.length) bits.push(sum.sameEx ? 'Everything was already up to date' : 'Nothing to import');
  return bits.join(', ') + (sum.errors.length ? ` · ${sum.errors.length} item${sum.errors.length > 1 ? 's' : ''} skipped` : '');
}
async function fetchText(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${url} (${r.status})`);
  return r.text();
}
const fetchJSON = async url => JSON.parse(await fetchText(url));
async function getLatest() {
  const idx = await fetchJSON('content/index.json');
  if (!idx || idx.type !== 'library-index' || !Array.isArray(idx.exercises)) throw new Error('library index is damaged');
  const want = idx.exercises.filter(e => e && ID_RE.test(e.id || '') && /^exercises\/[a-z0-9_-]+\.json$/.test(e.file || '') && (!S.ex.has(e.id) || S.ex.get(e.id).version < +e.version));
  const entries = await Promise.all(want.map(async e => ({ name: e.file, text: await fetchText('content/' + e.file) })));
  if (/^[a-z0-9_-]+\.json$/.test(idx.plan || '')) entries.push({ name: idx.plan, text: await fetchText('content/' + idx.plan) });
  const lib = idx.library;
  let libV = 0, libIds = null;
  if (lib && /^[a-z0-9_-]+\.json$/.test(lib.file || '') && Number.isInteger(+lib.version) && +lib.version > S.libVersion) {
    const text = await fetchText('content/' + lib.file);
    entries.push({ name: lib.file, text });
    libV = +lib.version;
    try { const b = JSON.parse(text); if (b && Array.isArray(b.exercises)) libIds = new Set(b.exercises.map(e => e && e.id)); } catch (e) {}
  }
  const sum = await applyImport(classify(entries), { makeCurrent: true });
  if (libV) {
    S.libVersion = libV; await setMeta('libVersion', libV);
    // Database exercises that are unreviewed or no longer in the reviewed library are removed, except ones you've
    // logged sets on: those stay for your history, marked unreviewed so they're never suggested.
    const logged = new Set(S.logs.map(l => l.ex));
    const gone = [...S.ex.values()].filter(e => e.source === 'free-exercise-db' && (!e.reviewed || (libIds && !libIds.has(e.id))));
    const drop = gone.filter(e => !logged.has(e.id)).map(e => e.id);
    const retire = gone.filter(e => logged.has(e.id) && e.reviewed).map(e => ({ ...e, reviewed: false }));
    if (drop.length) { await DB.delMany('exercises', drop); drop.forEach(id => S.ex.delete(id)); sum.removed = drop.length; }
    if (retire.length) { await DB.putMany('exercises', retire); retire.forEach(e => S.ex.set(e.id, e)); sum.retired = retire.length; }
    if (drop.length || retire.length) changed();
  }
  return sum;
}
function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
}
function exportAll() {
  const stamp = dayKey(new Date());
  const dir = `weekly-pile-${stamp}/`;
  const files = [];
  const j = o => JSON.stringify(o, null, 1) + '\n';
  if (S.plan) files.push({ name: dir + 'plan.json', data: j(S.plan) });
  for (const p of S.plans.values()) if (!S.plan || p.id !== S.plan.id) files.push({ name: dir + 'plans/' + p.id.replace(/[^A-Za-z0-9_-]/g, '_') + '.json', data: j(p) });
  for (const e of S.ex.values()) files.push({ name: dir + 'exercises/' + e.id + '.json', data: j(e) });
  for (const l of S.logs) {
    const d = new Date(l.t);
    files.push({ name: dir + `logs/${dayKey(d)}_${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}_${l.ex}_${l.id}.json`, data: j(l) });
  }
  files.push({ name: dir + 'settings.json', data: j({ type: 'settings', schema: 2, ramp: S.ramp, dyDays: S.dyDays, beepVol: S.beepVol, currentPlan: S.plan ? S.plan.id : '', targets: S.targets, focus: S.focus,
    pool: S.pool, hidden: [...S.hidden], exported: new Date().toISOString(), app: APP_VERSION }) });
  download(zipStore(files), `weekly-pile-${stamp}.zip`);
  toast(`Exported ${S.logs.length} set${S.logs.length === 1 ? '' : 's'}, ${S.ex.size} exercises`);
}

// ---------------------------------------------------------------- logging + editing
function lastLog(exId) { for (let i = S.logs.length - 1; i >= 0; i--) if (S.logs[i].ex === exId) return S.logs[i]; return null; }
const itFor = e => ({ ex: e.id, lo: e.lo || 8, hi: e.hi || 12, rest: e.rest || 120 });
function inputsFor(it) {
  if (!S.inputs[it.ex]) { const l = lastLog(it.ex); S.inputs[it.ex] = { w: l ? l.w : 0, r: l ? l.r : it.lo }; }
  return S.inputs[it.ex];
}
// PRs per exercise: heaviest weight, and best set energy = weight × reps.
// With an exercise's range of motion fixed, weight × reps is proportional to the work done in the set.
// A set is flagged only when it beats an earlier set, so the first set of an exercise is the baseline.
function prScan() {
  const best = new Map(), flags = new Map();
  for (const l of S.logs) {
    const en = l.w * l.r, b = best.get(l.ex);
    if (!b) { best.set(l.ex, { w: l.w, wl: l, e: en, el: l }); continue; }
    const f = {};
    if (l.w > b.w) { f.w = true; b.w = l.w; b.wl = l; }
    if (en > b.e) { f.e = true; b.e = en; b.el = l; }
    if (f.w || f.e) flags.set(l.id, f);
  }
  return { best, flags };
}
const fmtE = n => Math.round(n).toLocaleString();

// Rest timers, one per exercise, kept as start/end timestamps so they survive navigation, reloads and a locked screen.
const restSecs = it => { const e = S.ex.get(it.ex); return it.rest || (e && e.rest) || 120; };
const fmtClock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${pad2(s % 60)}`; };
let restIv = null, wake = null;
function startRest(it) {
  const now = Date.now();
  S.rest[it.ex] = { start: now, end: now + restSecs(it) * 1000 };
  setMeta('rest', S.rest);
  tickRest();
}
function stopRest(exId) { delete S.rest[exId]; setMeta('rest', S.rest); tickRest(); }
async function holdScreen(on) {
  try {
    if (on && !wake && navigator.wakeLock && document.visibilityState === 'visible') { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
    if (!on && wake) { const w = wake; wake = null; await w.release(); }
  } catch (e) { wake = null; }
}
// Two beeps when a rest ends, a perfect fifth apart (880 Hz, then 1320 Hz = 3:2), starting 0.3 s apart. Each is a pure
// sine with a 5 ms linear attack (short, but long enough not to click) and an exponential fade of 80 dB by 0.7 s.
// The peak is the volume setting, as a share of full scale (100% = 1.0). The first tone is still ringing at −34 dB
// when the second starts, so the second peaks that much lower (−0.18 dB) and the two together never pass the setting.
// It plays through headphones when they're connected. Browsers only allow sound after a tap, so the audio is
// unlocked on the first tap (and on every Log tap); a page in the background can't play it.
let actx = null;
function audioUnlock() {
  try {
    if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) actx = new AC(); }
    if (actx && actx.state === 'suspended') actx.resume();
  } catch (e) { actx = null; }
}
const BEEP = { f: 880, ratio: 3 / 2, gap: 0.3, att: 0.005, dur: 0.7 };
function tone(f, t, peak) {
  const o = actx.createOscillator(), g = actx.createGain(), B = BEEP;
  o.type = 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + B.att);
  g.gain.exponentialRampToValueAtTime(peak * 1e-4, t + B.dur);   // −80 dB, the same shape at any volume
  o.connect(g); g.connect(actx.destination);
  o.start(t); o.stop(t + B.dur + 0.05);
}
function beep() {
  if (!S.sound || !actx) return;
  try {
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime + 0.03, v = S.beepVol / 100, B = BEEP;
    const tail = Math.pow(1e-4, (B.gap - B.att) / (B.dur - B.att));   // first tone's level when the second starts
    tone(B.f, t, v);
    tone(B.f * B.ratio, t + B.gap, v * (1 - tail));
  } catch (e) {}
}
function tickRest() {
  const now = Date.now(), finished = [];
  let late = true;
  for (const [ex, r] of Object.entries(S.rest)) if (r.end <= now) { finished.push(ex); if (now - r.end < 5000) late = false; delete S.rest[ex]; }
  if (finished.length) {
    setMeta('rest', S.rest);
    if (!late) beep();          // no beep for a rest that ended while the app was in the background
    if (navigator.vibrate) try { navigator.vibrate([250, 120, 250]); } catch (e) {}
    const names = finished.map(x => (S.ex.get(x) || {}).short || x).join(', ');
    toast(`Rest done · ${names}`, 3000);
    if (S.view === 'workout') renderWorkout();
  }
  for (const el of document.querySelectorAll('[data-rest]')) { const r = S.rest[el.dataset.rest]; if (r) el.textContent = 'Rest ' + fmtClock(r.end - now); }
  const r = S.cur && S.rest[S.cur], bar = $('#restBar');
  if (r && bar) {
    bar.querySelector('i').style.width = (clamp((now - r.start) / (r.end - r.start), 0, 1) * 100).toFixed(1) + '%';
    bar.querySelector('.rl').textContent = 'Rest ' + fmtClock(r.end - now);
  }
  const active = Object.keys(S.rest).length > 0;
  if (active && !restIv) restIv = setInterval(tickRest, 250);
  if (!active && restIv) { clearInterval(restIv); restIv = null; }
  holdScreen(active);
}

async function addLog(rec) {
  const l = validLog(rec);
  await DB.put('logs', l);
  S.logs.push(l); S.logs.sort((a, b) => a.t - b.t);
  if (S.logs.length === 1 && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  changed();
  return l;
}
async function logSet(it) {
  audioUnlock();
  const inp = inputsFor(it);
  if (!(inp.r > 0)) { toast('Enter the reps first'); return; }
  const e = S.ex.get(it.ex);
  const before = prScan().best.get(it.ex);
  const w = +inp.w || 0;
  try {
    await addLog({ id: newId(), ex: it.ex, w, unit: e ? e.unit : 'lb', r: inp.r, t: Date.now(), plan: S.plan ? S.plan.id : '' });
  } catch (err) { toast('Couldn\'t save that set: ' + err.message, 4000); return; }
  const pr = [];
  if (before && w > before.w) pr.push(`weight ${fmtW(w)} ${e ? e.unit : 'lb'}`);
  if (before && w * inp.r > before.e) pr.push(`energy ${fmtE(w * inp.r)}`);
  toast(pr.length ? `New PR: ${pr.join(' and ')}` : `Logged ${e && e.timed ? inp.r + ' s' : fmtW(w) + ' × ' + inp.r} · ${countToday(it.ex)} today`, pr.length ? 3500 : 2400);
  if (S.slot && e && e.credit[S.slot] >= 1 && S.picks[S.slot] !== it.ex) setPick(S.slot, it.ex);
  startRest(it);
  render();
}
function openEditor(log, presetEx) {
  S.editing = log ? log.id : null; S.armed = null;
  const sel = $('#edEx');
  const exs = [...S.ex.values()].sort((a, b) => a.name.localeCompare(b.name));
  sel.innerHTML = exs.map(e => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('');
  const d = new Date(log ? log.t : Date.now());
  const recent = S.logs.length ? S.logs[S.logs.length - 1].ex : null;
  const ex = log ? log.ex : (presetEx || S.cur || recent || (exs[0] || {}).id);
  if (ex && !S.ex.has(ex)) sel.insertAdjacentHTML('afterbegin', `<option value="${esc(ex)}">${esc(ex)} (not in library)</option>`);
  sel.value = ex || '';
  const last = log || (ex && lastLog(ex));
  $('#edW').value = last ? fmtW(last.w) : '';
  $('#edR').value = last ? last.r : '';
  $('#edDate').value = dayKey(d);
  $('#edTime').value = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  $('#editTitle').textContent = log ? 'Edit set' : 'Add a set';
  $('#edDel').hidden = !log;
  $('#edDel').classList.remove('arm'); $('#edDel').textContent = 'Delete';
  $('#editDlg').showModal();
}
async function saveEditor(ev) {
  ev.preventDefault();
  const [y, mo, da] = $('#edDate').value.split('-').map(Number);
  const [hh, mm] = ($('#edTime').value || '00:00').split(':').map(Number);
  const t = new Date(y, mo - 1, da, hh, mm, 0).getTime();
  if (!Number.isFinite(t)) { toast('Check the date and time'); return; }
  const old = S.editing ? S.logs.find(l => l.id === S.editing) : null;
  const exId = $('#edEx').value;
  const e = S.ex.get(exId);
  const rec = { id: old ? old.id : newId(), ex: exId, w: +$('#edW').value || 0, unit: e ? e.unit : (old ? old.unit : 'lb'), r: Math.round(+$('#edR').value || 0),
    t: old && Math.abs(old.t - t) < 60000 ? old.t : t, plan: old ? old.plan : (S.plan ? S.plan.id : ''), edited: old ? Date.now() : undefined };
  try {
    const l = validLog(rec);
    await DB.put('logs', l);
    S.logs = S.logs.filter(x => x.id !== l.id).concat(l).sort((a, b) => a.t - b.t);
  } catch (err) { toast('Couldn\'t save: ' + err.message, 4000); return; }
  changed();
  $('#editDlg').close();
  toast(old ? 'Set updated' : 'Set added');
  render();
}
async function deleteEditing() {
  const b = $('#edDel');
  if (!b.classList.contains('arm')) { b.classList.add('arm'); b.textContent = 'Tap again to delete'; return; }
  const id = S.editing;
  try { await DB.del('logs', id); } catch (err) { toast('Couldn\'t delete: ' + err.message, 4000); return; }
  S.logs = S.logs.filter(l => l.id !== id);
  changed();
  $('#editDlg').close();
  toast('Set deleted');
  render();
}

// ---------------------------------------------------------------- navigation: priorities are muscles, one page each
// The Workout tab walks the 10 muscles that most need a full set right now (value of a focused set, which already
// accounts for the focus minimum and for recent fatigue). Each page shows the best exercise for that muscle, scored with
// everything else it trains, plus up to three alternatives that work it with a different emphasis.
// The page you're on stays put while you log; the order re-sorts after every set.
const TOP = 10;
const primaryOf = e => Object.keys(e.credit).filter(m => e.credit[m] >= 1);
const altKey = (e, m) => e.variant || Object.keys(e.credit).filter(k => k !== m && e.credit[k] < 1).sort().join('+') || 'only';
function muscleSlot(m, R, used) {
  const s = R.st[m];
  const opts = R.all.filter(r => r.e.credit[m] >= 1);
  const pickId = S.picks[m], pickEx = pickId && S.ex.get(pickId);
  let ex = pickEx && inPool(pickEx) && pickEx.credit[m] >= 1 ? pickEx : null;
  if (!ex) { const r = opts.find(r => !used || !used.has(r.e.id)) || opts[0]; ex = r ? r.e : null; }
  if (!ex) return null;
  // alternatives: a different emphasis each (or different other muscles), best scored first
  const seen = new Set([altKey(ex, m)]), alts = [];
  for (const r of opts) { if (alts.length >= 3) break; if (r.e.id === ex.id || seen.has(altKey(r.e, m))) continue; seen.add(altKey(r.e, m)); alts.push(r.e); }
  for (const r of opts) { if (alts.length >= 3) break; if (r.e.id !== ex.id && !alts.includes(r.e) && !alts.some(x => x.equip === r.e.equip && altKey(x, m) === altKey(r.e, m))) alts.push(r.e); }
  return { m, s, ex, alts, v: s ? creditValue(s, 1) : 0 };
}
function priorities() {
  const R = getRank(), list = [];
  for (const [m] of muscleList()) {
    const s = R.st[m];
    if (!s || s.T <= 0) continue;
    const v = creditValue(s, 1);
    const best = R.all.find(r => r.e.credit[m] >= 1);
    if (v > 0.02 && best) list.push({ m, v, tie: best.s });
  }
  list.sort((a, b) => b.v - a.v || b.tie - a.tie);
  S.order = list.map(x => x.m);          // every muscle that still needs work, best first
  const used = new Set();
  return list.slice(0, TOP).map(({ m }) => { const sl = muscleSlot(m, R, used); if (sl) used.add(sl.ex.id); return sl; }).filter(Boolean);
}
function currentSlot() {
  const P = S.prio || (S.prio = priorities());
  if (!S.slot) S.slot = P[0] ? P[0].m : null;
  if (!S.slot) return null;
  return P.find(x => x.m === S.slot) || muscleSlot(S.slot, getRank(), null);
}
function showSlot(m, anim) { S.slot = m; S.view = 'workout'; render(anim); window.scrollTo({ top: 0 }); }
function openEx(id) {           // from the library: show it as the way to work its main muscle
  const e = S.ex.get(id); if (!e) return;
  const m = primaryOf(e)[0]; if (!m) return;
  setPick(m, id); showSlot(m, null);
}
function go(dir) {
  const P = S.prio || (S.prio = priorities()); if (!P.length) return;
  const i = P.findIndex(x => x.m === S.slot);
  if (i < 0) { showSlot(P[0].m, 'in-r'); return; }
  const j = i + dir;
  if (j < 0) { toast('This is the top priority'); return; }
  if (j >= P.length) { toast(`That's #${P.length}, the last of the top ${TOP}`); return; }
  showSlot(P[j].m, dir > 0 ? 'in-r' : 'in-l');
}
function renderJump() {
  const P = S.prio || priorities();
  $('#jumpList').innerHTML = P.map((x, i) => {
    const n = countToday(x.ex.id), rest = S.rest[x.ex.id];
    const sub = rest && rest.end > Date.now() ? `<span class="rb num" data-rest="${esc(x.ex.id)}">Rest ${fmtClock(rest.end - Date.now())}</span>` : n ? `${n} today` : '';
    return `<li><button type="button" data-jump="${esc(x.m)}" aria-current="${x.m === S.slot}"><span class="n num">${i + 1}</span><span class="jb"><b>${esc(shortMuscle(x.m))}</b> <span class="muted num">${Math.round(x.s.open * 100)}% open${x.s.short ? ' · needs focused' : ''}</span><span class="muted">${esc(x.ex.name)}</span></span><span class="c num">${sub}</span></button></li>`;
  }).join('') || '<li class="muted">Nothing to suggest right now.</li>';
}

// ---------------------------------------------------------------- rendering
// Popup behind the header counter: each number as window · done · goal · need (goal rounded up, so need = goal − done)
function renderNeed() {
  const T = setTotals(), win = n => n === 1 ? 'Today' : `Last ${n} days`;
  const rows = [['DY', win(T.N), T.sumN, T.gN, T.d], ['WK', 'Last 7 days', T.sum7, T.g7, T.x], ['MO', win(T.span), T.sumSpan, T.gS, T.y]].map(([k, w, done, goal, need]) => {
    return `<tr><th scope="row">${k}</th><td>${esc(w)}</td><td class="num">${done}</td><td class="num">${goal}</td><td class="num nd${need ? '' : ' met'}">${need || '✓'}</td></tr>`;
  }).join('');
  $('#needBody').innerHTML = `
    <table class="ntab"><thead><tr><th></th><th>Window</th><th>Done</th><th>Goal</th><th>Need</th></tr></thead><tbody>${rows}</tbody></table>
    <ul class="nnotes muted">
      <li>Weekly target: <b class="num">${T.W}</b> sets${S.ramp < 1 ? ` (${S.ramp * 100}% scale)` : ''}. Goal = ${T.W} ÷ 7 × days in the window, rounded up.</li>
      <li>DY window: ${T.N} day${T.N === 1 ? '' : 's'} (set on the Plan page).</li>
      ${T.span < 30 ? `<li>MO covers 30 days once you have a month of history (${T.span} days so far).</li>` : ''}
    </ul>`;
}
function renderHeader() {
  const T = setTotals();
  const n = v => `<b class="nv${v ? '' : ' z'}">${v}</b>`, sl = '<i>/</i>';
  $('#need').innerHTML = !T.W ? '' : n(T.d) + sl + n(T.x) + sl + n(T.y) + '<span>DY</span>' + sl + '<span>WK</span>' + sl + '<span>MO</span>';
  $('#totBar').style.width = (T.W ? Math.min(100, T.sum7 / T.W * 100) : 0) + '%';
  const detail = S.view === 'workout' && S.plan && S.slot && S.cur && S.ex.has(S.cur);
  $('#pager').hidden = !detail;
  if (detail) {
    const P = S.prio || [], i = P.findIndex(x => x.m === S.slot), k = (S.order || []).indexOf(S.slot);
    $('#jumpBtn').textContent = (i >= 0 ? `${i + 1} / ${P.length}` : k >= 0 ? `#${k + 1}` : 'on target') + ' · ' + shortMuscle(S.slot);
    $('#prevBtn').disabled = i === 0;
    $('#nextBtn').disabled = i >= 0 && i >= P.length - 1;
  }
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === S.view)));
}
const ago = t => { const d = Math.floor((startOfToday() - new Date(t).setHours(0, 0, 0, 0)) / DAY + 0.5); return d <= 0 ? 'today' : d === 1 ? 'yesterday' : d < 14 ? `${d} days ago` : `${Math.round(d / 7)} weeks ago`; };
function chipHTML(m, c, s) {
  const v = s && s.T > 0 ? creditValue(s, c) / c : 0;
  const cls = v >= 0.5 ? 'h' : v >= 0.2 ? 'm' : v > 0.02 ? 'l' : 'z';
  return `<span class="mc ${cls}">${esc(shortMuscle(m))}${c < 1 ? ' ½' : ''}</span>`;
}
function renderWorkout(anim) {
  const page = $('#page');
  page.className = 'page';
  if (!S.plan) { page.innerHTML = S.loading ? '<div class="card empty">Loading the plan and exercise library from the site…</div>' : onboardingHTML(); return; }
  S.rank = rank(); S.prio = priorities();
  const slot = currentSlot();
  if (!slot) { S.cur = null; page.innerHTML = '<div class="card empty">Nothing to suggest: every target is met, or the Plan tab\'s filters leave no exercises.</div>'; return; }
  S.cur = slot.ex.id;
  renderDetail(slot, anim);
  prefetchPhotos(S.prio.flatMap(x => [x.ex, ...x.alts.slice(0, 1)]));
  if (anim && !matchMedia('(prefers-reduced-motion: reduce)').matches) { void page.offsetWidth; page.classList.add(anim); }
}
const imgURL = p => IMG_BASE + p.split('/').map(encodeURIComponent).join('/');
const prefetched = new Set();
function prefetchPhotos(exs) {
  if (navigator.onLine === false) return;
  for (const e of exs) for (const p of e.images || []) if (!prefetched.has(p)) { prefetched.add(p); const im = new Image(); im.crossOrigin = 'anonymous'; im.src = imgURL(p); }
}
function renderDetail(slot, anim) {
  const page = $('#page'), e = slot.ex, it = itFor(e), m = slot.m;
  const R = getRank(), st = R.st;
  const pos = (S.order || []).indexOf(m), ms = st[m];
  const why = !ms || ms.T <= 0 ? 'no target set' : ms.open <= 0.001 ? 'on target' : `${Math.round(ms.open * 100)}% of the weekly target open` + (ms.short ? ' · needs focused sets' : '') + (ms.R < 0.5 ? ' · worked hard in the last day' : '');
  const altHTML = slot.alts.length ? `<div class="alts"><h3>Other ways to work ${esc(shortMuscle(m).toLowerCase())}</h3>${slot.alts.map(a => {
    const others = Object.entries(a.credit).filter(([k]) => k !== m).sort((x, y) => y[1] - x[1]).map(([k, c]) => shortMuscle(k) + (c < 1 ? ' ½' : '')).join(', ');
    return `<button type="button" data-pick="${esc(a.id)}" data-m="${esc(m)}"><span class="an">${esc(a.name)}</span><span class="av">${esc(a.variant || (others ? '+ ' + others : 'Isolation'))}</span><span class="ae muted">${esc(EQUIP[a.equip] || '')}${a.variant && others ? ' · + ' + esc(others) : ''}</span></button>`;
  }).join('')}</div>` : '';
  const now = new Date(), tk = dayKey(now);
  const yd = new Date(now); yd.setDate(yd.getDate() - 1); const yk = dayKey(yd);
  const mine = S.logs.filter(l => l.ex === e.id);
  const today = mine.filter(l => dayKey(new Date(l.t)) === tk);
  const before = mine.filter(l => dayKey(new Date(l.t)) < tk);
  let prevDay = null, prevSets = [];
  if (before.length) { prevDay = dayKey(new Date(before[before.length - 1].t)); prevSets = before.filter(l => dayKey(new Date(l.t)) === prevDay); }
  const info = [];
  if (prevSets.length) {
    info.push(`<div>Last time (${esc(fmtDay(new Date(prevSets[0].t)))}): <span class="num">${prevSets.map(l => `${fmtW(l.w)}×${l.r}`).join(', ')}</span></div>`);
    if (!today.length) {
      if (prevSets.every(l => l.r >= it.hi)) info.push(`<div class="hint up">Every set hit ${it.hi} reps last time. Add weight today (+${WSTEP} ${esc(e.unit)}).</div>`);
      else if (prevSets.some(l => l.r < it.lo)) info.push(`<div class="hint down">Reps fell below ${it.lo} last time. Use a little less weight so every set lands in ${it.lo}–${it.hi}.</div>`);
      if (prevDay === yk) info.push('<div class="hint cap">You did this yesterday. If it was hard or you\'re still sore, pick one of the other ways below.</div>');
    }
  }
  if (today.length >= 5) info.push(`<div class="hint cap">${today.length} sets of this today. That's the per-session cap; the next priority is a better use of the next set.</div>`);
  const tired = Object.keys(e.credit).filter(m => st[m] && st[m].R < 0.5);
  if (tired.length) info.push(`<div class="hint cap">${esc(tired.map(shortMuscle).join(', '))} ${tired.length > 1 ? 'have' : 'has'} had a lot of work in the last day.</div>`);
  const { best: prs, flags } = prScan();
  const b = prs.get(e.id);
  const prLine = b ? `<div class="prline"><span><span class="k">PR weight</span> <b class="num">${fmtW(b.w)} ${esc(e.unit)}</b></span><span><span class="k">PR energy</span> <b class="num">${fmtE(b.e)}</b> <span class="num muted">(${fmtW(b.el.w)}×${b.el.r})</span></span></div>` : '';
  const inp = inputsFor(it);
  const rest = S.rest[e.id];
  const action = rest && rest.end > Date.now()
    ? `<button type="button" class="restbar" id="restBar" data-a="skiprest" aria-label="Resting. Tap to skip."><i style="width:${(clamp((Date.now() - rest.start) / (rest.end - rest.start), 0, 1) * 100).toFixed(1)}%"></i><span class="rl num">Rest ${fmtClock(rest.end - Date.now())}</span><span class="rs">tap to skip</span></button>`
    : '<button type="button" class="logbtn" data-a="log">Log set</button>';
  const works = Object.entries(e.credit).sort((a, b) => b[1] - a[1]).map(([m, c]) => {
    const s = st[m];
    const open = s && s.T > 0 ? Math.round(s.open * 100) : null;
    const note = !s || s.T <= 0 ? ' · no target' : c < 1 && s.short && s.open > 0 ? ' · won\'t count until the focused share is back up' : ` · ${open}% open`;
    return `<span class="wk">${chipHTML(m, c, s)}<span class="muted num">${c >= 1 ? 'full set' : 'half set'}${note}</span></span>`;
  }).join('');
  page.innerHTML = `
    <article class="card">
      <div class="slot"><span class="sl">${pos === 0 ? 'Top priority' : pos > 0 ? `Priority ${pos + 1}` : 'On target'}</span><span class="sm2">${esc(muscleName(m))}</span><span class="sw muted">${esc(why)}</span></div>
      <div class="pos"><span>${esc(e.variant || '')}</span><span>${esc(e.equipment)}</span></div>
      <div class="chead">
        <div><h2>${esc(e.name)}</h2><div class="meta">${it.lo}–${it.hi} ${e.timed ? 'seconds' : 'reps'}${e.perSide ? ' per side' : ''} · rest ${fmtClock(restSecs(it) * 1000)}</div></div>
        <div class="count num">${today.length}<small>today</small></div>
      </div>
      ${e.reviewed ? '' : '<div class="nrbox"><b>Not reviewed.</b> From the free-exercise-db, not checked like the core exercises. Watch the form video before going heavy.</div>'}
      <figure id="fig"></figure>
      <div class="logger">
        <div class="stepper"><button type="button" data-a="w-" aria-label="Less weight">−</button><label><input id="inW" type="number" inputmode="decimal" min="0" step="any" value="${fmtW(inp.w)}"><span>${esc(e.unit)}</span></label><button type="button" data-a="w+" aria-label="More weight">+</button></div>
        <div class="stepper"><button type="button" data-a="r-" aria-label="Fewer reps">−</button><label><input id="inR" type="number" inputmode="numeric" min="0" step="1" value="${inp.r}"><span>${e.timed ? 'sec' : 'reps'}</span></label><button type="button" data-a="r+" aria-label="More reps">+</button></div>
        ${action}
        <div class="today">${today.length ? '<span class="t">Today · tap to edit</span>' + today.map(l => { const f = flags.get(l.id); return `<button type="button" class="chipbtn num${f ? ' pr' : ''}" data-edit="${esc(l.id)}">${fmtW(l.w)}×${l.r}${f ? ' ★' : ''}</button>`; }).join('') : ''}</div>
        ${prLine}
        <div class="info">${info.join('')}</div>
      </div>
      <div class="works"><span class="k">Works</span>${works}</div>
      ${altHTML}
      <ol class="cues">${e.cues.map((c, i) => `<li data-n="${i + 1}">${esc(c)}</li>`).join('')}</ol>
      ${e.safety ? `<p class="safety">${esc(e.safety)}</p>` : ''}
      ${e.refs.length ? `<div class="refs">Reference: ${e.refs.map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>`).join(' · ')}</div>` : ''}
      <div class="btns"><button type="button" class="btn quiet" data-hide="${esc(e.id)}">Hide this exercise</button></div>
    </article>`;
  const fig = $('#fig'), svg = cleanSVG(e.figure && e.figure.svg);
  if (svg) fig.appendChild(svg);
  else if (e.images.length) {
    fig.className = 'photos';
    e.images.forEach((p, i) => {
      const box = document.createElement('div');
      const im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async'; im.alt = (i ? 'Finish' : 'Start') + ' position: ' + e.name; im.src = imgURL(p);
      im.addEventListener('error', () => { box.classList.add('off'); box.dataset.msg = navigator.onLine === false ? 'Photo not saved for offline use' : 'Photo unavailable'; });
      const cap = document.createElement('span'); cap.textContent = i ? 'Finish' : 'Start';
      box.append(im, cap); fig.appendChild(box);
    });
  } else fig.remove();
  page.classList.toggle('complete', false);
}
function onboardingHTML() {
  return `<div class="card onb"><h2>No plan loaded yet</h2>
    <p class="muted">Load the current plan and exercise library from the site, or import files I've sent you.</p>
    <div class="btns" style="justify-content:center"><button type="button" class="btn primary" data-a="latest">Get latest plan</button><button type="button" class="btn" data-a="import">Import files</button></div></div>`;
}
function renderLog() {
  const v = $('#v-log');
  const all = S.logShowAll;
  const since = daysBack(7);
  const list = (all ? S.logs : S.logs.filter(l => l.t >= since)).slice().reverse();
  const { flags } = prScan();
  const days = new Map();
  for (const l of list) { const k = dayKey(new Date(l.t)); if (!days.has(k)) days.set(k, []); days.get(k).push(l); }
  let h = `<div class="lhead"><div class="seg" role="group" aria-label="Range"><button data-range="week" aria-pressed="${!all}">Last 7 days</button><button data-range="all" aria-pressed="${!!all}">All</button></div>
    <button type="button" class="btn" data-a="add">+ Add a set</button></div>`;
  if (!list.length) h += `<div class="empty">No sets logged ${all ? 'yet' : 'in the last 7 days'}. Sets you log on the Workout tab show up here, where you can fix or delete them.</div>`;
  for (const [, ls] of days) {
    const d = new Date(ls[0].t);
    h += `<div class="day"><h3>${esc(fmtDay(d))} · ${ls.length} set${ls.length > 1 ? 's' : ''}</h3><div class="rows">` +
      ls.map(l => {
        const e = S.ex.get(l.ex), f = flags.get(l.id);
        const badges = f ? `<span class="prbs">${f.w ? '<span class="prb">★ Weight PR</span>' : ''}${f.e ? '<span class="prb">★ Energy PR</span>' : ''}</span>` : '';
        return `<button type="button" class="rowbtn${f ? ' isPr' : ''}" data-edit="${esc(l.id)}"><span class="tm num">${esc(fmtTime(new Date(l.t)))}</span><span class="nm"><span class="nmt">${esc(e ? e.name : l.ex)}</span>${badges}</span><span class="wr num">${fmtW(l.w)} × ${l.r}</span></button>`;
      }).join('') + '</div></div>';
  }
  v.innerHTML = h;
}
// ---------------------------------------------------------------- goals: rolling sets-per-week averages
const WINDOWS = [['wk', 'Last 7 days', 7], ['mo', '30-day average', 30], ['yr', 'Year average', 365]];
function muscleKeys() {
  const keys = muscleList().map(([k]) => k).filter(k => targetMonth(k) > 0);
  for (const l of S.logs) { const e = S.ex.get(l.ex); if (e) for (const k of Object.keys(e.credit)) if (!keys.includes(k) && muscleName(k) !== k) keys.push(k); }
  return keys;
}
// Daily totals from the first logged day to today, then each window's average expressed as sets per week.
// Windows shorter than their full length (early on) average over the days so far, but never fewer than 7.
function rollingSeries() {
  if (!S.logs.length) return null;
  const d0 = new Date(S.logs[0].t); d0.setHours(0, 0, 0, 0);
  const days = [];
  for (const d = new Date(d0), end = new Date(); d <= end; d.setDate(d.getDate() + 1)) days.push(new Date(d));
  const idx = new Map(days.map((d, i) => [dayKey(d), i]));
  const keys = muscleKeys();
  const raw = { all: new Float64Array(days.length) };
  keys.forEach(k => raw[k] = new Float64Array(days.length));
  for (const l of S.logs) {
    const i = idx.get(dayKey(new Date(l.t))); if (i === undefined) continue;
    raw.all[i] += 1;
    const e = S.ex.get(l.ex); if (e) for (const [k, c] of Object.entries(e.credit)) if (raw[k]) raw[k][i] += c;
  }
  const out = {};
  for (const [k, arr] of Object.entries(raw)) {
    const P = new Float64Array(arr.length + 1);
    for (let i = 0; i < arr.length; i++) P[i + 1] = P[i] + arr[i];
    out[k] = {};
    for (const [w, , L] of WINDOWS) {
      out[k][w] = Array.from(arr, (_, i) => { const span = Math.max(7, Math.min(L, i + 1)); return (P[i + 1] - P[Math.max(0, i + 1 - span)]) / span * 7; });
    }
  }
  return { days, series: out, keys };
}
const goalFor = sel => sel === 'all' ? estimate().sets : Math.round(targetWeek(sel) * 10) / 10;
const niceStep = (max, n = 4) => { const raw = max / n, p = Math.pow(10, Math.floor(Math.log10(raw))); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };
function lineChart(host, days, lines, goal) {
  host.innerHTML = '';
  const W = Math.max(280, Math.round(host.clientWidth || 320)), H = 210, m = { l: 34, r: 10, t: 12, b: 24 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const vals = lines.flatMap(s => s.values.filter(v => v != null));
  const top = Math.max(goal * 1.15, ...vals, 1) * 1.05;
  const step = niceStep(top);
  const ymax = Math.ceil(top / step) * step;
  const x = i => m.l + (days.length < 2 ? iw / 2 : i / (days.length - 1) * iw);
  const y = v => m.t + ih - v / ymax * ih;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); (parent || svg).appendChild(n); return n; };
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'chart'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Sets per week, rolling averages. Values are listed in the table below.');
  for (let v = 0; v <= ymax + 1e-9; v += step) {
    mk('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v === 0 ? 'ax' : 'gr' });
    const t = mk('text', { x: m.l - 6, y: y(v) + 3.5, class: 'tk', 'text-anchor': 'end' }); t.textContent = fmtW(v);
  }
  // x ticks: about 4 dates
  const nt = Math.min(4, days.length);
  for (let j = 0; j < nt; j++) {
    const i = nt === 1 ? 0 : Math.round(j * (days.length - 1) / (nt - 1));
    const t = mk('text', { x: x(i), y: H - 6, class: 'tk', 'text-anchor': j === 0 && nt > 1 ? 'start' : j === nt - 1 && nt > 1 ? 'end' : 'middle' });
    t.textContent = days[i].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  mk('line', { x1: m.l, x2: W - m.r, y1: y(goal), y2: y(goal), class: 'goal' });
  const gl = mk('text', { x: W - m.r, y: y(goal) - 5, class: 'gl', 'text-anchor': 'end' }); gl.textContent = `Goal ${fmtW(goal)}`;
  for (const s of lines) {
    let d = '', pen = false;
    s.values.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`; pen = true; });
    if (d) mk('path', { d, class: 'ln ' + s.cls });
    const li = s.values.length - 1;
    if (li >= 0 && s.values[li] != null) mk('circle', { cx: x(li), cy: y(s.values[li]), r: 4, class: 'dot ' + s.cls });
  }
  const cross = mk('line', { x1: 0, x2: 0, y1: m.t, y2: m.t + ih, class: 'cross', visibility: 'hidden' });
  const hit = mk('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent', class: 'hit' });
  host.appendChild(svg);
  const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; host.appendChild(tip);
  const show = ev => {
    const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width;
    const i = clamp(Math.round((px - m.l) / iw * (days.length - 1)), 0, days.length - 1);
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
    tip.replaceChildren();
    const h = document.createElement('div'); h.className = 'th'; h.textContent = fmtDay(days[i]); tip.appendChild(h);
    for (const s of lines) {
      const row = document.createElement('div'); row.className = 'tr';
      const key = document.createElement('i'); key.className = 'key ' + s.cls;
      const v = document.createElement('b'); v.textContent = s.values[i] == null ? '–' : fmtW(Math.round(s.values[i] * 10) / 10);
      const n = document.createElement('span'); n.textContent = s.name;
      row.append(key, v, n); tip.appendChild(row);
    }
    tip.hidden = false;
    const left = x(i) / W * r.width;
    tip.style.left = Math.min(Math.max(0, left - tip.offsetWidth / 2), r.width - tip.offsetWidth) + 'px';
  };
  hit.addEventListener('pointermove', show);
  hit.addEventListener('pointerdown', show);
  hit.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); } });
}
function prioritiesHTML(st) {
  const list = muscleList().map(([k]) => ({ k, s: st[k] })).filter(x => x.s.T > 0 && x.s.open >= 0.05).sort((a, b) => b.s.open - a.s.open).slice(0, 8);
  return `<div class="card needs"><div class="lhead"><h3 class="ct">Priorities</h3><span class="muted sm">share of weekly target still open</span></div>
    <div class="nchips">${list.map(b => `<span class="nchip"><b>${esc(shortMuscle(b.k))}</b> <span class="num">${Math.round(b.s.open * 100)}%</span>${b.s.short ? ' <span class="fz">needs focused</span>' : ''}</span>`).join('') || '<span class="muted">Every muscle is on target.</span>'}</div>
    <p class="muted sm" style="margin:8px 0 0">The Workout tab puts the exercises that close these gaps first. "Needs focused" means that muscle's share of full sets is below its minimum.</p></div>`;
}
function renderGoals() {
  const v = $('#v-goals');
  if (!S.plan) { v.innerHTML = '<div class="card empty">Load a plan first (Data tab).</div>'; return; }
  const rs = rollingSeries();
  if (!rs) { v.innerHTML = `<div class="stack">${prioritiesHTML(muscleState())}<div class="card empty">Log a few sets and your weekly averages show up here: the last 7 days, the 30-day average and the year average, for all sets and for each muscle.</div></div>`; return; }
  const sel = rs.series[S.goalSel] ? S.goalSel : 'all';
  const goal = goalFor(sel);
  const n = rs.days.length, from = Math.max(0, n - S.goalRange);
  const days = rs.days.slice(from);
  const cls = ['s1', 's2', 's3'];
  const lines = WINDOWS.map(([w, name], j) => ({ name, cls: cls[j], values: rs.series[sel][w].slice(from) }));
  const label = k => k === 'all' ? 'All sets' : muscleName(k);
  const last = w => rs.series[sel][w][n - 1];
  const st = muscleState();
  const rows = ['all', ...rs.keys].map(k => {
    const g = goalFor(k), s = rs.series[k] || { wk: [0], mo: [0], yr: [0] };
    const at = w => s[w][n - 1] || 0;
    const m = st[k], share = m && m.avg > 0 ? m.avgDir / m.avg : null;
    return { k, g, wk: at('wk'), mo: at('mo'), yr: at('yr'), ratio: g > 0 ? at('mo') / g : 9, share, p: m ? m.p : 0 };
  });
  const body = rows.filter(r => r.k !== 'all').sort((a, b) => a.ratio - b.ratio);
  const r1 = x => fmtW(Math.round(x * 10) / 10);
  const row = r => {
    const low = r.ratio < 0.8;
    const fz = r.k === 'all' || r.share == null ? '–' : `<span class="${r.p && r.share < r.p - 0.05 ? 'low' : ''}">${Math.round(r.share * 100)}%</span>${r.p ? `<span class="muted">/${Math.round(r.p * 100)}</span>` : ''}`;
    return `<tr data-gsel="${esc(r.k)}" class="${r.k === sel ? 'sel' : ''}"><th scope="row">${esc(label(r.k).replace(/ \(.+\)/, ''))}${low ? ' <span class="low">▼ low</span>' : ''}</th><td class="num">${r1(r.wk)}</td><td class="num">${r1(r.mo)}</td><td class="num">${r1(r.yr)}</td><td class="num muted">${r1(r.g)}</td><td class="num">${fz}</td></tr>`;
  };
  const table = `<div class="card">
      <h3 class="ct">Every muscle, sets per week</h3>
      <p class="muted" style="font-size:12.5px;margin:2px 0 8px">Sorted by the 30-day average against the goal, lowest first. ▼ low means under 80% of the goal. Focused is the 30-day share of full sets / your minimum. Tap a row to chart it.</p>
      <div class="tblwrap"><table class="gtab"><thead><tr><th scope="col">Muscle</th><th scope="col">7 d</th><th scope="col">30 d</th><th scope="col">Year</th><th scope="col">Goal</th><th scope="col">Focused</th></tr></thead>
      <tbody>${row(rows[0])}${body.map(row).join('')}</tbody></table></div>
    </div>`;
  v.innerHTML = `<div class="stack">
    ${prioritiesHTML(st)}
    ${table}
    <div class="gsel" role="group" aria-label="Show" id="gsel">${['all', ...rs.keys].map(k => `<button type="button" data-gsel="${esc(k)}" aria-pressed="${k === sel}">${esc(label(k).replace(/ \(.+\)/, ''))}</button>`).join('')}</div>
    <div class="card">
      <div class="lhead"><div><h3 class="ct">${esc(label(sel))}: sets per week</h3><div class="muted" style="font-size:12.5px">Goal ${fmtW(goal)} per week${sel === 'all' ? ' (estimate for all targets)' : ' effective sets (Plan tab)'}</div></div>
        <div class="seg" role="group" aria-label="Range"><button data-grange="90" aria-pressed="${S.goalRange === 90}">90 days</button><button data-grange="365" aria-pressed="${S.goalRange === 365}">1 year</button></div></div>
      <div class="legend">${lines.map((l, j) => `<span><i class="key ${l.cls}"></i>${esc(l.name)} <b class="num">${r1(last(WINDOWS[j][0]))}</b></span>`).join('')}</div>
      <div class="chartbox" id="chartbox"></div>
      <p class="muted" style="font-size:12.5px;margin:6px 0 0">Each line is an average expressed as sets per week. Until you have a full month or year of history, those lines average over the time you've been training.</p>
    </div></div>`;
  lineChart($('#chartbox'), days, lines, goal);
}
// ---------------------------------------------------------------- plan: targets per muscle and the exercise pool
const focusText = f => f > 0 ? `Focused ≥ ${Math.round(f * 100)}%` : 'Focus: any';
function renderPlan() {
  const v = $('#v-plan');
  if (!S.plan) { v.innerHTML = '<div class="card empty">Load a plan first (Data tab).</div>'; return; }
  const st = muscleState(), est = estimate();
  const pool = [...S.ex.values()].filter(inPool);
  const fullIn = new Set(pool.flatMap(e => Object.keys(e.credit).filter(m => e.credit[m] >= 1)));
  const eqCount = {}, lvCount = {};
  for (const e of S.ex.values()) { eqCount[e.equip] = (eqCount[e.equip] || 0) + 1; lvCount[e.level] = (lvCount[e.level] || 0) + 1; }
  const muscles = muscleList().map(([k]) => {
    const tm = targetMonth(k), f = focusShare(k), s = st[k];
    const share = s && s.avg > 0 ? Math.round(s.avgDir / s.avg * 100) + '% focused' : 'no sets yet';
    const warn = tm > 0 && !fullIn.has(k) ? '<span class="mwarn">No full-set exercise in your pool</span>' : '';
    const open = S.openMus.has(k);
    return `<div class="mus${tm > 0 ? '' : ' off'}${open ? ' open' : ''}" data-m="${esc(k)}">
      <button type="button" class="mhead" data-mus="${esc(k)}" aria-expanded="${open}">
        <span class="mn">${esc(muscleName(k))}</span><span class="chev" aria-hidden="true">›</span>
        <span class="mv num"><b data-tv>${tm}</b>/mo <span class="muted">(<span data-tw>${fmtW(Math.round(tm * 7 / MONTH * 10) / 10)}</span>/wk)</span></span>
        <span class="mfz" data-fz>${focusText(f)}</span>${warn}
      </button>
      <div class="mbody"${open ? '' : ' hidden'}>
        <label class="ml">Sets per month<input type="range" min="0" max="130" step="1" value="${tm}" data-tgt="${esc(k)}"></label>
        <label class="ml">Focused ≥ <b data-fv>${Math.round(f * 100)}%</b><input type="range" min="0" max="100" step="5" value="${Math.round(f * 100)}" data-foc="${esc(k)}"></label>
        <div class="mnow muted">Now ${s ? fmtW(Math.round(s.avg * 10) / 10) : 0}/wk (30-day) · ${share}</div>
      </div>
    </div>`;
  }).join('');
  const pill = (attr, key, on, label, n) => `<button type="button" class="pill" ${attr}="${esc(key)}" aria-pressed="${on}">${esc(label)}${n != null ? ` <span class="num">${n}</span>` : ''}</button>`;
  const hidden = [...S.hidden].map(id => S.ex.get(id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  v.innerHTML = `<div class="stack">
    <div class="card sec"><h3>Weekly load</h3>
      <p class="est"><b class="num" id="estSets">≈ ${est.sets} sets a week</b> <span class="muted" id="estHrs">(about ${fmtW(Math.round(est.hours * 2) / 2)} hours with full rest)</span></p>
      <p class="muted">That's how many sets it takes to reach every target below, using the best exercises in your pool. Up next always suggests the one that closes the biggest gaps.</p>
      <div class="lhead" style="margin-top:8px"><span>Target scale <span class="muted sm">(week 1: 50%, week 2: 75%)</span></span>
      <div class="seg" role="group" aria-label="Target scale">${[0.5, 0.75, 1].map(r => `<button data-ramp="${r}" aria-pressed="${S.ramp === r}">${r * 100}%</button>`).join('')}</div></div>
      <div class="lhead" style="margin-top:12px"><span>DY window <span class="muted sm">(days)</span></span>
      <div class="seg" role="group" aria-label="Days in the DY window">${DY_OPTS.map(n => `<button data-dy="${n}" aria-pressed="${S.dyDays === n}">${n}</button>`).join('')}</div></div>
      <p class="muted sm" style="margin-top:6px">The header's DY number counts the last ${S.dyDays === 1 ? 'day (today)' : `${S.dyDays} days, today included,`} against ${S.dyDays === 1 ? 'one day\'s' : `${S.dyDays} days'`} share of the weekly target, so a rest day carries over. Set it to how often you train: 2 for every other day, 3 for every third.</p>
    </div>
    <div class="card sec"><h3>Targets per muscle</h3>
      <p class="muted">Tap a muscle to change it. Targets are sets per month (weekly equivalent in brackets). <b>Focused ≥</b> is the minimum share of that muscle's sets that must come from exercises giving it a full set, like lateral raises for side delts, rather than half credit from presses.</p>
      <div class="muslist">${muscles}</div>
      <div class="btns"><button type="button" class="btn" data-a="resetTargets">Reset to plan defaults</button></div>
    </div>
    <div class="card sec"><h3>Exercise pool</h3>
      <p><b class="num">${pool.length}</b> of ${S.ex.size} exercises can be suggested.</p>
      <h4>Level</h4><div class="pills">${LEVELS.map(l => pill('data-lvl', l, S.pool.levels[l] !== false, l[0].toUpperCase() + l.slice(1), lvCount[l] || 0)).join('')}</div>
      <h4>Equipment</h4><div class="pills">${Object.entries(EQUIP).filter(([k]) => eqCount[k]).map(([k, lab]) => pill('data-eq', k, S.pool.equip[k] !== false, lab, eqCount[k])).join('')}</div>
    </div>
    <div class="card sec"><h3>Hidden exercises</h3>
      ${hidden.length ? `<ul class="lib">${hidden.map(e => `<li><div>${esc(e.name)}</div><button type="button" data-unhide="${esc(e.id)}">Show</button></li>`).join('')}</ul>` : '<p class="muted">None. Use "Hide this exercise" on an exercise page to keep it out of the list.</p>'}
    </div></div>`;
}
function libRowsHTML() {
  const q = S.libQ.trim().toLowerCase();
  const exs = [...S.ex.values()].filter(e => !q || e.name.toLowerCase().includes(q) || e.id.includes(q)).sort((a, b) => (b.reviewed - a.reviewed) || a.name.localeCompare(b.name));
  const shown = exs.slice(0, 40);
  return shown.map(e => `<li><button type="button" class="ln" data-open="${esc(e.id)}"><span>${esc(e.name)}${e.reviewed ? '' : ' <span class="badge nrb">not reviewed</span>'}</span><span class="id">${esc(EQUIP[e.equip] || '')} · ${esc(e.level)} · v${e.version}</span></button>${S.hidden.has(e.id) ? `<button type="button" data-unhide="${esc(e.id)}">Show</button>` : `<button type="button" data-hide="${esc(e.id)}">Hide</button>`}</li>`).join('')
    + (exs.length > shown.length ? `<li class="muted">${exs.length - shown.length} more. Type to narrow the list.</li>` : '') + (exs.length ? '' : '<li class="muted">No matches.</li>');
}
let swState = { version: null, approved: null };
async function renderData() {
  const v = $('#v-data');
  let persisted = null;
  try { persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null; } catch (e) {}
  const upd = swState.version && swState.approved && swState.version !== swState.approved;
  const nRev = [...S.ex.values()].filter(e => e.reviewed).length;
  v.innerHTML = `<div class="stack">
    <div class="card sec"><h3>Plan &amp; library</h3>
      ${S.plan ? `<p><b>${esc(S.plan.name)}</b> · ${nRev} reviewed exercises${S.ex.size > nRev ? ` (plus ${S.ex.size - nRev} unreviewed kept for your logged sets, never suggested)` : ''}</p>` : '<p class="muted">No plan loaded.</p>'}
      ${S.plans.size > 1 ? `<label class="fld" style="margin-top:6px">Current plan<select id="planSel">${[...S.plans.values()].map(p => `<option value="${esc(p.id)}" ${S.plan && p.id === S.plan.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>` : ''}
      <div class="btns"><button type="button" class="btn primary" data-a="latest">Get latest plan &amp; exercises</button><button type="button" class="btn" data-a="import">Import files</button></div>
      <p class="muted" style="font-size:13px">Get latest downloads new or updated files from the site. Import reads plan, exercise or backup files (.json or .zip) from your phone. Database exercises come from the <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener noreferrer">free-exercise-db</a> (public domain); their photos load from GitHub and are kept for offline use once viewed.</p>
    </div>
    <div class="card sec"><h3>Exercise library</h3>
      <input type="search" id="libQ" class="search" placeholder="Search ${S.ex.size} exercises" value="${esc(S.libQ)}" aria-label="Search exercises">
      <ul class="lib" id="libRes">${libRowsHTML()}</ul>
    </div>
    <div class="card sec"><h3>Your data</h3>
      <p>${S.logs.length} sets logged · ${S.ex.size} exercises · ${S.plans.size} plan${S.plans.size === 1 ? '' : 's'}</p>
      <div class="btns"><button type="button" class="btn" data-a="export">Export everything (.zip)</button>${persisted === false ? '<button type="button" class="btn" data-a="persist">Protect from clearing</button>' : ''}</div>
      <p class="muted" style="font-size:13px">Everything is stored in Firefox on this phone. ${persisted ? 'It\'s protected from automatic clearing, but' : 'Firefox may clear it if the phone runs low on space, and'} clearing Firefox's site data or uninstalling deletes it. Export now and then; the zip has plan.json, an exercises folder, a logs folder with one file per set, and settings.json with your targets and filters.</p>
    </div>
    <div class="card sec"><h3>App</h3>
      <p>Version ${APP_VERSION}${swState.approved ? ` · running ${esc(swState.approved)}` : ''}${upd ? ` · <b>${esc(swState.version)} ready</b>` : ''}</p>
      <div class="btns">${upd ? '<button type="button" class="btn primary" data-a="update">Install update</button>' : ''}<button type="button" class="btn" data-a="checkupd">Check for update</button></div>
      <p class="muted" style="font-size:13px">Updates download in the background and only switch over when you tap Install update.</p>
    </div>
    <div class="card sec"><h3>Rest timer</h3>
      <label class="tog"><input type="checkbox" id="soundOn" ${S.sound ? 'checked' : ''}> Beep when a rest ends</label>
      <label class="ml" style="margin-top:10px">Beep volume <b data-bv>${volLabel(S.beepVol)}</b><input type="range" id="beepVol" min="5" max="100" step="5" value="${S.beepVol}"></label>
      <div class="btns"><button type="button" class="btn" data-a="testbeep">Test the beep</button></div>
      <p class="muted" style="font-size:13px">Two short tones, a fifth apart, through your headphones, or the speaker at media volume. It plays while the app is open; the phone also vibrates.</p>
    </div></div>`;
}
function render(anim) {
  for (const k of ['workout', 'log', 'goals', 'plan', 'data']) $('#v-' + k).hidden = k !== S.view;
  if (S.view === 'workout') renderWorkout(anim);
  else if (S.view === 'log') renderLog();
  else if (S.view === 'goals') renderGoals();
  else if (S.view === 'plan') renderPlan();
  else renderData();
  renderHeader();
}
// ---------------------------------------------------------------- service worker + updates
async function swAsk(msg) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return null;
  return new Promise(res => {
    const ch = new MessageChannel(); const t = setTimeout(() => res(null), 3000);
    ch.port1.onmessage = e => { clearTimeout(t); res(e.data); };
    navigator.serviceWorker.controller.postMessage(msg, [ch.port2]);
  });
}
async function refreshUpdateState() {
  const st = await swAsk({ type: 'status' });
  if (st) swState = st;
  const upd = swState.version && swState.approved && swState.version !== swState.approved;
  $('#updBanner').hidden = !upd;
  if (upd) $('#updText').textContent = `Version ${swState.version} is ready.`;
  if (S.view === 'data') renderData();
}
async function installUpdate() {
  const r = await swAsk({ type: 'approve' });
  if (r && r.ok) location.reload(); else toast('Couldn\'t switch versions. Close and reopen the app, then try again.', 4000);
}
async function checkUpdate() {
  if (!('serviceWorker' in navigator)) { toast('Offline install isn\'t supported in this browser'); return; }
  try { const reg = await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); } catch (e) { toast('Couldn\'t reach the site. Check your connection.'); return; }
  setTimeout(async () => { await refreshUpdateState(); toast(swState.version !== swState.approved ? 'Update ready' : 'You have the latest version'); }, 2500);
}

// ---------------------------------------------------------------- events
let saveT;
function saveTargetsSoon() { clearTimeout(saveT); saveT = setTimeout(() => { setMeta('targets', S.targets); setMeta('focus', S.focus); }, 300); }
function refreshEstimate() {
  changed();
  const est = estimate();
  const a = $('#estSets'), b = $('#estHrs');
  if (a) a.textContent = `≈ ${est.sets} sets a week`;
  if (b) b.textContent = `(about ${fmtW(Math.round(est.hours * 2) / 2)} hours with full rest)`;
  renderHeader();
}
async function setHidden(id, on) {
  if (on) S.hidden.add(id); else S.hidden.delete(id);
  await setMeta('hidden', [...S.hidden]); changed();
}
function wire() {
  document.querySelector('.tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-view]'); if (!b) return;
    S.view = b.dataset.view; render(); window.scrollTo({ top: 0 });
  });
  $('#prevBtn').addEventListener('click', () => go(-1));
  $('#nextBtn').addEventListener('click', () => go(+1));
  $('#jumpBtn').addEventListener('click', () => { renderJump(); $('#jumpDlg').showModal(); });
  $('#needDlg').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });   // tap outside closes
  $('#jumpList').addEventListener('click', e => { const b = e.target.closest('[data-jump]'); if (!b) return; e.preventDefault(); $('#jumpDlg').close(); showSlot(b.dataset.jump, null); });
  $('#updBtn').addEventListener('click', installUpdate);
  document.addEventListener('pointerdown', audioUnlock, { once: true, capture: true });   // so a rest that started before a reload can still beep
  $('#totBox').addEventListener('click', () => {
    if (!S.plan) return;
    renderNeed(); $('#needDlg').showModal();
  });
  $('#edClose').addEventListener('click', () => $('#editDlg').close());
  $('#edCancel').addEventListener('click', () => $('#editDlg').close());
  $('#edDel').addEventListener('click', deleteEditing);
  $('#editForm').addEventListener('submit', saveEditor);
  $('#fileIn').addEventListener('change', async e => {
    const files = [...e.target.files]; e.target.value = '';
    if (!files.length) return;
    try { const sum = await applyImport(classify(await readFiles(files))); toast(describe(sum), 4500); if (sum.errors.length) console.warn(sum.errors); }
    catch (err) { toast('Import failed: ' + err.message, 4500); }
    render();
  });
  document.addEventListener('click', async e => {
    const a = e.target.closest('[data-a],[data-edit],[data-ramp],[data-dy],[data-range],[data-gsel],[data-grange],[data-open],[data-pick],[data-hide],[data-unhide],[data-lvl],[data-eq],[data-mus]');
    if (!a || a.closest('dialog')) return;
    if (a.dataset.open) { openEx(a.dataset.open); return; }
    if (a.dataset.pick) { setPick(a.dataset.m, a.dataset.pick); S.slot = a.dataset.m; renderWorkout('in-r'); renderHeader(); window.scrollTo({ top: 0 }); return; }
    if (a.dataset.mus) {
      const k = a.dataset.mus, box = a.closest('.mus'), open = !S.openMus.has(k);
      if (open) S.openMus.add(k); else S.openMus.delete(k);
      box.classList.toggle('open', open); box.querySelector('.mbody').hidden = !open; a.setAttribute('aria-expanded', String(open));
      return;
    }
    if (a.dataset.edit) { const l = S.logs.find(x => x.id === a.dataset.edit); if (l) openEditor(l); return; }
    if (a.dataset.ramp) { S.ramp = +a.dataset.ramp; setMeta('ramp', S.ramp); changed(); render(); return; }
    if (a.dataset.dy) { const n = +a.dataset.dy; if (DY_OPTS.includes(n)) { S.dyDays = n; setMeta('dyDays', n); render(); } return; }
    if (a.dataset.range) { S.logShowAll = a.dataset.range === 'all'; renderLog(); return; }
    if (a.dataset.gsel) {
      const fromTable = !!a.closest('.gtab');
      S.goalSel = a.dataset.gsel; renderGoals();
      if (fromTable) { const g = $('#gsel'); if (g) g.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }
      return;
    }
    if (a.dataset.grange) { S.goalRange = +a.dataset.grange; renderGoals(); return; }
    if (a.dataset.hide) {
      const id = a.dataset.hide; await setHidden(id, true);
      toast(`Hidden: ${(S.ex.get(id) || {}).short || id}. Show it again from the Plan tab.`, 3500);
      for (const [k, v] of Object.entries(S.picks)) if (v === id) delete S.picks[k];
      setMeta('picks', { day: dayKey(new Date()), p: S.picks });
      render();
      return;
    }
    if (a.dataset.unhide) { await setHidden(a.dataset.unhide, false); render(); return; }
    if (a.dataset.lvl) { S.pool.levels[a.dataset.lvl] = S.pool.levels[a.dataset.lvl] === false; setMeta('pool', S.pool); changed(); renderPlan(); renderHeader(); return; }
    if (a.dataset.eq) { const k = a.dataset.eq; if (S.pool.equip[k] === false) delete S.pool.equip[k]; else S.pool.equip[k] = false; setMeta('pool', S.pool); changed(); renderPlan(); renderHeader(); return; }
    const cur = S.cur && S.ex.get(S.cur), it = cur && itFor(cur);
    switch (a.dataset.a) {
      case 'w-': case 'w+': if (!it) break; { const inp = inputsFor(it); inp.w = Math.max(0, +(inp.w + (a.dataset.a === 'w+' ? 1 : -1) * WSTEP).toFixed(2)); $('#inW').value = fmtW(inp.w); } break;
      case 'r-': case 'r+': if (!it) break; { const inp = inputsFor(it); inp.r = Math.max(0, inp.r + (a.dataset.a === 'r+' ? 1 : -1) * (cur.timed ? 5 : 1)); $('#inR').value = inp.r; } break;
      case 'log': if (it) await logSet(it); break;
      case 'skiprest': if (it) { stopRest(it.ex); renderWorkout(); toast('Rest skipped'); } break;
      case 'resetTargets': S.targets = {}; S.focus = {}; setMeta('targets', {}); setMeta('focus', {}); changed(); renderPlan(); renderHeader(); toast('Targets reset to the plan defaults'); break;
      case 'add': openEditor(null); break;
      case 'latest':
        a.disabled = true; toast('Checking the site…', 8000);
        try { const sum = await getLatest(); toast(describe(sum), 4500); } catch (err) { toast('Couldn\'t get the latest files: ' + err.message, 4500); }
        a.disabled = false; render(); break;
      case 'import': $('#fileIn').click(); break;
      case 'export': exportAll(); break;
      case 'persist': try { const ok = await navigator.storage.persist(); toast(ok ? 'Storage is protected' : 'Firefox didn\'t allow it. Keep exporting backups.'); } catch (err) { toast('Not supported here'); } renderData(); break;
      case 'update': installUpdate(); break;
      case 'checkupd': checkUpdate(); break;
      case 'testbeep': { audioUnlock(); const was = S.sound; S.sound = true; beep(); S.sound = was; if (!was) toast('The beep is switched off'); break; }
    }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.tgt) {
      const k = t.dataset.tgt, v = Math.round(+t.value); S.targets[k] = v;
      const box = t.closest('.mus'); box.querySelector('[data-tv]').textContent = v; box.querySelector('[data-tw]').textContent = fmtW(Math.round(v * 7 / MONTH * 10) / 10);
      box.classList.toggle('off', v === 0); saveTargetsSoon(); return;
    }
    if (t.dataset.foc) {
      const k = t.dataset.foc, v = Math.round(+t.value), box = t.closest('.mus'); S.focus[k] = v / 100;
      box.querySelector('[data-fv]').textContent = v + '%'; box.querySelector('[data-fz]').textContent = focusText(v / 100); saveTargetsSoon(); return;
    }
    if (t.id === 'libQ') { S.libQ = t.value; $('#libRes').innerHTML = libRowsHTML(); return; }
    if (t.id === 'beepVol') { const v = +t.value; if (volOk(v)) { S.beepVol = v; t.closest('label').querySelector('[data-bv]').textContent = volLabel(v); } return; }
    const cur = S.cur && S.ex.get(S.cur); if (!cur) return;
    const it = itFor(cur);
    if (t.id === 'inW') { const v = parseFloat(t.value); inputsFor(it).w = Number.isFinite(v) ? v : 0; }
    if (t.id === 'inR') { const v = parseInt(t.value, 10); inputsFor(it).r = Number.isFinite(v) ? v : 0; }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.tgt || t.dataset.foc) { refreshEstimate(); return; }
    if (t.id === 'soundOn') { S.sound = t.checked; setMeta('sound', S.sound); if (S.sound) { audioUnlock(); beep(); } return; }
    if (t.id === 'beepVol') { setMeta('beepVol', S.beepVol); audioUnlock(); const was = S.sound; S.sound = true; beep(); S.sound = was; return; }   // preview on release
    if (t.id === 'planSel') { const p = S.plans.get(t.value); if (p) { S.plan = p; setMeta('currentPlan', p.id); changed(); toast(`"${p.name}" is now current`); render(); } }
  });
  // swipe between exercises on an exercise page
  const area = $('#v-workout');
  let sx = 0, sy = 0, stt = 0, track = false;
  area.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || !S.slot || !S.plan) { track = false; return; }
    const t = e.touches[0]; sx = t.clientX; sy = t.clientY; stt = Date.now();
    track = !e.target.closest('input,select,textarea,.stepper');
  }, { passive: true });
  area.addEventListener('touchend', e => {
    if (!track) return; track = false;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy) && Date.now() - stt < 800) go(dx < 0 ? +1 : -1);
  }, { passive: true });
  document.addEventListener('keydown', e => {
    if (S.view !== 'workout' || !S.slot || e.target.closest('input,select,textarea') || document.querySelector('dialog[open]')) return;
    if (e.key === 'ArrowRight') go(+1); else if (e.key === 'ArrowLeft') go(-1);
  });
  // a return to the app re-ranks (rankings depend on the time since each set); after a long break it starts again at #1
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt > 45 * 60e3) S.slot = null;
    changed(); render(); refreshUpdateState(); tickRest();
  });
}

// ---------------------------------------------------------------- boot
async function boot() {
  wire();
  try { await loadAll(); }
  catch (err) { $('#page').innerHTML = `<div class="card">Couldn't open the app's storage: ${esc(err.message)}. Private browsing blocks it.</div>`; return; }
  render();
  tickRest();
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (S.view === 'goals') renderGoals(); }, 200); });
  // first launch after an app update (or a library that never finished loading): pull the files that changed alongside it
  if (S.plan && (S.seenVersion !== APP_VERSION || !S.libVersion) && navigator.onLine !== false) {
    try { const sum = await getLatest(); if (sum.newEx || sum.updEx || sum.plans) toast('Updated: ' + describe(sum), 4000); render(); } catch (err) { console.warn(err); }
  }
  setMeta('appVersion', APP_VERSION);
  if (!S.plan && navigator.onLine !== false) {
    S.loading = true; render();
    try { const sum = await getLatest(); toast(describe(sum), 4000); } catch (err) { console.warn(err); }
    S.loading = false; render();
  }
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('sw.js');
      navigator.serviceWorker.addEventListener('controllerchange', refreshUpdateState);
      navigator.serviceWorker.ready.then(() => setTimeout(refreshUpdateState, 500));
    } catch (err) { console.warn('service worker', err); }
  }
}
boot();

/* Weekly Pile core. All data lives in this browser's IndexedDB on the phone:
   exercises (library add-ons), plans (ordered set lists), logs (one record per set), meta (settings). */
'use strict';
const APP_VERSION = '1.0.0';

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
  };
})();

// ---------------------------------------------------------------- validation (imported files are untrusted)
const str = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
const num = (v, d) => (v !== null && v !== '' && Number.isFinite(+v)) ? +v : d;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function validExercise(o) {
  if (!o || o.type !== 'exercise' || !ID_RE.test(o.id || '')) throw new Error('not a valid exercise file');
  const credit = {};
  for (const [k, v] of Object.entries(o.credit || {})) if (ID_RE.test(k) && +v > 0 && +v <= 1) credit[k] = +v;
  const refs = (Array.isArray(o.refs) ? o.refs : []).filter(r => r && typeof r.url === 'string' && /^https:\/\/[^\s"'<>]+$/.test(r.url))
    .slice(0, 6).map(r => ({ title: str(r.title, 120) || r.url, url: r.url.slice(0, 500) }));
  return {
    type: 'exercise', schema: 1, id: o.id, version: Math.max(1, Math.floor(num(o.version, 1))),
    name: str(o.name, 80) || o.id, short: str(o.short, 24) || str(o.name, 24) || o.id, equipment: str(o.equipment, 120),
    unit: o.unit === 'kg' ? 'kg' : 'lb', step: clamp(num(o.step, 5), 0.25, 50), perSide: !!o.perSide, credit,
    cues: (Array.isArray(o.cues) ? o.cues : []).filter(c => typeof c === 'string').slice(0, 8).map(c => c.slice(0, 400)),
    safety: str(o.safety, 400), refs, figure: { svg: typeof (o.figure && o.figure.svg) === 'string' ? o.figure.svg.slice(0, 200000) : '' },
  };
}
function validPlan(o) {
  if (!o || o.type !== 'plan' || !str(o.id, 60) || !Array.isArray(o.items)) throw new Error('not a valid plan file');
  const muscles = {};
  for (const [k, v] of Object.entries(o.muscles || {})) if (ID_RE.test(k)) muscles[k] = str(v, 60) || k;
  const items = o.items.filter(i => i && ID_RE.test(i.ex || '')).slice(0, 60).map(i => {
    const lo = clamp(Math.round(num(i.lo, 8)), 1, 100);
    return { ex: i.ex, sets: clamp(Math.round(num(i.sets, 3)), 1, 40), lo, hi: clamp(Math.round(num(i.hi, lo)), lo, 100) };
  });
  if (!items.length) throw new Error('plan has no exercises');
  return { type: 'plan', schema: 1, id: str(o.id, 60), version: Math.max(1, Math.floor(num(o.version, 1))), name: str(o.name, 80) || o.id, created: str(o.created, 30), muscleTarget: clamp(num(o.muscleTarget, 15), 1, 60), muscles, items };
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
  ramp: 1, page: 0, skipDone: false, view: 'workout', inputs: {}, editing: null, armed: null,
};
async function loadAll() {
  const [ex, plans, logs, meta] = await Promise.all([DB.all('exercises'), DB.all('plans'), DB.all('logs'), DB.all('meta')]);
  S.ex = new Map(ex.map(e => [e.id, e]));
  S.plans = new Map(plans.map(p => [p.id, p]));
  S.logs = logs.sort((a, b) => a.t - b.t);
  const m = Object.fromEntries(meta.map(r => [r.k, r.v]));
  S.ramp = [0.5, 0.75, 1].includes(m.ramp) ? m.ramp : 1;
  S.page = Number.isInteger(m.page) ? m.page : 0;
  S.skipDone = !!m.skipDone;
  S.plan = S.plans.get(m.currentPlan) || [...S.plans.values()].sort((a, b) => String(b.created).localeCompare(String(a.created)))[0] || null;
}
const setMeta = (k, v) => DB.put('meta', { k, v }).catch(e => console.warn(e));

// week window
function weekRange() { const s = weekStart(new Date()); const e = new Date(s); e.setDate(e.getDate() + 7); return [s.getTime(), e.getTime(), s]; }
function weekLogs() { const [a, b] = weekRange(); return S.logs.filter(l => l.t >= a && l.t < b); }
const items = () => (S.plan ? S.plan.items : []);
const target = it => Math.max(1, Math.round(it.sets * S.ramp));
const countFor = (exId, logs = weekLogs()) => logs.reduce((n, l) => n + (l.ex === exId), 0);

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
      case 'settings': got.settings = { ramp: [0.5, 0.75, 1].includes(o.ramp) ? o.ramp : null, currentPlan: str(o.currentPlan, 60) }; break;
      case 'bundle': (o.exercises || []).forEach(x => take(x, name)); (o.plans || (o.plan ? [o.plan] : [])).forEach(x => take(x, name)); (o.logs || []).forEach(x => take(x, name)); break;
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
  const changed = got.plans.filter(p => !S.plans.has(p.id) || p.version > (S.plans.get(p.id).version || 1));
  if (changed.length) {
    await DB.putMany('plans', changed); changed.forEach(p => S.plans.set(p.id, p)); sum.plans = changed.length;
    if (S.plan && S.plans.get(S.plan.id) !== S.plan) S.plan = S.plans.get(S.plan.id);   // current plan was updated in place
  }
  let pick = got.settings && got.settings.currentPlan && S.plans.get(got.settings.currentPlan);
  if (!pick && makeCurrent && changed.length) pick = changed[changed.length - 1];
  if (pick && (!S.plan || S.plan.id !== pick.id)) { S.plan = pick; S.page = 0; await setMeta('currentPlan', pick.id); await setMeta('page', 0); sum.current = pick.name; }
  else if (pick && changed.includes(pick)) sum.current = pick.name;
  if (got.logs.length) {
    await DB.putMany('logs', got.logs);
    const m = new Map(S.logs.map(l => [l.id, l])); got.logs.forEach(l => m.set(l.id, l));
    S.logs = [...m.values()].sort((a, b) => a.t - b.t); sum.logs = got.logs.length;
  }
  if (got.settings && got.settings.ramp) { S.ramp = got.settings.ramp; await setMeta('ramp', S.ramp); }
  return sum;
}
function describe(sum) {
  const bits = [];
  if (sum.newEx) bits.push(`${sum.newEx} new exercise${sum.newEx > 1 ? 's' : ''}`);
  if (sum.updEx) bits.push(`${sum.updEx} updated`);
  if (sum.current) bits.push(`plan "${sum.current}" loaded`);
  else if (sum.plans) bits.push(`${sum.plans} plan${sum.plans > 1 ? 's' : ''} saved`);
  if (sum.logs) bits.push(`${sum.logs} set${sum.logs > 1 ? 's' : ''}`);
  if (!bits.length) bits.push(sum.sameEx ? 'Everything was already up to date' : 'Nothing to import');
  return bits.join(', ') + (sum.errors.length ? ` · ${sum.errors.length} file${sum.errors.length > 1 ? 's' : ''} skipped` : '');
}
async function fetchJSON(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${url} (${r.status})`);
  return r.json();
}
async function getLatest() {
  const idx = await fetchJSON('content/index.json');
  if (!idx || idx.type !== 'library-index' || !Array.isArray(idx.exercises)) throw new Error('library index is damaged');
  const want = idx.exercises.filter(e => e && ID_RE.test(e.id || '') && /^exercises\/[a-z0-9_-]+\.json$/.test(e.file || '') && (!S.ex.has(e.id) || S.ex.get(e.id).version < +e.version));
  const entries = await Promise.all(want.map(async e => ({ name: e.file, text: JSON.stringify(await fetchJSON('content/' + e.file)) })));
  if (/^[a-z0-9_-]+\.json$/.test(idx.plan || '')) entries.push({ name: idx.plan, text: JSON.stringify(await fetchJSON('content/' + idx.plan)) });
  return applyImport(classify(entries), { makeCurrent: true });
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
  files.push({ name: dir + 'settings.json', data: j({ type: 'settings', schema: 1, ramp: S.ramp, currentPlan: S.plan ? S.plan.id : '', exported: new Date().toISOString(), app: APP_VERSION }) });
  download(zipStore(files), `weekly-pile-${stamp}.zip`);
  toast(`Exported ${S.logs.length} sets, ${S.ex.size} exercises`);
}

// ---------------------------------------------------------------- logging + editing
function lastLog(exId) { for (let i = S.logs.length - 1; i >= 0; i--) if (S.logs[i].ex === exId) return S.logs[i]; return null; }
function inputsFor(it) {
  if (!S.inputs[it.ex]) { const l = lastLog(it.ex); S.inputs[it.ex] = { w: l ? l.w : 0, r: l ? l.r : it.lo }; }
  return S.inputs[it.ex];
}
async function addLog(rec) {
  const l = validLog(rec);
  await DB.put('logs', l);
  S.logs.push(l); S.logs.sort((a, b) => a.t - b.t);
  if (S.logs.length === 1 && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  return l;
}
async function logSet(it) {
  const inp = inputsFor(it);
  if (!(inp.r > 0)) { toast('Enter the reps first'); return; }
  const e = S.ex.get(it.ex);
  try {
    await addLog({ id: newId(), ex: it.ex, w: +inp.w || 0, unit: e ? e.unit : 'lb', r: inp.r, t: Date.now(), plan: S.plan ? S.plan.id : '' });
  } catch (err) { toast('Couldn\'t save that set: ' + err.message, 4000); return; }
  toast(`Logged ${fmtW(inp.w)} × ${inp.r} · ${countFor(it.ex)}/${target(it)}`);
  render();
}
function openEditor(log, presetEx) {
  S.editing = log ? log.id : null; S.armed = null;
  const sel = $('#edEx');
  const exs = [...S.ex.values()].sort((a, b) => a.name.localeCompare(b.name));
  sel.innerHTML = exs.map(e => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('');
  const d = new Date(log ? log.t : Date.now());
  const ex = log ? log.ex : (presetEx || (items()[S.page] || {}).ex || (exs[0] || {}).id);
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
  $('#editDlg').close();
  toast('Set deleted');
  render();
}

// ---------------------------------------------------------------- navigation
function go(dir, animate = true) {
  const n = items().length;
  if (!n) return;
  let i = S.page;
  const logs = weekLogs();
  for (let step = 0; step < n; step++) {
    i += dir;
    if (i < 0 || i >= n) { toast(dir > 0 ? 'That was the last exercise' : 'This is the first exercise'); return; }
    const it = items()[i];
    if (!S.skipDone || countFor(it.ex, logs) < target(it)) break;
    if (step === n - 1) return;
  }
  setPage(i, animate ? (dir > 0 ? 'in-r' : 'in-l') : null);
}
function setPage(i, anim) {
  S.page = clamp(i, 0, Math.max(0, items().length - 1));
  setMeta('page', S.page);
  renderWorkout(anim);
  renderHeader();
  window.scrollTo({ top: 0 });
}

// ---------------------------------------------------------------- rendering
function renderHeader() {
  const [, , ws] = weekRange();
  $('#weekLabel').textContent = 'Week of ' + fmtDay(ws) + (S.plan ? ' · ' + S.plan.name : '');
  const logs = weekLogs();
  let done = 0, tot = 0;
  for (const it of items()) { const t = target(it); tot += t; done += Math.min(t, countFor(it.ex, logs)); }
  $('#tot').innerHTML = `${done}<small> / ${tot} sets</small>`;
  $('#totBar').style.width = (tot ? Math.min(100, done / tot * 100) : 0) + '%';
  const n = items().length;
  $('#pager').hidden = S.view !== 'workout' || !n;
  $('#prevBtn').disabled = S.page <= 0;
  $('#nextBtn').disabled = S.page >= n - 1;
  const it = items()[S.page];
  $('#jumpBtn').textContent = it ? `${S.page + 1} / ${n} · ${(S.ex.get(it.ex) || {}).short || it.ex}` : '–';
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.view === S.view)));
}
function muscleName(k) { return (S.plan && S.plan.muscles && S.plan.muscles[k]) || k; }
function renderWorkout(anim) {
  const page = $('#page');
  page.className = 'page';
  if (!S.plan) { page.innerHTML = S.loading ? '<div class="card empty">Loading the plan from the site…</div>' : onboardingHTML(); return; }
  const it = items()[S.page];
  if (!it) { page.innerHTML = '<div class="card empty">This plan has no exercises.</div>'; return; }
  const e = S.ex.get(it.ex);
  if (!e) {
    page.innerHTML = `<div class="card"><div class="pos"><span>${S.page + 1} of ${items().length}</span></div><h2>Missing exercise</h2><p>The plan lists <b>${esc(it.ex)}</b>, but it isn't in your library yet. Use <b>Get latest</b> or <b>Import files</b> on the Data tab.</p></div>`;
    return;
  }
  const logs = weekLogs();
  const n = countFor(it.ex, logs), tg = target(it);
  const now = new Date(), tk = dayKey(now);
  const yd = new Date(now); yd.setDate(yd.getDate() - 1); const yk = dayKey(yd);
  const mine = S.logs.filter(l => l.ex === it.ex);
  const today = mine.filter(l => dayKey(new Date(l.t)) === tk);
  const before = mine.filter(l => dayKey(new Date(l.t)) < tk);
  let prevDay = null, prevSets = [];
  if (before.length) { prevDay = dayKey(new Date(before[before.length - 1].t)); prevSets = before.filter(l => dayKey(new Date(l.t)) === prevDay); }
  const info = [];
  if (prevSets.length) {
    info.push(`<div>Last time (${esc(fmtDay(new Date(prevSets[0].t)))}): <span class="num">${prevSets.map(l => `${fmtW(l.w)}×${l.r}`).join(', ')}</span></div>`);
    if (!today.length) {
      if (prevSets.every(l => l.r >= it.hi)) info.push(`<div class="hint up">Every set hit ${it.hi} reps last time. Add weight today (+${fmtW(e.step)} ${esc(e.unit)}).</div>`);
      else if (prevSets.some(l => l.r < it.lo)) info.push(`<div class="hint down">Reps fell below ${it.lo} last time. Use a little less weight so every set lands in ${it.lo}–${it.hi}.</div>`);
      if (prevDay === yk) info.push('<div class="hint cap">You did this yesterday. If it was hard or you\'re still sore, swipe to another exercise.</div>');
    }
  }
  if (today.length >= 5) info.push(`<div class="hint cap">${today.length} sets today. That's the per-session cap; save the rest for another day.</div>`);
  const inp = inputsFor(it);
  const credits = Object.entries(e.credit).map(([m, c]) => `<span>${esc(muscleName(m).replace(/ \(.+\)/, ''))} <b>${c === 1 ? '1' : c === 0.5 ? '½' : fmtW(c)}</b></span>`).join('');
  page.innerHTML = `
    <article class="card">
      <div class="pos"><span>${S.page + 1} of ${items().length}</span><span>${esc(e.equipment)}</span></div>
      <div class="chead">
        <div><h2>${esc(e.name)}</h2><div class="meta">${it.lo}–${it.hi} reps${e.perSide ? ' per side' : ''}</div></div>
        <div class="count num">${n}/${tg}<small>sets</small></div>
      </div>
      <div class="pips" aria-hidden="true">${Array.from({ length: Math.max(tg, n) }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
      <div class="credits" aria-label="Effective-set credit">${credits}</div>
      <figure id="fig"></figure>
      <ol class="cues">${e.cues.map((c, i) => `<li data-n="${i + 1}">${esc(c)}</li>`).join('')}</ol>
      ${e.safety ? `<p class="safety">${esc(e.safety)}</p>` : ''}
      <div class="logger">
        <div class="stepper"><button type="button" data-a="w-" aria-label="Less weight">−</button><label><input id="inW" type="number" inputmode="decimal" min="0" step="any" value="${fmtW(inp.w)}"><span>${esc(e.unit)}</span></label><button type="button" data-a="w+" aria-label="More weight">+</button></div>
        <div class="stepper"><button type="button" data-a="r-" aria-label="Fewer reps">−</button><label><input id="inR" type="number" inputmode="numeric" min="0" step="1" value="${inp.r}"><span>reps</span></label><button type="button" data-a="r+" aria-label="More reps">+</button></div>
        <button type="button" class="logbtn" data-a="log">Log set</button>
        <div class="today">${today.length ? '<span class="t">Today · tap to edit</span>' + today.map(l => `<button type="button" class="chipbtn num" data-edit="${esc(l.id)}">${fmtW(l.w)}×${l.r}</button>`).join('') : ''}</div>
        <div class="info">${info.join('')}</div>
      </div>
      ${e.refs.length ? `<div class="refs">Reference: ${e.refs.map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>`).join(' · ')}</div>` : ''}
    </article>`;
  const svg = cleanSVG(e.figure && e.figure.svg);
  if (svg) $('#fig').appendChild(svg); else $('#fig').remove();
  page.classList.toggle('complete', n >= tg);
  if (anim && !matchMedia('(prefers-reduced-motion: reduce)').matches) { void page.offsetWidth; page.classList.add(anim); }
}
function onboardingHTML() {
  return `<div class="card onb"><h2>No plan loaded yet</h2>
    <p class="muted">Load the current plan and exercise library from the site, or import files I've sent you.</p>
    <div class="btns" style="justify-content:center"><button type="button" class="btn primary" data-a="latest">Get latest plan</button><button type="button" class="btn" data-a="import">Import files</button></div></div>`;
}
function renderLog() {
  const v = $('#v-log');
  const all = S.logShowAll;
  const [a, b] = weekRange();
  const list = (all ? S.logs : S.logs.filter(l => l.t >= a && l.t < b)).slice().reverse();
  const days = new Map();
  for (const l of list) { const k = dayKey(new Date(l.t)); if (!days.has(k)) days.set(k, []); days.get(k).push(l); }
  let h = `<div class="lhead"><div class="seg" role="group" aria-label="Range"><button data-range="week" aria-pressed="${!all}">This week</button><button data-range="all" aria-pressed="${!!all}">All</button></div>
    <button type="button" class="btn" data-a="add">+ Add a set</button></div>`;
  if (!list.length) h += `<div class="empty">No sets logged ${all ? 'yet' : 'this week'}. Sets you log on the Workout tab show up here, where you can fix or delete them.</div>`;
  for (const [k, ls] of days) {
    const d = new Date(ls[0].t);
    h += `<div class="day"><h3>${esc(fmtDay(d))} · ${ls.length} set${ls.length > 1 ? 's' : ''}</h3><div class="rows">` +
      ls.map(l => { const e = S.ex.get(l.ex); return `<button type="button" class="rowbtn" data-edit="${esc(l.id)}"><span class="tm num">${esc(fmtTime(new Date(l.t)))}</span><span class="nm">${esc(e ? e.name : l.ex)}</span><span class="wr num">${fmtW(l.w)} × ${l.r}</span></button>`; }).join('') +
      '</div></div>';
  }
  v.innerHTML = h;
}
function renderMuscles() {
  const v = $('#v-muscles');
  if (!S.plan) { v.innerHTML = '<div class="card empty">Load a plan first (Data tab).</div>'; return; }
  const goal = S.plan.muscleTarget * S.ramp;
  const got = {};
  const keys = Object.keys(S.plan.muscles || {});
  for (const it of items()) { const e = S.ex.get(it.ex); if (e) for (const k of Object.keys(e.credit)) if (!keys.includes(k)) keys.push(k); }
  keys.forEach(k => got[k] = 0);
  for (const l of weekLogs()) { const e = S.ex.get(l.ex); if (e) for (const [k, c] of Object.entries(e.credit)) got[k] = (got[k] || 0) + c; }
  const src = k => items().map(it => S.ex.get(it.ex)).filter(e => e && e.credit[k]).map(e => e.short + (e.credit[k] < 1 ? ' (½)' : '')).join(', ');
  v.innerHTML = `<p class="explain">Effective sets this week. A set counts 1 for the muscle doing the main work and ½ for each helper muscle. Target: <b>${fmtW(goal)}</b> per muscle.</p>
    <div class="card" style="margin-top:12px;padding-top:6px;padding-bottom:6px">${keys.map(k => {
      const g = got[k] || 0, ok = g >= goal - 1e-9;
      return `<div class="mrow ${ok ? 'ok' : ''}"><div class="n">${esc(muscleName(k))}</div><div class="v num">${fmtW(g)}<small> / ${fmtW(goal)}</small></div><div class="bar"><i style="width:${goal ? Math.min(100, g / goal * 100) : 0}%"></i></div><div class="src">${esc(src(k))}</div></div>`;
    }).join('')}</div>`;
}
let swState = { version: null, approved: null };
async function renderData() {
  const v = $('#v-data');
  const inPlan = new Set(items().map(i => i.ex));
  let persisted = null;
  try { persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null; } catch (e) {}
  const exs = [...S.ex.values()].sort((a, b) => a.name.localeCompare(b.name));
  const upd = swState.version && swState.approved && swState.version !== swState.approved;
  v.innerHTML = `<div class="stack">
    <div class="card sec"><h3>Week target</h3>
      <p class="muted">Week 1: 50%. Week 2: 75%. After that: 100%.</p>
      <div class="seg" role="group" aria-label="Week target">${[0.5, 0.75, 1].map(r => `<button data-ramp="${r}" aria-pressed="${S.ramp === r}">${r * 100}%</button>`).join('')}</div>
    </div>
    <div class="card sec"><h3>Plan</h3>
      ${S.plan ? `<p><b>${esc(S.plan.name)}</b> · ${items().length} exercises · ${items().reduce((a, i) => a + i.sets, 0)} sets at 100%</p>` : '<p class="muted">No plan loaded.</p>'}
      ${S.plans.size > 1 ? `<label class="fld" style="margin-top:6px">Current plan<select id="planSel">${[...S.plans.values()].map(p => `<option value="${esc(p.id)}" ${S.plan && p.id === S.plan.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>` : ''}
      <div class="btns"><button type="button" class="btn primary" data-a="latest">Get latest plan &amp; exercises</button><button type="button" class="btn" data-a="import">Import files</button></div>
      <p class="muted" style="font-size:13px">Get latest downloads new or updated files from the site. Import reads plan, exercise or backup files (.json or .zip) from your phone.</p>
    </div>
    <div class="card sec"><h3>Your data</h3>
      <p>${S.logs.length} sets logged · ${S.ex.size} exercises · ${S.plans.size} plan${S.plans.size === 1 ? '' : 's'}</p>
      <div class="btns"><button type="button" class="btn" data-a="export">Export everything (.zip)</button>${persisted === false ? '<button type="button" class="btn" data-a="persist">Protect from clearing</button>' : ''}</div>
      <p class="muted" style="font-size:13px">Everything is stored in Firefox on this phone. ${persisted ? 'It\'s protected from automatic clearing, but' : 'Firefox may clear it if the phone runs low on space, and'} clearing Firefox's site data or uninstalling deletes it. Export now and then; the zip has plan.json, an exercises folder and a logs folder with one file per set.</p>
    </div>
    <div class="card sec"><h3>Exercise library</h3>
      <ul class="lib">${exs.map(e => `<li><div><div>${esc(e.name)} ${inPlan.has(e.id) ? '<span class="badge">in plan</span>' : ''}</div><div class="id">${esc(e.id)} · v${e.version}</div></div>${inPlan.has(e.id) ? '<span></span>' : `<button type="button" data-delex="${esc(e.id)}">Remove</button>`}</li>`).join('') || '<li class="muted">Empty</li>'}</ul>
    </div>
    <div class="card sec"><h3>App</h3>
      <p>Version ${APP_VERSION}${swState.approved ? ` · running ${esc(swState.approved)}` : ''}${upd ? ` · <b>${esc(swState.version)} ready</b>` : ''}</p>
      <div class="btns">${upd ? '<button type="button" class="btn primary" data-a="update">Install update</button>' : ''}<button type="button" class="btn" data-a="checkupd">Check for update</button></div>
      <p class="muted" style="font-size:13px">Updates download in the background and only switch over when you tap Install update.</p>
    </div></div>`;
}
function render() {
  for (const k of ['workout', 'log', 'muscles', 'data']) $('#v-' + k).hidden = k !== S.view;
  if (S.view === 'workout') renderWorkout();
  else if (S.view === 'log') renderLog();
  else if (S.view === 'muscles') renderMuscles();
  else renderData();
  renderHeader();
}
function renderJump() {
  const logs = weekLogs();
  $('#skipDone').checked = S.skipDone;
  $('#jumpList').innerHTML = items().map((it, i) => {
    const e = S.ex.get(it.ex), n = countFor(it.ex, logs), t = target(it);
    return `<li><button type="button" data-jump="${i}" aria-current="${i === S.page}"><span class="n num">${i + 1}</span><span>${esc(e ? e.name : it.ex)}</span><span class="c num ${n >= t ? 'done' : ''}">${n}/${t}</span></button></li>`;
  }).join('');
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
function wire() {
  document.querySelector('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-view]'); if (!b) return; S.view = b.dataset.view; render(); window.scrollTo({ top: 0 }); });
  $('#prevBtn').addEventListener('click', () => go(-1));
  $('#nextBtn').addEventListener('click', () => go(+1));
  $('#jumpBtn').addEventListener('click', () => { renderJump(); $('#jumpDlg').showModal(); });
  $('#jumpList').addEventListener('click', e => { const b = e.target.closest('[data-jump]'); if (!b) return; e.preventDefault(); $('#jumpDlg').close(); setPage(+b.dataset.jump, null); });
  $('#skipDone').addEventListener('change', e => { S.skipDone = e.target.checked; setMeta('skipDone', S.skipDone); });
  $('#updBtn').addEventListener('click', installUpdate);
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
    const a = e.target.closest('[data-a],[data-edit],[data-ramp],[data-range],[data-delex]');
    if (!a || a.closest('dialog')) return;
    if (a.dataset.edit) { const l = S.logs.find(x => x.id === a.dataset.edit); if (l) openEditor(l); return; }
    if (a.dataset.ramp) { S.ramp = +a.dataset.ramp; setMeta('ramp', S.ramp); render(); return; }
    if (a.dataset.range) { S.logShowAll = a.dataset.range === 'all'; renderLog(); return; }
    if (a.dataset.delex) {
      if (S.armed !== a.dataset.delex) { S.armed = a.dataset.delex; a.classList.add('arm'); a.textContent = 'Tap to confirm'; return; }
      await DB.del('exercises', a.dataset.delex); S.ex.delete(a.dataset.delex); S.armed = null; toast('Exercise removed (its logged sets are kept)'); renderData(); return;
    }
    const it = items()[S.page];
    switch (a.dataset.a) {
      case 'w-': case 'w+': { const inp = inputsFor(it), e2 = S.ex.get(it.ex); inp.w = Math.max(0, +(inp.w + (a.dataset.a === 'w+' ? 1 : -1) * (e2 ? e2.step : 5)).toFixed(2)); $('#inW').value = fmtW(inp.w); break; }
      case 'r-': case 'r+': { const inp = inputsFor(it); inp.r = Math.max(0, inp.r + (a.dataset.a === 'r+' ? 1 : -1)); $('#inR').value = inp.r; break; }
      case 'log': await logSet(it); break;
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
    }
  });
  document.addEventListener('input', e => {
    const it = items()[S.page]; if (!it) return;
    if (e.target.id === 'inW') { const v = parseFloat(e.target.value); inputsFor(it).w = Number.isFinite(v) ? v : 0; }
    if (e.target.id === 'inR') { const v = parseInt(e.target.value, 10); inputsFor(it).r = Number.isFinite(v) ? v : 0; }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'planSel') { const p = S.plans.get(e.target.value); if (p) { S.plan = p; S.page = 0; setMeta('currentPlan', p.id); setMeta('page', 0); toast(`"${p.name}" is now current`); render(); } }
  });
  // swipe between exercises
  const area = $('#v-workout');
  let sx = 0, sy = 0, st = 0, track = false;
  area.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { track = false; return; }
    const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now();
    track = !e.target.closest('input,select,textarea,.stepper');
  }, { passive: true });
  area.addEventListener('touchend', e => {
    if (!track) return; track = false;
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy) && Date.now() - st < 800) go(dx < 0 ? +1 : -1);
  }, { passive: true });
  document.addEventListener('keydown', e => {
    if (S.view !== 'workout' || e.target.closest('input,select,textarea') || document.querySelector('dialog[open]')) return;
    if (e.key === 'ArrowRight') go(+1); else if (e.key === 'ArrowLeft') go(-1);
  });
  // a new week or a return to the app re-renders counts
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); refreshUpdateState(); } });
}

// ---------------------------------------------------------------- boot
async function boot() {
  wire();
  try { await loadAll(); }
  catch (err) { $('#page').innerHTML = `<div class="card">Couldn't open the app's storage: ${esc(err.message)}. Private browsing blocks it.</div>`; return; }
  if (S.page >= items().length) S.page = 0;
  render();
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

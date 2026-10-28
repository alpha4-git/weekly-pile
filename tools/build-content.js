// Builds content/exercises/<id>.json, content/plan.json and content/index.json
// from tools/exercises.src.json and the figure generator in tools/figures.js.
// Run: node tools/build-content.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const FIG = require('./figures.js');
const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'exercises.src.json'), 'utf8'));

const EQUIPMENT = {
  incline_db_press: 'Adjustable bench, two dumbbells', chest_press: 'Chest press machine', shoulder_press: 'Shoulder press machine',
  lat_pulldown: 'Lat pulldown machine', cable_row: 'Seated cable row', leg_press: 'Seated leg press machine',
  split_squat: 'Bench, one dumbbell', rdl: 'Two dumbbells', leg_curl: 'Seated leg curl machine',
  machine_curl: 'Biceps curl machine (preacher pad)', oh_triceps: 'Cable station, low pulley, rope', lateral_raise: 'Two dumbbells',
  reverse_fly: 'Rear delt / pec deck machine', adduction: 'Hip adduction machine', calf_raise: 'Standing calf raise machine',
  cable_crunch: 'Cable station, high pulley, rope',
};
// Prescribed order: heavy and technique-sensitive lifts first, push/pull/legs alternating, small muscles last.
const ORDER = ['leg_press', 'lat_pulldown', 'incline_db_press', 'rdl', 'cable_row', 'shoulder_press', 'split_squat', 'chest_press',
  'leg_curl', 'lateral_raise', 'reverse_fly', 'machine_curl', 'oh_triceps', 'adduction', 'calf_raise', 'cable_crunch'];
const MUSCLES = [['chest', 'Chest'], ['back', 'Back (lats & mid back)'], ['fdelt', 'Front delts'], ['sdelt', 'Side delts'], ['rdelt', 'Rear delts'],
  ['biceps', 'Biceps'], ['triceps', 'Triceps'], ['quads', 'Quads'], ['glutes', 'Glutes'], ['adductors', 'Adductors'], ['hams', 'Hamstrings'],
  ['calves', 'Calves'], ['abs', 'Abs'], ['traps', 'Upper traps'], ['lowback', 'Lower back'], ['forearms', 'Forearms'], ['abductors', 'Abductors (outer hip)'],
  ['neck', 'Neck']];
// Default targets in sets per month (15 a week = 65 a month for the 13 original muscles; the newer muscles start at 0).
// FOCUS = share of a muscle's sets that must come from exercises giving it a full set (credit 1).
const MONTH = 30.44;
const TARGETS = Object.fromEntries(MUSCLES.map(([k], i) => [k, i < 13 ? Math.round(15 * MONTH / 7) : 0]));
const FOCUS = Object.fromEntries(MUSCLES.map(([k]) => [k, ['fdelt', 'sdelt', 'rdelt'].includes(k) ? 0.6 : 0]));
// Filter keys for the Plan tab's equipment toggles.
const EQUIP_KEY = {
  incline_db_press: 'dumbbell', chest_press: 'machine', shoulder_press: 'machine', lat_pulldown: 'cable', cable_row: 'cable', leg_press: 'machine',
  split_squat: 'dumbbell', rdl: 'dumbbell', leg_curl: 'machine', machine_curl: 'machine', oh_triceps: 'cable', lateral_raise: 'dumbbell',
  reverse_fly: 'machine', adduction: 'machine', calf_raise: 'machine', cable_crunch: 'cable',
};
// Emphasis within the main muscle, shared vocabulary with tools/reviewed/*.js ("other ways to work" a muscle).
const VARIANT = {
  incline_db_press: 'Incline press · upper chest', chest_press: 'Flat press', shoulder_press: 'Overhead press', lat_pulldown: 'Vertical pull · lats',
  cable_row: 'Row · mid back', leg_press: 'Machine squat', split_squat: 'Single-leg', rdl: 'Hip hinge', leg_curl: 'Knee curl',
  machine_curl: 'Arm in front (preacher)', oh_triceps: 'Overhead · long head', lateral_raise: 'Dumbbell raise', reverse_fly: 'Rear fly',
  adduction: 'Machine adduction', calf_raise: 'Straight knee · gastrocnemius', cable_crunch: 'Crunch',
};
const ISOLATION = new Set(['leg_curl', 'machine_curl', 'oh_triceps', 'lateral_raise', 'reverse_fly', 'adduction', 'calf_raise', 'cable_crunch']);

// Rest between sets, seconds: about 2.5 min after big compound lifts, 90 s after isolation work.
const REST = {
  leg_press: 150, lat_pulldown: 150, incline_db_press: 150, rdl: 150, cable_row: 150, shoulder_press: 150, chest_press: 150,
  split_squat: 120, leg_curl: 90, lateral_raise: 90, reverse_fly: 90, machine_curl: 90, oh_triceps: 90, adduction: 90,
  calf_raise: 90, cable_crunch: 90,
};
// Version of every exercise file; bump (globally or per id) whenever content changes so phones pick up the new copy.
const BASE_VERSION = 4; // v2: added rest times; v3: rep range, equipment key, level, reviewed flag; v4: emphasis label, 5 lb steps
const VERSIONS = { incline_db_press: 5, shoulder_press: 5, split_squat: 5, oh_triceps: 5 };   // v5: cues re-checked against the references

const exDir = path.join(root, 'content', 'exercises');
fs.mkdirSync(exDir, { recursive: true });
const index = [];
for (const e of src) {
  const out = {
    type: 'exercise', schema: 1, id: e.id, version: VERSIONS[e.id] || BASE_VERSION,
    name: e.name, short: e.short, equipment: EQUIPMENT[e.id] || '', equip: EQUIP_KEY[e.id] || 'other', unit: 'lb', step: 5, perSide: e.perSide, variant: VARIANT[e.id],
    rest: REST[e.id] || 120, lo: e.lo, hi: e.hi, level: 'beginner', mechanic: ISOLATION.has(e.id) ? 'isolation' : 'compound', reviewed: true, source: 'weekly-pile',
    credit: e.credit, cues: e.cues, safety: e.safety, refs: e.refs,
    figure: { svg: FIG.render(e.id) },
  };
  fs.writeFileSync(path.join(exDir, e.id + '.json'), JSON.stringify(out, null, 1) + '\n');
  index.push({ id: e.id, version: out.version, file: 'exercises/' + e.id + '.json' });
}
const byId = Object.fromEntries(src.map(e => [e.id, e]));
if (ORDER.length !== src.length || ORDER.some(id => !byId[id])) throw new Error('ORDER does not match the exercise list');
const plan = {
  type: 'plan', schema: 2, id: 'pile-2026-10-27', version: 2, name: 'Weekly pile', created: '2026-10-27', muscleTarget: 15,
  muscles: Object.fromEntries(MUSCLES), targets: TARGETS, focus: FOCUS,
  // items: the original fixed list, kept so app version 1.1 still works until it updates
  items: ORDER.map(id => ({ ex: id, sets: byId[id].sets, lo: byId[id].lo, hi: byId[id].hi })),
};
fs.writeFileSync(path.join(root, 'content', 'plan.json'), JSON.stringify(plan, null, 1) + '\n');
// library.json comes from tools/import-fedb.js; raise LIBRARY_VERSION whenever it is regenerated
const LIBRARY_VERSION = 6;   // 2: reviewed-only library; 3: re-verified, 5 entries dropped, 7 added
const libCount = fs.existsSync(path.join(root, 'content', 'library.json')) ? JSON.parse(fs.readFileSync(path.join(root, 'content', 'library.json'), 'utf8')).exercises.length : 0;
fs.writeFileSync(path.join(root, 'content', 'index.json'), JSON.stringify({ type: 'library-index', schema: 1, plan: 'plan.json', exercises: index,
  library: { file: 'library.json', version: LIBRARY_VERSION, count: libCount } }, null, 1) + '\n');

// sanity: effective sets per muscle at 100%
const tot = Object.fromEntries(MUSCLES.map(([k]) => [k, 0]));
console.log('library', libCount);
for (const it of plan.items) for (const [m, c] of Object.entries(byId[it.ex].credit)) tot[m] += c * it.sets;
console.log('sets', plan.items.reduce((a, i) => a + i.sets, 0), JSON.stringify(tot));

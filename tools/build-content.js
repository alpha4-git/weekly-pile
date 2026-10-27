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
const MUSCLES = [['chest', 'Chest'], ['back', 'Back (lats & upper back)'], ['fdelt', 'Front delts'], ['sdelt', 'Side delts'], ['rdelt', 'Rear delts'],
  ['biceps', 'Biceps'], ['triceps', 'Triceps'], ['quads', 'Quads'], ['glutes', 'Glutes'], ['adductors', 'Adductors'], ['hams', 'Hamstrings'],
  ['calves', 'Calves'], ['abs', 'Abs']];

// Bump an exercise's version here whenever its content changes, so phones pick up the new copy.
const VERSIONS = {};

const exDir = path.join(root, 'content', 'exercises');
fs.mkdirSync(exDir, { recursive: true });
const index = [];
for (const e of src) {
  const out = {
    type: 'exercise', schema: 1, id: e.id, version: VERSIONS[e.id] || 1,
    name: e.name, short: e.short, equipment: EQUIPMENT[e.id] || '', unit: 'lb', step: e.step, perSide: e.perSide,
    credit: e.credit, cues: e.cues, safety: e.safety, refs: e.refs,
    figure: { svg: FIG.render(e.id) },
  };
  fs.writeFileSync(path.join(exDir, e.id + '.json'), JSON.stringify(out, null, 1) + '\n');
  index.push({ id: e.id, version: out.version, file: 'exercises/' + e.id + '.json' });
}
const byId = Object.fromEntries(src.map(e => [e.id, e]));
if (ORDER.length !== src.length || ORDER.some(id => !byId[id])) throw new Error('ORDER does not match the exercise list');
const plan = {
  type: 'plan', schema: 1, id: 'pile-2026-10-27', version: 1, name: 'Weekly pile 1', created: '2026-10-27', muscleTarget: 15,
  muscles: Object.fromEntries(MUSCLES),
  items: ORDER.map(id => ({ ex: id, sets: byId[id].sets, lo: byId[id].lo, hi: byId[id].hi })),
};
fs.writeFileSync(path.join(root, 'content', 'plan.json'), JSON.stringify(plan, null, 1) + '\n');
fs.writeFileSync(path.join(root, 'content', 'index.json'), JSON.stringify({ type: 'library-index', schema: 1, plan: 'plan.json', exercises: index }, null, 1) + '\n');

// sanity: effective sets per muscle at 100%
const tot = Object.fromEntries(MUSCLES.map(([k]) => [k, 0]));
for (const it of plan.items) for (const [m, c] of Object.entries(byId[it.ex].credit)) tot[m] += c * it.sets;
console.log('sets', plan.items.reduce((a, i) => a + i.sets, 0), JSON.stringify(tot));

// Converts free-exercise-db (https://github.com/yuhonas/free-exercise-db, public domain / Unlicense)
// into the app's exercise schema and writes content/library.json.
// Usage: node tools/import-fedb.js <path/to/dist/exercises.json> <commit sha of that checkout>
//
// These exercises are NOT individually reviewed. They're tagged reviewed:false and the app labels them.
// Credit rules (effective sets, Pelland-style fractional counting):
//   primary muscle -> 1
//   listed secondary muscle -> 0.5 only when it is a genuine synergist of the movement pattern (table SYN), compound lifts only
//   stabilizers (grip, bracing, calves in squats, etc.) -> 0
const fs = require('fs');
const path = require('path');
const [, , srcPath, sha] = process.argv;
if (!srcPath || !/^[0-9a-f]{40}$/.test(sha || '')) { console.error('usage: node tools/import-fedb.js <exercises.json> <40-char commit sha>'); process.exit(1); }
const db = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const root = path.join(__dirname, '..');

// The 16 hand-reviewed exercises already cover these, so the database copies are dropped.
const DUPES = new Set(['Leg_Press', 'Wide-Grip_Lat_Pulldown', 'Incline_Dumbbell_Press', 'Seated_Cable_Rows', 'Machine_Shoulder_Military_Press',
  'Leverage_Shoulder_Press', 'Split_Squat_with_Dumbbells', 'Leverage_Chest_Press', 'Machine_Bench_Press', 'Seated_Leg_Curl', 'Side_Lateral_Raise',
  'Reverse_Machine_Flyes', 'Machine_Bicep_Curl', 'Machine_Preacher_Curls', 'Cable_Rope_Overhead_Triceps_Extension', 'Thigh_Adductor',
  'Standing_Calf_Raises', 'Cable_Crunch', 'Stiff-Legged_Dumbbell_Deadlift']);
for (const id of DUPES) if (!db.some(e => e.id === id)) throw new Error('dupe id not found: ' + id);

// Left out: explosive/olympic-style lifts, odd or high-risk positions, rotator-cuff/scapular drills (not hypertrophy work for a tracked muscle).
const EXCLUDE = new RegExp([
  'snatch|clean|jerk|push press|thruster|swing|high pull\\b|throw|toss|jump|hop\\b|bound|sprint|slam|plyo|speed|kipping|muscle up', // explosive
  'behind (the )?neck|neck press|guillotine|bradford|rocky|bench dip',                                                       // shoulder-unfriendly positions
  'get-?up|halo|pirate|iron cross|car drivers|jammer|anti-gravity|battling|sled|windmill|atlas|tire|yoke|figure 8|bent press',  // odd / low value for hypertrophy
  'internal rotation|external rotation|cuban|shoulder raise|scaption|scapular|hip flexion',                                   // rehab drills, untracked muscles
  'judo flip|spell caster|spider crawl|pass between|cocoons|otis|gorilla|rope climb|london bridges|side to side chins|isometric wipers',
  'flutter kicks|downward facing balance|manual|plate movers|jefferson|balance board',
].join('|'), 'i');

// Well-known gym staples: preferred when the database offers several exercises with the same muscle credit.
const STAPLES = new Set(['Barbell Bench Press - Medium Grip', 'Dumbbell Bench Press', 'Barbell Incline Bench Press - Medium Grip', 'Butterfly', 'Cable Crossover',
  'Dumbbell Flyes', 'Pushups', 'Dips - Chest Version', 'Pullups', 'Chin-Up', 'Bent Over Barbell Row', 'One-Arm Dumbbell Row', 'T-Bar Row with Handle',
  'Close-Grip Front Lat Pulldown', 'Straight-Arm Pulldown', 'Face Pull', 'Reverse Flyes', 'Cable Rear Delt Fly', 'Dumbbell Shoulder Press', 'Arnold Dumbbell Press',
  'Front Dumbbell Raise', 'Cable Seated Lateral Raise', 'Upright Barbell Row', 'Barbell Squat', 'Hack Squat', 'Goblet Squat', 'Dumbbell Lunges', 'Leg Extensions',
  'Lying Leg Curls', 'Romanian Deadlift', 'Barbell Deadlift', 'Barbell Hip Thrust', 'Barbell Glute Bridge', 'Barbell Curl', 'Dumbbell Bicep Curl', 'Hammer Curls',
  'Preacher Curl', 'Incline Dumbbell Curl', 'Triceps Pushdown', 'Triceps Pushdown - Rope Attachment', 'Dips - Triceps Version', 'EZ-Bar Skullcrusher',
  'Close-Grip Barbell Bench Press', 'Seated Calf Raise', 'Barbell Shrug', 'Dumbbell Shrug', 'Hyperextensions (Back Extensions)', 'Thigh Abductor',
  'Cable Hip Adduction', 'Hanging Leg Raise', 'Ab Crunch Machine', 'Plank', 'Palms-Up Dumbbell Wrist Curl Over A Bench', 'Palms-Down Dumbbell Wrist Curl Over A Bench']);
const MUSCLE = {
  abdominals: 'abs', abductors: 'abductors', adductors: 'adductors', biceps: 'biceps', calves: 'calves', chest: 'chest', forearms: 'forearms',
  glutes: 'glutes', hamstrings: 'hams', lats: 'back', 'middle back': 'back', 'lower back': 'lowback', neck: 'neck', quadriceps: 'quads',
  traps: 'traps', triceps: 'triceps', shoulders: 'shoulders',
};
// Which deltoid head a "shoulders" exercise trains, from its name; falls back on push/pull and the primary pattern.
function delt(e, primaryApp) {
  const n = e.name.toLowerCase();
  if (/rear|reverse fl|back fly|pull apart|face pull|bent over low-pulley side lateral|row to neck/.test(n)) return 'rdelt';
  if (/lateral|upright.*row|deltoid raise|power partials|^dumbbell raise$/.test(n)) return 'sdelt';
  if (/front|press|arnold|military|push-?up|dip|overhead|handstand|raise/.test(n)) return 'fdelt';
  if (primaryApp === 'back') return 'rdelt';
  if (primaryApp === 'chest' || primaryApp === 'triceps') return 'fdelt';
  return e.force === 'pull' ? 'rdelt' : 'fdelt';
}
// Genuine synergists per primary muscle (compound lifts). Anything else listed as secondary gets 0.
const SYN = {
  chest: { fdelt: .5, triceps: .5 },
  fdelt: { triceps: .5, sdelt: .5 },
  sdelt: { traps: .5 },
  rdelt: { back: .5 },
  triceps: { chest: .5, fdelt: .5 },
  back: { biceps: .5, rdelt: .5 },
  quads: { glutes: .5, adductors: .5 },
  hams: { glutes: .5, lowback: .5, adductors: .5 },
  glutes: { hams: .5 },
  lowback: { glutes: .5, hams: .5 },
  traps: { sdelt: .5 },
};
// Synergists implied by the pattern even when the database doesn't list them; these match the reviewed exercises' credit.
const IMPLIED = {
  chest: e => e.force === 'push' && /press|push-?up|dip/i.test(e.name) ? { fdelt: .5, triceps: .5 } : {},
  fdelt: e => /press|military|arnold/i.test(e.name) ? { triceps: .5, sdelt: .5 } : {},
  back: e => /row|pull[- ]?ups?|chin|pulldown|pull down/i.test(e.name) ? { biceps: .5, rdelt: .5 } : {},
  quads: e => /squat|lunge|leg press|step-?up|hack/i.test(e.name) ? { glutes: .5, adductors: .5 } : {},
  hams: e => /deadlift|good morning|romanian|stiff/i.test(e.name) ? { glutes: .5, adductors: .5, lowback: .5 } : {},
};
const EQUIP = { barbell: 'barbell', dumbbell: 'dumbbell', cable: 'cable', machine: 'machine', 'e-z curl bar': 'ez bar', 'body only': 'bodyweight',
  kettlebells: 'kettlebell', bands: 'bands', 'medicine ball': 'medicine ball', 'exercise ball': 'exercise ball', other: 'other' };
const EQUIP_LABEL = { barbell: 'Barbell', dumbbell: 'Dumbbells', cable: 'Cable station', machine: 'Machine', 'ez bar': 'EZ curl bar', bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell', bands: 'Resistance band', 'medicine ball': 'Medicine ball', 'exercise ball': 'Exercise ball', other: 'Other equipment' };

const slug = id => ('db-' + id.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')).slice(0, 48).replace(/[_-]+$/, '');
const short = n => n.length <= 24 ? n : n.slice(0, 23).replace(/\s+\S*$/, '') + '…';
const IMG_OK = /^[A-Za-z0-9_\-()',.]+\/\d\.jpg$/;

const out = [], skipped = { category: 0, dupe: 0, excluded: 0, noInstr: 0, noCredit: 0 }, used = new Set();
for (const e of db) {
  if (!['strength', 'powerlifting'].includes(e.category)) { skipped.category++; continue; }
  if (DUPES.has(e.id)) { skipped.dupe++; continue; }
  if (EXCLUDE.test(e.name)) { skipped.excluded++; continue; }
  if (!e.instructions || !e.instructions.length) { skipped.noInstr++; continue; }
  const compound = e.mechanic === 'compound';
  const prim = e.primaryMuscles.map(m => MUSCLE[m]).filter(Boolean);
  const primApp = prim.map(m => m === 'shoulders' ? delt(e) : m);
  const credit = {};
  for (const m of primApp) credit[m] = 1;
  const p0 = primApp[0];
  if (compound) {
    for (const s of e.secondaryMuscles) {
      let m = MUSCLE[s]; if (!m) continue;
      if (m === 'shoulders') m = delt(e, p0);
      if (credit[m]) continue;
      const v = (SYN[p0] || {})[m];
      if (v) credit[m] = v;
    }
    for (const [m, v] of Object.entries((IMPLIED[p0] || (() => ({})))(e))) if (!credit[m]) credit[m] = v;
  }
  if (p0 === 'biceps' && /hammer|reverse|zottman/i.test(e.name)) credit.forearms = credit.forearms || .5; // brachioradialis
  // Corrections where the database's primary muscle is off for hypertrophy counting.
  const n = e.name;
  if (/upright.*row/i.test(n)) { for (const k in credit) delete credit[k]; Object.assign(credit, { sdelt: 1, traps: .5 }); }
  else if (/adduction/i.test(n)) { for (const k in credit) delete credit[k]; credit.adductors = 1; }
  else if (/pullover/i.test(n)) { const chestFirst = p0 === 'chest'; for (const k in credit) delete credit[k]; Object.assign(credit, chestFirst ? { chest: 1, back: .5 } : { back: 1, chest: .5 }); }
  else if (p0 === 'triceps' && /bench press|floor press|board press|pin press/i.test(n) && !/close|reverse triceps|jm press/i.test(n)) { for (const k in credit) delete credit[k]; Object.assign(credit, { chest: 1, fdelt: .5, triceps: .5 }); }
  if (!Object.keys(credit).length) { skipped.noCredit++; continue; }
  let id = slug(e.id); for (let k = 2; used.has(id); k++) id = slug(e.id).slice(0, 45) + '-' + k;
  used.add(id);
  const equip = EQUIP[e.equipment] || 'other';
  // Heavy multi-joint work for big muscles: 6-10 reps, 2.5 min rest. Everything else (small muscles, even if the database
  // calls the movement compound, e.g. face pulls): 10-15 reps, 90 s, matching the reviewed exercises.
  const big = Object.keys(credit).filter(m => credit[m] >= 1);
  const heavy = compound && big.some(m => ['chest', 'back', 'quads', 'hams', 'glutes', 'lowback'].includes(m) ||
    (['fdelt', 'triceps'].includes(m) && /press|dip/i.test(e.name)));
  const perSide = /one[- ]arm|single[- ]arm|one[- ]leg|single[- ]leg|unilateral|lunge|split squat|step[- ]?up|bulgarian|alternat/i.test(e.name);
  out.push({
    type: 'exercise', schema: 1, id, version: 1, name: e.name, short: short(e.name),
    equipment: EQUIP_LABEL[equip], equip, unit: 'lb', step: equip === 'dumbbell' && !compound ? 2.5 : 5, perSide,
    rest: heavy ? 150 : 90, lo: heavy ? 6 : 10, hi: heavy ? 10 : 15,
    level: ['beginner', 'intermediate', 'expert'].includes(e.level) ? e.level : 'intermediate',
    mechanic: compound ? 'compound' : 'isolation', reviewed: false, common: STAPLES.has(e.name), source: 'free-exercise-db',
    credit, cues: e.instructions.map(s => s.trim()).filter(Boolean),
    safety: 'Not reviewed. These steps come from the free-exercise-db and haven\'t been checked like the core exercises. Start light, watch a demo first, and stop if anything pinches or hurts.',
    refs: [
      { title: 'Source entry (free-exercise-db)', url: `https://github.com/yuhonas/free-exercise-db/blob/${sha}/exercises/${encodeURIComponent(e.id)}.json` },
      { title: 'Form videos (YouTube search)', url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(e.name + ' exercise form') },
    ],
    images: (e.images || []).filter(p => IMG_OK.test(p)).slice(0, 2),
  });
}
out.sort((a, b) => a.name.localeCompare(b.name));
const missing = [...STAPLES].filter(n => !out.some(e => e.name === n));
if (missing.length) throw new Error('staples not found: ' + missing.join(', '));
const lib = { type: 'bundle', schema: 1, kind: 'library', source: 'https://github.com/yuhonas/free-exercise-db', sourceCommit: sha, license: 'Unlicense (public domain)',
  imageBase: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${sha}/exercises/`, exercises: out };
fs.writeFileSync(path.join(root, 'content', 'library.json'), JSON.stringify(lib) + '\n');
console.log('wrote', out.length, 'exercises', JSON.stringify(skipped));
if (process.env.DUMP) {
  const by = {};
  for (const e of out) { const k = Object.keys(e.credit).find(m => e.credit[m] === 1); (by[k] = by[k] || []).push(e); }
  for (const [k, list] of Object.entries(by).sort()) {
    console.log(`\n## ${k} (${list.length})`);
    for (const e of list) console.log(`${e.mechanic[0]} ${e.level[0]} ${e.equip.padEnd(10)} ${e.name} :: ${Object.entries(e.credit).filter(([, v]) => v < 1).map(([m, v]) => m + '½').join(' ')}`);
  }
}

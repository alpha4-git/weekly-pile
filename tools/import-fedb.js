// Builds content/library.json from free-exercise-db (https://github.com/yuhonas/free-exercise-db, Unlicense)
// using ONLY the hand-reviewed entries in tools/reviewed/*.js. Database exercises that haven't been reviewed are left out.
// Usage: node tools/import-fedb.js <path/to/dist/exercises.json> <commit sha of that checkout>
//
// From the database: the photos (start/finish, in reviewed order) and the equipment type.
// From the review: name, cues, safety note, muscle credit, emphasis (variant), rep range, rest, level, references.
const fs = require('fs');
const path = require('path');
const [, , srcPath, sha] = process.argv;
if (!srcPath || !/^[0-9a-f]{40}$/.test(sha || '')) { console.error('usage: node tools/import-fedb.js <exercises.json> <40-char commit sha>'); process.exit(1); }
const db = new Map(JSON.parse(fs.readFileSync(srcPath, 'utf8')).map(e => [e.id, e]));
const root = path.join(__dirname, '..');
const dir = path.join(__dirname, 'reviewed');
const FILES = ['chest', 'back', 'hinge', 'shoulders', 'arms', 'legs', 'hips-calves', 'core-other'];
const reviewed = FILES.flatMap(f => require(path.join(dir, f + '.js')));

// Bump when any reviewed entry changes, so phones replace their copies.
const VERSION = 4;   // v1: unreviewed import; v2: first reviewed set; v3: every entry re-checked claim by claim against its reference; v4: full review of the cut entries + photo-vs-cue sweep
const MUSCLES = new Set(['chest', 'back', 'fdelt', 'sdelt', 'rdelt', 'biceps', 'triceps', 'quads', 'glutes', 'adductors', 'hams', 'calves', 'abs',
  'traps', 'lowback', 'forearms', 'abductors', 'neck']);
const EQUIP = { barbell: 'barbell', dumbbell: 'dumbbell', cable: 'cable', machine: 'machine', 'e-z curl bar': 'ez bar', 'body only': 'bodyweight',
  kettlebells: 'kettlebell', bands: 'bands', 'medicine ball': 'medicine ball', 'exercise ball': 'exercise ball', other: 'other' };
const EQUIP_LABEL = { barbell: 'Barbell', dumbbell: 'Dumbbells', cable: 'Cable station', machine: 'Machine', 'ez bar': 'EZ curl bar', bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebells', bands: 'Resistance band', 'medicine ball': 'Medicine ball', 'exercise ball': 'Exercise ball', other: 'Other equipment' };
// The database's equipment tag is wrong or too vague for a few entries.
const EQUIP_FIX = { Decline_Push_Up: 'bodyweight', 'Decline_Push-Up': 'bodyweight', Inverted_Row: 'bodyweight', Bodyweight_Walking_Lunge: 'bodyweight',
  'Dips_-_Chest_Version': 'bodyweight', Band_Assisted_Pull_Up: 'bands', 'Band_Assisted_Pull-Up': 'bands', Hyperextensions_Back_Extensions: 'machine',
  Trap_Bar_Deadlift: 'barbell', Front_Plate_Raise: 'other', Knee_Hip_Raise_On_Parallel_Bars: 'machine', Ab_Roller: 'other', Goblet_Squat: 'dumbbell' };
// The standard version people know: preferred over equivalent variants when the engine has to break a tie.
const STAPLES = new Set(['Barbell_Bench_Press_-_Medium_Grip', 'Dumbbell_Bench_Press', 'Barbell_Incline_Bench_Press_-_Medium_Grip', 'Butterfly',
  'Cable_Crossover', 'Dumbbell_Flyes', 'Pushups', 'Dips_-_Chest_Version', 'Pullups', 'Chin-Up', 'One-Arm_Dumbbell_Row', 'Bent_Over_Barbell_Row',
  'Dumbbell_Incline_Row', 'Leverage_Iso_Row', 'Straight-Arm_Pulldown', 'Barbell_Deadlift', 'Romanian_Deadlift', 'Hyperextensions_Back_Extensions',
  'Dumbbell_Shoulder_Press', 'Standing_Military_Press', 'Front_Dumbbell_Raise', 'Standing_Low-Pulley_Deltoid_Raise', 'Face_Pull', 'Reverse_Flyes',
  'Cable_Rear_Delt_Fly', 'Barbell_Curl', 'EZ-Bar_Curl', 'Dumbbell_Bicep_Curl', 'Hammer_Curls', 'Incline_Dumbbell_Curl', 'Preacher_Curl',
  'Triceps_Pushdown', 'Triceps_Pushdown_-_Rope_Attachment', 'EZ-Bar_Skullcrusher', 'Standing_Dumbbell_Triceps_Extension',
  'Close-Grip_Barbell_Bench_Press', 'Barbell_Squat', 'Goblet_Squat', 'Hack_Squat', 'Leg_Extensions', 'Dumbbell_Lunges', 'Dumbbell_Rear_Lunge',
  'Lying_Leg_Curls', 'Barbell_Hip_Thrust', 'Seated_Calf_Raise', 'Cable_Hip_Adduction', 'Thigh_Abductor', 'Crunches', 'Ab_Crunch_Machine',
  'Hanging_Leg_Raise', 'Knee_Hip_Raise_On_Parallel_Bars', 'Plank', 'Barbell_Shrug', 'Dumbbell_Shrug', 'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench',
  'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench']);
const IMG_OK = /^[A-Za-z0-9_\-()',.]+\/\d\.jpg$/;
const slug = id => ('db-' + id.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')).slice(0, 48).replace(/[_-]+$/, '');

const out = [], problems = [], used = new Set();
for (const r of reviewed) {
  const e = db.get(r.id);
  if (!e) { problems.push(`${r.id}: not in the database`); continue; }
  const credit = r.credit || {};
  if (!Object.keys(credit).length || Object.entries(credit).some(([m, v]) => !MUSCLES.has(m) || !(v === 1 || v === 0.5))) problems.push(`${r.id}: bad credit ${JSON.stringify(credit)}`);
  if (!Object.values(credit).includes(1)) problems.push(`${r.id}: no full-credit muscle`);
  if (!r.cues || r.cues.length < 2) problems.push(`${r.id}: too few cues`);
  const refs = (Array.isArray(r.ref) ? r.ref : [r.ref]).filter(Boolean);
  if (!refs.length || refs.some(x => !/^https:\/\//.test(x.url))) problems.push(`${r.id}: missing reference`);
  if (!r.variant) problems.push(`${r.id}: missing variant`);
  if (!(r.lo > 0 && r.hi >= r.lo && r.rest >= 15)) problems.push(`${r.id}: bad reps/rest`);
  const images = (e.images || []).filter(p => IMG_OK.test(p)).slice(0, 2);
  if (images.length !== 2) problems.push(`${r.id}: expected 2 photos, found ${images.length}`);
  if (r.swap) images.reverse();
  const id = slug(e.id);
  if (used.has(id)) problems.push(`${r.id}: id collision ${id}`);
  used.add(id);
  const equip = EQUIP_FIX[e.id] || EQUIP[e.equipment] || 'other';
  out.push({
    type: 'exercise', schema: 1, id, version: VERSION, name: r.name, short: r.short || r.name.slice(0, 24),
    equipment: EQUIP_LABEL[equip], equip, unit: 'lb', step: 5, perSide: !!r.perSide, timed: !!r.timed,
    rest: r.rest, lo: r.lo, hi: r.hi, level: r.level || 'beginner', mechanic: e.mechanic === 'isolation' ? 'isolation' : 'compound',
    reviewed: true, common: STAPLES.has(e.id), source: 'free-exercise-db', variant: r.variant, credit,
    cues: r.cues, safety: r.safety || '',
    refs: [...refs, { title: 'Photos: free-exercise-db', url: `https://github.com/yuhonas/free-exercise-db/blob/${sha}/exercises/${encodeURIComponent(e.id)}.json` }],
    images,
  });
}
for (const id of STAPLES) if (!reviewed.some(r => r.id === id)) problems.push(`staple ${id} is not a reviewed entry`);
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
out.sort((a, b) => a.name.localeCompare(b.name));
const lib = { type: 'bundle', schema: 1, kind: 'library', source: 'https://github.com/yuhonas/free-exercise-db', sourceCommit: sha,
  license: 'Unlicense (public domain)', reviewed: true, exercises: out };
fs.writeFileSync(path.join(root, 'content', 'library.json'), JSON.stringify(lib) + '\n');
console.log('wrote', out.length, 'reviewed exercises');

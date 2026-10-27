// Abs, upper traps and forearms. Reviewed against StrengthLog exercise pages (linked per entry) and the database photos.
// Not yet reviewed (reference pages couldn't be loaded): sit-up, behind-the-back wrist curl, wrist roller, plate pinch, neck work.
const SL = s => ({ title: 'StrengthLog: ' + s[0], url: 'https://www.strengthlog.com/' + s[1] + '/' });
const ABS = SL(['Ab exercises', 'ab-exercises']);
const OBL = SL(['Oblique exercises', 'oblique-exercises']);
const SWING = 'Slow and controlled; no swinging or momentum.';
module.exports = [
  {
    id: 'Crunches', name: 'Crunch', short: 'Crunch', variant: 'Crunch',
    credit: { abs: 1 }, lo: 12, hi: 20, rest: 60, level: 'beginner',
    cues: ['Lie on your back, knees bent to about 90°, hands across your chest (or lightly at your temples).', 'Curl your upper body forward by contracting your abs.', 'Go as far as you can while your lower back stays on the floor, then lower slowly.'],
    safety: 'Don\'t pull on your head or neck; the abs do the lifting. Hold a plate on your chest when 20 reps gets easy.', ref: SL(['Crunches', 'crunch']),
  },
  {
    id: 'Ab_Crunch_Machine', name: 'Ab crunch machine', short: 'Machine crunch', variant: 'Crunch',
    credit: { abs: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Adjust the seat and pads to fit you, sit down and grip the handles.', 'Curl your torso forward by contracting your abs, not by pulling with your arms.', 'Return slowly under control.'],
    safety: SWING, ref: SL(['Machine crunch', 'machine-crunch']),
  },
  {
    id: 'Hanging_Leg_Raise', name: 'Hanging leg raise', short: 'Hanging leg raise', variant: 'Leg raise',
    credit: { abs: 1 }, lo: 8, hi: 15, rest: 90, level: 'intermediate',
    cues: ['Hang from a bar high enough that your legs hang straight.', 'Raise your legs (or knees, to make it easier) as high as you can in front of you, curling your pelvis up at the top.', 'Lower under control without swinging.'],
    safety: SWING + ' The hip flexors work hard here too; bending the knees makes it easier.', ref: SL(['Hanging leg raise', 'hanging-leg-raise']),
  },
  {
    id: 'Knee_Hip_Raise_On_Parallel_Bars', name: 'Captain\'s chair knee raise', short: 'Captain\'s chair', variant: 'Leg raise',
    credit: { abs: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Rest your forearms on the arm pads, back against the back pad, legs hanging straight down.', 'Brace and raise your knees toward your chest; pause at the top.', 'Lower your legs under control.'],
    safety: SWING, ref: SL(['Captain\'s chair knee raise', 'captains-chair-knee-raise']),
  },
  {
    id: 'Flat_Bench_Lying_Leg_Raise', name: 'Lying leg raise', short: 'Lying leg raise', variant: 'Leg raise',
    credit: { abs: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Lie on your back on a bench (or the floor), hands holding the bench behind your head or at your sides.', 'Keeping your legs straight, lift them until they point straight up.', 'Lower them slowly, stopping before your lower back arches off the bench.'],
    safety: 'Bend your knees slightly to make it easier. If your lower back lifts off, shorten the lowering.', ref: SL(['Lying leg raise', 'lying-leg-raise']),
  },
  {
    id: 'Jackknife_Sit-Up', name: 'Jackknife sit-up (V-up)', short: 'V-up', variant: 'V-up',
    credit: { abs: 1 }, lo: 8, hi: 15, rest: 60, level: 'intermediate',
    cues: ['Lie on your back, arms straight overhead, legs straight.', 'Lift your legs and upper body together, reaching your hands toward your toes into a "V".', 'Pause briefly and lower with control, without letting your feet or arms touch the floor between reps.'],
    safety: 'Demanding on balance and the hip flexors; bend the knees slightly if needed.', ref: SL(['Jackknife sit-up', 'jackknife-sit-up']),
  },
  {
    id: 'Plank', name: 'Plank', short: 'Plank', variant: 'Anti-extension', timed: true,
    credit: { abs: 1 }, lo: 30, hi: 60, rest: 60, level: 'beginner',
    cues: ['Rest on your forearms and toes, elbows directly under your shoulders.', 'Brace your abs and squeeze your glutes; body in a straight line from head to heels.', 'Hold for the target time. Log the seconds held in the reps box.'],
    safety: 'Stop when your hips sag or pike. Moving your elbows a little further forward makes it harder.', ref: ABS,
  },
  {
    id: 'Ab_Roller', name: 'Ab wheel roll-out (kneeling)', short: 'Ab wheel', variant: 'Anti-extension',
    credit: { abs: 1 }, lo: 6, hi: 12, rest: 90, level: 'intermediate',
    cues: ['Kneel with your hands on the wheel directly in front of your knees.', 'Brace and roll forward until your body forms a straight line from knees to head, back flat.', 'Pull back to the start with your abs.'],
    safety: 'Keep your back straight; if your lower back sags, roll out less far. The straight-leg version is for experienced trainees only.', ref: ABS,
  },
  {
    id: 'Dead_Bug', name: 'Dead bug', short: 'Dead bug', variant: 'Anti-extension',
    credit: { abs: 1 }, lo: 8, hi: 12, rest: 60, level: 'beginner',
    cues: ['Lie on your back, arms straight up, knees bent 90° over your hips.', 'Press your lower back into the floor and brace.', 'Slowly straighten one leg toward the floor while lowering the opposite arm overhead.', 'Return and switch sides. Count reps per side.'],
    safety: 'Your lower back must stay on the floor the whole time; reduce the reach if it lifts.', ref: SL(['Dead bugs', 'dead-bugs']),
  },
  {
    id: 'Air_Bike', name: 'Bicycle crunch', short: 'Bicycle crunch', variant: 'Obliques',
    credit: { abs: 1 }, lo: 10, hi: 20, rest: 60, level: 'beginner',
    cues: ['Lie on your back, fingertips at your temples, knees bent 90° in the air.', 'Lift your head and shoulders, then extend one leg while rotating to bring the opposite elbow toward the bent knee.', 'Alternate sides in a steady, controlled pedaling rhythm. Count reps per side.'],
    safety: 'Rotate with your trunk, not by yanking your head with your hands.', ref: SL(['Bicycle crunch', 'bicycle-crunch']),
  },
  {
    id: 'Oblique_Crunches', name: 'Oblique crunch', short: 'Oblique crunch', variant: 'Obliques',
    credit: { abs: 1 }, lo: 10, hi: 20, rest: 60, level: 'beginner',
    cues: ['Lie on your back, knees bent (or calves on a bench), fingertips at the sides of your head.', 'Lift your shoulders and twist so one elbow moves diagonally toward the opposite knee; pause.', 'Lower without fully relaxing, then repeat or alternate sides.'],
    safety: 'Don\'t pull on your neck. Hold a plate on your chest when it gets easy.', ref: OBL,
  },
  {
    id: 'Dumbbell_Side_Bend', name: 'Dumbbell side bend', short: 'Side bend', variant: 'Obliques', perSide: true,
    credit: { abs: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Stand with feet shoulder-width, a dumbbell in one hand, the other hand on your hip.', 'Bend slowly straight to the dumbbell side, sliding it down your leg to a comfortable depth.', 'Come back up using the obliques on the other side. Finish the reps, then switch.'],
    safety: 'Stay in one plane: don\'t lean forward or back. No momentum. One set = both sides.', ref: SL(['Dumbbell side bend', 'dumbbell-side-bend']),
  },
  {
    id: 'Pallof_Press', name: 'Pallof press', short: 'Pallof press', variant: 'Anti-rotation', perSide: true,
    credit: { abs: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Set a handle on the cable at chest height and stand side-on, feet hip-width, knees slightly bent.', 'Hold the handle at your chest with both hands and brace.', 'Press it straight out in front of you without letting your torso turn; hold briefly.', 'Bring it back to your chest. Finish the reps, then switch sides.'],
    safety: 'The point is not moving: pick a weight you can resist without twisting. One set = both sides.', ref: SL(['Pallof press', 'pallof-press']),
  },
  {
    id: 'Standing_Cable_Lift', name: 'Cable wood chop (low to high)', short: 'Wood chop', variant: 'Obliques', perSide: true,
    credit: { abs: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Set a handle at the lowest position, grip it with both hands, step away and stand side-on.', 'Arms almost straight throughout.', 'Sweep the handle diagonally up and across your body, rotating through your trunk.', 'Return under control. Finish the reps, then switch sides.'],
    safety: 'Rotate through the trunk and hips smoothly; no jerking. One set = both sides.', ref: SL(['Cable wood chop (low to high)', 'cable-machine-wood-chop-low-to-high']),
  },
  {
    id: 'Barbell_Shrug', name: 'Barbell shrug', short: 'Barbell shrug', variant: 'Shrug',
    credit: { traps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Hold a barbell in front of your thighs with straight arms, overhand grip.', 'Raise your shoulders straight up as high as you can; pause briefly.', 'Lower them slowly.'],
    safety: 'Straight up and down; don\'t roll the shoulders. Straps are fine if your grip gives out first.', ref: SL(['Barbell shrug', 'barbell-shrug']),
  },
  {
    id: 'Dumbbell_Shrug', name: 'Dumbbell shrug', short: 'DB shrug', variant: 'Shrug',
    credit: { traps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Hold a dumbbell in each hand at your sides, arms straight and relaxed, core tight.', 'Lift your shoulders straight up as high as you can and pause briefly.', 'Lower slowly.'],
    safety: 'Move from the shoulders only, straight up and down. Straps let your traps, not your grip, set the weight.', ref: SL(['Dumbbell shrug', 'dumbbell-shrug']),
  },
  {
    id: 'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench', name: 'Dumbbell wrist curl', short: 'DB wrist curl', variant: 'Wrist flexion',
    credit: { forearms: 1 }, lo: 15, hi: 20, rest: 60, level: 'beginner',
    cues: ['Kneel or sit with your forearms on a bench, hands past the edge, dumbbells held palms up.', 'Lower your hands and let the dumbbells roll out to your fingers.', 'Close your grip and curl your wrists up as far as you can.'],
    safety: 'Light weights and full, slow range; forearm tendons dislike heavy jerky reps.', ref: SL(['Dumbbell wrist curl', 'dumbbell-wrist-curl']),
  },
  {
    id: 'Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench', name: 'Dumbbell wrist extension', short: 'DB wrist extension', variant: 'Wrist extension',
    credit: { forearms: 1 }, lo: 15, hi: 20, rest: 60, level: 'beginner',
    cues: ['Rest your forearms on a bench, hands past the edge, dumbbells held palms down.', 'Lower your hands toward the floor.', 'Raise the backs of your hands as high as you can.'],
    safety: 'Use much less weight than for wrist curls; slow, full reps.', ref: SL(['Dumbbell wrist extension', 'dumbbell-wrist-extension']),
  },
  {
    id: 'Seated_Palm-Up_Barbell_Wrist_Curl', name: 'Barbell wrist curl', short: 'Barbell wrist curl', variant: 'Wrist flexion',
    credit: { forearms: 1 }, lo: 15, hi: 20, rest: 60, level: 'beginner',
    cues: ['Sit with your forearms on your thighs, wrists just past your knees, barbell held palms up.', 'Let your hands drop and the bar roll out to your fingertips.', 'Close your grip and curl your wrists up.'],
    safety: 'Keep the forearms still on your thighs; only the wrists move.', ref: SL(['Barbell wrist curl', 'barbell-wrist-curl']),
  },
  {
    id: 'Seated_Palms-Down_Barbell_Wrist_Curl', name: 'Barbell wrist extension', short: 'BB wrist extension', variant: 'Wrist extension',
    credit: { forearms: 1 }, lo: 15, hi: 20, rest: 60, level: 'beginner',
    cues: ['Sit with your forearms on your thighs, wrists just past your knees, barbell held palms down.', 'Lower your hands toward the floor.', 'Raise the backs of your hands as high as you can.'],
    safety: 'Light weight, slow reps.', ref: SL(['Dumbbell wrist extension (barbell variation)', 'dumbbell-wrist-extension']),
  },
];

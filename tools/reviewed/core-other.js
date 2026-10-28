// Abs, upper traps and forearms. Reviewed against StrengthLog exercise pages (linked per entry) and the database photos.
const SL = s => ({ title: 'StrengthLog: ' + s[0], url: 'https://www.strengthlog.com/' + s[1] + '/' });
const ABS = SL(['Ab exercises', 'ab-exercises']);
const OBL = SL(['Oblique exercises', 'oblique-exercises']);
const SWING = 'Slow and controlled; no swinging or momentum.';
module.exports = [
  {
    id: 'Crunches', name: 'Crunch', short: 'Crunch', variant: 'Crunch',
    credit: { abs: 1 }, lo: 12, hi: 20, rest: 60, level: 'beginner',
    cues: ['Lie on your back, knees bent to about 90°, hands in front of your chest.', 'Lift your upper body by contracting your abs and bending forward.', 'Bend as far forward as you can while your lower back stays on the floor, then return to the start.'],
    safety: 'Hold a weight against your chest to make it harder.', ref: SL(['Crunches', 'crunch']),
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
    id: 'Sit-Up', name: 'Sit-up', short: 'Sit-up', variant: 'Sit-up',
    credit: { abs: 1 }, lo: 10, hi: 20, rest: 60, level: 'beginner',
    cues: ['Lie on your back, knees bent to about 90°, feet hooked under something that won\'t move.', 'Hands in front of your chest (the reference\'s position; the photos show hands behind the head).', 'Lift your upper body by contracting your abs and bend forward as far as you can.', 'Return to the starting position.'],
    safety: 'Hold a weight against your chest to make it harder.', ref: SL(['Sit-up', 'sit-up']),
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
    cues: ['Lie on your back, hands behind your head, legs raised with knees bent to 90°.', 'Lift your head and shoulders, then extend one leg while rotating to bring the opposite elbow toward the bent knee.', 'Alternate sides in a steady, controlled pedaling rhythm. Count reps per side.'],
    safety: 'Rotate your torso; don\'t pull on your neck with your hands.', ref: [SL(['Bicycle crunch', 'bicycle-crunch']), OBL],
  },
  {
    id: 'Oblique_Crunches', name: 'Oblique crunch', short: 'Oblique crunch', variant: 'Obliques',
    credit: { abs: 1 }, lo: 10, hi: 20, rest: 60, level: 'beginner',
    cues: ['Lie on your back, knees bent, feet flat and hip-width apart, hands at the sides of your head.', 'Lift your shoulders and twist so one elbow moves diagonally toward the opposite knee; pause.', 'Lower without fully relaxing, then repeat or alternate sides.'],
    safety: 'Don\'t pull on your neck with your hands. When you can do more reps than planned, hold a plate or dumbbell to your chest.', ref: OBL,
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
    safety: 'Use a light weight and a slow, full range.', ref: SL(['Dumbbell wrist curl', 'dumbbell-wrist-curl']),
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
  {
    id: 'Standing_Palms-Up_Barbell_Behind_The_Back_Wrist_Curl', name: 'Barbell wrist curl behind the back', short: 'Behind-back curl', variant: 'Wrist flexion', swap: true,
    credit: { forearms: 1 }, lo: 15, hi: 20, rest: 60, level: 'beginner',
    cues: ['Stand holding a barbell behind your back at arm\'s length, hands shoulder-width, palms facing back.', 'Open your hands and let the bar roll out into your fingers.', 'Close your grip and curl your wrists up. Only the hands and wrists move.'],
    safety: 'Easiest to take the bar from a rack set at hip height and put it back there.', ref: SL(['Barbell wrist curl behind the back', 'barbell-wrist-curl-behind-the-back']),
  },
  {
    id: 'Wrist_Roller', name: 'Wrist roller', short: 'Wrist roller', variant: 'Wrist roller', swap: true,
    credit: { forearms: 1 }, lo: 3, hi: 5, rest: 90, level: 'beginner',
    cues: ['Stand with feet shoulder-width, holding the roller in both hands, arms straight out in front of you, weight hanging on the cord.', 'Roll the bar forward with your wrists, winding the cord until the weight reaches the bar.', 'Slowly reverse the motion to lower the weight back down. One rep = all the way up and down.'],
    safety: 'Lower slowly by unwinding; don\'t let the weight drop.', ref: SL(['Wrist roller', 'wrist-roller']),
  },
  {
    id: 'Plate_Pinch', name: 'Plate pinch', short: 'Plate pinch', variant: 'Pinch grip', timed: true, perSide: true,
    credit: { forearms: 1 }, lo: 20, hi: 40, rest: 90, level: 'intermediate',
    cues: ['Put two plates together, smooth sides facing out.', 'Pinch them with your fingers on one side and your thumb on the other, and lift them off the floor.', 'Hold as long as you can, then put them down under control. Log the seconds held; switch hands.'],
    safety: 'The plates\' surface and chalk change how much you can hold a lot; compare like with like.', ref: SL(['Plate pinch', 'plate-pinch']),
  },
  {
    id: 'Lying_Face_Down_Plate_Neck_Resistance', name: 'Lying neck extension (plate)', short: 'Neck extension', variant: 'Extension',
    credit: { neck: 1 }, lo: 12, hi: 15, rest: 60, level: 'intermediate',
    cues: ['Lie face down on a flat bench, chest and stomach supported, head just off the end; feet on the floor for balance.', 'Hold a plate on the back of your head with both hands (a folded towel underneath is more comfortable).', 'Start with your chin slightly tucked and your neck neutral, then raise the back of your head toward the ceiling.', 'Pause briefly at the top, then lower slowly back to the start. No jerky movements.'],
    safety: 'Your neck is sensitive: start very light, move slowly and avoid extreme ranges (the first photo drops the head further than needed). Do neck work at the end of a workout. If you\'ve had neck or cervical spine problems, see a doctor or physio first.',
    ref: [SL(['Lying neck extension', 'lying-neck-extension']), SL(['Neck exercises', 'neck-muscles-exercises-workout'])],
  },
  {
    id: 'Lying_Face_Up_Plate_Neck_Resistance', name: 'Lying neck curl (plate)', short: 'Neck curl', variant: 'Flexion',
    credit: { neck: 1 }, lo: 12, hi: 15, rest: 60, level: 'intermediate',
    cues: ['Lie on your back on a flat bench with your head slightly past the end.', 'Put a folded towel on your forehead and hold a plate on it with both hands; the hands only balance it, they don\'t lift.', 'Tuck your chin slightly and keep it tucked, then curl your head toward your chest without lifting your shoulders.', 'Pause briefly, then lower slowly back to the start.'],
    safety: 'Your neck is sensitive: start very light, move slowly and avoid extreme ranges. Do neck work at the end of a workout. If you\'ve had neck or cervical spine problems, see a doctor or physio first.',
    ref: [SL(['Lying neck curl', 'lying-neck-curl']), SL(['Neck exercises', 'neck-muscles-exercises-workout'])],
  },
];

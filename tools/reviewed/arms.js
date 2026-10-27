// Biceps and triceps. Reviewed against StrengthLog exercise pages (linked per entry) and the database photos.
// Variants describe arm position or grip; head-specific labels are used only where the reference backs them
// (overhead extensions and the triceps long head: Eur J Sport Sci 2023, cited on StrengthLog's long-head page).
const SL = s => ({ title: 'StrengthLog: ' + s[0], url: 'https://www.strengthlog.com/' + s[1] + '/' });
const TYPES = SL(['Types of dumbbell curls', 'different-types-of-dumbbell-curls']);
const LONG = SL(['Long-head triceps exercises', 'long-head-triceps-exercises']);
const CURL = 'Upper arms stay at your sides (or drift slightly forward); if you have to swing, the weight is too heavy. Keep your wrists straight.';
const STD = 'Standard curl', BEHIND = 'Arm behind body', FRONT = 'Arm in front (preacher)', NEUTRAL = 'Neutral grip · brachialis', REV = 'Reverse grip · forearms';
const EXT = 'Keep your elbows pointing forward at a constant width; flaring them stresses the shoulder. Heavy low-rep extensions can bother the elbows, so favor 10–15 reps.';
module.exports = [
  // ---------------------------------------------------------------- biceps
  {
    id: 'Barbell_Curl', name: 'Barbell curl', short: 'Barbell curl', variant: STD,
    credit: { biceps: 1 }, lo: 8, hi: 12, rest: 90, level: 'beginner',
    cues: ['Stand tall, feet hip-width, core braced. Grip the bar underhand about shoulder-width.', 'Curl the bar up by bending only your elbows.', 'Lower under control to straight arms.'],
    safety: CURL, ref: SL(['Barbell curl', 'barbell-curl']),
  },
  {
    id: 'EZ-Bar_Curl', name: 'EZ-bar curl', short: 'EZ curl', variant: STD,
    credit: { biceps: 1 }, lo: 8, hi: 12, rest: 90, level: 'beginner',
    cues: ['Grip the EZ bar underhand on the angled parts, feet about shoulder-width, core braced.', 'Curl the bar toward your chest with your elbows close to your body; pause briefly at the top.', 'Lower slowly to straight arms.'],
    safety: CURL + ' The angled grip is easier on the wrists than a straight bar.', ref: SL(['EZ curl', 'ez-curl']),
  },
  {
    id: 'Dumbbell_Bicep_Curl', name: 'Dumbbell curl', short: 'DB curl', variant: STD,
    credit: { biceps: 1 }, lo: 8, hi: 12, rest: 90, level: 'beginner',
    cues: ['Stand tall with the dumbbells at your sides, palms facing forward, elbows close to your body.', 'Curl both dumbbells up by bending only your elbows.', 'Lower under control to straight arms.'],
    safety: CURL, ref: SL(['Dumbbell curl', 'dumbbell-curl']),
  },
  {
    id: 'Dumbbell_Alternate_Bicep_Curl', name: 'Alternating dumbbell curl', short: 'Alt DB curl', variant: STD,
    credit: { biceps: 1 }, lo: 8, hi: 12, rest: 90, level: 'beginner',
    cues: ['Stand tall with the dumbbells at your sides, elbows close to your body.', 'Curl one dumbbell, turning the palm up as it rises.', 'Lower it under control, then curl the other. One rep = both arms.'],
    safety: CURL, ref: SL(['Dumbbell curl', 'dumbbell-curl']),
  },
  {
    id: 'Hammer_Curls', name: 'Hammer curl', short: 'Hammer curl', variant: NEUTRAL,
    credit: { biceps: 1, forearms: 0.5 }, lo: 8, hi: 12, rest: 90, level: 'beginner',
    cues: ['Stand with the dumbbells at your sides, palms facing each other.', 'Curl them up keeping the palms facing each other (thumbs up), upper arms close to your body.', 'Lower under control.'],
    safety: CURL + ' Don\'t twist the wrists.', ref: SL(['Hammer curl', 'hammer-curl']),
  },
  {
    id: 'Cable_Hammer_Curls_-_Rope_Attachment', name: 'Cable rope hammer curl', short: 'Rope hammer curl', variant: NEUTRAL,
    credit: { biceps: 1, forearms: 0.5 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Attach a rope to the low pulley, grip it with palms facing each other, and step back.', 'Curl the rope up by bending your elbows; upper arms stay still.', 'Lower with control.'],
    safety: CURL, ref: SL(['Cable curl with rope', 'cable-curl-with-rope']),
  },
  {
    id: 'Incline_Dumbbell_Curl', name: 'Incline dumbbell curl', short: 'Incline curl', variant: BEHIND,
    credit: { biceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Set a bench to 45–60° and sit back with the dumbbells hanging straight down behind your torso, palms forward.', 'Keep your shoulders back and down against the bench.', 'Curl the dumbbells up without letting your elbows swing forward.', 'Lower slowly all the way to straight arms.'],
    safety: 'Use lighter dumbbells than for standing curls: the stretched start is harder. Stop the stretch short of any shoulder discomfort.',
    ref: TYPES,
  },
  {
    id: 'Drag_Curl', name: 'Drag curl', short: 'Drag curl', variant: BEHIND,
    credit: { biceps: 1 }, lo: 8, hi: 12, rest: 90, level: 'intermediate',
    cues: ['Hold a barbell underhand at shoulder-width, feet shoulder-width.', 'Drive your elbows back so the bar drags up along your body.', 'Stop at upper-chest height with your forearms about level with the floor.', 'Lower slowly along the same path.'],
    safety: 'Shoulders stay down and torso still; the bar never swings out in front.', ref: SL(['Drag curl', 'drag-curl']),
  },
  {
    id: 'Preacher_Curl', name: 'Barbell preacher curl', short: 'Preacher curl', variant: FRONT,
    credit: { biceps: 1 }, lo: 8, hi: 15, rest: 90, level: 'beginner',
    cues: ['Set the pad so its top sits under your armpits with your arms resting on it; feet flat.', 'Grip the bar (or EZ bar) underhand and curl it up.', 'Lower under control as far as is comfortable.', 'Keep your upper arms on the pad and your body still.'],
    safety: 'Keep the wrists straight. If full extension at the bottom feels uncomfortable, reverse a little earlier; never let the bar drop into the bottom.',
    ref: SL(['Barbell preacher curl', 'barbell-preacher-curl']),
  },
  {
    id: 'One_Arm_Dumbbell_Preacher_Curl', name: 'One-arm dumbbell preacher curl', short: '1-arm preacher curl', variant: FRONT, perSide: true,
    credit: { biceps: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Rest the back of your upper arm on the preacher pad, dumbbell in hand, palm up.', 'Curl the dumbbell up; the upper arm stays on the pad.', 'Lower slowly to a comfortable full stretch. Finish the reps, then switch arms.'],
    safety: 'Use a light weight and control the bottom; don\'t let the elbow snap straight. One set = both arms.', ref: TYPES,
  },
  {
    id: 'Concentration_Curls', name: 'Concentration curl', short: 'Concentration curl', variant: FRONT, perSide: true,
    credit: { biceps: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Sit on a bench, lean forward, and brace the back of your elbow against the inside of your thigh.', 'Curl the dumbbell up toward your shoulder; only the elbow moves.', 'Lower under control. Finish the reps, then switch arms.'],
    safety: 'Hard to cheat on, so keep the weight modest. One set = both arms.', ref: SL(['Concentration curl', 'concentration-curl']),
  },
  {
    id: 'Spider_Curl', name: 'Spider curl', short: 'Spider curl', variant: FRONT,
    credit: { biceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Lie chest-down on an incline bench (or the vertical side of a preacher pad) with your arms hanging straight down.', 'Curl the bar or dumbbells up without moving your upper arms.', 'Lower slowly to straight arms.'],
    safety: 'Expect to use light weights; no swinging.', ref: TYPES,
  },
  {
    id: 'Standing_Biceps_Cable_Curl', name: 'Cable curl', short: 'Cable curl', variant: STD,
    credit: { biceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Attach a straight bar to the low pulley, grip underhand about shoulder-width, and step back.', 'Curl the bar up by bending your elbows; upper arms still or slightly forward.', 'Lower with control.'],
    safety: CURL, ref: SL(['Cable curl with bar', 'cable-curl-with-bar']),
  },
  {
    id: 'Overhead_Cable_Curl', name: 'Overhead cable curl', short: 'Overhead cable curl', variant: 'Arms overhead',
    credit: { biceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'intermediate',
    cues: ['Use both high pulleys (or one high bar). Stand (or sit) between them with your arms straight out to the sides at shoulder height, palms up.', 'Keep your upper arms still and curl the handles toward your head.', 'Pause briefly, then straighten your arms slowly.'],
    safety: 'Light weight; the upper arms must not drop. Stop if the shoulders complain.', ref: SL(['Overhead cable curl', 'overhead-cable-curl']),
  },
  {
    id: 'Reverse_Barbell_Curl', name: 'Reverse barbell curl', short: 'Reverse curl', variant: REV,
    credit: { biceps: 1, forearms: 0.5 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Grip the bar overhand (palms down) about shoulder-width.', 'Curl it up by bending your elbows; upper arms at your sides.', 'Lower under control, keeping tension at the bottom.'],
    safety: 'You\'ll use much less weight than a normal curl. Keep the wrists straight.', ref: SL(['Reverse barbell curl', 'reverse-barbell-curl']),
  },
  {
    id: 'Standing_Dumbbell_Reverse_Curl', name: 'Reverse dumbbell curl', short: 'Reverse DB curl', variant: REV,
    credit: { biceps: 1, forearms: 0.5 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Hold the dumbbells at your sides with palms facing back/down.', 'Curl them up keeping that grip, elbows at your sides.', 'Lower under control.'],
    safety: 'Don\'t let the elbows drift back to cheat the weight up.', ref: SL(['Reverse dumbbell curl', 'reverse-dumbbell-curl']),
  },
  {
    id: 'Zottman_Curl', name: 'Zottman curl', short: 'Zottman curl', variant: REV,
    credit: { biceps: 1, forearms: 0.5 }, lo: 8, hi: 12, rest: 90, level: 'intermediate',
    cues: ['Curl the dumbbells up with palms facing up.', 'At the top, turn your palms to face down.', 'Lower slowly with palms down, then turn them back up at the bottom.'],
    safety: 'Pick a weight you can lower slowly palms-down; that\'s the weak part of the rep.', ref: SL(['Zottman curl', 'zottman-curl']),
  },
  // ---------------------------------------------------------------- triceps
  {
    id: 'Triceps_Pushdown', name: 'Triceps pushdown (bar)', short: 'Pushdown', variant: 'Pushdown',
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Face a high pulley with a short bar, overhand grip, feet shoulder-width, core braced.', 'Start with the bar at upper-chest level, elbows bent and tucked at your sides.', 'Push the bar down until your arms are fully straight.', 'Let it rise under control; only the elbows move.'],
    safety: 'Don\'t lean over the bar or arch your back to move it; use a weight you control.', ref: SL(['Tricep pushdown with bar', 'tricep-pushdown-with-bar']),
  },
  {
    id: 'Triceps_Pushdown_-_Rope_Attachment', name: 'Triceps pushdown (rope)', short: 'Rope pushdown', variant: 'Pushdown',
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Rope on a high pulley, overhand grip, one step back, core braced.', 'Upper arms vertical and tucked at your sides.', 'Push down until your arms are fully straight, spreading the rope ends slightly at the bottom.', 'Let it rise under control.'],
    safety: 'Only the elbows move. Too much weight leads to body swing and sore elbows.', ref: SL(['Tricep pushdown with rope', 'tricep-pushdown-with-rope']),
  },
  {
    id: 'Triceps_Pushdown_-_V-Bar_Attachment', name: 'Triceps pushdown (V-bar)', short: 'V-bar pushdown', variant: 'Pushdown',
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['V-bar on a high pulley, overhand grip, feet shoulder-width, core braced.', 'Elbows bent and tucked at your sides.', 'Push down to fully straight arms.', 'Let it rise under control.'],
    safety: 'Keep your upper arms and body still.', ref: SL(['Tricep pushdown with bar', 'tricep-pushdown-with-bar']),
  },
  {
    id: 'EZ-Bar_Skullcrusher', name: 'EZ-bar lying triceps extension', short: 'Lying extension', variant: 'Lying extension',
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Lie on a bench with your head near the end. Hold the EZ bar over your chest with straight arms, shoulder-width grip.', 'Bend only your elbows and lower the bar behind your head (not to your forehead).', 'Keep the elbows the same width apart and pointing up.', 'Extend back to straight arms.'],
    safety: EXT + ' Lowering behind the head is safer than to the forehead.', ref: SL(['Barbell lying triceps extension', 'barbell-lying-triceps-extension']),
  },
  {
    id: 'Lying_Dumbbell_Tricep_Extension', name: 'Lying dumbbell triceps extension', short: 'Lying DB extension', variant: 'Lying extension', swap: true,
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Lie on a bench, head near the end, dumbbells held straight up over your shoulders.', 'Bend only your elbows to lower the dumbbells behind your head.', 'Keep the elbows the same distance apart throughout.', 'Extend back to straight arms.'],
    safety: EXT, ref: SL(['Dumbbell lying triceps extension', 'dumbbell-lying-triceps-extension']),
  },
  {
    id: 'Incline_Barbell_Triceps_Extension', name: 'Incline barbell triceps extension', short: 'Incline extension', variant: 'Lying extension', swap: true,
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'intermediate',
    cues: ['Set an incline bench to 30–45°, lie back, feet flat, narrow overhand grip.', 'Start with the bar over your shoulders, elbows close together.', 'Bend your elbows to lower the bar until it\'s slightly behind your head.', 'Extend fully back to the start.'],
    safety: EXT + ' Don\'t arch your lower back.', ref: SL(['Barbell incline triceps extension', 'barbell-incline-triceps-extension']),
  },
  {
    id: 'Standing_Dumbbell_Triceps_Extension', name: 'Overhead dumbbell triceps extension', short: 'Overhead DB extension', variant: 'Overhead · long head', swap: true,
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Hold one dumbbell with both hands (by the top plate) and press it to straight arms overhead.', 'Keep your upper arms still and vertical, close to your head.', 'Lower the dumbbell behind your head as far as is comfortable.', 'Extend back to straight arms.'],
    safety: EXT + ' Brace your core so your lower back doesn\'t arch.', ref: [SL(['Dumbbell standing triceps extension', 'dumbbell-standing-triceps-extension']), LONG],
  },
  {
    id: 'Standing_Overhead_Barbell_Triceps_Extension', name: 'Overhead barbell triceps extension', short: 'Overhead BB extension', variant: 'Overhead · long head', swap: true,
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'intermediate',
    cues: ['Grip a light barbell (or EZ bar) narrow and lift it to straight arms overhead; feet shoulder-width, core braced.', 'Upper arms still and vertical.', 'Lower the bar behind your head as far as your mobility allows.', 'Extend back overhead.'],
    safety: EXT + ' Keep a neutral spine; don\'t arch your lower back.', ref: [SL(['Barbell standing triceps extension', 'barbell-standing-triceps-extension']), LONG],
  },
  {
    id: 'Close-Grip_Barbell_Bench_Press', name: 'Close-grip bench press', short: 'Close-grip bench', variant: 'Close-grip press', swap: true,
    credit: { triceps: 1, chest: 0.5, fdelt: 0.5 }, lo: 6, hi: 10, rest: 150, level: 'beginner',
    cues: ['Set up as for a bench press: shoulder blades back and down, feet flat.', 'Grip about shoulder-width (hands over your shoulders), not narrower.', 'Lower under control to the lower chest, elbows closer to your sides than in a normal bench.', 'Press back up to straight arms.'],
    safety: 'Set the safety arms or use a spotter. Expect to use less weight than your regular bench.', ref: SL(['Close-grip bench press', 'close-grip-bench-press']),
  },
  {
    id: 'Push-Ups_-_Close_Triceps_Position', name: 'Close-grip push-up', short: 'Close push-up', variant: 'Close-grip press',
    credit: { triceps: 1, chest: 0.5, fdelt: 0.5 }, lo: 8, hi: 20, rest: 90, level: 'beginner',
    cues: ['Push-up position with hands about shoulder-width or a little closer.', 'Body in a straight line, abs lightly braced.', 'Lower as far as you can with your elbows close to your sides.', 'Push back up to straight arms.'],
    safety: 'Too hard? Put your hands on a bench.', ref: SL(['Close-grip push-up', 'close-grip-push-up']),
  },
  {
    id: 'Dips_-_Triceps_Version', name: 'Triceps dip', short: 'Triceps dip', variant: 'Dip', swap: true,
    credit: { triceps: 1, chest: 0.5, fdelt: 0.5 }, lo: 6, hi: 12, rest: 150, level: 'intermediate',
    cues: ['Lift yourself to straight arms on the dip bars, body upright, shoulders down.', 'Lower with control, elbows traveling straight back, until your shoulders are just below your elbows or as deep as is comfortable.', 'Push back up to straight arms. Staying upright keeps the focus on the triceps.'],
    safety: 'Dips load the shoulders and sternum: build volume gradually, don\'t shrug, and stop if your shoulders hurt. Use the assisted-dip machine or a band if needed.',
    ref: SL(['Bar dip', 'bar-dip']),
  },
  {
    id: 'Tate_Press', name: 'Tate press', short: 'Tate press', variant: 'Lying extension', swap: true,
    credit: { triceps: 1 }, lo: 10, hi: 15, rest: 90, level: 'intermediate',
    cues: ['Lie on a flat bench with dumbbells held straight up over your chest, palms facing your feet.', 'Bend your elbows out to the sides and lower the dumbbells until they nearly touch your chest.', 'Extend your elbows to press them back up.'],
    safety: 'Light dumbbells and slow reps; the flared-elbow path is unusual, so stop if the elbows or shoulders complain.', ref: SL(['Tate press', 'tate-press']),
  },
];

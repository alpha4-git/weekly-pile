// Front, side and rear delts. Reviewed against StrengthLog exercise pages (linked per entry) and the database photos.
// Raises credit only the head they target (1); presses also give side delts and triceps half credit.
const SL = s => ({ title: 'StrengthLog: ' + s[0], url: 'https://www.strengthlog.com/' + s[1] + '/' });
const OHP = { fdelt: 1, sdelt: 0.5, triceps: 0.5 };
const LIGHT = 'It\'s easy to go too heavy on raises: pick a weight you can lift with strict form and no swinging.';
module.exports = [
  {
    id: 'Dumbbell_Shoulder_Press', name: 'Seated dumbbell shoulder press', short: 'DB shoulder press', variant: 'Overhead press',
    credit: OHP, lo: 8, hi: 12, rest: 120, level: 'beginner',
    cues: [
      'Sit on a bench with the back raised upright, feet flat, back against the pad.',
      'Bring the dumbbells to shoulder height, palms forward; brace your core and keep your chest up.',
      'Press up to straight arms over your shoulders without slamming the elbows locked.',
      'Lower under control back to your shoulders. No bouncing at the bottom.',
    ],
    safety: 'Keep your back against the pad; a big lower-back arch means the weight is too heavy.',
    ref: SL(['Seated dumbbell shoulder press', 'seated-dumbbell-shoulder-press']),
  },
  {
    id: 'Seated_Dumbbell_Press', name: 'Dumbbell shoulder press (low back support)', short: 'DB press (low back)', variant: 'Overhead press', swap: true,
    credit: OHP, lo: 8, hi: 12, rest: 120, level: 'beginner',
    cues: [
      'Sit tall on a bench with a short back support, feet flat and wide for balance.',
      'Start with the dumbbells at shoulder height, palms forward, core braced.',
      'Press up until your arms are straight over your shoulders.',
      'Lower under control to shoulder height.',
    ],
    safety: 'Without a tall backrest your core holds you upright: don\'t lean back to finish reps.',
    ref: SL(['Seated dumbbell shoulder press', 'seated-dumbbell-shoulder-press']),
  },
  {
    id: 'Standing_Military_Press', name: 'Overhead press (barbell)', short: 'Overhead press', variant: 'Overhead press',
    credit: OHP, lo: 6, hi: 10, rest: 150, level: 'beginner',
    cues: [
      'Set the bar in a rack at about chest height. Grip slightly wider than your shoulders, unrack it onto your front delts and step back.',
      'Feet about hip-width, glutes and core lightly braced.',
      'Press straight up, moving your head back slightly to let the bar pass, then bring your head through once it\'s overhead.',
      'Lower under control to your front shoulders. Legs stay still (using them makes it a push press).',
    ],
    safety: 'Doing too much too soon is the main overuse risk: start light and add weight and sets gradually.',
    ref: SL(['Overhead press', 'overhead-press']),
  },
  {
    id: 'Seated_Barbell_Military_Press', name: 'Seated barbell shoulder press', short: 'Seated BB press', variant: 'Overhead press',
    credit: OHP, lo: 6, hi: 10, rest: 150, level: 'intermediate',
    cues: [
      'Use an upright shoulder-press bench in a rack with the bar at about shoulder height when seated.',
      'Grip slightly wider than your shoulders, unrack, and lean back against the pad.',
      'Lower the bar in front of your face to your upper chest/collarbone.',
      'Press back up to straight arms.',
    ],
    safety: 'Keep the bar in front of your head, not behind the neck. A spotter makes the unrack easier.',
    ref: SL(['Seated barbell overhead press', 'seated-barbell-overhead-press']),
  },
  {
    id: 'Arnold_Dumbbell_Press', name: 'Arnold press', short: 'Arnold press', variant: 'Overhead press',
    credit: OHP, lo: 8, hi: 12, rest: 120, level: 'intermediate',
    cues: [
      'Sit upright with back support. Start with the dumbbells in front of your chest, palms facing you.',
      'Press up while rotating your palms to face forward.',
      'Finish with straight arms over your shoulders.',
      'Lower while rotating back to palms facing you.',
    ],
    safety: 'Use lighter weights than your normal dumbbell press; the rotation makes it harder.',
    ref: SL(['Arnold press', 'arnold-press']),
  },
  {
    id: 'Smith_Machine_Overhead_Shoulder_Press', name: 'Smith machine shoulder press', short: 'Smith shoulder press', variant: 'Overhead press',
    credit: OHP, lo: 8, hi: 12, rest: 120, level: 'beginner',
    cues: [
      'Put a bench with an upright back under the bar so the bar comes down in front of your face.',
      'Grip slightly wider than your shoulders, rotate the bar off the hooks.',
      'Lower with control to your upper chest (about chin height or a little below).',
      'Press back up to straight arms.',
    ],
    safety: 'Set the stoppers just above where the bar touches your chest. Bar in front of the face, never behind the neck.',
    ref: SL(['Seated Smith machine shoulder press', 'seated-smith-machine-shoulder-press']),
  },
  {
    id: 'Two-Arm_Kettlebell_Military_Press', name: 'Kettlebell press (two arms)', short: 'KB press', variant: 'Overhead press',
    credit: OHP, lo: 6, hi: 10, rest: 120, level: 'intermediate',
    cues: [
      'Stand with feet a bit wider than your shoulders, kettlebells in the rack position at your shoulders.',
      'Breathe in and brace lightly, chest up.',
      'Press until your arms are straight and your upper arms are beside your ears.',
      'Lower slowly back to the rack position.',
    ],
    safety: 'Shoulders neither shrugged nor jammed down; press in whatever path between forward and sideways feels comfortable.',
    ref: SL(['Kettlebell press', 'kettlebell-press']),
  },
  {
    id: 'Front_Dumbbell_Raise', name: 'Dumbbell front raise', short: 'DB front raise', variant: 'Front raise',
    credit: { fdelt: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: [
      'Stand tall holding the dumbbells in front of your thighs, arms straight (a slight elbow bend is fine).',
      'Raise one or both forward to shoulder height.',
      'Lower under control. No swinging from the hips.',
    ],
    safety: LIGHT, ref: SL(['Dumbbell front raise', 'dumbbell-front-raise']),
  },
  {
    id: 'Front_Cable_Raise', name: 'Cable front raise', short: 'Cable front raise', variant: 'Front raise', perSide: true,
    credit: { fdelt: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: [
      'Attach a handle to the low pulley and stand with your back to the machine, feet shoulder-width.',
      'Hold the handle palm down, slight bend in the elbow, spine neutral.',
      'Raise it straight forward to shoulder height without using your body.',
      'Lower slowly. Finish the reps, then switch arms.',
    ],
    safety: LIGHT + ' One set = both arms.', ref: SL(['Cable front raise', 'cable-front-raise']),
  },
  {
    id: 'Front_Plate_Raise', name: 'Plate front raise', short: 'Plate raise', variant: 'Front raise',
    credit: { fdelt: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: [
      'Hold a plate by its edges at about 3 and 9 o\'clock, arms straight in front of your hips.',
      'Raise it forward with straight arms to shoulder height.',
      'Lower slowly under control.',
    ],
    safety: LIGHT, ref: SL(['Plate front raise', 'plate-front-raise']),
  },
  {
    id: 'Cable_Seated_Lateral_Raise', name: 'Cable lateral raise (both arms)', short: 'Cable lateral raise', variant: 'Cable raise',
    credit: { sdelt: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: [
      'Set both pulleys low. Sit on a bench between them and take the opposite handles so the cables cross in front of you.',
      'Lean slightly forward, slight bend in the elbows.',
      'Raise your arms out to the sides until your upper arms are level with your shoulders.',
      'Lower slowly, keeping tension on the cables.',
    ],
    safety: LIGHT + ' Lead with the elbows; don\'t shrug.', ref: SL(['Cable lateral raise', 'cable-lateral-raise']),
  },
  {
    id: 'Lateral_Raise_-_With_Bands', name: 'Band lateral raise', short: 'Band lateral raise', variant: 'Band raise',
    credit: { sdelt: 1 }, lo: 12, hi: 20, rest: 60, level: 'beginner',
    cues: [
      'Stand on the middle of a band, one end in each hand at your sides.',
      'Raise your arms out to the sides with a slight elbow bend until your upper arms are level with your shoulders.',
      'Lower slowly under control.',
    ],
    safety: 'Check the band for nicks before use. Pick a band that lets you reach shoulder height with strict form.',
    ref: SL(['Resistance band lateral raise', 'resistance-band-lateral-raise']),
  },
  {
    id: 'Upright_Barbell_Row', name: 'Barbell upright row', short: 'Upright row', variant: 'Upright row · + traps', swap: true,
    credit: { sdelt: 1, traps: 0.5, fdelt: 0.5 }, lo: 10, hi: 15, rest: 90, level: 'intermediate',
    cues: [
      'Stand tall, grip the bar overhand slightly narrower than shoulder-width (not too narrow).',
      'Pull the bar straight up close to your body, leading with your elbows out to the sides.',
      'Stop when your upper arms reach shoulder height (bar around chest height). Don\'t go higher.',
      'Lower under control.',
    ],
    safety: 'Upright rows can irritate the shoulder at the top: start light, keep the elbows at or below shoulder height, and stop earlier if you feel any pinch. Lateral raises are the alternative.',
    ref: SL(['Barbell upright row', 'barbell-upright-row']),
  },
  {
    id: 'Standing_Dumbbell_Upright_Row', name: 'Dumbbell upright row', short: 'DB upright row', variant: 'Upright row · + traps', swap: true,
    credit: { sdelt: 1, traps: 0.5, fdelt: 0.5 }, lo: 10, hi: 15, rest: 90, level: 'intermediate',
    cues: [
      'Stand tall with the dumbbells in front of your thighs, palms facing you.',
      'Pull them up close to your body, elbows leading out to the sides.',
      'Stop when your upper arms reach shoulder height.',
      'Lower under control.',
    ],
    safety: 'Keep the elbows at or below shoulder height and stop if anything pinches. Dumbbells let your hands move freely, which many find easier on the shoulders than the bar.',
    ref: SL(['Barbell upright row', 'barbell-upright-row']),
  },
  {
    id: 'Face_Pull', name: 'Face pull', short: 'Face pull', variant: 'Face pull',
    credit: { rdelt: 1, back: 0.5 }, lo: 12, hi: 20, rest: 90, level: 'beginner',
    cues: [
      'Rope on a high pulley (about forehead height). Grip overhand and step back one or two steps; stand tall, glutes and core tight.',
      'Pull the rope toward your forehead with your elbows high, at or above shoulder height.',
      'As it reaches your face, pull the ends apart and rotate your forearms up.',
      'Let your arms go forward slowly.',
    ],
    safety: 'Too much weight turns it into a row toward the chest; keep it light enough to keep the elbows high.',
    ref: SL(['Face pull', 'face-pull']),
  },
  {
    id: 'Reverse_Flyes', name: 'Incline-bench reverse fly', short: 'Reverse fly (bench)', variant: 'Rear fly',
    credit: { rdelt: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: [
      'Lie face down on a bench inclined to about 30–45°, a dumbbell in each hand, palms facing in.',
      'Let your arms hang with a slight elbow bend.',
      'Raise the weights out to the sides until they reach shoulder height.',
      'Pause briefly, then lower slowly.',
    ],
    safety: LIGHT, ref: SL(['Reverse dumbbell flyes on incline bench', 'reverse-dumbbell-flyes-on-incline-bench']),
  },
  {
    id: 'Cable_Rear_Delt_Fly', name: 'Reverse cable fly', short: 'Reverse cable fly', variant: 'Rear fly',
    credit: { rdelt: 1 }, lo: 12, hi: 15, rest: 90, level: 'beginner',
    cues: [
      'Set both pulleys high. Cross over to take the opposite handles and stand centered between them.',
      'Arms forward with a slight elbow bend, chest up, core braced, shoulders back and down.',
      'Pull your arms back out to the sides until they\'re roughly in line with your body.',
      'Return slowly under control.',
    ],
    safety: 'Light weight and slow reps. Swinging or arching your lower back strains the back and shoulders.',
    ref: SL(['Reverse cable flyes', 'reverse-cable-fly']),
  },
  {
    id: 'Band_Pull_Apart', name: 'Band pull-apart', short: 'Band pull-apart', variant: 'Rear fly',
    credit: { rdelt: 1 }, lo: 15, hi: 25, rest: 60, level: 'beginner',
    cues: [
      'Hold a band in front of you at shoulder height, arms straight, hands about shoulder-width.',
      'Pull the band apart by moving your arms out to the sides until they point straight out.',
      'Return to the start with control.',
    ],
    safety: 'Adjust the difficulty with your grip width (narrower is harder) or a stronger band. Check the band for nicks.',
    ref: SL(['Band pull-apart', 'band-pull-apart']),
  },
  {
    id: 'Barbell_Rear_Delt_Row', name: 'Barbell rear-delt row', short: 'Rear-delt row', variant: 'Rear-delt row',
    credit: { rdelt: 1, back: 0.5, biceps: 0.5 }, lo: 10, hi: 15, rest: 90, level: 'intermediate',
    cues: [
      'Wide overhand grip. Hinge forward with a flat back and let the bar hang from straight arms.',
      'Pull the bar high toward your upper chest with your upper arms pointing out to the sides.',
      'Lower under control.',
    ],
    safety: 'Use a light weight and no body swing. Your lower back holds the bent-over position, as in a barbell row.',
    ref: SL(['Barbell rear delt row', 'barbell-rear-delt-row']),
  },
  {
    id: 'Cable_Rope_Rear-Delt_Rows', name: 'Cable rear-delt row (rope)', short: 'Cable rear-delt row', variant: 'Rear-delt row',
    credit: { rdelt: 1, back: 0.5, biceps: 0.5 }, lo: 12, hi: 15, rest: 90, level: 'beginner',
    cues: [
      'Rope on a high pulley. Grip overhand and step back one or two steps.',
      'With your elbows high, pull the rope toward you so your upper arms move straight out to your sides.',
      'Squeeze your shoulder blades together at the end.',
      'Return with control.',
    ],
    safety: 'Start light: the point is feeling the rear delts work, not moving the most weight.',
    ref: SL(['Cable rear delt row', 'cable-rear-delt-row']),
  },
];

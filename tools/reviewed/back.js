// Back (lats & mid back). Reviewed against StrengthLog exercise pages (linked per entry) and the database photos.
const SL = s => ({ title: 'StrengthLog: ' + s[0], url: 'https://www.strengthlog.com/' + s[1] + '/' });
const PULL = { back: 1, biceps: 0.5, rdelt: 0.5 };
const V = 'Vertical pull · lats', ROW = 'Row · mid back';
module.exports = [
  {
    id: 'Pullups', name: 'Pull-up', short: 'Pull-up', variant: V,
    credit: PULL, lo: 5, hi: 12, rest: 150, step: 5, level: 'intermediate',
    cues: [
      'Hang from the bar, palms facing away, hands a little wider than your shoulders.',
      'Chest up, eyes on the bar. Start the pull by drawing your shoulders down away from your ears.',
      'Pull until your chin clears the bar or the bar touches your upper chest.',
      'Lower with control all the way to straight arms; let your shoulder blades rise at the bottom.',
    ],
    safety: 'Strict reps only, no kipping. Can\'t do 5? Use the assisted pull-up machine or a band. Log added weight (belt) in the weight box.',
    ref: SL(['Pull-up', 'pull-up']),
  },
  {
    id: 'Chin-Up', name: 'Chin-up', short: 'Chin-up', variant: V,
    credit: PULL, lo: 5, hi: 12, rest: 150, step: 5, level: 'intermediate',
    cues: [
      'Hang from the bar with palms facing you, about shoulder-width apart.',
      'Chest up, eyes on the bar, shoulders drawn down.',
      'Pull until your chin clears the bar or the bar touches your upper chest.',
      'Lower with control to straight arms.',
    ],
    safety: 'Most people are a little stronger at chin-ups than pull-ups. Use a band under your feet or knees to make it easier.',
    ref: SL(['Chin-up', 'chin-up']),
  },
  {
    id: 'Band_Assisted_Pull-Up', name: 'Band-assisted pull-up', short: 'Assisted pull-up', variant: V,
    credit: PULL, lo: 6, hi: 12, rest: 120, step: 5, level: 'beginner',
    cues: [
      'Throw the band over the bar and pull one end through the other. A thicker band gives more help.',
      'Step up on a bench or box beside the bar and put your foot in the loop. Grip slightly wider than your shoulders, palms away.',
      'Chest up, look at the bar, and pull until your chin is over the bar or the bar touches your upper chest.',
      'Lower with control until your arms are fully extended.',
    ],
    safety: 'Setting up is the tricky part: step into and out of the band carefully, holding the bar. The band helps most at the bottom and least at the top. Move to thinner bands as you get stronger.',
    ref: SL(['Pull-up (band-assisted section)', 'pull-up']),
  },
  {
    id: 'Close-Grip_Front_Lat_Pulldown', name: 'Close-grip lat pulldown', short: 'Close-grip pulldown', variant: V,
    credit: PULL, lo: 8, hi: 12, rest: 120, step: 5, level: 'beginner',
    cues: [
      'Grip the bar overhand, hands narrower than your shoulders. Sit with your thighs under the pad.',
      'Chest up, lean back slightly, eyes on the bar.',
      'Pull the bar to your upper chest, driving your elbows down and back.',
      'Let it rise slowly until your arms are fully straight.',
    ],
    safety: 'Pull to the front only, never behind your neck. Don\'t rock your torso to move the weight.',
    ref: SL(['Close-grip lat pulldown', 'close-grip-lat-pulldown']),
  },
  {
    id: 'Underhand_Cable_Pulldowns', name: 'Underhand lat pulldown', short: 'Underhand pulldown', variant: V,
    credit: PULL, lo: 8, hi: 12, rest: 120, step: 5, level: 'beginner',
    cues: [
      'Grip the bar with palms facing you, about shoulder-width apart. Thighs under the pad.',
      'Chest up, eyes on the bar.',
      'Pull the bar to your upper chest, elbows down toward your sides.',
      'Return slowly to straight arms.',
    ],
    safety: 'Keep the reps smooth; leaning far back turns it into a row.', ref: SL(['Lat pulldown with supinated grip', 'lat-pulldown-with-supinated-grip']),
  },
  {
    id: 'V-Bar_Pulldown', name: 'Neutral-grip pulldown (V-bar)', short: 'V-bar pulldown', variant: V, swap: true,
    credit: PULL, lo: 8, hi: 12, rest: 120, step: 5, level: 'beginner',
    cues: [
      'Attach a V-handle (close neutral grip). Sit with thighs under the pad.',
      'Chest up, eyes up at the handle.',
      'Pull the handle to your upper chest, elbows close to your sides.',
      'Return slowly to straight arms.',
    ],
    safety: 'Keep your torso still; if you have to swing back, lighten it.', ref: SL(['Neutral close-grip lat pulldown', 'neutral-close-grip-lat-pulldown']),
  },
  {
    id: 'One_Arm_Lat_Pulldown', name: 'One-arm lat pulldown', short: '1-arm pulldown', variant: V, perSide: true,
    credit: PULL, lo: 8, hi: 12, rest: 90, step: 5, level: 'beginner',
    cues: [
      'Attach a single handle. Sit (or kneel) under the pulley holding it in one hand, arm straight overhead.',
      'Chest up, eyes slightly up.',
      'Pull the handle down to the side of your chest, elbow down toward your hip.',
      'Return slowly to a full stretch. Finish all reps, then switch arms.',
    ],
    safety: 'One set = both arms. Don\'t twist your torso to finish a rep.', ref: SL(['One-handed lat pulldown', 'one-handed-lat-pulldown']),
  },
  {
    id: 'Straight-Arm_Pulldown', name: 'Straight-arm pulldown', short: 'Straight-arm pulldown', variant: 'Straight-arm · lats only',
    credit: { back: 1, rdelt: 0.5 }, lo: 10, hi: 15, rest: 90, step: 5, level: 'beginner',
    cues: [
      'Set the pulley high. Grip the bar overhand, a bit wider than your shoulders, and step back.',
      'Lean forward slightly, knees soft, arms straight out in front.',
      'Keeping your arms straight, sweep the bar down to your thighs.',
      'Let it rise slowly until your arms are about level with your head.',
    ],
    safety: 'Elbows stay almost straight the whole time; bending them turns it into a pushdown.', ref: SL(['Straight arm lat pulldown', 'straight-arm-lat-pulldown']),
  },
  {
    id: 'Bent_Over_Barbell_Row', name: 'Barbell row', short: 'Barbell row', variant: ROW,
    credit: { back: 1, biceps: 0.5, rdelt: 0.5, lowback: 0.5 }, lo: 6, hi: 10, rest: 150, step: 5, level: 'intermediate',
    cues: [
      'Feet about shoulder-width, grip overhand slightly wider than your shoulders.',
      'Push your hips back and lean forward, back flat (neither rounded nor arched), arms hanging straight.',
      'Pull the bar to your lower chest or upper abs, squeezing your shoulder blades together.',
      'Lower with control to straight arms.',
    ],
    safety: 'Your lower back holds the position the whole set. Swinging is most often a sign the weight is too heavy. Keep an eye on your total lower-back volume.',
    ref: SL(['Barbell row', 'barbell-row']),
  },
  {
    id: 'One-Arm_Dumbbell_Row', name: 'One-arm dumbbell row', short: '1-arm DB row', variant: ROW, perSide: true,
    credit: PULL, lo: 8, hi: 12, rest: 90, step: 5, level: 'beginner',
    cues: [
      'One hand and the same-side knee on a bench, back flat and level with the floor, other foot on the floor.',
      'Let the dumbbell hang from a straight arm; eyes on the floor to keep your neck neutral.',
      'Drive your elbow up toward the ceiling, pulling the dumbbell toward your hip. Elbow close to your body.',
      'Lower with control to a full stretch. Finish the reps, then switch sides.',
    ],
    safety: 'No jerking or twisting. Straps are fine if your grip gives out first.', ref: SL(['Dumbbell row', 'dumbbell-row']),
  },
  {
    id: 'Dumbbell_Incline_Row', name: 'Chest-supported dumbbell row', short: 'Chest-supported row', variant: ROW,
    credit: PULL, lo: 8, hi: 12, rest: 120, step: 5, level: 'beginner',
    cues: [
      'Set an incline bench to 30–45° and lie chest-down, feet on the floor, dumbbells hanging.',
      'Pull the dumbbells toward your hips, elbows close to your body.',
      'Pause with your shoulder blades squeezed together; don\'t shrug.',
      'Lower slowly until your arms are straight.',
    ],
    safety: 'The bench takes some stress off your lower back. The reference rows both dumbbells at once; the photos show one arm.',
    ref: SL(['Chest-supported dumbbell row', 'chest-supported-dumbbell-row']),
  },
  {
    id: 'T-Bar_Row_with_Handle', name: 'T-bar row', short: 'T-bar row', variant: ROW,
    credit: { back: 1, biceps: 0.5, rdelt: 0.5, lowback: 0.5 }, lo: 6, hi: 10, rest: 150, step: 5, level: 'intermediate',
    cues: [
      'Straddle the bar (or stand on the machine\'s platform) and grip the handle.',
      'Hips back, back flat, arms straight.',
      'Pull the handle toward your chest as high as you can, shoulder blades squeezing together.',
      'Lower with control to straight arms.',
    ],
    safety: 'Like the barbell row, your lower back holds the position: keep it flat and stop if you start heaving with your hips.',
    ref: SL(['T-bar row', 't-bar-row']),
  },
  {
    id: 'Seated_One-arm_Cable_Pulley_Rows', name: 'One-arm seated cable row', short: '1-arm cable row', variant: ROW, perSide: true,
    credit: PULL, lo: 8, hi: 12, rest: 90, step: 5, level: 'beginner',
    cues: [
      'Sit at the low-row station with a single handle, feet on the platform, knees slightly bent.',
      'Start with your arm straight and your torso leaning slightly forward; let the shoulder blade slide forward.',
      'Pull the handle toward the side of your stomach, elbow close to your body, leaning back slightly and pulling the shoulder blade back.',
      'Return slowly to the stretch. Finish the reps, then switch arms.',
    ],
    safety: 'Only a slight lean forward and back: don\'t heave with your lower back. One set = both arms.',
    ref: SL(['One-handed cable row', 'one-handed-cable-row']),
  },
  {
    id: 'Leverage_Iso_Row', name: 'Machine row (chest-supported)', short: 'Machine row', variant: ROW,
    credit: PULL, lo: 8, hi: 12, rest: 120, step: 10, level: 'beginner',
    cues: [
      'Set the seat so the handles are at about chest height, and rest your chest on the pad.',
      'Grip the handles with straight arms, shoulders relaxed.',
      'Pull the handles toward you as far as possible, squeezing your shoulder blades together.',
      'Return slowly until your arms are straight.',
    ],
    safety: 'Keep your chest on the pad; leaning back to finish means the weight is too heavy.',
    ref: SL(['Seated machine row', 'seated-machine-row']),
  },
  {
    id: 'Leverage_High_Row', name: 'High row machine', short: 'High row', variant: V,
    credit: PULL, lo: 8, hi: 12, rest: 120, step: 10, level: 'beginner',
    cues: [
      'Adjust the seat so you fit the machine and can reach the handles with straight arms.',
      'Pull the handles toward you as far as possible, along the machine\'s path.',
      'Slowly return the handles to the start.',
    ],
    safety: 'The reference covers machine rows in general, not this machine\'s exact path; follow the machine\'s placard for setup.',
    ref: SL(['Seated machine row', 'seated-machine-row']),
  },
  {
    id: 'Inverted_Row', name: 'Inverted row', short: 'Inverted row', variant: ROW,
    credit: PULL, lo: 8, hi: 15, rest: 90, step: 5, level: 'beginner',
    cues: [
      'Set a bar in a rack high enough that you can hang below it on straight arms with your heels on the floor. Overhand grip, slightly wider than your shoulders.',
      'Body in a straight line from head to heels.',
      'Pull your chest up to the bar, squeezing your shoulder blades together.',
      'Lower with control to straight arms.',
    ],
    safety: 'Raise the bar to make it easier; put your feet on a bench to make it harder. Check the bar is seated securely in the rack.',
    ref: SL(['Inverted row', 'inverted-row']),
  },
];

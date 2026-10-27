// Hamstrings (knee curls), glutes, calves, adductors and abductors.
// Reviewed against StrengthLog exercise pages (linked per entry) and the database photos.
// Calf variants: the seated (bent-knee) raise mostly trains the soleus; standing raises train both and grew the calves more
// in a 2023 Frontiers in Physiology study (both cited on StrengthLog).
const SL = s => ({ title: 'StrengthLog: ' + s[0], url: 'https://www.strengthlog.com/' + s[1] + '/' });
const HAMS = SL(['How to train your hamstrings', 'hamstring-muscles-exercises-workout']);
const CALVES = SL(['Calf exercises', 'calf-exercises']);
const CALF = 'Pause for a full stretch at the bottom and a squeeze at the top; no bouncing or short, choppy reps.';
const STRAIGHT = 'Straight knee · gastrocnemius';
module.exports = [
  // ---------------------------------------------------------------- hamstrings: knee flexion
  {
    id: 'Lying_Leg_Curls', name: 'Lying leg curl', short: 'Lying leg curl', variant: 'Knee curl',
    credit: { hams: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Lie face down and line your knees up with the machine\'s pivot; pad just above your heels.', 'Curl the pad up as far as you can.', 'Lower it slowly to straight legs.'],
    safety: 'Keep your hips down on the bench; lifting them to finish means the weight is too heavy.', ref: [SL(['Lying leg curl', 'lying-leg-curl']), HAMS],
  },
  {
    id: 'Standing_Leg_Curl', name: 'Standing (kneeling) leg curl', short: 'Standing leg curl', variant: 'Knee curl', perSide: true,
    credit: { hams: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Set the machine so the pad sits just above the heel of the working leg; hold the handles.', 'Keep your upper body still.', 'Curl your heel toward your glutes, pause briefly, then lower slowly.', 'Finish the reps, then switch legs.'],
    safety: 'No swinging. One set = both legs.', ref: SL(['Standing leg curl', 'standing-leg-curl']),
  },
  {
    id: 'Ball_Leg_Curl', name: 'Stability-ball leg curl', short: 'Ball leg curl', variant: 'Knee curl',
    credit: { hams: 1, glutes: 0.5 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Lie on your back, arms at your sides, heels on an exercise ball, legs straight.', 'Brace and lift your hips so your body is straight from feet to shoulders.', 'Bend your knees to roll the ball toward you, keeping your hips up.', 'Slowly straighten your legs to roll it back.'],
    safety: 'Keep your hips lifted the whole set. Make sure the ball is properly inflated.', ref: SL(['Leg curl on ball', 'leg-curl-on-ball']),
  },
  {
    id: 'Glute_Ham_Raise', name: 'Glute-ham raise', short: 'Glute-ham raise', variant: 'Glute-ham raise', swap: true,
    credit: { hams: 1, glutes: 0.5 }, lo: 5, hi: 10, rest: 120, level: 'intermediate',
    cues: ['Set the machine so your knees rest just behind the pad and your feet are locked under the footplate.', 'Body straight from knees to head, core braced, arms across your chest.', 'Bend at the knees and lower yourself slowly until your body is nearly parallel to the floor.', 'Pull yourself back up with your hamstrings and glutes.'],
    safety: 'Very demanding: push off lightly with your hands at the bottom if you can\'t pull all the way up yet. Keep it controlled.', ref: SL(['Glute ham raise', 'glute-ham-raise']),
  },
  // ---------------------------------------------------------------- glutes
  {
    id: 'Barbell_Hip_Thrust', name: 'Barbell hip thrust', short: 'Hip thrust', variant: 'Hip thrust',
    credit: { glutes: 1, adductors: 0.5 }, lo: 8, hi: 12, rest: 120, level: 'intermediate',
    cues: ['Sit on the floor with your upper back against a sturdy bench and roll the bar over your hips; pad the bar.', 'Feet flat about shoulder-width, knees bent; hold the bar steady.', 'Drive your hips up until your knees are at about 90° and your body is flat from shoulders to knees.', 'Lower under control.'],
    safety: 'Use a pad, mat or towel between the bar and your pelvis. Don\'t over-arch your lower back at the top: finish with the glutes.', ref: SL(['Hip thrust', 'hip-thrust']),
  },
  {
    id: 'Barbell_Glute_Bridge', name: 'Barbell glute bridge', short: 'Glute bridge', variant: 'Bridge',
    credit: { glutes: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Lie on your back on the floor with a padded bar over your hips, knees bent, feet flat.', 'Tuck your pelvis slightly to engage the glutes.', 'Push your hips up until your body is straight from shoulders to knees; squeeze at the top.', 'Lower with control.'],
    safety: 'Pad the bar. Shorter range than the hip thrust, so you can usually use more weight.', ref: [SL(['Glute bridge', 'glute-bridge']), SL(['Hip thrust', 'hip-thrust'])],
  },
  {
    id: 'Single_Leg_Glute_Bridge', name: 'Single-leg glute bridge', short: '1-leg bridge', variant: 'Single-leg bridge', perSide: true,
    credit: { glutes: 1, abductors: 0.5 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Lie on your back, one foot flat with the knee bent, the other leg extended.', 'Tuck your pelvis slightly.', 'Push your hips up with the bent leg until your body is straight; squeeze at the top.', 'Lower and repeat. Finish the reps, then switch legs.'],
    safety: 'Hips stay level; don\'t let the free side drop. Add a weight on your hips when it gets easy.', ref: SL(['One-legged glute bridge', 'one-legged-glute-bridge']),
  },
  {
    id: 'One-Legged_Cable_Kickback', name: 'Cable glute kickback', short: 'Cable kickback', variant: 'Kickback', perSide: true,
    credit: { glutes: 1, hams: 0.5 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Attach an ankle strap to the low pulley and face the machine, holding it for support.', 'Brace your core and keep your body still.', 'Press the strapped leg back and up with your glute as far as you can without rotating your hips.', 'Return slowly. Finish the reps, then switch legs.'],
    safety: 'No swinging and no arching your lower back to get the leg higher. One set = both legs.', ref: SL(['Cable glute kickback', 'cable-glute-kickback']),
  },
  {
    id: 'Glute_Kickback', name: 'Kneeling glute kickback', short: 'Donkey kick', variant: 'Kickback', perSide: true,
    credit: { glutes: 1, hams: 0.5 }, lo: 12, hi: 20, rest: 60, level: 'beginner',
    cues: ['On all fours, hands under shoulders, knees under hips, back flat.', 'Keeping one knee bent at 90°, press that foot toward the ceiling, squeezing the glute.', 'Lower without touching the floor. Finish the reps, then switch legs.'],
    safety: 'Keep your back flat; don\'t arch to lift higher. Use the cable version for more resistance.', ref: SL(['Donkey kicks', 'donkey-kicks']),
  },
  {
    id: 'Pull_Through', name: 'Cable pull-through', short: 'Pull-through', variant: 'Pull-through',
    credit: { glutes: 1, hams: 0.5, lowback: 0.5 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: ['Rope on the low pulley. Face away, straddle the cable, and walk forward a few steps; feet wide.', 'Hinge at the hips, knees slightly bent, letting the rope travel back between your thighs.', 'Drive your hips forward to stand tall, arms straight; the motion comes from the hips, not the arms.', 'Hinge back with control.'],
    safety: 'Back flat throughout, as in any hinge.', ref: SL(['Cable pull-through', 'cable-pull-through']),
  },
  // ---------------------------------------------------------------- calves
  {
    id: 'Seated_Calf_Raise', name: 'Seated calf raise', short: 'Seated calf raise', variant: 'Bent knee · soleus',
    credit: { calves: 1 }, lo: 12, hi: 20, rest: 60, level: 'beginner',
    cues: ['Sit with the knee pad snug on your lower thighs and the balls of your feet on the platform.', 'Release the lever and lower your heels slowly to a full stretch.', 'Push up onto your toes as high as you can and pause.'],
    safety: CALF, ref: [SL(['Seated calf raise', 'seated-calf-raise']), CALVES],
  },
  {
    id: 'Standing_Barbell_Calf_Raise', name: 'Barbell standing calf raise', short: 'Barbell calf raise', variant: STRAIGHT,
    credit: { calves: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: ['Bar on your upper back; balls of your feet on a plate or step, heels hanging off.', 'Stand with your back near a wall so the plates touch it, which helps balance.', 'Lower your heels to a full stretch, then rise as high as you can with straight knees.'],
    safety: CALF + ' Use the rack\'s safety arms or the Smith machine if balance is an issue.', ref: CALVES,
  },
  {
    id: 'Standing_Dumbbell_Calf_Raise', name: 'Dumbbell standing calf raise', short: 'DB calf raise', variant: STRAIGHT,
    credit: { calves: 1 }, lo: 12, hi: 20, rest: 60, level: 'beginner',
    cues: ['Hold a dumbbell in each hand (or one, holding a rail with the other); balls of your feet on a step.', 'Lower your heels to a full stretch with straight knees.', 'Rise as high as you can and pause.'],
    safety: CALF + ' One leg at a time with one dumbbell doubles the load if two-legged gets easy.', ref: CALVES,
  },
  {
    id: 'Calf_Press_On_The_Leg_Press_Machine', name: 'Leg press calf raise', short: 'Leg press calf raise', variant: STRAIGHT,
    credit: { calves: 1 }, lo: 12, hi: 20, rest: 60, level: 'beginner',
    cues: ['Sit in the leg press with the balls of your feet on the bottom edge of the platform, heels hanging off.', 'Unrack with knees very slightly bent, and keep them there.', 'Let the platform push your toes back to a full stretch, then press through the balls of your feet as far as you can.'],
    safety: CALF + ' Keep the safety stops engaged: if a foot slips off the platform, they catch the sled.', ref: CALVES,
  },
  // ---------------------------------------------------------------- adductors / abductors
  {
    id: 'Cable_Hip_Adduction', name: 'Cable hip adduction', short: 'Cable adduction', variant: 'Cable adduction', perSide: true,
    credit: { adductors: 1 }, lo: 12, hi: 15, rest: 60, level: 'beginner',
    cues: ['Ankle strap on the low pulley. Stand side-on with the strapped leg nearest the machine; hold on for balance.', 'Core and glutes tight, slight bend in the standing leg.', 'Pull the strapped leg in and across in front of your standing leg, upper body still.', 'Return with control. Finish the reps, then switch sides.'],
    safety: 'Start light; the inner thigh strains easily if you jerk the weight. One set = both legs.', ref: SL(['Cable machine hip adduction', 'cable-machine-hip-adduction']),
  },
  {
    id: 'Thigh_Abductor', name: 'Hip abduction machine', short: 'Abduction machine', variant: 'Machine abduction',
    credit: { abductors: 1 }, lo: 12, hi: 20, rest: 60, level: 'beginner',
    cues: ['Sit against the backrest with your outer thighs against the pads, feet flat, knees at about 90°.', 'Press outward as far as you can without straining; squeeze your glutes at the end.', 'Return slowly; control the weight rather than letting it pull you back.'],
    safety: 'Mainly trains the gluteus medius and minimus (the outer hip).', ref: SL(['Abductor exercises', 'abductor-exercises']),
  },
  {
    id: 'Monster_Walk', name: 'Band walk (monster walk)', short: 'Band walk', variant: 'Band walk',
    credit: { abductors: 1 }, lo: 10, hi: 20, rest: 60, level: 'beginner',
    cues: ['Put a band around your ankles (and/or knees) with tension at shoulder-width stance.', 'Bend your knees slightly and hinge forward a little at the hips.', 'Take short steps forward, then backward (or sideways), pushing out against the band the whole time.', 'Count steps per leg.'],
    safety: 'Pick a band that\'s challenging but lets you keep your knees from caving in.', ref: SL(['Abductor exercises', 'abductor-exercises']),
  },
];

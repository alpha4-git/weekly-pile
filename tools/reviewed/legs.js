// Quads (squats, lunges, leg extensions). Reviewed against StrengthLog exercise pages (linked per entry) and the database photos.
// "Leg extension · rectus femoris": a 2021 J Sports Sci trial (summarized on StrengthLog) found leg extensions grew the rectus
// femoris while Smith-machine squats did not; squats grew the vastus lateralis.
const SL = s => ({ title: 'StrengthLog: ' + s[0], url: 'https://www.strengthlog.com/' + s[1] + '/' });
const SQ = { quads: 1, glutes: 0.5, adductors: 0.5 };
const BSQ = { quads: 1, glutes: 0.5, adductors: 0.5, lowback: 0.5 };
const LUNGE = { quads: 1, glutes: 1, adductors: 0.5 };
const KNEES = 'Let your knees track in the same direction as your toes. Go as deep as you can with good technique.';
const SQUAT = 'Squat', FRONT = 'Front-loaded squat', SINGLE = 'Single-leg', EXT = 'Leg extension · rectus femoris';
module.exports = [
  {
    id: 'Barbell_Squat', name: 'Barbell back squat', short: 'Back squat', variant: SQUAT,
    credit: BSQ, lo: 6, hi: 10, rest: 180, level: 'intermediate',
    cues: [
      'Set the bar at about sternum height. Grip slightly wider than your shoulders, bar on your upper back; unrack and take three steps back.',
      'Take a comfortable stance (narrow to wide all work), toes slightly out. Breathe in and brace.',
      'Squat down by bending your knees, hips and ankles, back straight, until your thighs are below parallel or you reach your natural depth limit.',
      'Drive back up to standing. Re-rack by walking in and squatting the bar down onto the hooks.',
    ],
    safety: KNEES + ' Always set the safety arms just below your lowest point. Wear firm shoes; a raised heel (lifting shoes) helps many people, but don\'t stand on plates.',
    ref: SL(['Squat', 'squat']),
  },
  {
    id: 'Front_Barbell_Squat', name: 'Front squat', short: 'Front squat', variant: FRONT,
    credit: BSQ, lo: 6, hi: 10, rest: 180, level: 'intermediate',
    cues: [
      'Grip slightly wider than your shoulders and rest the bar on the front of your shoulders, on top of your collarbones.',
      'Breathe in, brace, unrack and take two steps back.',
      'Squat as deep as you can with your torso upright and elbows up.',
      'Stand back up, breathing out on the way.',
    ],
    safety: KNEES + ' Needs wrist, shoulder and ankle mobility; crossing your arms with your hands on top of the bar, or using straps, helps if the wrists complain. Set the safety arms.',
    ref: SL(['Front squat', 'front-squat']),
  },
  {
    id: 'Goblet_Squat', name: 'Goblet squat', short: 'Goblet squat', variant: FRONT,
    credit: SQ, lo: 8, hi: 15, rest: 120, level: 'beginner',
    cues: [
      'Hold a dumbbell (or kettlebell) vertically against your chest, feet about shoulder-width.',
      'Breathe in, brace lightly, and squat as deep as you can with your chest up.',
      'Stand back up, breathing out.',
    ],
    safety: KNEES + ' Your arms usually tire before your legs; when they do, move on to a front or back squat.',
    ref: SL(['Dumbbell goblet squat', 'dumbbell-goblet-squat-2']),
  },
  {
    id: 'Dumbbell_Squat', name: 'Dumbbell squat', short: 'DB squat', variant: SQUAT,
    credit: SQ, lo: 8, hi: 15, rest: 120, level: 'beginner',
    cues: [
      'Hold a dumbbell in each hand at your sides, feet about shoulder-width.',
      'Breathe in, brace lightly, and squat down as deep as you can with your chest up and back flat.',
      'Stand back up, breathing out.',
    ],
    safety: KNEES + ' Easy to bail: just drop the dumbbells.', ref: SL(['Dumbbell squat', 'dumbbell-squat']),
  },
  {
    id: 'Hack_Squat', name: 'Hack squat machine', short: 'Hack squat', variant: 'Machine squat',
    credit: SQ, lo: 8, hi: 12, rest: 150, level: 'beginner',
    cues: [
      'Set the shoulder pads, back flat against the pad. Feet about shoulder-width, slightly in front of the sled\'s base.',
      'Release the safety handles.',
      'Squat as deep as you can with good form, then push back up.',
      'Re-engage the safety handles when you finish.',
    ],
    safety: 'Lower feet on the platform shift work to the quads; higher feet to the glutes. If the machine doesn\'t fit you comfortably, use another squat.',
    ref: SL(['Hack squat machine', 'hack-squat-machine']),
  },
  {
    id: 'Barbell_Hack_Squat', name: 'Barbell hack squat', short: 'BB hack squat', variant: SQUAT,
    credit: SQ, lo: 8, hi: 12, rest: 150, level: 'intermediate',
    cues: [
      'Stand in front of a barbell on the floor, bar behind your legs. Squat down and grip it with your arms outside your legs.',
      'Breathe in, brace, back flat.',
      'Stand up, keeping the bar close to the backs of your legs.',
      'Lower with control and reset.',
    ],
    safety: 'Keep your back flat; the upright torso puts most of the work on the quads. Start light: the bar can scrape your calves and hamstrings.',
    ref: SL(['Barbell hack squat', 'barbell-hack-squat']),
  },
  {
    id: 'Smith_Machine_Squat', name: 'Smith machine squat', short: 'Smith squat', variant: SQUAT, swap: true,
    credit: SQ, lo: 8, hi: 12, rest: 150, level: 'beginner',
    cues: [
      'Bar on your upper back, feet about shoulder-width, directly under the bar or a little in front of it.',
      'Brace, breathe in and rotate the bar off the hooks.',
      'Squat as deep as you can with good form.',
      'Stand back up and re-hook the bar at the top.',
    ],
    safety: KNEES + ' Set the stoppers just below your lowest point: you can\'t tip a Smith bar off to the side if you get stuck.',
    ref: SL(['Smith machine exercises', 'smith-machine-exercises']),
  },
  {
    id: 'Box_Squat', name: 'Box squat', short: 'Box squat', variant: SQUAT,
    credit: BSQ, lo: 6, hi: 10, rest: 180, level: 'intermediate',
    cues: [
      'Set a box or bench behind you at about parallel depth. Bar on your upper back as for a back squat.',
      'Sit back and down until your glutes touch the box (or sit briefly with control).',
      'Keep tension; don\'t relax or rock on the box.',
      'Drive back up to standing.',
    ],
    safety: 'Control the descent; never drop onto the box. Set the safety arms as for a back squat.',
    ref: SL(['Squat variations', 'squat-variations']),
  },
  {
    id: 'Bodyweight_Squat', name: 'Bodyweight squat', short: 'Air squat', variant: SQUAT,
    credit: SQ, lo: 15, hi: 25, rest: 60, level: 'beginner',
    cues: [
      'Feet about shoulder-width, hands behind your head or out in front.',
      'Squat as deep as you can, chest up, knees tracking over your toes.',
      'Stand back up.',
    ],
    safety: 'Mostly a warm-up or travel option: add a dumbbell (goblet squat) once 25 reps is easy.',
    ref: SL(['Squat', 'squat']),
  },
  {
    id: 'Plie_Dumbbell_Squat', name: 'Sumo (plié) dumbbell squat', short: 'Sumo DB squat', variant: 'Wide stance · adductors',
    credit: { quads: 1, adductors: 1, glutes: 0.5 }, lo: 10, hi: 15, rest: 120, level: 'beginner',
    cues: [
      'Wide stance, toes pointed out; hold one dumbbell by the top plate between your legs.',
      'Brace, chest up, and lower straight down between your legs as far as your hips allow.',
      'Heels stay down and knees track over your toes.',
      'Push through your whole foot to stand.',
    ],
    safety: 'Needs good hip mobility; only go as wide and as deep as is comfortable.', ref: SL(['Sumo squat', 'sumo-squat']),
  },
  {
    id: 'Front_Squats_With_Two_Kettlebells', name: 'Kettlebell front squat', short: 'KB front squat', variant: FRONT,
    credit: SQ, lo: 8, hi: 12, rest: 120, level: 'intermediate',
    cues: [
      'Hold two kettlebells in the rack position at your shoulders, feet shoulder-width.',
      'Brace, chest up, shoulders back.',
      'Sit down between your heels as deep as your mobility allows, kettlebells steady.',
      'Stand back up.',
    ],
    safety: KNEES, ref: SL(['Kettlebell front squat', 'kettlebell-front-squat']),
  },
  {
    id: 'Leg_Extensions', name: 'Leg extension', short: 'Leg extension', variant: EXT,
    credit: { quads: 1 }, lo: 10, hi: 15, rest: 90, level: 'beginner',
    cues: [
      'Line up your knee with the machine\'s pivot and set the back pad so your back rests against it; ankle pad just above your feet.',
      'Brace your core and extend your legs with control until straight.',
      'Lower slowly, using the longest range you can.',
    ],
    safety: 'Don\'t snap or hyperextend your knees at the top, and don\'t let your lower back arch off the pad.', ref: SL(['Leg extension', 'leg-extension']),
  },
  {
    id: 'Single-Leg_Leg_Extension', name: 'One-leg leg extension', short: '1-leg extension', variant: EXT, perSide: true,
    credit: { quads: 1 }, lo: 10, hi: 15, rest: 60, level: 'beginner',
    cues: [
      'Set the machine so your knee lines up with the pivot.',
      'Extend one leg with control until it\'s straight; the other leg relaxes.',
      'Lower slowly. Finish the reps, then switch legs.',
    ],
    safety: 'Use the longest comfortable range; no snapping at the top. One set = both legs.', ref: SL(['One-legged leg extension', 'one-legged-leg-extension']),
  },
  {
    id: 'Dumbbell_Lunges', name: 'Dumbbell lunge', short: 'DB lunge', variant: SINGLE, perSide: true,
    credit: LUNGE, lo: 8, hi: 12, rest: 120, level: 'beginner',
    cues: [
      'Stand tall with a dumbbell in each hand, feet hip-width, core braced.',
      'Step forward far enough that both knees can bend to about 90°; keep your feet hip-width apart, not in line.',
      'Lower until your back knee is just above the floor.',
      'Push back to the start with your front leg. Alternate legs or finish one side first.',
    ],
    safety: 'Front knee tracks over your toes, foot flat. Too short a step overloads the front knee. One set = both legs.',
    ref: SL(['Lunges', 'lunge']),
  },
  {
    id: 'Dumbbell_Rear_Lunge', name: 'Reverse dumbbell lunge', short: 'Reverse lunge', variant: SINGLE, perSide: true,
    credit: LUNGE, lo: 8, hi: 12, rest: 120, level: 'beginner',
    cues: [
      'Stand with a dumbbell in each hand, feet about shoulder-width.',
      'Step far back and lower into a lunge as deep as you can.',
      'Don\'t let your back knee hit the floor.',
      'Push back up to standing with the front leg.',
    ],
    safety: 'One set = both legs.',
    ref: SL(['Reverse dumbbell lunge', 'reverse-dumbbell-lunge']),
  },
  {
    id: 'Barbell_Lunge', name: 'Barbell lunge', short: 'Barbell lunge', variant: SINGLE, perSide: true,
    credit: LUNGE, lo: 8, hi: 12, rest: 120, level: 'intermediate',
    cues: [
      'Bar on your upper back as for a squat, feet hip-width, core braced.',
      'Step forward, keeping your feet hip-width apart, and lower until your back knee nears the floor.',
      'Push back to the start with your front leg.',
    ],
    safety: 'Balance is harder with a bar than with dumbbells, and you can\'t drop it: start light, and use the rack\'s safety arms or dumbbells instead. One set = both legs.',
    ref: SL(['Lunges', 'lunge']),
  },
  {
    id: 'Barbell_Walking_Lunge', name: 'Barbell walking lunge', short: 'Walking lunge (bar)', variant: SINGLE, perSide: true,
    credit: LUNGE, lo: 8, hi: 12, rest: 120, level: 'intermediate',
    cues: [
      'Bar on your upper back, core braced, with clear floor space in front of you.',
      'Step forward into a lunge, back knee just above the floor.',
      'Push up and bring the back foot forward straight into the next lunge.',
      'Count reps per leg.',
    ],
    safety: 'Walking adds a balance challenge; master the stationary lunge first. Feet stay hip-width apart, not on one line.',
    ref: SL(['Lunges', 'lunge']),
  },
  {
    id: 'Bodyweight_Walking_Lunge', name: 'Walking lunge (bodyweight)', short: 'Walking lunge', variant: SINGLE, perSide: true,
    credit: LUNGE, lo: 10, hi: 20, rest: 90, level: 'beginner',
    cues: [
      'Stand tall, hands on hips, with clear floor space ahead.',
      'Step forward into a lunge, back knee just above the floor.',
      'Push up and step through into the next lunge with the other leg.',
    ],
    safety: 'Hold dumbbells once 20 reps per leg is easy.', ref: SL(['Lunges', 'lunge']),
  },
  {
    id: 'Dumbbell_Step_Ups', name: 'Dumbbell step-up', short: 'Step-up', variant: SINGLE, perSide: true, swap: true,
    credit: LUNGE, lo: 8, hi: 12, rest: 120, level: 'beginner',
    cues: [
      'Stand facing a sturdy bench or box with a dumbbell in each hand; put one whole foot on it.',
      'Brace lightly and step up until the working leg is straight, pushing through the top foot (not the back one).',
      'Lower under control, keeping the working foot on the box.',
      'Finish the reps, then switch legs.',
    ],
    safety: 'Use a box low enough that your knee isn\'t above your hip when you start. Make sure it can\'t slide. One set = both legs.',
    ref: SL(['Step up', 'step-up']),
  },
  {
    id: 'Zercher_Squats', name: 'Zercher squat', short: 'Zercher squat', variant: FRONT,
    credit: BSQ, lo: 6, hi: 12, rest: 150, level: 'intermediate',
    cues: ['Set the bar in a rack at about elbow height. Rest it in the crooks of your elbows, elbows close together.', 'Back out of the rack and brace your core.', 'Squat down as in a regular squat, as deep as you can with your back straight, pulling the bar into your body.', 'Stand back up through your heels.'],
    safety: 'It\'s rough on the elbow crooks at first: start light and wrap a towel around the bar if it hurts. Don\'t round your back. Set the safety arms.',
    ref: SL(['Zercher squat', 'zercher-squat']),
  },
  {
    id: 'Kettlebell_Pistol_Squat', name: 'Pistol squat', short: 'Pistol squat', variant: SINGLE, perSide: true,
    credit: { quads: 1, glutes: 1 }, lo: 3, hi: 8, rest: 120, step: 5, level: 'expert',
    cues: ['Stand on one leg with the other leg extended straight out in front of you.', 'Chest up, core braced, arms (or a light kettlebell) held forward for balance.', 'Bend the standing leg and squat as low as you can while staying balanced and in control; keep the other leg straight and off the floor.', 'Press through your standing heel to stand up. Finish the reps, then switch legs.'],
    safety: 'Very demanding on balance and strength. The reference describes it with arms forward; the photos hold a kettlebell in front. One set = both legs.',
    ref: SL(['Pistol squat', 'pistol-squat']),
  },
  {
    id: 'Barbell_Step_Ups', name: 'Barbell step-up', short: 'BB step-up', variant: SINGLE, perSide: true,
    credit: LUNGE, lo: 6, hi: 12, rest: 120, level: 'intermediate',
    cues: ['Bar on your upper back. Stand in front of a sturdy box or bench and put one whole foot on it.', 'Brace lightly and step up until that leg is straight.', 'Lower yourself with control, keeping that foot on the box.', 'Finish the reps, then switch legs.'],
    safety: 'Balance is harder with a bar than with dumbbells; start light and use a low box. One set = both legs.', ref: SL(['Step-up', 'step-up']),
  },
  {
    id: 'Smith_Single-Leg_Split_Squat', name: 'Smith machine Bulgarian split squat', short: 'Smith split squat', variant: SINGLE, perSide: true,
    credit: { quads: 1, glutes: 1, adductors: 0.5 }, lo: 8, hi: 12, rest: 120, level: 'intermediate',
    cues: ['Set the bar at shoulder height and put a knee-high bench about one long step behind where you will stand.', 'Unrack the bar onto your upper back and rest the top of one foot on the bench behind you.', 'Squat down with control until your back knee is just off the floor.', 'Push through your front foot to stand back up. Finish the reps, then switch legs.'],
    safety: 'Let your front knee track in the direction of your toes. Balance is the limit at first: start light. One set = both legs.',
    ref: SL(['Smith machine Bulgarian split squat', 'smith-machine-bulgarian-split-squat']),
  },
  {
    id: 'Wide_Stance_Barbell_Squat', name: 'Sumo barbell squat', short: 'Sumo BB squat', variant: 'Wide stance · adductors',
    credit: { quads: 1, adductors: 1, glutes: 0.5, lowback: 0.5 }, lo: 6, hi: 10, rest: 180, level: 'intermediate',
    cues: ['Set the bar in a rack at about sternum height, bar on your upper back; unrack and step back.', 'Take a wide stance with your feet pointing slightly out. Brace your core and keep your chest up.', 'Bend your knees and hips together to lower straight down between your legs, as far as your mobility allows with your heels on the floor.', 'Push through your whole foot to stand back up.'],
    safety: KNEES + ' Always set the safety arms just below your lowest point. Needs good hip mobility; only go as wide as is comfortable.',
    ref: SL(['Sumo squat', 'sumo-squat']),
  },
  {
    id: 'Suspended_Split_Squat', name: 'Suspended lunge (rear foot in strap)', short: 'Strap split squat', variant: SINGLE, perSide: true,
    credit: { quads: 1, glutes: 1, adductors: 0.5 }, lo: 8, hi: 12, rest: 90, level: 'intermediate',
    cues: ['Set the strap\'s foot cradle (or a ring) about knee height. Face away from the anchor and loop one foot into it behind you.', 'Stand tall on the other leg, chest up.', 'Lower slowly, pushing your hips back with your weight over your front heel and letting the strapped leg move back, until your rear thigh and torso form a straight line.', 'Push up through your front heel to stand. Finish the reps, then switch legs.'],
    safety: 'Keep your front knee in line with your toes and go only as low as you can control. One set = both legs.',
    ref: { title: 'ACE: TRX suspended lunge', url: 'https://www.acefitness.org/resources/everyone/exercise-library/93/trx-reg-suspended-lunge/' },
  },
];

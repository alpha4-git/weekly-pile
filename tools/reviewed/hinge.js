// Hip hinges and lower back. Reviewed against StrengthLog exercise pages (linked per entry) and the database photos.
const SL = s => ({ title: 'StrengthLog: ' + s[0], url: 'https://www.strengthlog.com/' + s[1] + '/' });
const RDL = { hams: 1, glutes: 1, adductors: 0.5, lowback: 0.5 };
const BACK = 'Keep your back straight (neutral), never rounded; if it rounds, lower the weight. Apart from normal muscle soreness this shouldn\'t hurt your back: aches mean too much, too soon, so cut the volume and check your form.';
module.exports = [
  {
    id: 'Barbell_Deadlift', name: 'Deadlift', short: 'Deadlift', variant: 'Deadlift',
    credit: { glutes: 1, lowback: 1, hams: 0.5, quads: 0.5, adductors: 0.5 }, lo: 5, hi: 8, rest: 180, step: 10, level: 'intermediate',
    cues: [
      'Stand with the bar over the middle of your feet, hands about shoulder-width, arms straight like ropes.',
      'Breathe in, brace, chest up, and take the slack out of the bar before it leaves the floor.',
      'Push the floor away, extending your knees and hips, and pull the bar close up your legs until you stand tall with hips and knees locked out.',
      'Lower by pushing your hips back first, then bend your knees once the bar passes them. Reset your breath each rep.',
    ],
    safety: BACK + ' Wear flat, firm shoes. Don\'t let your hips shoot up before the bar moves.',
    ref: SL(['Deadlift', 'deadlift']),
  },
  {
    id: 'Rack_Pulls', name: 'Rack pull', short: 'Rack pull', variant: 'Partial deadlift',
    credit: { glutes: 1, lowback: 1, hams: 0.5, adductors: 0.5 }, lo: 5, hi: 8, rest: 180, step: 10, level: 'intermediate',
    cues: [
      'Set the bar on the rack pins (or blocks) between just below and just above knee height, over the middle of your feet.',
      'Lean forward with a slight knee bend and grip just outside your legs.',
      'Brace, then pull the bar close to your body with a flat back until you stand tall.',
      'Lower under control back to the pins.',
    ],
    safety: BACK + ' You can lift more than from the floor, so add weight gradually.',
    ref: SL(['Rack pull', 'rack-pull']),
  },
  {
    id: 'Hyperextensions_Back_Extensions', name: 'Back extension (45°)', short: 'Back extension', variant: 'Back extension',
    credit: { lowback: 1, glutes: 1, hams: 0.5 }, lo: 10, hi: 15, rest: 90, step: 5, level: 'beginner',
    cues: [
      'Set the top pad against the top of your thighs, feet shoulder-width on the platform.',
      'Cross your arms on your chest (or hold a plate there for more load).',
      'Lower your upper body slowly over the pad.',
      'Raise until your body is in a straight line, squeeze your glutes, pause, and lower slowly. Don\'t arch past straight.',
    ],
    safety: 'Slow, no swinging. You should feel a pump in your lower back and glutes, not a deep ache; if it aches, take a week or two off and come back lighter.',
    ref: SL(['Back extension', 'back-extension']),
  },
  {
    id: 'Romanian_Deadlift', name: 'Romanian deadlift (barbell)', short: 'Barbell RDL', variant: 'Hip hinge', swap: true,
    credit: RDL, lo: 6, hi: 10, rest: 150, step: 5, level: 'intermediate',
    cues: [
      'Start standing with the bar (lift it from the floor or a rack), hands just outside your legs.',
      'Brace, then hinge at the hips with your knees almost straight (a slight bend), sliding the bar down the front of your thighs.',
      'Lean forward as far as you can without rounding your back. The bar doesn\'t have to touch the floor.',
      'Drive your hips forward to stand back up.',
    ],
    safety: BACK + ' Straps are fine if your grip gives out first.',
    ref: SL(['Romanian deadlift', 'romanian-deadlift']),
  },
  {
    id: 'Stiff-Legged_Barbell_Deadlift', name: 'Stiff-legged deadlift', short: 'Stiff-leg deadlift', variant: 'Hip hinge', swap: true,
    credit: RDL, lo: 6, hi: 10, rest: 150, step: 5, level: 'intermediate',
    cues: [
      'Feet shoulder-width or narrower, overhand grip, knees only slightly bent and staying that way.',
      'Hinge at the hips, lowering the bar close to your legs, back straight.',
      'Go down until you feel a strong hamstring stretch (the bar can touch the floor between reps if you can keep your back flat).',
      'Stand back up by driving your hips forward.',
    ],
    safety: BACK + ' Needs good hamstring flexibility; start with the bar on low blocks if you can\'t reach the floor with a flat back.',
    ref: SL(['Stiff-leg deadlift', 'stiff-legged-deadlift']),
  },
  {
    id: 'Good_Morning', name: 'Good morning', short: 'Good morning', variant: 'Hip hinge',
    credit: RDL, lo: 8, hi: 12, rest: 150, step: 5, level: 'intermediate',
    cues: [
      'Bar on your upper back as for a squat. Unrack and step back, feet slightly wider than hip-width.',
      'Breathe in, brace, and push your hips back as far as you can, knees slightly bent.',
      'Lean forward as far as you can with a flat back, without the bar rolling forward.',
      'Reverse by driving your hips forward to stand.',
    ],
    safety: BACK + ' Start very light; the lever arm makes small weights feel heavy. Set the safety arms in case you have to drop the bar.',
    ref: SL(['Good morning', 'good-morning']),
  },
  {
    id: 'Sumo_Deadlift', name: 'Sumo deadlift', short: 'Sumo deadlift', variant: 'Deadlift',
    credit: { glutes: 1, quads: 0.5, hams: 0.5, adductors: 0.5, lowback: 0.5 }, lo: 5, hi: 8, rest: 180, step: 10, level: 'intermediate',
    cues: [
      'Wide stance, toes turned out, bar over the middle of your feet, shins vertical when viewed from the front.',
      'Grip the bar inside your legs, arms straight. Breathe in and brace.',
      'Push your knees out and the floor away, pulling the bar close to your body until you stand tall.',
      'Lower under control and reset your breath.',
    ],
    safety: BACK + ' A little easier on the lower back than the conventional deadlift. Experiment with stance width.',
    ref: SL(['Sumo deadlift', 'sumo-deadlift']),
  },
  {
    id: 'Smith_Machine_Stiff-Legged_Deadlift', name: 'Smith machine Romanian deadlift', short: 'Smith RDL', variant: 'Hip hinge', swap: true,
    credit: RDL, lo: 8, hi: 12, rest: 120, step: 5, level: 'beginner',
    cues: [
      'Set the bar at mid-thigh height. Feet shoulder-width, overhand grip slightly wider than your shoulders.',
      'Unrack standing tall, brace, back flat.',
      'Push your hips back and lower the bar along the front of your legs, knees slightly bent, until you feel a hamstring stretch.',
      'Drive your hips forward to stand back up.',
    ],
    safety: BACK + ' Set the stoppers just below your lowest point.',
    ref: SL(['Smith machine Romanian deadlift', 'smith-machine-romanian-deadlift']),
  },
  {
    id: 'Kettlebell_One-Legged_Deadlift', name: 'Single-leg kettlebell deadlift', short: '1-leg KB deadlift', variant: 'Single-leg hinge', perSide: true,
    credit: { hams: 1, glutes: 1, lowback: 0.5, adductors: 0.5, abductors: 0.5 }, lo: 8, hi: 12, rest: 90, step: 5, level: 'intermediate',
    cues: [
      'Stand on one leg, slight bend in the knee, kettlebell in the opposite hand.',
      'Hinge forward at the hip while your free leg extends straight back, body moving as one line.',
      'Lower the kettlebell toward the floor without touching it, back flat, hips square.',
      'Drive through the standing heel to return upright. Finish the reps, then switch legs.',
    ],
    safety: 'Balance is the limit at first: start light, and touch a rack with your free hand if you wobble. One set = both legs.',
    ref: SL(['Single leg deadlift with kettlebell', 'single-leg-deadlift-with-kettlebell']),
  },
  {
    id: 'Trap_Bar_Deadlift', name: 'Trap bar deadlift', short: 'Trap bar deadlift', variant: 'Deadlift',
    credit: { glutes: 1, quads: 0.5, lowback: 0.5, adductors: 0.5 }, lo: 5, hi: 8, rest: 180, step: 10, level: 'beginner',
    cues: [
      'Stand inside the bar with the handles in line with the middle of your feet.',
      'Breathe in, bend down and grip the handles; chest up, back flat.',
      'Brace and stand up until you\'re tall, pushing the floor away.',
      'Lower under control and reset your breath.',
    ],
    safety: BACK + ' The high handles shorten the range if you can\'t reach the low ones with a flat back.',
    ref: SL(['Trap bar deadlift with low handles', 'trap-bar-deadlift-with-low-handles']),
  },
  {
    id: 'Reverse_Hyperextension', name: 'Reverse hyperextension', short: 'Reverse hyper', variant: 'Reverse hyper',
    credit: { glutes: 1, hams: 0.5, lowback: 0.5 }, lo: 10, hi: 15, rest: 90, step: 5, level: 'intermediate',
    cues: [
      'Lie face down on the machine (or a high bench) with your hips at the edge, legs hanging, hands holding the handles.',
      'Legs straight and together, core braced, back neutral.',
      'Raise your legs until they\'re in line with your body or slightly above; squeeze your glutes and hold a moment.',
      'Lower slowly under control. No swinging.',
    ],
    safety: 'Slow and controlled; don\'t swing your legs up or down.',
    ref: SL(['Reverse hyperextension', 'reverse-hyperextension']),
  },
  {
    id: 'Deficit_Deadlift', name: 'Deficit deadlift', short: 'Deficit deadlift', variant: 'Deadlift',
    credit: { glutes: 1, lowback: 1, hams: 0.5, quads: 0.5, adductors: 0.5 }, lo: 4, hi: 8, rest: 180, level: 'intermediate',
    cues: ['Stand on a low platform or a weight plate, the bar over the middle of your feet.', 'Breathe in, lean forward and grip the bar.', 'Hold your breath, brace, and pull the bar close to your body with a straight back until you stand straight.', 'Lower the bar to the floor with control; breathe and repeat.'],
    safety: BACK + ' The deficit makes the lift harder and works the quads more: use less weight than your normal deadlift.',
    ref: SL(['Deficit deadlift', 'deficit-deadlift']),
  },
];

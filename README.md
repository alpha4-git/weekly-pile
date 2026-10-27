# Weekly Pile

A phone web app that always tells you the next best exercise for your muscle targets, then logs your sets.
It's served by GitHub Pages at https://alpha4-git.github.io/weekly-pile/ and runs offline once installed.

## Install on Android (Firefox)

1. Open the address above in Firefox.
2. Menu (⋮) → **Install** (or **Add to Home screen**).
3. Open it from the home-screen icon. It loads the plan and exercise library on first launch.

Your targets, exercise library and logged sets are stored in Firefox on the phone. Nothing you log is sent anywhere.
Use **Data → Export everything** now and then for a backup zip.

## Tabs

- **Workout**: one page per priority muscle, starting with the muscle that most needs a set. Each page shows the best exercise
  for that muscle (with its figure or photos and the logger) and up to three other ways to work it, each with a different
  emphasis. Arrows and swipes walk the top 10 muscles; the middle button lists them. The order re-sorts after every set,
  and the page you're on stays put. An exercise you pick or log for a muscle stays its choice for the rest of the day.
- **Header counter**: sets in the last 7 days against the weekly set target (the Plan estimate), and "x–y needed today":
  x more sets today bring the last 7 days up to the target, y more bring the 30-day average up to it (tap it for details).
- **Log**: every set, editable.
- **Goals**: *Priorities* (the muscles furthest below target), every muscle's sets per week and focused share, and rolling
  sets-per-week charts (7-day, 30-day, year) overall and per muscle.
- **Plan**: a card per muscle with its target (sets per month) and minimum *focused* share; tap a card to edit. Also the target
  scale and filters for the exercise pool.
- **Data**: get the latest plan and library, import, export, search the library, app updates.

## How exercises are ranked

Each logged set credits muscles: **1** for a full set of the main mover, **½** for a genuine synergist (presses → triceps, front delts; rows → biceps, rear delts).
For each muscle the app tracks, over the last 30 days:

- `avg`: credited sets per week (the same number as the Goals 30-day line)
- `focused`: full-credit sets per week
- effective volume `eff = min(avg, focused ÷ minimum focused share)`. Half sets only count while enough focused sets back them.
- fatigue: recent sets decaying with an 18-hour time constant; readiness `R = 1 − (fatigue ÷ 6)³`

The value of one more set for a muscle is `(gain in eff) × (target − eff) ÷ target`, times `R`. Sets for a muscle at its target cost a little,
and sets for a tired muscle cost more. An exercise's score is the sum over its muscles. Hand-reviewed exercises get a 12% preference, then
common staples, beginner level and machines/cables get small tie-break preferences. Exercises that give full sets to the same muscles are grouped,
and the best one is shown with the rest under *Similar exercises*.

The result: compounds come first while several of their muscles are behind. Once the big muscles are covered, the remaining gaps and
focus minimums belong to small muscles, so their isolation exercises rise to the top.

## Files

```
index.html, app.js, app.css     the core app
sw.js                           offline cache; new versions wait for "Install update"; exercise photos cached once viewed
manifest.webmanifest, icons/    home-screen install
content/index.json              list of exercise files, the plan file and the library bundle (with versions)
content/plan.json               muscles, default monthly targets and focus minimums
content/exercises/<id>.json     the 16 hand-reviewed exercises (cues, credit, references, figure)
content/library.json            500 more exercises converted from the free-exercise-db (not individually reviewed)
tools/build-content.js          builds the reviewed exercises, plan.json and index.json
tools/import-fedb.js            converts free-exercise-db into content/library.json
```

Rebuild: `node tools/import-fedb.js <free-exercise-db>/dist/exercises.json <commit sha>` then `node tools/build-content.js`
(raise `LIBRARY_VERSION` in build-content.js when library.json changes).

### Exercise file (`type: "exercise"`)
`id`, `version` (raise it to push a change), `name`, `short`, `equipment` (label), `equip` (filter key), `level`, `mechanic`, `reviewed`,
`unit`, `step`, `perSide`, `rest` (seconds), `lo`/`hi` (rep range), `credit` (muscle → 1 or 0.5), `cues`, `safety`, `refs` (https links),
`figure.svg` (reviewed exercises; drawn with the app's CSS classes, sanitized on import) or `images` (free-exercise-db photo paths, loaded from a fixed commit).

### Plan file (`type: "plan"`)
`id`, `version`, `name`, `muscles` (key → label), `targets` (key → sets per month), `focus` (key → minimum share of full sets, 0–1).
`items` is the old fixed list, kept so version 1.1 of the app still works until it updates.

### Export zip
`plan.json`, `plans/`, `exercises/`, `logs/` (one JSON file per set: `id, ex, w, unit, r, t`), and `settings.json`
(target scale, your targets and focus minimums, pool filters, hidden exercises). The same zip can be imported to restore everything.

## Sources
- Exercise database: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense / public domain), photos and instructions.
  Muscle credit was re-derived from its primary/secondary muscles with the rules in `tools/import-fedb.js`. Explosive, odd and
  joint-unfriendly entries (bench dips, behind-the-neck and guillotine presses, kipping, snatches, etc.) were left out.

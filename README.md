# Weekly Pile

A phone web app for working through a week's pile of gym sets, one exercise per page.
It's served by GitHub Pages at https://alpha4-git.github.io/weekly-pile/ and runs offline once installed.

## Install on Android (Firefox)

1. Open the address above in Firefox.
2. Menu (⋮) → **Install** (or **Add to Home screen**).
3. Open it from the home-screen icon. It loads the current plan on first launch.

Your plan, exercise library and logged sets are stored in Firefox on the phone. Nothing you log is sent anywhere.
Use **Data → Export everything** now and then for a backup zip.

## Files

```
index.html, app.js, app.css     the core app
sw.js                           offline cache; new versions wait for "Install update"
manifest.webmanifest, icons/    home-screen install
content/index.json              list of library files + the current plan file
content/plan.json               the week's plan: ordered exercise ids, sets, rep range
content/exercises/<id>.json     one exercise card per file (cues, credit, references, figure)
tools/                          generator for the content files (node tools/build-content.js)
```

### Exercise file (`type: "exercise"`)
`id` (unique, lowercase), `version` (raise it to push a change), `name`, `short`, `equipment`, `unit`, `step`,
`perSide`, `credit` (muscle → 1 or 0.5 effective sets), `cues` (numbered to match the figure), `safety`,
`refs` (https links), `figure.svg` (drawn with the app's CSS classes; scripts and links are stripped on import).

### Plan file (`type: "plan"`)
`id`, `version`, `name`, `muscleTarget`, `muscles` (key → label), `items`: `[{ex, sets, lo, hi}]` in workout order.

### Export zip
`plan.json`, `plans/`, `exercises/`, `logs/` (one JSON file per set: `id, ex, w, unit, r, t`), `settings.json`.
The same zip can be imported to restore everything.

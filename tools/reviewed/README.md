# Reviewed free-exercise-db entries

Each file exports a list of exercises that were checked by hand before going into the app:

- photos: both database photos viewed; `swap: true` when the second photo shows the starting position
- reference: every cue, caution and muscle was checked one by one against the linked page (October 2026); contradictions were rewritten to match it
- credit: 1 = the muscle the exercise directly trains; 0.5 = indirectly worked (fractional counting, Pelland et al. 2024)
- variant: the emphasis within the main muscle, used to offer distinct "other ways to work" a muscle

Entries are keyed by the free-exercise-db `id`. `tools/import-fedb.js` only emits exercises listed here.

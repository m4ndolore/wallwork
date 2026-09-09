# Session history and progress view

Roadmap item 2. Decided with Paul on 2026-08-09: the Progress screen shows both trend cards and
a chronological log; the Setup wipe button clears bests and history together.

## Data

New storage key `ww:hist`: an array of finished runs, oldest first.

```
{ "p": "Leo", "a": "u8", "d": "sole-taps", "r": 21, "ms": 640, "t": 1754770000000 }
```

- Recorded in `Eng.finish()` only. Stopping a run early saves nothing.
- Capped at the most recent 400 entries at write time.
- Reps are the stored truth. Tier labels are recomputed at display time with the current
  thresholds, so threshold corrections in `drills.json` retroactively re-grade old sessions.
- Records keep the player name and age band they were made under; the Progress screen filters
  to the current player and band.

## Progress screen

New `↗` icon button on the home rail opens `s-prog`.

- Header note: player, band, and the promise that data stays on the device.
- **Trends**: one card per drill with sessions, ordered by most recent session. Card shows the
  drill name, a generated SVG sparkline of reps across sessions (last 16), and
  `N sessions · best X · last Y`. One session shows text instead of a line. Tapping the card
  opens the drill.
- **Sessions**: chronological log, newest first, grouped by day (`Sat 9 Aug`). Each row: drill
  name, reps, tier name. Display capped at the last 60 rows with a note when truncated.
- Empty state: "No sessions yet. Finish a run and it lands here."

The drill page gains a `Recent: 13, 15, 16 reps` note when history exists for that drill.

## Wipe

The Setup button is relabelled "Clear personal bests and history" and clears `ww:bests` and
`ww:hist` in one tap.

## Constraints honoured

Engine stays drill-agnostic; sparkline and log render from history plus the drill list, no
per-drill code. Plain ES5 in the single self-contained file. No network, no telemetry.

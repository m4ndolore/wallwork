# CLAUDE.md

Wallwork — a free reaction-training coach for soccer wall work. Calls a target, scores reps,
scales tiers to the player's age. Built by a parent training two boys (ages ~5 and ~8).

## Commands

```
node tools/inline-drills.mjs     # after ANY edit to drills.json — copies it into index.html
python3 -m http.server 8080      # serve locally; mic mode needs https, so use tap mode here
```

No package.json, no bundler, no dependencies. `index.html` opens directly from `file://`.

## Files

```
index.html                 entire app, self-contained (inlined copy of drills.json inside)
drills.json                the drill library — source of truth, most changes land here
tools/inline-drills.mjs    sync script
README.md                  public docs + drill schema
```

## Three invariants — do not break these

1. **Drills are data.** The engine has no per-drill code. It reads `sequence`, `channels`,
   `palette`, `footMap`, `tiers`. Never add an `if (drill.id === ...)`. New behaviour means a new
   schema field handled generically, plus a README schema update.

2. **One hit event.** Tap, mic, and sensor all emit `{source, boardId, t}` onto `Bus`. The scoring
   engine subscribes and must stay ignorant of input source. Multi-board is already expressible as
   differing `boardId`.

3. **Setup diagrams are generated.** `setupSvg()` draws from `setup.layout` + per-age distances.
   New drills reuse an existing layout, or add a layout branch. Never hand-author a diagram or add
   a photograph.

## Hard constraints

- **Single self-contained HTML file.** It must fit in ESP32 flash and serve with no fetches.
- **No backend, no accounts, no analytics, no telemetry.** Children's performance data never
  leaves the device. This is a product decision, not a TODO.
- **Mic needs a secure context.** `getUserMedia` fails on plain http, so mic scoring is
  hosted-build-only. Don't "fix" this — sensor mode replaces it.
- **No Web Bluetooth.** It does not exist on iOS. Hardware talks WiFi + WebSocket, and the ESP32
  serves the page itself over http so `ws://` is same-origin.
- **ES5-flavoured plain JS, no framework.** Matches the existing style; keeps the file small.

## Known issues (good first tasks)

- Age scaling is a single multiplier per band (`ageScale`, u6 = 0.4). It's a guess. Expect to
  replace it with per-drill per-band tables now that session history exists to inform it.
- Mic threshold is a raw peak level with a 320ms refractory window. Naive. A proper onset
  detector (spectral flux) would cut false positives on grass and carpet.

## Storage keys

All localStorage, all device-local: `ww:cfg` (settings), `ww:bests` (one PB per
player|age|drill), `ww:hist` (finished runs, capped at 400 — reps are the stored truth, tier
labels are recomputed at display time).

## Editing drills

Schema is documented in README.md. Notes:

- `tiers` are authored at the `open` (adult) band; younger bands are derived via `ageScale`.
- Distances in `spanFt` / `boardFt` are authored per band — they do not scale linearly.
- `coaching` entries should name the failure mode or the common cheat, not describe the drill.
- The phone is the caller; nothing ever lights up. Markers are plain coloured objects. Write
  "the called colour", never "the lit marker".
- Name the foot surface exactly: sole means the bottom of the foot. If a drill wants the toe
  or the laces, say so.
- Tier names are `Rookie, Solid, Sharp, Silky, Elite`. Soccer touch vocabulary, deliberate.
- Drills unsuitable for young kids should say so in `coaching` rather than being hidden.

## Roadmap

Done: localStorage, public deploy (wallwork.pages.dev, push-to-deploy from main), session
history + progress view.

1. `hardware/` — ESP32 firmware: SoftAP, static file server for index.html, WebSocket emitting
   `{"type":"hit","board":N}`. Accelerometer mounts to the centre-back of the rebound panel, not
   the frame; the frame damps the impact transient.
2. Multi-board sessions (2–6), which the event schema already supports. Note: the cue engine
   currently never says *which* board — fix generically alongside the hardware.
3. 3D-printed enclosure.
4. Maybe: a watchOS companion for calls-on-the-wrist and tap scoring (Paul has an Apple dev
   account). It would emit the same `{source, boardId, t}` hit events.

## Tone

Coaching copy is plain, direct, and written for a parent who is learning the game alongside their
kids. No hype, no exclamation marks, no "crush it". Say what to watch for and what usually goes
wrong.

## Legal

MIT. Not affiliated with or compatible with any commercial reaction trainer. Tier thresholds are
Wallwork's own — informed by observing the category, never copied. Don't add compatibility claims
or competitor names to user-facing copy.
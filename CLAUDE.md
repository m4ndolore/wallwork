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

- `put()` / `get()` in index.html use `window.storage`, a host-specific shim. **For real
  deployment, swap to `localStorage`** with the same async-shaped API so nothing else changes.
- Age scaling is a single multiplier per band (`ageScale`, u6 = 0.4). It's a guess. Expect to
  replace it with per-drill per-band tables once real session data exists.
- Mic threshold is a raw peak level with a 320ms refractory window. Naive. A proper onset
  detector (spectral flux) would cut false positives on grass and carpet.
- No session history — only a single personal best per player/age/drill.

## Editing drills

Schema is documented in README.md. Notes:

- `tiers` are authored at the `open` (adult) band; younger bands are derived via `ageScale`.
- Distances in `spanFt` / `boardFt` are authored per band — they do not scale linearly.
- `coaching` entries should name the failure mode or the common cheat, not describe the drill.
- Tier names are `Rookie, Solid, Sharp, Silky, Elite`. Soccer touch vocabulary, deliberate.
- Drills unsuitable for young kids should say so in `coaching` rather than being hidden.

## Roadmap

1. localStorage swap, then first public deploy (Cloudflare Pages).
2. Session history + a simple progress view.
3. `hardware/` — ESP32 firmware: SoftAP, static file server for index.html, WebSocket emitting
   `{"type":"hit","board":N}`. Accelerometer mounts to the centre-back of the rebound panel, not
   the frame; the frame damps the impact transient.
4. Multi-board sessions (2–6), which the event schema already supports.
5. 3D-printed enclosure.

## Tone

Coaching copy is plain, direct, and written for a parent who is learning the game alongside their
kids. No hype, no exclamation marks, no "crush it". Say what to watch for and what usually goes
wrong.

## Legal

MIT. Not affiliated with or compatible with any commercial reaction trainer. Tier thresholds are
Wallwork's own — informed by observing the category, never copied. Don't add compatibility claims
or competitor names to user-facing copy.
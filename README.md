# Wallwork

A free reaction-training coach for soccer wall work. Calls the target, scores the reps, scales to the player's age.

Works with nothing but a phone and a wall. Works better with a rebound board. Works best with a
cheap sensor you can build yourself. No account, no subscription, no data leaves the device.

MIT licensed. Drills are data — pull requests welcome.

---

## Why

Commercial reaction trainers publish a single adult scoring table. A six-year-old scores the
bottom tier on everything and loses interest by week two. The usual workaround is to shrink the
distances, which makes the scores incomparable across sessions.

Wallwork treats age as a first-class dimension instead. Every drill carries per-age setup
distances and a scaling factor on its tier thresholds, so a five-year-old and an adult can both
earn Silky honestly, on a course scaled to them.

## Three ways to score a rep

| Mode | Needs | Where it runs |
|---|---|---|
| Tap | Nothing | Anywhere |
| Mic | HTTPS | Hosted build only — `getUserMedia` requires a secure context |
| Sensor | An ESP32 board | Served from the board over plain http |

The mic listens for the ball's impact transient. It confirms *that* a rep happened and *when*,
not *where* the ball landed. That is a real limit, and it is worth being clear that commercial
systems share it: their sensor sits on the board and cannot tell which marker you struck either.
The called colour, number, and foot are an unverified constraint layer in every product of this
kind. The constraint makes the rep hard; the sensor makes it measurable.

The phone is the caller. The screen shows the colour and, with voice on, says it out loud. The
markers themselves never light up and are never connected to anything — any coloured object
works: cones, pods, a strip of tape. Light-up training pods serve fine here as plain coloured
markers, switched off.

### The iOS problem, and why there is no app

Web Bluetooth does not exist on iOS and is not coming. Routing hardware through BLE would lock
out every iPhone and iPad.

WiFi plus WebSocket works on every platform, but a page served from `https://` cannot open a
`ws://` socket to a device on the local network — the browser blocks it as mixed content. So the
board serves the page itself, over plain http, same origin as its own socket. One codebase, two
delivery paths, no app store, no developer fee, and the hardware mode works with no internet at all.

## Layout

```
index.html                 the whole app, self-contained, no build step to run it
drills.json                the drill library — the file worth contributing to
tools/inline-drills.mjs    copies drills.json into index.html
```

`index.html` carries an inlined copy of `drills.json` so it runs from `file://`, from static
hosting, and from an ESP32's flash with no fetch. After editing `drills.json`:

```
node tools/inline-drills.mjs
```

## Deploying (Cloudflare Pages)

Wallwork is a static site. Cloudflare Pages can publish the repo directly.

Before deploying, make sure `index.html` has the latest inlined drills:

```
node tools/inline-drills.mjs
```

In Cloudflare Pages:

- **Build command**: `node tools/inline-drills.mjs`
- **Build output directory**: `/`

## Architecture

Three seams, chosen so that later work is additive rather than a rewrite.

**Drills are data.** A drill is a JSON object describing its markers, sequencing rule, cue
channels, duration, and tier thresholds. The engine reads the spec; it has no per-drill code.
Adding a drill means adding an object.

**One hit event.** Tap, mic, and sensor all emit `{source, boardId, t}` onto a shared bus. The
scoring engine subscribes and knows nothing about where a hit came from. Multi-board support is
already expressible — a six-board session is just events with different `boardId` values.

**Setup diagrams are generated.** Each drill declares a layout name and per-age distances; a
single renderer draws the diagram. New drills get a correct, age-scaled picture for free, and
there are no photographs to license or keep current.

## Session history

Every finished run is saved on the device: player, age band, drill, reps, and average reaction
time, capped at the most recent 400 sessions. The Progress screen (the ↗ button) graphs reps
per drill and lists every session by day, so you can see whether the numbers actually move.
Stopping a run early saves nothing. Reps are the stored truth — tier labels are recomputed
against current thresholds, so a threshold correction re-grades old sessions. Clearing it all
is one button in Setup, and none of it ever leaves the device.

## Drill schema

```jsonc
{
  "id": "grid-random",
  "name": "Four colours",
  "family": "grid",              // open | board | grid | multi
  "summary": "One line the player reads before starting.",
  "isTest": false,               // benchmarks, run monthly, not every session
  "boardsNeeded": 2,             // omit unless it needs multiple sensor boards
  "setup": {
    "layout": "grid-four",       // two-marker | grid-four | grid-six | open-four
                                 // | open-two-behind | multi-board
    "markers": 4,
    "boardAngle": "vertical",    // vertical returns along the ground, angled returns in the air
    "spanFt":  { "u6": 8, "u8": 10, "u10": 12, "u12": 12, "open": 12 },
    "boardFt": { "u6": 4, "u8": 4, "u10": 6,  "u12": 6,  "open": 6 }
  },
  "cue": {
    "channels": ["color"],       // color | number | board
    "palette": ["yellow", "blue", "orange", "pink"],
    "sequence": "random",        // single | random | rotate | timed
    "intervalMs": 5000,          // timed only
    "numberChance": 0.5,         // number channel only
    "priority": "number",        // which channel wins when both show
    "footMap": { "red": "left", "green": "right" }
  },
  "scoring": {
    "durationSec": 45,
    "counts": "board",           // board | marker
    "tiers": [7, 10, 12, 14]     // Solid, Sharp, Silky, Elite — Rookie is below the first
  },
  "coaching": ["What to watch for.", "The common cheat.", "When to skip this drill."]
}
```

Thresholds are authored at the `open` band and multiplied by `ageScale` for younger players.
Distances are authored per band, because they do not scale linearly.

## Contributing drills

The drill library is the part most likely to be wrong, and the part a coach can fix without
touching code. Useful contributions:

- Threshold corrections from real sessions, with the age band and the number of players behind them
- New drills, especially in the `open` family — no board needed, so anyone can run them
- Better coaching notes: the failure mode to watch for beats a description of the drill

Two copy rules: the phone calls, nothing lights — write "the called colour", never "the lit
marker". And name the foot surface exactly — sole means the bottom of the foot; if a drill wants
the toe or the laces, say so.

Open a PR against `drills.json` and say how many reps produced the numbers.

## Building the sensor

An ESP32 with an accelerometer bolted to the back of the rebound board, running an access point,
a static file server for this page, and a WebSocket that emits `{"type":"hit","board":0}` on
impact. Parts cost about twelve dollars. Enclosure and firmware to follow in `hardware/`.

## Not affiliated

Not affiliated with, endorsed by, or compatible with any commercial reaction-trainer product.
Tier thresholds here are Wallwork's own and will move as real session data comes in.

## Licence

MIT.

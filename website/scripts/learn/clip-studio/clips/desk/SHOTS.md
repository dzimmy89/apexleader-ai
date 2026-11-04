# Desk shots: shots.json

Same format and rules as The Node's kit (`TheNode-University/scripts/learn/clip-studio/clips/kit/SPEC.md`):
`inputs`, `values`, `shots`; every time is a **cue** (`"word"`, `"word#1"`, `"L3"`, `"L3:word"`, `"end"`, plus
`"+0.4"`); every number is `{expr|fmt}`; one hero per shot; every shot has a camera preset. The pure parts are
unchanged in `../kit/spec.mjs` (cues, the safe evaluator, formats, lint) and `../kit/kit.mjs` (`init`, `retime`,
`dest`). Positions are px on the 1920x1080 sheet. Keep content above y ≈ 880: captions are player-only (the `.vtt` track), and the player draws them over the bottom band.

Optional top-level `"track": "marketing" | "sales" | "accounting"` tints the quiet accents (the chapter card's kicker, rule and
agenda icons) in that course's colour from `brand.css`. Heroes stay signal orange.

Camera presets: `push-in` (default), `pull-back`, `dolly-left`, `dolly-right`, `hold-drift`.

Any shot may carry `"over": "<earlier shot id>"` (the earlier shot fades out behind it; under a question it stays at
30%) and `"notes": [{text, icon, at, until, screen: top|mid|low, tone: signal}]` (small chips, never the hero).

| Type | Fields | Hero |
| --- | --- | --- |
| `desk` | `items: [{id, kind, x, y, w, at?, until?, lightAt?}]`. Kinds: `laptop` (`closeAt`), `chip` (`icon`, `text`, `swap: {icon, text, at}`, `swapW`), `agent` (`icon`, `name` in mono, `status`, `statusTone: ok/sig/bad`, `statusIcon`, `lines: [{text, at}]`), `card` (`icon`, `title`, `sub`, `status`), `paper` (`icon`, `text`, `kicker`: the one paper block), `text` (`text`, `cls: title/h2/kicker`), `list` (`title`, `rows: [{text, at}]`). Items without `at` are there on frame 0. | `{move: light/pop, target, at}` |
| `chapter-card` | `kicker`, `title` (default: the scripts.json `chapter` split on ` · `), `sub` + `subAt`, `agenda: [{text, icon, at}]` | the card on `from` |
| `story-cards` | `cards: [{icon, label, sub, rows: [{text, at}], at, agent?, status?, statusTone?, strikeAt?}]`, `kicker`, `title`, `titleAt`, `numbered`, `cardW`, `gap`, `top`, `equal` (equal heights, default true) | `{card: i or [i, j], at?}` (default the last card's arrival) |
| `timeline` | `kicker`, `title`, `titleAt`, `markers: [{date, label, sub, at}]` (years are allowed literally) | `{marker: i}` |
| `rule` | `kicker`, `kickerIcon`, `statement`, `highlight: {text, at}` (that phrase turns signal), `at`, `chips: [{icon, text, at, tone, strikeAt}]`, `y` | the highlight |
| `figure` | `src` (`public/learn/figures/...`), `title`, `regions: [{rect: [x, y, w, h] as fractions, at, label}]`, `zoom: false` (the camera stays; only the ring and the dim move) | `{region: i}` |
| `counter` | bars mode only: `bars: [{label, value, at, land, fmt}]`, `kicker`, `title`, `fmt`, `gap`, `top` | `{bar: i}` |
| `ledger` | grid mode only: `grid: {columns: [{text, w, num?, sub?}], rows: [{cells: [text or {text, at}], at, lightAt}], total: {cells, at}}`, `kicker`, `title` | `{row: i}`, `"total"` |
| `question` | last shot of a setup: `kicker`, `question`, `lines: [{text, at}]` (each gets a "?" chip), `pulse`, `over` | the "?" pulse |
| `reveal` | first shot of a reveal: `question: {clip, shot}`, `answers: [{text or value+fmt, at}]` (fill the chips in order) | the first answer |

Workflow: add the narration to `../scripts.json`, `node clips/kit/kit.mjs init <clip>`, write `shots.json`,
`npm run icons`, voice, `retime`, stills, then `run-lesson.sh`.

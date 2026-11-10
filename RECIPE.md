# Quantum

A deep-space layout for Herdr. The window sits on a near-black navy nebula picture, with a ringed
planet behind the title bar and a giant planet's glowing horizon behind the status bar. Every
region floats over it as a square, translucent navy panel with a thin blue 1px border; nothing is
rounded except small status dots. Top to bottom: a title bar with a centred command search and a
notification bell; then three columns: workspaces and agents on the left, the active tab's panes
(each its own framed box) in the middle, and a live **Session** panel on the right (with a
**Tasks** tab when the task-board mod is installed); then a status bar with machine, branch,
agents, CPU, RAM and tokens.

![Quantum](preview.png)

## What you see

**Everywhere.** Panel fill `#0b1236b8` with a 1px `#4a58b8aa` border, square. Text `#e8ebff`,
muted `#a3a9e0`, dim `#6d73b3`; accents cyan `#4fd8ff`, violet `#8b6cff`, lilac `#b9a4ff`, green
`#4ef0a6`, amber `#ffb547`. The UI font is Herdr's default; only commands and run output use
JetBrains Mono. A "selected" item (active space, focused or working agent, the search field) gets
a 1px violet `#8b7bffcc` border and nothing else. Hover on rows and buttons is a faint white wash
(`#ffffff0a` to `#ffffff16`).

**Background.** `mods/quantum/nebula-deep.jpg`, 2560×1440, `cover`, behind everything. The
window's canvas is transparent (`#00000000`) and terminals are drawn at opacity 0, so the picture
shows through every panel and every terminal.

**Window.** Outer padding 6px top and bottom, 10px left and right. No system title bar.

1. **Title bar, 56px** (drags the window). Left to right:
   - the atom logo (`logo.svg`, 42px) over a soft violet halo, then "Herdr" 25px bold white;
   - the search field, exactly 640px wide and centred in the window (equal flexible space on
     both sides): 38px tall, fill `#0a0d33e0`, violet `#8b7bffcc` border, a 16px lilac search
     icon, the placeholder "Search workspaces, projects, agents, files, or run a command…"
     (13.5px muted), and at the right a key chip with the palette shortcut read from the
     person's keys (e.g. `Ctrl+Shift+P`; `⌃⇧P` style on macOS), 11.5px on `#ffffff14` with a
     `#ffffff22` border;
   - right-aligned, 16px apart, 34px square buttons: the bell (20px icon), help (19px),
     settings (19px); then a 36px planet orb (`orb.svg`) over a violet halo; on Linux and
     Windows then the window buttons − □/❐ ×. Settings appears only here.
   - The bell carries a 7px dot at its top right only when an agent needs you (red `#ff6b8a`)
     or, failing that, when one finished unseen (green `#4ef0a6`). No dot otherwise.
   - On macOS (not fullscreen) the bar starts 84px in, leaving room for the traffic lights,
     which sit at (18, 22).

2. **Body row**, three columns 10px apart.

   - **Sidebar, 276px** (drag 230 to 480). One framed panel, padded 10px top and bottom:
     - Header "Workspaces" (layers icon 17px lilac, 15px semibold) with a 24px "+" button.
     - "Spaces" (12px dim), then per machine: a 24px row with a monitor or server icon, "This
       computer" or the machine name (12.5px muted), a 7px dot (green ready, amber loading,
       dim otherwise) and a "+"; under it that machine's spaces. A remote machine with no
       spaces is left out; this computer always shows.
     - A space row, 27px: a 20px square letter tile (first letter, bold white, on one of ten
       colours picked by a hash of the name), the name (13px medium, at most 150px; white when
       active), a 12px status mark unless idle, and right-aligned "repo · branch" (11.5px; the
       folder name is left out when it matches the space name or the folder is home). The
       active space has the violet border.
     - A 1px `#8b6cff44` divider, then header "Agents" (people icon) with a dim clock icon.
     - Agents in groups, each a 12px label plus its count: **Pinned**, **Needs you** (amber
       label), **Working** (cyan label), **Done**, **Idle**; empty groups hidden, "No agents
       running" when there are none.
     - An agent row, 25px: program icon (15px), "space · tab" (12.3px; a numeric tab name is
       left out; muted when idle and not focused), the machine name for a remote agent (11px
       dim), a fold mark when it has sub-agents ("⌄" open, "› N" folded), the time since its
       last change ("12s", "4m", "3h", "2d"; 11px dim) and a 13px status mark. Focused and
       working agents have the violet border.
     - Sub-agents under their parent, 24px rows indented 14px per level with "└": program icon
       (14px), its `task` label (else name, template, program or address; 12px) and a 12px
       status mark. Sub-agents of sub-agents nest further.
     - A `#8b6cff33` divider and the footer "+ Add machine" (13px muted).
     - The spaces list and the agents list share the height equally and scroll on their own.

   - **Work column** (takes the rest):
     - **Tab bar, 40px** (drags the window): a row of 30px-tall items 6px apart along its top,
       leaving 10px above the panes. A 30px square grid button, the tabs (scrolling sideways)
       and a 30px square "+". Squares and inactive tabs: fill `#12164acc`, border `#2e3270`.
       A tab: 12px side padding, 12.5px medium text (at most 170px), the program icon for an
       agent or a terminal icon for a shell; an auto-named tab (a number or `tbN`) shows the
       agent's program name, else its index; " ⤢" when zoomed. Active tab: fill `#1c2266e0`,
       border `#6fa8ffcc`, white text and a 12px × at its end. An inactive tab whose status
       isn't idle shows a 6px dot (cyan working, amber blocked, green done).
     - **Panes and side panel**, 10px apart:
       - Each pane of the active tab is its own square box, even when alone: fill `#0b1236b8`,
         1px `#4a58b8aa` border, `#4fd8ffaa` while it has the keyboard; 10px between panes;
         terminal padding 14px × 12px.
       - Each pane has a 38px header band on top: fill `#1a2254`, a 1px `#454c86` line under
         it, 12.5px text. Program icon (15px), name (semibold white, at most 260px), folder with
         `~` for home (dim, truncates), a status mark (see below), then 24px buttons "+",
         "Files" and "Changes" (with the shipped mods' 14px icons) and "⋮". Files and Changes
         light up (fill `#2a2384dd`, border `#b9a4ffcc`, white) while their view is showing.
       - The **side panel**, hidden at start, 368px (drag 280 to 900): its own framed box to the
         right of the panes, holding the shipped Files or Changes mod.
       - The area round the panes has no frame of its own; the nebula shows in the gaps.

   - **Right column, 330px** (drag 260 to 520):
     - **Underline tabs**, a 30px framed strip (fill `#0b1236b8`, border `#4a58b8aa`) at the
       top of a 40px block (so 10px gap below). "Session" (activity icon) and, only when
       task-board is installed, "Tasks" (check icon), equal halves split by a 1px `#4a58b8aa`
       line. The active one: white semibold 12.5px, a cyan 14px icon, a faint cyan fill
       `#4fd8ff12` and a 2px cyan bar along its bottom. The other: muted text and icon.
     - **Session**: three separate framed cards 10px apart. Card fill `#0b1432c8`, 14px side
       padding, 12px top and bottom; each header 24px: a 17px cyan icon over a soft cyan halo
       and a 14px semibold white title.
       - **Current Run** (activity icon). At the top right a 20px status pill: the status
         colour as text and 1px border over a 10% tint of it: "Running" cyan, "Needs you"
         amber, "Done" green, "Idle" or "No agent" dim. A `#24306a` rule, then 16px rows (13px
         dim icon, 84px muted label, 12.3px value, "—" when unknown): Agent (with program
         icon), Project (folder, cyan folder icon), Workspace ("space · machine" or "space ·
         This computer"), Branch (only when the pane has one; violet branch icon), Mode (amber
         ⚡; auto, accept edits, plan, bypass or default), Model ("Opus 5.5 (medium)"), Started
         ("4m 12s ago"), Tokens ("↑ 320k   ↓ 4k"). With no agent: "Focus an agent's pane to
         see its run." When the screen shows a context figure: a 12px label (the live verb such
         as "Doing… (medium effort)" while working, else "Context left"), a 246 × 9px bar of 40
         segments shading cyan to violet over a `#ffffff14` track, filled to the percent of
         context left, that percent at the right (12.5px semibold white), and "320k of 1.0M ·
         limit 5h 34% · 7d 31%" (11px dim).
       - **Recent Commands** (terminal icon): the last six `Bash(...)` commands on the agent's
         screen, newest first, in 12.3px JetBrains Mono, a green check before each; the newest
         white, the rest muted. While working, the newest has a `#1c2560` fill and a 7px cyan
         dot instead of the check. Empty: "No shell commands on screen yet."
       - **Run Output** (list icon) takes the rest of the column: the last seven lines above the
         agent's input box, 11.5px JetBrains Mono, each after a violet "›", truncated; the last
         line white, the others muted. Empty: "›  waiting for output…". A 24px "⤢" button at
         the top right.
     - **Tasks**: the task-board mod in its own framed box (`#0b1236b8`, `#4a58b8aa` border).

3. **Status bar, 46px**: a 38px framed strip (fill `#0b123699`, border `#4a58b8aa`) 8px below
   the columns, 20px side padding, items 20px apart, 14px text, 1 × 16px `#8b6cff44`
   separators. Left: a cyan monitor or server icon and the machine ("This computer"); the
   active space's branch (lilac branch icon) when it has one; an 8px dot (cyan when any agent
   works, else violet, over a small halo) and "5 agents · 1 working"; "1 needs you" or "2 need
   you" in amber when any. Right: "CPU 28%" (cpu icon), "RAM 20.4G / 31.1G (66%)" (ram icon),
   "↑ 320k   ↓ 4k" (cyan bold arrow) when known, a separator, and "commands" with a terminal
   icon.

**Bell popup.** 360px wide, fill `#0c1034f6`, 1px `#4a58b8aa` border. A 40px header
"Notifications" (13px semibold white) with "N new" (11.5px dim) at the right and a `#4a58b866`
line under it; then the sections "Needs you" and "Finished" (26px, 11px dim labels) of 42px rows:
program icon (16px), "space · tab" (12.5px), under it "Needs you" (amber) or "Finished" (green)
plus the machine for a remote agent (11px), the time since the change, and a 13px status mark.
Newest first in each section. With nothing to show: "No notifications" centred in 60px. The
popup is as tall as its rows, at most 470px, and scrolls beyond that.

**Status marks** (sidebar, space rows, bell rows): working, a 2px amber ring; blocked, an amber
disc with a dark "!" (`#1a1030`); done, a small green disc (55% of the mark's size); idle, a dim
thin ring.

**Theme** (`themes/quantum.json`): terminal background `#0e1236`, text `#dfe4ff`, selection
`#3a2f8f`, cursor `#6ee7ff`, accent `#8b6cff`; status colours working `#4fd8ff`, blocked
`#ffb547`, done `#4ef0a6`, idle `#6b72b0`; a 16-colour ANSI set of navy, pink, green, gold,
blue, violet and cyan.

## How it behaves

**Agent status, everywhere it shows:**

- **working:** amber ring in the sidebar and space row; listed under "Working" with the violet
  border; a cyan dot on its tab when that tab isn't active; a 12px amber ring in its pane
  header; the cyan "Running" pill; the newest command highlighted with a cyan dot; the context
  label shows the live verb from the agent's screen ("Doing…", by default "Thinking…"); the
  status bar counts it ("· 1 working") and its dot turns cyan.
- **blocked:** amber "!" disc; listed under "Needs you"; an amber tab dot; an amber "Needs you"
  chip (11px semibold on amber at 15%) in the pane header; the amber "Needs you" pill; the red
  bell dot; first in the bell popup; "1 needs you" in the status bar.
- **done** (finished while you weren't looking): green disc; listed under "Done"; a green tab
  dot; a 7px green dot in the pane header; the green "Done" pill; the green bell dot when nobody
  is blocked; listed under "Finished" in the popup. Looking at it turns it idle and it leaves
  the bell.
- **idle:** dim ring; listed under "Idle" with muted text; no tab dot and no pane-header mark;
  the dim "Idle" pill; space rows hide the mark.
- Pinned agents stay under "Pinned" whatever their status. A sub-agent never shows done (it
  shows idle: the parent's done is the news) and an errored one shows blocked.

**Which agent the Session panel shows:** the focused agent; else the newest agent in the focused
tab; else the newest in the focused space; else none ("No agent").

**Clicks, keys and hovers:**

- Title bar: the search field (or the status bar's "commands") opens the command palette; the
  bell opens the popup, and a row there closes it and focuses that agent's pane; help opens
  help; settings opens settings; − □ × minimize, maximize and close. The logo and orb do
  nothing.
- Sidebar: Workspaces "+" makes a space; a machine's "+" makes a space on that machine; a space
  row selects it; an agent row focuses its pane; its program icon or fold mark folds or unfolds
  its sub-agents; a sub-agent row focuses it when it has a pane, else peeks it (a pane-less one
  started with `hc run --bg`); "Add machine" opens the machine-add dialog.
- Tab bar: click selects; double-click renames; right-click opens the tab menu; × closes the
  active tab; the mouse wheel over the bar steps to the previous or next tab; the grid opens
  the picker; "+" opens the new-tab menu (250 × 512).
- Pane header: a click focuses the pane; "+" splits it to the right; Files or Changes shows the
  side panel on that view, and clicking the lit one again hides it; "⋮" opens the pane menu.
- Right column: Session and Tasks switch the view. Run Output's "⤢" grows it over the whole
  column (Current Run and Recent Commands go away) with the last ~60 lines, scrollable; "⤡"
  shrinks it back.
- Drag the gaps between the sidebar, work column and right column, and between the panes and
  the side panel, to resize within the limits above. The tab bar and the right column's strip
  don't resize.
- It adds no keys of its own.

**What moves:** nothing animates. The Session panel re-reads the agent's screen every 4 s (not
while Tasks is shown); the status bar re-reads the screen, CPU and RAM every 5 s (CPU appears
from the second reading); the sidebar's "4m" labels refresh every 30 s. The Tasks tab appears
within 30 s of installing task-board.

## Built from

**Files:** `layouts/quantum.json`, `themes/quantum.json`, `mods/quantum/` (`mod.json`
`{ "place": "none", "title": "Quantum" }`, `main.js`, `ui.js`, art). Layout root:
`"titlebar": "none"`, `"traffic_lights": [18, 22]`, `"theme": "quantum"`, `"padding": [6, 10]`,
`"gap": 0`, `"terminal_padding": [14, 12]`, `"terminal_opacity": 0`,
`"background": { "image": "mods/quantum/nebula-deep.jpg", "fit": "cover" }`, and `colors`:
canvas `#00000000`, chrome `#0a0e2ce6`, surface `#0c1232dd`, background `#0a1030`, border
`#4a52b077`, input `#8b6cffaa`, hover `#ffffff12`, selected `#2a3290cc`, raised `#151a4ee8`,
popover `#0c1034f6`, muted `#a3a9e0`, dim `#6d73b3`.

**Node tree** (`quantum` = this mod with that `props.role`):

```
root column
├─ top        block 56px, window_drag        quantum "top"
├─ body       row, gap 10, resizable
│  ├─ sidebar block 276px (min 230, max 480) quantum "sidebar"
│  ├─ work    column, weight 1, resizable false
│  │  ├─ tabs       block 40px, window_drag  quantum "tabs"
│  │  └─ work-body  row, padding 0, gap 10, resizable (no background, no border)
│  │     ├─ main    block { "tab": "active", "pane": {...} }
│  │     └─ panel   column, hidden, 368px (280..900), background #0b1236b8, border 1 #4a58b8aa
│  │        └─ panel-body  stack, active "files"
│  │           ├─ files    block, mod "files"
│  │           └─ changes  block, mod "changes"
│  └─ session column 330px (260..520), resizable false
│     ├─ side-tabs  block 40px               quantum "sidetabs"
│     └─ side-body  stack, active "side-session"
│        ├─ side-session block               quantum "session"
│        └─ side-tasks   block, background #0b1236b8, border 1 #4a58b8aa
│                                            quantum "tasks" (switched to mod "task-board")
└─ status     block 46px                     quantum "status"
```

`main`'s pane frame: `{ "gap": 10, "radius": 0, "background": "#0b1236b8", "lone": true,
"border": { "width": 1, "color": "#4a58b8aa" }, "focus": { "width": 1, "color": "#4fd8ffaa" },
"header": { "content": { "mod": "quantum", "props": { "role": "pane" } }, "height": 38,
"position": "top", "reveal": "always" } }`.

**Roles** (one `View`; `this.role = props().role ?? "session"`): `top`, `sidebar`, `tabs`,
`pane` (one copy per pane, reads `props().pane`), `sidetabs`, `session`, `tasks` (an empty
`div`, a stand-in), `status`, and `bell` (opened by
`openOverlay({ mod: "quantum", kind: "popup", width: 360, height: bellHeight(...), props: { role: "bell" } })`,
closed with `closeOverlay(props().overlay)`). `ui.js` holds the colours `C`, `neon` (now just a
1px border: violet by default, `#4a58b8aa` for tone `card`), `panel` (a framed fill),
`barPic`, `halo`, `icon`, `programIcon`, `letterTile`, `statusMark`, `ago`, and
`CARD.band`/`CARD.rule` for the pane header.

**Session data.** `hc(["read", agent.address, "--lines", "0"])` (the visible screen only),
parsed from the bottom up:
- the Claude Code status line
  `model · effort | … ctx <bar> %<left> <used>/<size> … ↑<in> ↓<out> … 5s <n>% … 7g <n>%`
  (what `extras/claude-statusline.sh` prints);
- `(auto mode|accept edits|plan mode|bypass permissions) on` for Mode;
- `✻ <Verb>… (<detail>)` (any of `✻✽✢·*✶✳`) for the live verb;
- lines `● Bash(...)` or `⏺ Bash(...)` for the commands (last six);
- output: the lines above the second-to-last rule of `─` (the input box's top edge), without
  blank lines, rules and "Update available!"; the last 7, or the last 60 when grown.
A `busy` flag keeps a copy's reads from overlapping; the session copy skips its read while
`side-body` shows `side-tasks`. The status copy reads the same way, plus `/proc/stat` (CPU from
the change between two readings) and `/proc/meminfo` (MemTotal − MemAvailable); off Linux the
meters stay hidden.

**Sub-agents.** From `terminals()`: live ones with a `parent`, nested under the agent with that
address (a remote child's bare parent address gets the child's machine prefix). Ones started
with `hc run --bg` have no pane and are only in `terminals()`; kept ones are in `agents()` too
and show only under their parent unless pinned. Status from `agents()` when there, else the
terminal's.

**Tasks tab.** The `sidetabs` copy runs `syncBoard` in `cx.spawn` at start and every 3 s; on
the first run and every tenth (every 30 s) it checks for
`${appHome()}/mods/task-board/mod.json` with `readTextFile`. When task-board exists and
`side-tasks` doesn't name it, it runs
`exec("herdr-app", ["do", "layout.set", JSON.stringify({ layout })])` with a copy of `layout()`
whose `side-tasks.content` is `{ "mod": "task-board" }`. When it's missing and `side-tasks` is
showing, it selects `side-session`. The Tasks half of the switch is drawn only while
`side-tasks` names task-board. task-board lives at github.com/PsyChaos/herdr-mods and is not
shipped with Herdr.

**Herdr functions:** `agents`, `terminals`, `spaces`, `panes`, `focused`, `machines`, `layout`,
`props`, `keys`, `window`, `home`, `appHome`, `hc`, `exec`, `readTextFile`, `run`,
`openOverlay`, `closeOverlay`.

**Commands run:** `app.palette`, `app.help`, `app.settings`, `window.minimize`,
`window.maximize`, `window.close`, `space.new` (also `{ machine }`), `space.select { id }`,
`pane.focus { pane }` or `{ terminal }`, `terminal.peek { terminal }`,
`mod.open { name: "picker" | "machine-add" }`, `tab.select`, `tab.rename`, `tab.close { id }`,
`tab.prev`, `tab.next`, `pane.split { direction: "right", pane }`,
`layout.show` / `layout.hide { id: "panel" }`, `layout.select { stack, child }` (`panel-body`
to `files`/`changes`; `side-body` to `side-session`/`side-tasks`).

**Shipped mods used:** `files` and `changes` (side panel blocks); `menu` (tab menu popup 200px
wide with `{ tab: "tab", target: { id, space } }`; pane menu popup 220px wide with
`{ tab: "pane", target: { pane, terminal } }`); `new-menu` (popup 250 × 512); `picker` and
`machine-add` (`mod.open`). Icons borrowed from them: `mods/workspace-chrome/` `search`,
`settings`, `monitor`, `server`, `folder`, `git-branch`, `plus`; `mods/pane/close.svg`;
`mods/files/file.svg`; `mods/changes/changes.svg`.

**Programs run:** `hc read` (through `hc()`), and `herdr-app do layout.set` (through `exec`,
only when task-board is installed and not yet in the layout). No network.

**Art** (`mods/quantum/`):
- `nebula-deep.jpg`, 2560×1440, from `art/nebula.py` (seed 42;
  `python3 art/nebula.py > nebula.svg && rsvg-convert nebula.svg -o nebula.png && magick nebula.png -quality 90 mods/quantum/nebula-deep.jpg`):
  a `#070826` to `#04051a` to `#03041a` to `#080a2e` base; four fractal-noise nebula layers
  (violet `#7b3cff`, blue `#2f5bff`, magenta `#d23cff`, cyan `#2fd0ff`) masked to spots along
  the top, the sides and the lower corners; 1700 small stars and 30 cross-glint stars; a pink
  `#ff6cf0` starburst at (12%, 86%) and a blue `#6cc8ff` one at (96%, 80%); a ringed planet at
  (1768, 92), radius 58, rings tilted −22°; swirls near it and in the lower right; a giant
  planet (radius 1500) whose white `#eef4ff` horizon rises at 93.8% of the height behind the
  status bar, with a pink-white flare.
- `logo.svg` (three orbits stroked `#6ee7ff` to `#b07cff` round a white-to-violet core) and
  `orb.svg` (a white, `#9fc4ff`, `#7a4fe0`, `#22105e` planet with a `#e6d4ff` arc).
- 24px stroke icons in `currentColor`: activity, agents, bell, check, clock, cpu, grid, help,
  layers, list, ram, ring, terminal.
- `halo-cyan.png`, `halo-violet.png` (256×256 soft round lights) behind the logo, the orb, the
  card icons and the status bar dot.
- `art/demo-agent.sh [working|done]`: a fake Claude Code screen that reports its status by
  OSC 7501, for taking the preview.
- `extras/claude-statusline.sh`: the Claude Code status line the parser expects.

## Watch out

- **A layout that names a missing mod is refused whole.** So the shipped `side-tasks` block
  names this mod (role `tasks`, an empty stand-in) and is switched to task-board only once
  `mods/task-board/mod.json` exists. After the switch `layouts/quantum.json` names task-board:
  removing task-board later breaks the layout until the shipped file is put back.
- **A mod can't use another mod's code:** imports that resolve outside the mod's folder are
  refused, so the task board can't be embedded; the block has to point at it.
- **`run("layout.set", …)` from the mod didn't take; `exec("herdr-app", ["do", "layout.set", …])`
  did.** Call it from `cx.spawn` or a timer, never from `render`: Herdr ignores writes to `this`
  during render, so all state changes happen in timers, spawned tasks and click handlers,
  followed by `cx.notify()`.
- **Read only the visible screen.** `hc read <agent> --lines 120` took 1.3 to 2 s per call on
  long Claude sessions and stalled the core: every terminal lagged and lost its scroll
  position. Use `--lines 0`, never let reads overlap, and skip them while Tasks is shown. The
  session and status copies each read on their own timer (4 s, 5 s) with their own guard.
- **Inside a popup, `flex_1` children collapse to zero height.** The bell list gets an explicit
  height from `bellHeight` (40 header + 26 per section + 42 per row + 6, at most 470; 60 when
  empty; + 2 for the border), and the popup is opened at that height. It is measured when the
  bell is clicked; rows that arrive while it's open don't grow it.
- **Sub-agents started with `hc run --bg` are not in `agents()`**: take them from
  `terminals()` (`parent`, `state === "live"`), peek them with `terminal.peek`, and guard the
  nesting against loops.
- **Buttons in the `window_drag` blocks** (title bar, tab bar) stop the left mouse-down
  (`cx.stop_propagation()`), or pressing them drags the window.
- **Run details depend on the status line.** Without a status line in the format of
  `extras/claude-statusline.sh` (`%68` with the sign first, limits labelled `5s`/`7g`, shown as
  5h/7d), Mode, Model and Tokens show "—" and the context bar and the status bar's tokens are
  hidden. Only Claude Code's screen layout is parsed.
- **Working is amber in the marks** (sidebar, space rows, pane-header ring) but cyan in the
  group label, tab dots, the pill and the status bar: that is how this build draws it.
- **Dead code a fresh build doesn't need.** In `ui.js`: `frameSvg`, `TONES`, `framePic`,
  `ensurePic` (with its `fs` import and the `.glow/` folder, still in `.gitignore`), `cardSvg`,
  `barSvg`, `bar`, `SPIN`, the colours `glass`, `line`, `lineHi`, `pink`, most of `CARD` (only
  `band` and `rule` are used), and `neon`'s `radius`, `spread`, `strength`, `gloss`, `outer` and
  `inner` options (ignored). In `main.js`: the imports `SPIN`, `ensurePic`, `cardSvg`, `bar`,
  `shared`, `setShared`, the constant `TAB_ROW`, and `this.sizes` (never filled, so the context
  bar is always 246px); `barPic` ignores its fifth argument. `halo-amber.png` and
  `halo-green.png` are unused. No glow pictures are drawn any more.
- Limits: 6 commands, 7 output lines (60 grown), bell popup 470px tall, space name 150px, tab
  name 170px, pane name 260px. The orb, the logo and the Agents clock icon are decoration.

## Done when

- `herdr-app check ~/.config/herdr-app/mods/quantum` passes,
  `herdr-app do layout.switch '{"name":"quantum"}'` shows the nebula behind square panels, and
  `ctrl-shift-l` switches back.
- The search field is 640px wide and centred in the window; clicking it opens the palette; its
  chip shows the person's palette shortcut. Settings is only in the title bar.
- Split a tab: each pane is its own framed box 10px from the next, the focused one with a cyan
  border, each with the 38px header. A tab's single pane is framed too.
- Files in a pane header opens the side panel as a separate framed box 10px right of the panes;
  it resizes between 280 and 900px; clicking Files again hides it; Changes swaps its view.
- Run `art/demo-agent.sh working` in a tab and focus it: Session shows "Running", Model
  "Opus 5.5 (medium)", Mode "auto", Tokens "↑ 320k   ↓ 4k", "Doing… (medium effort)" over the
  bar with 68%, "320k of 1.0M · limit 5h 34% · 7d 31%", the four Bash commands newest first with
  `npx tsx …` highlighted, and the output lines; the status bar shows ↑ 320k ↓ 4k.
- Run `art/demo-agent.sh done` in a tab you aren't looking at: the bell gets a green dot and its
  popup lists the agent under "Finished". An agent waiting for permission turns the dot red and
  appears under "Needs you" in the popup and the sidebar; clicking a popup row closes the popup
  and focuses that pane. With no blocked or done agent the bell has no dot and the popup says
  "No notifications".
- Run Output's ⤢ fills the right column with up to 60 scrollable lines; ⤡ brings back the three
  cards.
- An agent that runs `hc run --bg … claude "…"` shows the sub-agent indented under it; clicking
  the row peeks it; folding hides it and shows "› 1".
- Without task-board only "Session" shows. Copy task-board into `mods/`: within 30 s "Tasks"
  appears, `layouts/quantum.json`'s `side-tasks` names `task-board`, and the board shows in its
  framed box.
- With a long Claude session open, terminals stay responsive and keep their scroll position.
- On Linux, CPU and RAM appear in the status bar within about 10 s.

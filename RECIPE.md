# Quantum

A deep-space layout for Herdr. The window sits on near-black deep navy, with nebula colour only
where the panels leave it showing: around a glassy ringed planet at the top, the window's edges
and lower corners, and the glowing rim of a giant planet behind the status bar. Every region is a dark glass
card whose edges catch the light: a thin rim that runs bright cyan from the top-left corner and
fades to violet along each edge, spilling a little light around its brightest parts. From top to
bottom: a title bar with a command search; then the workspaces and agents, the terminals and a
live Session panel side by side; then a status bar.

![Quantum](preview.png)

## What you see

- **Background:** `mods/quantum/nebula-deep.jpg` (2560×1440, `cover`), made by `art/nebula.py`.
  It has:
  - a base of `#03041a` to `#080a2e`;
  - nebulae from four fractal-noise layers in violet `#7b3cff`, blue `#2f5bff`, magenta
    `#d23cff` and cyan `#2fd0ff`, masked to the title band, the side edges and the lower corners;
  - about 1700 stars, 30 of them with four-point glints, and two starbursts (pink in the
    sidebar's lower corner, blue in the right column's);
  - a glassy ringed planet over the title bar: a bright rim, four rings tilted −22°;
  - a giant planet rising behind the status bar: white rim, blue bloom, pink flare, orbit lines;
  - neon swirls near the planet and in the lower right.
- **Neon frames:** the look shared by every card.
  - **Line:** each lit card has a crisp 1.2px line whose colour runs along the diagonal: cyan
    `#b8f6ff` at the top-left, `#8d96ff`, violet `#7a5cff`, pink-violet `#e08bff` at the
    bottom-right. A white highlight runs along the top edge.
  - **Brightness:** brightest along the top, dimmest halfway down the sides, brighter again
    at the bottom.
  - **Light:** a wide blurred copy in `#5a4cff` and a near one spill the light around the card.
  - **Glass:** panels are nearly opaque navy `#0d1338ea`; the session cards `#0c1232ee`.
  - **Selected items** (the active space, focused and working agents, the active tab, the
    Session switch): a blue frame (`#eef6ff` line, `#3f66ff` light) whose picture also paints
    the fill, navy `#18205e` with a blue inner glow brighter at the top and bottom, so the item
    looks lit and slightly raised. The picture sits behind the item's content.
  - **Terminal card:** the brightest frame. Its light is pink-violet `#e08bff` on the left,
    blue in the middle, cyan `#3fd8ff` on the right, with a bright pink `#f0a8ff` bloom along
    the bottom. Fill `#0a1030f2`, line `#e2d6ff`.
- **Title bar (56px, draggable):**
  - The atom logo (42px) over a violet halo, and "Herdr" at 25px bold.
  - A 38px pill search field with an edge light and the palette key on a keycap.
  - A bell (a pink dot; red when an agent needs you, and a click focuses it), help, settings
    and a planet orb on the right. Window buttons appear where the system draws
    none.
- **Workspaces and agents (276px):**
  - **Header:** "Workspaces" with a + button.
  - **Spaces:** grouped under "This computer" and each machine. The machine row has a green,
    amber or gray dot for its state and a + button.
  - **Space rows:** a colored letter tile (from the name), the name, the space's status, and its
    repo and branch in dim text. The active row is a violet glass pill with an edge light.
  - **Agents:** grouped as Pinned, Needs you (amber), Working (cyan), Done and Idle, each group
    with its count.
  - **Agent rows:** the program icon, space and tab, machine, time since the last change, and a
    status mark. The mark is an amber ring for working, an amber "!" for blocked, a green dot
    for done and a dim ring for idle. Nothing spins.
  - **Sub-agents:** nested under their parent with "└". Clicking the parent's icon folds them.
  - **Footer:** Settings and Add machine.
- **Work area:**
  - **Tab bar (40px):** a dark rounded strip (`#070a26d0`) holding a grid button (picker), the
    tabs as 32px pills, then +. The active tab is lit like a selected item.
  - **Panes:** cards with radius 12 and a `#8b6cff77` border; the focused pane's border is lilac
    `#c4b2ffee`.
  - **Pane header (36px, `role: "pane"`):** the program icon and name, the folder in dim text,
    the status, then `+` (split right), Files, Changes and `⋮` (the pane menu). Files and
    Changes appear only here.
  - **Terminals:** `terminal_opacity` 0, over the card's own fill.
- **Right column (330px):**
  - **Frame:** the `session-frame` column, `#080c28d8`, radius 18, a `#7c7ef0bb` line, 10px in
    from the column's edges.
  - **Header (`role: "sidetabs"`):** a segmented control, Session, Tasks and Files. It switches
    the `side-body` stack between this mod's session panel, Herdr's `task-board` and `files`.
  - **Cards:** Current Run, Recent Commands and Run Output (it fills the rest of the column),
    each an edge-lit card.
- **Status bar (44px):** machine, branch, agent count with a glowing dot, CPU, RAM, ↑↓ tokens,
  and "commands".
- **Theme:** `themes/quantum.json`: terminal `#0a0b26`, foreground `#dfe4ff`, cyan cursor and
  neon ANSI colors. The layout's `colors` make `canvas` transparent and the panels translucent.
- **Type:** Geist for the UI; JetBrains Mono for commands and output.

## How it behaves

- **The run it follows:** the focused agent. With none focused, the most recent agent of the
  shown tab, then of the shown space. With none at all, it says "Focus an agent's pane to see its
  run."
- **Current Run:**
  - A status pill with its own edge light: Running in cyan (breathing), Needs you in amber, Done
    in green, Idle in dim.
  - Rows for agent, project, workspace and machine, branch, mode (auto, accept edits, plan,
    bypass or default), model (effort), started, and tokens.
  - A 30-segment context bar shading from cyan to violet. It breathes while the agent works and
    shows the percent left and the 5-hour and 7-day limits.
- **Recent Commands:** the last six `● Bash(...)` calls, newest first. The newest has a cyan dot
  and a cyan frame while the agent works.
- **Run Output:** the last seven conversation lines above the agent's prompt box.
- **Clicks and keys:**
  - A space row selects the space; its + makes a new one on that machine.
  - An agent row focuses its pane.
  - A tab selects; double-click renames; right-click opens the tab menu.
  - Scrolling over the tab bar steps through the tabs.
  - Files and Changes in the pane header toggle the side panel; Session, Tasks and Files switch the
    right column.
  - Search and "commands" open the palette.
- **Refresh:** the session panel every 4s, the status bar every 5s, and the sidebar's
  "4m" labels every 30s. There are no animations (no `.frames`, `.loop` or `.spin`), so the
  window only redraws when something changes.

## Built from

- **Layout:** `layouts/quantum.json`.
  - Root `column`:
    - `top`: block, `quantum` with `role: "top"`.
    - `body`: row of `sidebar` (block, `role: "sidebar"`), `work` and `session` (a column of
      `side-tabs` and the `side-body` stack).
    - `status`: block, `role: "status"`.
  - `session` is padded 10px and holds `session-frame`, a column of `side-tabs` (56px) and the
    `side-body` stack (`side-session`, `side-tasks`, `side-files`).
  - `work` is a column of `tabs` (40px, `role: "tabs"`) and `card`.
    - `card` is a row of `edge-left` (12px), `work-body` and `edge-right` (12px), over
      `edge-bottom` (12px). The edges are `role: "edge"` blocks.
    - `work-body` contains the active tab, and the `panel` stack of `files` and `changes`.
  - Root settings: `titlebar: "none"`, `theme: "quantum"` plus `colors` overrides,
    `terminal_opacity: 0`, and the background image.
- **Mod:** `mods/quantum`.
  - `main.js` holds the seven roles: top, sidebar, tabs, pane, sidetabs, session, status. `ui.js` holds the palette, `neon` (a framed element), `panel`, `bar`, `halo`, letter tiles, status marks and `ago`.
- **Shipped mods used:** `files`, `changes`, `task-board`; `new-menu`, `menu`, `picker`
  and `machine-add` as overlays. Some icons come from `mods/workspace-chrome`, `mods/pane`,
  `mods/files` and `mods/changes`.
- **`herdr` API used:**
  - Data: `spaces()`, `agents()`, `terminals()` (for `parent`), `machines()`, `panes()`,
    `focused()`, `layout()`, `shared("workspace.panels")`, `keys()`, `window()`, `home()`.
  - Overlays: `openOverlay`.
  - Commands, through `run`: `space.select`, `space.new`, `pane.focus`, `tab.select`, `tab.close`,
    `tab.rename`, `tab.prev`, `tab.next`, `layout.select`, `layout.show`, `layout.hide`,
    `layout.toggle`, `app.palette`, `app.help`, `app.settings`, `mod.open`, and the
    `window.minimize`, `window.maximize` and `window.close` buttons.
- **Programs and files read:**
  - `hc read <agent> --lines 400` (session) or `--lines 0` (status), for the agent's screen.
  - `/proc/stat` and `/proc/meminfo`, read with `readTextFile`, for CPU and RAM.
- **What the screen is parsed for:**
  - The status line: `Model · effort | branch | ctx <bar> %NN used/size | ↑in ↓out | limit 5s A% · 7g B%`.
    `extras/claude-statusline.sh` prints it for Claude Code.
  - The progress line: `✻ Verb… (time · ↓ tokens · …)`.
- **Art:** `art/nebula.py` (SVG rasterized with `rsvg-convert`); `halo-*.png` (radial gradients);
  `logo.svg`, `orb.svg` and line icons.
- **Preview:** `art/demo-agent.sh` is a fake agent used to stage `preview.png`. It ran in a
  separate `HC_SESSION`, with made-up spaces.

## Watch out

- **Light without CSS:** elements take solid colors only (no gradients, blur or colored
  shadows), and `image()` never stretches. So the neon is a picture of exactly the element's
  size:
  - `on_size_change` measures each lit element;
  - `ui.js` writes an SVG of that size (a gradient stroke plus two `feGaussianBlur` copies) to
    `mods/quantum/.glow/`, named by tone, radius, spread and size;
  - the SVG is shown as an `absolute` image over the element (behind it for selected items,
    whose picture carries the fill).
  The folder is hidden, so writing to it doesn't reload the mod. Drawing the light from solid
  segments or stacked borders looked broken (gaps at corners, banding).
- **Images don't stretch:** `image()` keeps its aspect ratio, so glows from pictures only work
  for round spots (`halo`).
- **Padding:** it is a number or `[vertical, horizontal]`. Theme files take `#rrggbb` only;
  translucency goes in the layout's `colors` as `#rrggbbaa`.
- **Image cache:** the app caches images by path. Rename a picture (as `space.jpg` became
  `nebula-deep.jpg`) to see a new version at once.
- **The card's neon is drawn in pieces.** Only the root node draws a background picture,
  so a node's `background.image` can't carry the card's frame. So:
  - one SVG of the whole card is drawn piecewise;
  - the tab bar draws its top part (absolute, behind the tabs);
  - three 12px `edge` blocks (`role: "edge"`, `side: left | right | bottom`) draw their
    slices, offset by the card size;
  - the tab bar measures the width, the sidebar the body height, and both share them
    (`quantum.bodyH`, `quantum.card`).
- **Square corners:** a terminal paints its background over its whole pane, square, whatever
  the pane radius. So:
  - `terminal_opacity` is 0 and pane backgrounds are transparent;
  - the card's fill comes from the `work-body` node: `#0a1030f2`, radius 18, which layout
    nodes do round;
  - the crisp line is that node's own `border` (`#e2d6ff`), since it follows the rounded
    corners;
  - the edge strips add only the coloured light, cyan on the left to violet-pink on the
    right. They can't reach into the card's corners.
- **Meters:** CPU needs two samples (it appears on the second refresh). CPU and RAM are Linux
  only and measure the machine the window runs on.
- **Parsing:** it expects Claude Code's look (`●` tool calls, `─────` lines around the prompt).
  Other agents still get status, folder, branch and timing.

## Done when

- `herdr-app check mods/quantum` passes, and `layout.switch {"name":"quantum"}` shows the nebula
  and planets behind edge-lit glass cards, with no layout error.
- Focusing a Claude Code pane fills Current Run within 3s: model, effort, tokens, and the context
  bar with its percent.
- A working agent shows an amber ring and a lit row in the sidebar, a cyan dot in Recent
  Commands and the cyan Running pill.
- Clicking a space row switches spaces. The search field opens the palette. Files in a pane
  header opens the Files panel beside the panes, and a second click closes it. Tasks shows the
  task board in the right column.
- CPU and RAM appear in the status bar on Linux within 6s.

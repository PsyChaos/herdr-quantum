# Quantum

A deep-space layout for Herdr. The window sits on a violet and blue nebula, with a ringed planet
at the top and the glowing rim of a giant planet along the bottom. Every region is a dark glass
card whose edges catch the light: a thin rim that runs bright cyan from the top-left corner and
fades to violet along each edge, spilling a little light around its brightest parts. From top to
bottom: a title bar with a command search; then the workspaces and agents, the terminals and a
live Session panel side by side; then a status bar.

![Quantum](preview.png)

## What you see

- **Background:** `mods/quantum/space.jpg` (2560×1440, `cover`), made by `art/nebula.py`. It has:
  - nebulae from four fractal-noise layers in violet `#7b3cff`, blue `#2f6bff`, magenta
    `#d23cff` and cyan `#2fd0ff`;
  - about 1800 stars, 26 of them with four-point glints;
  - a ringed planet near the top right, its ring glowing and tilted −16°;
  - a horizon planet whose rim is a white line with a violet bloom and a lens flare at the top;
  - neon swirls in the lower corners.
- **Neon frames:** the look shared by every card.
  - **Line:** each lit card or item has a thin neon line. Its color and brightness travel along
    the edge: bright cyan `#7cf0ff` at the top-left, violet `#9b7bff` dimming to `#7a5cff` around
    the middle, and a pink-violet `#d47bff` glint at the bottom-right.
  - **Light:** two blurred copies of the line (wide and near) let the light spill softly
    outside the card and a little inside it.
  - **Glass:** cards are fill `#0c0f34c4`.
  - **Work area:** its border comes from the layout, so it is a `#b9a4ffb0` line with nine faint
    outer rings instead.
- **Title bar (56px, draggable):**
  - The atom logo over a violet halo, and "Herdr" at 23px bold.
  - A 38px pill search field with an edge light and the palette key on a keycap.
  - Help, settings and a planet orb on the right. Window buttons appear where the system draws
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
    status mark. The mark is a braille spinner for working, an amber "!" for blocked, a green dot
    for done and a ring for idle.
  - **Sub-agents:** nested under their parent with "└". Clicking the parent's icon folds them.
  - **Footer:** Settings and Add machine.
- **Work area:**
  - Glass `#0b0e30b0`, radius 16, a `#9b7bff66` border and three faint outer rings.
  - **Tab bar (44px):** a grid button (picker), the tabs as 32px pills, then +. The active tab
    is a violet glass pill in a neon frame. Files and Changes live only in the Session header.
  - **Panes:** cards with radius 12 and a `#8b6cff66` border; the focused pane's border is cyan.
    Each has Herdr's `pane` header.
  - **Terminals:** opacity 0.86 over `#090b26`.
- **Session panel (330px):**
  - **Header:** a segmented control (Session, Files, Changes).
  - **Cards:** Current Run, Recent Commands and Run Output, each an edge-lit card.
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
  - Rows for agent, project, workspace and machine, branch, model (effort), started, and tokens.
  - A 30-segment context bar shading from cyan to violet. It breathes while the agent works and
    shows the percent left and the 5-hour and 7-day limits.
- **Recent Commands:** the last six `● Bash(...)` calls, newest first. The newest has a spinner
  and a breathing cyan rim while the agent works.
- **Run Output:** the last seven conversation lines above the agent's prompt box.
- **Clicks and keys:**
  - A space row selects the space; its + makes a new one on that machine.
  - An agent row focuses its pane.
  - A tab selects; double-click renames; right-click opens the tab menu.
  - Scrolling over the tab bar steps through the tabs.
  - Files and Changes toggle the side panel.
  - Search and "commands" open the palette.
- **Refresh:** the session panel every 2.5s, the status bar every 3s, and the sidebar's
  "4m" labels every 30s. Spinners and breathing use native `.frames` and `.loop`, never a
  timer.

## Built from

- **Layout:** `layouts/quantum.json`.
  - Root `column`:
    - `top`: block, `quantum` with `role: "top"`.
    - `body`: row of `sidebar` (block, `role: "sidebar"`), `work-frame` and `session` (block,
      `role: "session"`).
    - `status`: block, `role: "status"`.
  - Inside `work-frame`, `work-glow3` → `work-glow1` (three ring columns) wrap `work`, which holds
    `tabs` (`role: "tabs"`) and `work-body`. `work-body` contains the active tab, and the `panel`
    stack of `files` and `changes`.
  - Root settings: `titlebar: "none"`, `theme: "quantum"` plus `colors` overrides,
    `terminal_opacity: 0.86`, and the background image.
- **Mod:** `mods/quantum`.
  - `main.js` holds the five roles. `ui.js` holds the palette, `neon` (a framed element), `panel`, `bar`, `halo`, letter tiles, status marks and `ago`.
- **Shipped mods used:** `pane` (pane headers), `files`, `changes`; `new-menu`, `menu`, `picker`
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
  - the SVG is shown as an `absolute` image over the element.
  The folder is hidden, so writing to it doesn't reload the mod. Drawing the light from solid
  segments or stacked borders looked broken (gaps at corners, banding).
- **Images don't stretch:** `image()` keeps its aspect ratio, so glows from pictures only work
  for round spots (`halo`).
- **Padding:** it is a number or `[vertical, horizontal]`. Theme files take `#rrggbb` only;
  translucency goes in the layout's `colors` as `#rrggbbaa`.
- **Image cache:** the app caches images by path. Rename a picture (as `nebula.jpg` became
  `space.jpg`) to see a new version at once.
- **Layout borders:** the work area's border comes from the layout, so it can't carry a neon
  picture. It gets a plain line and faint rings.
- **Meters:** CPU needs two samples (it appears on the second refresh). CPU and RAM are Linux
  only and measure the machine the window runs on.
- **Parsing:** it expects Claude Code's look (`●` tool calls, `─────` lines around the prompt).
  Other agents still get status, folder, branch and timing.

## Done when

- `herdr-app check mods/quantum` passes, and `layout.switch {"name":"quantum"}` shows the nebula
  and planets behind edge-lit glass cards, with no layout error.
- Focusing a Claude Code pane fills Current Run within 3s: model, effort, tokens, and the context
  bar with its percent.
- A working agent shows a cyan spinner and a breathing rim in the sidebar, in Recent Commands
  and on the Running pill.
- Clicking a space row switches spaces. The search field opens the palette. Files in the session
  header opens the Files panel beside the panes, and a second click closes it.
- CPU and RAM appear in the status bar on Linux within 6s.

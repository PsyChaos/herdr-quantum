# Quantum

A deep-space layout for Herdr: the whole window sits on a violet and cyan nebula with a ringed
planet and a glowing horizon, and every region floats over it as a rounded glass card. A title bar
with a command search runs across the top. The spaces and agents are on the left, the terminals
in the middle, a live "Session" panel on the right, and a status bar with the machine, branch,
agents, CPU, RAM and tokens along the bottom.

![Quantum](preview.png)

## What you see

- **Background:** `mods/quantum/nebula.jpg` (2560×1440, generated art), `cover`, behind everything.
  The root is a column with 8px vertical and 10px horizontal padding and an 8px gap.
- **Title bar (52px, draggable):**
  - The atom logo (`logo.svg`, 34px) and "Herdr" at 22px bold.
  - A pill search field, 38px high, at most 620px wide: `#0b0e33cc` fill and a `#8b6cffaa`
    border that turns cyan `#4fd8ff` on hover. It shows the palette key when one is bound.
  - Help and settings buttons and a planet orb (`orb.svg`) on the right.
- **Body:** a row with a 10px gap.
  - **Sidebar (268px):** Herdr's `spaces` and `agents`, then the `workspace-chrome` footer
    (Settings, Add machine). Glass `#0c0f34b8`, radius 16, a `#6f74f066` border and a large shadow.
  - **Work area:**
    - Glass `#0b0e30a6`, radius 16, a `#8b6cff88` border, 8px padding.
    - Herdr's `tabs` sit on top, then the active tab. Panes are cards with radius 12 and a
      `#6f74f066` border; the focused pane's border is cyan `#4fd8ff`. Each pane has Herdr's
      `pane` header (32px).
    - Terminals are drawn at 0.86 opacity over `#090b26`, so the nebula glows through faintly.
    - The Files/Changes panel (368px, hidden) sits beside the panes as in Herdr's main layout.
  - **Session panel (330px):** three cards with radius 14, fill `#121646d0` and border `#5d63d855`,
    under a segmented header (Session, Files, Changes).
- **Status bar (38px):** glass, radius 14. From the left: machine, branch, agent count. On the
  right: CPU, RAM (used/total/percent), the focused agent's ↑/↓ tokens, and "commands".
- **Theme:** `themes/quantum.json`, a navy `#0a0b26` terminal with cyan, violet and pink ANSI.
  The layout's `colors` make `canvas` transparent and `chrome`/`surface` translucent, so the
  shipped mods turn to glass too.
- **Type:** Geist for the UI; JetBrains Mono for terminals and the command and output lines.

## How it behaves

- **The run it follows:** the focused agent. With no agent focused it follows the most recent
  agent in the shown tab, then in the shown space. With none, it says "Focus an agent's pane to
  see its run."
- **Current Run:**
  - A status pill: Running in cyan for working, Needs you in amber for blocked, Done in green,
    Idle in dim.
  - Rows for the agent (with its program icon), project folder, workspace and machine, branch,
    model (effort), started, and tokens.
  - Started is the tab's `working_since`, or else its `changed_at`, written as "1m 17s ago".
  - A context bar: 28 segments shading from cyan to violet, the percent left, and
    "used of size · limit 5h x% · 7d y%".
- **Recent Commands:** the last six `● Bash(...)` calls on the agent's screen, newest first.
  - The newest shows a braille spinner (`.frames`) while the agent works; the others show a
    green check.
- **Run Output:** the last seven conversation lines above the agent's prompt box.
- **Session panel buttons:** Files and Changes select the matching child of `panel-body` and
  toggle `panel`.
- **Title bar:** the search field runs `app.palette`, help runs `app.help`, settings runs
  `app.settings`.
- **Status bar:** "commands" opens the palette. "N need you" appears in amber when agents are
  blocked.
- **Refresh:** the session panel refreshes every 2.5s and the status bar every 3s. Nothing
  animates on a timer.

## Built from

- **Layout:** `layouts/quantum.json`.
  - Root `column`: `top` (block), then `body` (row: `sidebar` column, `work` column, `session`
    block), then `status` (block).
  - Root settings: `titlebar: "none"`, `theme: "quantum"` plus `colors` overrides,
    `terminal_opacity: 0.86`, and a `background.image`.
- **Mod:** one mod, `mods/quantum`, with `props.role` set to `top`, `session` or `status`.
- **Shipped mods used:** `spaces`, `agents`, `workspace-chrome` (footer), `tabs`, `pane`, `files`,
  `changes`. Icons are borrowed from `mods/workspace-chrome/*.svg`.
- **`herdr` API used:**
  - Data: `agents()`, `spaces()`, `panes()`, `focused()`, `keys()`, `window()`, `home()`.
  - Commands, through `run`: `app.palette`, `app.help`, `app.settings`, `layout.select`,
    `layout.toggle`.
- **Programs and files read:**
  - `hc read <agent> --lines 400` (session) or `--lines 0` (status), for the agent's screen.
  - `readTextFile("/proc/stat")` and `readTextFile("/proc/meminfo")`, for CPU and RAM.
- **What the screen is parsed for:**
  - The model, effort, context, tokens and limits come from a status line of this shape:
    `Model · effort | branch | ctx <bar> %NN used/size | ↑in ↓out | limit 5s A% · 7g B%`.
    The companion Claude Code status line script, `extras/claude-statusline.sh`, prints it.
  - Without such a line, those rows show "—".
- **Art:** `nebula.jpg` was rasterized from an SVG: fractal-noise nebulae, radial glows, about
  900 stars, a ringed planet and a horizon arc.

## Watch out

- Elements take solid colors only (no gradients), so the context bar is built from 28 solid
  segments of fixed width.
- `padding` takes a number or `[vertical, horizontal]`; four values are not accepted.
- Theme files take `#rrggbb` only. Translucency belongs in the layout's `colors`, as `#rrggbbaa`.
- The CPU reading needs two samples, so it appears on the second refresh. CPU and RAM read
  `/proc`, so they are Linux only and hidden elsewhere.
- The meters measure the machine the window runs on, not the space's machine.
- The parsing expects Claude Code's look: `●` tool calls and `─────` lines around the prompt.
  Other agents still get the status, folder, branch and timing rows.

## Done when

- `herdr-app check mods/quantum` passes, and `layout.switch {"name":"quantum"}` shows the nebula
  behind glass sidebar, work and session cards, with no `layout.error`.
- Focusing a Claude Code pane shows its model, effort, tokens and context bar in Current Run
  within 3 seconds.
- The search field opens the command palette. Files in the session header opens the Files panel
  beside the panes, and a second click closes it.
- The status bar shows CPU and RAM on Linux within 6 seconds.

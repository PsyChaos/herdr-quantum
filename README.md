# Quantum: a space layout for Herdr

A deep-space layout for the [Herdr](https://herdr.dev) app: glass panels floating over a nebula, a
command search title bar, a live **Session** panel (current run, recent commands, run output),
and a status bar with CPU, RAM and tokens.

![Quantum](preview.png)

## Install

Ask your agent in Herdr to add it:

> add the layout github.com/PsyChaos/herdr-quantum

Or copy it by hand:

```sh
git clone https://github.com/PsyChaos/herdr-quantum
cp -r herdr-quantum/mods/quantum ~/.config/herdr-app/mods/
cp herdr-quantum/layouts/quantum.json ~/.config/herdr-app/layouts/
cp herdr-quantum/themes/quantum.json ~/.config/herdr-app/themes/
herdr-app do layout.switch '{"name":"quantum"}'
```

`ctrl-shift-l` switches back to your own layout.

## What it reads

- **Agent screens:** it runs `hc read` on the agent it shows, to find the model, effort, context
  and token counts in Claude Code's status line, plus its recent shell commands and output.
- **System files:** it reads `/proc/stat` and `/proc/meminfo` for the CPU and RAM meters.
- **Network:** it makes no network requests.

To get the model, context and token details, use a Claude Code status line like
the one in [`extras/claude-statusline.sh`](extras/claude-statusline.sh):

```sh
cp extras/claude-statusline.sh ~/.claude/statusline.sh
jq '.statusLine={"type":"command","command":"~/.claude/statusline.sh","padding":0}' ~/.claude/settings.json > /tmp/s && mv /tmp/s ~/.claude/settings.json
```

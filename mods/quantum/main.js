// Quantum: the space-themed chrome of the "quantum" layout.
// One mod, three roles chosen by props().role:
//   "top"     the title bar: logo, command search, help and settings
//   "session" the right panel: the focused agent's run, its recent commands and output
//   "status"  the bottom bar: machine, branch, agents, CPU, RAM, tokens, palette hint
// The run details (model, effort, context, tokens) are read from the agent's own
// screen (`hc read`): Claude Code's status line when it shows one.

import { View, div, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { agents, spaces, panes, focused, theme, run, props, hc, readTextFile, keys, window, home } from "herdr";

const A = "mods/quantum";
const C = {
  glass: "#0d1036c8",
  card: "#121646d0",
  line: "#5d63d855",
  lineHi: "#8b6cffaa",
  cyan: "#4fd8ff",
  violet: "#8b6cff",
  pink: "#d16bff",
  text: "#e6e9ff",
  muted: "#a3a9e0",
  dim: "#6d73b3",
};
const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// ---------- helpers ----------

function mix(a, b, f) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * f).toString(16).padStart(2, "0")).join("");
}

// A gradient bar from solid segments (elements take solid colors only).
function bar(pct, w, h = 8) {
  const n = 28, seg = w / n, filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * n);
  return h_flex().w(w).h(h).rounded(h / 2).overflow_hidden().bg("#ffffff14").children(
    Array.from({ length: filled }, (_, i) => div().h_full().w(seg).flex_none().bg(mix(C.cyan, C.violet, i / (n - 1)))));
}

function ago(ms) {
  if (!ms) return "—";
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s ago`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}h ${m % 60}m ago` : `${Math.floor(h / 24)}d ago`;
}

function short(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "~" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}

// Claude Code's status line (e.g. "Opus 5.5 · medium |  main | ctx ███ %88 121k/1.0M | ↑121k ↓2k | limit 5s 34% · 7g 31%")
// and its live progress line ("· Doing… (1m 17s · ↓ 4.3k tokens · thinking with medium effort)").
function parseScreen(text) {
  const lines = (text || "").split("\n");
  const info = { commands: [], output: [] };
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i];
    if (!info.model) {
      const m = l.match(/^\s*(\S[^|]*?)(?: · (low|medium|high|xhigh|max))? \|.*?ctx\s+\S*\s*%(\d+)\s+(\S+)\/(\S+)(?:.*?↑(\S+)\s+↓(\S+))?(?:.*?5s (\d+)%)?(?:.*?7g (\d+)%)?/);
      if (m) Object.assign(info, { model: m[1].trim(), effort: m[2], left: +m[3], used: m[4], size: m[5], up: m[6], down: m[7], l5: m[8], l7: m[9] });
    }
    if (!info.doing) {
      const d = l.match(/^\s*[✻✽✢·*✶✳]\s+(\S+…)\s+\(([^)]*)\)/);
      if (d) info.doing = { verb: d[1], detail: d[2] };
    }
  }
  for (const l of lines) {
    const b = l.match(/^\s*[●⏺]\s+Bash\((.*?)\)?\s*$/);
    if (b) info.commands.push(b[1]);
  }
  info.commands = info.commands.slice(-6).reverse();
  // Output: the last lines of the conversation, above the prompt box.
  const sep = lines.findLastIndex?.((l) => /^─{20,}/.test(l)) ?? -1;
  let end = sep;
  for (let i = sep - 1; i >= 0; i--) if (/^─{20,}/.test(lines[i])) { end = i; break; }
  const body = (end > 0 ? lines.slice(0, end) : lines).map((l) => l.replace(/\s+$/, "")).filter((l) => l.trim() && !/^[─━]{10,}/.test(l));
  info.output = body.slice(-7);
  return info;
}

function icon(name, size, color) { return svg(`${A}/${name}.svg`).size(size).flex_none().text_color(color); }

function programIcon(p, size) {
  if (!p?.icon) return null;
  return p.tint ? svg(p.icon).size(size).flex_none().text_color(p.color ?? C.text) : image(p.icon).w(size).h(size).flex_none();
}

function card(id, title, iconName, extra) {
  return v_flex().id(id).w_full().p(14).gap(10).rounded(14).bg(C.card).border(1).border_color(C.line)
    .child(h_flex().gap(9).items_center()
      .child(icon(iconName, 16, C.cyan))
      .child(div().flex_1().text_size(14).font_semibold().text_color(C.text).child(title))
      .when(Boolean(extra), (el) => el.child(extra)));
}

// ---------- the mod ----------

export default class Quantum extends View {
  init(_props, cx) {
    this.role = props()?.role ?? "session";
    this.screen = {};
    this.cpu = null; this.ram = null; this.prevCpu = null;
    if (this.role === "session" || this.role === "status") {
      this.refresh(cx);
      cx.timer.every(this.role === "session" ? 2500 : 3000, (cx) => this.refresh(cx));
    }
  }

  target() {
    const f = focused();
    const list = agents();
    const latest = (xs) => xs.reduce((b, a) => (!b || a.seq > b.seq ? a : b), null);
    // The focused agent; else one in this tab; else this space's most recent one.
    return list.find((a) => a.focused)
      ?? latest(list.filter((a) => f && a.tab === f.tab))
      ?? latest(list.filter((a) => f && a.space === f.space))
      ?? null;
  }

  refresh(cx) {
    cx.spawn(async (cx) => {
      const a = this.target();
      if (a) {
        try {
          const r = await hc(["read", a.address, "--lines", this.role === "session" ? "400" : "0"]);
          if (r.code === 0) this.screen = { address: a.address, ...parseScreen(r.stdout) };
        } catch (_) { /* machine unreachable: keep the last screen */ }
      } else this.screen = {};
      if (this.role === "status") await this.readSystem();
      cx.notify();
    });
  }

  async readSystem() {
    try {
      const stat = await readTextFile("/proc/stat");
      const n = stat.split("\n")[0].trim().split(/\s+/).slice(1).map(Number);
      const idle = n[3] + (n[4] || 0), total = n.reduce((s, v) => s + v, 0);
      if (this.prevCpu) {
        const dt = total - this.prevCpu.total, di = idle - this.prevCpu.idle;
        if (dt > 0) this.cpu = Math.round(100 * (1 - di / dt));
      }
      this.prevCpu = { idle, total };
      const mem = await readTextFile("/proc/meminfo");
      const kb = (k) => +(mem.match(new RegExp(`^${k}:\\s+(\\d+)`, "m"))?.[1] ?? 0);
      const tot = kb("MemTotal"), av = kb("MemAvailable");
      if (tot) this.ram = { used: (tot - av) / 1048576, total: tot / 1048576 };
    } catch (_) { /* not Linux: hide the meters */ }
  }

  render(cx) {
    if (this.role === "top") return this.top();
    if (this.role === "status") return this.status();
    return this.session();
  }

  // ---------- top bar ----------
  top() {
    const btn = (id, name, action) => div().id(id).size(34).flex_none().flex().items_center().justify_center().rounded(17)
      .text_color(C.muted).hover((s) => s.bg("#ffffff14").text_color(C.text))
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation()).on_click(action).child(name);
    const hint = this.paletteKey();
    return h_flex().size_full().px(16).gap(16).items_center()
      .child(h_flex().w(240).flex_none().gap(10).items_center()
        .child(image(`${A}/logo.svg`).size(34))
        .child(div().text_size(22).font_bold().text_color(C.text).child("Herdr")))
      .child(h_flex().id("q-search").flex_1().max_w(620).h(38).px(14).gap(10).items_center().rounded(19)
        .bg("#0b0e33cc").border(1).border_color(C.lineHi).cursor_pointer()
        .hover((s) => s.border_color(C.cyan))
        .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
        .on_click(() => run("app.palette"))
        .child(svg("mods/workspace-chrome/search.svg").size(16).text_color(C.muted))
        .child(div().flex_1().truncate().text_size(13.5).text_color(C.muted).child("Search workspaces, projects, agents, files, or run a command…"))
        .when(Boolean(hint), (el) => el.child(div().px(7).py(2).rounded(6).bg("#ffffff12").text_size(11.5).text_color(C.muted).child(hint))))
      .child(div().flex_1())
      .child(btn("q-help", icon("help", 18, C.muted), () => run("app.help")))
      .child(btn("q-settings", svg("mods/workspace-chrome/settings.svg").size(18), () => run("app.settings")))
      .child(image(`${A}/orb.svg`).size(34).flex_none());
  }

  paletteKey() {
    const mac = window()?.platform === "macos";
    const b = keys().find((k) => k.section === "global" && k.action === "app.palette");
    if (!b) return null;
    const m = { cmd: "⌘", ctrl: mac ? "⌃" : "Ctrl", shift: mac ? "⇧" : "Shift", alt: mac ? "⌥" : "Alt" };
    return b.keys.split("-").map((p) => m[p.toLowerCase()] ?? p.toUpperCase()).join(mac ? "" : "+");
  }

  // ---------- right panel ----------
  session() {
    const a = this.target();
    const s = a && this.screen.address === a.address ? this.screen : {};
    const space = a ? spaces().find((x) => x.id === a.space) : spaces().find((x) => x.active);
    const tab = space?.tabs.find((t) => t.id === a?.tab);
    const pane = a ? panes().find((p) => p.pane === a.pane) : null;
    const statusColor = { working: C.cyan, blocked: "#ffb547", done: "#4ef0a6", idle: C.dim }[a?.status] ?? C.dim;
    const statusText = { working: "Running", blocked: "Needs you", done: "Done", idle: "Idle" }[a?.status] ?? "No agent";

    const row = (ic, label, value, valueIcon) => h_flex().gap(10).items_center().text_size(12.5)
      .child(icon(ic, 13, C.dim))
      .child(div().w(84).flex_none().text_color(C.muted).child(label))
      .when(Boolean(valueIcon), (el) => el.child(valueIcon))
      .child(div().flex_1().truncate().text_color(C.text).child(value ?? "—"));

    const run_ = card("q-run", "Current Run", "activity",
      div().px(10).py(3).rounded(11).border(1).border_color(statusColor).text_size(11.5).text_color(statusColor).child(statusText))
      .when(!a, (el) => el.child(div().text_size(12.5).text_color(C.muted).child("Focus an agent's pane to see its run.")))
      .when(Boolean(a), (el) => el
        .child(row("terminal", "Agent", a.program?.name ?? a.app ?? "agent", programIcon(a.program, 14)))
        .child(row("list", "Project", short(pane?.cwd) || space?.name))
        .child(row("list", "Workspace", `${space?.name ?? ""}${space?.machine ? " · " + space.machine : " · This computer"}`))
        .when(Boolean(pane?.branch), (el) => el.child(row("activity", "Branch", pane.branch)))
        .child(row("cpu", "Model", s.model ? `${s.model}${s.effort ? ` (${s.effort})` : ""}` : "—"))
        .child(row("activity", "Started", ago(tab?.working_since ?? tab?.changed_at)))
        .child(row("ram", "Tokens", s.up ? `↑ ${s.up}  ↓ ${s.down}` : "—"))
        .when(s.left != null, (el) => el.child(v_flex().gap(6).pt(4)
          .child(h_flex().text_size(12).text_color(C.muted)
            .child(div().flex_1().child(s.doing ? `${s.doing.verb} ${s.effort ? `(${s.effort} effort)` : ""}` : "Context left"))
            .child(div().text_color(C.text).font_semibold().child(`${s.left}%`)))
          .child(bar(s.left, 268))
          .child(div().text_size(11).text_color(C.dim).child(`${s.used} of ${s.size}${s.l5 ? `  ·  limit 5h ${s.l5}% · 7d ${s.l7}%` : ""}`)))));

    const cmds = card("q-cmds", "Recent Commands", "terminal")
      .when(!(s.commands?.length), (el) => el.child(div().text_size(12).text_color(C.dim).child("No shell commands on screen yet.")))
      .children((s.commands ?? []).map((c, i) => h_flex().id(`q-cmd-${i}`).gap(9).items_center().text_size(12.5)
        .child(i === 0 && a?.status === "working"
          ? div().w(13).flex_none().text_color(C.cyan).frames(SPIN, 90).child("⠋")
          : icon("check", 13, "#4ef0a6"))
        .child(div().flex_1().truncate().font_family("JetBrains Mono").text_color(i === 0 ? C.text : C.muted).child(c))));

    const out = card("q-out", "Run Output", "list")
      .child(v_flex().gap(3).font_family("JetBrains Mono").text_size(11.5)
        .when(!(s.output?.length), (el) => el.child(div().text_color(C.dim).child("›  waiting for output…")))
        .children((s.output ?? []).map((l, i) => div().truncate().text_color(i === s.output.length - 1 ? C.text : C.muted).child(l.trim()))));

    return v_flex().size_full().gap(10).overflow_y_scrollbar()
      .child(h_flex().p(4).gap(4).rounded(14).bg(C.glass).border(1).border_color(C.line)
        .child(h_flex().flex_1().h(34).gap(8).justify_center().items_center().rounded(10).bg("#2a2f8acc").border(1).border_color(C.lineHi)
          .text_size(13).font_semibold().text_color(C.text).child(icon("activity", 15, C.cyan)).child("Session"))
        .child(h_flex().id("q-files").flex_1().h(34).gap(8).justify_center().items_center().rounded(10).text_size(13).text_color(C.muted)
          .hover((st) => st.bg("#ffffff10").text_color(C.text)).cursor_pointer()
          .on_click(() => { run("layout.select", { stack: "panel-body", child: "files" }); run("layout.toggle", { id: "panel" }); })
          .child(svg("mods/workspace-chrome/files.svg").size(15)).child("Files"))
        .child(h_flex().id("q-changes").flex_1().h(34).gap(8).justify_center().items_center().rounded(10).text_size(13).text_color(C.muted)
          .hover((st) => st.bg("#ffffff10").text_color(C.text)).cursor_pointer()
          .on_click(() => { run("layout.select", { stack: "panel-body", child: "changes" }); run("layout.toggle", { id: "panel" }); })
          .child(svg("mods/workspace-chrome/git-compare.svg").size(15)).child("Changes")))
      .child(run_).child(cmds).child(out);
  }

  // ---------- bottom bar ----------
  status() {
    const space = spaces().find((x) => x.active);
    const list = agents();
    const working = list.filter((a) => a.status === "working").length;
    const needs = list.filter((a) => a.status === "blocked").length;
    const s = this.screen;
    const item = (ic, text, color) => h_flex().gap(7).items_center().child(ic).child(div().text_color(color ?? C.muted).child(text));
    return h_flex().size_full().px(18).gap(22).items_center().text_size(12.5)
      .child(item(svg(`mods/workspace-chrome/${space?.machine ? "server" : "monitor"}.svg`).size(14).text_color(C.cyan), space?.machine ?? "This computer", C.text))
      .when(Boolean(space?.branch), (el) => el.child(item(svg("mods/workspace-chrome/git-branch.svg").size(14).text_color(C.violet), space.branch)))
      .child(item(div().size(7).rounded_full().bg(working ? C.cyan : C.dim), `${list.length} agents${working ? ` · ${working} working` : ""}`))
      .when(needs > 0, (el) => el.child(div().text_color("#ffb547").child(`${needs} need${needs > 1 ? "" : "s"} you`)))
      .child(div().flex_1())
      .when(this.cpu != null, (el) => el.child(item(icon("cpu", 14, C.muted), `CPU ${this.cpu}%`)))
      .when(Boolean(this.ram), (el) => el.child(item(icon("ram", 14, C.muted),
        `RAM ${this.ram.used.toFixed(1)}G / ${this.ram.total.toFixed(1)}G (${Math.round((100 * this.ram.used) / this.ram.total)}%)`)))
      .when(Boolean(s.up), (el) => el.child(item(div().text_color(C.cyan).child("↑"), `${s.up}  ↓ ${s.down}`)))
      .child(h_flex().id("q-palette").gap(7).items_center().cursor_pointer().text_color(C.muted)
        .hover((st) => st.text_color(C.text)).on_click(() => run("app.palette"))
        .child(icon("terminal", 14, C.muted)).child("commands"));
  }
}

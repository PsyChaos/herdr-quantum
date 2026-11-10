// Quantum: the space-themed chrome of the "quantum" layout.
// One mod, five roles chosen by props().role:
//   "top"      title bar: logo, command search, help, settings, window buttons
//   "sidebar"  workspaces (spaces by machine) and agents (pinned, needs you, working, idle)
//   "tabs"     the shown space's tabs as glowing pills, + Files / Changes
//   "session"  the focused agent's run, its recent commands and output
//   "status"   machine, branch, agents, CPU, RAM, tokens, palette
// Run details (model, effort, context, tokens) come from the agent's own screen
// (`hc read`): a Claude Code status line like extras/claude-statusline.sh prints.

import { View, div, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import {
  agents, spaces, panes, focused, terminals, machines, layout, shared,
  run, props, hc, readTextFile, keys, window, home, openOverlay,
} from "herdr";
import { A, C, SPIN, neon, panel, halo, icon, programIcon, bar, letterTile, statusMark, ago } from "./ui.js";

const stop = (_e, cx) => cx.stop_propagation();

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const f = find(child, id);
    if (f) return f;
  }
  return null;
}

function short(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "~" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}
const base = (p) => (p || "").replace(/\/+$/, "").split("/").pop();

// Claude Code's status line and live progress line, the last tool calls and output lines.
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
  let sep = -1;
  for (let i = lines.length - 1; i >= 0; i--) if (/^─{20,}/.test(lines[i])) { sep = i; break; }
  let end = sep;
  for (let i = sep - 1; i >= 0; i--) if (/^─{20,}/.test(lines[i])) { end = i; break; }
  const body = (end > 0 ? lines.slice(0, end) : lines).map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim() && !/^[─━]{10,}/.test(l) && !/Update available!/.test(l));
  info.output = body.slice(-7);
  return info;
}

export default class Quantum extends View {
  init(_props, cx) {
    this.role = props()?.role ?? "session";
    this.screen = {};
    this.cpu = null; this.ram = null; this.prevCpu = null;
    this.folded = new Set();
    this.sizes = {};
    if (this.role === "session" || this.role === "status") {
      this.refresh(cx);
      cx.timer.every(this.role === "session" ? 2500 : 3000, (cx) => this.refresh(cx));
    }
    if (this.role === "sidebar") cx.timer.every(30000, (cx) => cx.notify()); // "4m ago" labels
  }

  target() {
    const f = focused();
    const list = agents();
    const latest = (xs) => xs.reduce((b, a) => (!b || a.seq > b.seq ? a : b), null);
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
        } catch (_) { /* unreachable machine: keep the last screen */ }
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
    } catch (_) { /* not Linux: the meters stay hidden */ }
  }

  render(cx) {
    switch (this.role) {
      case "top": return this.top(cx);
      case "sidebar": return this.sidebar(cx);
      case "tabs": return this.tabs(cx);
      case "status": return this.status(cx);
      default: return this.session(cx);
    }
  }

  // ------------------------------------------------------------ top bar
  top(cx) {
    const w = window();
    const btn = (id, child, action) => div().id(id).size(34).flex_none().flex().items_center().justify_center().rounded(17)
      .text_color(C.muted).hover((s) => s.bg("#ffffff16").text_color(C.text))
      .on_mouse_down("left", stop).on_click(action).child(child);
    const hint = this.paletteKey();
    const search = h_flex().id("q-search").w_full().h(38).px(14).gap(10).items_center().rounded(19)
      .bg("#0a0d33e0").border(1).border_color("#9d86ffcc").cursor_pointer()
      .hover((s) => s.border_color(C.cyan))
      .on_mouse_down("left", stop).on_click(() => run("app.palette"))
      .child(svg("mods/workspace-chrome/search.svg").size(16).text_color(C.lilac))
      .child(div().flex_1().truncate().text_size(13.5).text_color(C.muted).child("Search workspaces, projects, agents, files, or run a command…"))
      .when(Boolean(hint), (el) => el.child(div().px(8).py(2).rounded(6).bg("#ffffff14").border(1).border_color("#ffffff22").text_size(11.5).text_color(C.text).child(hint)));
    return h_flex().size_full().px(14).gap(16).items_center()
      .when(w?.platform === "macos" && !w?.fullscreen, (el) => el.pl(84))
      .child(h_flex().w(250).flex_none().gap(12).items_center()
        .child(div().relative().size(38).flex_none()
          .child(halo("violet", 70, 19, 19, 0.6))
          .child(image(`${A}/logo.svg`).size(38)))
        .child(div().text_size(23).font_bold().text_color("#ffffff").child("Herdr")))
      .child(div().flex_1().max_w(640).child(neon(this, cx, "search", search, { radius: 19, spread: 12 })))
      .child(div().flex_1())
      .child(btn("q-help", icon("help", 19, C.muted), () => run("app.help")))
      .child(btn("q-settings", svg("mods/workspace-chrome/settings.svg").size(19), () => run("app.settings")))
      .child(div().relative().size(36).flex_none()
        .child(halo("violet", 72, 18, 18, 0.9))
        .child(image(`${A}/orb.svg`).size(36)))
      .when(Boolean(w?.buttons), (el) => el
        .child(div().w(6))
        .child(btn("q-min", div().text_size(16).child("−"), () => run("window.minimize")))
        .child(btn("q-max", div().text_size(13).child(w.maximized ? "❐" : "□"), () => run("window.maximize")))
        .child(btn("q-close", svg("mods/pane/close.svg").size(14), () => run("window.close"))));
  }

  paletteKey() {
    const mac = window()?.platform === "macos";
    const b = keys().find((k) => k.section === "global" && k.action === "app.palette");
    if (!b) return null;
    const m = { cmd: "⌘", ctrl: mac ? "⌃" : "Ctrl", shift: mac ? "⇧" : "Shift", alt: mac ? "⌥" : "Alt" };
    return b.keys.split("-").map((p) => m[p.toLowerCase()] ?? p.toUpperCase()).join(mac ? "" : "+");
  }

  // ------------------------------------------------------------ sidebar
  sidebar(cx) {
    const all = spaces();
    const ms = [null, ...machines().map((m) => m.name).filter((n) => n !== null)];
    const head = (ic, title, right) => h_flex().h(30).px(14).gap(10).items_center()
      .child(icon(ic, 17, C.lilac)).child(div().flex_1().text_size(15).font_semibold().text_color(C.text).child(title)).child(right);
    const sub = (text) => div().px(14).pt(8).pb(2).text_size(12).text_color(C.dim).child(text);

    const spaceRow = (s) => {
      const norm = (x) => (x || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const repo = s.folder && s.folder !== home() ? base(s.folder) : "";
      const right = [repo && norm(repo) !== norm(s.name) ? repo : null, s.branch].filter(Boolean).join(" · ");
      const row = h_flex().id(`q-sp-${s.id}`).h(30).px(8).gap(10).items_center().rounded(9).cursor_pointer()
        .when(s.active, (el) => el.bg("#3b2fa0aa").border(1).border_color("#b9a4ffdd"))
        .when(!s.active, (el) => el.border(1).border_color("#00000000").hover((st) => st.bg("#ffffff10")))
        .on_click(() => run("space.select", { id: s.id }))
        .child(letterTile(s.name, 20))
        .child(div().flex_none().max_w(150).truncate().text_size(13.5).text_color(s.active ? "#ffffff" : C.text).font_medium().child(s.name))
        .when(s.status && s.status !== "idle", (el) => el.child(statusMark(s.status, 12)))
        .child(div().flex_1().min_w(0).text_right().truncate().text_size(11.5).text_color(s.active ? C.lilac : C.dim).child(right));
      return div().px(10).py(2).child(neon(this, cx, `sp-${s.id}`, row, { on: s.active, radius: 9, spread: 8 }));
    };

    const machineRow = (m) => {
      const state = m === null ? "ready" : machines().find((x) => x.name === m)?.layout;
      return h_flex().id(`q-m-${m ?? "local"}`).h(26).px(14).gap(9).items_center().text_size(12.5).text_color(C.muted)
        .child(svg(`mods/workspace-chrome/${m ? "server" : "monitor"}.svg`).size(14))
        .child(div().flex_1().truncate().child(m ?? "This computer"))
        .child(div().size(7).rounded_full().bg(state === "ready" ? C.green : state === "loading" ? C.amber : C.dim))
        .child(div().id(`q-m-new-${m ?? "local"}`).px(4).rounded(5).text_color(C.dim).hover((st) => st.text_color(C.text).bg("#ffffff12"))
          .on_click((_e, cx) => { cx.stop_propagation(); run("space.new", { machine: m ?? "" }); }).child("+"));
    };

    // Agents, with sub-agents (started by another agent with `hc run`) under their parent.
    const list = agents();
    const parent = new Map(terminals().filter((t) => t.parent).map((t) => [t.address, t.parent]));
    const qualify = (a, p) => (a.includes("/") && !p.includes("/") ? a.split("/")[0] + "/" + p : p);
    const byAddr = new Map(list.map((a) => [a.address, a]));
    const kids = new Map();
    const tops = [];
    for (const a of list) {
      const p = parent.get(a.address) ?? parent.get(a.address.split("/").pop());
      const pa = p ? byAddr.get(qualify(a.address, p)) : null;
      if (pa) { if (!kids.has(pa.address)) kids.set(pa.address, []); kids.get(pa.address).push(a); }
      else tops.push(a);
    }
    const tabOf = (a) => all.find((s) => s.id === a.space)?.tabs.find((t) => t.id === a.tab);
    const groups = [
      ["Pinned", tops.filter((a) => a.pinned)],
      ["Needs you", tops.filter((a) => !a.pinned && a.status === "blocked")],
      ["Working", tops.filter((a) => !a.pinned && a.status === "working")],
      ["Done", tops.filter((a) => !a.pinned && a.status === "done")],
      ["Idle", tops.filter((a) => !a.pinned && a.status === "idle")],
    ].filter(([, xs]) => xs.length);

    const agentRow = (a, depth = 0) => {
      const subs = kids.get(a.address) ?? [];
      const folded = this.folded.has(a.address);
      const machine = a.address.includes("/") ? a.address.split("/")[0] : "";
      const detail = depth ? (a.program?.name ?? a.title) : `${a.space_name}${a.tab_name && !/^\d+$/.test(a.tab_name) ? " · " + a.tab_name : ""}`;
      const hot = a.focused || a.status === "working";
      const row = h_flex().id(`q-ag-${a.address}`).h(28).px(8).gap(8).items_center().rounded(9).cursor_pointer()
        .when(hot, (el) => el.bg(a.focused ? "#3b2fa0aa" : "#1b2a7a88").border(1).border_color(a.status === "working" ? "#4fd8ffbb" : "#b9a4ffdd"))
        .when(!hot, (el) => el.border(1).border_color("#00000000").hover((st) => st.bg("#ffffff10")))
        .on_click(() => run("pane.focus", { pane: a.pane }))
        .when(depth > 0, (el) => el.child(div().w(14 * depth).flex_none().text_color(C.dim).text_size(12).child("└")))
        .child(div().id(`q-fold-${a.address}`).when(subs.length > 0, (el) => el.on_click((_e, cx) => {
          cx.stop_propagation(); folded ? this.folded.delete(a.address) : this.folded.add(a.address); cx.notify();
        })).child(programIcon(a.program, 15) ?? icon("terminal", 15, C.muted)))
        .child(div().flex_1().min_w(0).truncate().text_size(12.8).text_color(a.status === "idle" && !a.focused ? C.muted : C.text).child(detail))
        .when(Boolean(machine) && depth === 0, (el) => el.child(div().max_w(92).truncate().text_size(11).text_color(C.dim).child(machine)))
        .when(subs.length > 0, (el) => el.child(div().text_size(10).text_color(C.dim).child(folded ? "›" : "⌄")))
        .child(div().w(24).flex_none().text_right().text_size(11).text_color(C.dim).child(ago(tabOf(a)?.changed_at)))
        .child(statusMark(a.status, 13));
      const wrapped = div().px(10).py(1).child(neon(this, cx, `ag-${a.address}`, row, { on: hot, radius: 9, spread: 8, tone: a.status === "working" ? "cyan" : "violet", pulse: a.status === "working" }));
      return [wrapped, ...(folded ? [] : subs.flatMap((s) => agentRow(s, depth + 1)))];
    };

    const foot = (id, ic, label, action) => h_flex().id(id).h(28).px(14).gap(10).items_center().rounded(8).text_size(13)
      .text_color(C.muted).cursor_pointer().hover((st) => st.text_color(C.text).bg("#ffffff10")).on_click(action)
      .child(svg(`mods/workspace-chrome/${ic}.svg`).size(15)).child(label);

    const content = v_flex().size_full().py(10)
      .child(head("layers", "Workspaces", div().id("q-new-space").size(24).flex().items_center().justify_center().rounded(6)
        .text_size(18).text_color(C.muted).hover((st) => st.bg("#ffffff14").text_color(C.text))
        .on_click(() => run("space.new")).child("+")))
      .child(v_flex().id("q-spaces").flex_1().min_h(0).overflow_y_scrollbar().pb(6)
        .child(sub("Spaces"))
        .children(ms.flatMap((m) => {
          const xs = all.filter((s) => (s.machine ?? null) === m);
          return m !== null && !xs.length ? [] : [machineRow(m), ...xs.map(spaceRow)];
        })))
      .child(div().mx(14).my(6).h(1).bg("#8b6cff44"))
      .child(head("agents", "Agents", icon("clock", 15, C.dim)))
      .child(v_flex().id("q-agents").flex_1().min_h(0).overflow_y_scrollbar()
        .when(!groups.length, (el) => el.child(sub("No agents running")))
        .children(groups.flatMap(([name, xs]) => [
          h_flex().px(14).pt(8).pb(2).gap(6).text_size(12).text_color(name === "Needs you" ? C.amber : name === "Working" ? C.cyan : C.dim)
            .child(name).child(div().text_color(C.dim).child(String(xs.length))),
          ...xs.flatMap((a) => agentRow(a)),
        ])))
      .child(div().mx(14).my(6).h(1).bg("#8b6cff33"))
      .child(foot("q-settings2", "settings", "Settings", () => run("app.settings")))
      .child(foot("q-add-machine", "plus", "Add machine", () => run("mod.open", { name: "machine-add" })));
    return panel(this, cx, "sidebar", content, { id: "q-sidebar" });
  }

  // ------------------------------------------------------------ tabs
  tabs(cx) {
    const space = spaces().find((p) => p.active);
    const shown = space?.tabs ?? [];
    const all = panes();
    const pill = (c) => {
      const program = all.find((p) => p.tab === c.id && p.program?.agent)?.program ?? all.find((p) => p.tab === c.id)?.program;
      const auto = /^\d+$/.test(c.name) || /^tb\d+$/.test(c.name);
      const name = auto && program?.agent ? program.name : c.name;
      const pic = program?.agent ? programIcon(program, 15) : icon("terminal", 15, c.active ? C.text : C.muted);
      const el = h_flex().id(`q-tab-${c.id}`).h(32).px(12).gap(8).items_center().rounded(10).flex_none().text_size(13)
        .bg(c.active ? "#2a2384dd" : "#ffffff08").border(1).border_color(c.active ? "#b9a4ffee" : "#ffffff14")
        .text_color(c.active ? "#ffffff" : C.muted).cursor_pointer()
        .hover((s) => s.bg(c.active ? "#2a2384dd" : "#ffffff14").text_color(C.text))
        .on_mouse_down("left", (e, cx) => { cx.stop_propagation(); if (e.click_count === 2) run("tab.rename", { id: c.id }); })
        .on_click(() => run("tab.select", { id: c.id }))
        .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openOverlay({ mod: "menu", kind: "popup", width: 200, props: { tab: "tab", target: { id: c.id, space: space.id } } }); })
        .child(pic)
        .child(div().max_w(170).truncate().font_medium().child(c.zoomed ? `${name} ⤢` : name))
        .when(c.status && c.status !== "idle", (el) => el.child(statusMark(c.status, 12)))
        .when(c.active, (el) => el.child(div().id(`q-tabx-${c.id}`).text_color(C.muted).hover((s) => s.text_color("#ffffff"))
          .on_mouse_down("left", stop).on_click((_e, cx) => { cx.stop_propagation(); run("tab.close", { id: c.id }); })
          .child(svg("mods/pane/close.svg").size(12))));
      return div().flex_none().mx(2).child(neon(this, cx, `tab-${c.id}`, el, { on: c.active, radius: 10, spread: 8, full: false }));
    };
    return h_flex().relative().size_full().min_w(0).px(10).gap(4).items_center()
      .on_scroll_wheel((e) => { if (Math.abs(e.delta.y) >= 1) run(e.delta.y > 0 ? "tab.prev" : "tab.next"); })
      .child(div().id("q-grid").size(32).flex_none().flex().items_center().justify_center().rounded(9).border(1).border_color("#ffffff14")
        .text_color(C.muted).hover((s) => s.bg("#ffffff12").text_color(C.text)).on_mouse_down("left", stop)
        .on_click(() => run("mod.open", { name: "picker" })).child(icon("grid", 15, C.muted)))
      .child(h_flex().id("q-tab-scroll").flex_1().min_w(0).h_full().items_center().gap(2).overflow_x_scrollbar().children(shown.map(pill)))
      .child(div().id("q-tab-new").size(30).flex_none().flex().items_center().justify_center().rounded(9).text_size(17).text_color(C.muted)
        .hover((s) => s.bg("#ffffff12").text_color(C.text)).on_mouse_down("left", stop)
        .on_click(() => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 })).child("+"))
;
  }

  // ------------------------------------------------------------ session
  session(cx) {
    const a = this.target();
    const s = a && this.screen.address === a.address ? this.screen : {};
    const space = a ? spaces().find((x) => x.id === a.space) : spaces().find((x) => x.active);
    const tab = space?.tabs.find((t) => t.id === a?.tab);
    const pane = a ? panes().find((p) => p.pane === a.pane) : null;
    const working = a?.status === "working";
    const sc = { working: C.cyan, blocked: C.amber, done: C.green, idle: C.dim }[a?.status] ?? C.dim;
    const st = { working: "Running", blocked: "Needs you", done: "Done", idle: "Idle" }[a?.status] ?? "No agent";

    const card = (id, title, ic, extra, bright = false) => v_flex().id(id).w_full().p(14).gap(10).rounded(14).bg(C.card)
      .border(1).border_color(bright ? "#9d86ffcc" : "#7c7ff066")
      .child(h_flex().gap(10).items_center()
        .child(div().relative().size(18).flex_none().child(halo("cyan", 44, 9, 9, bright ? 0.7 : 0.35)).child(icon(ic, 18, C.cyan)))
        .child(div().flex_1().text_size(14.5).font_semibold().text_color("#ffffff").child(title))
        .when(Boolean(extra), (el) => el.child(extra)));
    const wrap = (key, el, bright) => div().px(10).child(neon(this, cx, key, el, { radius: 14, spread: 10, strength: bright ? 1 : 0.7 }));

    const row = (ic, label, value, valueIcon) => h_flex().gap(10).items_center().text_size(12.8)
      .child(icon(ic, 13, C.dim))
      .child(div().w(86).flex_none().text_color(C.muted).child(label))
      .when(Boolean(valueIcon), (el) => el.child(valueIcon))
      .child(div().flex_1().truncate().text_color(C.text).child(value || "—"));

    const pillEl = div().px(10).py(3).rounded(11).bg(sc + "22").border(1).border_color(sc).text_size(11.5).font_medium().text_color(sc).child(st);
    const runCard = card("q-run", "Current Run", "activity", neon(this, cx, "pill", pillEl, { radius: 11, spread: 7, tone: { [C.cyan]: "cyan", [C.amber]: "amber", [C.green]: "green" }[sc] ?? "violet", pulse: working, full: false }), true)
      .when(!a, (el) => el.child(div().text_size(12.5).text_color(C.muted).child("Focus an agent's pane to see its run.")))
      .when(Boolean(a), (el) => el
        .child(row("terminal", "Agent", a.program?.name ?? a.app ?? "agent", programIcon(a.program, 14)))
        .child(row("list", "Project", short(pane?.cwd) || space?.name, svg("mods/workspace-chrome/folder.svg").size(14).text_color(C.cyan)))
        .child(row("layers", "Workspace", `${space?.name ?? ""} · ${space?.machine ?? "This computer"}`))
        .when(Boolean(pane?.branch), (el) => el.child(row("activity", "Branch", pane.branch, svg("mods/workspace-chrome/git-branch.svg").size(13).text_color(C.violet))))
        .child(row("cpu", "Model", s.model ? `${s.model}${s.effort ? ` (${s.effort})` : ""}` : ""))
        .child(row("clock", "Started", ago(tab?.working_since ?? tab?.changed_at, true)))
        .child(row("ram", "Tokens", s.up ? `↑ ${s.up}   ↓ ${s.down}` : ""))
        .when(s.left != null, (el) => el.child(v_flex().gap(7).pt(4)
          .child(h_flex().text_size(12.5).text_color(C.muted)
            .child(div().flex_1().child(working ? `${s.doing?.verb ?? "Thinking…"}${s.effort ? ` (${s.effort} effort)` : ""}` : "Context left"))
            .child(div().text_color("#ffffff").font_semibold().child(`${s.left}%`)))
          .child(neon(this, cx, "bar", bar(s.left, 262), { radius: 4, spread: 7, tone: "cyan", strength: working ? 1 : 0.6, pulse: working, full: false }))
          .child(div().text_size(11).text_color(C.dim).child(`${s.used} of ${s.size}${s.l5 ? `  ·  limit 5h ${s.l5}% · 7d ${s.l7}%` : ""}`)))));

    const cmds = card("q-cmds", "Recent Commands", "terminal")
      .when(!s.commands?.length, (el) => el.child(div().text_size(12).text_color(C.dim).child("No shell commands on screen yet.")))
      .children((s.commands ?? []).map((c, i) => {
        const live = i === 0 && working;
        const line = h_flex().id(`q-cmd-${i}`).px(8).py(5).gap(9).items_center().rounded(8).text_size(12.5)
          .when(live, (el) => el.bg("#1b2a7a88").border(1).border_color("#4fd8ff88"))
          .child(live ? div().w(13).flex_none().text_color(C.cyan).frames(SPIN, 90).child("⠋") : icon("check", 13, C.green))
          .child(div().flex_1().truncate().font_family("JetBrains Mono").text_color(i === 0 ? "#ffffff" : C.muted).child(c));
        return neon(this, cx, `cmd-${i}`, line, { on: live, radius: 8, spread: 7, tone: "cyan", pulse: true });
      }));

    const out = card("q-out", "Run Output", "list")
      .child(v_flex().gap(4).font_family("JetBrains Mono").text_size(11.5)
        .when(!s.output?.length, (el) => el.child(div().text_color(C.dim).child("›  waiting for output…")))
        .children((s.output ?? []).map((l, i) => h_flex().gap(8)
          .child(div().flex_none().text_color(C.violet).child("›"))
          .child(div().flex_1().truncate().text_color(i === s.output.length - 1 ? "#ffffff" : C.muted).child(l.trim())))));

    const segBtn = (id, ic, label, on, action) => {
      const el = h_flex().id(id).w_full().h(36).gap(8).justify_center().items_center().rounded(10).text_size(13)
        .when(on, (e) => e.bg("#2a2384ee").border(1).border_color("#b9a4ffee").font_semibold().text_color("#ffffff"))
        .when(!on, (e) => e.border(1).border_color("#00000000").text_color(C.muted).cursor_pointer().hover((x) => x.bg("#ffffff10").text_color(C.text)))
        .when(Boolean(action), (e) => e.on_click(action))
        .child(ic).child(label);
      return div().flex_1().child(neon(this, cx, id, el, { on, radius: 10, spread: 6 }));
    };
    const toggle = (child) => () => { run("layout.select", { stack: "panel-body", child }); run("layout.toggle", { id: "panel" }); };
    const header = h_flex().w_full().p(4).gap(4).items_center().rounded(14).bg(C.glass).border(1).border_color("#8b6cff77")
      .child(segBtn("q-seg-session", icon("activity", 15, C.cyan), "Session", true))
      .child(segBtn("q-seg-files", svg("mods/workspace-chrome/files.svg").size(15), "Files", false, toggle("files")))
      .child(segBtn("q-seg-changes", svg("mods/workspace-chrome/git-compare.svg").size(15), "Changes", false, toggle("changes")));

    return v_flex().size_full().gap(12).overflow_y_scrollbar().pb(6)
      .child(div().px(10).pt(10).child(neon(this, cx, "seg", header, { radius: 14, spread: 10, strength: 0.8 })))
      .child(wrap("run", runCard, true)).child(wrap("cmds", cmds)).child(wrap("out", out));
  }

  // ------------------------------------------------------------ status bar
  status(cx) {
    const space = spaces().find((x) => x.active);
    const list = agents();
    const working = list.filter((a) => a.status === "working").length;
    const needs = list.filter((a) => a.status === "blocked").length;
    const s = this.screen;
    const item = (ic, text, color) => h_flex().gap(8).items_center().child(ic).child(div().text_color(color ?? C.muted).child(text));
    const sepr = () => div().w(1).h(16).bg("#8b6cff44");
    const content = h_flex().size_full().px(18).gap(18).items_center().text_size(12.8)
      .child(item(svg(`mods/workspace-chrome/${space?.machine ? "server" : "monitor"}.svg`).size(15).text_color(C.cyan), space?.machine ?? "This computer", C.text))
      .when(Boolean(space?.branch), (el) => el.child(sepr()).child(item(svg("mods/workspace-chrome/git-branch.svg").size(15).text_color(C.lilac), space.branch, C.text)))
      .child(sepr())
      .child(item(div().relative().size(8).child(halo(working ? "cyan" : "violet", 26, 4, 4, 0.8)).child(div().size(8).rounded_full().bg(working ? C.cyan : C.violet)),
        `${list.length} agents${working ? ` · ${working} working` : ""}`, C.text))
      .when(needs > 0, (el) => el.child(div().text_color(C.amber).child(`${needs} need${needs > 1 ? "" : "s"} you`)))
      .child(div().flex_1())
      .when(this.cpu != null, (el) => el.child(item(icon("cpu", 15, C.lilac), `CPU ${this.cpu}%`, C.text)))
      .when(Boolean(this.ram), (el) => el.child(item(icon("ram", 15, C.lilac),
        `RAM ${this.ram.used.toFixed(1)}G / ${this.ram.total.toFixed(1)}G (${Math.round((100 * this.ram.used) / this.ram.total)}%)`, C.text)))
      .when(Boolean(s.up), (el) => el.child(item(div().text_color(C.cyan).font_bold().child("↑"), `${s.up}   ↓ ${s.down}`, C.text)))
      .child(sepr())
      .child(h_flex().id("q-palette").gap(8).items_center().cursor_pointer().text_color(C.muted)
        .hover((x) => x.text_color("#ffffff")).on_click(() => run("app.palette"))
        .child(icon("terminal", 15, C.lilac)).child("commands"));
    return panel(this, cx, "status", content, { radius: 14, id: "q-status", strength: 0.9, margin: 8 });
  }
}

// Shared look for the Quantum mod: colors, square frames and panels, small widgets.

import { div, svg, image } from "gpui-kit";
import { h_flex } from "gpui-base";

export const A = "mods/quantum";
export const C = {
  card: "#0b1432c8",
  cyan: "#4fd8ff",
  violet: "#8b6cff",
  lilac: "#b9a4ff",
  green: "#4ef0a6",
  amber: "#ffb547",
  text: "#e8ebff",
  muted: "#a3a9e0",
  dim: "#6d73b3",
};
// The pane header: its band and the line under it.
export const CARD = { band: "#1a2254", rule: "#454c86" };

const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

export function mix(a, b, f) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => hex2(v + (y[i] - v) * f)).join("");
}

// A context bar filling its row: 40 square segments, the filled ones cyan to violet.
export function barPic(h, pct) {
  const n = 40, filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * n);
  return h_flex().flex_1().min_w(0).h(h).bg("#ffffff14").children(
    Array.from({ length: n }, (_, i) => div().h_full().flex_1().bg(i < filled ? mix(C.cyan, C.violet, i / (n - 1)) : "#00000000")));
}

// `el` in a square 1px frame, lit in `tone` when `on` (transparent otherwise, so nothing moves).
const EDGE = { violet: "#8b7bffcc", cyan: "#4fd8ffcc", card: "#4a58b8aa", panel: "#4a58b8aa" };
export function neon(key, el, { on = true, tone = "violet", tall = false } = {}) {
  return div().id(`nz-${key}`).w_full().when(tall, (d) => d.h_full())
    .border(1).border_color(on ? (EDGE[tone] ?? EDGE.violet) : "#00000000").child(el);
}

// A panel filling its block: slightly translucent navy with a thin square border.
export function panel(key, content, { margin = 6, id } = {}) {
  const out = div().size_full().p(margin).child(
    div().id(`pz-${key}`).size_full().bg("#0b1236b8").border(1).border_color(EDGE.panel).overflow_hidden().child(content));
  return id ? out.id(id) : out;
}

// A round soft light, drawn from a pre-blurred picture, centered at (x, y) in a relative parent.
export function halo(kind, size, x, y, opacity = 1) {
  return image(`${A}/halo-${kind}.png`).size(size).absolute().left(x - size / 2).top(y - size / 2).opacity(opacity);
}

export function icon(name, size, color) {
  return svg(`${A}/${name}.svg`).size(size).flex_none().text_color(color);
}

export function programIcon(p, size, color = C.text) {
  if (!p?.icon) return null;
  return p.tint ? svg(p.icon).size(size).flex_none().text_color(p.color ?? color) : image(p.icon).w(size).h(size).flex_none();
}

const TILES = ["#22c55e", "#f97316", "#6d7cff", "#a855f7", "#16a34a", "#ec4899", "#14b8a6", "#3b82f6", "#eab308", "#ef4444"];
function tileColor(name) {
  let h = 0;
  for (const ch of name || "") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TILES[h % TILES.length];
}

export function letterTile(name, size = 20) {
  const ch = (name || "?").replace(/^[^\p{L}\p{N}]+/u, "").charAt(0).toUpperCase() || "?";
  return div().size(size).flex_none().bg(tileColor(name)).flex().items_center().justify_center()
    .text_size(size * 0.6).font_bold().text_color("#ffffff").child(ch);
}

// Status colours everywhere: working cyan, needs you amber, done green, idle dim.
export const STATUS = { working: C.cyan, blocked: C.amber, done: C.green, idle: C.dim };

export function statusMark(status, size = 14) {
  if (status === "working") return div().size(size).flex_none().flex().items_center().justify_center()
    .child(div().size(size - 2).rounded_full().border(2).border_color(STATUS.working));
  if (status === "blocked") return div().size(size).flex_none().rounded_full().bg(STATUS.blocked).flex().items_center().justify_center()
    .text_size(size * 0.7).font_bold().text_color("#1a1030").child("!");
  if (status === "done") return div().size(size).flex_none().flex().items_center().justify_center()
    .child(div().size(size * 0.55).rounded_full().bg(STATUS.done));
  return icon("ring", size, STATUS.idle);
}

export function ago(ms, long = false) {
  if (!ms) return "";
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return long ? `${s}s ago` : `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return long ? `${m}m ${s % 60}s ago` : `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return long ? `${h}h ${m % 60}m ago` : `${h}h`;
  return long ? `${Math.floor(h / 24)}d ago` : `${Math.floor(h / 24)}d`;
}

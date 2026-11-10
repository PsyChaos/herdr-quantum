// Shared look for the Quantum mod: colors, glow rings, glass cards, small widgets.
// GPUI elements take solid colors and no blur, so a glow is drawn as rings:
// thin borders around the element, fading out (alpha falls) as they go outward.

import { div, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";

export const A = "mods/quantum";
export const C = {
  glass: "#0c0f34c4",
  card: "#11154ad4",
  line: "#5d63d855",
  lineHi: "#8b6cffaa",
  cyan: "#4fd8ff",
  violet: "#8b6cff",
  lilac: "#b9a4ff",
  pink: "#d16bff",
  green: "#4ef0a6",
  amber: "#ffb547",
  text: "#e8ebff",
  muted: "#a3a9e0",
  dim: "#6d73b3",
};
export const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

export function mix(a, b, f) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => hex2(v + (y[i] - v) * f)).join("");
}

// Edge light: the glow is a thin rim whose brightness and color travel along each edge
// (bright and cyan where the light hits, fading to a dim violet), with a little light
// scattered around the bright parts. GPUI has no gradients or blur, so each edge is a
// row of solid segments, drawn three times: a 1px core and 3px and 7px soft spreads.
const SEG = 20;
const gauss = (t, at, w) => Math.exp(-Math.pow((t - at) / w, 2));
const TONES = {
  violet: { a: "#6ee7ff", b: "#9b7bff", c: "#d16bff" },
  cyan: { a: "#bff4ff", b: "#4fd8ff", c: "#7c8cff" },
  green: { a: "#c8ffe6", b: "#4ef0a6", c: "#2fd0ff" },
  amber: { a: "#ffe3a8", b: "#ffb547", c: "#ff7ab8" },
};
const SHAPES = {
  // The light falls from the top-left: the top and left edges are lit from that corner,
  // the bottom has a glint left of center, the right edge a faint one high up.
  panel: {
    top: (t) => 0.25 + 0.75 * Math.pow(1 - t, 1.6),
    left: (t) => 0.2 + 0.8 * Math.pow(1 - t, 2),
    bottom: (t) => 0.18 + 0.82 * gauss(t, 0.4, 0.28),
    right: (t) => 0.15 + 0.45 * gauss(t, 0.18, 0.3),
  },
  // Small things (rows, tabs, pills): lit across the top, a glint along the bottom.
  item: {
    top: (t) => 0.45 + 0.55 * gauss(t, 0.3, 0.45),
    left: (_t) => 0.7,
    bottom: (t) => 0.2 + 0.6 * gauss(t, 0.6, 0.3),
    right: (_t) => 0.35,
  },
};

function strip(horizontal, thick, alpha, color, bright) {
  const box = horizontal ? h_flex().w_full().h(thick) : v_flex().h_full().w(thick);
  return box.children(Array.from({ length: SEG }, (_, i) => {
    const t = (i + 0.5) / SEG;
    const seg = div().flex_1().bg(color(t) + hex2(Math.min(1, bright(t) * alpha) * 255));
    return horizontal ? seg.h_full() : seg.w_full();
  }));
}

function edgeColor(tone, edge) {
  const k = TONES[tone] ?? TONES.violet;
  if (edge === "top" || edge === "left") return (t) => (t < 0.5 ? mix(k.a, k.b, t * 2) : mix(k.b, k.c, (t - 0.5) * 1.2));
  if (edge === "bottom") return (t) => mix(k.b, k.c, gauss(t, 0.7, 0.3));
  return () => k.b;
}

// One edge's light alone, for a block whose border the layout draws (the work area's top).
export function edge(side, { radius = 16, tone = "violet", shape = "panel", strength = 1 } = {}) {
  const sh = SHAPES[shape] ?? SHAPES.panel;
  const horizontal = side === "top" || side === "bottom";
  return div().absolute().top(0).left(0).right(0).bottom(0).children([[1, 1], [3, 0.3], [7, 0.1]].map(([th, al]) => {
    const off = -Math.floor((th - 1) / 2);
    const d = div().absolute();
    const placed = side === "top" ? d.top(off).left(radius).right(radius)
      : side === "bottom" ? d.bottom(off).left(radius).right(radius)
      : side === "left" ? d.left(off).top(radius).bottom(radius) : d.right(off).top(radius).bottom(radius);
    return placed.child(strip(horizontal, th, al * strength, edgeColor(tone, side), sh[side]));
  }));
}

// `el` must be rounded `radius` and fill the returned box; the rim is drawn over its edge.
export function rim(el, { radius = 12, tone = "violet", shape = "panel", strength = 1, pulse = false, spill = true, full = true } = {}) {
  const sh = SHAPES[shape] ?? SHAPES.panel;
  const layers = spill ? [[1, 1], [3, 0.3], [7, 0.1]] : [[1, 1], [3, 0.25]];
  const r = Math.max(4, radius - 1);
  const parts = [];
  for (const [th, al] of layers) {
    const off = -Math.floor((th - 1) / 2);
    const a = al * strength;
    parts.push(div().absolute().top(off).left(r).right(r).child(strip(true, th, a, edgeColor(tone, "top"), sh.top)));
    parts.push(div().absolute().bottom(off).left(r).right(r).child(strip(true, th, a, edgeColor(tone, "bottom"), sh.bottom)));
    parts.push(div().absolute().left(off).top(r).bottom(r).child(strip(false, th, a, edgeColor(tone, "left"), sh.left)));
    parts.push(div().absolute().right(off).top(r).bottom(r).child(strip(false, th, a, edgeColor(tone, "right"), sh.right)));
  }
  const light = div().absolute().top(0).left(0).right(0).bottom(0).children(parts);
  return div().relative().when(full, (d) => d.w_full())
    .child(el)
    .child(pulse ? light.loop("opacity", { from: 0.55, to: 1, period: 1800 }) : light);
}

// Kept names used by the roles: an item with a rim, or as is.
export function lit(el, on, tone, radius, opts = {}) {
  return on ? rim(el, { radius, tone, shape: "item", ...opts }) : el;
}

// A glass panel filling its block: dim base border, edge light, a spot of light where it's
// brightest. Leaves `margin` px around it for the spill.
export function panel(content, { radius = 18, tone = "violet", strength = 1, pad = 0, margin = 6, id } = {}) {
  const k = TONES[tone] ?? TONES.violet;
  const box = div().size_full().rounded(radius).bg(C.glass).border(1).border_color(k.b + "40").overflow_hidden().p(pad).child(content);
  const out = div().size_full().p(margin).child(
    div().relative().size_full()
      .child(box)
      .child(halo("cyan", 90, radius * 0.7, radius * 0.7, 0.45 * strength))
      .child(rim(div().size_full(), { radius, tone, strength }).absolute().top(0).left(0).right(0).bottom(0)));
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

// A gradient bar from solid segments, cyan to violet, glowing (and breathing when `live`).
export function bar(pct, w, { h = 8, live = false } = {}) {
  const n = 30, seg = w / n, filled = Math.round((Math.max(0, Math.min(100, pct)) / 100) * n);
  const track = h_flex().w(w).h(h).rounded(h / 2).overflow_hidden().bg("#ffffff14").children(
    Array.from({ length: filled }, (_, i) => div().h_full().w(seg).flex_none().bg(mix(C.cyan, C.violet, i / (n - 1)))));
  return div().w(w).child(rim(track, { radius: h / 2, tone: "cyan", shape: "item", strength: live ? 1.2 : 0.6, pulse: live, full: false }));
}

const TILES = ["#22c55e", "#f97316", "#6d7cff", "#a855f7", "#16a34a", "#ec4899", "#14b8a6", "#3b82f6", "#eab308", "#ef4444"];
export function tileColor(name) {
  let h = 0;
  for (const ch of name || "") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TILES[h % TILES.length];
}

export function letterTile(name, size = 20) {
  const ch = (name || "?").replace(/^[^\p{L}\p{N}]+/u, "").charAt(0).toUpperCase() || "?";
  return div().size(size).flex_none().rounded(5).bg(tileColor(name)).flex().items_center().justify_center()
    .text_size(size * 0.6).font_bold().text_color("#ffffff").child(ch);
}

export function statusMark(status, size = 14) {
  if (status === "working") return div().w(size).flex_none().text_size(size).text_color(C.cyan).frames(SPIN, 90).child("⠋");
  if (status === "blocked") return div().size(size).flex_none().rounded_full().bg(C.amber).flex().items_center().justify_center()
    .text_size(size * 0.7).font_bold().text_color("#1a1030").child("!");
  if (status === "done") return div().size(size).flex_none().flex().items_center().justify_center()
    .child(div().size(size * 0.55).rounded_full().bg(C.green));
  return icon("ring", size, C.dim);
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

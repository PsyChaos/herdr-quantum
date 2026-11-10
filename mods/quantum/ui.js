// Shared look for the Quantum mod: colors, neon frames, glass panels, small widgets.

import { div, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { appHome } from "herdr";
import * as fs from "fs/promises";

export const A = "mods/quantum";
export const C = {
  glass: "#0d1338ea",
  card: "#0b1432c8",
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

// Neon frames. GPUI draws solid colors only, so the light is a picture: for each lit
// element the mod measures its size and writes an SVG of exactly that size (a gradient
// stroke plus two blurred copies of it), cached by size under mods/quantum/.glow/
// (hidden, so writing it doesn't reload the mod). The stroke's color and brightness travel
// along the edge: bright cyan at the top-left, dimming through violet, a pink-violet glint
// at the bottom-right.
const TONES = {
  // line colours along the diagonal: top-left, upper middle, lower middle, bottom-right; glow
  violet: ["#b8f6ff", "#8d96ff", "#7a5cff", "#e08bff", "#5a4cff"],
  // selected rows: a near-white lilac end, blue, a violet end; a blue inner light
  blue: ["#e4dcff", "#5a7ce8", "#5566d8", "#9a70e8", "#2a44b8"],
  // selected tab and switch: cyan at the left fading to violet
  seg: ["#8ce0ff", "#4a9ae8", "#4a62d8", "#7a60e0", "#1e3aa0"],
  // the session cards: blue, brightest at the top-left
  card: ["#62b0ff", "#4078d8", "#3a56b8", "#8a70f0", "#2a4ab0"],
  // the sidebar panel and the status bar: a white-blue top, dim blue sides, violet at the bottom
  panel: ["#dfe2ff", "#5a64d8", "#3c4498", "#7c5cd0", "#3434c8"],
  // the active tab: pink-violet at the top-left, cyan on the right
  tab: ["#e8b8ff", "#9aa8ff", "#5aa8f0", "#4fd8ff", "#2a3ab0"],
  cyan: ["#e0fbff", "#4fd8ff", "#3fa8ff", "#9b7bff", "#2fa8ff"],
  green: ["#e0fff2", "#4ef0a6", "#2fd0b0", "#4fd8ff", "#2fd0a0"],
  amber: ["#fff4d8", "#ffb547", "#ff9a4a", "#ff7ab8", "#ff9a3a"],
};
const made = new Map(); // file name -> "pending" | "ready"

// The light round a rounded rect w×h (its edge `spread` px in from the picture's edge),
// drawn exactly on the element's edge: same box, same corner radius, the line centred on it.
// Layers: a glow outside only (`outer` scales it), a near glow, the crisp line, a highlight
// along the top that fades out before the corners. Brightness falls from the top down the
// sides and rises toward the bottom. `inner` adds light just inside the top and bottom
// edges, as the design's glass cards have.
// `gloss` (a selected item) also paints the fill: dark navy with a blue light inside its
// edges, so the item looks lit and slightly raised; the picture then sits behind the item.
function frameSvg(w, h, { radius, tone, spread, strength, gloss = false, fill = false, outer = 1, inner = false }) {
  const [hot, mid, low, glint, glow] = TONES[tone] ?? TONES.violet;
  const W = Math.ceil(w) + 2 * spread, H = Math.ceil(h) + 2 * spread, s = spread, r = Math.min(radius, w / 2, h / 2);
  const k = (x) => Math.min(1, x * strength).toFixed(3);
  const U = `gradientUnits="userSpaceOnUse"`, F = `filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"`;
  const box = `x="${s}" y="${s}" width="${w}" height="${h}" rx="${r}"`;
  const blur = (id, sd) => `<filter id="${id}" ${F}><feGaussianBlur stdDeviation="${sd}"/></filter>`;
  const defs = `<linearGradient id="g" ${U} x1="${s}" y1="${s}" x2="${s + w}" y2="${s + h}">`
    + `<stop offset="0" stop-color="${hot}"/><stop offset="0.3" stop-color="${mid}"/>`
    + `<stop offset="0.65" stop-color="${low}"/><stop offset="1" stop-color="${glint}"/></linearGradient>`
    + `<linearGradient id="v" ${U} x1="0" y1="${s}" x2="0" y2="${s + h}">`
    + `<stop offset="0" stop-color="#fff" stop-opacity="${k(1)}"/>`
    + `<stop offset="${Math.min(0.45, 24 / h).toFixed(3)}" stop-color="#fff" stop-opacity="${k(0.75)}"/>`
    + `<stop offset="0.5" stop-color="#fff" stop-opacity="${k(0.5)}"/>`
    + `<stop offset="1" stop-color="#fff" stop-opacity="${k(0.85)}"/></linearGradient>`
    + `<linearGradient id="iv" ${U} x1="0" y1="${s}" x2="0" y2="${s + h}"><stop offset="0" stop-color="#fff" stop-opacity="0.8"/>`
    + `<stop offset="${Math.min(0.4, 18 / h).toFixed(3)}" stop-color="#fff" stop-opacity="0"/><stop offset="${Math.max(0.6, 1 - 18 / h).toFixed(3)}" stop-color="#fff" stop-opacity="0"/>`
    + `<stop offset="1" stop-color="#fff" stop-opacity="0.6"/></linearGradient>`
    + `<linearGradient id="hl" ${U} x1="${s + r}" y1="0" x2="${s + w - r}" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/>`
    + `<stop offset="0.2" stop-color="#fff"/><stop offset="0.8" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`
    + `<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#v)"/></mask>`
    + `<mask id="mi" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#iv)"/></mask>`
    + `<mask id="o" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/><rect ${box} fill="#000"/></mask>`
    + `<clipPath id="cl"><rect ${box}/></clipPath>`
    + blur("wide", (spread * 0.3).toFixed(2)) + blur("near", 0.8) + blur("ig", Math.max(2, Math.min(4, h / 8)).toFixed(1));
  const line = (sw, color, extra) => `<rect ${box} fill="none" stroke="${color}" stroke-width="${sw}" ${extra}/>`;
  let body = "";
  if (gloss) {
    body += `<rect ${box} fill="#131a4a" fill-opacity="0.96"/>`
      + line(Math.max(7, h / 3.2), glow, `stroke-opacity="0.85" filter="url(#ig)" clip-path="url(#cl)"`);
  }
  if (fill) body += `<rect ${box} fill="${glow}" fill-opacity="0.07"/>`;
  if (inner) body += `<g mask="url(#mi)" clip-path="url(#cl)">` + line(14, glow, `filter="url(#ig)" opacity="0.55"`) + `</g>`;
  const top = `M${s + r} ${s + 0.6}H${s + w - r}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>`
    + body
    + `<g mask="url(#m)">`
    + (outer > 0 ? `<g mask="url(#o)">` + line(spread * 0.5, glow, `filter="url(#wide)" opacity="${(0.8 * outer).toFixed(2)}"`) + `</g>` : "")
    + line(2, "url(#g)", `filter="url(#near)" opacity="0.45"`)
    + line(1.2, "url(#g)", "")
    + `</g>`
    + `<path d="${top}" stroke="url(#hl)" stroke-width="1" opacity="${k(gloss ? 0.5 : 0.6)}"/>`
    + `</svg>`;
}

// Writes `svg` (a string) to mods/quantum/.glow/<name> once; returns its path when it's there.
export function ensurePic(cx, name, make) {
  const rel = `${A}/.glow/${name}`;
  const state = made.get(name);
  if (state === "ready") return rel;
  if (!state) {
    made.set(name, "pending");
    cx.spawn(async (cx) => {
      try {
        const dir = `${appHome()}/${A}/.glow`;
        if (!(await fs.exists(`${dir}/${name}`))) {
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(`${dir}/${name}`, make());
        }
        made.set(name, "ready");
        cx.notify();
      } catch (_) { made.delete(name); }
    });
  }
  return null;
}

// The work area, as one picture W×H: a faint rounded shell (the tabs stand on its top edge)
// holding the terminal card with its brighter rim. `CARD.m` px of margin outside the shell;
// the card's rim sits `sIn` px inside the shell at the sides and bottom, `sTop` px below its
// top; the panes start `inner` px inside the rim. The picture is shown in slices by the
// blocks round the panes: the tab bar shows its top `CARD.tt` px, the "edge" blocks
// (`CARD.t` px thick) its sides and bottom. Between them the work-body node paints a square
// fill of the card's exact colour. Every slice reaches `inner` px inside the rim, more than
// a corner arc needs, so each corner lies wholly in one picture and both lines are unbroken.
export const CARD = (() => {
  const m = 3, sIn = 6, sTop = 8, inner = 5;
  return { m, sIn, sTop, inner, t: m + sIn + inner, tt: m + sTop + inner, R: 18, r: 14,
    shell: "#0a153c", fill: "#0b1131", band: "#1a2254", head: 38, rule: "#454c86" };
})();
export function cardSvg(W, H) {
  const { m, sIn, sTop, tt, R, r, shell, fill, band, head, rule } = CARD;
  const PW = Math.ceil(W), PH = Math.ceil(H);
  const sx = m, sy = m, sw = W - 2 * m, sh = H - 2 * m;
  const x = m + sIn, y = m + sTop, w = W - 2 * (m + sIn), h = H - 2 * m - sTop - sIn;
  const U = `gradientUnits="userSpaceOnUse"`, F = `filterUnits="userSpaceOnUse" x="0" y="0" width="${PW}" height="${PH}"`;
  // square at the top-left, where the first tab (the grid button) grows out of it
  const sp = `M${sx} ${sy}H${sx + sw - R}A${R} ${R} 0 0 1 ${sx + sw} ${sy + R}V${sy + sh - R}A${R} ${R} 0 0 1 ${sx + sw - R} ${sy + sh}`
    + `H${sx + R}A${R} ${R} 0 0 1 ${sx} ${sy + sh - R}Z`;
  const box = `x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"`;
  const fade = (id, c) => `<linearGradient id="${id}" ${U} x1="${x + r}" y1="0" x2="${x + w - r}" y2="0"><stop offset="0" stop-color="${c}" stop-opacity="0"/>`
    + `<stop offset="0.12" stop-color="${c}"/><stop offset="0.88" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`;
  const defs = `<linearGradient id="g" ${U} x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}">`
    + `<stop offset="0" stop-color="#7a9cff"/><stop offset="0.55" stop-color="#6478ea"/><stop offset="1" stop-color="#52c0f2"/></linearGradient>`
    + `<linearGradient id="v" ${U} x1="0" y1="${y}" x2="0" y2="${y + h}"><stop offset="0" stop-color="#fff"/>`
    + `<stop offset="${Math.min(0.3, 40 / h).toFixed(3)}" stop-color="#fff" stop-opacity="0.7"/><stop offset="1" stop-color="#fff" stop-opacity="0.8"/></linearGradient>`
    // the shell's line: faint blue, a little brighter along the top
    + `<linearGradient id="sl" ${U} x1="0" y1="${sy}" x2="0" y2="${sy + sh}"><stop offset="0" stop-color="#2e4c98"/>`
    + `<stop offset="${Math.min(0.2, 30 / sh).toFixed(3)}" stop-color="#1c2a66"/><stop offset="1" stop-color="#1e2c6a"/></linearGradient>`
    + fade("tp", "#8ab4ff") + fade("hl", "#dfe8ff")
    + `<mask id="mv" maskUnits="userSpaceOnUse" x="0" y="0" width="${PW}" height="${PH}"><rect width="${PW}" height="${PH}" fill="url(#v)"/></mask>`
    + `<mask id="o" maskUnits="userSpaceOnUse" x="0" y="0" width="${PW}" height="${PH}"><rect width="${PW}" height="${PH}" fill="#fff"/><rect ${box} fill="#000"/></mask>`
    + `<clipPath id="c"><rect ${box}/></clipPath>`
    + `<filter id="w" ${F}><feGaussianBlur stdDeviation="2"/></filter><filter id="n" ${F}><feGaussianBlur stdDeviation="0.8"/></filter>`;
  const ring = (sw, stroke, extra) => `<rect ${box} fill="none" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}"><defs>${defs}</defs>`
    + `<path d="${sp}" fill="${shell}" fill-opacity="0.92"/>`
    + `<path d="${sp}" fill="none" stroke="url(#sl)" stroke-width="1.2"/>`
    + `<rect ${box} fill="${fill}"/>`
    // the pane header's band runs out to the rim (the header itself starts `inner` px inside it)
    + `<rect x="${x}" y="${y}" width="${w}" height="${tt + head - y}" fill="${band}" clip-path="url(#c)"/>`
    + `<rect x="${x}" y="${tt + head - 1}" width="${w}" height="1" fill="${rule}" clip-path="url(#c)"/>`
    + `<g mask="url(#mv)">`
    + `<g mask="url(#o)">` + ring(4, "#3a6ae8", `filter="url(#w)" opacity="0.75"`)
    + `<path d="M${x + r} ${y}H${x + w - r}" stroke="url(#tp)" stroke-width="3" opacity="0.6" filter="url(#w)"/></g>`
    + `<g clip-path="url(#c)">` + ring(2.4, "url(#g)", `filter="url(#n)" opacity="0.5"`) + `</g>`
    + ring(1.5, "url(#g)", "") + `</g>`
    + `<path d="M${x + r} ${y + 0.6}H${x + w - r}" stroke="url(#hl)" stroke-width="1" opacity="0.6"/>`
    + `</svg>`;
}

// A context bar as a picture: a rounded track, a rounded cyan → blue → violet → pink fill,
// a soft glow under the fill and a bright cap at its end.
export function barSvg(w, h, pct, lit) {
  const s = 8, W = w + 2 * s, H = h + 2 * s, fw = Math.max(h, Math.round((w * Math.max(0, Math.min(100, pct))) / 100));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>`
    + `<linearGradient id="f" gradientUnits="userSpaceOnUse" x1="${s}" y1="0" x2="${s + fw}" y2="0"><stop offset="0" stop-color="#2ff0d0"/><stop offset="0.45" stop-color="#3b8bff"/><stop offset="0.8" stop-color="#8b6cff"/><stop offset="1" stop-color="#d47bff"/></linearGradient>`
    + `<filter id="b" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feGaussianBlur stdDeviation="3"/></filter></defs>`
    + `<rect x="${s}" y="${s}" width="${w}" height="${h}" rx="${h / 2}" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.06"/>`
    + `<rect x="${s}" y="${s}" width="${fw}" height="${h}" rx="${h / 2}" fill="url(#f)" filter="url(#b)" opacity="${lit ? 0.75 : 0.45}"/>`
    + `<rect x="${s}" y="${s}" width="${fw}" height="${h}" rx="${h / 2}" fill="url(#f)"/>`
    + `<rect x="${s}" y="${s + 1}" width="${fw}" height="${h / 2 - 1}" rx="${h / 4}" fill="#ffffff" opacity="0.18"/>`
    + `<circle cx="${s + fw - h / 2}" cy="${s + h / 2}" r="${h * 0.7}" fill="#ffffff" opacity="${lit ? 0.7 : 0.45}" filter="url(#b)"/>`
    + `<circle cx="${s + fw - h / 2}" cy="${s + h / 2}" r="${h * 0.22}" fill="#ffffff" opacity="0.9"/></svg>`;
}

export function barPic(cx, w, h, pct, lit) {
  const p = Math.round(pct);
  const rel = ensurePic(cx, `v3-bar-${w}x${h}-${p}-${lit ? 1 : 0}.svg`, () => barSvg(w, h, p, lit));
  const box = div().relative().w(w).h(h);
  return rel ? box.child(image(rel).absolute().left(-8).top(-8).w(w + 16).h(h + 16)) : box.rounded(h / 2).bg("#ffffff14");
}

// The frame picture for an element of `size`, positioned over it (the parent must be
// `.relative()`); null until it has been written.
function framePic(cx, size, opts) {
  if (!size) return null;
  // The element's own size to a quarter pixel, so the drawn edge lands on its edge.
  const w = Math.round(size.width * 4) / 4, h = Math.round(size.height * 4) / 4;
  if (w < 4 || h < 4) return null;
  const { radius, tone, spread, strength, gloss = false, fill = false, outer = 1, inner = false } = opts;
  const name = `v8-${tone}-${radius}-${spread}-${Math.round(strength * 100)}-${Math.round(outer * 100)}${gloss ? "g" : ""}${fill ? "f" : ""}${inner ? "i" : ""}-${w}x${h}.svg`;
  const rel = ensurePic(cx, name, () => frameSvg(w, h, { radius, tone, spread, strength, gloss, fill, outer, inner }));
  if (rel) return image(rel).absolute().left(-spread).top(-spread).w(Math.ceil(w) + 2 * spread).h(Math.ceil(h) + 2 * spread);
  return null;
}

// `el` (rounded `radius`) with a neon frame when `on`. `view.sizes` keeps measured sizes;
// `key` must be unique in the mod copy.
export function neon(view, cx, key, el, { on = true, radius = 12, tone = "violet", spread = 10, strength = 1, full = true, gloss = false, fill = false, tall = false, outer = 1, inner = false } = {}) {
  const box = div().id(`nz-${key}`).relative().when(full, (d) => d.w_full()).when(tall, (d) => d.h_full())
    .on_size_change((size, cx) => {
      const old = view.sizes[key];
      if (!old || Math.round(old.width) !== Math.round(size.width) || Math.round(old.height) !== Math.round(size.height)) {
        view.sizes[key] = size; cx.notify();
      }
    });
  // Selected items light up blue, as the design's do.
  const pic = on ? framePic(cx, view.sizes[key], { radius, tone: gloss && tone === "violet" ? "blue" : tone, spread, strength, gloss, fill, outer, inner }) : null;
  // A selected item's picture carries its fill, so it goes behind; a plain frame goes over.
  if (!pic) return box.child(el);
  return gloss ? box.child(pic).child(el) : box.child(el).child(pic);
}

// A glass panel filling its block, framed in neon. Leaves `margin` px around it for the light.
export function panel(view, cx, key, content, { radius = 18, tone = "panel", strength = 1, margin = 10, pad = 0, id } = {}) {
  const box = div().size_full().rounded(radius).bg(C.glass).overflow_hidden().p(pad).child(content);
  const inner = div().id(`pz-${key}`).relative().size_full()
    .on_size_change((size, cx) => {
      const old = view.sizes[key];
      if (!old || Math.round(old.width) !== Math.round(size.width) || Math.round(old.height) !== Math.round(size.height)) {
        view.sizes[key] = size; cx.notify();
      }
    })
    .child(box);
  const pic = framePic(cx, view.sizes[key], { radius, tone, spread: margin, strength });
  const out = div().size_full().p(margin).child(pic ? inner.child(pic) : inner);
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

// A gradient bar from solid segments, cyan to violet: only its filled part is returned
// (as `fill`, `fw` px wide) so a caller can frame it in neon; `track` holds it.
export function bar(pct, w, { h = 8 } = {}) {
  const n = 30, seg = w / n, filled = Math.max(1, Math.round((Math.max(0, Math.min(100, pct)) / 100) * n));
  const fw = Math.round(filled * seg);
  const fill = h_flex().w(fw).h(h).rounded(h / 2).overflow_hidden().children(
    Array.from({ length: filled }, (_, i) => div().h_full().flex_1().bg(mix(C.cyan, C.violet, i / (n - 1)))));
  return { fill, fw, track: (inner) => div().w(w).h(h).rounded(h / 2).bg("#ffffff12").child(inner) };
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
  if (status === "working") return div().size(size).flex_none().flex().items_center().justify_center()
    .child(div().size(size - 2).rounded_full().border(2).border_color(C.amber));
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

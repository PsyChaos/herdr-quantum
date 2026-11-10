#!/usr/bin/env python3
"""Copy Herdr's shipped `files` and `changes` mods into this package as square-cornered,
larger-text variants (Herdr is Apache-2.0; see mods/<prefix>-files/LICENSE).

    python3 tools/fork-panels.py <prefix> <text +px> <border px> [herdr-app home]

e.g. `python3 tools/fork-panels.py arcade 2 2` writes mods/arcade-files and mods/arcade-changes
from ~/.config/herdr-app/mods/{files,changes}. Run it again after a Herdr update to pick up its
changes; the layout names the copies instead of the shipped mods.
"""
import os, re, shutil, sys

prefix, grow, border = sys.argv[1], float(sys.argv[2]), int(sys.argv[3])
home = os.path.expanduser(sys.argv[4] if len(sys.argv) > 4 else "~/.config/herdr-app")
here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
license_src = os.path.expanduser("~/.local/share/herdr-app/LICENSE")

def num(x):
    return str(int(x)) if float(x).is_integer() else f"{x:g}"

for name in ("files", "changes"):
    src, dst = os.path.join(home, "mods", name), os.path.join(here, "mods", f"{prefix}-{name}")
    shutil.rmtree(dst, ignore_errors=True)
    os.makedirs(dst)
    for f in os.listdir(src):
        if f.endswith(".svg") or f == "mod.json":
            shutil.copy(os.path.join(src, f), dst)
    code = open(os.path.join(src, "main.js")).read()
    code = code.replace(f"mods/{name}/", f"mods/{prefix}-{name}/")
    code = re.sub(r"\.rounded\(\d+(?:\.\d+)?\)", "", code)                       # square corners
    # text in the terminal font (diffs, previews) grows by at most 2px; the rest by `grow`
    mono = re.compile(r'(font_family\(settings\(\)\.font_family[^)]*\)\.text_size\()(\d+(?:\.\d+)?)\)')
    code = mono.sub(lambda m: f"{m.group(1)}{num(float(m.group(2)) + min(grow, 2))}@@)", code)
    code = re.sub(r"\.text_size\((\d+(?:\.\d+)?)\)", lambda m: f".text_size({num(float(m.group(1)) + grow)})", code)
    code = code.replace("@@)", ")")
    code = re.sub(r"font_size: (\d+)", lambda m: f"font_size: {num(float(m.group(1)) + min(grow, 2))}", code)
    row = num(28 + min(6, max(0, grow - 1)))                                        # rows grow a little with the text
    code = re.sub(r"\.h\(28\)", f".h({row})", code).replace("* 28 +", f"* {row} +")
    if border != 1:
        code = code.replace(".border_1().border_color(t.border)", f".border({border}).border_color(t.border)")
    head = (f"// Modified from Herdr's shipped `{name}` mod (Apache License 2.0, see LICENSE here):\n"
            f"// square corners, text {num(grow)}px larger. Regenerate with tools/fork-panels.py.\n")
    open(os.path.join(dst, "main.js"), "w").write(head + code)
    shutil.copy(license_src, os.path.join(dst, "LICENSE"))
    print("wrote", dst)

# Generates mods/quantum/nebula-deep.jpg (via rsvg-convert):
#   python3 art/nebula.py > nebula.svg && rsvg-convert nebula.svg -o nebula.png
#   magick nebula.png -quality 90 mods/quantum/nebula-deep.jpg
# Near-black deep navy; colour only where the panels don't cover it: the title band and the
# ringed planet at the top, the window's right edge, the lower corners and the giant planet
# rising behind the status bar.
import random, math
random.seed(42)
W,H=2560,1440
o=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
o.append(f'''<defs>
<linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070826"/><stop offset=".12" stop-color="#04051a"/><stop offset=".8" stop-color="#03041a"/><stop offset="1" stop-color="#080a2e"/></linearGradient>
<filter id="b3" filterUnits="userSpaceOnUse" x="-200" y="-200" width="{W+400}" height="{H+400}"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="b6" filterUnits="userSpaceOnUse" x="-200" y="-200" width="{W+400}" height="{H+400}"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="b14" filterUnits="userSpaceOnUse" x="-200" y="-200" width="{W+400}" height="{H+400}"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="b30" filterUnits="userSpaceOnUse" x="-200" y="-200" width="{W+400}" height="{H+400}"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="b60" filterUnits="userSpaceOnUse" x="-200" y="-200" width="{W+400}" height="{H+400}"><feGaussianBlur stdDeviation="60"/></filter>''')
# nebula layers: colour, noise frequency, octaves, seed, and the spots where they show
layers=[("#7b3cff",0.0020,5,3,[(0.08,0.02,0.16),(0.42,0.02,0.08),(0.88,0.02,0.11),(0.03,0.62,0.10)]),
        ("#2f5bff",0.0024,5,8,[(0.62,0.05,0.16),(0.30,0.99,0.20),(0.97,0.96,0.12)]),
        ("#d23cff",0.0028,4,17,[(1.00,0.40,0.07),(0.07,0.93,0.10),(0.78,0.0,0.06)]),
        ("#2fd0ff",0.0032,4,23,[(0.55,0.04,0.08),(0.99,0.72,0.06)])]
for k,(col,f,oc,seed,spots) in enumerate(layers):
    r,g,b=[int(col[i:i+2],16)/255 for i in (1,3,5)]
    o.append(f'<filter id="n{k}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="{f} {f*1.6:.4f}" numOctaves="{oc}" seed="{seed}"/><feColorMatrix type="matrix" values="0 0 0 0 {r:.3f}  0 0 0 0 {g:.3f}  0 0 0 0 {b:.3f}  0 0 0 2.6 -1.05"/></filter>')
    o.append(f'<radialGradient id="mg{k}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>')
    o.append(f'<mask id="m{k}"><rect width="{W}" height="{H}" fill="#000"/>'+"".join(f'<ellipse cx="{x*W}" cy="{y*H}" rx="{rr*W}" ry="{rr*W*0.6}" fill="url(#mg{k})"/>' for x,y,rr in spots)+'</mask>')
o.append('''<radialGradient id="planet" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#4a3cc8"/><stop offset="0.55" stop-color="#6a5cf0"/><stop offset="0.82" stop-color="#9aa8ff"/><stop offset="0.95" stop-color="#d8e4ff"/><stop offset="1" stop-color="#f4f8ff"/></radialGradient>
<radialGradient id="small" cx="0.38" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="0.3" stop-color="#c8d0ff"/><stop offset="0.8" stop-color="#5a3fd8"/><stop offset="1" stop-color="#3a2296"/></radialGradient>
<radialGradient id="atmo"><stop offset="0.55" stop-color="#b8c4ff" stop-opacity="0.9"/><stop offset="0.78" stop-color="#7a6cff" stop-opacity="0.4"/><stop offset="1" stop-color="#7a6cff" stop-opacity="0"/></radialGradient>
<radialGradient id="horizon" cx="0.5" cy="0" r="0.6"><stop offset="0" stop-color="#3a3cc8"/><stop offset="0.05" stop-color="#1e2a8a"/><stop offset="0.25" stop-color="#0c1250"/><stop offset="1" stop-color="#05072a"/></radialGradient>
<radialGradient id="flare"><stop offset="0" stop-color="#ffffff"/><stop offset="0.2" stop-color="#ffc8ff" stop-opacity="0.8"/><stop offset="0.55" stop-color="#c050ff" stop-opacity="0.3"/><stop offset="1" stop-color="#8b4cff" stop-opacity="0"/></radialGradient>
</defs>''')
o.append(f'<rect width="{W}" height="{H}" fill="url(#base)"/>')
for k in range(len(layers)):
    o.append(f'<rect width="{W}" height="{H}" filter="url(#n{k})" mask="url(#m{k})"/>')
# soft colour where the nebulae sit
for x,y,rx,ry,c,op in [(0.10,0.0,0.22,0.07,"#5b2fd0",0.4),(0.70,0.02,0.18,0.07,"#4a3cff",0.38),(0.90,0.03,0.1,0.06,"#8a3cff",0.4),
                       (1.05,0.45,0.07,0.4,"#c040ff",0.6),(-0.05,0.5,0.07,0.3,"#3a4cff",0.3),
                       (0.08,0.92,0.08,0.06,"#a03cff",0.5),(0.92,0.92,0.1,0.07,"#2a6cff",0.45),(0.5,1.0,0.35,0.06,"#5a3cff",0.6)]:
    o.append(f'<ellipse cx="{x*W}" cy="{y*H}" rx="{rx*W}" ry="{ry*H}" fill="{c}" opacity="{op}" filter="url(#b60)"/>')
for i in range(1700):
    x,y=random.uniform(0,W),random.uniform(0,H); r=random.choice([0.4,0.5,0.6,0.7,0.8,1.0]); op=random.uniform(0.15,0.75)
    c=random.choice(["#ffffff","#ffffff","#d6e4ff","#e9dcff","#a9e6ff"])
    o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{c}" opacity="{op:.2f}"/>')
for i in range(30):
    x=random.uniform(0,W); y=random.choice([random.uniform(0,H*0.09),random.uniform(H*0.86,H),random.uniform(0,H)])
    r=random.uniform(1.0,2.0); L=r*random.uniform(4,8); c=random.choice(["#ffffff","#cfe0ff","#f0c8ff","#a8f0ff"])
    o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r*4:.1f}" fill="{c}" opacity="0.4" filter="url(#b6)"/>')
    o.append(f'<path d="M{x-L:.1f} {y:.1f}H{x+L:.1f}M{x:.1f} {y-L:.1f}V{y+L:.1f}" stroke="{c}" stroke-width="0.8" opacity="0.7"/>')
    o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#fff"/>')
# a starburst in the sidebar's lower corner and one in the right column's
for x,y,c in [(0.12,0.86,"#ff6cf0"),(0.96,0.80,"#6cc8ff")]:
    x,y=x*W,y*H
    o.append(f'<circle cx="{x}" cy="{y}" r="60" fill="{c}" opacity="0.35" filter="url(#b30)"/>')
    for a in range(0,180,30):
        L=random.uniform(40,90); dx,dy=L*math.cos(math.radians(a)),L*math.sin(math.radians(a))
        o.append(f'<path d="M{x-dx:.1f} {y-dy:.1f}L{x+dx:.1f} {y+dy:.1f}" stroke="{c}" stroke-width="1" opacity="0.5" filter="url(#b3)"/>')
    o.append(f'<circle cx="{x}" cy="{y}" r="5" fill="#fff" filter="url(#b3)"/>')
# the ringed planet over the title bar
px,py,pr=1768,92,58; ring=f'transform="rotate(-22 {px} {py})"'
o.append(f'<circle cx="{px}" cy="{py}" r="{pr*3.2}" fill="#6a5cff" opacity="0.45" filter="url(#b60)"/>')
o.append(f'<circle cx="{px}" cy="{py}" r="{pr*1.5}" fill="url(#atmo)" filter="url(#b14)"/>')
for a in (-22,):
    o.append(f'<ellipse cx="{px}" cy="{py}" rx="{pr*4.5}" ry="1.5" fill="#dfe8ff" opacity="0.5" filter="url(#b3)" transform="rotate({a} {px} {py})"/>')
for k,(rx,ry,sw,op,c) in enumerate([(3.2,0.55,1.2,0.5,"#8fb0ff"),(2.6,0.48,2.2,0.9,"#e0e8ff"),(2.25,0.40,1.2,0.7,"#b9a4ff"),(1.9,0.34,0.8,0.5,"#7cf0ff")]):
    o.append(f'<ellipse cx="{px}" cy="{py}" rx="{pr*rx}" ry="{pr*ry}" fill="none" stroke="{c}" stroke-width="{sw*5}" opacity="{op*0.4}" filter="url(#b6)" {ring}/>')
    o.append(f'<ellipse cx="{px}" cy="{py}" rx="{pr*rx}" ry="{pr*ry}" fill="none" stroke="{c}" stroke-width="{sw}" opacity="{op}" {ring}/>')
o.append(f'<circle cx="{px}" cy="{py}" r="{pr}" fill="url(#planet)"/>')
o.append(f'<circle cx="{px}" cy="{py}" r="{pr}" fill="none" stroke="#e8e4ff" stroke-width="2" opacity="0.8"/>')
o.append(f'<ellipse cx="{px-pr*0.35}" cy="{py-pr*0.4}" rx="{pr*0.4}" ry="{pr*0.25}" fill="#ffffff" opacity="0.55" filter="url(#b6)"/>')
o.append(f'<circle cx="{px}" cy="{py}" r="{pr*1.02}" fill="none" stroke="#b8d0ff" stroke-width="6" opacity="0.8" filter="url(#b6)"/>')
o.append(f'<path d="M{px-pr*2.6} {py} A{pr*2.6} {pr*0.48} 0 0 0 {px+pr*2.6} {py}" fill="none" stroke="#ffffff" stroke-width="3" {ring}/>')
def swirl(d,c,w,op):
    o.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w*6}" opacity="{op*0.45}" filter="url(#b14)"/>')
    o.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" opacity="{op}" stroke-linecap="round"/>')
swirl(f"M{W*0.52} {H*0.07} C{W*0.6} {H*0.03} {W*0.64} {H*0.09} {W*0.72} {H*0.03} S{W*0.8} {H*0.0} {W*0.86} {H*0.02}","#9b7bff",1.2,0.7)
swirl(f"M{W*0.56} {H*0.085} C{W*0.62} {H*0.06} {W*0.66} {H*0.075} {W*0.7} {H*0.06}","#5fd9ff",1,0.6)
swirl(f"M{W*0.74} {H*0.86} C{W*0.80} {H*0.83} {W*0.86} {H*0.89} {W*0.92} {H*0.84} S{W*0.98} {H*0.82} {W*1.02} {H*0.85}","#c58bff",1.5,0.8)
swirl(f"M{W*0.76} {H*0.875} C{W*0.83} {H*0.85} {W*0.88} {H*0.9} {W*0.95} {H*0.86}","#5fd9ff",1.2,0.7)
# the giant planet rising behind the status bar
R=1500; cx=W*0.48; top=H*0.938; cy=top+R
o.append(f'<ellipse cx="{cx}" cy="{top+20}" rx="{W*0.38}" ry="90" fill="#6a4cff" opacity="0.6" filter="url(#b60)"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R+14}" fill="none" stroke="#8a7cff" stroke-width="30" opacity="0.65" filter="url(#b30)"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="url(#horizon)"/>')
for k,(rx,ry,op) in enumerate([(0.5,0.035,0.5),(0.38,0.028,0.45),(0.26,0.02,0.4)]):
    o.append(f'<ellipse cx="{cx}" cy="{top+60+k*12}" rx="{W*rx}" ry="{H*ry}" fill="none" stroke="#6c8cff" stroke-width="1.2" opacity="{op}"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#9fc0ff" stroke-width="8" opacity="0.9" filter="url(#b6)"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#eef4ff" stroke-width="2.2"/>')
o.append(f'<ellipse cx="{cx}" cy="{top}" rx="420" ry="70" fill="url(#flare)" filter="url(#b14)"/>')
o.append(f'<ellipse cx="{cx}" cy="{top}" rx="1100" ry="6" fill="#e8deff" opacity="0.55" filter="url(#b6)"/>')
o.append(f'<circle cx="{cx}" cy="{top}" r="26" fill="#ffffff" opacity="0.95" filter="url(#b14)"/>')
o.append('</svg>')
print("\n".join(o))

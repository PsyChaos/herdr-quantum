# Generates mods/quantum/space.jpg (via rsvg-convert): python3 art/nebula.py > nebula.svg
import random
random.seed(42)
W,H=2560,1440
o=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
o.append('''<defs>
<linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080a2a"/><stop offset=".55" stop-color="#0b0a33"/><stop offset="1" stop-color="#120a3e"/></linearGradient>
<filter id="b6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="b14" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="b30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="b70" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>''')
layers=[("#7b3cff",0.0018,5,3,[(0.18,0.12,0.42),(0.55,0.35,0.35)]),
        ("#2f6bff",0.0022,5,8,[(0.08,0.75,0.45),(0.85,0.18,0.35)]),
        ("#d23cff",0.0026,4,17,[(0.95,0.55,0.32),(0.72,0.08,0.22)]),
        ("#2fd0ff",0.0030,4,23,[(0.03,0.45,0.25),(0.78,0.9,0.2)])]
for k,(col,f,oc,seed,spots) in enumerate(layers):
    r,g,b=[int(col[i:i+2],16)/255 for i in (1,3,5)]
    o.append(f'<filter id="n{k}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="{f} {f*1.4:.4f}" numOctaves="{oc}" seed="{seed}"/><feColorMatrix type="matrix" values="0 0 0 0 {r:.3f}  0 0 0 0 {g:.3f}  0 0 0 0 {b:.3f}  0 0 0 2.2 -0.95"/></filter>')
    o.append(f'<radialGradient id="mg{k}"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>')
    o.append(f'<mask id="m{k}"><rect width="{W}" height="{H}" fill="#000"/>'+"".join(f'<ellipse cx="{x*W}" cy="{y*H}" rx="{rr*W}" ry="{rr*W*0.7}" fill="url(#mg{k})"/>' for x,y,rr in spots)+'</mask>')
o.append('''<radialGradient id="planet" cx="0.36" cy="0.32" r="0.75"><stop offset="0" stop-color="#ffffff"/><stop offset="0.18" stop-color="#d9e8ff"/><stop offset="0.45" stop-color="#8aa6ff"/><stop offset="0.75" stop-color="#5a3fd8"/><stop offset="1" stop-color="#2a1676"/></radialGradient>
<radialGradient id="atmo"><stop offset="0.6" stop-color="#9fc0ff" stop-opacity="0.9"/><stop offset="0.8" stop-color="#7a6cff" stop-opacity="0.35"/><stop offset="1" stop-color="#7a6cff" stop-opacity="0"/></radialGradient>
<radialGradient id="horizon" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#2c2080"/><stop offset="0.12" stop-color="#160f50"/><stop offset="1" stop-color="#070726"/></radialGradient>
<radialGradient id="flare"><stop offset="0" stop-color="#ffffff"/><stop offset="0.2" stop-color="#d8ccff" stop-opacity="0.7"/><stop offset="0.6" stop-color="#8b6cff" stop-opacity="0.2"/><stop offset="1" stop-color="#8b6cff" stop-opacity="0"/></radialGradient>
</defs>''')
o.append(f'<rect width="{W}" height="{H}" fill="url(#base)"/>')
for k in range(len(layers)):
    o.append(f'<rect width="{W}" height="{H}" filter="url(#n{k})" mask="url(#m{k})" opacity="0.95"/>')
for x,y,rx,ry,c,op in [(0.2,0.1,0.35,0.25,"#5b2fd0",0.35),(0.82,0.25,0.3,0.3,"#3a5cff",0.3),(0.95,0.6,0.2,0.3,"#c040ff",0.25),(0.05,0.8,0.25,0.25,"#2a8cff",0.25),(0.5,0.95,0.5,0.2,"#6a3cff",0.35)]:
    o.append(f'<ellipse cx="{x*W}" cy="{y*H}" rx="{rx*W}" ry="{ry*H}" fill="{c}" opacity="{op}" filter="url(#b70)"/>')
for i in range(1800):
    x,y=random.uniform(0,W),random.uniform(0,H); r=random.choice([0.4,0.5,0.6,0.7,0.8,1,1.2]); op=random.uniform(0.25,0.95)
    c=random.choice(["#ffffff","#ffffff","#d6e4ff","#e9dcff","#a9e6ff"])
    o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{c}" opacity="{op:.2f}"/>')
for i in range(26):
    x,y=random.uniform(0,W),random.uniform(0,H*0.85); r=random.uniform(1.2,2.2); L=r*random.uniform(4,7)
    c=random.choice(["#ffffff","#cfe0ff","#e6d4ff"])
    o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r*4:.1f}" fill="{c}" opacity="0.35" filter="url(#b6)"/>')
    o.append(f'<path d="M{x-L:.1f} {y:.1f}H{x+L:.1f}M{x:.1f} {y-L:.1f}V{y+L:.1f}" stroke="{c}" stroke-width="0.8" opacity="0.6"/>')
    o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="#fff"/>')
px,py,pr=1770,95,108; ring=f'transform="rotate(-16 {px} {py})"'
o.append(f'<circle cx="{px}" cy="{py}" r="{pr*2.8}" fill="#7f8cff" opacity="0.4" filter="url(#b70)"/>')
o.append(f'<circle cx="{px}" cy="{py}" r="{pr*1.35}" fill="url(#atmo)" filter="url(#b14)"/>')
o.append(f'<ellipse cx="{px}" cy="{py}" rx="{pr*2.25}" ry="{pr*0.5}" fill="none" stroke="#b9d0ff" stroke-width="10" opacity="0.45" filter="url(#b6)" {ring}/>')
o.append(f'<ellipse cx="{px}" cy="{py}" rx="{pr*2.25}" ry="{pr*0.5}" fill="none" stroke="#dfe9ff" stroke-width="2.5" opacity="0.8" {ring}/>')
o.append(f'<ellipse cx="{px}" cy="{py}" rx="{pr*1.95}" ry="{pr*0.42}" fill="none" stroke="#a48bff" stroke-width="1.5" opacity="0.6" {ring}/>')
o.append(f'<circle cx="{px}" cy="{py}" r="{pr}" fill="url(#planet)"/>')
o.append(f'<circle cx="{px-pr*0.35}" cy="{py-pr*0.35}" r="{pr*0.45}" fill="#ffffff" opacity="0.55" filter="url(#b30)"/>')
o.append(f'<path d="M{px-pr*2.25} {py} A{pr*2.25} {pr*0.5} 0 0 0 {px+pr*2.25} {py}" fill="none" stroke="#ffffff" stroke-width="10" opacity="0.4" filter="url(#b6)" {ring}/>')
o.append(f'<path d="M{px-pr*2.25} {py} A{pr*2.25} {pr*0.5} 0 0 0 {px+pr*2.25} {py}" fill="none" stroke="#eef4ff" stroke-width="3" {ring}/>')
o.append(f'<circle cx="{W*0.06}" cy="{H*0.9}" r="26" fill="#6b5cff" opacity="0.5" filter="url(#b14)"/><circle cx="{W*0.06}" cy="{H*0.9}" r="12" fill="url(#planet)"/>')
def swirl(d,c,w,op):
    o.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w*5}" opacity="{op*0.5}" filter="url(#b14)"/>')
    o.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" opacity="{op}" stroke-linecap="round"/>')
swirl(f"M{W*0.74} {H*0.80} C{W*0.80} {H*0.74} {W*0.86} {H*0.86} {W*0.93} {H*0.76} S{W*1.02} {H*0.74} {W*1.05} {H*0.80}","#c58bff",2,0.8)
swirl(f"M{W*0.76} {H*0.82} C{W*0.83} {H*0.78} {W*0.88} {H*0.89} {W*0.95} {H*0.80}","#5fd9ff",1.5,0.7)
swirl(f"M-20 {H*0.62} C{W*0.06} {H*0.55} {W*0.1} {H*0.7} {W*0.18} {H*0.6}","#8b6cff",1.5,0.55)
R=2600; cx=W/2; top=H*0.905; cy=top+R
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R+60}" fill="#7b5cff" opacity="0.55" filter="url(#b70)"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R+18}" fill="none" stroke="#b49cff" stroke-width="40" opacity="0.6" filter="url(#b30)"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="url(#horizon)"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#d9ccff" stroke-width="10" opacity="0.85" filter="url(#b6)"/>')
o.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#ffffff" stroke-width="2.5"/>')
o.append(f'<ellipse cx="{cx}" cy="{top}" rx="560" ry="60" fill="url(#flare)" filter="url(#b14)"/>')
o.append(f'<ellipse cx="{cx}" cy="{top}" rx="1200" ry="8" fill="#e8deff" opacity="0.5" filter="url(#b6)"/>')
o.append(f'<circle cx="{cx}" cy="{top}" r="36" fill="#ffffff" opacity="0.9" filter="url(#b14)"/>')
o.append('</svg>')
print("\n".join(o))

/* Uppdrátturinn — kort af jörðinni í gömlum handritastíl, teiknað eftir loftmyndinni */
(function () {
  const D = window.RATLEIKUR;
  const NS = 'http://www.w3.org/2000/svg';

  const PLOT = [[1643, 85], [1855, 615], [437, 1068], [287, 527]];
  const TUN = [[1125, 290], [1598, 143], [1693, 368], [1100, 553], [1083, 470]];
  const ROAD = [[1600, -40], [1640, 80], [1700, 230], [1790, 450], [1855, 600], [1950, 780], [2080, 1000], [2180, 1200]];
  const DRIVE = [[1640, 113], [1350, 200], [1075, 291], [1060, 302], [1063, 340], [1068, 357], [1073, 368]];
  const STREAM = [[470, 790], [492, 830], [530, 860], [575, 885], [604, 925], [612, 962], [640, 985], [655, 1010], [650, 1075]];
  const HOUSE = [[1060, 385], [1091, 375.5], [1100.6, 406.8], [1088.8, 410.5], [1085.6, 401.4], [1066.5, 407]];
  const GUEST = [[1039.4, 362.4], [1048.8, 359.3], [1052.9, 373], [1043.4, 375.5]];
  const BOGI = [[1050, 434], [1072, 428], [1097, 419], [1116, 408], [1127, 399]];

  const OVERVIEW = { x: 250, y: 40, w: 1690, h: 1080 };
  const HOUSE_BOX = { cx: 1078, cy: 395, w: 170 };
  const INK = '#2a1a0c', RED = '#9b2a1a', BLUE = '#2c5a8a', GREEN = '#3f5e2a';

  const pts = a => a.map(p => p.join(',')).join(' ');
  const pathSmooth = a => {
    let d = `M${a[0][0]},${a[0][1]}`;
    for (let i = 1; i < a.length - 1; i++) {
      const mx = (a[i][0] + a[i + 1][0]) / 2, my = (a[i][1] + a[i + 1][1]) / 2;
      d += ` Q${a[i][0]},${a[i][1]} ${mx},${my}`;
    }
    const l = a[a.length - 1];
    return d + ` L${l[0]},${l[1]}`;
  };
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function inside(p, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (((yi > p[1]) !== (yj > p[1])) && (p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }

  // lítil tré eins og á gömlum kortum
  function tree(x, y, s) {
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${s.toFixed(2)})">
      <ellipse cx="2.5" cy="1" rx="6" ry="2" fill="${INK}" opacity=".18"/>
      <line x1="0" y1="0" x2="0" y2="-5" stroke="${INK}" stroke-width="1.2"/>
      <path d="M0,-17 C6,-16 7,-10 5,-7 C7,-4 3,-2 0,-3 C-3,-2 -7,-4 -5,-7 C-7,-10 -6,-16 0,-17Z" fill="${GREEN}" fill-opacity=".55" stroke="${INK}" stroke-width="1"/>
      <path d="M1,-14 C3,-12 3,-9 2,-7" fill="none" stroke="${INK}" stroke-width=".7" opacity=".7"/></g>`;
  }
  function trees() {
    seed = 11; let s = '';
    const areas = [
      { cx: 490, cy: 545, rx: 140, ry: 65, n: 40 },
      { cx: 345, cy: 700, rx: 45, ry: 150, n: 22 },
      { cx: 450, cy: 930, rx: 35, ry: 100, n: 12 },
      { cx: 610, cy: 600, rx: 60, ry: 30, n: 8 }
    ];
    const list = [];
    areas.forEach(a => {
      for (let i = 0; i < a.n; i++) {
        const ang = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
        const x = a.cx + Math.cos(ang) * a.rx * r, y = a.cy + Math.sin(ang) * a.ry * r;
        if (inside([x, y], PLOT)) list.push([x, y, 1.1 + rnd() * .7]);
      }
    });
    list.sort((a, b) => a[1] - b[1]).forEach(([x, y, sc]) => s += tree(x, y, sc));
    return s;
  }
  // mýrartoppar
  function tufts() {
    seed = 3; let s = '';
    for (let i = 0; i < 220; i++) {
      const x = 290 + rnd() * 780, y = 430 + rnd() * 640;
      if (!inside([x, y], PLOT) || inside([x, y], TUN)) continue;
      if (Math.hypot(x - 490, y - 545) < 120) continue;
      s += `<path d="M${(x - 4).toFixed(0)},${y.toFixed(0)} l2,-6 M${x.toFixed(0)},${y.toFixed(0)} l0,-8 M${(x + 4).toFixed(0)},${y.toFixed(0)} l-2,-6 M${(x - 6).toFixed(0)},${y.toFixed(0)} h12" stroke="${INK}" stroke-width="1.1" fill="none" opacity=".45"/>`;
    }
    return s;
  }
  function steam() {
    let s = '';
    for (let i = 0; i < 3; i++) s += `<path class="steam" style="animation-delay:${i * 0.9}s" d="M${1057 + i * 2},408 q-2,-4 0,-8 q2,-4 0,-8" />`;
    return s;
  }

  function rose(x, y, r) {
    let pts16 = '';
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8 - Math.PI / 2, rr = i % 4 === 0 ? r : i % 2 === 0 ? r * .62 : r * .38;
      const a1 = a - Math.PI / 16, a2 = a + Math.PI / 16;
      pts16 += `<path d="M0,0 L${(Math.cos(a1) * r * .14).toFixed(1)},${(Math.sin(a1) * r * .14).toFixed(1)} L${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)} Z" fill="${i % 2 ? '#e9d7a8' : (i % 4 === 0 ? RED : INK)}" stroke="${INK}" stroke-width="1.2"/>`;
      pts16 += `<path d="M0,0 L${(Math.cos(a2) * r * .14).toFixed(1)},${(Math.sin(a2) * r * .14).toFixed(1)} L${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)} Z" fill="${i % 2 ? INK : '#e9d7a8'}" stroke="${INK}" stroke-width="1.2"/>`;
    }
    return `<g class="rose" transform="translate(${x},${y})">
      <circle r="${r * 1.05}" fill="none" stroke="${INK}" stroke-width="1.5"/><circle r="${r * .98}" fill="none" stroke="${INK}" stroke-width="4" stroke-dasharray="2 6" opacity=".6"/>
      ${pts16}<circle r="${r * .06}" fill="${RED}" stroke="${INK}"/>
      <path d="M0,${-r * 1.08} c-8,-14 -2,-26 0,-30 c2,4 8,16 0,30 M-12,${-r * 1.18} c6,2 18,2 24,0" fill="${RED}" stroke="${INK}" stroke-width="1.5"/>
      <text y="${r * 1.32}" class="rose-l">S</text><text x="${r * 1.25}" y="9" class="rose-l">A</text><text x="${-r * 1.25}" y="9" class="rose-l">V</text>
    </g>`;
  }

  function buildSVG(opts = {}) {
    const print = !!opts.print;
    const vb = opts.viewBox || OVERVIEW;
    return `
<svg xmlns="${NS}" class="mapsvg ${print ? 'printmap' : ''}" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <pattern id="furrow" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
      <line x1="0" y1="0" x2="0" y2="10" stroke="${INK}" stroke-width="1.1" opacity=".35"/>
    </pattern>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <line x1="0" y1="0" x2="0" y2="14" stroke="${INK}" stroke-width="1" opacity=".16"/>
    </pattern>
    <pattern id="xhatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="3" height="3" fill="#b5523b"/><line x1="0" y1="0" x2="0" y2="3" stroke="${INK}" stroke-width=".5" opacity=".5"/>
    </pattern>
    <filter id="holeBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45"/></filter>
    <mask id="fogMask"><rect x="-500" y="-500" width="3000" height="2200" fill="white"/><g class="fogholes"></g></mask>
    <clipPath id="plotClip"><polygon points="${pts(PLOT)}"/></clipPath>
    <clipPath id="trollClip"><circle cx="0" cy="0" r="62"/></clipPath>
  </defs>

  <!-- nágrannajarðir -->
  <rect x="-500" y="-500" width="3000" height="2200" fill="url(#hatch)"/>

  <!-- vegurinn (bannsvæði) -->
  <path d="${pathSmooth(ROAD)}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" opacity=".85"/>
  <path d="${pathSmooth(ROAD)}" fill="none" stroke="#e6d3a4" stroke-width="17" stroke-linecap="round"/>
  <path d="${pathSmooth(ROAD)}" fill="none" stroke="${RED}" stroke-width="2.5" stroke-dasharray="14 10"/>

  <!-- jörðin -->
  <polygon points="${pts(PLOT)}" fill="#f1e2b8" fill-opacity=".55"/>
  <g clip-path="url(#plotClip)">
    <polygon points="${pts(TUN)}" fill="url(#furrow)"/>
    <polygon points="${pts(TUN)}" fill="none" stroke="${INK}" stroke-width="1.4" stroke-dasharray="1 4" opacity=".6"/>
    ${tufts()}
    <path d="${pathSmooth(BOGI)}" fill="none" stroke="${GREEN}" stroke-width="6" stroke-linecap="round" opacity=".35"/>
    ${trees()}
    <!-- rústin (steinahrúga) -->
    <g><ellipse cx="1123" cy="577" rx="6.5" ry="4.5" fill="#d9c79a" stroke="${INK}" stroke-width="1.6"/><ellipse cx="1116" cy="587" rx="7" ry="5" fill="#d9c79a" stroke="${INK}" stroke-width="1.6"/><ellipse cx="1130" cy="587" rx="7.5" ry="5" fill="#d9c79a" stroke="${INK}" stroke-width="1.6"/><ellipse cx="1137" cy="595" rx="6.5" ry="4.5" fill="#d9c79a" stroke="${INK}" stroke-width="1.6"/><ellipse cx="1110" cy="596" rx="7" ry="5" fill="#d9c79a" stroke="${INK}" stroke-width="1.6"/><ellipse cx="1124" cy="598" rx="8" ry="5.5" fill="#d9c79a" stroke="${INK}" stroke-width="1.6"/></g>
  </g>
  <!-- landamerki -->
  <polygon class="plotline" points="${pts(PLOT)}" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="22 8 4 8" stroke-linejoin="round"/>
  <polygon points="${pts(PLOT)}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round" transform="translate(0,0)"/>

  <!-- heimreið og hús -->
  <polyline points="${pts(DRIVE)}" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="${pts(DRIVE)}" fill="none" stroke="#efe0b6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  ${tree(1042, 414, .38)}${tree(1048, 419, .42)}${tree(1040, 422, .36)}${tree(1050, 426, .32)}${tree(1044, 428, .34)}
  <polygon points="${pts(HOUSE)}" fill="url(#xhatch)" stroke="${INK}" stroke-width="1"/>
  <polygon points="${pts(GUEST)}" fill="url(#xhatch)" stroke="${INK}" stroke-width="1"/>
  <rect class="win" x="1068" y="398" width="4" height="3" fill="#ffcf6b" transform="rotate(-17 1070 399)"/>
  <rect class="win" x="1080" y="394" width="4" height="3" fill="#ffcf6b" transform="rotate(-17 1082 395)" style="animation-delay:1.3s"/>
  <circle cx="1059" cy="410.5" r="3" fill="#8fb6d8" stroke="${INK}" stroke-width=".8"/>
  ${steam()}
  <!-- álfahúsið -->
  <g transform="translate(937,351)"><path d="M-3,0 v-3.5 l3,-3 l3,3 v3.5 z" fill="#e8d6a6" stroke="${INK}" stroke-width=".7"/><path d="M-3.6,-3.2 l3.6,-3.8 l3.6,3.8" fill="none" stroke="${RED}" stroke-width="1.1"/><rect x="-.7" y="-1.8" width="1.4" height="1.8" fill="${INK}"/></g>
  <!-- útsýnispallurinn -->
  <g transform="translate(958,326)"><rect x="-4" y="-4" width="8" height="8" fill="#e8d6a6" stroke="${INK}" stroke-width=".9"/><path d="M-4,-4 l8,8 M4,-4 l-8,8" stroke="${INK}" stroke-width=".5"/><path d="M4,1 h4 M4,3 h4 M8,-1 v6" stroke="${INK}" stroke-width=".5"/></g>

  <!-- örnefni -->
  <g class="labels-big">
    <text x="1395" y="300" class="lbl">T ú n i ð</text>
    <text x="800" y="640" class="lbl lbl-estate" transform="rotate(-18 800 640)">S T I L L A</text>
    <text x="500" y="455" class="lbl">K j a r r i ð</text>
    <text x="700" y="860" class="lbl lbl-sm">Móarnir</text>
    <text x="1122" y="645" class="lbl lbl-sm">Rústin</text>
    <text x="1190" y="452" class="lbl lbl-sm">Húsin</text>
    <text x="900" y="300" class="lbl lbl-xs">Álfahús · Pallur</text>
    <text x="1895" y="440" class="lbl lbl-road" transform="rotate(64 1895 440)">ÞJÓÐVEGUR · BANNAÐ</text>
  </g>
  <g class="labels-small">
    <text x="1084" y="381" class="lbls">Aðalhúsið</text>
    <text x="1030" y="356" class="lbls">Gestahúsið</text>
    <text x="1061" y="419" class="lbls lbls-pot">Potturinn</text>
    <text x="1030" y="434" class="lbls">Trén</text>
  </g>
  <g class="labels-mid">
    <text x="937" y="362" class="lblm">Álfahúsið</text>
    <text x="958" y="317" class="lblm">Útsýnispallurinn</text>
  </g>

  <!-- hér eru tröll -->
  <g class="trolls" transform="translate(${print ? '820,1040' : '470,250'})">
    <circle r="66" fill="#e9d7a8" stroke="${INK}" stroke-width="2"/>
    <image href="img/troll.webp?v=1794571856" x="-62" y="-75" width="124" height="166" clip-path="url(#trollClip)" preserveAspectRatio="xMidYMid slice" style="filter:sepia(.85) contrast(1.1) brightness(.95)"/>
    <circle r="62" fill="none" stroke="${INK}" stroke-width="1.2"/>
    <text y="98" class="lbl lbl-sm hic">Hér eru tröll</text>
  </g>

  ${rose(1810, 190, 70)}

  ${print ? `
  <g class="cartouche" transform="translate(1440,960)">
    <path d="M-330,-80 h660 c20,0 30,20 20,40 c-10,20 -10,40 0,60 c10,20 0,40 -20,40 h-660 c-20,0 -30,-20 -20,-40 c10,-20 10,-40 0,-60 c-10,-20 0,-40 20,-40z" fill="#efdfb4" stroke="${INK}" stroke-width="2.5"/>
    <path d="M-318,-68 h636 M-318,48 h636" stroke="${RED}" stroke-width="1.5"/>
    <text y="-22" class="cart-t">Uppdráttur af Stillu</text>
    <text y="26" class="cart-s">þar sem Ketill hængur gróf silfur sitt</text>
  </g>
  <g transform="translate(940,1105)"><rect width="200" height="9" fill="none" stroke="${INK}" stroke-width="1.5"/><rect width="50" height="9" fill="${INK}"/><rect x="100" width="50" height="9" fill="${INK}"/>
    <text x="100" y="-8" class="scale-t">um 100 metrar · 150 barnaskref</text></g>
  ` : ''}

  ${print || opts.nofog ? '' : `<rect class="fog" x="-500" y="-500" width="3000" height="2200" fill="#e4d2a3" mask="url(#fogMask)"/>`}
  <g class="route"></g>
  <g class="markers"></g>
</svg>`;
  }

  function create(el) {
    el.innerHTML = buildSVG();
    const svg = el.querySelector('svg');
    const markers = svg.querySelector('.markers'), route = svg.querySelector('.route'), holes = svg.querySelector('.fogholes');
    let vb = { ...OVERVIEW }, anim = null;
    const aspect = () => { const r = el.getBoundingClientRect(); return r.width && r.height ? r.width / r.height : 1.5; };
    const setVB = b => { vb = b; svg.setAttribute('viewBox', `${b.x} ${b.y} ${b.w} ${b.h}`); };

    function boxFor(keys) {
      const ps = keys.map(k => D.places[k]).filter(Boolean);
      const xs = ps.map(p => p.x), ys = ps.map(p => p.y);
      const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
      const a = aspect();
      const near = ps.every(p => Math.abs(p.x - HOUSE_BOX.cx) < 80 && Math.abs(p.y - HOUSE_BOX.cy) < 60);
      let cx = (minx + maxx) / 2, cy = (miny + maxy) / 2, w;
      if (near) { w = HOUSE_BOX.w; cx = HOUSE_BOX.cx; cy = HOUSE_BOX.cy + 4; }
      else w = Math.max((maxx - minx) * 1.5 + 120, (maxy - miny) * 1.5 * a + 120, 300);
      const h = w / a;
      return { x: cx - w / 2, y: cy - h / 2, w, h, near, mid: !near && w < 700 };
    }
    function flyTo(t, ms = 1400) {
      cancelAnimationFrame(anim);
      const from = { ...vb }, t0 = performance.now();
      el.classList.toggle('zoom-house', !!t.near); el.classList.toggle('zoom-mid', !!t.mid);
      const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      const step = now => {
        const k = Math.min(1, (now - t0) / ms), e = ease(k);
        setVB({ x: from.x + (t.x - from.x) * e, y: from.y + (t.y - from.y) * e, w: from.w + (t.w - from.w) * e, h: from.h + (t.h - from.h) * e });
        if (k < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }
    function overview() {
      const a = aspect(); let w = OVERVIEW.w, h = w / a;
      if (h < OVERVIEW.h) { h = OVERVIEW.h; w = h * a; }
      flyTo({ x: 1095 - w / 2, y: 580 - h / 2, w, h });
    }
    function markerSVG(p, cls, label, sc) {
      if (cls === 'done') return `<g class="mk done" transform="translate(${p.x},${p.y}) scale(${sc})"><circle r="9" class="mk-d"/><path d="M-4,0 l3,4 l6,-8" class="mk-tick"/></g>`;
      return `<g class="mk target" transform="translate(${p.x},${p.y}) scale(${sc})">
        <circle class="mk-ring r1" r="16"/><circle class="mk-ring r2" r="16"/>
        <path class="mk-x" d="M-11,-11 L11,11 M11,-11 L-11,11"/>
        ${label ? `<text class="mk-lbl" y="-20">${label}</text>` : ''}</g>`;
    }
    function render(state, opts = {}) {
      const keys = [...new Set([...(state.done || []), state.target, state.prev].filter(Boolean))];
      const box = boxFor([state.target, state.prev].filter(Boolean));
      const sc = box.near ? 0.3 : box.w / 520;
      holes.innerHTML = keys.map(k => { const p = D.places[k]; return `<circle cx="${p.x}" cy="${p.y}" r="${k === state.target ? 170 : 130}" fill="black" filter="url(#holeBlur)"/>`; }).join('')
        + `<circle cx="1050" cy="380" r="150" fill="black" filter="url(#holeBlur)"/>`;
      route.innerHTML = '';
      if (state.prev && state.target && state.prev !== state.target) {
        const a = D.places[state.prev], b = D.places[state.target];
        const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.15, my = (a.y + b.y) / 2 - (b.x - a.x) * 0.15;
        const sw = box.near ? 1.2 : 3.5 * sc;
        route.innerHTML = `<path class="routepath" d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}" style="stroke-width:${sw}px;stroke-dasharray:${sw * 3} ${sw * 2.5}"/>`;
      }
      markers.innerHTML = (state.done || []).filter(k => k !== state.target).map(k => markerSVG(D.places[k], 'done', '', sc)).join('')
        + (state.target ? markerSVG(D.places[state.target], 'target', ['baeli', 'hringur'].includes(state.target) ? D.places[state.target].label : '', sc) : '');
      if (opts.overview) overview(); else flyTo(box, opts.instant ? 1 : 1500);
    }
    return { render, overview };
  }

  window.GaldraKort = { create, buildSVG, OVERVIEW };
})();

/* Símaleikir — litlir leikir sem nota snertiskjá, hreyfiskynjara og hljóð */
(function () {
  const G = {};
  const $ = (s, el) => el.querySelector(s);

  /* ============ 1. LJÓSGEISLINN — lýstu með fingrinum og finndu verurnar í myrkrinu ============ */
  G.flashlight = function (el, o, win) {
    const n = o.count || 4, emoji = o.emoji || '🧝', label = o.label || 'álfa';
    el.innerHTML = `<div class="g-flash"><div class="gf-scene" style="background-image:url(${o.bg || 'img/hero-base.webp'})"></div>
      <div class="gf-things"></div><canvas></canvas><div class="gf-count">${o.countLabel || 'Fundnir'}: <b>0</b> af ${n}</div><div class="gf-tip">Dragðu fingurinn um myrkrið 🔦</div></div>`;
    const box = $('.g-flash', el), cv = $('canvas', el), ctx = cv.getContext('2d'), things = $('.gf-things', el), cnt = $('.gf-count b', el);
    let W, H, px = -999, py = -999, found = 0, alive = true, pts = [];
    function size() { const r = box.getBoundingClientRect(); W = cv.width = r.width; H = cv.height = r.height; }
    size();
    // dreifa verunum þannig að þær séu ekki ofan á hver annarri
    for (let i = 0; i < n; i++) {
      let x, y, tries = 0;
      do { x = .1 + Math.random() * .8; y = .15 + Math.random() * .72; tries++; } while (tries < 50 && pts.some(p => Math.hypot(p.x - x, p.y - y) < .22));
      const s = document.createElement('span'); s.className = 'gf-thing'; s.textContent = emoji;
      s.style.left = (x * 100) + '%'; s.style.top = (y * 100) + '%'; s.style.transform = `translate(-50%,-50%) rotate(${(Math.random() - .5) * 30}deg)`;
      things.appendChild(s); pts.push({ x, y, el: s, got: false });
    }
    function draw() {
      if (!alive) return;
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(4,6,14,.965)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'destination-out';
      const r = Math.min(W, H) * .2, t = performance.now();
      const g = ctx.createRadialGradient(px, py, r * .2, px, py, r * (1 + .04 * Math.sin(t / 90)));
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.7, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r * 1.1, 0, 7); ctx.fill();
      pts.filter(p => p.got).forEach(p => { const gg = ctx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, 34); gg.addColorStop(0, 'rgba(0,0,0,1)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, 36, 0, 7); ctx.fill(); });
      requestAnimationFrame(draw);
    }
    draw();
    function pos(e) { const r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top - 30; }
    function check() {
      pts.forEach(p => {
        if (p.got) return;
        if (Math.hypot(p.x * W - px, p.y * H - py) < Math.min(W, H) * .09) {
          p.got = true; found++; cnt.textContent = found; p.el.classList.add('got');
          FX.sound.chime(); FX.vibrate(40);
          const r = cv.getBoundingClientRect(); FX.burst(r.left + p.x * W, r.top + p.y * H, ['#e9c56c', '#f7e8c4', '#7fbf6a'], { n: 30 });
          if (found === n) { alive = false; setTimeout(() => { box.classList.add('done'); win(); }, 700); }
        }
      });
    }
    cv.addEventListener('pointerdown', e => { FX.sound.unlock(); cv.setPointerCapture(e.pointerId); pos(e); check(); $('.gf-tip', el).style.opacity = 0; });
    cv.addEventListener('pointermove', e => { pos(e); check(); });
    cv.addEventListener('pointerup', () => { px = py = -999; });
    return () => { alive = false; };
  };

  /* ============ 2. HRISTU! — hristu símann til að lýsa á tröllið (eða pikkaðu hratt) ============ */
  G.shake = function (el, o, win) {
    el.innerHTML = `<div class="g-shake"><div class="gs-troll"><img src="img/troll.webp?v=1794676367" alt=""><div class="gs-flash"></div></div>
      <div class="gs-bar"><i></i></div><div class="gs-info">Þegar þið eruð komin alveg að Drumbi: hristið símann eins fast og þið getið til að blinda hann með töfraljósi!</div>
      <button class="btn big gs-go">💥 Byrja að hrista</button></div>`;
    const bar = $('.gs-bar i', el), img = $('.gs-troll img', el), fl = $('.gs-flash', el), info = $('.gs-info', el);
    let power = 0, done = false, last = null, alive = true;
    function add(v) {
      if (done) return;
      power = Math.min(100, power + v); bar.style.width = power + '%';
      img.style.filter = `grayscale(${power / 100}) brightness(${1 + power / 250}) sepia(${power / 300})`;
      fl.style.opacity = Math.min(.8, v / 12);
      setTimeout(() => fl.style.opacity = 0, 90);
      if (Math.random() < .3) FX.sound.ping(500 + power * 8);
      if (power >= 100) { done = true; FX.sound.boom(); FX.vibrate([100, 50, 300]); el.querySelector('.g-shake').classList.add('done'); info.textContent = 'Drumbur stirðnaði eins og steinn! Fljót, takið lykilinn!'; setTimeout(win, 900); }
    }
    function motion(e) {
      const a = e.accelerationIncludingGravity || e.acceleration; if (!a) return;
      if (last) { const d = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z); if (d > 14) add(Math.min(6, d / 9)); }
      last = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
    }
    $('.gs-go', el).addEventListener('click', async e => {
      FX.sound.unlock();
      try { if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') { const r = await DeviceMotionEvent.requestPermission(); if (r !== 'granted') throw 0; } } catch (err) { }
      addEventListener('devicemotion', motion);
      e.target.textContent = '👆 Eða pikkið hratt hér!'; e.target.classList.add('gs-tap');
      e.target.onclick = null;
      e.target.addEventListener('pointerdown', () => add(4));
    }, { once: true });
    return () => { alive = false; removeEventListener('devicemotion', motion); };
  };

  /* ============ 3. HJÓL KETILS — dulmálshjól (hliðrun) með íslenska stafrófinu ============ */
  G.ALPHA = ['A', 'Á', 'B', 'D', 'Ð', 'E', 'É', 'F', 'G', 'H', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'O', 'Ó', 'P', 'R', 'S', 'T', 'U', 'Ú', 'V', 'X', 'Y', 'Ý', 'Þ', 'Æ', 'Ö'];
  G.caesar = (text, k) => [...text.toUpperCase()].map(c => { const i = G.ALPHA.indexOf(c); return i < 0 ? c : G.ALPHA[(i + k + G.ALPHA.length) % G.ALPHA.length]; }).join('');
  G.wheel = function (el, o, win) {
    const A = G.ALPHA, N = A.length, R1 = 147, R2 = 107;
    const ring = (r, cls) => A.map((c, i) => { const a = i / N * 360; return `<text class="${cls}" transform="rotate(${a}) translate(0,${-r}) rotate(${-a > -180 ? 0 : 0})" text-anchor="middle" dy="6">${c}</text>`; }).join('');
    el.innerHTML = `<div class="g-wheel"><svg viewBox="-170 -170 340 340">
        <circle r="164" class="gw-o"/><circle r="128" class="gw-m"/><circle r="88" class="gw-i"/>
        <g class="gw-outer">${ring(R1, 'gw-l1')}</g>
        <g class="gw-inner">${ring(R2, 'gw-l2')}<text class="gw-mark" y="-62" text-anchor="middle">ᛝ</text></g>
        <path d="M0,-158 l-7,-10 h14z" class="gw-ptr"/>
        <text y="8" text-anchor="middle" class="gw-c">ᚲ</text></svg>
      <div class="gw-info">Snúið innri hringnum með fingrinum. Ytri hringurinn er rétti stafurinn og innri hringurinn er dulmálið.</div></div>`;
    const svg = $('svg', el), inner = $('.gw-inner', el), info = $('.gw-info', el);
    let rot = 0, drag = null, step = 0;
    const set = r => { rot = r; inner.setAttribute('transform', `rotate(${rot})`); const k = ((Math.round(-rot / (360 / N)) % N) + N) % N; if (k !== step) { step = k; FX.sound.tap(); FX.vibrate(5); } info.innerHTML = `Ytra <b>A</b> stendur yfir innra <b>${A[k]}</b>`; };
    const ang = e => { const r = svg.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    svg.addEventListener('pointerdown', e => { svg.setPointerCapture(e.pointerId); drag = { a: ang(e), r: rot }; });
    svg.addEventListener('pointermove', e => { if (drag) set(drag.r + ang(e) - drag.a); });
    svg.addEventListener('pointerup', () => { if (!drag) return; drag = null; const s = 360 / N; set(Math.round(rot / s) * s); });
    set(0);
    return () => { };
  };

  /* ============ 4. SÖNGUR RÚNASTEINSINS — endurtakið röðina (minnisleikur) ============ */
  G.simon = function (el, o, win) {
    const len = o.length || 5, runes = ['ᚠ', 'ᛝ', 'ᛟ', 'ᛏ'], tones = [392, 523, 659, 784], cols = ['#9b2a1a', '#2f5d34', '#1f4e79', '#b8862b'];
    el.innerHTML = `<div class="g-simon"><div class="gm-grid">${runes.map((r, i) => `<button class="gm-stone" data-i="${i}" style="--c:${cols[i]}">${r}</button>`).join('')}</div>
      <div class="gm-info">Hlustið á söng rúnasteinanna og endurtakið hann. ${len} umferðir.</div><button class="btn big gm-go">▶ Hlusta á sönginn</button></div>`;
    const st = [...el.querySelectorAll('.gm-stone')], info = $('.gm-info', el), go = $('.gm-go', el);
    const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
    let round = 1, pos = 0, playing = false, alive = true;
    const beep = (i, d = 380) => { FX.toneAt && FX.toneAt(tones[i], d); st[i].classList.add('lit'); setTimeout(() => st[i].classList.remove('lit'), d - 60); };
    function play() {
      playing = true; pos = 0; info.textContent = `Umferð ${round} af ${len} — hlustið…`;
      seq.slice(0, round).forEach((i, k) => setTimeout(() => alive && beep(i), 600 + k * 620));
      setTimeout(() => { playing = false; info.textContent = `Umferð ${round} af ${len} — ykkar röð!`; }, 600 + round * 620);
    }
    go.addEventListener('click', () => { FX.sound.unlock(); go.style.display = 'none'; play(); });
    st.forEach(b => b.addEventListener('pointerdown', () => {
      if (playing || go.style.display !== 'none') return;
      const i = +b.dataset.i; beep(i, 260);
      if (i !== seq[pos]) { FX.sound.wrong(); FX.vibrate([60, 40, 60]); info.textContent = 'Ó nei, rangur tónn! Hlustið aftur…'; playing = true; setTimeout(play, 1100); return; }
      pos++;
      if (pos === round) {
        if (round === len) { alive = false; info.textContent = 'Rúnasteinarnir syngja með ykkur!'; el.querySelector('.g-simon').classList.add('done'); setTimeout(win, 800); return; }
        round++; playing = true; setTimeout(play, 800);
      }
    }));
    return () => { alive = false; };
  };

  /* ============ 5. VÖLUNDARHÚS KETILS — hallið símanum og leiðið peninginn að skráargatinu ============ */
  G.maze = function (el, o, win) {
    const C = o.cols || 7, Rw = o.rows || 9;
    el.innerHTML = `<div class="g-maze"><canvas></canvas><div class="gz-info">Hallið símanum til að rúlla silfurpeningnum að skráargatinu 🗝️ — eða dragið hann með fingrinum.</div><button class="btn gz-go">🧭 Byrja</button></div>`;
    const cv = $('canvas', el), ctx = cv.getContext('2d'), info = $('.gz-info', el);
    // búa til völundarhús (dýptarleit)
    let sd = o.seed || 17; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const cells = Array.from({ length: Rw }, () => Array.from({ length: C }, () => ({ n: 1, e: 1, s: 1, w: 1, v: 0 })));
    (function carve() {
      const stack = [[0, 0]]; cells[0][0].v = 1;
      while (stack.length) {
        const [r, c] = stack[stack.length - 1];
        const nb = [[r - 1, c, 'n', 's'], [r, c + 1, 'e', 'w'], [r + 1, c, 's', 'n'], [r, c - 1, 'w', 'e']].filter(([y, x]) => y >= 0 && x >= 0 && y < Rw && x < C && !cells[y][x].v);
        if (!nb.length) { stack.pop(); continue; }
        const [y, x, d, od] = nb[Math.floor(rnd() * nb.length)];
        cells[r][c][d] = 0; cells[y][x][od] = 0; cells[y][x].v = 1; stack.push([y, x]);
      }
    })();
    let W, H, cs, ball = { x: .5, y: .5, vx: 0, vy: 0 }, alive = true, tilt = null, dragTo = null, won = false;
    function size() { const w = el.getBoundingClientRect().width; cs = Math.floor(Math.min(w, 380) / C); W = cv.width = cs * C; H = cv.height = cs * Rw; cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
    size();
    const goal = { r: Rw - 1, c: C - 1 };
    function wallAt(r, c, d) { if (r < 0 || c < 0 || r >= Rw || c >= C) return 1; return cells[r][c][d]; }
    function step(dt) {
      let ax = 0, ay = 0;
      if (tilt) { ax = Math.max(-1, Math.min(1, tilt.g / 25)); ay = Math.max(-1, Math.min(1, (tilt.b - 20) / 25)); }
      if (dragTo) { ax = (dragTo.x - ball.x) * 2.2; ay = (dragTo.y - ball.y) * 2.2; ball.vx *= .8; ball.vy *= .8; }
      ball.vx = (ball.vx + ax * dt * 9) * .96; ball.vy = (ball.vy + ay * dt * 9) * .96;
      const rad = .28, sub = 6;
      for (let k = 0; k < sub; k++) {
        let nx = ball.x + ball.vx * dt / sub, ny = ball.y + ball.vy * dt / sub;
        const r = Math.floor(ball.y), c = Math.floor(ball.x);
        if (nx - c > 1 - rad && wallAt(r, c, 'e')) { nx = c + 1 - rad; ball.vx *= -.3; }
        if (nx - c < rad && wallAt(r, c, 'w')) { nx = c + rad; ball.vx *= -.3; }
        if (ny - r > 1 - rad && wallAt(r, c, 's')) { ny = r + 1 - rad; ball.vy *= -.3; }
        if (ny - r < rad && wallAt(r, c, 'n')) { ny = r + rad; ball.vy *= -.3; }
        // horn: ýta frá veggjaendum
        const fx = nx - Math.floor(nx), fy = ny - Math.floor(ny);
        if ((fx < rad || fx > 1 - rad) && (fy < rad || fy > 1 - rad)) {
          const cx = Math.round(nx), cy = Math.round(ny), dx = nx - cx, dy = ny - cy, d = Math.hypot(dx, dy);
          if (d < rad && d > 0) { nx = cx + dx / d * rad; ny = cy + dy / d * rad; }
        }
        ball.x = Math.max(rad, Math.min(C - rad, nx)); ball.y = Math.max(rad, Math.min(Rw - rad, ny));
      }
      if (!won && Math.floor(ball.x) === goal.c && Math.floor(ball.y) === goal.r) {
        won = true; alive = false; FX.sound.success(); FX.vibrate([60, 40, 200]); el.querySelector('.g-maze').classList.add('done'); info.textContent = 'Peningurinn rataði í skráargatið!'; setTimeout(win, 800);
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,248,225,.35)'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = Math.max(3, cs * .12); ctx.lineCap = 'round';
      ctx.beginPath();
      for (let r = 0; r < Rw; r++) for (let c = 0; c < C; c++) {
        const x = c * cs, y = r * cs, w = cells[r][c];
        if (w.n) { ctx.moveTo(x, y); ctx.lineTo(x + cs, y); }
        if (w.w) { ctx.moveTo(x, y); ctx.lineTo(x, y + cs); }
        if (r === Rw - 1 && w.s) { ctx.moveTo(x, y + cs); ctx.lineTo(x + cs, y + cs); }
        if (c === C - 1 && w.e) { ctx.moveTo(x + cs, y); ctx.lineTo(x + cs, y + cs); }
      }
      ctx.stroke();
      ctx.font = `${cs * .7}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🗝️', (goal.c + .5) * cs, (goal.r + .5) * cs);
      const bx = ball.x * cs, by = ball.y * cs, br = cs * .28;
      const g = ctx.createRadialGradient(bx - br * .4, by - br * .4, 1, bx, by, br); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#8e9aa8');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill(); ctx.strokeStyle = '#5b6470'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    let lt = performance.now();
    function loop(t) { if (!alive && won) { draw(); return; } const dt = Math.min(.05, (t - lt) / 1000); lt = t; step(dt); draw(); requestAnimationFrame(loop); }
    draw();
    const onTilt = e => { if (e.gamma != null) tilt = { g: e.gamma, b: e.beta }; };
    $('.gz-go', el).addEventListener('click', async e => {
      FX.sound.unlock(); e.target.remove();
      try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') await DeviceOrientationEvent.requestPermission(); } catch (err) { }
      addEventListener('deviceorientation', onTilt); requestAnimationFrame(t => { lt = t; loop(t); });
    });
    const p2b = ev => { const r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) / cs, y: (ev.clientY - r.top) / cs }; };
    cv.addEventListener('pointerdown', ev => { cv.setPointerCapture(ev.pointerId); dragTo = p2b(ev); });
    cv.addEventListener('pointermove', ev => { if (dragTo) dragTo = p2b(ev); });
    cv.addEventListener('pointerup', () => dragTo = null);
    return () => { alive = false; removeEventListener('deviceorientation', onTilt); };
  };


  /* ============ 6. LYFTIÐ SAMAN — tveir halda samtímis (síminn liggur á milli þeirra) ============ */
  G.lift = function (el, o, win) {
    const names = o.names || ['', ''];
    el.innerHTML = `<div class="g-coop g-lift">
      <div class="gc-half top"><button class="gl-hand" data-k="0"><span>✋</span><b>${names[1] || 'Haltu hér'}</b></button></div>
      <div class="gc-mid"><div class="gl-stone">🪨</div><div class="gl-bar"><i></i></div><div class="gl-info">Leggið símann á jörðina á milli ykkar. Hvor heldur fingri á sinni hendi — SAMAN!</div></div>
      <div class="gc-half bot"><button class="gl-hand" data-k="1"><span>✋</span><b>${names[0] || 'Haltu hér'}</b></button></div></div>`;
    const hands = [...el.querySelectorAll('.gl-hand')], held = [new Set(), new Set()];
    const stone = $('.gl-stone', el), bar = $('.gl-bar i', el), info = $('.gl-info', el);
    let lift = 0, phase = 1, alive = true, last = performance.now(), turn = 0, rolls = 0;
    hands.forEach((h, k) => {
      h.addEventListener('pointerdown', e => { e.preventDefault(); FX.sound.unlock(); try { h.setPointerCapture(e.pointerId); } catch (err) { } held[k].add(e.pointerId); h.classList.add('on');
        if (phase === 2) { if (k === turn) { rolls++; turn = 1 - turn; FX.sound.ping(500 + rolls * 60); FX.vibrate(25); stone.style.transform = `translateY(-40px) rotate(${rolls * 36}deg) translateX(${rolls * 6}px)`; bar.style.width = (rolls / 10 * 100) + '%'; info.textContent = rolls < 10 ? `Til skiptis! Nú ${turn === 0 ? 'efri' : 'neðri'} höndin ⟶ ${rolls}/10` : 'Steininum er velt burt!'; if (rolls >= 10) { phase = 3; alive = false; el.querySelector('.g-coop').classList.add('done'); FX.sound.success(); setTimeout(win, 900); } } else { FX.sound.wrong(); info.textContent = `Ekki báðir í einu! Nú á ${turn === 0 ? 'efri' : 'neðri'} höndin að pikka.`; } }
      });
      const up = e => { held[k].delete(e.pointerId); if (!held[k].size) h.classList.remove('on'); };
      h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up); h.addEventListener('lostpointercapture', up);
      h.addEventListener('contextmenu', e => e.preventDefault());
    });
    function tick(t) {
      if (!alive) return;
      const dt = Math.min(.1, (t - last) / 1000); last = t;
      if (phase === 1) {
        const both = held[0].size && held[1].size, one = held[0].size || held[1].size;
        lift = Math.max(0, Math.min(100, lift + (both ? 28 : -18) * dt));
        bar.style.width = lift + '%'; stone.style.transform = `translateY(${-lift * .5}px) scale(${1 + lift / 300})`;
        stone.classList.toggle('shaky', !!both);
        info.textContent = both ? 'Já! Haldið áfram… steinninn lyftist!' : one ? 'Hinn þarf líka að halda! Saman!' : 'Báðir halda fingri á sinni hendi — SAMAN!';
        if (both && Math.random() < .15) FX.vibrate(15);
        if (lift >= 100) { phase = 2; FX.sound.chime(); bar.style.width = '0%'; stone.classList.remove('shaky'); info.textContent = 'Steinninn er uppi! Veltið honum burt: pikkið TIL SKIPTIS, fyrst neðri höndin!'; turn = 1; }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return () => { alive = false; };
  };

  /* ============ 7. TVÍRADDAÐ — önnur sér rúnirnar, hin hefur takkana. Þær verða að tala saman. ============ */
  G.duet = function (el, o, win) {
    const names = o.names || ['A', 'B'];
    const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚱ', 'ᚲ', 'ᛉ', 'ᛟ', 'ᛝ', 'ᛒ'];
    const rounds = o.rounds || [3, 4, 5];
    el.innerHTML = `<div class="g-coop g-duet">
      <div class="gc-half top"><div class="gd-panel"></div></div>
      <div class="gc-mid"><div class="gd-info"></div><div class="gd-dots"></div></div>
      <div class="gc-half bot"><div class="gd-panel"></div></div></div>`;
    const panels = [...el.querySelectorAll('.gd-panel')], info = $('.gd-info', el), dots = $('.gd-dots', el);
    let r = 0, seq = [], pos = 0, seer = 0, alive = true;
    function newRound() {
      seq = Array.from({ length: rounds[r] }, () => RUNES[Math.floor(Math.random() * RUNES.length)]); pos = 0;
      seer = r % 2;  // skiptast á: efri sér fyrst, svo neðri
      const doer = 1 - seer;
      panels[seer].innerHTML = `<div class="gd-role">👁️ ${names[seer === 0 ? 1 : 0]}: Lýstu rúnunum fyrir hinni, einni í einu. EKKI sýna skjáinn!</div><div class="gd-seq">${seq.map((x, i) => `<span class="${i < pos ? 'ok' : ''}">${x}</span>`).join('')}</div>`;
      panels[doer].innerHTML = `<div class="gd-role">✋ ${names[doer === 0 ? 1 : 0]}: Hlustaðu og ýttu á rúnirnar í réttri röð.</div><div class="gd-keys">${RUNES.map(x => `<button class="gd-key">${x}</button>`).join('')}</div>`;
      panels[doer].querySelectorAll('.gd-key').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); press(b, b.textContent); }));
      info.textContent = `Umferð ${r + 1} af ${rounds.length} · ${seq.length} rúnir`;
      dots.innerHTML = seq.map(() => '<i></i>').join('');
    }
    function press(b, x) {
      FX.sound.unlock();
      if (x === seq[pos]) {
        pos++; b.classList.add('ok'); setTimeout(() => b.classList.remove('ok'), 300); FX.sound.ping(600 + pos * 90); FX.vibrate(20);
        dots.children[pos - 1].classList.add('on');
        const s = panels[seer].querySelectorAll('.gd-seq span'); if (s[pos - 1]) s[pos - 1].classList.add('ok');
        if (pos === seq.length) {
          r++; FX.sound.chime();
          if (r === rounds.length) { alive = false; info.textContent = 'Þið töluðuð saman eins og alvöru rúnameistarar!'; el.querySelector('.g-coop').classList.add('done'); setTimeout(win, 900); return; }
          info.textContent = 'Frábært! Nú skiptið þið um hlutverk…'; setTimeout(() => alive && newRound(), 1400);
        }
      } else {
        b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 400); FX.sound.wrong(); FX.vibrate([50, 30, 50]);
        info.textContent = 'Úps! Byrjið aftur á þessari röð.'; pos = 0; dots.querySelectorAll('i').forEach(i => i.classList.remove('on'));
        panels[seer].querySelectorAll('.gd-seq span').forEach(s => s.classList.remove('ok'));
      }
    }
    newRound();
    return () => { alive = false; };
  };

  window.GAMES = G;
})();

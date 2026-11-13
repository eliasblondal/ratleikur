/* Galdrar: stjörnuhiminn, agnir, flugeldar, hljóð, titringur og upplestur */
(function () {
  const FX = {};

  /* ---------- Norðurljósin í bakgrunni ---------- */
  FX.sky = function (canvas) {
    const ctx = canvas.getContext('2d');
    const SCALE = 0.5;                     // teiknað í hálfri upplausn og mýkt með CSS
    let W, H;
    // ein ljósrák: björt græn neðst, dofnar upp í fjólublátt
    function sprite(c1, c2) {
      const sp = document.createElement('canvas'); sp.width = 1; sp.height = 256;
      const g = sp.getContext('2d').createLinearGradient(0, 256, 0, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.06, c1); g.addColorStop(0.35, c1.replace(/[\d.]+\)$/, '0.55)'));
      g.addColorStop(0.75, c2); g.addColorStop(1, 'rgba(0,0,0,0)');
      const x = sp.getContext('2d'); x.fillStyle = g; x.fillRect(0, 0, 1, 256); return sp;
    }
    const bands = [
      { y: .20, amp: .06, f: 1.1, sp: .00009, h: .30, a: .95, img: sprite('rgba(70,255,160,1)', 'rgba(120,90,255,.45)'), ph: 0 },
      { y: .12, amp: .05, f: 1.7, sp: -.00013, h: .22, a: .65, img: sprite('rgba(60,240,200,1)', 'rgba(170,90,255,.5)'), ph: 2 },
      { y: .55, amp: .08, f: .8, sp: .00007, h: .30, a: .55, img: sprite('rgba(140,255,120,1)', 'rgba(90,120,255,.4)'), ph: 4 },
      { y: .92, amp: .05, f: 1.3, sp: -.00008, h: .28, a: .6, img: sprite('rgba(70,255,170,1)', 'rgba(150,90,255,.45)'), ph: 1 }
    ];
    const glow = document.getElementById('skyglow'), gctx = glow && glow.getContext('2d');
    function resize() { W = canvas.width = Math.ceil(innerWidth * SCALE); H = canvas.height = Math.ceil(innerHeight * SCALE); canvas.style.width = innerWidth + 'px'; canvas.style.height = innerHeight + 'px'; if (glow) { glow.width = Math.ceil(W / 2); glow.height = Math.ceil(H / 2); } }
    resize(); addEventListener('resize', resize);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let last = 0;
    function frame(t) {
      requestAnimationFrame(frame);
      if (document.hidden || t - last < 33) return; last = t;   // ~30 fps
      const boost = document.body.classList.contains('aurora-max') ? 1.7 : 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const step = Math.max(2, Math.round(W / 220));
      for (const bd of bands) {
        const tt = reduce ? 0 : t;
        for (let x = -step; x < W + step; x += step) {
          const u = x / W;
          const y = H * (bd.y + bd.amp * Math.sin(u * bd.f * 6.283 + tt * bd.sp * 6.283 + bd.ph) + bd.amp * .45 * Math.sin(u * bd.f * 13.1 - tt * bd.sp * 9 + bd.ph * 1.7));
          const ray = .55 + .45 * Math.sin(u * 47 + tt * .0011 + bd.ph) * Math.sin(u * 13 - tt * .0007);
          const fold = .6 + .4 * Math.sin(u * 9 + tt * .0004 + bd.ph);
          const h = H * bd.h * (.55 + .45 * ray);
          ctx.globalAlpha = Math.min(1, bd.a * boost * Math.max(.08, ray * fold));
          ctx.drawImage(bd.img, x, y - h, step + 1, h * 1.15);
        }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      // sama ljósið speglast mjúklega á bókfellinu ofan á efninu
      if (gctx) { gctx.clearRect(0, 0, glow.width, glow.height); gctx.drawImage(canvas, 0, 0, glow.width, glow.height); }
    }
    requestAnimationFrame(frame);
  };

  /* ---------- Agnir (sprengja / flugeldar / peningaregn) ---------- */
  let pc, pctx, parts = [], running = false;
  function ensureParticles() {
    if (pc) return;
    pc = document.createElement('canvas'); pc.className = 'fxlayer'; document.body.appendChild(pc);
    pctx = pc.getContext('2d');
    const rs = () => { const d = Math.min(devicePixelRatio || 1, 2); pc.width = innerWidth * d; pc.height = innerHeight * d; pctx.setTransform(d, 0, 0, d, 0, 0); };
    rs(); addEventListener('resize', rs);
  }
  function loop() {
    running = true;
    pctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life > 0);
    for (const p of parts) {
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx; p.y += p.vy; p.life -= p.decay; p.rot += p.vr;
      pctx.save(); pctx.globalAlpha = Math.max(0, Math.min(1, p.life)); pctx.translate(p.x, p.y); pctx.rotate(p.rot);
      if (p.text) {
        pctx.font = `${p.size}px ${p.font || 'Runic, serif'}`; pctx.fillStyle = p.color; pctx.textAlign = 'center'; pctx.textBaseline = 'middle';
        pctx.shadowColor = p.color; pctx.shadowBlur = 12; pctx.fillText(p.text, 0, 0);
      } else if (p.coin) {
        const w = Math.abs(Math.cos(p.rot * 2)) * p.size;
        pctx.fillStyle = '#e8eef5'; pctx.strokeStyle = '#9aa8b8'; pctx.lineWidth = 2;
        pctx.beginPath(); pctx.ellipse(0, 0, Math.max(1, w), p.size, 0, 0, 6.283); pctx.fill(); pctx.stroke();
      } else {
        pctx.fillStyle = p.color; pctx.shadowColor = p.color; pctx.shadowBlur = 10;
        pctx.beginPath(); pctx.arc(0, 0, p.size, 0, 6.283); pctx.fill();
      }
      pctx.restore();
    }
    if (parts.length) requestAnimationFrame(loop); else { running = false; pctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function add(p) { ensureParticles(); parts.push(Object.assign({ g: 0.08, drag: 0.985, life: 1, decay: 0.012, rot: 0, vr: 0 }, p)); if (!running) requestAnimationFrame(loop); }

  const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  FX.burst = function (x, y, colors, opts = {}) {
    const n = opts.n || 70;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, sp = 2 + Math.random() * 7;
      const isRune = opts.runes && Math.random() < .35;
      add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, size: isRune ? 16 + Math.random() * 12 : 2 + Math.random() * 3,
        color: colors[i % colors.length], text: isRune ? RUNES[Math.floor(Math.random() * RUNES.length)] : null, decay: 0.008 + Math.random() * 0.01, vr: (Math.random() - .5) * .2 });
    }
  };
  FX.firework = function (x, y) {
    const hue = Math.floor(Math.random() * 360);
    const cols = [`hsl(${hue},100%,65%)`, `hsl(${(hue + 40) % 360},100%,70%)`, '#ffffff'];
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * 6.283, sp = 3 + Math.random() * 3.5;
      add({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, size: 1.6 + Math.random() * 2, color: cols[i % 3], g: 0.05, drag: .97, decay: 0.01 + Math.random() * .008 });
    }
    FX.sound.boom();
  };
  FX.coinRain = function (n = 60) {
    for (let i = 0; i < n; i++) setTimeout(() => add({ coin: true, x: Math.random() * innerWidth, y: -30, vx: (Math.random() - .5) * 2, vy: 2 + Math.random() * 3, size: 9 + Math.random() * 7, g: 0.12, drag: .995, decay: 0.004, vr: 0.08 + Math.random() * .1 }), i * 45);
  };
  FX.emojiFly = function (emoji, from, to, cb) {
    const el = document.createElement('div'); el.className = 'flyer'; el.textContent = emoji; document.body.appendChild(el);
    el.style.left = from.x + 'px'; el.style.top = from.y + 'px';
    el.animate([
      { transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 1, offset: .35 },
      { transform: `translate(calc(${to.x - from.x}px - 50%), calc(${to.y - from.y}px - 50%)) scale(.5)`, opacity: .9 }
    ], { duration: 1300, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { el.remove(); cb && cb(); };
  };

  /* ---------- Hljóð (búin til með WebAudio — engar skrár) ---------- */
  let ac = null, master = null;
  function A() {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ac = new C(); master = ac.createGain(); master.gain.value = 0.7; master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, t0, dur, type = 'sine', vol = .25, slide = 0) {
    const a = A(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, a.currentTime + t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), a.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, a.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, a.currentTime + t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + t0 + dur);
    o.connect(g); g.connect(master); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + .05);
  }
  function noise(dur, filterFreq = 800, vol = .3, t0 = 0, type = 'lowpass') {
    const a = A(); if (!a) return null;
    const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const s = a.createBufferSource(); s.buffer = buf;
    const f = a.createBiquadFilter(); f.type = type; f.frequency.value = filterFreq;
    const g = a.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(master); s.start(a.currentTime + t0);
    return { s, g, f };
  }
  FX.toneAt = (f, ms) => tone(f, 0, ms / 1000, 'triangle', .25);
  FX.sound = {
    unlock() { A(); },
    tap() { tone(660, 0, .08, 'triangle', .12); },
    chime() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * .09, .7, 'sine', .18)); },
    success() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .11, .5, 'triangle', .2));
      [1319, 1568, 2093].forEach((f, i) => tone(f, .5 + i * .07, .9, 'sine', .12));
    },
    wrong() { tone(220, 0, .18, 'square', .1, -60); tone(165, .16, .3, 'square', .1, -50); },
    giggle() { [600, 720, 640, 760, 680].forEach((f, i) => tone(f, i * .09, .08, 'square', .06, 80)); },
    whoosh() { const n = noise(.6, 1200, .25, 0, 'bandpass'); if (n) n.f.frequency.exponentialRampToValueAtTime(3000, ac.currentTime + .5); },
    boom() { noise(.8, 300, .5); tone(80, 0, .5, 'sine', .3, -40); },
    roar() { tone(90, 0, 1.2, 'sawtooth', .18, -30); tone(120, .05, 1.1, 'sawtooth', .12, -50); noise(1.2, 500, .4); },
    ping(pitch = 880) { tone(pitch, 0, .12, 'sine', .25); },
    morse(on) { /* handled in beacon */ },
    fanfare() {
      const seq = [[523, 0], [523, .15], [523, .3], [659, .45], [784, .75], [659, 1.0], [784, 1.15], [1047, 1.4]];
      seq.forEach(([f, t]) => { tone(f, t, .35, 'triangle', .22); tone(f / 2, t, .35, 'sine', .1); });
    }
  };
  // hrotur — endurtekin lykkja
  let snoreTimer = null;
  FX.snore = {
    start() {
      if (snoreTimer) return;
      const one = () => {
        const a = A(); if (!a) return;
        const n = noise(1.6, 260, 0.0001);
        if (n) {
          const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 28; lg.gain.value = 0.25;
          lfo.connect(lg); lg.connect(n.g.gain); lfo.start(); lfo.stop(a.currentTime + 1.7);
          n.g.gain.setValueAtTime(0.0001, a.currentTime); n.g.gain.linearRampToValueAtTime(.45, a.currentTime + .7); n.g.gain.linearRampToValueAtTime(0.0001, a.currentTime + 1.6);
        }
        const m = noise(1.4, 1800, 0.0001, 1.9, 'bandpass');
        if (m) { m.g.gain.setValueAtTime(0.0001, a.currentTime + 1.9); m.g.gain.linearRampToValueAtTime(.12, a.currentTime + 2.3); m.g.gain.linearRampToValueAtTime(0.0001, a.currentTime + 3.2); }
      };
      one(); snoreTimer = setInterval(one, 3800);
    },
    stop() { clearInterval(snoreTimer); snoreTimer = null; }
  };
  FX.beep = function (on) {
    const a = A(); if (!a) return;
    if (on) {
      if (FX._bo) return;
      const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 700; g.gain.value = .18; o.connect(g); g.connect(master); o.start(); FX._bo = { o, g };
    } else if (FX._bo) { FX._bo.o.stop(); FX._bo = null; }
  };

  FX.vibrate = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } };

  /* ---------- Upplestur (ef tækið á íslenska rödd) ---------- */
  FX.voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    FX.voice = vs.find(v => /^is/i.test(v.lang)) || null;
    document.documentElement.classList.toggle('has-voice', !!FX.voice);
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  FX.speak = function (text) {
    if (!FX.voice) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.voice = FX.voice; u.lang = FX.voice.lang; u.rate = .92; u.pitch = 1;
    speechSynthesis.speak(u); return true;
  };

  /* ---------- Skjár vakandi ---------- */
  let wl = null;
  FX.keepAwake = async function () {
    try { if ('wakeLock' in navigator && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => wl = null); } } catch (e) { }
  };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && FX._wantAwake) FX.keepAwake(); });

  window.FX = FX;
})();

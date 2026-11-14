/* SILFUR KETILS HÆNGS — aðalforritið */
(function () {
  const D = window.RATLEIKUR;
  const app = document.getElementById('app');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ================= Hjálparföll ================= */
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('ratleikur.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ratleikur.' + k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem('ratleikur.' + k); } catch (e) { } }
  };
  const settings = () => Object.assign({}, D.defaults, LS.get('settings', {}));
  const saveSettings = patch => LS.set('settings', Object.assign(LS.get('settings', {}), patch));

  function fold(s) {
    return String(s).toUpperCase()
      .replace(/Þ/g, 'TH').replace(/Ð/g, 'D').replace(/Æ/g, 'AE')
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  const norm = s => fold(s).replace(/[^A-Z0-9]/g, '');

  const RUNEMAP = { A: 'ᚨ', B: 'ᛒ', D: 'ᛞ', E: 'ᛖ', F: 'ᚠ', G: 'ᚷ', H: 'ᚺ', I: 'ᛁ', J: 'ᛃ', K: 'ᚲ', L: 'ᛚ', M: 'ᛗ', N: 'ᚾ', O: 'ᛟ', P: 'ᛈ', R: 'ᚱ', S: 'ᛊ', T: 'ᛏ', U: 'ᚢ', V: 'ᚹ', Y: 'ᛇ', 'Þ': 'ᚦ', 'Æ': 'ᚫ' };
  const RUNEKEY = [['A', 'ᚨ'], ['B', 'ᛒ'], ['D / Ð', 'ᛞ'], ['E', 'ᛖ'], ['F', 'ᚠ'], ['G', 'ᚷ'], ['H', 'ᚺ'], ['I', 'ᛁ'], ['J', 'ᛃ'], ['K', 'ᚲ'], ['L', 'ᛚ'], ['M', 'ᛗ'], ['N', 'ᚾ'], ['O / Ö', 'ᛟ'], ['P', 'ᛈ'], ['R', 'ᚱ'], ['S', 'ᛊ'], ['T', 'ᛏ'], ['U', 'ᚢ'], ['V', 'ᚹ'], ['Y', 'ᛇ'], ['Þ', 'ᚦ'], ['Æ', 'ᚫ']];
  function toRunes(text) {
    return text.toUpperCase().split(' ').map(w => [...w].map(ch => {
      if (RUNEMAP[ch]) return RUNEMAP[ch];
      const f = ch === 'Ð' ? 'D' : ch.normalize('NFD').replace(/[̀-ͯ]/g, '');
      return RUNEMAP[f] || '';
    }).join('')).join(' ᛫ ');
  }

  const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
  const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

  const DIRS = ['norður', 'norðaustur', 'austur', 'suðaustur', 'suður', 'suðvestur', 'vestur', 'norðvestur'];
  const dirName = deg => DIRS[Math.round(((deg % 360) + 360) % 360 / 45) % 8];

  const digitWord = d => D.numberWords[+d];

  function fill(text) {
    const s = settings();
    return text.replace('{steps}', s.compassSteps).replace('{dir}', `${dirName(s.compassDeg)} (${s.compassDeg}°)`).replace('{keyplace}', s.girlsKeyPlace)
      .replace('{riddlehint}', () => (D.riddleHints || [])[+String(s.lockCode)[2]] || 'Lesið gátuna hægt og teljið eitt í einu.');
  }

  function toast(msg, ms = 2600) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, ms);
  }

  function modal(html, cls = '') {
    const m = document.createElement('div'); m.className = 'modal ' + cls;
    m.innerHTML = `<div class="modal-box">${html}<button class="btn ghost modal-close">Loka</button></div>`;
    document.body.appendChild(m);
    requestAnimationFrame(() => m.classList.add('in'));
    const close = () => { m.classList.remove('in'); setTimeout(() => m.remove(), 300); };
    m.addEventListener('click', e => { if (e.target === m || e.target.classList.contains('modal-close')) close(); });
    return { el: m, close };
  }

  function runeKeyHTML() {
    return `<h3 class="cinzel">Rúnalykill Ketils</h3><div class="runekey">${RUNEKEY.map(([l, r]) => `<div><span class="rk-r">${r}</span><span class="rk-l">${l}</span></div>`).join('')}</div><p class="small">Orðaskil eru merkt með ᛫</p>`;
  }

  // ----- Hreinsa tól (hljóðnemi, GPS, áttaviti) þegar skipt er um skjá
  let cleanups = [];
  const onCleanup = f => cleanups.push(f);
  function cleanup() { cleanups.forEach(f => { try { f(); } catch (e) { } }); cleanups = []; FX.snore.stop(); FX.beep(false); Voice.stop(); }

  /* ================= Leiðir ================= */
  function route() {
    cleanup(); window.scrollTo(0, 0);
    $$('.success, .modal, .peek, .torchlight, .draw-ov').forEach(x => x.remove());
    const h = location.hash.replace(/^#\/?/, '');
    document.body.className = '';
    if (h.startsWith('s/')) {
      try { const s = JSON.parse(decodeURIComponent(escape(atob(h.slice(2))))); saveSettings(s); pushSettings(); toast('Stillingar sóttar ✓'); } catch (e) { toast('Gat ekki lesið stillingar'); }
      location.hash = '#/'; return;
    }
    if (h === 'lid/trollar') return renderTeam('trollar');
    if (h === 'lid/runir') return renderTeam('runir');
    if (h === 'bid') return renderBid();
    if (h === 'hq') return renderHQ();
    if (h === 'viti') return renderBeacon();
    if (h === 'fjarstyring') return renderRemote();
    renderHome();
  }
  addEventListener('hashchange', route);

  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }

  /* ================= HEIM ================= */
  function renderHome() {
    document.body.classList.add('theme-home');
    const p = { trollar: LS.get('prog.trollar', null), runir: LS.get('prog.runir', null) };
    const st = k => p[k] ? (p[k].done ? 'Lokið ✓' : `Stöð ${p[k].i + 1} af ${D[k].stations.length}`) : `${D[k].stations.length} stöðvar`;
    app.innerHTML = `
    <div class="screen home">
      <div class="hero"><div class="h-stage"><img class="h-base" src="img/hero-base.webp?v=1794656451" alt=""><img class="h-aur a1" src="img/hero-aurora.webp?v=1794656451" alt=""><img class="h-aur a2" src="img/hero-aurora.webp?v=1794656451" alt=""></div><div class="hero-fade"></div></div>
      <div class="home-title">
        <div class="runeline">ᛊᛁᛚᚠᚢᚱ ᛫ ᚲᛖᛏᛁᛚᛊ ᛫ ᚺᚫᚾᚷᛊ</div>
        <h1 class="fraktur">Silfur Ketils hængs</h1>
        <p class="tag">Ratleikur á Stillu</p>
      </div>
      <button class="introbtn"><img src="img/hero-base.webp?v=1794656451" alt=""><span class="ib-play">▶</span><span class="ib-txt">Sagan hefst · horfið saman</span></button>
      <button class="drawbtn"><span class="db-dice">🎲</span><span class="db-t cinzel">Hver byrjar?<small>Ýtið þegar allir eru saman</small></span></button>
      ${LS.get('drawn', null) ? `<a class="bidlink" href="#/bid">🤫 Leyniverkefni Rúnameistaranna</a>` : ''}
      <div class="teams">
        <a class="teamcard tc-troll" href="#/lid/trollar">
          <img src="img/troll.webp?v=1794656451" alt="">
          <div class="tc-body"><div class="tc-name cinzel">Tröllaspæjararnir</div><div class="tc-kids">Jóhann og Hólmar</div><div class="tc-sub">Rekið slóð tröllsins og náið lyklinum</div><div class="tc-meta">${st('trollar')}</div></div>
        </a>
        <a class="teamcard tc-rune" href="#/lid/runir">
          <img src="img/ketill.webp?v=1794656451" alt="">
          <div class="tc-body"><div class="tc-name cinzel">Rúnameistararnir</div><div class="tc-kids">Katrín og Aría</div><div class="tc-sub">Ráðið í rúnir Ketils og finnið lykilinn hans</div><div class="tc-meta">${st('runir')}</div></div>
        </a>
      </div>
      <a class="teaserlink" href="teaser.html">🎬 Teaser · horfið á stórum skjá</a>
      <a class="hqlink" href="#/hq">🔒 Höfuðstöðvar</a>
    </div>`;
    $$('.teamcard').forEach(a => a.addEventListener('click', () => FX.sound.unlock()));
    $('.introbtn').addEventListener('click', playIntro);
    $('.drawbtn').addEventListener('click', playDraw);
  }

  /* ---------- Hver byrjar? (lítur út eins og tilviljun en strákarnir byrja alltaf) ---------- */
  function playDraw() {
    FX.sound.unlock(); Voice.stop();
    const o = document.createElement('div'); o.className = 'draw-ov';
    o.innerHTML = `<button class="vo-close dr-close" aria-label="Loka">✕</button>
      <div class="dr-title cinzel">Hver byrjar?</div>
      <div class="dr-cards">
        <div class="dr-card" data-t="trollar"><img src="img/troll.webp?v=1794656451" alt=""><b class="cinzel">Tröllaspæjararnir</b><small>Jóhann og Hólmar</small></div>
        <div class="dr-card" data-t="runir"><img src="img/ketill.webp?v=1794656451" alt=""><b class="cinzel">Rúnameistararnir</b><small>Katrín og Aría</small></div>
      </div>
      <p class="dr-text">${D.draw.intro}</p>
      <div class="dr-btns">
        <a class="btn big huge" href="#/lid/trollar">Af stað, Tröllaspæjarar! 🔦</a>
        <a class="btn big ghost dr-girls" href="#/bid">🤫 Leyniverkefni Rúnameistaranna</a>
      </div>`;
    document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('in'));
    const cards = $$('.dr-card', o), tms = []; let dead = false;
    const close = () => { dead = true; tms.forEach(clearTimeout); Voice.stop(); o.remove(); };
    $('.dr-close', o).addEventListener('click', close);
    $$('.dr-btns a', o).forEach(a => a.addEventListener('click', () => { dead = true; tms.forEach(clearTimeout); }));
    Voice.auto(D.draw.intro, 300);
    // hraðinn minnkar smám saman; næstsíðast staldrar hún lengi við stelpurnar og hoppar svo á strákana
    const gaps = []; for (let t = 95; t < 560; t *= 1.1) gaps.push(Math.round(t));
    if (gaps.length % 2 === 0) gaps.push(600);
    gaps.push(1250); // jafnmörg bil → oddatala af tikkum → endar á strákunum
    let at = 2600;
    for (let n = 0; n <= gaps.length; n++) {
      const idx = n % 2, last = n === gaps.length;
      tms.push(setTimeout(() => {
        if (dead) return;
        cards.forEach((c, j) => c.classList.toggle('lit', j === idx));
        FX.sound.ping(idx ? 660 : 880);
        if (last) tms.push(setTimeout(land, 450));
      }, at));
      at += gaps[n] || 0;
    }
    function land() {
      if (dead) return;
      LS.set('drawn', 'trollar'); LS.set('drawnAt', Date.now());
      o.classList.add('landed'); cards[0].classList.add('win'); cards[1].classList.add('lose');
      FX.sound.boom(); setTimeout(() => FX.sound.fanfare(), 250); FX.vibrate([60, 40, 60, 40, 200]);
      $('.dr-title', o).textContent = 'Tröllaspæjararnir byrja!';
      $('.dr-text', o).textContent = D.draw.result;
      Voice.auto(D.draw.result, 1700);
    }
  }

  /* ---------- Myndbönd í fullum skjá (iPhone portrait) ---------- */
  const VIDS = { trollar: ['210', '211', '212', '213', '214', '215'], runir: ['220', '221', '222', '223', '224', '225', '226'], finale: '230' };
  const VV = '?v=1794656451';
  function vidSrc(id) { return `video/ok-${id}.mp4${VV}`; }
  function prefetchVid(id) { if (!id || settings().videos === false) return; try { fetch(vidSrc(id), { priority: 'low' }).catch(() => { }); } catch (e) { } }
  function playVideo(src, onEnd, opts = {}) {
    Voice.stop();
    const o = document.createElement('div'); o.className = 'video-ov' + (opts.cls ? ' ' + opts.cls : '');
    o.innerHTML = `<video src="${src}" playsinline webkit-playsinline preload="auto" ${opts.poster ? `poster="${opts.poster}"` : ''}></video>
      <button class="vo-close" aria-label="Sleppa">${opts.skipText || 'Sleppa ✕'}</button>
      <button class="vo-sound" hidden>🔊 Kveikja á hljóði</button>`;
    document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('in'));
    const v = $('video', o); let done = false;
    const close = () => { if (done) return; done = true; try { v.pause(); } catch (e) { } o.classList.remove('in'); setTimeout(() => o.remove(), 400); if (onEnd) onEnd(); };
    $('.vo-close', o).addEventListener('click', e => { e.stopPropagation(); close(); });
    const snd = $('.vo-sound', o);
    snd.addEventListener('click', e => { e.stopPropagation(); v.muted = false; snd.hidden = true; v.play().catch(() => { }); });
    v.addEventListener('ended', close);
    v.addEventListener('error', close);
    // Ef vafrinn leyfir ekki hljóð: spila hljóðlaust og bjóða hljóð
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => { v.muted = true; snd.hidden = false; v.play().catch(close); });
    // öryggisnet: ef myndbandið fer aldrei af stað
    setTimeout(() => { if (!done && v.currentTime < 0.1 && v.paused) close(); }, 12000);
    return close;
  }
  function playIntro() {
    const saved = LS.get('introLang', null);
    const o = document.createElement('div'); o.className = 'langpick';
    o.innerHTML = `<div class="lp-card">
        <div class="runeline">ᛊᚨᚷᚨᚾ</div>
        <h2 class="fraktur">Sagan hefst</h2>
        <p>Veljið rödd sögumannsins</p>
        <button class="btn big lp-is ${saved === 'is' ? 'pref' : ''}">Íslenska</button>
        <button class="btn big lp-en ${saved === 'en' ? 'pref' : ''}">English</button>
        <p class="lp-note">Haldið símanum uppréttum og hækkið vel 🔊</p>
        <button class="lp-x" aria-label="Loka">✕</button>
      </div>`;
    document.body.appendChild(o); requestAnimationFrame(() => o.classList.add('in'));
    const shut = () => { o.classList.remove('in'); setTimeout(() => o.remove(), 300); };
    const go2 = lang => { LS.set('introLang', lang); FX.sound.unlock(); shut(); playVideo(`video/intro-${lang}.mp4${VV}`, null, { poster: 'img/intro-poster.jpg' + VV, cls: 'intro' }); };
    $('.lp-is', o).addEventListener('click', () => go2('is'));
    $('.lp-en', o).addEventListener('click', () => go2('en'));
    $('.lp-x', o).addEventListener('click', shut);
    o.addEventListener('click', e => { if (e.target === o) shut(); });
  }

  /* ================= LIÐ ================= */
  function getProg(team) { return LS.get('prog.' + team, null); }
  function setProg(team, p) { LS.set('prog.' + team, p); }

  function renderTeam(team) {
    const T = D[team];
    document.body.classList.add('theme-' + T.theme);
    const p = getProg(team);
    if (!p) return renderIntro(team);
    FX._wantAwake = true; FX.keepAwake();
    const st = T.stations[p.i];
    if (st.finale) return renderFinale(team, p);
    renderStation(team, p);
  }

  function speakBtn(text) {
    return `<button class="speak" data-say="${encodeURIComponent(text)}" aria-label="Lesa upphátt">🔊</button>`;
  }
  function wireSpeak(root) {
    $$('.speak', root).forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const t = decodeURIComponent(b.dataset.say); Voice.play(t) || FX.speak(t); }));
  }

  /* ---------- Upplestur sögumanns (tilbúnar hljóðskrár) ---------- */
  const Voice = (() => {
    let man = null, unlocked = false, timer = 0;
    const el = new Audio(); el.preload = 'auto'; el.setAttribute('playsinline', '');
    fetch('audio/voice.json?v=1794656451').then(r => r.json()).then(j => { man = j; document.documentElement.classList.add('has-voice'); }).catch(() => { });
    const src = t => man && man[t] ? 'audio/' + man[t] + '?v=1794656451' : null;
    // iOS: opna hljóðið í fyrstu snertingu svo síðari upplestur virki sjálfkrafa
    const unlock = () => {
      if (unlocked) return; unlocked = true;
      try { el.muted = true; el.src = src(Object.keys(man || {})[0]) || ''; const pr = el.play(); if (pr && pr.then) pr.then(() => { el.pause(); el.muted = false; }).catch(() => { el.muted = false; }); else el.muted = false; } catch (e) { el.muted = false; }
    };
    addEventListener('pointerdown', unlock, { capture: true, once: false });
    function play(t) {
      const u = src(t); if (!u) return false;
      clearTimeout(timer); try { speechSynthesis.cancel(); } catch (e) { }
      el.pause(); el.muted = false; el.src = u; el.currentTime = 0;
      const pr = el.play(); if (pr && pr.catch) pr.catch(() => { });
      return true;
    }
    function stop() { clearTimeout(timer); try { el.pause(); } catch (e) { } }
    // les texta sjálfkrafa ef kveikt er á upplestri
    function auto(t, delay = 500) { clearTimeout(timer); if (settings().voice === false || !t) return; timer = setTimeout(() => play(t), delay); }
    return { play, stop, auto, has: t => !!src(t) };
  })();

  /* ---------- Inngangur ---------- */
  function renderIntro(team) {
    const T = D[team];
    app.innerHTML = `
    <div class="screen intro">
      <a class="back" href="#/">‹</a>
      <div class="intro-art"><img src="${T.image}" alt=""><div class="art-fade"></div>${T.theme === 'troll' ? '<div class="zzz"><span>z</span><span>z</span><span>Z</span></div>' : '<div class="runeglow"></div>'}</div>
      <div class="intro-text">
        <h1 class="cinzel">${T.name}</h1>
        ${T.intro.map((l, i) => `<p class="iline" style="animation-delay:${0.5 + i * 1.5}s">${l}</p>`).join('')}
        <div class="intro-actions" style="animation-delay:${0.5 + T.intro.length * 1.5}s">
          ${speakBtn(T.intro.join(' '))}
          <button class="btn big go">Af stað! ✨</button>
        </div>
      </div>
    </div>`;
    wireSpeak(app); Voice.auto(T.intro.join(' '), 900);
    // smella á texta = sýna allt strax
    $('.intro-text').addEventListener('click', e => { if (!e.target.closest('button')) $$('.iline, .intro-actions').forEach(x => x.style.animationDelay = '0s'); });
    $('.go').addEventListener('click', () => {
      FX.sound.unlock(); FX.sound.chime(); FX.vibrate(40);
      setProg(team, { i: 0, phase: 'task', digits: [], items: [], startedAt: Date.now() });
      FX._wantAwake = true; FX.keepAwake();
      const r = $('.go').getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top, team === 'runir' ? ['#e9c56c', '#f7e8c4', '#c4472f'] : ['#e9c56c', '#f7e8c4', '#7fbf6a'], { runes: team === 'runir' });
      setTimeout(() => go('#/lid/' + team), 450);
    });
  }

  /* ---------- Stöð ---------- */
  function headerHTML(team, p) {
    const T = D[team], n = T.stations.length;
    const dots = T.stations.map((s, i) => `<span class="dot ${i < p.i ? 'done' : ''} ${i === p.i ? 'now' : ''}"></span>`).join('');
    let inv = '';
    if (team === 'runir') {
      const code = settings().lockCode;
      inv = `<div class="runelock" title="Rúnalásinn">${[0, 1, 2, 3].map(k => `<span class="slot ${p.digits[k] != null ? 'on' : ''}" data-slot="${k}">${p.digits[k] != null ? p.digits[k] : 'ᚱ'}</span>`).join('')}</div>`;
    } else {
      inv = `<div class="bag" title="Spæjarataskan">${T.stations.filter(s => s.item).map((s, k) => `<span class="slot ${p.items[k] ? 'on' : ''}" data-slot="${k}">${p.items[k] || '·'}</span>`).join('')}</div>`;
    }
    return `
    <header class="topbar">
      <a class="back" href="#/">‹</a>
      <div class="tb-mid"><div class="tb-name cinzel">${T.short}</div><div class="dots">${dots}</div></div>
      <button class="iconbtn torch" aria-label="Vasaljós">🔦</button>
    </header>
    <div class="invbar">${inv}${team === 'runir' ? '<button class="chip rkbtn">ᚱ Rúnalykill</button>' : ''}</div>`;
  }

  function wireHeader(team) {
    $('.torch').addEventListener('click', torch);
    const rk = $('.rkbtn'); if (rk) rk.addEventListener('click', () => modal(runeKeyHTML(), 'rk'));
  }

  function torch() {
    const t = document.createElement('div'); t.className = 'torchlight';
    t.innerHTML = '<div>Snertu til að slökkva</div>';
    document.body.appendChild(t); FX.vibrate(20);
    t.addEventListener('click', () => t.remove());
  }

  function renderStation(team, p) {
    prefetchVid(VIDS[team] && VIDS[team][p.i]);
    const T = D[team], st = T.stations[p.i], n = T.stations.length;
    const prevPlace = p.i > 0 ? T.stations[p.i - 1].place : null;
    const travel = p.phase === 'travel' && st.travel;
    app.innerHTML = `
    <div class="screen station">
      ${headerHTML(team, p)}
      <div class="mapwrap"><div class="map"></div>
        <div class="mapbtns"><button class="chip m-all">Allt kortið</button><button class="chip m-next">Næsta stöð</button></div>
      </div>
      <section class="card ${travel ? 'travel' : 'task'}">
        <div class="kicker">Stöð ${p.i + 1} af ${n}</div>
        <h2 class="cinzel"><span class="st-ico">${st.icon}</span> ${st.title}</h2>
        ${travel ? `
          <p class="story">${fill(st.travel)} ${speakBtn(fill(st.travel))}</p>
          <button class="btn big arrive">Við erum komin! 📍</button>
        ` : `
          <p class="story">${fill(st.task)} ${speakBtn(fill(st.task))}</p>
          <div class="tool"></div>
          <div class="game"></div>
          <p class="story gamewin hidden"></p>
          <div class="answer"></div>
          <div class="feedback" aria-live="polite"></div>
          <button class="hintbtn">💡 Vísbending</button>
          <p class="hint hidden">${fill(st.hint)}</p>
        `}
      </section>
    </div>`;
    wireHeader(team); wireSpeak(app); Voice.auto(travel ? fill(st.travel) : fill(st.task), 700);

    const map = GaldraKort.create($('.map'));
    const done = T.stations.slice(0, p.i).map(s => s.place);
    const mstate = { done, target: st.place, prev: travel ? prevPlace : null, icon: st.icon };
    requestAnimationFrame(() => map.render(mstate, { instant: false }));
    $('.m-all').addEventListener('click', () => map.overview());
    $('.m-next').addEventListener('click', () => map.render(mstate));

    if (travel) {
      $('.arrive').addEventListener('click', () => {
        FX.sound.whoosh(); FX.vibrate(30);
        Remote.send({ cmd: 'progress', from: team, team, i: p.i, title: st.title, phase: 'arrived' });
        if (st.tool === 'morse') Remote.send({ cmd: 'start', from: team, word: fold(digitWord(String(settings().lockCode)[3])) });
        setProg(team, Object.assign(p, { phase: 'task' }));
        renderStation(team, p);
      });
      return;
    }
    $('.hintbtn').addEventListener('click', e => { $('.hint').classList.remove('hidden'); e.target.remove(); FX.sound.tap(); Voice.play(fill(st.hint)); });
    buildTool(team, st, $('.tool'));
    buildAnswer(team, st, p, $('.answer'));
    if (st.game && window.GAMES[st.game]) {
      const gated = st.gate !== false, done = (p.games || {})[p.i];
      // toolAfterGame: tólið (t.d. ratsjáin) birtist fyrst þegar leikurinn er leystur, á eftir gameWin-textanum
      const reveal = () => { if (st.gameWin) { const w = $('.gamewin'); w.textContent = fill(st.gameWin); w.classList.remove('hidden'); } if (st.toolAfterGame) { const tl = $('.tool'); $('.answer').before(tl); tl.classList.remove('hidden'); } $('.answer').classList.remove('hidden'); $('.hintbtn') && $('.hintbtn').classList.remove('hidden'); };
      if (gated && done) { $('.game').innerHTML = '<div class="g-done">✓ Leyst!</div>'; reveal(); }
      else {
        if (gated) { $('.answer').classList.add('hidden'); if (st.toolAfterGame) $('.tool').classList.add('hidden'); }
        const stop = window.GAMES[st.game]($('.game'), st.gameOpts || {}, () => {
          p.games = p.games || {}; p.games[p.i] = true; setProg(team, p);
          FX.sound.success();
          if (gated) { reveal(); if (st.gameWin) Voice.auto(fill(st.gameWin), 700); setTimeout(() => $('.gamewin:not(.hidden)') ? $('.gamewin').scrollIntoView({ behavior: 'smooth', block: 'center' }) : $('.answer').scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }
        });
        if (typeof stop === 'function') onCleanup(stop);
      }
    }
  }

  /* ---------- Svör ---------- */
  function buildAnswer(team, st, p, el) {
    const a = st.answer, s = settings();
    const submit = (val, srcEl) => checkAnswer(team, st, p, val, srcEl);
    if (a.kind === 'pick') {
      el.innerHTML = `<div class="picks">${a.options.map(o => `<button class="pick" data-v="${o.v}"><span class="pe">${o.e}</span><span class="pt">${o.t}</span></button>`).join('')}</div>`;
      $$('.pick', el).forEach(b => b.addEventListener('click', () => submit(b.dataset.v, b)));
    } else if (a.kind === 'number') {
      el.innerHTML = `<div class="nums">${a.options.map(n => `<button class="num" data-v="${n}">${n}</button>`).join('')}</div>`;
      $$('.num', el).forEach(b => b.addEventListener('click', () => submit(+b.dataset.v, b)));
    } else if (a.kind === 'color') {
      el.innerHTML = `<div class="colors">${a.options.map(c => `<button class="col" data-v="${c}" style="--c:${D.colors[c].hex}"><span></span>${D.colors[c].name}</button>`).join('')}</div>`;
      $$('.col', el).forEach(b => b.addEventListener('click', () => submit(b.dataset.v, b)));
    } else if (a.kind === 'text') {
      el.innerHTML = `<form class="textans"><input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${a.placeholder || ''}"><button class="btn">Athuga ᚱ</button></form>`;
      $('form', el).addEventListener('submit', e => { e.preventDefault(); const i = $('input', el); if (i.value.trim()) submit(i.value, $('.btn', el)); });
    } else if (a.kind === 'code') {
      const cur = [0, 0, 0, 0];
      el.innerHTML = `<div class="codelock"><div class="cl-shackle"></div><div class="cl-body">${cur.map((d, k) => `<div class="dial" data-k="${k}"><button class="dup" aria-label="upp">▲</button><span class="dv">0</span><button class="ddown" aria-label="niður">▼</button></div>`).join('')}</div></div><button class="btn big cl-open">Opna rúnalásinn ᛝ</button>`;
      $$('.dial', el).forEach(d => {
        const k = +d.dataset.k, v = $('.dv', d);
        const set = n => { cur[k] = (n + 10) % 10; v.textContent = cur[k]; v.classList.remove('roll'); void v.offsetWidth; v.classList.add('roll'); FX.sound.tap(); };
        $('.dup', d).addEventListener('click', () => set(cur[k] + 1));
        $('.ddown', d).addEventListener('click', () => set(cur[k] - 1));
      });
      $('.cl-open', el).addEventListener('click', e => {
        const ok = cur.join('') === String(settings().lockCode);
        if (ok) { $('.codelock', el).classList.add('open'); FX.sound.boom(); setTimeout(() => submit(cur.join(''), $('.codelock', el)), 700); }
        else submit(cur.join(''), $('.codelock', el));
      });
    } else if (a.kind === 'digit') {
      el.innerHTML = `<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<button class="key" data-v="${d}">${d}</button>`).join('')}</div>`;
      $$('.key', el).forEach(b => b.addEventListener('click', () => submit(+b.dataset.v, b)));
    }
  }

  function isCorrect(st, val) {
    const a = st.answer, s = settings();
    switch (a.kind) {
      case 'pick': return val === a.correct;
      case 'number': return +val === +s[a.correctFrom];
      case 'color': return val === s[a.correctFrom];
      case 'digit': return String(val) === String(s.lockCode)[st.digit];
      case 'code': return String(val) === String(s.lockCode);
      case 'text': {
        const v = norm(val);
        return a.accept.some(x => a.contains ? v.includes(norm(x)) : v === norm(x));
      }
    }
    return false;
  }

  function checkAnswer(team, st, p, val, srcEl) {
    FX.sound.unlock();
    if (!isCorrect(st, val)) {
      FX.sound.wrong(); FX.vibrate([60, 40, 60]);
      const card = $('.card'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      if (srcEl) { srcEl.classList.add('nope'); setTimeout(() => srcEl.classList.remove('nope'), 700); }
      const fb = $('.feedback');
      if (team === 'trollar') { FX.sound.giggle(); trollPeek(); fb.textContent = 'Hehe, nei! Reynið aftur.'; }
      else fb.textContent = ['Rúnirnar dofna… reynið aftur.', 'Ekki alveg. Lesið aftur vandlega.', 'Ketill hristir höfuðið. Aftur!'][Math.floor(Math.random() * 3)];
      return;
    }
    // RÉTT!
    if (srcEl) srcEl.classList.add('yes');
    const r = (srcEl || $('.card')).getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    FX.sound.success(); FX.vibrate([40, 30, 120]);
    FX.burst(cx, cy, team === 'runir' ? ['#e9c56c', '#f7e8c4', '#c4472f', '#ffd68a'] : ['#e9c56c', '#f7e8c4', '#7fbf6a', '#ffd23d'], { runes: team === 'runir', n: 90 });

    Remote.send({ cmd: 'progress', from: team, team, i: p.i, title: st.title, phase: 'done' });
    if (st.tool === 'morse') Remote.send({ cmd: 'stop', from: team });
    if (st.digit != null) p.digits[st.digit] = +String(settings().lockCode)[st.digit];
    if (st.item) { const k = D[team].stations.filter(s => s.item).indexOf(st); p.items[k] = st.item; }
    const reward = st.digit != null ? String(settings().lockCode)[st.digit] : (st.item || 'ᚱ');

    const showOverlay = () => successOverlay(team, st, reward, () => {
      p.i++; p.phase = 'travel'; setProg(team, p); go('#/lid/' + team);
    });
    const vid = VIDS[team] && VIDS[team][p.i];
    if (vid && settings().videos !== false) playVideo(vidSrc(vid), () => setTimeout(showOverlay, 150), { skipText: 'Áfram ➜' });
    else setTimeout(showOverlay, 450);
  }

  function trollPeek() {
    const t = document.createElement('div'); t.className = 'peek'; t.innerHTML = `<img src="img/troll.webp?v=1794656451" alt=""><div class="bubble">Hehe!</div>`;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
  }

  function successOverlay(team, st, reward, onNext) {
    const o = document.createElement('div'); o.className = 'success ' + (team === 'runir' ? 's-rune' : 's-troll');
    const ring = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
    o.innerHTML = `
      <div class="s-inner">
        <svg class="s-ring" viewBox="-110 -110 220 220">
          <defs><path id="rc" d="M0,-88 a88,88 0 1,1 -0.1,0"/></defs>
          <circle r="96" class="s-c1"/><circle r="70" class="s-c2"/>
          <text class="s-runes"><textPath href="#rc">${ring}${ring.slice(0, 4)}</textPath></text>
        </svg>
        <div class="s-reward ${st.digit != null ? 'digit' : ''}">${reward}</div>
      </div>
      <div class="s-text"><div class="s-kick cinzel">${st.digit != null ? 'Ný tala í rúnalásinn!' : 'Vel gert!'}</div><p>${fill(st.success)}</p>${speakBtn(fill(st.success))}<button class="btn big s-next">Áfram! ➜</button></div>`;
    document.body.appendChild(o); wireSpeak(o); Voice.auto(fill(st.success), 700);
    requestAnimationFrame(() => o.classList.add('in'));
    $('.s-next', o).addEventListener('click', () => {
      Voice.stop(); FX.sound.whoosh();
      const rr = $('.s-reward', o).getBoundingClientRect();
      const slotSel = st.digit != null ? `.runelock .slot[data-slot="${st.digit}"]` : `.bag .slot[data-slot="${D[team].stations.filter(s => s.item).indexOf(st)}"]`;
      const slot = $(slotSel);
      const sr = slot ? slot.getBoundingClientRect() : { left: innerWidth / 2, top: 20, width: 0, height: 0 };
      o.classList.remove('in');
      FX.emojiFly(reward, { x: rr.left + rr.width / 2, y: rr.top + rr.height / 2 }, { x: sr.left + sr.width / 2, y: sr.top + sr.height / 2 }, () => { FX.sound.chime(); onNext(); });
      setTimeout(() => o.remove(), 400);
    });
  }

  /* ================= TÓL ================= */
  function buildTool(team, st, el) {
    const s = settings();
    switch (st.tool) {
      case 'runes': return toolRunes(st, el);
      case 'keyonly': el.innerHTML = `<button class="chip rk2">ᚱ Opna rúnalykil</button>`; $('.rk2', el).addEventListener('click', () => modal(runeKeyHTML(), 'rk')); return;
      case 'runekey': el.innerHTML = `<div class="kjarrmark"><span class="bigrune">ᛝ</span><span>= merki Ketils. Miðar með ᛞ eru gildrur frá Drumbi!</span></div><button class="chip rk2">Opna rúnalykil</button>`; $('.rk2', el).addEventListener('click', () => modal(runeKeyHTML(), 'rk')); return;
      case 'compass': return toolCompass(el);
      case 'morse': return toolMorse(el);
      case 'radar': return toolRadar(el);
      case 'sneak': return toolSneak(el);
    }
  }

  /* --- Rúnaskilaboð --- */
  function toolRunes(st, el) {
    const r = toRunes(st.runeText);
    el.innerHTML = `<div class="runestone"><div class="rs-text">${[...r].map((c, i) => `<span style="animation-delay:${(i * 0.08).toFixed(2)}s">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div></div>
      <button class="chip rk2">ᚱ Opna rúnalykil</button>`;
    $('.rk2', el).addEventListener('click', () => modal(runeKeyHTML(), 'rk'));
  }

  /* --- Áttaviti --- */
  function toolCompass(el) {
    const s = settings();
    el.innerHTML = `
      <div class="compass">
        <div class="cmp-dial"><div class="cmp-rose">
          <span class="c-n">N</span><span class="c-e">A</span><span class="c-s">S</span><span class="c-w">V</span>
          <div class="cmp-target" style="transform:rotate(${s.compassDeg}deg)"><span>ᛝ</span></div>
        </div><div class="cmp-needle"></div></div>
        <div class="cmp-info">Ýtið á takkann og haldið símanum flötum.</div>
        <button class="btn cmp-start">🧭 Kveikja á áttavitanum</button>
      </div>`;
    const info = $('.cmp-info', el), rose = $('.cmp-rose', el), box = $('.compass', el);
    let last = 0, aligned = false;
    function onHeading(h) {
      if (h == null || isNaN(h)) return;
      rose.style.transform = `rotate(${-h}deg)`;
      let diff = ((s.compassDeg - h + 540) % 360) - 180;
      const ok = Math.abs(diff) < 12;
      box.classList.toggle('aligned', ok);
      if (ok && !aligned) { FX.vibrate(80); FX.sound.ping(1200); }
      aligned = ok;
      const now = Date.now(); if (now - last < 150) return; last = now;
      info.innerHTML = ok ? `<b>BEINT ÁFRAM!</b> Gangið ${s.compassSteps} skref og teljið upphátt.` : (diff > 0 ? 'Snúið ykkur til <b>hægri</b> ➜' : '⬅ Snúið ykkur til <b>vinstri</b>');
    }
    function handler(e) {
      let h = null;
      if (e.webkitCompassHeading != null) h = e.webkitCompassHeading;
      else if (e.absolute || e.type === 'deviceorientationabsolute') h = 360 - e.alpha;
      if (h != null) { const so = (screen.orientation && screen.orientation.angle) || 0; onHeading((h + so) % 360); }
    }
    $('.cmp-start', el).addEventListener('click', async e => {
      try {
        if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
          const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') throw 0;
        }
        const evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
        addEventListener(evt, handler, true); onCleanup(() => removeEventListener(evt, handler, true));
        e.target.remove(); info.textContent = 'Snúið ykkur hægt í hring…';
        setTimeout(() => { if (rose.style.transform === '') info.innerHTML = `Áttavitinn svarar ekki í þessu tæki. Stefnan er <b>${dirName(s.compassDeg)}</b>. Notið kortið: farið í átt að ${s.compassDeg > 200 && s.compassDeg < 340 ? 'kjarrinu' : 'merkinu'}.`; }, 4000);
      } catch (err) {
        info.innerHTML = `Fékk ekki aðgang að áttavitanum. Stefnan er <b>${dirName(s.compassDeg)}</b>. Notið kortið!`;
      }
    });
  }

  /* --- Morse --- */
  function toolMorse(el) {
    const letters = 'ABDEFGHIJKLMNOPRSTUVXY'.split('');
    el.innerHTML = `
      <div class="morse">
        <div class="mo-out"><span class="mo-word"></span><span class="mo-cur"></span></div>
        <button class="mo-key">PIKKA<br><small>stutt = · &nbsp; langt = —</small></button>
        <div class="mo-row"><button class="chip mo-clear">Hreinsa</button><button class="chip mo-table-btn">Morse-tafla</button><button class="chip mo-again">💡 Ljósið aftur</button></div>
        <div class="mo-table hidden">${letters.map(l => `<div data-l="${l}"><b>${l}</b><span>${MORSE[l].replace(/\./g, '·').replace(/-/g, '—')}</span></div>`).join('')}</div>
      </div>`;
    const key = $('.mo-key', el), cur = $('.mo-cur', el), word = $('.mo-word', el);
    let down = 0, sym = '', timer = null;
    const commit = () => {
      if (!sym) return;
      const l = MORSE_REV[sym] || '?'; word.textContent += l; sym = ''; cur.textContent = '';
      $$('.mo-table div', el).forEach(d => d.classList.toggle('hit', d.dataset.l === l));
    };
    const press = e => { e.preventDefault(); FX.sound.unlock(); down = performance.now(); clearTimeout(timer); key.classList.add('on'); FX.beep(true); };
    const release = e => {
      e.preventDefault(); if (!down) return;
      const d = performance.now() - down; down = 0; key.classList.remove('on'); FX.beep(false);
      sym += d < 550 ? '.' : '-'; cur.textContent = sym.replace(/\./g, '·').replace(/-/g, '—');
      timer = setTimeout(commit, 1500);
    };
    key.addEventListener('pointerdown', press); key.addEventListener('pointerup', release); key.addEventListener('pointerleave', e => down && release(e));
    key.addEventListener('contextmenu', e => e.preventDefault());
    $('.mo-clear', el).addEventListener('click', () => { word.textContent = ''; sym = ''; cur.textContent = ''; });
    $('.mo-again', el).addEventListener('click', e => { Remote.send({ cmd: 'start', from: 'runir', word: fold(digitWord(String(settings().lockCode)[3])) }); toast('Ljósvitinn byrjar aftur á rauðu ljósi'); });
    $('.mo-table-btn', el).addEventListener('click', () => $('.mo-table', el).classList.toggle('hidden'));
  }

  /* --- Tröllaratsjá --- */
  function toolRadar(el) {
    const s = settings();
    el.innerHTML = `
      <div class="radar">
        <canvas width="520" height="520"></canvas>
        <div class="rd-temp">—</div>
        <div class="rd-info">${s.radar ? 'Ýtið á takkann og gangið hægt um.' : 'Fullorðni spæjarinn segir HEITT eða KALT!'}</div>
        <button class="btn rd-start">📡 Kveikja á ratsjánni</button>
      </div>`;
    const cv = $('canvas', el), ctx = cv.getContext('2d'), temp = $('.rd-temp', el), info = $('.rd-info', el);
    let dist = null, ang = 0, alive = true, nextPing = 0, blip = { a: Math.random() * 6.28, r: .7 };
    onCleanup(() => alive = false);
    const levels = [[6, 'SJÓÐANDI HEITT!', '#ff3d3d', 160], [12, 'Heitt!', '#ff8a3d', 300], [25, 'Volgt', '#ffd23d', 600], [45, 'Kalt', '#7cc8ff', 1000], [1e9, 'Ískalt', '#3d6bff', 1600]];
    function level() { if (dist == null) return null; return levels.find(l => dist < l[0]); }
    function draw(t) {
      if (!alive) return;
      const W = 520, c = W / 2; ctx.clearRect(0, 0, W, W);
      const lv = level(); const col = lv ? lv[2] : '#7cf2b0';
      ctx.strokeStyle = col; ctx.globalAlpha = .35; ctx.lineWidth = 2;
      for (let r = 50; r < c; r += 50) { ctx.beginPath(); ctx.arc(c, c, r, 0, 6.283); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0, c); ctx.lineTo(W, c); ctx.moveTo(c, 0); ctx.lineTo(c, W); ctx.stroke();
      ang += .035;
      const g = ctx.createConicGradient ? ctx.createConicGradient(ang - 1.2, c, c) : null;
      if (g) { g.addColorStop(0, 'transparent'); g.addColorStop(.19, col); g.addColorStop(.2, 'transparent'); ctx.globalAlpha = .45; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, c - 6, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(ang) * (c - 6), c + Math.sin(ang) * (c - 6)); ctx.stroke();
      // blip
      const br = dist == null ? blip.r : Math.min(.92, Math.max(.05, dist / 60));
      const bx = c + Math.cos(blip.a) * br * (c - 20), by = c + Math.sin(blip.a) * br * (c - 20);
      const since = ((ang - blip.a) % 6.283 + 6.283) % 6.283;
      ctx.globalAlpha = Math.max(.15, 1 - since / 4); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(bx, by, 14, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      if (running && t > nextPing) { FX.sound.ping(lv ? 1400 - lv[3] / 2 : 700); if (lv && lv[0] <= 12) FX.vibrate(40); nextPing = t + (lv ? lv[3] : 1400); }
      requestAnimationFrame(draw);
    }
    let running = false;
    requestAnimationFrame(draw);
    $('.rd-start', el).addEventListener('click', e => {
      FX.sound.unlock(); running = true; e.target.remove();
      if (!s.radar || !navigator.geolocation) { info.textContent = 'Ratsjáin leitar… Fullorðni spæjarinn segir HEITT eða KALT!'; return; }
      info.textContent = 'Leita að gervihnöttum…';
      const id = navigator.geolocation.watchPosition(pos => {
        const { latitude, longitude, accuracy } = pos.coords;
        dist = haversine(latitude, longitude, s.radar.lat, s.radar.lng);
        const lv = level(); temp.textContent = lv[1]; temp.style.color = lv[2];
        info.textContent = `Nákvæmni ±${Math.round(accuracy)} m`;
        const b = Math.atan2(s.radar.lat - latitude, s.radar.lng - longitude); blip.a = -b;
      }, err => { info.textContent = 'Fékk ekki staðsetningu. Fullorðni spæjarinn segir HEITT eða KALT!'; }, { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
      onCleanup(() => navigator.geolocation.clearWatch(id));
    });
  }
  function haversine(a, b, c, d) {
    const R = 6371000, t = x => x * Math.PI / 180;
    const dl = t(c - a), dn = t(d - b);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dn / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  /* --- Laumast að tröllinu --- */
  function toolSneak(el) {
    el.innerHTML = `
      <div class="sneak">
        <div class="sn-troll"><img src="img/troll.webp?v=1794656451" alt=""><div class="zzz"><span>z</span><span>z</span><span>Z</span></div><div class="sn-wake">HVAÐ?!</div></div>
        <div class="sn-meter"><div class="sn-bar"></div><div class="sn-line"></div></div>
        <div class="sn-info">Hljóðmælirinn sýnir hvort Drumbur heyrir í ykkur.</div>
        <div class="sn-row"><button class="chip sn-mic">🎤 Hljóðmælir</button><button class="chip sn-snore">🔊 Hrotur</button></div>
      </div>`;
    const bar = $('.sn-bar', el), box = $('.sneak', el), info = $('.sn-info', el);
    let snoring = false, waking = false;
    $('.sn-snore', el).addEventListener('click', e => { snoring = !snoring; snoring ? FX.snore.start() : FX.snore.stop(); e.target.classList.toggle('on', snoring); });
    function wake() {
      if (waking) return; waking = true;
      FX.snore.stop(); FX.sound.roar(); FX.vibrate([100, 50, 200]);
      box.classList.add('awake'); info.textContent = 'Úps! Drumbur rumskaði… Verið alveg kyrr!';
      setTimeout(() => { box.classList.remove('awake'); info.textContent = 'Hjúkk, hann sofnaði aftur. Læðist!'; waking = false; if (snoring) FX.snore.start(); }, 2600);
    }
    $('.sn-mic', el).addEventListener('click', async e => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const C = window.AudioContext || window.webkitAudioContext; const ac = new C();
        const src = ac.createMediaStreamSource(stream), an = ac.createAnalyser(); an.fftSize = 1024; src.connect(an);
        const buf = new Float32Array(an.fftSize); let alive = true, loud = 0;
        onCleanup(() => { alive = false; stream.getTracks().forEach(t => t.stop()); ac.close(); });
        e.target.classList.add('on'); e.target.disabled = true;
        const tick = () => {
          if (!alive) return;
          an.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v;
          const rms = Math.sqrt(s / buf.length), lvl = Math.min(1, rms * 9);
          bar.style.width = (lvl * 100) + '%'; bar.style.background = lvl > .6 ? '#ff4d5e' : lvl > .35 ? '#ffd23d' : '#7cf2b0';
          loud = lvl > .6 ? loud + 1 : 0; if (loud > 12) { loud = 0; wake(); }
          requestAnimationFrame(tick);
        };
        tick();
      } catch (err) { info.textContent = 'Fékk ekki hljóðnemann. Þá verðið þið bara að vera alveg rosalega hljóðlát!'; }
    });
  }

  /* ================= LOKASTÖÐ ================= */
  function renderFinale(team, p) {
    const other = team === 'trollar' ? 'runir' : 'trollar', O = D[other];
    const waitTxt = team === 'trollar' ? D.finale.waitTrollar : D.finale.waitRunir;
    const openTxt = 'Hvort lið opnar sinn lás. Stingið lyklunum í og snúið! Þegar báðir lásarnir eru opnir…';
    prefetchVid(VIDS.finale);
    const T = D[team], st = T.stations[p.i], s = settings();
    const ph = p.phase === 'travel' ? 'travel' : (p.fphase || 'wait');
    app.innerHTML = `
    <div class="screen station finale">
      ${headerHTML(team, p)}
      ${ph === 'travel' ? `<div class="mapwrap"><div class="map"></div></div>` : ''}
      <section class="card">
        <div class="kicker">Lokastöðin</div>
        <h2 class="cinzel">🔥 ${st.title}</h2>
        ${ph === 'travel' ? `
          <p class="story">${st.travel} ${speakBtn(st.travel)}</p>
          <button class="btn big arrive">Við erum komin að pottinum! 📍</button>` : `
          <div class="chest"><img src="img/kista.webp?v=1794656451" alt=""><div class="chest-glow"></div></div>
          <div class="locks">
            <div class="lock ${team === 'trollar' ? 'mine' : ''}"><span class="lk-i">🔑</span><b>Lás Drumbs</b><small>${team === 'trollar' ? 'Þið eruð með lykilinn hans Drumbs!' : D.trollar.kidsNom + ' eru með lykil Drumbs'}</small></div>
            <div class="lock ${team === 'runir' ? 'mine' : ''}"><span class="lk-i">🗝️</span><b>Lás Ketils</b><small>${team === 'runir' ? 'Þið eruð með lykil Ketils!' : D.runir.kidsNom + ' eru með lykil Ketils'}</small></div>
          </div>
          ${ph === 'wait' ? `
            <p class="story">${waitTxt} ${speakBtn(waitTxt)}</p>
            <div class="other-status">📡 <span>Hvar eru ${O.kidsNom}? Leita…</span></div>
            ${team === 'trollar' ? `<div class="guard-wrap"><div class="game guard"></div><div class="guard-done hidden">🛡️ Kistan er örugg! <button class="chip guard-again">Passa aftur 🔦</button></div></div>` : ''}
            <button class="btn big both">Bæði liðin eru komin! 🤝</button>` : `
            <p class="story">${openTxt} ${speakBtn(openTxt)}</p>
            <button class="btn big huge open">✨ KISTAN ER OPIN! ✨</button>`}
        `}
      </section>
    </div>`;
    wireHeader(team); wireSpeak(app); Voice.auto(ph === 'travel' ? st.travel : ph === 'wait' ? waitTxt : openTxt, 700);
    if (ph === 'travel') {
      const map = GaldraKort.create($('.map'));
      requestAnimationFrame(() => map.render({ done: T.stations.slice(0, p.i).map(x => x.place), target: st.place, prev: T.stations[p.i - 1].place, icon: '🔥' }));
      $('.arrive').addEventListener('click', () => { FX.sound.chime(); Remote.send({ cmd: 'progress', from: team, team, i: p.i, title: st.title, phase: 'arrived' }); p.phase = 'task'; p.fphase = 'wait'; setProg(team, p); renderFinale(team, p); });
    }
    if (ph === 'wait') {
      // Biðin: sýna hvar hitt liðið er (frá ntfy-rásinni) og lítill varðleikur fyrir strákana
      const os = $('.other-status span'), on = O.stations.length, who = O.kidsNom;
      const komin = other === 'runir' ? 'komnar' : 'komnir', bunin = other === 'runir' ? 'Búnar' : 'Búnir';
      let lastAt = 0, here = false;
      const since = Math.floor((p.startedAt || Date.now()) / 1000) - 2 * 3600;
      const stopListen = Remote.listen(m => {
        if (m.cmd !== 'progress' || m.team !== other || (m.at || 0) < lastAt) return;
        lastAt = m.at || 0;
        if (m.i >= on - 1) {
          os.textContent = `${who} eru ${komin} að pottinum! 🎉`;
          if (!here) { here = true; FX.sound.chime(); FX.vibrate([80, 40, 80]); toast(`${O.kidsNom} eru ${komin}!`, 4000); const b = $('.both'); if (b) b.style.animation = 'pulse 1.6s ease-in-out infinite'; }
        } else if (m.i === on - 2 && m.phase === 'done') os.textContent = `${who} eru á leiðinni að pottinum!`;
        else os.textContent = `${who}: ${m.phase === 'done' ? bunin.toLowerCase() + ' með' : 'á'} stöð ${m.i + 1} af ${on} (${m.title})`;
      }, ok => { if (!ok && !lastAt) os.textContent = `Hvar eru ${who}? Ekkert samband við netið.`; else if (ok && !lastAt) os.textContent = `Hvar eru ${who}? Ekki vitað enn.`; }, since);
      onCleanup(stopListen);
      const noNews = setTimeout(() => { if (!lastAt) os.textContent = `Hvar eru ${who}? Ekki vitað enn.`; }, 10000); onCleanup(() => clearTimeout(noNews));
      const g = $('.guard');
      if (g) {
        const startGuard = () => {
          $('.guard-done').classList.add('hidden');
          const stop = window.GAMES.flashlight(g, { count: 5, emoji: '👻', countLabel: 'Fundnir' }, () => { FX.sound.success(); $('.guard-done').classList.remove('hidden'); });
          if (typeof stop === 'function') onCleanup(stop);
        };
        startGuard();
        $('.guard-again').addEventListener('click', startGuard);
      }
    }
    const both = $('.both'); if (both) both.addEventListener('click', () => { cleanup(); FX.sound.fanfare(); p.fphase = 'open'; setProg(team, p); renderFinale(team, p); });
    const open = $('.open'); if (open) open.addEventListener('click', () => {
      if (settings().videos !== false) { FX.sound.unlock(); playVideo(vidSrc(VIDS.finale), () => celebrate(team, p), { skipText: 'Áfram ➜' }); }
      else celebrate(team, p);
    });
  }

  function celebrate(team, p) {
    p.done = true; setProg(team, p);
    document.body.classList.add('aurora-max');
    FX.sound.fanfare(); FX.vibrate([100, 60, 100, 60, 300]);
    FX.coinRain(90);
    let k = 0; const fw = setInterval(() => { FX.firework(innerWidth * (.15 + Math.random() * .7), innerHeight * (.12 + Math.random() * .35)); if (++k > 14) clearInterval(fw); }, 650);
    onCleanup(() => clearInterval(fw));
    const L = D.finale.trollLetter; window.scrollTo(0, 0);
    app.innerHTML = `
    <div class="screen celebrate">
      <div class="cel-title"><div class="runeline">ᛊᛁᛚᚠᚢᚱ ᛫ ᚠᚢᚾᛞᛁᛞ</div><h1 class="fraktur">Silfrið er fundið!</h1></div>
      <div class="chest open"><img src="img/kista.webp?v=1794656451" alt=""><div class="chest-glow"></div></div>
      <div class="letter"><img src="img/troll.webp?v=1794656451" alt="" class="letter-troll">${L.map(l => `<p>${l.replace(/\n/g, '<br>')}</p>`).join('')}</div>
      <p class="sig cinzel">Og frá mér: takk, kæru Jóhann, Hólmar, Katrín og Aría. Draugarnir eru sofnaðir aftur og silfrið er ykkar.<br>ᛝ Ketill hængur</p>
      <button class="btn more">🎆 Meiri flugeldar!</button>
      <a class="btn ghost" href="#/">Heim</a>
    </div>`;
    Voice.auto(L.join(' ') + ' ' + 'Og frá mér: takk, kæru Jóhann, Hólmar, Katrín og Aría. Draugarnir eru sofnaðir aftur og silfrið er ykkar. ᛝ Ketill hængur', 2500);
    $('.more').addEventListener('click', () => { for (let i = 0; i < 5; i++) setTimeout(() => FX.firework(innerWidth * (.15 + Math.random() * .7), innerHeight * (.15 + Math.random() * .4)), i * 300); FX.coinRain(30); });
  }

  /* ================= LEYNIVERKEFNI RÚNAMEISTARANNA (inni á meðan strákarnir eru úti) ================= */
  function renderBid() {
    document.body.classList.add('theme-rune');
    const B = D.bid, b = Object.assign({ garlic: false, morse: 0, go: false }, LS.get('bid', {}));
    const save = () => LS.set('bid', b);
    const TS = D.trollar.stations, on = TS.length;
    const letters = Object.keys(MORSE);
    app.innerHTML = `
    <div class="screen station bid">
      <a class="back" href="#/">‹</a>
      <div class="bid-top"><div class="kicker">Rúnameistararnir · Katrín og Aría</div><h1 class="cinzel">🤫 Leyniverkefni</h1></div>
      <section class="card"><p class="story">${B.intro} ${speakBtn(B.intro)}</p></section>
      <section class="card bid-garlic">
        <div class="kicker">Verkefni 1 af 3</div><h2 class="cinzel">🧄 Hvítlauksvörnin</h2>
        <p class="story">${B.garlic} ${speakBtn(B.garlic)}</p>
        <button class="btn big g-done"></button>
      </section>
      <section class="card bid-morse">
        <div class="kicker">Verkefni 2 af 3</div><h2 class="cinzel">📡 Merkjaskóli Ketils</h2>
        <p class="story">${B.morse} ${speakBtn(B.morse)}</p>
        <div class="ms-prog"></div>
        <div class="ms-play">
          <div class="ms-lamp"></div>
          <div class="mo-row"><button class="btn ms-show">▶ Sýna ljósið</button></div>
          <div class="morse">
            <div class="mo-out"><span class="mo-word"></span><span class="mo-cur"></span></div>
            <button class="mo-key">PIKKA<br><small>stutt = · &nbsp; langt = —</small></button>
            <div class="mo-row"><button class="chip mo-clear">Hreinsa</button><button class="chip ms-hint">💡 Vísbending</button></div>
            <p class="ms-code hidden"></p>
            <div class="mo-table">${letters.map(l => `<div data-l="${l}"><b>${l}</b><span>${MORSE[l].replace(/\./g, '·').replace(/-/g, '—')}</span></div>`).join('')}</div>
          </div>
        </div>
        <p class="story ms-done hidden">${B.morseDone} ${speakBtn(B.morseDone)}</p>
      </section>
      <section class="card bid-spy">
        <div class="kicker">Verkefni 3 af 3</div><h2 class="cinzel">🔭 Njósnaturninn</h2>
        <p class="story">${B.spy} ${speakBtn(B.spy)}</p>
        <ol class="spy-list">${TS.map((x, i) => `<li data-i="${i}"><span class="sp-i">${x.icon}</span><span class="sp-t">${x.title}</span><em></em></li>`).join('')}</ol>
        <div class="other-status">📡 <span>Leita að Tröllaspæjurunum…</span></div>
        <div class="spy-go hidden"><p class="story">${B.go} ${speakBtn(B.go)}</p><a class="btn big huge" href="#/lid/runir">Hefja leik Rúnameistaranna! 🗝️</a></div>
        <button class="chip spy-manual">Leiðsögumaður: strákarnir eru komnir að pottinum</button>
      </section>
    </div>`;
    wireSpeak(app); Voice.auto(B.intro, 700);

    // 1. Hvítlaukur
    const gb = $('.g-done');
    const gState = () => { gb.textContent = b.garlic ? '✓ Festarnar eru tilbúnar' : 'Festarnar eru tilbúnar! 🧄'; $('.bid-garlic').classList.toggle('done', b.garlic); };
    gState();
    gb.addEventListener('click', () => {
      if (b.garlic) return; b.garlic = true; save(); gState(); FX.sound.success(); toast('Draugarnir hörfa! 🧄');
      setTimeout(() => { $('.bid-morse').scrollIntoView({ behavior: 'smooth', block: 'start' }); Voice.play(B.morse); }, 900);
    });

    // 2. Morse-skóli
    const W = B.words, unit = 320, lamp = $('.ms-lamp'), out = $('.mo-word'), cur = $('.mo-cur'), key = $('.mo-key');
    let playing = 0;
    const stopLamp = () => { playing++; lamp.className = 'ms-lamp'; FX.beep(false); };
    onCleanup(stopLamp);
    const target = () => W[Math.min(b.morse, W.length - 1)];
    const mState = () => {
      const done = b.morse >= W.length;
      $('.ms-prog').innerHTML = W.map((w, i) => `<span class="${i < b.morse ? 'ok' : i === b.morse ? 'cur' : ''}">${i < b.morse ? w : 'Orð ' + (i + 1)}</span>`).join('');
      $('.ms-play').classList.toggle('hidden', done); $('.ms-done').classList.toggle('hidden', !done);
      $('.ms-code').textContent = done ? '' : [...target()].map(ch => MORSE[ch].replace(/\./g, '·').replace(/-/g, '—')).join('   ');
      $('.ms-code').classList.add('hidden');
      out.textContent = ''; cur.textContent = '';
    };
    mState();
    $('.ms-show').addEventListener('click', () => {
      FX.sound.unlock(); Voice.stop(); stopLamp(); const my = playing;
      const seq = morseSeq(target(), unit); let j = 0;
      const step = () => {
        if (my !== playing) return;
        if (j >= seq.length) { lamp.className = 'ms-lamp'; FX.beep(false); return; }
        const [st, ms] = seq[j++];
        lamp.className = 'ms-lamp' + (st === 'r' ? ' red' : st ? ' on' : ''); FX.beep(st === 1);
        setTimeout(step, ms);
      };
      step();
    });
    $('.ms-hint').addEventListener('click', () => $('.ms-code').classList.toggle('hidden'));
    let down = 0, sym = '', timer = null;
    const check = () => {
      const t = target(), got = out.textContent;
      if (got === t) {
        b.morse++; save(); FX.sound.success();
        if (b.morse >= W.length) { mState(); Voice.play(B.morseDone); setTimeout(() => $('.ms-done').scrollIntoView({ behavior: 'smooth', block: 'center' }), 300); }
        else { toast(`Rétt! ${t} ✓ Næsta orð`, 2200); setTimeout(mState, 900); }
      } else if (got.length >= t.length || !t.startsWith(got)) {
        FX.sound.wrong(); $('.bid-morse').classList.add('shake'); setTimeout(() => $('.bid-morse').classList.remove('shake'), 500);
        toast('Ekki alveg. Horfið aftur á ljósið!', 2200); setTimeout(() => { out.textContent = ''; }, 900);
      }
    };
    const commit = () => {
      if (!sym) return;
      const l = MORSE_REV[sym] || '?'; out.textContent += l; sym = ''; cur.textContent = '';
      $$('.bid .mo-table div').forEach(d => d.classList.toggle('hit', d.dataset.l === l));
      check();
    };
    const press = e => { e.preventDefault(); FX.sound.unlock(); stopLamp(); down = performance.now(); clearTimeout(timer); key.classList.add('on'); FX.beep(true); };
    const release = e => {
      e.preventDefault(); if (!down) return;
      const d = performance.now() - down; down = 0; key.classList.remove('on'); FX.beep(false);
      sym += d < 550 ? '.' : '-'; cur.textContent = sym.replace(/\./g, '·').replace(/-/g, '—');
      timer = setTimeout(commit, 1500);
    };
    key.addEventListener('pointerdown', press); key.addEventListener('pointerup', release); key.addEventListener('pointerleave', e => down && release(e));
    key.addEventListener('contextmenu', e => e.preventDefault());
    onCleanup(() => clearTimeout(timer));
    $('.mo-clear').addEventListener('click', () => { out.textContent = ''; sym = ''; cur.textContent = ''; });

    // 3. Njósnaturninn: hlustar á framvindu strákanna á rásinni
    const os = $('.other-status span');
    let lastAt = 0;
    const mark = (i, ph) => $$('.spy-list li').forEach(li => {
      const k = +li.dataset.i; const dn = k < i || (k === i && ph === 'done'), now = k === i && ph !== 'done';
      li.classList.toggle('done', dn); li.classList.toggle('now', now); $('em', li).textContent = dn ? '✓' : now ? '👣' : '';
    });
    const goNow = quiet => {
      if (!$('.spy-go').classList.contains('hidden')) return;
      b.go = true; save(); mark(on - 1, 'arrived');
      $('.spy-go').classList.remove('hidden'); const mb = $('.spy-manual'); if (mb) mb.remove();
      os.textContent = 'Tröllaspæjararnir eru komnir að pottinum! 🎉';
      if (!quiet) { FX.sound.fanfare(); FX.vibrate([80, 40, 80, 40, 200]); Voice.play(B.go); setTimeout(() => $('.spy-go').scrollIntoView({ behavior: 'smooth', block: 'center' }), 400); }
    };
    if (b.go) goNow(true);
    const since = Math.floor((LS.get('drawnAt', 0) || Date.now() - 3 * 3600e3) / 1000) - 60;
    const stopListen = Remote.listen(m => {
      if (m.cmd !== 'progress' || m.team !== 'trollar' || (m.at || 0) < lastAt) return;
      lastAt = m.at || 0;
      if (m.i >= on - 1) return goNow(false);
      mark(m.i, m.phase);
      os.textContent = `Tröllaspæjararnir eru ${m.phase === 'done' ? 'búnir með' : 'á'} stöð ${m.i + 1} af ${on}: ${m.title}`;
    }, ok => { if (lastAt || b.go) return; os.textContent = ok ? 'Tengt ✓ Bíð eftir fréttum af Tröllaspæjurunum…' : 'Ekkert samband við netið. Leiðsögumaðurinn lætur ykkur vita.'; }, since);
    onCleanup(stopListen);
    const mb = $('.spy-manual'); if (mb) mb.addEventListener('click', () => goNow(false));
  }

  /* ================= LJÓSVITINN (Morse í glugga) ================= */
  function morseSeq(word, unit) {
    // skilar lista af [ástand, ms]: 'r' = rautt merki, 1 = kveikt, 0 = slökkt
    const seq = [['r', 3500], [0, unit * 5]];
    const w = fold(word).replace(/[^A-Z]/g, '');
    [...w].forEach((ch, li) => {
      const code = MORSE[ch] || '';
      [...code].forEach((c, ci) => { seq.push([1, c === '.' ? unit : unit * 3]); if (ci < code.length - 1) seq.push([0, unit]); });
      if (li < w.length - 1) seq.push([0, unit * 4]);
    });
    seq.push([0, unit * 9]);
    return seq;
  }

  /* ---------- Fjarskipti (ntfy.sh — ókeypis skilaboðarás, enginn þjónn þarf) ---------- */
  const Remote = (() => {
    const base = 'https://ntfy.sh/' + encodeURIComponent(D.remoteTopic);
    const sid = Math.random().toString(36).slice(2);
    return {
      send(obj) {
        try { return fetch(base, { method: 'POST', body: JSON.stringify(Object.assign({ at: Date.now(), sid }, obj)) }).catch(() => { }); } catch (e) { }
      },
      listen(cb, onStatus, since) {
        let es; try { es = new EventSource(base + '/sse' + (since ? '?since=' + since : '')); } catch (e) { onStatus && onStatus(false); return () => { }; }
        es.onopen = () => onStatus && onStatus(true);
        es.onerror = () => { if (es.readyState === 2) onStatus && onStatus(false); };
        es.onmessage = e => {
          try { const d = JSON.parse(e.data); if (d.event && d.event !== 'message') return; const m = JSON.parse(d.message); if (m.sid === sid) return; cb(m); } catch (err) { }
        };
        return () => es.close();
      }
    };
  })();
  const clock = t => { const d = new Date(t || Date.now()), z = n => String(n).padStart(2, '0'); return `${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`; };

  /* ---------- Ljósvitinn (spjaldtölvan í glugganum) ---------- */
  function renderBeacon() {
    const s = settings();
    let word = digitWord(String(s.lockCode)[3]);
    const unit = LS.get('beaconUnit', 550);
    document.body.classList.add('beacon-mode');
    app.innerHTML = `<div class="beacon off"><div class="bc-status"></div><div class="bc-hint">Haltu fingri á skjánum í 2 sek til að kveikja/slökkva · tvísmelltu til að hætta</div></div>`;
    const b = $('.beacon'), st = $('.bc-status');
    let alive = true, i = 0, tm = null, mode = 'idle', connected = false, seq = morseSeq(word, unit), flashTm = null, prevMode = 'idle';
    FX._wantAwake = true; FX.keepAwake();
    const status = () => { st.textContent = `Ljósviti · ${mode === 'morse' ? 'blikkar ' + fold(word) : mode === 'flash' ? 'hvítt ljós' : 'bíður'} · ${connected ? 'tengdur ✓' : 'ekkert samband'}`; };
    const report = () => Remote.send({ cmd: 'state', from: 'viti', mode, word: fold(word), connected: true });
    const step = () => {
      if (!alive || mode !== 'morse') return;
      const [stt, ms] = seq[i % seq.length]; i++;
      b.className = 'beacon ' + (stt === 'r' ? 'red' : stt ? 'on' : 'off');
      tm = setTimeout(step, ms);
    };
    function setMode(m) {
      clearTimeout(tm); clearTimeout(flashTm); mode = m;
      if (m === 'morse') { i = 0; step(); }
      else if (m === 'flash') b.className = 'beacon on';
      else b.className = 'beacon off';
      status();
    }
    function handle(msg) {
      if (msg.from === 'viti') return;
      if (msg.cmd === 'start') { if (msg.word) { word = msg.word; seq = morseSeq(word, unit); } setMode('morse'); report(); }
      else if (msg.cmd === 'stop') { setMode('idle'); report(); }
      else if (msg.cmd === 'flash') { prevMode = mode === 'flash' ? prevMode : mode; setMode('flash'); flashTm = setTimeout(() => { setMode(prevMode); report(); }, (msg.sec || 15) * 1000); report(); }
      else if (msg.cmd === 'ping') report();
    }
    let reported = false;
    const close = Remote.listen(m => { connected = true; handle(m); }, ok => { connected = ok; status(); if (ok && !reported) { reported = true; report(); } });
    // öryggisnet: ef ekkert samband næst á 25 sek blikkar vitinn bara sjálfur
    const fallback = setTimeout(() => { if (!connected && mode === 'idle') setMode('morse'); }, 25000);
    status();
    onCleanup(() => { alive = false; close(); clearTimeout(tm); clearTimeout(flashTm); clearTimeout(fallback); try { document.fullscreenElement && document.exitFullscreen().catch(() => { }); } catch (e) { } });
    try { const fs = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); fs && fs.catch && fs.catch(() => { }); } catch (e) { }
    // handvirkt: halda fingri í 2 sek
    let press = null;
    const down = () => { press = setTimeout(() => { setMode(mode === 'morse' ? 'idle' : 'morse'); report(); FX.vibrate(80); }, 2000); };
    const up = () => clearTimeout(press);
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up);
    b.addEventListener('dblclick', () => go('#/hq'));
    let lastTap = 0; b.addEventListener('touchend', () => { const n = Date.now(); if (n - lastTap < 350) go('#/hq'); lastTap = n; });
  }

  /* ---------- Fjarstýringin (síminn hans pabba) ---------- */
  function renderRemote() {
    document.body.classList.add('theme-hq');
    if (sessionStorage.getItem('rl.hq') !== 'ok') { sessionStorage.setItem('rl.after', '#/fjarstyring'); return go('#/hq'); }
    const s = settings();
    const kids = LS.get('remote.kids', {});
    app.innerHTML = `
    <div class="screen hq remote">
      <header class="topbar"><a class="back" href="#/hq">‹</a><div class="tb-mid"><div class="tb-name cinzel">Fjarstýring ljósvitans</div></div><span></span></header>
      <section class="hqsec">
        <h3>Ljósvitinn</h3>
        <div class="rm-status"><span class="rm-dot"></span><div><b class="rm-state">Ekkert svar enn</b><div class="small rm-seen">Ýttu á „Athuga tengingu“</div></div></div>
        <div class="rm-grid">
          <button class="btn rm-start">▶ Byrja Morse</button>
          <button class="btn ghost rm-stop">■ Myrkur</button>
          <button class="btn ghost rm-flash">☀ Hvítt í 15 sek</button>
          <button class="btn ghost rm-ping">↻ Athuga tengingu</button>
        </div>
        <p class="small">Vitinn fer sjálfur í gang þegar Rúnameistararnir ýta á „Við erum komin“ á útsýnispallinum og slokknar þegar þær svara rétt. Hvíta ljósið er til að miða spjaldtölvunni út um gluggann.</p>
      </section>
      <section class="hqsec">
        <h3>Hvar eru krakkarnir?</h3>
        <div class="rm-kids">${['trollar', 'runir'].map(t => `<div class="rm-kid" data-t="${t}"><b>${D[t].short}</b><span>${kids[t] ? kids[t].txt : '—'}</span></div>`).join('')}</div>
      </section>
      <section class="hqsec"><h3>Atburðir</h3><ol class="rm-log"></ol><p class="small rm-conn">Tengist rásinni…</p></section>
    </div>`;
    const log = (txt) => { const li = document.createElement('li'); li.innerHTML = `<span>${clock()}</span> ${txt}`; $('.rm-log').prepend(li); };
    const setState = (m) => {
      const txt = m.mode === 'morse' ? `Blikkar ${m.word}` : m.mode === 'flash' ? 'Hvítt ljós' : 'Bíður (myrkur)';
      $('.rm-state').textContent = txt; $('.rm-seen').textContent = 'Svaraði kl. ' + clock(m.at);
      $('.rm-dot').className = 'rm-dot ' + (m.mode === 'morse' ? 'blink' : 'on');
    };
    const word = fold(digitWord(String(s.lockCode)[3]));
    let pinged = false;
    const close = Remote.listen(m => {
      if (m.cmd === 'state' && m.from === 'viti') { setState(m); log('Ljósvitinn: ' + $('.rm-state').textContent); }
      else if (m.cmd === 'progress') {
        const txt = `${m.phase === 'done' ? 'Búin með' : 'Komin á'} stöð ${m.i + 1}: ${m.title} · kl. ${clock(m.at).slice(0, 5)}`;
        const k = LS.get('remote.kids', {}); k[m.team] = { txt }; LS.set('remote.kids', k);
        const el = $(`.rm-kid[data-t="${m.team}"] span`); if (el) el.textContent = txt;
        log(`${D[m.team].short}: ${txt}`);
      }
      else if (m.cmd === 'start' && m.from !== 'pabbi') log('Rúnameistararnir ræstu ljósvitann');
      else if (m.cmd === 'stop' && m.from !== 'pabbi') log('Rúnameistararnir leystu Morse – vitinn slökktur');
    }, ok => { $('.rm-conn').textContent = ok ? 'Tengt við rásina ✓' : 'Ekkert samband við rásina – athugaðu netið'; if (ok && !pinged) { pinged = true; Remote.send({ cmd: 'ping', from: 'pabbi' }); } });
    onCleanup(close);
    const cmd = (c, extra) => { Remote.send(Object.assign({ cmd: c, from: 'pabbi', word }, extra || {})); FX.vibrate(30); toast('Sent ✓', 1200); };
    $('.rm-start').addEventListener('click', () => cmd('start'));
    $('.rm-stop').addEventListener('click', () => cmd('stop'));
    $('.rm-flash').addEventListener('click', () => cmd('flash', { sec: 15 }));
    $('.rm-ping').addEventListener('click', () => { $('.rm-state').textContent = 'Bíð eftir svari…'; cmd('ping'); });
  }

  /* ================= HÖFUÐSTÖÐVAR ================= */
  function renderHQ() {
    document.body.classList.add('theme-hq');
    if (sessionStorage.getItem('rl.hq') !== 'ok') {
      app.innerHTML = `<div class="screen hqgate"><a class="back" href="#/">‹</a><h1 class="cinzel">🔒 Höfuðstöðvar</h1><p>Bara fyrir fullorðna leikstjóra.</p><form><input type="password" placeholder="Lykilorð" autocomplete="off"><button class="btn">Opna</button></form></div>`;
      $('form').addEventListener('submit', e => { e.preventDefault(); if ($('input').value.trim().toLowerCase() === D.hqPin) { sessionStorage.setItem('rl.hq', 'ok'); const af = sessionStorage.getItem('rl.after'); if (af) { sessionStorage.removeItem('rl.after'); go(af); } else renderHQ(); } else { $('input').value = ''; toast('Rangt lykilorð'); } });
      return;
    }
    const tab = sessionStorage.getItem('rl.tab') || 'prep';
    const s = settings();
    app.innerHTML = `
    <div class="screen hq">
      <header class="topbar"><a class="back" href="#/">‹</a><div class="tb-mid"><div class="tb-name cinzel">Höfuðstöðvar</div></div><span></span></header>
      <nav class="tabs no-print">${[['prep', 'Undirbúningur'], ['print', 'Prentefni'], ['beacon', 'Ljósviti'], ['set', 'Stillingar'], ['ans', 'Svör']].map(([k, t]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${t}</button>`).join('')}</nav>
      <div class="hqbody">${HQ[tab](s)}</div>
    </div>`;
    $$('.tabs button').forEach(b => b.addEventListener('click', () => { sessionStorage.setItem('rl.tab', b.dataset.t); renderHQ(); }));
    (HQwire[tab] || (() => { }))(s);
  }

  const lockDigits = s => String(s.lockCode).split('');

  const PREP = s => {
    const L = lockDigits(s), col = D.colors[s.treeColor].pl, colDat = { graenn: 'grænum', raudur: 'rauðum', blar: 'bláum', gulur: 'gulum' }[s.treeColor] || '';
    return [
      { h: '1. Að kaupa', items: [
        'Ljósin sem eru til: 3 grænir, 2 bláir og 2 bleikir ljósastafir + 4 gulir glóhringir (eyrnalokkar). Það dugar: 2 bláir + 1 grænn í gestahúsið, 2 grænir í trén, 2 bleikir í álfaarmböndin og 4 gulu hringirnir í ljósahringinn. Allt annað finna krakkarnir með vasaljósunum.',
        '2 hengilásar með lykli (ef þeir eru ekki til heima)',
        'Súkkulaðipeningar eða eitthvað smá í kistuna'
      ] },
      { h: '2. Til heima', items: [
        'Kassi eða kista sem hægt er að læsa með tveimur hengilásum. Prófið báða lásana með lyklunum.',
        'Merkið lás og lykil Drumbs með D og lás og lykil Ketils með ᛝ (límband og tússpenni). Aukalyklarnir fara í vasa pabba.',
        'Hvítlauksrif á bandi fyrir strákana tvo („hvítlaukur Ketils“), gefið í upphafi leiks.',
        'Fyrir stelpurnar: 3 hvítlauksrif og band á borð inni í húsinu. Þær búa festarnar til sjálfar (fyrir sig og leiðsögumanninn) á meðan strákarnir eru úti.',
        'Stór ullarsokkur (tröllasokkurinn). Ef hinn sokkurinn úr parinu er til fer hann í bæli Drumbs.',
        'Teppi eða sæng í bæli Drumbs og dökkt teppi eða handklæði yfir kistuna',
        'Krukka með loki og tóm flaska með tappa + snæri',
        'Lítill steinn sem má teikna andlit á (tússpenni)',
        'Vasaljós eða höfuðljós fyrir hvert barn (nýjar rafhlöður)',
        'Auka sími eða spjaldtölva fyrir ljósvitann',
        'Glært límband, skæri og plastpokar svo miðarnir blotni ekki'
      ] },
      { h: '3. Prentefni', items: [
        'Prentið allt (flipinn Prentefni) og klippið út.',
        'EFTIRLÝSTUR: hengt upp í forstofunni. Strákarnir skoða það á meðan þeir klæða sig.',
        'Skírteini Tröllaspæjaranna: gefin Jóhanni og Hólmari áður en þeir byrja.',
        'Bréf Drumbs og viðurkenningarskjalið fara í kistuna með silfrinu.'
      ] },
      { h: '4. Símarnir', items: [
        'Hlaðið símana og spjaldtölvuna. Hljóðið í botn og slökkt á þöggunartakkanum.',
        'Stillingar: litur í trjánum og fjöldi ljósastafa í gestahúsinu verða að passa við það sem þið felið. Skráið stað steinsins við rústina (Tröllaratsjáin).',
        'Stillingarnar fara sjálfkrafa í öll tækin þegar þið vistið. Opnið síðuna einu sinni í hverju tæki (báðum símum og ljósvitanum) eftir að þið vistið.',
        'Opnið leikinn í síma hvors liðs og leyfið hljóðnema, staðsetningu og hreyfiskynjara þegar spurt er.'
      ] },
      { h: '5. Tröllaspæjararnir (felið kl. 14:30–15:30)', items: [
        'FORSTOFA: Ullarsokkurinn (ekkert ljós, strákarnir finna hann með vasaljósi). Allir klæða sig í forstofunni. Felið hann því vel (t.d. ofan í stígvéli) eða leggið hann þar rétt áður en strákarnir byrja.',
        `GESTAHÚS: ${s.glowCount} ljósastafir (2 bláir og 1 grænn) faldir um allt herbergi (undir rúmi, bak við gardínur, í skóm). Hafið ljósin KVEIKT. Strákarnir slökkva þau sjálfir og þá birtast „tröllasteinarnir“.`,
        `TRÉN VIÐ POTTINN: 2 ${col} ljósastafir hengdir hátt upp í greinarnar. Liturinn verður að vera sá sami og í Stillingum.`,
        'ÁLFAHÚSIÐ: Bleiku ljósastafirnir tveir, beygðir í armbönd (límband eða tengi), faldir Á BAK VIÐ álfahúsið (t.d. undir fötu eða í poka) svo glóðin sjáist ekki fyrr en álfarnir segja frá.',
        `RÚSTIN: Steinn með teiknuðu andliti (Steini litli), ekkert ljós. Felið hann 10–20 skref frá steinahrúgunni en ekki í ${dirName(s.compassDeg)} (þar er krukka stelpnanna). Standið á staðnum og skráið hann í Stillingum (Tröllaratsjáin).`,
        `BÆLIÐ: Sunnan við aðalhúsið. Hrúga af teppum eins og sofandi tröll. Lykill Drumbs í „hendinni“ (ekkert ljós, strákarnir lýsa á hann). Hinn ullarsokkurinn má standa út undan teppinu eins og tröllafótur.`
      ] },
      { h: '6. Rúnameistararnir (felið kl. 14:30–15:30)', items: [
        'AÐALHÚS: Ekkert að fela. Rúnirnar birtast á skjánum. Gefið stelpunum rúnameistarabréfin og rúnalyklana (Prentefni) í upphafi.',
        `GESTAHÚS: Spegilmiðinn (Prentefni, miði 1) hengdur LAUST á spegilinn, t.d. stunginn í rammann eða festur með einni límbandsræmu. Stelpurnar taka hann og halda honum upp að speglinum. Rúnirnar segja að fyrsta talan sé ${L[0]}.`,
        `RÚSTIN: Krukka merkt ᛝ með dulmálsmiðanum (miði 2, önnur talan ${L[1]}), ekkert ljós. Gangið ${s.compassSteps} stutt barnaskref í ${dirName(s.compassDeg)} frá rústinni og felið hana þar, t.d. bak við þúfu eða stein. Stelpurnar finna hana með vasaljósi.`,
        'KJARRIÐ: 11 miðar (Prentefni) í plastpokum hengdir á greinarnar (EKKI á ljósastafi, þó að prentaða blaðið segi það) í runnana í jaðri kjarrsins sem snýr að húsunum, á litlu svæði (10–15 m). 7 réttir (ᛝ, mynda HRINGUR) og 4 gildrur (ᛞ). Stelpurnar lýsa á runnana með vasaljósunum. Hengið miðana þar sem ljós endurkastast vel af hvíta pappírnum.',
        `LJÓSAHRINGURINN: 4 gulu glóhringirnir lagðir í hring (um 1,5 m) úti í mónum, helst á þúfur svo þeir sjáist, sunnan við kjarrið. Veljið stað sem sést vel frá kjarrinu en EKKI á leiðinni frá rústinni út í kjarrið (t.d. í laut eða í hvarfi við kjarrið). Annars fara stelpurnar beint í hringinn. Flöskuskeytið (miði 3, gátan, svar ${L[2]}) í miðjunni.`,
        `ÚTSÝNISPALLURINN: Sími eða spjaldtölva í glugga sem sést frá pallinum. Opnið Ljósvitann (blikkar ${fold(digitWord(L[3]))}). Fulla birtu á skjáinn.`,
        `LYKILL KETILS: Falinn ${s.girlsKeyPlace}, í poka eða krukku merktri ᛝ. EKKI með ljósastaf: stelpurnar standa á pallinum í Morse-þrautinni og myndu sjá glóðina strax. Þær finna lykilinn með vasaljósi.`
      ] },
      { h: '7. Lokastöðin', items: [
        'Kistan við pottinn, læst með báðum lásunum og falin undir dökku teppi (strákarnir eru við trén rétt hjá). Bréf Drumbs, viðurkenningin og silfrið inni í.',
        'Engin ljósaröð: kveikið útiljósin við pottinn svo krakkarnir „fylgi ljósunum“ þangað.'
      ] },
      { h: '8. Í leiknum', items: [
        'Allir horfa saman á upphafsmyndbandið (Sagan hefst á forsíðunni).',
        'Svo „Hver byrjar?“ á forsíðunni. Það lítur út eins og tilviljun en Tröllaspæjararnir byrja alltaf.',
        'Strákarnir fara fyrst út með leiðsögumanninum (um 35–45 mín.). Stelpurnar opna Leyniverkefnin í sínum síma: hvítlauksfestar, Morse-skóli og njósnaturn sem sýnir hvar strákarnir eru.',
        'Þegar strákarnir ýta á „Við erum komin að pottinum“ fær sími stelpnanna merki og þær hefja leik. Strákarnir passa kistuna smástund og fara svo inn með lykil Drumbs. Fullorðinn þarf að vera inni hjá þeim.',
        'Stelpurnar fara út með leiðsögumanninum (um 70–90 mín.). Þegar þær koma að pottinum hringir sími strákanna og þeir koma út með lykilinn.',
        'Við kistuna: horfið saman á lokamyndbandið í einum síma og ýtið á Sleppa í hinum.'
      ] },
      { h: '9. Öryggi', items: [
        'Vegurinn austan við jörðina er BANNSVÆÐI. Engar stöðvar nálægt honum.',
        'Lokið á heita pottinum á sínum stað. Strákarnir eru tvisvar við pottinn í myrkrinu.',
        'Fullorðinn fylgir Tröllaspæjurunum allan tímann og heldur í höndina á þeim úti á rústinni.',
        'Fullorðinn í humátt á eftir Rúnameisturunum við kjarrið og ljósahringinn.',
        'Hlý föt á alla og hlaðnir símar.'
      ] }
    ];
  };

  const HQ = {
    prep(s) {
      const done = LS.get('prepdone', {});
      return PREP(s).map((g, gi) => `<section class="hqsec"><h3 class="cinzel">${g.h}</h3>${g.items.map((it, ii) => `<label class="chk"><input type="checkbox" data-k="${gi}-${ii}" ${done[gi + '-' + ii] ? 'checked' : ''}><span>${it}</span></label>`).join('')}</section>`).join('')
        + `<p class="small">Ljósaskipti á laugardaginn um kl. 16. Felið allt í birtu, helst fyrir kl. 15:30. Ljósastafir lýsa daufar í kulda en endast lengur. Brjótið þá rétt áður en þið felið þá.</p>`;
    },
    print(s) {
      return `<section class="hqsec"><h3>Prentefni</h3>
        <p>Allt prentefnið er á einni síðu, tilbúið til prentunar á A4:</p>
        <ul class="plist"><li>Uppdráttur af jörðinni (fjársjóðskort)</li><li>Eftirlýst: Tröllið Drumbur</li><li>Tröllaspæjaraskírteini ×2</li><li>Rúnameistarabréf ×2 og rúnalyklar</li><li>Stöðvamiðar: spegill, krukka við rústina og flöskuskeyti</li><li>Miðar í kjarrið (bókstafir og gildrur)</li><li>Bréf Drumbs í kistuna</li><li>Viðurkenningarskjal fyrir fjársjóðsfinnendur</li></ul>
        <a class="btn big" href="print.html" target="_blank" rel="noopener">📜 Opna prentefnið</a>
        <p class="small">Ekkert prentara? Skrifið miðana upp með tússpenna. Rúnirnar eru á skjánum.</p></section>`;
    },
    beacon(s) {
      const w = digitWord(lockDigits(s)[3]);
      const unit = LS.get('beaconUnit', 550);
      return `<section class="hqsec"><h3>Ljósvitinn</h3>
        <p>Tvö tæki: <b>spjaldtölvan</b> í glugganum er ljósvitinn og <b>síminn þinn</b> er fjarstýringin. Bæði þurfa net (WiFi eða 4G).</p>
        <div class="rm-grid"><button class="btn startbeacon">💡 Þetta tæki er ljósvitinn</button><button class="btn ghost startremote">📱 Þetta tæki er fjarstýringin</button></div>
        <p>Ljósvitinn bíður í myrkri þar til hann fær merki. Þegar hann fer í gang verður skjárinn <b style="color:#9b2a1a">rauður</b> í 3,5 sek og svo blikkar hann <b>${fold(w)}</b> aftur og aftur:</p>
        <p class="morseprev">${[...fold(w)].map(c => `<span><b>${c}</b> ${(MORSE[c] || '').replace(/\./g, '·').replace(/-/g, '—')}</span>`).join('')}</p>
        <label class="row">Hraði (lengd punkts): <input type="range" min="300" max="900" step="50" value="${unit}" class="unit"> <span class="unitv">${unit} ms</span></label>
        <h3>Öryggisnet</h3>
        <ul class="plist"><li>Ef spjaldtölvan nær ekki sambandi á 25 sek byrjar hún sjálf að blikka og blikkar þá endalaust.</li><li>Haltu fingri á skjá spjaldtölvunnar í 2 sek til að kveikja eða slökkva handvirkt.</li><li>Stelpurnar geta beðið um ljósið aftur úr sínum síma.</li></ul>
        <p class="small">Á iPad: Stillingar → Skjár og birta → Sjálfvirk læsing → Aldrei. Hafðu hana í hleðslu og birtuna í botni.</p></section>`;
    },
    set(s) {
      const tp = getProg('trollar'), rp = getProg('runir');
      const opt = (team, p) => `<select data-team="${team}"><option value="">—</option>${D[team].stations.map((st, i) => `<option value="${i}" ${p && p.i === i ? 'selected' : ''}>${i + 1}. ${st.title}</option>`).join('')}</select>`;
      return `
      <section class="hqsec"><h3 class="cinzel">Kistan og stöðvarnar</h3>
        <label class="row">Rúnakóðinn (4 tölur) <input class="f-code" inputmode="numeric" maxlength="4" value="${s.lockCode}"></label>
        <label class="row">Lykill Ketils falinn <input class="f-key" value="${s.girlsKeyPlace}"></label>
        <label class="row">Ljósastafir í gestahúsinu <input class="f-glow" type="number" min="3" max="7" value="${s.glowCount}"></label>
        <label class="row">Litur í trjánum <select class="f-color">${Object.entries(D.colors).map(([k, c]) => `<option value="${k}" ${k === s.treeColor ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
        <label class="row">Áttaviti: stefna (°) <input class="f-deg" type="number" min="0" max="359" value="${s.compassDeg}"></label>
        <label class="row">Áttaviti: skref <input class="f-steps" type="number" min="5" max="80" value="${s.compassSteps}"></label>
        <label class="row">Myndbönd milli þrauta <input class="f-vids" type="checkbox" ${s.videos !== false ? 'checked' : ''}></label>
        <label class="row">Sögumaður les textana upphátt <input class="f-voice" type="checkbox" ${s.voice !== false ? 'checked' : ''}></label>
        <button class="btn save">Vista</button>
      </section>
      <section class="hqsec"><h3 class="cinzel">Tröllaratsjáin (rústin)</h3>
        <p>Standið þar sem steinninn er falinn og ýtið á takkann. Staðsetningin fer sjálfkrafa í hin tækin.</p>
        <p class="gps">${s.radar ? `Skráð: ${s.radar.lat.toFixed(6)}, ${s.radar.lng.toFixed(6)}` : 'Ekki skráð. Þá segir fullorðinn heitt/kalt.'}</p>
        <button class="btn gpsbtn">📍 Skrá falinn stað hér</button>
      </section>
      <section class="hqsec"><h3 class="cinzel">Stillingar í öðrum tækjum</h3>
        <p>Þegar þú vistar fara stillingarnar sjálfkrafa í öll hin tækin (síma, spjaldtölvu, ljósvitann) næst þegar síðan er opnuð, eða innan tveggja mínútna. Hlekkurinn er bara til vara ef netið bregst.</p>
        <button class="btn sharebtn">🔗 Afrita hlekk með stillingum</button>
      </section>
      <section class="hqsec"><h3 class="cinzel">Staða liðanna</h3>
        <label class="row">Tröllaspæjarar ${opt('trollar', tp)}</label>
        <label class="row">Rúnameistarar ${opt('runir', rp)}</label>
        <div class="row2"><button class="btn ghost reset" data-team="trollar">Byrja strákana upp á nýtt</button><button class="btn ghost reset" data-team="runir">Byrja stelpurnar upp á nýtt</button></div>
      </section>`;
    },
    ans(s) {
      const L = lockDigits(s);
      const a = st => {
        const x = st.answer; if (!x) return '—';
        if (x.kind === 'pick') { const o = x.options.find(o => o.v === x.correct); return `${o.e} ${o.t}`; }
        if (x.kind === 'number') return s[x.correctFrom];
        if (x.kind === 'color') return D.colors[s[x.correctFrom]].name;
        if (x.kind === 'digit') return `${L[st.digit]} (${digitWord(L[st.digit])})`;
        if (x.kind === 'text') return x.accept[0];
        if (x.kind === 'code') return L.join('');
      };
      return ['trollar', 'runir'].map(t => `<section class="hqsec"><h3 class="cinzel">${D[t].name}</h3><ol class="anslist">${D[t].stations.map(st => `<li><b>${st.title}</b> <span>${a(st)}</span></li>`).join('')}</ol></section>`).join('')
        + `<p>Rúnakóðinn: <b>${L.join(' ')}</b> · Lykill Ketils: <b>${s.girlsKeyPlace}</b> · Lykilorð HQ: <b>${D.hqPin}</b></p>`;
    }
  };

  const HQwire = {
    prep() {
      $$('.chk input').forEach(c => c.addEventListener('change', () => { const d = LS.get('prepdone', {}); d[c.dataset.k] = c.checked; LS.set('prepdone', d); }));
    },
    beacon() {
      const r = $('.unit'); r.addEventListener('input', () => { $('.unitv').textContent = r.value + ' ms'; LS.set('beaconUnit', +r.value); });
      $('.startbeacon').addEventListener('click', () => go('#/viti'));
      $('.startremote').addEventListener('click', () => go('#/fjarstyring'));
    },
    set(s) {
      $('.save').addEventListener('click', () => {
        const code = $('.f-code').value.replace(/\D/g, '');
        if (code.length !== 4) return toast('Kóðinn þarf að vera 4 tölustafir');
        saveSettings({ lockCode: code, girlsKeyPlace: $('.f-key').value.trim() || D.defaults.girlsKeyPlace, glowCount: +$('.f-glow').value, treeColor: $('.f-color').value, compassDeg: +$('.f-deg').value % 360, compassSteps: +$('.f-steps').value, videos: $('.f-vids').checked, voice: $('.f-voice').checked });
        toast('Vistað ✓'); pushSettings(); renderHQ();
      });
      $('.gpsbtn').addEventListener('click', e => {
        if (!navigator.geolocation) return toast('Engin staðsetning í þessu tæki');
        e.target.disabled = true; e.target.textContent = 'Mæli… (10 sek)';
        const pts = []; const id = navigator.geolocation.watchPosition(p => pts.push(p.coords), () => { }, { enableHighAccuracy: true, maximumAge: 0 });
        setTimeout(() => {
          navigator.geolocation.clearWatch(id);
          if (!pts.length) { toast('Fékk ekki staðsetningu'); renderHQ(); return; }
          pts.sort((a, b) => a.accuracy - b.accuracy); const best = pts.slice(0, Math.max(1, Math.ceil(pts.length / 2)));
          const lat = best.reduce((x, p) => x + p.latitude, 0) / best.length, lng = best.reduce((x, p) => x + p.longitude, 0) / best.length;
          saveSettings({ radar: { lat, lng } }); pushSettings(); toast(`Skráð ✓ (±${Math.round(best[0].accuracy)} m)`); renderHQ();
        }, 10000);
      });
      $('.sharebtn').addEventListener('click', async () => {
        const url = location.origin + location.pathname + '#/s/' + btoa(unescape(encodeURIComponent(JSON.stringify(LS.get('settings', {})))));
        try { await navigator.clipboard.writeText(url); toast('Hlekkur afritaður ✓ Opnið hann í hinu tækinu.'); }
        catch (e) { prompt('Afritið þennan hlekk:', url); }
      });
      $$('select[data-team]').forEach(sel => sel.addEventListener('change', () => {
        const t = sel.dataset.team; if (sel.value === '') return;
        const p = getProg(t) || { digits: [], items: [], startedAt: Date.now() };
        const i = +sel.value; p.i = i; p.phase = 'travel'; p.done = false; p.fphase = null;
        // fylla inn það sem á að vera komið
        const sx = settings(); p.digits = []; p.items = [];
        D[t].stations.slice(0, i).forEach(st => { if (st.digit != null) p.digits[st.digit] = +String(sx.lockCode)[st.digit]; if (st.item) p.items[D[t].stations.filter(z => z.item).indexOf(st)] = st.item; });
        setProg(t, p); toast('Liðið fært ✓');
      }));
      $$('.reset').forEach(b => b.addEventListener('click', () => { if (confirm('Viss?')) { LS.del('prog.' + b.dataset.team); toast('Byrjað upp á nýtt ✓'); renderHQ(); } }));
    }
  };

  /* ================= Samstilling stillinga milli tækja ================= */
  function pushSettings() {
    const at = Date.now(); LS.set('settingsAt', at);
    Remote.send({ cmd: 'settings', s: LS.get('settings', {}), sat: at });
  }
  let pulling = false;
  async function pullSettings() {
    if (pulling) return; pulling = true;
    try {
      const r = await fetch('https://ntfy.sh/' + encodeURIComponent(D.remoteTopic) + '/json?poll=1&since=24h', { cache: 'no-store' });
      const txt = await r.text(); let best = null;
      txt.split('\n').forEach(line => { try { const d = JSON.parse(line); if (d.event && d.event !== 'message') return; const m = JSON.parse(d.message); if (m.cmd === 'settings' && m.s && m.sat && (!best || m.sat > best.sat)) best = m; } catch (e) { } });
      if (best && best.sat > LS.get('settingsAt', 0)) {
        LS.set('settings', best.s); LS.set('settingsAt', best.sat);
        const h = location.hash.replace(/^#\/?/, '');
        const ae = document.activeElement; if (h === '' || (h === 'hq' && !(ae && /INPUT|SELECT|TEXTAREA/.test(ae.tagName)))) route();
        toast('Stillingar uppfærðar ✓');
      }
    } catch (e) { } finally { pulling = false; }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pullSettings(); });
  setInterval(pullSettings, 90000);

  /* ================= Ræsing ================= */
  FX.sky(document.getElementById('sky'));
  route();
  pullSettings();
})();

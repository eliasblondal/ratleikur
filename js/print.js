/* Prentefnið — allar síður búnar til úr data.js og stillingum */
(function () {
  const D = window.RATLEIKUR;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('ratleikur.settings') || '{}'); } catch (e) { }
  const S = Object.assign({}, D.defaults, saved);
  const L = String(S.lockCode).split('');
  const W = d => D.numberWords[+d];

  const RUNEMAP = { A: 'ᚨ', B: 'ᛒ', D: 'ᛞ', E: 'ᛖ', F: 'ᚠ', G: 'ᚷ', H: 'ᚺ', I: 'ᛁ', J: 'ᛃ', K: 'ᚲ', L: 'ᛚ', M: 'ᛗ', N: 'ᚾ', O: 'ᛟ', P: 'ᛈ', R: 'ᚱ', S: 'ᛊ', T: 'ᛏ', U: 'ᚢ', V: 'ᚹ', Y: 'ᛇ', 'Þ': 'ᚦ', 'Æ': 'ᚫ' };
  const RUNEKEY = [['A', 'ᚨ'], ['B', 'ᛒ'], ['D/Ð', 'ᛞ'], ['E', 'ᛖ'], ['F', 'ᚠ'], ['G', 'ᚷ'], ['H', 'ᚺ'], ['I', 'ᛁ'], ['J', 'ᛃ'], ['K', 'ᚲ'], ['L', 'ᛚ'], ['M', 'ᛗ'], ['N', 'ᚾ'], ['O/Ö', 'ᛟ'], ['P', 'ᛈ'], ['R', 'ᚱ'], ['S', 'ᛊ'], ['T', 'ᛏ'], ['U', 'ᚢ'], ['V', 'ᚹ'], ['Y', 'ᛇ'], ['Þ', 'ᚦ'], ['Æ', 'ᚫ']];
  const toRunes = t => t.toUpperCase().split(' ').map(w => [...w].map(ch => RUNEMAP[ch] || RUNEMAP[(ch === 'Ð' ? 'D' : ch.normalize('NFD').replace(/[̀-ͯ]/g, ''))] || '').join('')).join(' ᛫ ');
  const runeKey = () => `<div class="rkey">${RUNEKEY.map(([l, r]) => `<div><b>${r}</b><span>${l}</span></div>`).join('')}</div>`;
  const DATE = 'laugardaginn 14. nóvember 2026';
  const ALPHA = ['A', 'Á', 'B', 'D', 'Ð', 'E', 'É', 'F', 'G', 'H', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'O', 'Ó', 'P', 'R', 'S', 'T', 'U', 'Ú', 'V', 'X', 'Y', 'Ý', 'Þ', 'Æ', 'Ö'];
  const CAESAR = (t, k) => [...t.toUpperCase()].map(c => { const i = ALPHA.indexOf(c); return i < 0 ? c : ALPHA[(i + k) % ALPHA.length]; }).join('');

  const pages = [];

  /* 1. Kortið */
  const big = GaldraKort.buildSVG({ print: true, viewBox: { x: 230, y: 20, w: 1740, h: 1140 } });
  const inset = GaldraKort.buildSVG({ nofog: true, viewBox: { x: 915, y: 300, w: 205, h: 150 } }).replace('class="mapsvg ', 'class="mapsvg insetmap ');
  pages.push(`<section class="page land">
    <div class="frame"></div>
    <div class="mapbig">${big}</div>
    <div class="inset"><div class="inset-t">Húsin á Stillu</div>${inset}</div>
  </section>`);

  /* 2. Eftirlýstur */
  pages.push(`<section class="page">
    <div class="frame"></div>
    <div class="wanted">
      <div class="w-top">Eftirlýstur</div>
      <div class="w-sub">fyrir að stela silfurkistu Ketils hængs</div>
      <div class="w-img"><img src="img/troll.webp?v=1794571856" alt=""></div>
      <div class="w-name">Tröllið Drumbur</div>
      <ul class="w-list">
        <li><b>Þekkist á:</b> risastóru kartöflunefi og mosa um allan kroppinn</li>
        <li><b>Klæðnaður:</b> bara í EINUM ullarsokk</li>
        <li><b>Hættulegur?</b> Nei. Bara mjög klaufskur.</li>
        <li><b>Veikleiki:</b> þolir ekki ljós. Verður að steini í dagsbirtu.</li>
        <li><b>Lykt:</b> fussum svei! Tröllalykt.</li>
        <li><b>Sást síðast:</b> í nótt, á Stillu á Rangárvöllum</li>
      </ul>
      <div class="w-reward">Fundarlaun: <span>Silfur Ketils hængs</span></div>
      <div class="w-sign">ᛝ Ketill hængur, landnámsmaður</div>
    </div>
  </section>`);

  /* 3. Tröllaspæjaraskírteini */
  const badge = (n, name) => `<div class="cert badge">
      <div class="b-head"><span class="b-ico">🔦</span><div><div class="b-t">Tröllaspæjari</div><div class="b-s">Spæjaraskírteini nr. 00${n}</div></div></div>
      <div class="b-body">
        <div class="b-photo"><img src="img/troll.webp?v=1794571856" alt=""><span class="b-stamp">ELTUR</span></div>
        <div class="b-fields">
          <div class="field">Nafn: <span class="hand">${name}</span></div>
          <div class="field">Undirskrift:</div>
          <p>Handhafi þessa skírteinis má elta tröll í myrkri, lýsa á þau með vasaljósi og taka af þeim stolna lykla.</p>
          <p class="b-date">Gildir ${DATE}</p>
        </div>
      </div>
      <div class="b-seal">ᛏ</div>
    </div>`;
  pages.push(`<section class="page"><div class="frame"></div><h2 class="ph">Skírteini Tröllaspæjaranna</h2><p class="pn">Klippið út og gefið Jóhanni og Hólmari í upphafi leiks.</p>${badge(1, D.trollar.kids[0])}<div class="cut"></div>${badge(2, D.trollar.kids[1])}</section>`);

  /* 4. Rúnameistarabréf */
  const diploma = (n, name) => `<div class="cert diploma">
      <div class="d-runes">${toRunes('RÚNAMEISTARI KETILS HÆNGS')}</div>
      <div class="d-t">Rúnameistari</div>
      <div class="d-body">
        <img src="img/ketill.webp?v=1794571856" alt="">
        <div>
          <p>Hér með staðfestist að</p>
          <div class="field big"><span class="hand">${name}</span></div>
          <p>kann að lesa rúnir Ketils hængs og má leita að silfri hans á Stillu á Rangárvöllum.</p>
          <p class="b-date">${DATE}</p>
        </div>
      </div>
      <div class="d-sign">ᛝ Ketill hængur</div>
    </div>`;
  pages.push(`<section class="page"><div class="frame"></div><h2 class="ph">Bréf Rúnameistaranna</h2><p class="pn">Klippið út og gefið Katrínu og Aríu í upphafi leiks.</p>${diploma(1, D.runir.kids[0])}<div class="cut"></div>${diploma(2, D.runir.kids[1])}</section>`);

  /* 5. Rúnalyklar */
  const keycard = () => `<div class="cert keycard"><div class="d-t sm">Rúnalykill Ketils</div>${runeKey()}<p class="kc-n">Orðaskil eru merkt með ᛫ · Merki Ketils er ᛝ</p></div>`;
  pages.push(`<section class="page"><div class="frame"></div><h2 class="ph">Rúnalyklar</h2><p class="pn">Einn fyrir Katrínu og einn fyrir Aríu. Má plasta eða setja í plastvasa.</p>${keycard()}<div class="cut"></div>${keycard()}</section>`);

  /* 6. Stöðvamiðar */
  // Leiðbeiningar fyrir fullorðna eru UTAN við miðana (klipptar frá) svo stelpurnar sjái ekki svörin.
  pages.push(`<section class="page"><div class="frame"></div><h2 class="ph">Stöðvamiðar Rúnameistaranna</h2>
    <p class="pn">Klippið eftir strikalínunum. Rauðu línurnar eru bara fyrir fullorðna og eru klipptar frá.</p>
    <div class="slip-l">Miði 1 · Gestahúsið: hengist LAUST á spegilinn (fyrsta talan = ${L[0]})</div>
    <div class="cut thin"></div>
    <div class="slip">
      <div class="mirror mrunes">${toRunes('FYRSTA TALAN ER ' + W(L[0])).split(' ᛫ ').map(w => `<span>${w}</span>`).join(' ᛫ ')}</div><div class="psig mirror-sig">ᛝ</div></div>
    <div class="cut"></div>
    <div class="slip-l">Miði 2 · Rústin: í krukkuna merkta ᛝ (önnur talan = ${L[1]})</div>
    <div class="cut thin"></div>
    <div class="slip">
      <p class="wheelkey">Hjól Ketils: stillið hjólið þannig að ytra <b>A</b> standi yfir innra <b>D</b></p>
      <div class="pcaesar">${CAESAR('ÖNNUR TALAN ER ' + W(L[1]), 3)}</div><div class="psig">ᛝ Ketill</div></div>
    <div class="cut"></div>
    <div class="slip-l">Miði 3 · Ljósahringurinn: rúllið upp og setjið í flöskuna (þriðja talan = ${L[2]})</div>
    <div class="cut thin"></div>
    <div class="slip letterslip">
      <p>Kæru rúnameistarar.</p><p>Þriðja tala rúnakóðans er svarið við þessari gátu:</p>
      <p class="riddle">${D.riddles[+L[2]]}</p><p class="psig">ᛝ Ketill</p></div>
  </section>`);

  /* 7. Kjarrið */
  const good = ['H', 'R', 'I', 'N', 'G', 'U', 'R'], bad = ['S', 'T', 'L', 'Á'];
  const order = [6, 7, 0, 3, 8, 1, 9, 4, 2, 10, 5];
  const all = [...good.map(l => ({ l, m: 'ᛝ' })), ...bad.map(l => ({ l, m: 'ᛞ' }))];
  pages.push(`<section class="page"><div class="frame"></div><h2 class="ph">Miðarnir í kjarrið</h2>
    <p class="pn">Klippið út og bindið hvern miða á ljósastaf. Hengið þá í jaðar kjarrsins sem snýr að húsunum, á litlu svæði. 7 réttir (ᛝ = merki Ketils, mynda HRINGUR) og 4 gildrur (ᛞ = Drumbur).</p>
    <div class="ptags">${order.map(i => all[i]).map(t => `<div class="ptag"><span class="tm">${t.m}</span><span class="tl">${t.l}</span></div>`).join('')}</div>
  </section>`);

  /* 8. Bréf Drumbs */
  pages.push(`<section class="page"><div class="frame"></div>
    <div class="trolletter">
      <img src="img/troll.webp?v=1794571856" alt="">
      ${D.finale.trollLetter.map(l => `<p>${l.replace(/\n/g, '<br>')}</p>`).join('')}
      <div class="smudge"></div>
    </div>
    <p class="pn center">Setjið þetta bréf í kistuna með silfrinu.</p>
  </section>`);

  /* 9. Viðurkenningarskjal */
  pages.push(`<section class="page"><div class="frame"></div>
    <div class="award">
      <div class="d-runes">${toRunes('STILLA')} ᛫ ${toRunes('SILFUR KETILS HÆNGS')}</div>
      <div class="a-t">Viðurkenning</div>
      <div class="a-s">Fjársjóðsfinnendur</div>
      <img src="img/kista.webp?v=1794571856" alt="">
      <p>Hér með staðfestist að</p>
      ${[...D.trollar.kids, ...D.runir.kids].map(k => `<div class="field big"><span class="hand">${k}</span></div>`).join('')}
      <p>eltu tröllið Drumb, réðu í rúnir Ketils hængs og fundu silfrið hans á Stillu ${DATE}.</p>
      <div class="a-signs"><div>ᛝ Ketill hængur</div><div>Drumbur <span>(sem fékk sokkinn sinn aftur)</span></div></div>
    </div>
  </section>`);

  document.getElementById('pages').innerHTML = pages.join('');
})();

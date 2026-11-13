/* =========================================================
   SILFUR KETILS HÆNGS — allt efni ratleiksins á einum stað.
   Breyttu textum, svörum og stillingum hér.
   ========================================================= */

window.RATLEIKUR = {

  // Lykilorð fyrir Höfuðstöðvarnar (#/hq)
  hqPin: 'ketill',

  // Rás fyrir fjarstýringu ljósvitans (ntfy.sh). Breytið í eitthvað annað ef þið viljið eigin rás.
  remoteTopic: 'stilla-ketill-k7x2q9m4',

  // ---- Sjálfgefnar stillingar (hægt að breyta í Höfuðstöðvunum) ----
  defaults: {
    lockCode: '4785',        // rúnakóðinn sem stelpurnar safna (4 tölustafir) — opnar rúnalásinn í appinu
    glowCount: 5,            // fjöldi ljósastafa í gestahúsinu (strákar)
    treeColor: 'graenn',     // litur ljósastafanna í trjánum (graenn | raudur | blar | gulur)
    compassDeg: 270,         // stefna frá rústinni að falinni krukku (270 = vestur)
    compassSteps: 25,        // skref frá rústinni
    radar: null,             // {lat,lng} — falinn steinn við rústina (skráð í Höfuðstöðvum)
    girlsKeyPlace: 'undir útsýnispallinum'
  },

  numberWords: ['NÚLL','EINN','TVEIR','ÞRÍR','FJÓRIR','FIMM','SEX','SJÖ','ÁTTA','NÍU'],

  // Gátan í flöskuskeytinu (Rúnameistararnir, ljósahringurinn). Svarið er 3. tala rúnakóðans.
  riddles: [
    'Hve marga fætur hefur fiskur?',
    'Hve mörg nef hefur tröllið Drumbur?',
    'Hve marga fætur hefur einn hrafn?',
    'Hve mörg horn hefur þríhyrningur?',
    'Hve marga fætur hefur ein kind?',
    'Hve marga fingur hefur ein hönd?',
    'Hve marga fætur hafa þrír hrafnar samtals?',
    'Hve margir dagar eru í einni viku?',
    'Hve marga fætur hafa tveir hrafnar og ein kind samtals?',
    'Hve mikið er þrisvar sinnum þrír?'
  ],
  // Vísbending við hverri gátu (birtist í appinu í stað {riddlehint})
  riddleHints: [
    'Fiskar synda. Hafa þeir einhverja fætur?',
    'Drumbur er með eitt risastórt kartöflunef.',
    'Hrafn er fugl. Fuglar standa á jafn mörgum fótum og þið.',
    'Þrí þýðir þrír. Teljið hornin.',
    'Kind gengur eins og hundur. Teljið fæturna.',
    'Lítið á höndina á ykkur og teljið fingurna.',
    'Hver hrafn hefur tvo fætur. Leggið saman tvo og tvo og tvo.',
    'Mánudagur, þriðjudagur… teljið alla dagana.',
    'Hrafn er fugl með tvo fætur og kind hefur fjóra. Leggið alla fæturna saman!',
    'Þrír og þrír og þrír.'
  ],

  colors: {
    graenn: { name: 'Grænn',  pl: 'grænir', hex: '#3dff8c' },
    raudur: { name: 'Rauður', pl: 'rauðir', hex: '#ff4d5e' },
    blar:   { name: 'Blár',   pl: 'bláir',  hex: '#3d9bff' },
    gulur:  { name: 'Gulur',  pl: 'gulir',  hex: '#ffd23d' }
  },

  // ---- Staðir á kortinu (hnit í loftmyndinni) ----
  places: {
    husid:    { x: 1080, y: 393, label: 'Aðalhúsið' },
    gestahus: { x: 1047, y: 367, label: 'Gestahúsið' },
    tren:     { x: 1044, y: 419, label: 'Trén' },
    pottur:   { x: 1059, y: 410, label: 'Heiti potturinn' },
    alfahus:  { x: 937,  y: 351, label: 'Álfahúsið' },
    pallur:   { x: 958,  y: 326, label: 'Útsýnispallurinn' },
    rust:     { x: 1122, y: 588, label: 'Rústin' },
    baeli:    { x: 1102, y: 428, label: 'Bæli Drumbs' },
    kjarr:    { x: 486,  y: 548, label: 'Kjarrið' },
    hringur:  { x: 680,  y: 690, label: 'Ljósahringurinn' }
  },

  /* =======================================================
     TRÖLLASPÆJARARNIR — yngri leiðin (6–7 ára)
     ======================================================= */
  trollar: {
    name: 'Tröllaspæjararnir',
    short: 'Tröllaspæjarar',
    kids: ['Jóhann', 'Hólmar'],
    kidsNom: 'Jóhann og Hólmar',
    kidsDat: 'Jóhanni og Hólmari',
    image: 'img/troll.webp?v=1794571856',
    theme: 'troll',
    intro: [
      'Hæ, Jóhann og Hólmar!',
      'Þið eruð tröllaspæjarar og í kvöld þurfum við á ykkur að halda.',
      'Í nótt læddist tröllið Drumbur niður af fjöllunum og heim að Stillu.',
      'Hann stal gömlu silfurkistunni hans Ketils hængs og líka öðrum LYKLINUM að henni.',
      'Drumbur er klaufskt tröll. Hann skilur alls staðar eftir sig slóð.',
      'Getið þið rakið slóðina og náð lyklinum af honum?',
      'Takið vasaljósin með. Tröll þola ekki ljós!'
    ],
    stations: [
      {
        place: 'husid', title: 'Forstofan', icon: '🚪',
        travel: null,
        task: 'Drumbur kom inn um dyrnar í nótt og týndi einhverju í forstofunni. Leitið vel! Hvað funduð þið?',
        hint: 'Það er eitthvað sem maður setur á fótinn… og það er RISASTÓRT.',
        success: 'Tröllasokkur! Nú er Drumbur bara í einum sokk. Honum hlýtur að vera kalt á tánum! Takið sokkinn með ykkur. Kannski vill Drumbur fá hann aftur.',
        answer: { kind: 'pick', correct: 'sokkur', options: [
          { v: 'vettlingur', e: '🧤', t: 'Vettlingur' },
          { v: 'sokkur', e: '🧦', t: 'Sokkur' },
          { v: 'hattur', e: '🎩', t: 'Hattur' },
          { v: 'stigvel', e: '👢', t: 'Stígvél' } ] },
        item: '🧦'
      },
      {
        place: 'gestahus', title: 'Gestahúsið', icon: '🏠',
        travel: 'Fussum svei! Finnið þið tröllalyktina? Drumbur fór yfir í litla húsið. Förum í gestahúsið!',
        task: 'Slökkvið ljósin í gestahúsinu. Drumbur missti glóandi tröllasteina út um allt! Finnið þá og teljið. Hvað eru þeir margir?',
        hint: 'Kíkið undir rúm, á bak við gardínur og ofan í skó.',
        success: 'Rétt talið! Tröll safna glóandi steinum. Drumbur var sko hérna.',
        answer: { kind: 'number', correctFrom: 'glowCount', options: [3, 4, 5, 6, 7] },
        item: '✨'
      },
      {
        place: 'tren', title: 'Trén hjá pottinum', icon: '🌳',
        travel: 'Drumbur fór aftur út og faldi sig á milli trjánna hjá heita pottinum.',
        task: 'Lýsið upp í trén! Drumbur hengdi tröllaljósin sín upp í greinarnar. Hvernig eru þau á litinn?',
        hint: 'Horfið hátt upp og lýsið á milli greinanna.',
        success: 'Já! Þetta er uppáhaldsliturinn hans Drumbs.',
        answer: { kind: 'color', correctFrom: 'treeColor', options: ['raudur', 'graenn', 'blar', 'gulur'] },
        item: '💡'
      },
      {
        place: 'alfahus', title: 'Álfahúsið', icon: '🧚',
        travel: 'Drumbur fór yfir að litla álfahúsinu og vakti álfana! Læðist þangað. Álfar eru feimnir.',
        task: 'Álfarnir urðu reiðir við Drumb og földu sig í myrkrinu. Lýsið með fingrinum á skjáinn og finnið alla fjóra álfana! Þá segja þeir ykkur hvar gjöfin þeirra er.',
        game: 'flashlight', gameOpts: { count: 4, emoji: '🧝' },
        gameWin: 'Álfarnir hvísla: „Gjöfin okkar er falin á bak við álfahúsið.“ Kíkið! Hvað gáfu álfarnir ykkur?',
        hint: 'Það glóir og maður setur það á úlnliðinn.',
        success: 'Glóandi álfaarmbönd! Setjið þau á ykkur. Þá sér Drumbur að þið eruð vinir álfanna.',
        answer: { kind: 'pick', correct: 'armband', options: [
          { v: 'koróna', e: '👑', t: 'Kóróna' },
          { v: 'bjalla', e: '🔔', t: 'Bjalla' },
          { v: 'armband', e: '📿', t: 'Armband' },
          { v: 'bangsi', e: '🧸', t: 'Bangsi' } ] },
        item: '📿'
      },
      {
        place: 'rust', title: 'Rústin', icon: '🪨', tool: 'radar', toolAfterGame: true,
        travel: 'Álfarnir hvísla: „Drumbur fór út að gömlu rústinni.“ Rústin er stór steinahrúga úti á miðri jörðinni. Það er langt að fara í myrkrinu. Haldið í höndina á fullorðna spæjaranum!',
        task: 'Drumbur faldi eitthvað við rústina og velti galdrasteini yfir tröllaratsjána. Leggið símann á jörðina á milli ykkar. Hvor heldur fingri á sinni hendi og þið veltið steininum burt SAMAN!',
        game: 'lift', gameOpts: { names: ['Jóhann', 'Hólmar'] },
        gameWin: 'Galdurinn er brotinn! Nú virkar tröllaratsjáin. Kveikið á henni og gangið hægt í kringum rústina. Því hraðar sem hún pípir, því nær eruð þið! Hvað funduð þið?',
        hint: 'Fullorðni spæjarinn má segja HEITT eða KALT.',
        success: 'Steinn með andliti! Þetta er Steini litli, frændi Drumbs. Hann varð að steini þegar sólin kom upp. Drumbur verður að passa sig á ljósinu…',
        answer: { kind: 'pick', correct: 'steinn', options: [
          { v: 'tre', e: '🌲', t: 'Tré' },
          { v: 'sveppur', e: '🍄', t: 'Sveppur' },
          { v: 'stjarna', e: '⭐', t: 'Stjarna' },
          { v: 'steinn', e: '🪨', t: 'Steinn' } ] },
        item: '🪨'
      },
      {
        place: 'baeli', title: 'Bæli Drumbs', icon: '💤', tool: 'sneak',
        travel: 'Heyrið þið? Hrrrr… hrrrr… Drumbur er sofnaður! Bælið hans er rétt hjá stóra húsinu. Læðist!',
        task: 'Læðist hljóðlega að bælinu. Drumbur má EKKI vakna! Hljóðmælirinn sýnir hvort hann heyrir í ykkur. Þegar þið eruð komin alveg að honum: hristið símann og blindið hann með töfraljósi!',
        game: 'shake',
        gameWin: 'Nú! Takið það sem Drumbur heldur á. Hvað er það?',
        hint: 'Ef hljóðmælirinn verður rauður rumskar Drumbur. Hvíslið!',
        success: 'LYKILLINN! Þið náðuð honum! Hlaupið. Drumbur er að vakna!',
        answer: { kind: 'pick', correct: 'lykill', options: [
          { v: 'peningur', e: '🪙', t: 'Peningur' },
          { v: 'lykill', e: '🔑', t: 'Lykill' },
          { v: 'demantur', e: '💎', t: 'Demantur' },
          { v: 'akkeri', e: '⚓', t: 'Akkeri' } ] },
        item: '🔑'
      },
      {
        place: 'pottur', title: 'Heiti potturinn', icon: '🔥', finale: true,
        travel: 'Fylgið ljósunum að heita pottinum. Þar faldi Drumbur kistuna. Tröll elska heitt vatn!'
      }
    ]
  },

  /* =======================================================
     RÚNAMEISTARARNIR — eldri leiðin (10 ára)
     ======================================================= */
  runir: {
    name: 'Rúnameistararnir',
    short: 'Rúnameistarar',
    kids: ['Katrín', 'Aría'],
    kidsNom: 'Katrín og Aría',
    kidsDat: 'Katrínu og Aríu',
    image: 'img/ketill.webp?v=1794571856',
    theme: 'rune',
    intro: [
      'Katrín og Aría, rúnameistarar!',
      'Fyrir meira en þúsund árum sigldi Ketill hængur til Íslands og nam land á Rangárvöllum. Hér á Stillu þar sem þið standið núna.',
      'Hann átti kistu fulla af silfri og læsti henni með tveimur lásum.',
      'Annan lykilinn faldi hann á leynistað og lokaði honum með rúnalás. Kóðann risti hann með rúnum og faldi á fjórum stöðum á Stillu.',
      'Skilaboðin sjást bara þegar dimmir.',
      'Í nótt stal tröllið Drumbur kistunni og hinum lyklinum. Strákarnir elta hann. Þið eigið að finna lykil Ketils!'
    ],
    stations: [
      {
        place: 'husid', title: 'Bréf Ketils', icon: '📜', tool: 'runes',
        runeText: 'SPEGILLINN Í LITLA HÚSINU',
        travel: null,
        task: 'Ketill skildi eftir rúnaskilaboð. Opnið rúnalykilinn og ráðið í þau, staf fyrir staf. Hvað eigið þið að finna?',
        hint: 'Fyrsta rúnin er ᛊ og hún þýðir S.',
        success: 'Rétt ráðið! Spegillinn í litla húsinu. Það er gestahúsið.',
        answer: { kind: 'text', accept: ['SPEGIL'], contains: true, placeholder: 'Skrifið svarið…' }
      },
      {
        place: 'gestahus', title: 'Spegillinn', icon: '🪞', digit: 0, tool: 'keyonly',
        travel: 'Farið yfir í gestahúsið og finnið spegilinn.',
        task: 'Á speglinum hangir miði með rúnum. En þær eru skrítnar. Þær snúa öfugt og finnast ekki í rúnalyklinum! Ketill skrifaði þær í spegilskrift svo Drumbur gæti ekki lesið þær. Hver er FYRSTA tala rúnakóðans?',
        hint: 'Haldið miðanum upp að speglinum. Lesið rúnirnar í speglinum frá vinstri til hægri og finnið hverja þeirra í rúnalyklinum.',
        success: 'Fyrsta talan er komin í rúnalásinn!',
        answer: { kind: 'digit' }
      },
      {
        place: 'rust', title: 'Rústin', icon: '🧭', tool: 'compass', digit: 1,
        travel: 'Næst: gamla rústin úti á miðri jörðinni. Þar þurfið þið áttavita Ketils. Hann er hér í símanum.',
        task: 'Standið við rústina. Ketill faldi krukku merkta ᛝ {steps} skref í {dir}. Kveikið á áttavitanum, snúið ykkur þar til hann glóir grænn og teljið skrefin upphátt. Í krukkunni eru skilaboð á dulmáli. Ráðið í þau með hjóli Ketils hér fyrir neðan. Hver er ÖNNUR talan? Ef eitthvað annað glóir við rústina er það handa strákunum. Látið það vera!',
        hint: 'Á miðanum stendur hvernig á að stilla hjólið. Finnið hvern staf á innri hringnum og lesið stafinn fyrir ofan hann á ytri hringnum.',
        game: 'wheel', gate: false,
        success: 'Önnur talan er komin. Ketill væri stoltur af ykkur!',
        answer: { kind: 'digit' }
      },
      {
        place: 'kjarr', title: 'Kjarrið', icon: '🌿', tool: 'keyonly',
        travel: 'Ketill átti leynistað í kjarrinu vestast á jörðinni. Haldið áfram í vestur. Það er löng leið í myrkrinu. Haldið hópinn og leitið að einhverju sem glóir í kjarrinu!',
        task: 'Sjáið þið glóandi miðana? Á hverjum þeirra er einn stafur. Tínið ALLA miðana úr kjarrinu og komið með þá hingað. En Drumbur hengdi líka upp gildrur! Galdur Ketils segir ykkur hvaða miðar eru réttir. Haldið símanum flötum á milli ykkar og standið hvor á móti annarri. Önnur sér rúnirnar og hin hefur takkana. Þið verðið að tala saman!',
        game: 'duet', gameOpts: { names: ['Katrín', 'Aría'] },
        gameWin: 'Galdurinn virkaði! Miðarnir sem bera merki Ketils, ᛝ, eru réttir. Miðarnir með ᛞ eru gildrur frá Drumbi. Leggið þá til hliðar! Raðið svo stöfunum á réttu miðunum í eitt orð. Hvert eigið þið að fara næst?',
        hint: 'Það er kringlótt og hefur hvorki upphaf né endi.',
        success: 'Hringur! Ketill bjó til glóandi ljósahring úti í mónum. Sjáið þið hann?',
        answer: { kind: 'text', accept: ['HRINGUR', 'HRINGURINN', 'HRING', 'HRINGINN', 'LJOSAHRINGUR', 'LJOSAHRINGURINN'], placeholder: 'Skrifið orðið…' }
      },
      {
        place: 'hringur', title: 'Ljósahringurinn', icon: '⭕', digit: 2,
        travel: 'Horfið yfir móana. Sjáið þið glóandi hring? Gangið að honum. Í miðjum hringnum bíður flöskuskeyti frá Katli.',
        task: 'Finnið flöskuna í miðjum ljósahringnum. Í henni er gáta frá Katli. En rúnasteinarnir taka bara við svarinu ef þið kunnið söng þeirra!',
        game: 'simon', gameOpts: { length: 5 },
        gameWin: 'Rúnasteinarnir hlusta. Hvert er svarið við gátunni? Það er ÞRIÐJA tala rúnakóðans.',
        hint: '{riddlehint}',
        success: 'Þriðja talan! Nú vantar bara eina.',
        answer: { kind: 'digit' }
      },
      {
        place: 'pallur', title: 'Útsýnispallurinn', icon: '🔭', tool: 'morse', digit: 3,
        travel: 'Gangið til baka í átt að húsunum og klifrið upp á útsýnispallinn. Þaðan sést yfir alla jörðina.',
        task: 'Snúið ykkur að húsinu og horfið á gluggann. Ljósviti blikkar Morse-skilaboð. Stutt blikk er punktur og langt blikk er strik. Skilaboðin byrja eftir RAUÐA ljósið. Pikkið með á takkann svo síminn hjálpi. Hver er SÍÐASTA talan?',
        hint: 'Skilaboðin eru eitt orð: tala skrifuð með bókstöfum.',
        success: 'Rúnakóðinn er kominn! Nú getið þið opnað rúnalásinn.',
        answer: { kind: 'digit' }
      },
      {
        place: 'pallur', title: 'Rúnalásinn', icon: '🔒',
        travel: null,
        task: 'Rúnalásinn er ryðgaður! Fyrst þarf að rúlla silfurpeningi Ketils í gegnum völundarhúsið inni í lásnum.',
        game: 'maze', gameOpts: { cols: 7, rows: 9, seed: 23 },
        gameWin: 'Lásinn hrökk til! Stillið nú rúnalásinn á kóðann sem þið funduð og opnið hann. Þá segir Ketill ykkur hvar lykillinn hans er falinn.',
        hint: 'Kóðinn er í röðinni sem þið funduð tölurnar.',
        success: 'Rúnalásinn opnaðist! Ketill hvíslar: „Lykillinn minn er falinn {keyplace}.“ Finnið hann!',
        answer: { kind: 'code' },
        item: '🗝️'
      },
      {
        place: 'pottur', title: 'Heiti potturinn', icon: '🔥', finale: true,
        travel: 'Takið lykil Ketils með ykkur og fylgið ljósunum að heita pottinum. Drumbur faldi kistuna þar. Tröll elska heitt vatn! Jóhann og Hólmar koma þangað með lykil Drumbs.'
      }
    ]
  },

  finale: {
    // Biðtexti Tröllaspæjaranna við kistuna (stelpurnar fá sinn texta í app.js)
    waitRunir: 'Kistan er hér! En hún er læst með TVEIMUR lásum. Lykill Ketils opnar bara annan. Jóhann og Hólmar eru með lykil Drumbs. Ef þeir eru ekki komnir skuluð þið passa kistuna á meðan þið bíðið.',
    waitTrollar: 'Kistan er hér! En hún er læst með TVEIMUR lásum. Lykill Drumbs opnar bara annan. Katrín og Aría eru að leita að hinum lyklinum. Passið kistuna á meðan þið bíðið. Litlu tröllin læðast að henni! Lýsið á þau með fingrinum.',
    trollLetter: [
      'Kæru Jóhann, Hólmar, Katrín og Aría.',
      'Fyrirgefið að ég tók kistuna. Mig langaði bara svo mikið í heita pottinn…',
      'Ketill má eiga silfrið. Þið líka.',
      'En má ég fá sokkinn minn aftur? Skiljið hann eftir hjá pottinum.',
      'Ykkar vinur,\nDrumbur'
    ]
  }
};

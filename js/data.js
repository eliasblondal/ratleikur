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

  riddles: [
    'Hve margar fætur hefur fiskur?',
    'Hve mörg nef hefur tröllið Drumbur?',
    'Hve margar fætur hefur einn hrafn?',
    'Hve mörg horn hefur þríhyrningur?',
    'Hve margar fætur hefur ein kind?',
    'Hve marga fingur hefur ein hönd?',
    'Hve margar fætur hafa þrír hrafnar saman?',
    'Hve margir dagar eru í einni viku?',
    'Hve margar fætur hafa tveir hrafnar og ein kind saman?',
    'Hve mikið er þrisvar sinnum þrír?'
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
    image: 'img/troll.webp?v=1794565002',
    theme: 'troll',
    intro: [
      'Hæ, Jóhann og Hólmar!',
      'Þið eruð tröllaspæjarar og í nótt þurfum við á ykkur að halda.',
      'Í nótt læddist tröllið Drumbur niður af fjöllunum og heim að Stillu.',
      'Hann fann gömlu silfurkistuna hans Ketils hængs og stal öðrum LYKLINUM að henni.',
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
        success: 'Tröllasokkur! Nú er Drumbur bara í einum sokk. Honum hlýtur að vera kalt á tánum!',
        answer: { kind: 'pick', correct: 'sokkur', options: [
          { v: 'vettlingur', e: '🧤', t: 'Vettlingur' },
          { v: 'sokkur', e: '🧦', t: 'Sokkur' },
          { v: 'hattur', e: '🎩', t: 'Hattur' },
          { v: 'stigvel', e: '👢', t: 'Stígvél' } ] },
        item: '🧦'
      },
      {
        place: 'gestahus', title: 'Gestahúsið', icon: '🏠',
        travel: 'Sjáið þið blautu fótsporin? Drumbur fór yfir í litla húsið. Förum í gestahúsið!',
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
        gameWin: 'Álfarnir hvísla: „Gjöfin okkar er við dyrnar á álfahúsinu.“ Kíkið! Hvað gáfu álfarnir ykkur?',
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
        place: 'rust', title: 'Rústin', icon: '🪨', tool: 'radar',
        travel: 'Álfarnir hvísla: „Drumbur fór út að gömlu rústinni.“ Haldið hópinn!',
        task: 'Kveikið á tröllaratsjánni og finnið hvað Drumbur faldi við rústina. Því hraðar sem hún pípir, því nær eruð þið! En á því hvílir tröllagaldur. Leggið símann á jörðina á milli ykkar og lyftið galdrasteininum SAMAN.',
        game: 'lift', gameOpts: { names: ['Jóhann', 'Hólmar'] },
        gameWin: 'Galdurinn er brotinn! Hvað fannst við rústina?',
        hint: 'Fullorðni spæjarinn má segja HEITT eða KALT.',
        success: 'Steinn með andliti! Þetta er lítið tröll sem varð að steini þegar sólin kom upp. Drumbur verður að passa sig á ljósinu…',
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
        task: 'Læðist að Drumbi. Hann má EKKI vakna! Ef hann rumskar þurfið þið að blinda hann með töfraljósi.',
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
    image: 'img/ketill.webp?v=1794565002',
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
        travel: 'Næst: gamla rústin úti á miðri jörðinni. Takið áttavitann með ykkur.',
        task: 'Standið við rústina. Ketill faldi næstu skilaboð {steps} skref í {dir}. Snúið ykkur þar til örin glóir og teljið skrefin upphátt. Skilaboðin eru á dulmáli. Notið hjól Ketils hér fyrir neðan til að ráða í þau. Hver er ÖNNUR talan?',
        hint: 'Á miðanum stendur hvernig á að stilla hjólið. Finnið hvern staf á innri hringnum og lesið stafinn fyrir ofan hann á ytri hringnum.',
        game: 'wheel', gate: false,
        success: 'Önnur talan er komin. Ketill væri stoltur af ykkur!',
        answer: { kind: 'digit' }
      },
      {
        place: 'kjarr', title: 'Kjarrið', icon: '🌿', tool: 'runekey',
        travel: 'Ketill átti leynistað í kjarrinu vestast á jörðinni. Það er löng leið í myrkrinu. Haldið hópinn!',
        task: 'Kjarrið er lokað með tvíröddum galdri Ketils. Leggið símann á jörðina á milli ykkar og sitjið hvor á móti annarri. Önnur sér rúnirnar, hin hefur takkana. Þið verðið að tala saman!',
        game: 'duet', gameOpts: { names: ['Katrín', 'Aría'] },
        gameWin: 'Kjarrið opnast! Í því hanga glóandi miðar. Bara miðarnir sem bera merki Ketils, ᛝ, eru réttir. Hinir eru gildrur frá Drumbi! Raðið stöfunum á réttu miðunum í orð. Hvert eigið þið að fara næst?',
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
        hint: 'Teljið vel og hægt. Fingurnir hjálpa.',
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
        travel: 'Takið lykil Ketils með ykkur og fylgið ljósunum að heita pottinum. Drumbur faldi kistuna þar. Tröll elska heitt vatn!'
      }
    ]
  },

  finale: {
    trollLetter: [
      'Kæru Jóhann, Hólmar, Katrín og Aría.',
      'Fyrirgefið að ég tók kistuna. Mig langaði bara svo mikið í heita pottinn…',
      'Ketill má eiga silfrið. Þið líka.',
      'En má ég fá sokkinn minn aftur?',
      'Ykkar vinur,\nDrumbur'
    ]
  }
};

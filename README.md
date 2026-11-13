# Silfur Ketils hængs — ratleikur

Statísk síða fyrir GitHub Pages. Engin uppsetning eða build.

```bash
gh repo create ratleikur --public --source . --push
gh api -X POST repos/{owner}/ratleikur/pages -f "source[branch]=main" -f "source[path]=/"
```

Síðan birtist á `https://<notandi>.github.io/ratleikur/` eftir 1–2 mínútur.

- Allir textar, svör og stillingar: `js/data.js`
- Höfuðstöðvar: `#/hq` (lykilorð í `data.js`)

## Ljósvitinn og fjarstýringin
- Spjaldtölvan í glugganum: Höfuðstöðvar → Ljósviti → „Þetta tæki er ljósvitinn“
- Síminn: Höfuðstöðvar → Ljósviti → „Þetta tæki er fjarstýringin“ (eða beint á `#/fjarstyring`)
- Samskiptin fara um ókeypis rás á ntfy.sh (`remoteTopic` í `js/data.js`). Enginn þjónn þarf.

## Upphafsmyndbandið
`video/intro-is.mp4` og `video/intro-en.mp4` (upprétt 9:16, 720p) spilast af forsíðunni. Þegar ýtt er á myndbandið velur maður íslenska eða enska rödd sögumanns. Myndböndin `video/ok-*.mp4` spilast í fullum skjá eftir hverja leysta þraut (hægt að slökkva á þeim í Höfuðstöðvum › Stillingar).


## Sögumaður (upplestur)
Allir textar í þrautunum eru lesnir upp af sögumanni (`audio/*.mp3`, `audio/voice.json`). Upplesturinn fer sjálfkrafa í gang þegar nýr texti birtist og 🔊 hnappurinn spilar hann aftur. Hægt er að slökkva á upplestri í Höfuðstöðvum › Stillingar.
Upptökurnar miða við sjálfgefnu stillingarnar. Ef áttavitastefnu, skrefafjölda eða felustað lykilsins er breytt les sögumaðurinn ekki þann tiltekna texta (hann birtist samt á skjánum).

# MANUAL

# Körning av hela programmet
För att köra hela programmet, klicka in på Pipeline, sedan zip-build. Därefter välj Job Artifacts and Download för att få en zip-folder. Denna kan unzipas och `cd app/backend`, och därefter kör `./run` i terminalen

# Backend

## 1. Översikt

Backend är den del av systemet som körs i bakgrunden och ansvarar för:
- datalagring
- kommunikation mellan frontend och databasen

Backend är skriven i **Python** och bygger på ramverket **FastAPI**.  
Användaren interagerar inte direkt med backend, utan via frontend eller via API-anrop.

`requirements.txt` och `requirements-dev.txt` används för att lista nödvändiga beroende som laddas ner. Notera att dessa då laddas ner enbart till lokala VM, men går att installera globalt också om så önskas.
 
```bash
backend/
├── app/
│   ├── main.py       # Startpunkt för backend
│   ├── database.py   # Databaskoppling
│   ├── models.py     # Databasmodeller
│   ├── schemas.py    # Datamodeller (API)
│   ├── crud.py       # Databasanrop (Create, Read, Update, Delete)
│   ├── routers/      # API-endpoints
│   └── core/         # Konfiguration
├── tests/            # Tester
├── requirements.txt  # Python-beroenden
├── Makefile          # Hjälpkommandon
└── README.md
```

---

## 2. Installationsbeskrivning

### Förbredelse

Systemet levereras som källkod i ett Git-repositorium och har samma struktur som trädet ovan.

Backend kräver att: 
 - Python är installerat
 - Alla beroende är installerat (antingen globalt eller lokalt på VM) från `requirements.txt` och `requirements-dev.txt`
 - Ev. databasfil? (beror på konfig. i database.py)

Backend startas från `/backend` mappen med:
```bash
uvicorn app.main:app --reload
```
eller
```bash
python -m venv
```
vars endpoints man kan testa i [http://localhost:8000/docs](http://localhost:8000/docs)


### Information
`--reload` för att uppdatera endpoint localhost.

---

# Frontend

## 1. Översikt
Frontend är den webbvyn man ser som skickar och hämtar data från databasen/backend.

Är skriven i **TypeScript** med **React** samt **CSS**. Användaren använder denna webbvyn för att interagera med produkten.

## 2. Installationsbeskrivning

Du behöver ha **Node.js** installerat. Om du inte har det kan du ladda ner och installera från: 👉
[https://nodejs.org/](https://nodejs.org/)

Kontrollera att det fungerar genom att köra:

```bash
node -v
npm -v
```

All kod ligger i `frontend` katalogen. För att installera alla beroenden, gå in i katalogen och kör:
```bash
cd frontend
npm install
```

För att komma åt den lokala webbapplikationen kan du skriva:
```bash
npm run dev
```
Då startas en utvecklingsserver på [http://localhost:5177](http://localhost:5177). Denna kan avslutas med `Ctrl + C`.

Testa gärna att allting fungerar genom att köra:
```bash
npm run test
```
Detta startar Vitest i så kallat watch-läge — varje gång du sparar en fil körs tester automatiskt igen.


---

# Grafisk navigering

I frontenden så kommer man till en webbvy där man startar i på Startsida med en Dark Mode enable knapp (denna finns på alla sidor). Därifrån kan man navigera till följande sidor:
## Startsida
Innehåller ingeting mer

## Sida 1
Innehåller en knapp med texten “Klicka här” och en text ovanför knappen som förklarar antalet gånger man har tryckt på knappen.

## Sida 2
Innehåller en knapp med texten “Ladda mer innehåll” som laddar in dynamiskt mer latinskt text

## Registrering
Ett skrivfält där man kan registrera startnummer och namn på en tävlare. Under finns en tabell på de registrerade.

## Registrering - Stopptid
Dropdown där man väljer bland registrerade tävlande. Finns två knappar som 1) Registrerar stopptiden och 2) Uppdaterar listan. Under detta finns en tabell på de registrerade med deras startnummer.

## Resultat Visare
En kontinuerligt uppdaterad vy av de registrerade tävlande med deras namn, startnummer och time stamp.

## Admin
Här presenteras all information kring de tävlande i två tabeller: ena presenterar station, startnummer och tid; den andra redovisar startnummer, namn, start, mål och totalt.



# Update Manual:
To update the current `MANUAL.pdf` run the following if you have **pandoc** installed. Otherwise, use a Markdown-to-pdf converter online.
```bash
pandoc .\MANUAL.md -o MANUAL.pdf --pdf-engine=xelatex
```
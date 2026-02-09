# MANUAL

# Översikt

## Backend
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
## Frontend
Frontend är den webbvyn man ser som skickar och hämtar data från databasen/backend.

Är skriven i **TypeScript** med **React** samt **CSS**. Användaren använder denna webbvyn för att interagera med produkten.


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
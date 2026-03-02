# CHANGES.md

Detta dokument beskriver en **översiktlig ändringslogg (diff)** av kodbasen mellan  
**K2 (Release 2)** och **K3 (Release 3)**.

Syftet är att ge det granskande teamet en snabb förståelse för **vad som är nytt,
förändrat eller utökat i kodbasen**, utan att behöva analysera en rad-för-rad-diff.
Fokus ligger på funktionella och strukturella förändringar på modul- och
arkitekturnivå.

---

## 1. Övergripande sammanfattning av förändringar sedan K2

Sedan K2 har systemet vidareutvecklats från ett lokalt fungerande system till att
vara **körbart i en riktig servermiljö**, med stöd för konfigurerbar målserver.

De viktigaste förändringarna är:
- **Serveranpassning och konfiguration**, inklusive stöd för extern målserver.
- **Utökad resultat- och tidslogik**, med checkpoints och tydligare koppling mellan
  tider och deltagare.
- **Utökad administrationsfunktionalitet**, särskilt för tävlingsspecifik
  konfiguration (tokens, stationer).
- **Förbättrad användbarhet i frontend**, inklusive scrolling, omdöpta sidor och
  förbättrad tidshantering.
- **Uppdaterad och utökad dokumentation**, både teknisk och användarinriktad.

Ingen central funktionalitet har tagits bort, men flera delar av kodbasen har
**utökats eller omstrukturerats** för att möta nya krav och stories.

---

## 2. Tillagda och väsentligt ändrade delar av kodbasen

### Backend (`/backend`)

**Väsentligt ändrade delar**
- `backend/app/`
  - Utökad logik för resultatberäkning och hantering av checkpoints.
  - Förbättrad koppling mellan tider och `Competitor`.
- `backend/app/api/`
  - API-anpassningar för att skicka mer detaljerad resultatdata, inklusive
    checkpoints och tokens.
- Ny funktionalitet för administration av tävlingar:
    - hantering av tokens (max två per tävling)
    - ändring av stationsordning

**Konfiguration**
- `backend/.env`
  - Globala variabler
- `backend/run.py`
  - Anpassad för körning mot riktig servermiljö.

---

### Frontend (`/frontend`)

**Väsentligt ändrade filer och komponenter**
- `frontend/src/`
  - Omdöpning av sidor för tydligare navigering.
- `frontend/src/components/`
  - Tidtagning: stopptid reagerar nu på tangentslag.
  - Resultatvisning: stöd för checkpoints och utökad resultatdata.
 - Layoutjusteringar som möjliggör scrolling utan att behöva zooma ut webbläsaren.

**Konfiguration**
- `frontend/.env`
  - Globala variabler

---

### Dokumentation och övriga filer

**Tillagda / uppdaterade dokument**
- `tekDok.tex` / `tekDok.pdf`
  - Uppdaterad teknisk dokumentation.
- `pvg_användar_manual.tex` / `.pdf`
  - Uppdaterad användarmanual.
- `Installation.tex` / `.pdf`
  - Förtydligad installationsbeskrivning.
- `ReleaseInfo.txt`
  - Sammanfattning av Release 3 samt forna releaser.

---
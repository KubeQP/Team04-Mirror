# Nollte iterationen - Frontend i Python

Detta är en grundläggande webbaserad frontend för projektet, byggd med
TypeScript och React. Den visar kort hur man kan organisera sina filer, en enkel
komponent och några API-anrop med `fetch`.

## Projektstruktur

Ni kommer att ha **ett** repository som innehåller både frontend och backend, i
katalogerna `frontend/` och `backend/`. Detta repo är endast frontend-delen av
projektet. Ni ska lägga in denna frontend i ert eget projektrepo, i en undermapp
som heter `frontend/`.

## Steg för steg

1. **Klona ert eget repo (om ni inte redan gjort det):**

```bash
git clone git@coursegit.cs.lth.se:edaf45/htXX-vtXX/projects/teamNN.git
cd teamNN
```

Byt ut `htXX-vtXX` mot rätt kursomgång (t.ex. `ht25-vt26`) och `teamNN` mot ert
teamnummer (t.ex. `team07`).

2. **Lägg till frontend som en extra remote och hämta koden:**

```bash
git remote add frontend git@coursegit.cs.lth.se:edaf45/samples/nollte_frontend_ts_react.git
git fetch frontend
```

3. **Slå ihop frontend/main-branchen med er egen main. Använd flaggan --allow-unrelated-histories vid behov:**

```bash
git checkout main
git merge frontend/main --allow-unrelated-histories
```

Nu finns frontend-koden i mappen `frontend/` i ert eget repo! Glöm inte att göra `git push` när du är klar.

4. **Ta bort den temporära remoten:**

```bash
git remote remove frontend
```

## Köra och testa frontend

Se README.md inuti `frontend/`-katalogen för instruktioner om hur du kör
frontend-appen och kör tester.


# Alternativ: Starta projektet från grunden

Om ni inte vill klona exemplet men fortfarande använda en webbaserad frontend
med TypeScript och React, kan ni så klart sätta upp projektet själv. Följ då 
stegen nedan, eller anpassa efter eget tycke.

## 1. Installera Node.js

Du behöver ha **Node.js** installerat. Om du inte har det redan så ladda ner och installera från: 👉
[https://nodejs.org/](https://nodejs.org/)

Kontrollera att det fungerar:

```bash
node -v
npm -v
```

## 2. Skapa nytt Vite-projekt med React + TypeScript

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
```

> Detta skapar en katalog `frontend/` med ett grundprojekt. Glöm inte att gå in i katalogen med `cd frontend`.

## 3. Installera beroenden

Installera först de paket som Vite-projektet behöver:

```bash
npm install
```

## 4. Lägg till ytterligare beroenden

> Du kan förstås välja till/bort paket efter behov.

### React Router (för navigering)

```bash
npm install react-router-dom
```

### ESLint och Vitest (för testning och kodstil)

```bash
npm install --save-dev \
  eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh \
  vitest @testing-library/react @testing-library/jest-dom \
  typescript typescript-eslint @types/react @types/react-dom \
  jest jsdom globals
```

# MANUAL

# Körning av hela programmet
För att köra hela programmet, klicka in på Pipeline, sedan zip-build. Därefter välj Job Artifacts and Download för att få en zip-folder. Denna kan unzipas och `cd app/backend`, och därefter kör `./run` i terminalen

## Installationsbeskrivning

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

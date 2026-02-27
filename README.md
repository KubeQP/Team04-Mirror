# Team04 – Tävlingssystem

Detta repository innehåller Team04:s tävlingssystem, bestående av en backend (API + logik)
och en frontend (webbgränssnitt). Systemet är utvecklat för att köras både lokalt och på
tävlingsservern vid PVG-projektet.


---

## 📂 Repositorystruktur – översikt

```text
team04/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── utils.py
│   │   ├── routers/
│   │   │   ├── competitors.py
│   │   │   ├── stations.py
│   │   │   └── times.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_competitors.py
│   │   ├── test_registers.py
│   │   └── test_times.py
│   ├── .env
│   ├── Makefile
│   ├── pyproject.toml
│   ├── pytest.ini
│   ├── requirements-dev.txt
│   ├── requirements.txt
│   └── run.py
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── config/
    │   ├── pages/
    │   ├── App.tsx
    │   ├── index.css
    │   ├── main.tsx
    │   ├── router.tsx
    │   ├── setupTests.ts
    │   └── types.ts
    ├── .env
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── prettier.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.json
```
Systemet är uppdelat i två huvuddelar: [Backend](#backend)  och [Frontend](#frontend)

## Backend
Är implementerad i Python med FastAPI och SQLAlchemy. Nedan listas bland de viktigaste delar av backenden och vad de ansvarar för.

| Fil/Map | Ansvar |
|:---|---:|
|`app/` |Applikationskod|
|`models.py` |Databasmodeller|
|`schemas.py` |Pydantic-scheman (API-kontrakt)|
|`crud.py` |Databasoperationer|
|`database.py` |Databasanslutning|
|`routers/` |API-endpoints|
|`run.py` | Startar backend-servern
|`tests/` | Backend-tester|

## Frontend
Är implementerad med React med TypeScript och Vite. Nedan listas bland de viktigaste delar av backenden och vad de ansvarar för.

|Fil/Mapp |Ansvar|
|:--|--:|
|`src/pages/` | Applikationens sidor|
|`src/components/` | Återanvändbara UI-komponenter|
|`src/api/` | API-anrop till backend|
|`router.tsx` | Routing-konfiguration|
|`package.json` | Projektkonfiguration|

---

# Uppdatering av README

Vid större ändringar av strukturen **MÅSTE** denna README uppdateras. För att uppdatera [repositorystrukturen](#-repositorystruktur--översikt), rekommeras att använda kommandot:
```bash
tree .  #Måste befinna sig i team04/ 
```
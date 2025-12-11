# Tidtagning för Enduro – FastAPI + SQLite-backend

Detta är grunden (nollte iterationen) till en backend för att registrera tider
vid en endurotävling. Den är byggd med FastAPI och använder en SQLite-databas.
Den har några enkla (och alltså inte genomtänkta!) API-endpoints för att hämta
tävlande och registrera nya tider.

## Projektstruktur

Alla filer ligger i `backend/`-mappen. Här är en kort beskrivning av vad som
görs var:

### `main.py`

Detta är huvudingången till appen. Den:

- Startar FastAPI
- Skapar databasen om den inte finns
- Lägger in lite testdata vid uppstart (kan tas bort sen)
- Innehåller API-endpoints, t.ex.:
  - `GET /competitors` – lista alla tävlande
  - `GET /times` – lista alla tider
  - `GET /times/{start_number}` – lista tider för en viss förare
  - `POST /record_time` – registrera en ny tid för en viss förare

### `database.py`

Innehåller databasuppkopplingen. Här skapas `engine` och `SessionLocal`, som
används för att kommunicera med databasen.

### `schema.py`

Innehåller databasens tabeller. Vi använder SQLAlchemy för att skapa två
tabeller:

- `Competitor` – förarna (med id, startnummer och namn)
- `TimeEntry` – registrerade tider (med id, competitor_id, timestamp)

### `models.py`

Här finns de modeller (Pydantic) som används för att skicka och ta emot data i
API:t. T.ex.:

- `CompetitorOut` – används som svar från `/competitors`
- `TimeEntryOut` – används som svar från `/times`
- `RecordTimeIn` – används som input när ny tidsregistrering skickas till
  `/record_time`

---

## Installation och körning

1. Installera beroenden (kräver Python):

```bash
cd backend
python -m venv .env
source .env/bin/activate  # Windows: .env\Scripts\activate
pip install -r requirements.txt
```

**OBS! Du måste aktivera din virtuella miljö i varje ny terminalsession.**

2. Kör API\:t:

```bash
uvicorn main:app --reload
```

3. Testa endpoints i t.ex. Swagger UI på
   [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Tips

- Du kan lägga till egna tävlande i databasen, antingen via kod eller framtida
  formulär i frontend.
- Alla tider lagras med exakt tidpunkt (`datetime`) när de registreras.
- Vill du kunna skicka in tiden manuellt också? Då kan `RecordTimeIn` utökas med
  ett valfritt `timestamp`-fält.

---

## Diskussion: Alembic – behövs det?

### Vad är Alembic?

Alembic är ett verktyg för att hantera **databasändringar över tid**
(migreringar). I stället för att radera databasen och skapa en ny varje gång man
ändrar `schema.py`, kan Alembic:

- Spåra förändringar i tabellerna
- Generera migrationsfiler (ungefär som diffar i Git fast för databasen)
- Uppgradera databasen utan att ta bort existerande data

### Måste vi använda Alembic?

**Nej, inte i ett så här enkelt projekt.** Just nu räcker det att skapa
databasen från grunden med `schema.Base.metadata.create_all()`.

Men…

### Borde vi använda det?

**Ja, om projektet växer**, särskilt om:

- Du jobbar i team
- Du inte vill tappa data när tabeller ändras
- Du bygger vidare på databasen i flera steg

### Exempel på när Alembic behövs:

- Du lägger till ett nytt fält i `Competitor`
- Du byter namn på en kolumn
- Du ska deploya till produktion och inte vill börja om med tom databas

---

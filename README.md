# Nollte iterationen - Backend i Python

Detta är en grundläggande backend för projektet, byggd med Pythons FastAPI och
SQLAlchemy. Den använder en SQLite-databas och innehåller några enkla
API-endpoints för att hantera tävlande och registrera tider.

## Projektstruktur

Ni kommer att ha **ett** repository som innehåller både frontend och backend, i
katalogerna `frontend/` och `backend/`). Detta repo är endast backend-delen av
projektet. Ni ska lägga in denna backend i ert eget projektrepo, i en undermapp
som heter `backend/`.

## Steg för steg

1. **Klona ert eget repo (om ni inte redan gjort det):**

```bash
git clone git@coursegit.cs.lth.se:edaf45/htXX-vtXX/projects/teamNN.git
cd teamNN
```

Byt ut `htXX-vtXX` mot rätt kursomgång (t.ex. `ht25-vt26`) och `teamNN` mot ert
teamnummer (t.ex. `team07`).

2. **Lägg till backend som en extra remote och hämta koden:**

```bash
git remote add backend git@coursegit.cs.lth.se:edaf45/samples/nollte_backend_py.git
git fetch backend
```

3. **Checka ut backend-koden i en ny branch:**

```bash
git checkout -b backend-import backend/main
```

4. **Gå tillbaka till main-grenen och slå ihop:**

```bash
git checkout main
git merge backend-import
```

Nu finns backend-koden i mappen `backend/` i ert eget repo!

5. **Ta bort den temporära branchen och remoten:**

```bash
git branch -d backend-import
git remote remove backend
```

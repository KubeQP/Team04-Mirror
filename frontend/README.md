# Installation och körning

## 1. Installera Node.js

Du behöver ha **Node.js** installerat. Ladda ner och installera från: 👉
[https://nodejs.org/](https://nodejs.org/)

Kontrollera att det fungerar genom att köra:

```bash
node -v
npm -v
```

Du bör se versionsnummer utan felmeddelanden.

---

## 2. Installera frontend-projektet

All kod ligger i `frontend/`-katalogen (där denna README.md också ligger). För
att installera alla beroenden, gå in i katalogen och kör:

```bash
cd frontend
npm install
```

Detta laddar ner de paket projektet behöver (React, TypeScript, Vitest osv.).

---

## 3. Starta utvecklingsservern

Under utveckling kan du starta en lokal server med:

```bash
npm run dev
```

Det startar en utvecklingsserver på
[http://localhost:5173](http://localhost:5173).

Öppna den i webbläsaren för att se appen. När du gör ändringar i koden kommer
sidan att uppdateras automatiskt. Avsluta servern med `Ctrl + C` i terminalen
när du är klar.

---

## 4. Kör testerna

Du kan köra testerna på samma sätt, med:

```bash
npm run test
```

Det startar Vitest i så kallat **watch-läge** — varje gång du sparar en fil körs
tester automatiskt igen. Detta gör det smidigt att arbeta testdrivet.

Om du bara vill köra testerna en gång (t.ex. i CI eller innan inlämning) kan du
skriva:

```bash
npm run test -- --run
```

Ett bra tips är att ha **två terminalfönster öppna samtidigt**: ett för
utveckling (`npm run dev`) och ett för testning (`npm run test`).

---

# Testning i frontend-projekt

Att testa frontend med **TypeScript och React** skiljer sig lite från att testa
backend-kod, men principerna är desamma. Testerna hjälper oss att se att
komponenter beter sig som förväntat — både i logik och i vad som faktiskt visas
för användaren.

---

## Var lägger jag testerna?

Vanlig praxis är att lägga testfiler **bredvid** den kod de testar, med samma
filnamn men ändelsen `.test.tsx` eller `.test.ts`.

Exempel:

```
src/
 └── components/
     ├── ExamplePost.tsx
     └── ExamplePost.test.tsx
```

Du kan också samla alla testfiler i en separat `tests/`-mapp om du föredrar, men
den närliggande modellen är vanligare i React-projekt eftersom den håller test
och kod nära varandra.

---

## Vad kan (och bör) jag testa?

| Vad du vill testa                         | Hur du testar det                              | Verktyg                          |
| ----------------------------------------- | ---------------------------------------------- | -------------------------------- |
| Komponenters rendering och innehåll       | Rendera komponenten och kontrollera resultatet | `@testing-library/react`         |
| Användarinteraktioner (klick, input etc.) | Simulera händelser och kontrollera effekter    | `user-event` via Testing Library |
| API-funktioner                            | Anropa funktioner och kontrollera returvärden  | `vitest`                         |
| Navigering med router                     | Rendera med `MemoryRouter` eller liknande      | Testing Library                  |
| Tillstånd (loading, error etc.)           | Kontrollera olika renderingstillstånd          | Testing Library                  |

---

## Exempel på test

Se existerande testfiler för inspiration:

- `frontend/src/pages/Sida1.test.tsx`
- `frontend/src/pages/Sida2.test.tsx`
- `frontend/src/components/ExamplePost.test.tsx`
- `frontend/src/components/ThemeToggle.test.tsx`
- `frontend/src/api/example_api.test.ts`

---

## En kort introduktion till testning med Vitest och Testing Library

Ni har tidigare lärt er testning och testdriven utveckling (TDD) i Java med
**JUnit** för att testa klasser och metoder. I frontend-världen fungerar det
nästan likadant – men här testar vi istället **komponenter**, alltså små delar
av användargränssnittet.

### Hur hänger det ihop?

| Java-världen             | Frontend-världen                    |
| ------------------------ | ----------------------------------- |
| JUnit                    | Vitest                              |
| Klassen du testar        | React-komponenten                   |
| `assertEquals()`         | `expect(...).toBe(...)`             |
| `setUp()` / `tearDown()` | `beforeEach()` / `afterEach()`      |
| Instans av klass         | En renderad komponent i webbläsaren |

**Vitest** motsvarar alltså JUnit: den kör tester, jämför resultat och visar
grönt eller rött beroende på om allt gick bra. **Testing Library** hjälper oss
att ”använda” komponenten på samma sätt som en riktig användare: klicka på
knappar, skriva text, eller leta upp element i gränssnittet.

---

### Ett litet exempel

Anta att vi har en enkel komponent:

```tsx
function Hello({ name }: { name: string }) {
  return <h1>Hej {name}!</h1>
}
```

Då kan vi testa den så här:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import Hello from "./Hello"

describe("Hello", () => {
  it("visar namnet som skickas in", () => {
    render(<Hello name="Lisa" />)
    expect(screen.getByText("Hej Lisa!")).toBeInTheDocument()
  })
})
```

**Förklaring:**

- `render(...)` – startar komponenten i ett ”virtuellt” webbläsarfönster.
- `screen.getByText(...)` – letar efter texten i det som renderats.
- `expect(...).toBeInTheDocument()` – kontrollerar att texten verkligen finns.

Om komponenten inte visar rätt text blir testet rött – precis som ett JUnit-test
som inte går igenom.

---

### Testdriven utveckling (TDD)

Samma principer gäller som i Java:

1. **Skriv först ett test** som beskriver vad komponenten ska göra.
2. **Kör testerna** – de ska först misslyckas (rött).
3. **Implementera** koden tills testet går igenom (grönt).
4. **Refaktorera** – förbättra koden utan att ändra beteendet.

Detta är TDD även i frontend – men här testar vi React-komponenter istället för
Java-klasser.

---

### Tips

- Testa **små delar i taget**. En komponent ska gå att testa isolerat.
- Testa **det användaren ser eller gör**, inte interna detaljer.
- Spara testet först (rött), sedan implementera (grönt).
- Låt testerna vara din dokumentation – de visar hur koden ska användas.

### Snapshot-tester

Vitest har stöd för så kallade **snapshot-tester**, där du ”godkänner”
strukturen första gången och låter verktyget varna dig när den förändras.

Ett enkelt exempel för en funktion som ska bygga en request-payload som sedan
kan skickas till ett API kan se ut som nedan. Testet finns också i
`frontend/src/api/example_api.test.ts`.

```ts
import { describe, it, expect } from "vitest"
import { buildRequestPayload } from "./example_api"
describe("buildRequestPayload", () => {
  it("har korrekt struktur för API-anropet", () => {
    const payload = buildRequestPayload(42)
    expect(payload).toMatchSnapshot()
  })
})
```

Vitest sparar automatiskt en ”snapshot”-fil med den förväntade strukturen i en
`__snapshots__/`-mapp. Nästa gång testet körs jämförs den aktuella strukturen
mot den sparade.

Om strukturen på `payload` ändras i framtiden kommer testet att misslyckas, och
Vitest visar skillnaderna mot den sparade ”snapshoten”. Du kan då granska
ändringarna och godkänna dem om de är korrekta. Vitest ber dig att skriva `u` i
testkonsolen för att uppdatera snapshoten.

# Zadanie rekrutacyjne — Senior Frontend Engineer

Pracujesz nad **Wiki Knowledge Graph** — przeglądarką wiedzy opartą na grafie, napisaną w Vue 3 + Vite. Aplikacja wizualizuje sieć pojęć (węzły) i powiązań między nimi (krawędzie) z zakresu obsługi ekspresu do kawy. Dane są mock'owane lokalnie w `src/data/mock.js`, więc do uruchomienia projektu nie jest potrzebne żadne zewnętrzne API.

Twoim zadaniem jest zrealizowanie **trzech zadań** opisanych poniżej. Każde z nich jest niezależne — możesz je realizować w dowolnej kolejności.

---

## Uruchomienie projektu

```bash
npm install
npm run dev
```

Aplikacja startuje pod adresem `http://localhost:5173`.

---

## Struktura projektu

```
src/
├── style.css          # globalny arkusz stylów (ciemny motyw)
├── App.vue            # główny komponent — header, zakładki, panel detali
├── data/
│   └── mock.js        # dane: 16 węzłów, 20 krawędzi, 3 źródła, transkrypty
└── components/
    ├── Graph.vue       # wizualizacja grafu (force-graph)
    ├── ChunkPanel.vue  # panel szczegółów węzła
    ├── SourcesView.vue # lista źródeł z częściami
    └── PartPanel.vue   # panel szczegółów części źródła
```

---

## Zadania

### Zadanie 1 — Refaktoryzacja

**Kontekst:** W kodzie występują dwa rodzaje duplikacji, które utrudniają utrzymanie projektu.

**1a. Wyodrębnij `fmtTime()` do `src/utils/format.js`**

Funkcja `fmtTime(secs)` zamieniająca sekundy na format `M:SS` jest skopiowana dosłownie w trzech komponentach: `ChunkPanel.vue`, `PartPanel.vue` i `SourcesView.vue`. Wyodrębnij ją do osobnego modułu i zastąp import'em we wszystkich miejscach.

**1b. Ujednolić konfigurację typów węzłów w `src/utils/types.js`**

`ChunkPanel.vue` definiuje `TYPE_LABELS` (mapowanie klucza typu na etykietę), a `Graph.vue` definiuje `TYPE_COLORS` (mapowanie klucza typu na kolor) — obie struktury operują na tym samym zbiorze pięciu kluczy (`process_stage`, `machine_element`, `machine_part`, `procedure`, `concept`). Utwórz jeden plik `src/utils/types.js`, który eksportuje obie mapy, i zaktualizuj oba komponenty.

**Oczekiwany efekt:** Żadnych zmian wizualnych. Kod jest krótszy, a każda wartość istnieje w jednym miejscu.

---

### Zadanie 2 — Najkrótsza ścieżka (BFS)

**Kontekst:** Użytkownicy chcą wiedzieć, jak dwa dowolne węzły grafu są ze sobą powiązane.

Zaimplementuj tryb „Path" bezpośrednio w komponencie `Graph.vue`. Szczegółowa specyfikacja znajduje się w bloku komentarza `// TODO Task 2` na końcu pliku — poniżej podsumowanie wymagań:

- Przycisk „Path" włącza/wyłącza tryb ścieżki (toggle).
- W trybie aktywnym dwa kolejne kliknięcia w węzły wyznaczają punkt startowy i końcowy.
- Algorytm BFS przeszukuje graf jako **nieskierowany** i rekonstruuje ścieżkę.
- Węzły na ścieżce renderowane są z pełną jasnością i wyróżniającym pierścieniem; pozostałe są przyciemnione do ok. 20% krycia.
- Krawędzie ścieżki są podświetlone; pozostałe przyciemnione.
- Jeśli ścieżka nie istnieje — wyświetl nakładkę „No path found".
- Wyłączenie trybu resetuje cały stan.

**Ważna pułapka:** biblioteka `force-graph` mutuje obiekty krawędzi — pola `source` i `target` stają się referencjami do obiektów węzłów, nie stringami. Lista sąsiedztwa musi obsługiwać oba przypadki.

---

### Zadanie 3 — Wyszukiwanie w grafie na żywo

**Kontekst:** Przy większej liczbie węzłów znalezienie konkretnego pojęcia wymaga przewijania listy lub zgadywania pozycji w grafie.

Dodaj pole wyszukiwania do nagłówka aplikacji (`App.vue`) i przekaż zapytanie do komponentu `<Graph>` jako nowy prop `filterQuery`. Szczegółowa specyfikacja znajduje się w bloku komentarza `<!-- TODO Task 3 -->` w `App.vue` — poniżej podsumowanie wymagań:

- Input wyszukiwania pojawia się w headerze obok licznika węzłów/krawędzi (widoczny tylko w zakładce „Graph").
- Węzły, których tytuł zawiera wpisany ciąg (case-insensitive), renderowane są z pełną jasnością.
- Pozostałe węzły są przyciemnione do ok. 20% krycia.
- Obok inputa wyświetlana jest liczba dopasowań oraz przycisk `×` czyszczący zapytanie.
- Klawisz `/` ustawia focus na input; `Escape` czyści zapytanie i usuwa focus.
- Przy pustym zapytaniu graf wygląda normalnie.

**Wskazówka:** Pętla canvas w `force-graph` odczytuje props w każdej klatce — nie ma potrzeby reinicjalizacji grafu.

---

## Kryteria oceny

Oceniamy przede wszystkim jakość kodu, nie szybkość jego dostarczenia.

| Obszar | Na co patrzymy |
|---|---|
| **Poprawność** | Czy funkcjonalność działa zgodnie ze specyfikacją, włącznie z przypadkami brzegowymi |
| **Czytelność** | Czy kod jest zrozumiały bez zbędnych komentarzy i nadmiarowych abstrakcji |
| **Spójność** | Czy nowy kod pasuje stylem i konwencjami do istniejącego |
| **Refaktoryzacja** | Czy Zadanie 1 eliminuje duplikację bez wprowadzania nowych problemów |
| **Algorytm** | Czy BFS w Zadaniu 2 jest poprawny i wydajny (O(V + E)) |
| **UX** | Czy interakcje w Zadaniach 2 i 3 są intuicyjne i responsywne |

---

## Zasady

- Nie zmieniaj `src/data/mock.js` ani `package.json`.
- Nie instaluj dodatkowych bibliotek bez uzasadnienia.
- Zachowaj istniejący ciemny motyw i układ aplikacji.
- Każde zadanie powinno być commitowane osobno z opisowym komunikatem.

---

## Oddanie zadania

Wyślij link do publicznego repozytorium (GitHub / GitLab) lub archiwum `.zip` z historią commitów na adres podany w wiadomości rekrutacyjnej.

Powodzenia!

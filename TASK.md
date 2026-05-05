# TASK.md — Wiki Knowledge Graph

## Narzędzia AI

- **Claude Code** (claude.ai/code) — główne narzędzie, CLI do pracy z kodem
- **Model Claude Sonnet 4.6** — implementacja
- **Model Claude Opus 4.7** — końcowy code review
- **Model Claude Haiku 4.5** — prostsze, szybkie zadania (ciągi i18n, zmiany w szablonach, weryfikacja buildu)
- **Pluginy:** `superpowers@claude-plugins-official` (brainstorming, writing-plans, subagent-driven-development), `andrej-karpathy-skills` (karpathy-guidelines)

---

## Zadanie 1 - Refaktoryzacja

### Proces pracy

Zadanie 1 realizowałem z pomocą Claude Code (CLI). Zamiast kodować od razu, zacząłem od fazy planowania przy użyciu narzędzi AI.

Najpierw uruchomiłem skill `/brainstorming` — AI przeanalizował istniejący kod i zaproponował trzy podejścia dla integracji `TYPE_LABELS` z vue-i18n. Wybrałem Approach A (TYPE_LABELS jako klucze i18n), bo eliminował powielanie danych i elegancko rozwiązał konflikt między zadaniami 1b i 1c.

Następnie skill `writing-plans` wygenerował szczegółowy plan z 9 zadaniami, gdzie każdy krok zawierał gotowy kod — nie ogólniki.

Właściwą implementację przeprowadziłem przez `subagent-driven-development`: każde zadanie wykonał osobny subagent z izolowanym kontekstem. Po zakończeniu poprosiłem o osobny subagent (model Opus) do pełnego review diffa względem README. Wykrył 5 problemów, które następnie zostały naprawione.

### Co się podobało w wynikach AI

Plan wygenerowany przez `writing-plans` był bardzo konkretny — żadnego "zaimplementuj funkcję X", tylko gotowy kod z wyjaśnieniem dlaczego. To skróciło czas implementacji i ograniczyło liczbę decyzji podczas kodowania.

Subagenty nie "zanieczyszczały" kontekstu poprzednich zadań, co zmniejszyło ryzyko regresji między krokami.

Najbardziej wartościowy był review przez Opus — surowy i merytoryczny. Wykrył nieoczywisty błąd: vue-i18n v9 używa domyślnie angielskiej reguły pluralizacji, przez co polskie formy dla 2, 5, 22 były błędne. Sam bym tego nie wyłapał bez ręcznego testowania każdego przypadku.

AI sam zaproponował też najczystsze podejście architektoniczne dla TYPE_LABELS — to był jego pomysł, nie mój. Doceniam, kiedy narzędzie nie tylko wykonuje polecenia, ale aktywnie sugeruje lepsze rozwiązanie.

### Feedback dany AI

Podczas sesji korygowałem AI w dwóch momentach.

Po pierwsze, w planie implementacji słowo "Graph" zostało przetłumaczone jako "Graf" — poprawiłem na "Wykres", bo w kontekście tej aplikacji "Graf" brzmi jak struktura danych, a nie wizualizacja.

Po drugie, po review Opus wykrył 5 problemów i poprosiłem o naprawienie wszystkich. Problemy obejmowały: brak polskich reguł pluralizacji w vue-i18n, hardkodowane słowo "Part" w `ChunkPanel.vue` i `PartPanel.vue` (nie tłumaczyło się przy zmianie języka), hardkodowany tytuł aplikacji `<h1>Wiki Knowledge Graph</h1>`, nieusunięty stary komentarz `Task 1` w `Graph.vue` oraz niekonsekwentne wyrównanie `const` w `App.vue`.

---

## Zadanie 2 — Najkrótsza ścieżka (BFS)

### Proces pracy

Zadanie 2 zrealizowałem tym samym schematem co Zadanie 1. Zacząłem od `/brainstorming`, bo specyfikacja pozostawiała kilka niejednoznacznych decyzji projektowych: gdzie umieścić przycisk trybu ścieżki, co powinno się stać przy kliknięciu trzeciego węzła, jak wyglądać powinna nakładka „brak ścieżki" i jak tryb ścieżki ma współgrać z przyszłym wyszukiwaniem. AI zaproponował konkretne odpowiedzi: przycisk absolutnie pozycjonowany wewnątrz `Graph.vue`, kliknięcie trzeciego węzła resetuje start do nowego, nakładka jako mały pływający tekst czyszczący się automatycznie przy kolejnym kliknięciu, aktywacja trybu ścieżki czyści wynik wyszukiwania.

Następnie `writing-plans` wygenerował plan 6 kroków z gotowym kodem — analogicznie do Zadania 1.

Implementację przeprowadziłem przez `subagent-driven-development`: każde z 6 zadań wykonał osobny subagent. Po zakończeniu uruchomiłem dwuetapowy review — najpierw zgodność ze specyfikacją, potem jakość kodu. Recenzent wykrył jeden problem: oryginalny blok komentarza `// TODO Task 2` pozostał w pliku po implementacji. Osobny subagent usunął go w ramach kroku porządkowego. Build zakończył się czysty — 0 błędów, 0 ostrzeżeń.

### Co się podobało w wynikach AI

Brainstorming rozwiązał kilka nietrywialnych pytań UX zanim w ogóle zacząłem kodować. Szczególnie wartościowa była decyzja o przechowywaniu obu kierunków każdej krawędzi w `pathLinkIds` — force-graph po inicjalizacji mutuje `link.source` i `link.target` z łańcucha znaków na obiekt węzła, więc naiwne porównanie stringów po prostu by nie działało. AI sam zaproponował pomocnik `slugOf()` wyodrębniający identyfikator niezależnie od tego, czy pole jest już obiektem, czy jeszcze stringiem. To nie był oczywisty pomysł i zaoszczędził mi godziny debugowania.

Doceniam też spostrzeżenie dotyczące stanu canvas: `ctx.globalAlpha` musi być resetowane po każdym przyciemnionym węźle — inaczej stan kontekstu „wycieka" między rysowaniami. AI uwzględnił to w planie z własnej inicjatywy.

### Feedback dany AI

Po zakończeniu implementacji Zadania 2 ręczne testy ujawniły trzy błędy. Do ich analizy i naprawy oddelegowałem agenta Claude Opus 4.7 z dostępem do source'ów biblioteki force-graph.

**Bug 1 — kliknięcia w węzły nie zawsze działały.** Opus zidentyfikował, że force-graph traktuje mikro-ruch myszy jako drag i tłumi zdarzenie `onNodeClick`. Poprawka: wyłączenie `enableNodeDrag` na czas trwania trybu ścieżki przez `watch(pathMode, on => fg.enableNodeDrag(!on))`.

**Bug 2 — brak wizualnego feedbacku po wyborze węzła startowego.** Po kliknięciu pierwszego węzła canvas nie zmieniał się, bo `pathNodeSlugs` był jeszcze pusty. Poprawka: dodanie pomarańczowego pierścienia wokół węzła startowego (flaga `isPathStart`), przyciemnienia pozostałych węzłów w stanie oczekiwania na węzeł końcowy (flaga `awaitingEnd`) oraz nakładki tekstowej z podpowiedzią „Wybierz węzeł startowy" / „Wybierz węzeł końcowy".

**Bug 3 — kliknięcie po znalezieniu ścieżki nie przerysowywało grafu.** Klik był rejestrowany, ale canvas pozostawał bez zmian po ochłodzeniu symulacji. Poprawka: `watch([pathStep, pathStart, ...], () => fg?.d3ReheatSimulation())` wymuszający ponowne renderowanie po każdej zmianie stanu ścieżki.

Opus samodzielnie zaproponował i zaimplementował wszystkie trzy poprawki — nie wymagały one mojej interwencji poza uruchomieniem agenta.

Po tych zmianach implementacja nie wykazała zadnych błędów i mogłem zrobić commit taska.

---

## Zainstalowane biblioteki

- **`vue-i18n@9`** — wymagana przez specyfikację zadania (Composition API, v9). Warto odnotować: maintainer projektu oznaczył v9 jako deprecated na rzecz v11, ale ponieważ zadanie explicite wymagało v9, zainstalowałem dokładnie tę wersję bez zmiany na nowszą.




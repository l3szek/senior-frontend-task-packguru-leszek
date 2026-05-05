# TASK.md — Wiki Knowledge Graph

## Narzędzia AI

- **Claude Code** (claude.ai/code) — główne narzędzie, CLI do pracy z kodem
- **Model Claude Sonnet 4.6** — główny model implementacyjny
- **Model Claude Opus 4.7** — końcowy code review i analiza trudniejszych problemów
- **Model Claude Haiku 4.5** — proste, szybkie zadania pomocnicze
- **Pluginy:** `superpowers@claude-plugins-official` (brainstorming, writing-plans, subagent-driven-development), `andrej-karpathy-skills` (karpathy-guidelines)

## Podsumowanie procesu

Pracowałem w krótkich iteracjach: plan → implementacja → review diffa → ręczne testy → poprawki → commit. AI wykorzystywałem jako narzędzie do analizy, generowania planów, implementacji i review, ale każdą zmianę sprawdzałem przed zaakceptowaniem.

Nie generowałem całego rozwiązania jednym promptem. Każde zadanie było realizowane osobno, aby łatwiej kontrolować zakres zmian i uniknąć regresji.

Każde zadanie zostało zakończone osobnym commitem, zgodnie z wymaganiami z README.

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

AI zaproponował podejście z TYPE_LABELS jako kluczami i18n. Po analizie wybrałem je, ponieważ redukowało duplikację i dobrze pasowało do wymagań 1b/1c. Doceniam, kiedy narzędzie nie tylko wykonuje polecenia, ale aktywnie sugeruje lepsze rozwiązanie.

### Feedback dany AI

Podczas sesji korygowałem AI w dwóch momentach.

Po pierwsze, zweryfikowałem tłumaczenia nazw UI. Część propozycji AI była poprawna technicznie, ale brzmiała nienaturalnie w interfejsie, więc ręcznie dopasowałem etykiety do kontekstu aplikacji.

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

Opus zaproponował poprawki, które następnie zweryfikowałem ręcznie w aplikacji i zaakceptowałem po sprawdzeniu zachowania grafu.

Po tych zmianach implementacja nie wykazała żadnych błędów i mogłem zrobić commit taska.

---

## Zadanie 3 — Live Search (filtrowanie węzłów)

### Proces pracy

Zadanie 3 zrealizowałem tym samym schematem co poprzednie. Zacząłem od sprawdzenia, czy spec (`docs/superpowers/specs/2026-05-05-task3-design.md`) jest aktualny — był gotowy z poprzedniej sesji, więc pominąłem etap brainstormingu i przeszedłem od razu do `writing-plans`.

Plan (`docs/superpowers/plans/2026-05-05-task3-live-search.md`) wygenerował 4 zadania implementacyjne:
1. Dodanie kluczy i18n (`search.placeholder`, `search.matches`) do `en.json` i `pl.json`
2. Aktualizacja `Graph.vue`: prop `filterQuery`, prop `resetPath` z watcherem, przyciemnianie węzłów w `nodeCanvasObject`
3. Aktualizacja `App.vue`: refy, computed `matchCount`, obsługa klawiatury (`/`, `Escape`), HTML inputa wyszukiwania
4. Style CSS dla `.search-wrap`, `.search-input`, `.search-matches`, `.search-clear`

Implementację przeprowadziłem przez `subagent-driven-development`: każde zadanie wykonał osobny subagent (haiku dla prostych zadań JSON/CSS, sonnet dla logiki Vue). Po każdym zadaniu uruchomiłem dwuetapowy review — spec compliance, potem code quality.

Build zakończył się czysty — 0 błędów, 0 ostrzeżeń.

### Co się podobało w wynikach AI

Review code quality wykrył kilka nieoczywistych problemów, których sam bym nie wyłapał bez ręcznego testowania:

Recenzent zauważył brak optional chaining na `node.title?.toLowerCase()` w `nodeCanvasObject` — bez tego wywołanie `.toLowerCase()` na `undefined` rzuciłoby błąd przy pierwszym wpisaniu czegokolwiek w input, zawieszając cały canvas render loop. To byłoby widoczne dopiero przy uruchomieniu.

Recenzent zaproponował też podniesienie `props.filterQuery.toLowerCase()` poza pętlę per-węzeł do zmiennej `lowerQuery` — canvas callback jest wywoływany 60 razy na sekundę dla każdego węzła, więc jest to uzasadniona optymalizacja hot-path.

Najcenniejsza była sugestia dotycząca wzajemnego wykluczania się trybu ścieżki i wyszukiwania. Pierwotna implementacja łączyła warunki OR-em (`dimmedByPath || dimmedBySearch`), co tworzyło semantyczną niejednoznaczność gdy oba tryby byłyby aktywne jednocześnie. Recenzent zaproponował jawne rozróżnienie: `dimmed = pathMode.value ? dimmedByPath : dimmedBySearch` — to nie tylko czystszy kod, ale też zabezpieczenie przed race condition przy szybkim przełączaniu trybów.

### Feedback dany AI

Podczas ręcznych testów wykryłem jeden błąd UI: input wyszukiwania pojawił się na końcu headera (obok przełącznika języka), zamiast obok licznika węzłów/krawędzi na środku. Błąd wynikał z tego, że TODO comment, który subagent zastąpił nowym HTMLem, był umieszczony po `div.lang-switch` w oryginalnym kodzie — subagent wstawił kod dokładnie tam gdzie był komentarz, zamiast przenieść go na właściwe miejsce. Poprawiłem kolejność elementów ręcznie, przestawiając `div.search-wrap` przed `div.lang-switch`.

Po commicie przeprowadziłem dodatkowe ręczne testy, które ujawniły dwa kolejne problemy:

**Bug 4 — graf „podskakuje" przy każdym wpisanym znaku.** Podczas wpisywania zapytania w polu wyszukiwania węzły grafu widocznie drgały przy każdym naciśnięciu klawisza. Mechanizm sygnalizowania `resetPath` w `App.vue` używał wyrażenia `if (val) resetPath.value = !resetPath.value`, które strzelało dla każdej zmiany `filterQuery` — a nie tylko przy przejściu z pustego pola do pierwszego znaku. Przez to watcher w `Graph.vue` wywoływał `fg.d3ReheatSimulation()` przy każdej literze, nieustannie rozgrzewając symulację fizyczną. Poprawka: zmiana sygnatury watcha na `(newVal, oldVal)` i warunek `if (newVal && !oldVal)` — reset ścieżki odpala się wyłącznie przy przejściu pusty→niepusty.

**Bug 5 — `aria-label` przycisku czyszczenia wyszukiwania hardkodowany po angielsku.** Przycisk `×` obok inputa miał `aria-label="Clear search"` wpisany na stałe w HTML. Przy przełączeniu aplikacji na język polski czytniki ekranowe nadal ogłaszały etykietę po angielsku. Poprawka: dodanie klucza `search.clear` do `en.json` i `pl.json` oraz zamiana atrybutu na `:aria-label="t('search.clear')"`.

Oba błędy zostały naprawione i włączone do ostatniego commitu przez `git commit --amend`.

---

## Zainstalowane biblioteki

- **`vue-i18n@9`** — wymagana przez specyfikację zadania (Composition API, v9). Warto odnotować: maintainer projektu oznaczył v9 jako deprecated na rzecz v11, ale ponieważ zadanie wymagało v9, zainstalowałem dokładnie tę wersję bez zmiany na nowszą.




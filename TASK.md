# TASK.md — Wiki Knowledge Graph

## Proces pracy

Zadanie 1 realizowałem z pomocą Claude Code (CLI). Zamiast kodować od razu, zacząłem od fazy planowania przy użyciu narzędzi AI.

Najpierw uruchomiłem skill `/brainstorming` — AI przeanalizował istniejący kod i zaproponował trzy podejścia dla integracji `TYPE_LABELS` z vue-i18n. Wybrałem Approach A (TYPE_LABELS jako klucze i18n), bo eliminował powielanie danych i elegancko rozwiązał konflikt między zadaniami 1b i 1c.

Następnie skill `writing-plans` wygenerował szczegółowy plan z 9 zadaniami, gdzie każdy krok zawierał gotowy kod — nie ogólniki.

Właściwą implementację przeprowadziłem przez `subagent-driven-development`: każde zadanie wykonał osobny subagent z izolowanym kontekstem. Po zakończeniu poprosiłem o osobny subagent (model Opus) do pełnego review diffa względem README. Wykrył 5 problemów, które następnie zostały naprawione.

## Narzędzia AI

- **Claude Code** (claude.ai/code) — główne narzędzie, CLI do pracy z kodem
- **Model Claude Sonnet 4.6** — implementacja
- **Model Claude Opus 4.7** — końcowy code review
- **Model Claude Haiku 4.5** — prostsze, szybkie zadania
- **Pluginy:** `superpowers@claude-plugins-official` (brainstorming, writing-plans, subagent-driven-development), `andrej-karpathy-skills` (karpathy-guidelines)

## Co się podobało w wynikach AI

Plan wygenerowany przez `writing-plans` był bardzo konkretny — żadnego "zaimplementuj funkcję X", tylko gotowy kod z wyjaśnieniem dlaczego. To skróciło czas implementacji i ograniczyło liczbę decyzji podczas kodowania.

Subagenty nie "zanieczyszczały" kontekstu poprzednich zadań, co zmniejszyło ryzyko regresji między krokami.

Najbardziej wartościowy był review przez Opus — surowy i merytoryczny. Wykrył nieoczywisty błąd: vue-i18n v9 używa domyślnie angielskiej reguły pluralizacji, przez co polskie formy dla 2, 5, 22 były błędne. Sam bym tego nie wyłapał bez ręcznego testowania każdego przypadku.

AI sam zaproponował też najczystsze podejście architektoniczne dla TYPE_LABELS — to był jego pomysł, nie mój. Doceniam, kiedy narzędzie nie tylko wykonuje polecenia, ale aktywnie sugeruje lepsze rozwiązanie.

## Feedback dany AI

Podczas sesji korygowałem AI w dwóch momentach.

Po pierwsze, w planie implementacji słowo "Graph" zostało przetłumaczone jako "Graf" — poprawiłem na "Wykres", bo w kontekście tej aplikacji "Graf" brzmi jak struktura danych, a nie wizualizacja.

Po drugie, po review Opus wykrył 5 problemów i poprosiłem o naprawienie wszystkich. Problemy obejmowały: brak polskich reguł pluralizacji w vue-i18n, hardkodowane słowo "Part" w `ChunkPanel.vue` i `PartPanel.vue` (nie tłumaczyło się przy zmianie języka), hardkodowany tytuł aplikacji `<h1>Wiki Knowledge Graph</h1>`, nieusunięty stary komentarz `Task 1` w `Graph.vue` oraz niekonsekwentne wyrównanie `const` w `App.vue`.

## Zainstalowane biblioteki

**`vue-i18n@9`** — wymagana przez specyfikację zadania (Composition API, v9). Warto odnotować: maintainer projektu oznaczył v9 jako deprecated na rzecz v11, ale ponieważ zadanie explicite wymagało v9, zainstalowałem dokładnie tę wersję bez zmiany na nowszą.

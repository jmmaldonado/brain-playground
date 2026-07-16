# World Flags Game

## Goal
Add a geography game that helps players learn world flags while fitting the existing Brain Playground game structure.

## Implemented scope
- New route: `/games/world-flags`.
- Main menu entry for the game.
- Continent selection for Europe, Asia, Africa, North America, South America, and Oceania.
- Three modes:
  - Learning mode: large flag plus country name and continent.
  - Written answer mode: large flag, text answer, and browser speech-to-text when available.
  - Four-flag choice mode: country name plus four flag choices in a compact two-column grid.
- Optional lives mode:
  - Starts a run with 3 lives.
  - Each mistake spends one life.
  - When lives run out, the result screen shows score, best run streak, mistakes, and level.
- Correct answers show a short celebration with points earned.
- Hints in challenge modes:
  - Continent.
  - First letter.
  - First three letters.
  - Hints are shown from a contextual modal and apply different score penalties.
- Progressive levels:
  - Early levels prioritize larger or more globally recognizable countries.
  - Later levels include less common countries.
  - Choice mode uses more similar distractor flags as difficulty rises.
- High scores and best streaks saved through `StorageService` under `world-flags`.
- Main game selector improved with category filters and denser cards.
- Continent selection shows per-continent and selected-country counts.
- In-game country pool is shown below the score header with an information modal.
- Country pool modal shows active countries at the current level versus total selected countries per continent.
- Flags are served locally from `static/flags/w640` for PWA offline support.
- Dataset expanded from 125 to 196 entries, using tiers to defer smaller and less common countries to later levels.

## Data model
Countries are stored in `src/lib/games/world-flags/data.ts` with:
- ISO code for FlagCDN image lookup.
- Spanish display name and optional aliases.
- Continent.
- Relevance tier from 1 to 4.
- Flag-family grouping for distractor selection.

## Notes
Flag images were downloaded from FlagCDN `w640` PNGs and are served locally. The local flag asset set contains 306 files and is about 1.66 MB.

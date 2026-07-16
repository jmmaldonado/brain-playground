# Logic Electronics Games

## Goal
Improve the two digital logic games so they are playable on mobile touch screens and offer a longer progression.

## Implemented scope
- Kept the existing routes:
  - `/games/logic-basics`
  - `/games/logic-gates`
- Added shared circuit infrastructure in `src/lib/games/logic-circuits`:
  - Common gate, terminal, connection, placed-gate, level, output, and truth-table types.
  - Shared gate evaluator and circuit evaluator.
  - Shared connection helpers for terminal compatibility, one-wire-per-input replacement, gate deletion cleanup, and cycle rejection.
  - Shared terminal geometry and wire path helpers.
  - Shared SVG gate body rendering without tiny SVG-only connector hit targets.
- Reworked both games around mobile-friendly tap-assisted wiring:
  - Tap one source or sink, then tap a compatible opposite terminal.
  - Compact terminal buttons without visible IN/OUT text, separated from gate bodies so colors carry the source/sink distinction.
  - Source and sink terminals use distinct colors.
  - Incompatible terminals are visually muted while a terminal is selected.
  - Tapping the same terminal cancels selection.
  - Tapping empty board space cancels selection and starts panning.
  - Tapping a wire selects it and shows a delete action.
  - Selecting a gate shows a visible delete action.
  - Right-click gate deletion still works on desktop.
  - New gates are placed near the visible center of the board.
- Added mobile component trays at the bottom while keeping the desktop sidebar.
- Added automatic canvas zoom-to-fit plus manual zoom controls so horizontal circuits can be seen on vertical mobile screens.
- Added basic local progress persistence:
  - `logic-basics`
  - `logic-gates`
  - Stores unlocked level id and completed level ids.
  - Level selector still allows revisiting levels manually.

## Logic Basics
- Reworked the original 6 levels to use the shared circuit model and truth-table validation.
- Fixed push-button behavior with pointer down/up/cancel/leave handling.
- Levels now complete only after the player operates the visible switches/buttons and validates every required truth-table state.
- Expanded to 14 levels:
  - Power On
  - Door Bell
  - The Inverter
  - Safety Lock
  - Emergency Override
  - Exclusive Access
  - Quiet Room
  - Fail-Safe Alarm
  - Enable Button
  - Night Light
  - Armed Doors
  - Safe / Unsafe Panel
  - Simple Security Panel
  - Dual Indicator Challenge

## Logic Lab
- Reworked the original levels to use shared wiring and simulation.
- Fixed the combined-gates progression so titles, descriptions, and expected truth tables match.
- Correct simulations now complete the level and advance automatically to the next one.
- Expanded to 15 levels:
  - The NOT Gate
  - The AND Gate
  - The OR Gate
  - NAND Logic
  - XOR Logic
  - NOR Logic
  - XNOR Builder
  - AND From NAND
  - OR From NAND
  - NOR From OR
  - XOR From Basics
  - Half Adder
  - Selector 2:1
  - Alarm Control
  - Comparator

## Notes
- Logic Basics validates circuit behavior against each level truth table, not only against the current visible switch state.
- Logic Lab still requires the player to run the simulation to see table-case pass/fail results.
- Outputs with multiple required values are represented directly in each level truth table.

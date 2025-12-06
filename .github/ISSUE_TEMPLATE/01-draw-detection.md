---
name: Add draw detection
about: Detect draws when all cells are filled
title: 'Add draw detection when all cells are filled'
labels: enhancement
assignees: ''
---

## Description
Currently the game doesn't detect draws. When all 9 cells are filled and no winner, the game should declare a draw and return bets to both players.

## Acceptance Criteria
- [ ] Contract detects when all 9 cells are filled with no winner
- [ ] Both players receive their bet amount back on draw
- [ ] Frontend displays "Draw" message
- [ ] Game state is properly updated

## Technical Notes
- Modify `play` function in `contracts/xox-game.clar`
- Add `is-draw` helper function
- Update frontend to handle draw state

---
name: Game timeout mechanism
about: Implement timeout for inactive players
title: 'Implement game timeout mechanism'
labels: enhancement
assignees: ''
---

## Description
Add a timeout feature where if a player doesn't make a move within X blocks, the other player can claim victory.

## Acceptance Criteria
- [ ] Track block height when each move is made
- [ ] Allow claiming victory after N blocks of inactivity
- [ ] Winner receives both bets
- [ ] Frontend shows timeout countdown

## Technical Notes
- Store `last-move-block` in game data
- Add `claim-timeout-victory` public function
- Use `block-height` for timing

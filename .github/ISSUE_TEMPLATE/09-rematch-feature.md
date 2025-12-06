---
name: Rematch feature
about: Quick rematch after game ends
title: 'Add rematch option after game ends'
labels: enhancement
assignees: ''
---

## Description
Allow players to quickly start a new game with the same opponent after a game ends.

## Acceptance Criteria
- [ ] Show "Rematch" button after game ends
- [ ] Both players must accept rematch
- [ ] Use same bet amount as previous game
- [ ] Swap who plays X and O

## Technical Notes
- Add rematch-request map to contract
- Add `request-rematch` and `accept-rematch` functions
- Frontend shows rematch UI after game ends
- Handle timeout for rematch requests

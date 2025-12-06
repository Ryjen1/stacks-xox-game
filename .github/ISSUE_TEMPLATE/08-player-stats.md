---
name: Player statistics
about: Track win/loss stats
title: 'Track player win/loss statistics'
labels: enhancement
assignees: ''
---

## Description
Add a leaderboard or player profile showing wins, losses, and total STX won.

## Acceptance Criteria
- [ ] Track wins/losses per player in contract
- [ ] Display player stats on profile page
- [ ] Global leaderboard page
- [ ] Sort by wins, STX won, win rate

## Technical Notes
- Add player-stats map to contract
- Create `/leaderboard` page
- Create `/profile/[address]` page
- Consider indexing with Chainhook

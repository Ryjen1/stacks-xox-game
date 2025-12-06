---
name: Game history page
about: Show completed games history
title: 'Add game history page'
labels: enhancement, frontend
assignees: ''
---

## Description
Create a page showing completed games with winners, bet amounts, and move history.

## Acceptance Criteria
- [ ] List all completed games
- [ ] Show winner and loser for each game
- [ ] Display bet amounts and winnings
- [ ] Filter by player address
- [ ] Pagination for large lists

## Technical Notes
- Create `/history` page
- Query contract for completed games
- Store move history in contract events

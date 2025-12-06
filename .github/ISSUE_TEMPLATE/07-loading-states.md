---
name: Loading indicators
about: Add loading states for transactions
title: 'Add loading indicators for transactions'
labels: enhancement, frontend
assignees: ''
---

## Description
Show loading spinners while waiting for blockchain transactions to confirm.

## Acceptance Criteria
- [ ] Loading spinner during transaction submission
- [ ] Pending state while waiting for confirmation
- [ ] Success/error feedback after confirmation
- [ ] Disable buttons during pending transactions

## Technical Notes
- Track transaction status from Stacks.js
- Use React state for loading states
- Add skeleton loaders for data fetching

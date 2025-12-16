# Player Statistics Feature Implementation

## Overview
This pull request implements the player statistics tracking feature as requested in issue #8. The feature tracks wins, losses, STX won, and games played for each player, and provides both a personal profile page and a global leaderboard.

## Changes Made

### 1. Contract Changes (`contracts/xox-game.clar`)
- Added `player-stats` map to track statistics per player
- Implemented helper functions:
  - `init-player-stats`: Initializes player statistics if they don't exist
  - `update-winner-stats`: Updates statistics for winning players
  - `update-loser-stats`: Updates statistics for losing players
- Modified `play` function to update player statistics when a game is won
- Added read-only functions:
  - `get-player-stats`: Get statistics for a specific player
  - `get-all-player-stats`: Get statistics for all players (for leaderboard)

### 2. Contract Library (`frontend/lib/contract.ts`)
- Added `PlayerStats` type definition
- Implemented `getPlayerStats` function to fetch individual player statistics
- Implemented `getAllPlayerStats` function to fetch all player statistics

### 3. Frontend Pages
- **Profile Page** (`frontend/app/profile/page.tsx`):
  - Displays connected player's statistics
  - Shows wins, losses, games played, STX won, and win rate
  - Responsive design with visual indicators

- **Leaderboard Page** (`frontend/app/leaderboard/page.tsx`):
  - Displays global leaderboard with all players
  - Sorting functionality by wins, STX won, and win rate
  - Table format with rank, player info, and statistics
  - Calculates and displays win rates

### 4. Navigation Updates (`frontend/components/navbar.tsx`)
- Added links to Profile and Leaderboard pages
- Fixed React import for proper JSX typing

### 5. Tests (`tests/xox-game.test.ts`)
- Added comprehensive test suite for player statistics:
  - Tests player stats initialization when a game is won
  - Tests stats updates for multiple games
  - Tests read-only functions for getting player stats
  - Verifies correct STX calculations and win/loss tracking

## Acceptance Criteria Met

✅ **Track wins/losses per player in contract**
- Implemented player statistics map in the Clarity contract
- Statistics are updated automatically when games are completed

✅ **Display player stats on profile page**
- Created dedicated profile page showing all player statistics
- Includes wins, losses, games played, STX won, and win rate

✅ **Global leaderboard page**
- Created leaderboard page showing all players
- Includes comprehensive player statistics in table format

✅ **Sort by wins, STX won, win rate**
- Implemented sorting functionality with three options
- Users can switch between sorting criteria via UI buttons

## Technical Details

- **Contract Storage**: Uses Clarity maps for efficient player statistics storage
- **STX Calculations**: Correctly tracks STX won (2x bet amount for winners)
- **Win Rate**: Calculated as (wins / gamesPlayed) * 100
- **Error Handling**: Proper error handling for edge cases (no games played, etc.)
- **Type Safety**: Full TypeScript support with proper type definitions

## Testing

- Added 3 comprehensive test cases covering:
  - Player stats initialization
  - Multiple game scenarios
  - Read-only function verification
- Tests integrate with existing test suite
- Follows existing testing patterns and conventions

## Commits

This implementation consists of 5 focused commits:
1. `feat: add player statistics tracking to contract`
2. `feat: add player statistics functions to contract library`
3. `feat: add profile page to display player statistics`
4. `feat: add global leaderboard page with sorting functionality`
5. `feat: add player statistics tests`

## Next Steps

- Merge this pull request to integrate player statistics into the main branch
- Consider adding additional statistics in future iterations (e.g., draw tracking, streak tracking)
- Potential UI enhancements based on user feedback
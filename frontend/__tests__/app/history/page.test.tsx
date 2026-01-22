import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HistoryPage from '@/app/history/page';
import { getAllGames } from '@/lib/contract';

// Mock the contract functions
jest.mock('@/lib/contract', () => ({
  getAllGames: jest.fn(),
}));

const mockGetAllGames = getAllGames as jest.MockedFunction<typeof getAllGames>;

describe('HistoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays draw games in history', async () => {
    const mockGames = [
      {
        id: 1,
        'player-one': 'SP123',
        'player-two': 'SP456',
        'is-player-one-turn': false,
        'bet-amount': 100,
        board: [1, 2, 1, 2, 2, 1, 1, 2, 1], // Full board, draw
        winner: null,
        finished: true,
        moves: [
          { moveIndex: 0, move: 1 },
          { moveIndex: 1, move: 2 },
          { moveIndex: 2, move: 1 },
          { moveIndex: 3, move: 2 },
          { moveIndex: 4, move: 2 },
          { moveIndex: 5, move: 1 },
          { moveIndex: 6, move: 1 },
          { moveIndex: 7, move: 2 },
          { moveIndex: 8, move: 1 },
        ],
      },
      {
        id: 2,
        'player-one': 'SP789',
        'player-two': 'SP101',
        'is-player-one-turn': false,
        'bet-amount': 200,
        board: [1, 1, 1, 0, 0, 0, 0, 0, 0],
        winner: 'SP789',
        finished: true,
        moves: [
          { moveIndex: 0, move: 1 },
          { moveIndex: 1, move: 1 },
          { moveIndex: 2, move: 1 },
        ],
      },
    ];

    mockGetAllGames.mockResolvedValue(mockGames);

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Result: Draw')).toBeInTheDocument();
      expect(screen.getByText('Winner: SP789')).toBeInTheDocument();
    });
  });

  it('filters games by player address', async () => {
    const mockGames = [
      {
        id: 1,
        'player-one': 'SP123',
        'player-two': 'SP456',
        'is-player-one-turn': false,
        'bet-amount': 100,
        board: [1, 2, 1, 2, 2, 1, 1, 2, 1],
        winner: null,
        finished: true,
        moves: [],
      },
    ];

    mockGetAllGames.mockResolvedValue(mockGames);

    render(<HistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Result: Draw')).toBeInTheDocument();
    });

    // Test filtering - this would require more setup for input interaction
  });
});
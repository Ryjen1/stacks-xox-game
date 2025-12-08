import React from 'react';
import { render, screen } from '@testing-library/react';
import { GamesList } from '@/components/games-list';
import { Game, Move } from '@/lib/contract';

describe('GamesList Component', () => {
  const mockGames: Game[] = [
    {
      id: 1,
      'player-one': 'SP123456789',
      'player-two': 'SP987654321',
      'is-player-one-turn': true,
      'bet-amount': 100,
      board: [Move.X, Move.EMPTY, Move.O, Move.EMPTY, Move.X, Move.EMPTY, Move.O, Move.EMPTY, Move.EMPTY],
      winner: null
    },
    {
      id: 2,
      'player-one': 'SP111111111',
      'player-two': null,
      'is-player-one-turn': false,
      'bet-amount': 50,
      board: [Move.EMPTY, Move.EMPTY, Move.EMPTY, Move.EMPTY, Move.EMPTY, Move.EMPTY, Move.EMPTY, Move.EMPTY, Move.EMPTY],
      winner: null
    },
    {
      id: 3,
      'player-one': 'SP222222222',
      'player-two': 'SP333333333',
      'is-player-one-turn': true,
      'bet-amount': 200,
      board: [Move.X, Move.O, Move.X, Move.O, Move.X, Move.EMPTY, Move.EMPTY, Move.EMPTY, Move.EMPTY],
      winner: 'SP222222222'
    }
  ];

  const mockUserData = {
    profile: {
      stxAddress: {
        testnet: 'SP123456789'
      }
    }
  };

  // Mock the useStacks hook
  jest.mock('@/hooks/use-stacks', () => ({
    useStacks: () => ({
      userData: mockUserData
    })
  }));

  it('renders game categories correctly', () => {
    render(<GamesList games={mockGames} />);

    expect(screen.getByText('Active Games')).toBeInTheDocument();
    expect(screen.getByText('Joinable Games')).toBeInTheDocument();
    expect(screen.getByText('Ended Games')).toBeInTheDocument();
  });

  it('shows user games in Active Games section', () => {
    render(<GamesList games={mockGames} />);

    // User should see game 1 in Active Games (they are player-one)
    expect(screen.getByText('100 STX')).toBeInTheDocument();
    expect(screen.getByText('Next Turn: X')).toBeInTheDocument();
  });

  it('shows joinable games in Joinable Games section', () => {
    render(<GamesList games={mockGames} />);

    // Game 2 should be in Joinable Games (no player-two and user is not player-one)
    expect(screen.getAllByText('50 STX')).toHaveLength(1);
  });

  it('shows ended games in Ended Games section', () => {
    render(<GamesList games={mockGames} />);

    // Game 3 should be in Ended Games (has a winner)
    expect(screen.getByText('Winner: O')).toBeInTheDocument();
  });

  it('shows "Create New Game" button when no user games exist', () => {
    const emptyGames: Game[] = [];
    render(<GamesList games={emptyGames} />);

    expect(screen.getByText("You haven't joined any games yet")).toBeInTheDocument();
    expect(screen.getByText('Create New Game')).toBeInTheDocument();
  });
});
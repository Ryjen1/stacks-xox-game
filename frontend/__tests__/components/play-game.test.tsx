import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayGame } from '@/components/play-game';
import { Game, Move } from '@/lib/contract';

describe('PlayGame Component', () => {
  const mockGame: Game = {
    id: 1,
    'player-one': 'SP123456789',
    'player-two': 'SP987654321',
    'is-player-one-turn': true,
    'bet-amount': 100,
    board: [Move.X, Move.EMPTY, Move.O, Move.EMPTY, Move.X, Move.EMPTY, Move.O, Move.EMPTY, Move.EMPTY],
    winner: null
  };

  const mockUserData = {
    profile: {
      stxAddress: {
        testnet: 'SP123456789'
      }
    }
  };

  const mockHandleJoinGame = jest.fn();
  const mockHandlePlayGame = jest.fn();

  // Mock the useStacks hook
  jest.mock('@/hooks/use-stacks', () => ({
    useStacks: () => ({
      userData: mockUserData,
      handleJoinGame: mockHandleJoinGame,
      handlePlayGame: mockHandlePlayGame
    })
  }));

  it('renders the game board', () => {
    render(<PlayGame game={mockGame} />);

    expect(screen.getByRole('button', { name: /X/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /O/i })).toBeInTheDocument();
  });

  it('shows game information correctly', () => {
    render(<PlayGame game={mockGame} />);

    expect(screen.getByText('Bet Amount:')).toBeInTheDocument();
    expect(screen.getByText('100 STX')).toBeInTheDocument();
    expect(screen.getByText('Player One:')).toBeInTheDocument();
    expect(screen.getByText('Player Two:')).toBeInTheDocument();
  });

  it('shows "Join Game" button when game is joinable', () => {
    const joinableGame: Game = {
      ...mockGame,
      'player-two': null,
      'player-one': 'SP999999999'
    };

    render(<PlayGame game={joinableGame} />);
    expect(screen.getByText('Join Game')).toBeInTheDocument();
  });

  it('shows "Play" button when it is user turn', () => {
    render(<PlayGame game={mockGame} />);
    expect(screen.getByText('Play')).toBeInTheDocument();
  });

  it('shows waiting message when waiting for opponent', () => {
    const waitingGame: Game = {
      ...mockGame,
      'is-player-one-turn': false
    };

    render(<PlayGame game={waitingGame} />);
    expect(screen.getByText('Waiting for opponent to play...')).toBeInTheDocument();
  });

  it('calls handlePlayGame when Play button is clicked', () => {
    render(<PlayGame game={mockGame} />);

    // Click on an empty cell first
    const emptyCells = screen.getAllByRole('button').filter(cell => {
      return !cell.textContent?.includes('X') && !cell.textContent?.includes('O');
    });

    if (emptyCells.length > 0) {
      fireEvent.click(emptyCells[0]);
    }

    const playButton = screen.getByText('Play');
    fireEvent.click(playButton);

    expect(mockHandlePlayGame).toHaveBeenCalled();
  });
});
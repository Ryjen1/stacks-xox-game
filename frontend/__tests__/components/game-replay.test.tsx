import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameReplay } from '@/components/game-replay';
import { Game, Move } from '@/lib/contract';

const mockGame: Game = {
  id: 1,
  "player-one": "ST123",
  "player-two": "ST456",
  "is-player-one-turn": true,
  "bet-amount": 100,
  board: [Move.X, Move.O, Move.EMPTY, Move.EMPTY, Move.X, Move.EMPTY, Move.O, Move.EMPTY, Move.X],
  winner: "ST123",
  finished: true,
  moves: [
    { moveIndex: 0, move: Move.X },
    { moveIndex: 1, move: Move.O },
    { moveIndex: 4, move: Move.X },
    { moveIndex: 6, move: Move.O },
    { moveIndex: 8, move: Move.X }
  ]
};

describe('GameReplay Component', () => {
  it('renders the replay controls and board', () => {
    render(<GameReplay game={mockGame} />);

    expect(screen.getByText('Game Replay')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Move 0 of 5')).toBeInTheDocument();
  });

  it('advances moves when next is clicked', () => {
    render(<GameReplay game={mockGame} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Move 1 of 5')).toBeInTheDocument();
  });

  it('goes back when previous is clicked', () => {
    render(<GameReplay game={mockGame} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(screen.getByText('Move 1 of 5')).toBeInTheDocument();

    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);
    expect(screen.getByText('Move 0 of 5')).toBeInTheDocument();
  });
});
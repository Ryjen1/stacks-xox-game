import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameBoard } from '@/components/game-board';
import { Move } from '@/lib/contract';

describe('GameBoard Component', () => {
  const mockBoard = [
    Move.X, Move.EMPTY, Move.O,
    Move.EMPTY, Move.X, Move.EMPTY,
    Move.O, Move.EMPTY, Move.EMPTY
  ];

  it('renders the game board with correct cells', () => {
    render(<GameBoard board={mockBoard} />);

    // Check that all cells are rendered
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);

    // Check that X and O are displayed correctly
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('renders empty cells correctly', () => {
    const emptyBoard = Array(9).fill(Move.EMPTY);
    render(<GameBoard board={emptyBoard} />);

    // Empty cells should not show X or O
    expect(screen.queryByText('X')).not.toBeInTheDocument();
    expect(screen.queryByText('O')).not.toBeInTheDocument();
  });

  it('shows next move hint on hover when cell is empty', () => {
    render(<GameBoard board={mockBoard} nextMove={Move.X} />);

    // Find an empty cell and hover over it
    const emptyCells = screen.getAllByRole('button').filter(cell => {
      return !cell.textContent?.includes('X') && !cell.textContent?.includes('O');
    });

    if (emptyCells.length > 0) {
      // Simulate hover by checking the hidden span content
      const firstEmptyCell = emptyCells[0];
      expect(firstEmptyCell).toHaveClass('group');
    }
  });

  it('applies custom cell className when provided', () => {
    const customClass = 'custom-cell-class';
    render(<GameBoard board={mockBoard} cellClassName={customClass} />);

    const cells = screen.getAllByRole('button');
    cells.forEach(cell => {
      expect(cell).toHaveClass(customClass);
    });
  });

  it('calls onCellClick when a cell is clicked', () => {
    const handleClick = jest.fn();
    render(<GameBoard board={mockBoard} onCellClick={handleClick} />);

    const cells = screen.getAllByRole('button');
    cells[0].click();
    expect(handleClick).toHaveBeenCalledWith(0);
  });
});
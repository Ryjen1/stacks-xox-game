import { getBestMove } from '@/lib/ai';

describe('AI getBestMove', () => {
  it('returns a valid move for empty board', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const move = getBestMove(board);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(9);
  });

  it('blocks player win', () => {
    const board = [1, 1, 0, 0, 0, 0, 0, 0, 0]; // Player has two in first row
    const move = getBestMove(board);
    expect(move).toBe(2); // Should block at index 2
  });

  it('takes winning move', () => {
    const board = [2, 2, 0, 0, 0, 0, 0, 0, 0]; // AI has two in first row
    const move = getBestMove(board);
    expect(move).toBe(2); // Should win at index 2
  });

  it('handles draw board', () => {
    const board = [1, 2, 1, 2, 1, 2, 2, 1, 2]; // Full board, draw
    const move = getBestMove(board);
    expect(move).toBe(-1); // No moves available
  });

  it('chooses center when available', () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const move = getBestMove(board);
    // AI should prefer center (4) or corners, but since minimax, it should choose optimally
    expect([0,2,4,6,8].includes(move)).toBe(true); // Corners or center
  });
});
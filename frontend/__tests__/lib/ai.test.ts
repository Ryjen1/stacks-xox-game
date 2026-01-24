import { getBestMove } from "@/lib/ai";

describe("getBestMove", () => {
  it("should return a valid move for empty board", () => {
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const move = getBestMove(board);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(9);
  });

  it("should win immediately when possible", () => {
    const board = [2, 2, 0, 0, 0, 0, 0, 0, 0]; // AI has two in first row, can win with 2
    const move = getBestMove(board);
    expect(move).toBe(2);
  });

  it("should block opponent win", () => {
    const board = [1, 1, 0, 0, 0, 0, 0, 0, 0]; // Player has two in first row, AI should block
    const move = getBestMove(board);
    expect(move).toBe(2);
  });

  it("should return a valid move in complex positions", () => {
    const board = [1, 2, 1, 2, 0, 1, 2, 1, 0];
    const move = getBestMove(board);
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThan(9);
    expect(board[move]).toBe(0); // Should be empty spot
  });
});
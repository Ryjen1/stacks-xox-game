"use client";

import { useState, useMemo } from "react";
import { Game, Move, EMPTY_BOARD } from "@/lib/contract";
import { GameBoard } from "./game-board";

type GameReplayProps = {
  game: Game;
};

export function GameReplay({ game }: GameReplayProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const currentBoard = useMemo(() => {
    const board = [...EMPTY_BOARD];
    for (let i = 0; i < currentMoveIndex; i++) {
      const move = game.moves[i];
      board[move.moveIndex] = move.move as Move;
    }
    return board;
  }, [game.moves, currentMoveIndex]);

  const handlePrev = () => {
    setCurrentMoveIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentMoveIndex(prev => Math.min(game.moves.length, prev + 1));
  };

  const handleReset = () => {
    setCurrentMoveIndex(0);
  };

  const handleEnd = () => {
    setCurrentMoveIndex(game.moves.length);
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h4 className="text-lg font-semibold mb-2">Game Replay</h4>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleReset}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start
        </button>
        <button
          onClick={handlePrev}
          disabled={currentMoveIndex === 0}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Move {currentMoveIndex} of {game.moves.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentMoveIndex === game.moves.length}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
        <button
          onClick={handleEnd}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          End
        </button>
      </div>
      <GameBoard board={currentBoard} />
    </div>
  );
}
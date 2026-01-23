"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Game, Move, EMPTY_BOARD } from "@/lib/contract";
import { GameBoard } from "./game-board";

type GameReplayProps = {
  game: Game;
};

export function GameReplay({ game }: GameReplayProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentBoard = useMemo(() => {
    const board = [...EMPTY_BOARD];
    for (let i = 0; i < currentMoveIndex; i++) {
      const move = game.moves[i];
      board[move.moveIndex] = move.move as Move;
    }
    return board;
  }, [game.moves, currentMoveIndex]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentMoveIndex(prev => {
          if (prev >= game.moves.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, game.moves.length, speed]);

  const handlePrev = () => {
    setCurrentMoveIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentMoveIndex(prev => Math.min(game.moves.length, prev + 1));
  };

  const handleReset = () => {
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  };

  const handleEnd = () => {
    setCurrentMoveIndex(game.moves.length);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
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
        <button
          onClick={handlePlayPause}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          <option value={2000}>Slow</option>
          <option value={1000}>Normal</option>
          <option value={500}>Fast</option>
        </select>
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
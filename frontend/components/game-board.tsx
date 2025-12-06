"use client";

import { Move } from "@/lib/contract";

type GameBoardProps = {
  board: Move[];
  onCellClick?: (index: number) => void;
  cellClassName?: string;
  nextMove?: Move;
};

export function GameBoard({
  board,
  onCellClick,
  nextMove,
  cellClassName,
}: GameBoardProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, index) => (
          <div
            key={index}
            className={
              "border border-gray-600 rounded-md flex items-center justify-center font-bold group cursor-pointer " +
              cellClassName
            }
            onClick={() => onCellClick?.(index)}
          >
            {cell === Move.EMPTY ? (
              <span className="hidden group-hover:block text-gray-500">
                {nextMove === Move.X ? "X" : nextMove === Move.O ? "O" : ""}
              </span>
            ) : (
              <span>{cell === Move.X ? "X" : cell === Move.O ? "O" : ""}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

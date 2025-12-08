"use client";

import { Game, Move } from "@/lib/contract";
import { GameBoard } from "./game-board";
import { abbreviateAddress, explorerAddress, formatStx } from "@/lib/stx-utils";
import Link from "next/link";
import { useStacks } from "@/hooks/use-stacks";
import { useState, useEffect } from "react";

interface PlayGameProps {
  game: Game;
}

export function PlayGame({ game }: PlayGameProps) {
  const { userData, handleJoinGame, handlePlayGame, handleRematchGame } = useStacks();
  const [board, setBoard] = useState(game.board);
  const [playedMoveIndex, setPlayedMoveIndex] = useState(-1);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [opponentAcceptedRematch, setOpponentAcceptedRematch] = useState(false);
  if (!userData) return null;

  const isPlayerOne =
    userData.profile.stxAddress.testnet === game["player-one"];
  const isPlayerTwo =
    userData.profile.stxAddress.testnet === game["player-two"];

  const isJoinable = game["player-two"] === null && !isPlayerOne;
  const isJoinedAlready = isPlayerOne || isPlayerTwo;
  const nextMove = game["is-player-one-turn"] ? Move.X : Move.O;
  const isMyTurn =
    (game["is-player-one-turn"] && isPlayerOne) ||
    (!game["is-player-one-turn"] && isPlayerTwo);
  const isGameOver = game.winner !== null;

  // Simulate opponent rematch acceptance (in a real app, this would come from contract events)
  useEffect(() => {
    if (rematchRequested) {
      const timer = setTimeout(() => {
        setOpponentAcceptedRematch(true);
      }, 3000); // Simulate 3 second delay for opponent response

      return () => clearTimeout(timer);
    }
  }, [rematchRequested]);

  function onCellClick(index: number) {
    const tempBoard = [...game.board];
    tempBoard[index] = nextMove;
    setBoard(tempBoard);
    setPlayedMoveIndex(index);
  }

  return (
    <div className="flex flex-col gap-4 w-[400px]">
      <GameBoard
        board={board}
        onCellClick={onCellClick}
        nextMove={nextMove}
        cellClassName="size-32 text-6xl"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500">Bet Amount: </span>
          <span>{formatStx(game["bet-amount"])} STX</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500">Player One: </span>
          <Link
            href={explorerAddress(game["player-one"])}
            target="_blank"
            className="hover:underline"
          >
            {abbreviateAddress(game["player-one"])}
          </Link>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-500">Player Two: </span>
          {game["player-two"] ? (
            <Link
              href={explorerAddress(game["player-two"])}
              target="_blank"
              className="hover:underline"
            >
              {abbreviateAddress(game["player-two"])}
            </Link>
          ) : (
            <span>Nobody</span>
          )}
        </div>

        {game["winner"] && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500">Winner: </span>
            <Link
              href={explorerAddress(game["winner"])}
              target="_blank"
              className="hover:underline"
            >
              {abbreviateAddress(game["winner"])}
            </Link>
          </div>
        )}
      </div>

      {isJoinable && (
        <button
          onClick={() => handleJoinGame(game.id, playedMoveIndex, nextMove)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Join Game
        </button>
      )}

      {isMyTurn && (
        <button
          onClick={() => handlePlayGame(game.id, playedMoveIndex, nextMove)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Play
        </button>
      )}

      {isJoinedAlready && !isMyTurn && !isGameOver && (
        <div className="text-gray-500">Waiting for opponent to play...</div>
      )}

      {/* Rematch functionality - show after game ends */}
      {isGameOver && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Game Over!</h3>

          {!rematchRequested && !opponentAcceptedRematch && (
            <button
              onClick={() => {
                setRematchRequested(true);
                // Start a new game with same bet amount but swap player positions
                // Player who was O becomes X, and vice versa
                const newMove = isPlayerOne ? Move.O : Move.X;
                handleRematchGame(game, 0, newMove); // Start with empty board
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Request Rematch
            </button>
          )}

          {rematchRequested && !opponentAcceptedRematch && (
            <div className="text-blue-500">Waiting for opponent to accept rematch...</div>
          )}

          {opponentAcceptedRematch && (
            <div className="text-green-500">
              Opponent accepted! Starting new game with same bet amount...
              <div className="mt-2 text-sm">
                {isPlayerOne ? "You will play as O" : "You will play as X"} this time
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

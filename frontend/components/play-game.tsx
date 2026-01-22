"use client";

import { Game, Move } from "@/lib/contract";
import { GameBoard } from "./game-board";
import { LoadingSpinner } from "./loading-spinner";
import { Notification } from "./notification";
import { abbreviateAddress, explorerAddress, formatStx } from "@/lib/stx-utils";
import Link from "next/link";
import { useStacks } from "@/hooks/use-stacks";
import { useState, useEffect } from "react";

interface PlayGameProps {
  game: Game;
}

export function PlayGame({ game }: PlayGameProps) {
  const {
    userData,
    handleJoinGame,
    handlePlayGame,
    handleRematchGame,
    handleClaimTimeout,
    transactionState,
    notification,
    hideNotification
  } = useStacks();
  const [board, setBoard] = useState(game.board);
  const [playedMoveIndex, setPlayedMoveIndex] = useState(-1);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // State for muting sound effects

  // Function to play sound effects
  const playSound = (sound: string) => {
    if (isMuted) return;
    const audio = new Audio(`/${sound}.mp3`);
    audio.play().catch(() => {}); // Ignore errors if audio fails
  };

  // Function to get the appropriate sound for game end
  // Returns 'victory' for wins, 'defeat' for losses, and 'draw' for ties
  const getGameEndSound = (game: Game) => {
    if (game.winner) {
      return game.winner === userData?.profile.stxAddress.testnet ? 'victory' : 'defeat';
    } else {
      return 'draw'; // Draw has its own neutral sound effect
    }
  };

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
  const isGameOver = game.finished;


  // Play win/lose/draw sounds when game ends
  useEffect(() => {
    if (game.finished) {
      if (game.winner) {
        if (game.winner === userData.profile.stxAddress.testnet) {
          playSound('victory');
        } else {
          playSound('defeat');
        }
      } else {
        // Draw - play defeat sound as a neutral outcome
        playSound('defeat');
      }
    }
  }, [game.finished, game.winner]);

  function onCellClick(index: number) {
    if (game.board[index] === Move.EMPTY) {
      playSound('move'); // Play move sound when placing a valid move
    }
    const tempBoard = [...game.board];
    tempBoard[index] = nextMove;
    setBoard(tempBoard);
    setPlayedMoveIndex(index);
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm sm:max-w-md mx-auto px-4">
      <GameBoard
        board={board}
        onCellClick={onCellClick}
        nextMove={nextMove}
        cellClassName="size-20 sm:size-32 text-4xl sm:text-6xl"
      />

      {/* Mute/Unmute toggle button */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="px-4 py-2 min-h-10 bg-gray-200 hover:bg-gray-300 rounded text-sm sm:text-base"
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>

      <div className="flex flex-col gap-2 text-sm sm:text-base">
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

        {game["winner"] ? (
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
        ) : game.finished ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500">Result: </span>
            <span>Draw</span>
          </div>
        ) : null}
      </div>

      {isJoinable && (
        <button
          onClick={() => handleJoinGame(game.id, playedMoveIndex, nextMove)}
          disabled={transactionState.isPending || playedMoveIndex === -1}
          className="bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 min-h-12 rounded flex items-center justify-center gap-2 text-base"
        >
          {transactionState.isPending && transactionState.type === "joinGame" ? (
            <>
              <LoadingSpinner size="sm" />
              Joining Game...
            </>
          ) : (
            "Join Game"
          )}
        </button>
      )}

      {isMyTurn && (
        <button
          onClick={() => handlePlayGame(game.id, playedMoveIndex, nextMove)}
          disabled={transactionState.isPending || playedMoveIndex === -1}
          className="bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 min-h-12 rounded flex items-center justify-center gap-2 text-base"
        >
          {transactionState.isPending && transactionState.type === "playGame" ? (
            <>
              <LoadingSpinner size="sm" />
              Playing Move...
            </>
          ) : (
            "Play"
          )}
        </button>
      )}

      {isJoinedAlready && !isMyTurn && !isGameOver && (
        <div className="flex flex-col gap-2">
          <div className="text-gray-500 text-sm sm:text-base">Waiting for opponent to play...</div>
          <button
            onClick={() => handleClaimTimeout(game.id)}
            disabled={transactionState.isPending}
            className="bg-red-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 min-h-12 rounded flex items-center justify-center gap-2 text-base"
          >
            {transactionState.isPending && transactionState.type === "claimTimeout" ? (
              <>
                <LoadingSpinner size="sm" />
                Claiming Timeout...
              </>
            ) : (
              "Claim Timeout"
            )}
          </button>
        </div>
      )}

      {/* Rematch functionality - creates a new on-chain game with swapped player roles */}
      {isGameOver && (
        <div className="mt-4 p-4 border rounded-lg text-sm sm:text-base">
          <h3 className="font-semibold mb-2 text-base sm:text-lg">Game Over!</h3>

          {!rematchRequested && (
            <button
              onClick={() => {
                setRematchRequested(true);
                // Start a new game with same bet amount but swap player positions
                // Player who was O becomes X, and vice versa
                const newMove = isPlayerOne ? Move.O : Move.X;
                handleRematchGame(game, 0, newMove); // Start with empty board
              }}
              disabled={transactionState.isPending}
              className="bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 min-h-12 rounded hover:bg-green-600 flex items-center justify-center gap-2 text-base"
            >
              {transactionState.isPending && transactionState.type === "rematchGame" ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating Rematch Game...
                </>
              ) : (
                "Request Rematch"
              )}
            </button>
          )}

          {rematchRequested && transactionState.type === "rematchGame" && !transactionState.isPending && transactionState.error === null && (
            <div className="text-green-500">
              <p className="font-medium">✅ Rematch game created successfully!</p>
              <p className="text-sm mt-1">
                💰 Same bet amount: {formatStx(game["bet-amount"])} STX
              </p>
              <p className="text-sm mt-1">
                🎮 {isPlayerOne ? "You are now playing as O" : "You are now playing as X"}
              </p>
              <p className="text-xs mt-1 text-gray-600">
                🔄 Player positions swapped from original game. Your opponent can join the new game from the games list.
              </p>
              <div className="mt-3">
                <Link
                  href="/"
                  className="bg-blue-500 text-white px-6 py-3 min-h-12 rounded hover:bg-blue-600 inline-block text-base"
                >
                  📋 View Games List
                </Link>
              </div>
              {/* TODO: Add real-time notifications when opponent joins the rematch */}
            </div>
          )}

          {rematchRequested && transactionState.type === "rematchGame" && transactionState.error && (
            <div className="text-red-500">
              <p className="font-medium">❌ Failed to create rematch game</p>
              <p className="text-sm mt-1">{transactionState.error}</p>
            </div>
          )}
        </div>
      )}
      
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
}

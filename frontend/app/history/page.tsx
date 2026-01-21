"use client";

import { useState, useEffect } from "react";
import { getAllGames, Game } from "@/lib/contract";

export default function HistoryPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [playerFilter, setPlayerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 10;

  useEffect(() => {
    getAllGames().then(allGames => {
      const completed = allGames.filter(game => game.finished);
      setGames(completed);
      setFilteredGames(completed);
    });
  }, []);

  useEffect(() => {
    if (playerFilter) {
      const filtered = games.filter(game =>
        game["player-one"].toLowerCase().includes(playerFilter.toLowerCase()) ||
        (game["player-two"] && game["player-two"].toLowerCase().includes(playerFilter.toLowerCase()))
      );
      setFilteredGames(filtered);
      setCurrentPage(1);
    } else {
      setFilteredGames(games);
    }
  }, [playerFilter, games]);

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * gamesPerPage,
    currentPage * gamesPerPage
  );

  const getLoser = (game: Game) => {
    if (!game.winner) return null; // Draw, no loser
    return game.winner === game["player-one"] ? game["player-two"] : game["player-one"];
  };

  const getWinnings = (game: Game) => {
    return game["bet-amount"] * 2;
  };

  return (
    <section className="flex flex-col items-center py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Game History</h1>
        <span className="text-sm text-gray-500">View completed games</span>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by player address"
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        />
      </div>
      <div className="w-full max-w-4xl">
        {paginatedGames.map(game => (
          <div key={game.id} className="border p-4 mb-4 rounded">
            <div className="flex justify-between">
              <div>
                {game.winner ? (
                  <>
                    <p>Winner: {game.winner}</p>
                    <p>Loser: {getLoser(game)}</p>
                    <p>Winnings: {getWinnings(game)} STX</p>
                  </>
                ) : (
                  <p>Result: Draw</p>
                )}
                <p>Bet: {game["bet-amount"]} STX</p>
              </div>
              <div>
                <h3>Move History</h3>
                <ul>
                  {game.moves.map((move, index) => (
                    <li key={index}>
                      Move {index + 1}: Position {move.moveIndex}, {move.move === 1 ? 'X' : 'O'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-4xl mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
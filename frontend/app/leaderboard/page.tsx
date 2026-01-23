"use client";

import { getAllPlayerStats } from "@/lib/contract";
import Link from "next/link";
import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";

type SortOption = "wins" | "stxWon" | "winRate";

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortOption>("wins");
  const [allPlayerStats, setAllPlayerStats] = useState([]);

  useEffect(() => {
    getAllPlayerStats().then(setAllPlayerStats);
  }, []);

  // Calculate win rate for each player
  const playersWithWinRate = allPlayerStats.map((stats) => ({
    ...stats,
    winRate: stats.gamesPlayed > 0 ? stats.wins / stats.gamesPlayed : 0,
  }));

  // Sort players based on selected option
  const sortedPlayers = [...playersWithWinRate].sort((a, b) => {
    switch (sortBy) {
      case "wins":
        return b.wins - a.wins;
      case "stxWon":
        return b.stxWon - a.stxWon;
      case "winRate":
        return b.winRate - a.winRate;
      default:
        return b.wins - a.wins;
    }
  });

  return (
    <section className="flex flex-col items-center py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Global Leaderboard</h1>
        <span className="text-sm text-gray-500">
          Top players in Tic Tac Toe
        </span>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex justify-end mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("wins")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === "wins"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sort by Wins
            </button>
            <button
              onClick={() => setSortBy("stxWon")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === "stxWon"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sort by STX Won
            </button>
            <button
              onClick={() => setSortBy("winRate")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === "winRate"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Sort by Win Rate
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wins
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Losses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Games Played
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STX Won
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPlayers.length > 0 ? (
                sortedPlayers.map((stats, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.wins > 0 ? "Player " + (index + 1) : "New Player"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.wins}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.losses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.gamesPlayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(stats.stxWon / 1000000).toFixed(2)} STX
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.gamesPlayed > 0
                        ? `${Math.round(stats.winRate * 100)}%`
                        : "0%"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No player statistics available yet. Play some games to populate
                    the leaderboard!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
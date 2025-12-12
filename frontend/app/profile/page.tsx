import { getPlayerStats } from "@/lib/contract";
import { useStacks } from "@/hooks/use-stacks";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userData } = useStacks();

  if (!userData) {
    return (
      <section className="flex flex-col items-center py-20">
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold">Player Profile</h1>
          <span className="text-sm text-gray-500">
            Connect your wallet to view your statistics
          </span>
        </div>
      </section>
    );
  }

  const playerAddress = userData.profile.stxAddress.testnet;
  const playerStats = await getPlayerStats(playerAddress);

  return (
    <section className="flex flex-col items-center py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Player Profile</h1>
        <span className="text-sm text-gray-500">
          Your Tic Tac Toe statistics
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">
              {playerAddress.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-semibold">{playerAddress}</h2>
        </div>

        {playerStats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{playerStats.wins}</div>
              <div className="text-gray-600">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{playerStats.losses}</div>
              <div className="text-gray-600">Losses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{playerStats.gamesPlayed}</div>
              <div className="text-gray-600">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{playerStats.stxWon / 1000000} STX</div>
              <div className="text-gray-600">STX Won</div>
            </div>
            <div className="col-span-2 text-center mt-4">
              <div className="text-3xl font-bold text-yellow-600">
                {playerStats.gamesPlayed > 0
                  ? Math.round((playerStats.wins / playerStats.gamesPlayed) * 100)
                  : 0}%
              </div>
              <div className="text-gray-600">Win Rate</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p>No statistics available yet.</p>
            <p>Play some games to start tracking your stats!</p>
          </div>
        )}

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
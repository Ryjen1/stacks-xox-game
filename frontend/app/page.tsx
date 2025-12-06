import { GamesList } from "@/components/games-list";
import { getAllGames } from "@/lib/contract";

export const dynamic = "force-dynamic";

export default async function Home() {
  const games = await getAllGames();

  return (
    <section className="flex flex-col items-center py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Tic Tac Toe 🎲</h1>
        <span className="text-sm text-gray-500">
          Play 1v1 Tic Tac Toe on the Stacks blockchain
        </span>
      </div>

      <GamesList games={games} />
    </section>
  );
}

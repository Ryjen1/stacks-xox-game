import { PlayGame } from "@/components/play-game";
import { getGame } from "@/lib/contract";

type Params = Promise<{ gameId: string }>;

export default async function GamePage({ params }: { params: Params }) {
  const gameId = (await params).gameId;
  const game = await getGame(parseInt(gameId));
  if (!game) return <div>Game not found</div>;

  return (
    <section className="flex flex-col items-center py-20">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-bold">Game #{gameId}</h1>
        <span className="text-sm text-gray-500">
          Play the game with your opponent
        </span>
      </div>

      <PlayGame game={game} />
    </section>
  );
}

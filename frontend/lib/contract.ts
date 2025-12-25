import { STACKS_TESTNET } from "@stacks/network";
import {
  BooleanCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  ListCV,
  OptionalCV,
  PrincipalCV,
  TupleCV,
  uintCV,
  UIntCV,
} from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST10NK6Q0AV4E95JATQMHV58G5QCR6AGXF43Y86CF";
const CONTRACT_NAME = "stacks-xox-game";

type GameCV = {
  "player-one": PrincipalCV;
  "player-two": OptionalCV<PrincipalCV>;
  "is-player-one-turn": BooleanCV;
  "bet-amount": UIntCV;
  board: ListCV<UIntCV>;
  winner: OptionalCV<PrincipalCV>;
  moves: ListCV<TupleCV<{ "move-index": UIntCV, move: UIntCV }>>;
};

export type Game = {
  id: number;
  "player-one": string;
  "player-two": string | null;
  "is-player-one-turn": boolean;
  "bet-amount": number;
  board: number[];
  winner: string | null;
  moves: {moveIndex: number, move: number}[];
};

export type PlayerStats = {
  wins: number;
  losses: number;
  stxWon: number;
  gamesPlayed: number;
};

export enum Move {
  EMPTY = 0,
  X = 1,
  O = 2,
}

export const EMPTY_BOARD = [
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
];

export async function getAllGames() {
  // Fetch the latest-game-id from the contract
  const latestGameIdCV = (await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-latest-game-id",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  })) as UIntCV;

  // Convert the uintCV to a JS/TS number type
  const latestGameId = parseInt(latestGameIdCV.value.toString());

  // Loop from 0 to latestGameId-1 and fetch the game details for each game
  const games: Game[] = [];
  for (let i = 0; i < latestGameId; i++) {
    const game = await getGame(i);
    if (game) games.push(game);
  }
  return games;
}

export async function getGame(gameId: number) {
  // Use the get-game read only function to fetch the game details for the given gameId
  const gameDetails = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-game",
    functionArgs: [uintCV(gameId)],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  const responseCV = gameDetails as OptionalCV<TupleCV<GameCV>>;
  // If we get back a none, then the game does not exist and we return null
  if (responseCV.type === "none") return null;
  // If we get back a value that is not a tuple, something went wrong and we return null
  if (responseCV.value.type !== "tuple") return null;

  // If we got back a GameCV tuple, we can convert it to a Game object
  const gameCV = responseCV.value.value;

  const game: Game = {
    id: gameId,
    "player-one": gameCV["player-one"].value,
    "player-two":
      gameCV["player-two"].type === "some"
        ? gameCV["player-two"].value.value
        : null,
    "is-player-one-turn": cvToValue(gameCV["is-player-one-turn"]),
    "bet-amount": parseInt(gameCV["bet-amount"].value.toString()),
    board: gameCV["board"].value.map((cell: UIntCV) => parseInt(cell.value.toString())),
    winner:
      gameCV["winner"].type === "some" ? gameCV["winner"].value.value : null,
    moves: gameCV["moves"].value.map((moveCV: TupleCV<{ "move-index": UIntCV, move: UIntCV }>) => ({
      moveIndex: parseInt(moveCV.value["move-index"].value.toString()),
      move: parseInt(moveCV.value.move.value.toString())
    })),
  };
  return game;
}

export async function createNewGame(
  betAmount: number,
  moveIndex: number,
  move: Move
) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-game",
    functionArgs: [uintCV(betAmount), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function createRematchGame(
  originalGame: Game,
  moveIndex: number,
  move: Move
) {
  // Create a new game with the same bet amount but swap player positions
  const betAmount = originalGame["bet-amount"];

  // Validate that this is a valid rematch scenario
  if (!originalGame.winner) {
    throw new Error("Game must be completed before creating a rematch");
  }

  // Ensure same bet amount is used
  if (betAmount <= 0) {
    throw new Error("Invalid bet amount for rematch");
  }

  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-game",
    functionArgs: [uintCV(betAmount), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function acceptRematchGame(
  gameId: number,
  moveIndex: number,
  move: Move
) {
  // This would be called by the second player to join the rematch game
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "join-game",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function joinGame(gameId: number, moveIndex: number, move: Move) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "join-game",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function play(gameId: number, moveIndex: number, move: Move) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "play",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function getPlayerStats(playerAddress: string): Promise<PlayerStats | null> {
  const playerStatsCV = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-player-stats",
    functionArgs: [PrincipalCV.fromString(playerAddress)],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  const responseCV = playerStatsCV as OptionalCV<TupleCV<{
    wins: UIntCV;
    losses: UIntCV;
    "stx-won": UIntCV;
    "games-played": UIntCV;
  }>>;

  if (responseCV.type === "none") return null;

  if (responseCV.value.type !== "tuple") return null;

  const statsCV = responseCV.value.value;

  return {
    wins: parseInt(statsCV.wins.value.toString()),
    losses: parseInt(statsCV.losses.value.toString()),
    stxWon: parseInt(statsCV["stx-won"].value.toString()),
    gamesPlayed: parseInt(statsCV["games-played"].value.toString()),
  };
}

export async function getAllPlayerStats(): Promise<PlayerStats[]> {
  const allStatsCV = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-all-player-stats",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  const responseCV = allStatsCV as ListCV<TupleCV<{
    wins: UIntCV;
    losses: UIntCV;
    "stx-won": UIntCV;
    "games-played": UIntCV;
  }>>;

  if (responseCV.type !== "list") return [];

  return responseCV.value.map((statsCV: TupleCV<{
    wins: UIntCV;
    losses: UIntCV;
    "stx-won": UIntCV;
    "games-played": UIntCV;
  }>) => {
    const stats = statsCV.value;
    return {
      wins: parseInt(stats.wins.value.toString()),
      losses: parseInt(stats.losses.value.toString()),
      stxWon: parseInt(stats["stx-won"].value.toString()),
      gamesPlayed: parseInt(stats["games-played"].value.toString()),
    };
  });
}

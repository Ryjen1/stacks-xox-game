import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

// Helper function to create a new game with the given bet amount, move index, and move
// on behalf of the `user` address
function createGame(
  betAmount: number,
  moveIndex: number,
  move: number,
  user: string
) {
  return simnet.callPublicFn(
    "stacks-xox-game",
    "create-game",
    [Cl.uint(betAmount), Cl.uint(moveIndex), Cl.uint(move)],
    user
  );
}

// Helper function to join a game with the given move index and move on behalf of the `user` address
function joinGame(moveIndex: number, move: number, user: string) {
  return simnet.callPublicFn(
    "stacks-xox-game",
    "join-game",
    [Cl.uint(0), Cl.uint(moveIndex), Cl.uint(move)],
    user
  );
}

// Helper function to play a move with the given move index and move on behalf of the `user` address
function play(moveIndex: number, move: number, user: string) {
  return simnet.callPublicFn(
    "stacks-xox-game",
    "play",
    [Cl.uint(0), Cl.uint(moveIndex), Cl.uint(move)],
    user
  );
}

// Helper function to claim timeout for a game on behalf of the `user` address
function claimTimeout(user: string) {
  return simnet.callPublicFn(
    "stacks-xox-game",
    "claim-timeout",
    [Cl.uint(0)],
    user
  );
}

describe("Tic Tac Toe Tests", () => {
  it("allows game creation", () => {
    const { result, events } = createGame(100, 0, 1, alice);

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2); // print_event and stx_transfer_event
  });

  it("allows game joining", () => {
    createGame(100, 0, 1, alice);
    const { result, events } = joinGame(1, 2, bob);

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2); // print_event and stx_transfer_event
  });

  it("allows game playing", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);
    const { result, events } = play(2, 1, alice);

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(1); // print_event
  });

  it("does not allow creating a game with a bet amount of 0", () => {
    const { result } = createGame(0, 0, 1, alice);
    expect(result).toBeErr(Cl.uint(100));
  });

  it("does not allow joining a game that has already been joined", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);

    const { result } = joinGame(1, 2, alice);
    expect(result).toBeErr(Cl.uint(103));
  });

  it("does not allow an out of bounds move", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);

    const { result } = play(10, 1, alice);
    expect(result).toBeErr(Cl.uint(101));
  });

  it("does not allow a non X or O move", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);

    const { result } = play(2, 3, alice);
    expect(result).toBeErr(Cl.uint(101));
  });

  it("does not allow moving on an occupied spot", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);

    const { result } = play(1, 1, alice);
    expect(result).toBeErr(Cl.uint(101));
  });

  it("allows player one to win", () => {
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
    play(1, 1, alice);
    play(4, 2, bob);
    const { result, events } = play(2, 1, alice);

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2); // print_event and stx_transfer_event

    const gameData = simnet.getMapEntry("stacks-xox-game", "games", Cl.uint(0));
    expect(gameData).toBeSome(
      Cl.tuple({
        "player-one": Cl.principal(alice),
        "player-two": Cl.some(Cl.principal(bob)),
        "is-player-one-turn": Cl.bool(false),
        "bet-amount": Cl.uint(100),
        board: Cl.list([
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(2),
          Cl.uint(2),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(0),
        ]),
        winner: Cl.some(Cl.principal(alice)),
        finished: Cl.bool(true),
        "last-move-block-height": Cl.uint(5),
        moves: Cl.list([
          Cl.tuple({ "move-index": Cl.uint(0), move: Cl.uint(1) }),
          Cl.tuple({ "move-index": Cl.uint(3), move: Cl.uint(2) }),
          Cl.tuple({ "move-index": Cl.uint(1), move: Cl.uint(1) }),
          Cl.tuple({ "move-index": Cl.uint(4), move: Cl.uint(2) }),
          Cl.tuple({ "move-index": Cl.uint(2), move: Cl.uint(1) }),
        ]),
      })
    );
  });

  it("allows player two to win", () => {
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
    play(1, 1, alice);
    play(4, 2, bob);
    play(8, 1, alice);
    const { result, events } = play(5, 2, bob);

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2); // print_event and stx_transfer_event

    const gameData = simnet.getMapEntry("stacks-xox-game", "games", Cl.uint(0));
    expect(gameData).toBeSome(
      Cl.tuple({
        "player-one": Cl.principal(alice),
        "player-two": Cl.some(Cl.principal(bob)),
        "is-player-one-turn": Cl.bool(true),
        "bet-amount": Cl.uint(100),
        board: Cl.list([
          Cl.uint(1),
          Cl.uint(1),
          Cl.uint(0),
          Cl.uint(2),
          Cl.uint(2),
          Cl.uint(2),
          Cl.uint(0),
          Cl.uint(0),
          Cl.uint(1),
        ]),
        winner: Cl.some(Cl.principal(bob)),
        finished: Cl.bool(true),
      })
    );
  });

  it("detects a draw when all cells are filled without a winner", () => {
    createGame(100, 0, 1, alice); // X at 0
    joinGame(1, 2, bob); // O at 1
    play(2, 1, alice); // X at 2
    play(3, 2, bob); // O at 3
    play(5, 1, alice); // X at 5
    play(4, 2, bob); // O at 4
    play(6, 1, alice); // X at 6
    play(7, 2, bob); // O at 7
    const { result, events } = play(8, 1, alice); // X at 8, board full, draw

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(3); // print_event and 2 stx_transfer_events (bets returned)

    const gameData = simnet.getMapEntry("stacks-xox-game", "games", Cl.uint(0));
    expect(gameData).toBeSome(
      Cl.tuple({
        "player-one": Cl.principal(alice),
        "player-two": Cl.some(Cl.principal(bob)),
        "is-player-one-turn": Cl.bool(false),
        "bet-amount": Cl.uint(100),
        board: Cl.list([
          Cl.uint(1), Cl.uint(2), Cl.uint(1),
          Cl.uint(2), Cl.uint(2), Cl.uint(1),
          Cl.uint(1), Cl.uint(2), Cl.uint(1),
        ]),
        winner: Cl.none(),
        finished: Cl.bool(true),
        "last-move-block-height": Cl.uint(10),
        moves: Cl.list([
          Cl.tuple({ "move-index": Cl.uint(0), move: Cl.uint(1) }),
          Cl.tuple({ "move-index": Cl.uint(1), move: Cl.uint(2) }),
          Cl.tuple({ "move-index": Cl.uint(2), move: Cl.uint(1) }),
          Cl.tuple({ "move-index": Cl.uint(3), move: Cl.uint(2) }),
          Cl.tuple({ "move-index": Cl.uint(5), move: Cl.uint(1) }),
          Cl.tuple({ "move-index": Cl.uint(4), move: Cl.uint(2) }),
          Cl.tuple({ "move-index": Cl.uint(6), move: Cl.uint(1) }),
          Cl.tuple({ "move-index": Cl.uint(7), move: Cl.uint(2) }),
          Cl.tuple({ "move-index": Cl.uint(8), move: Cl.uint(1) }),
        ]),
      })
    );

    // Check that bets are returned: 2 events for returning bets
    expect(events[1].type).toBe('stx_transfer_event');
    expect(events[2].type).toBe('stx_transfer_event');
  });

  it("allows claiming timeout when opponent doesn't move", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);
    play(2, 1, alice); // Alice plays, now Bob's turn

    // Advance blocks to simulate timeout (TIMEOUT_BLOCKS = 10)
    simnet.mineEmptyBlocks(10);

    // Bob claims timeout
    const { result, events } = claimTimeout(bob);

    expect(result).toBeOk(Cl.uint(0));
    expect(events.length).toBe(2); // print_event and stx_transfer_event

    const gameData = simnet.getMapEntry("stacks-xox-game", "games", Cl.uint(0));
    expect(gameData).toBeSome(
      Cl.tuple({
        "player-one": Cl.principal(alice),
        "player-two": Cl.some(Cl.principal(bob)),
        "is-player-one-turn": Cl.bool(false), // Alice's turn, but timeout claimed by Bob
        "bet-amount": Cl.uint(100),
        board: Cl.list([
          Cl.uint(1), Cl.uint(2), Cl.uint(1),
          Cl.uint(0), Cl.uint(0), Cl.uint(0),
          Cl.uint(0), Cl.uint(0), Cl.uint(0),
        ]),
        winner: Cl.some(Cl.principal(bob)),
        finished: Cl.bool(true),
        "last-move-block-height": Cl.uint(3), // From Alice's last move
      })
    );
  });

  it("does not allow claiming timeout before timeout period", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);
    play(2, 1, alice); // Alice plays, now Bob's turn

    // Advance blocks but not enough for timeout
    simnet.mineEmptyBlocks(5);

    // Bob tries to claim timeout too early
    const { result } = claimTimeout(bob);
    expect(result).toBeErr(Cl.uint(106)); // ERR_TIMEOUT_NOT_REACHED
  });

  it("does not allow claiming timeout on finished game", () => {
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
    play(1, 1, alice);
    play(4, 2, bob);
    play(2, 1, alice); // Alice wins, game finished

    // Try to claim timeout on finished game
    const { result } = claimTimeout(bob);
    expect(result).toBeErr(Cl.uint(105)); // ERR_GAME_ALREADY_FINISHED
  });

  it("does not allow non-opponent to claim timeout", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);
    play(2, 1, alice); // Alice plays, now Bob's turn

    // Advance blocks for timeout
    simnet.mineEmptyBlocks(10);

    // Alice tries to claim timeout (she's not the opponent whose turn it is)
    const { result } = claimTimeout(alice);
    expect(result).toBeErr(Cl.uint(107)); // ERR_NOT_OPPONENT
  });
});

describe("Player Statistics Tests", () => {
  it("initializes player stats when a player wins", () => {
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
    play(1, 1, alice);
    play(4, 2, bob);
    play(2, 1, alice); // Alice wins

    // Check Alice's stats
    const aliceStats = simnet.getMapEntry("stacks-xox-game", "player-stats", Cl.principal(alice));
    expect(aliceStats).toBeSome(
      Cl.tuple({
        wins: Cl.uint(1),
        losses: Cl.uint(0),
        "stx-won": Cl.uint(200), // 2 * bet amount
        "games-played": Cl.uint(1)
      })
    );

    // Check Bob's stats
    const bobStats = simnet.getMapEntry("stacks-xox-game", "player-stats", Cl.principal(bob));
    expect(bobStats).toBeSome(
      Cl.tuple({
        wins: Cl.uint(0),
        losses: Cl.uint(1),
        "stx-won": Cl.uint(0),
        "games-played": Cl.uint(1)
      })
    );
  });

  it("updates player stats correctly for multiple games", () => {
    // First game - Alice wins
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
    play(1, 1, alice);
    play(4, 2, bob);
    play(2, 1, alice);

    // Second game - Bob wins
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
    play(1, 1, alice);
    play(4, 2, bob);
    play(8, 1, alice);
    play(5, 2, bob);

    // Check Alice's stats after 1 win, 1 loss
    const aliceStats = simnet.getMapEntry("stacks-xox-game", "player-stats", Cl.principal(alice));
    expect(aliceStats).toBeSome(
      Cl.tuple({
        wins: Cl.uint(1),
        losses: Cl.uint(1),
        "stx-won": Cl.uint(200), // Only from first win
        "games-played": Cl.uint(2)
      })
    );

    // Check Bob's stats after 1 win, 1 loss
    const bobStats = simnet.getMapEntry("stacks-xox-game", "player-stats", Cl.principal(bob));
    expect(bobStats).toBeSome(
      Cl.tuple({
        wins: Cl.uint(1),
        losses: Cl.uint(1),
        "stx-won": Cl.uint(200), // Only from second win
        "games-played": Cl.uint(2)
      })
    );
  });

  it("returns correct player stats via read-only functions", () => {
    // Setup: Alice wins a game
    createGame(100, 0, 1, alice);
    joinGame(3, 2, bob);
    play(1, 1, alice);
    play(4, 2, bob);
    play(2, 1, alice);

    // Test get-player-stats function
    const aliceStatsResult = simnet.callReadOnlyFn(
      "stacks-xox-game",
      "get-player-stats",
      [Cl.principal(alice)],
      alice
    );

    expect(aliceStatsResult).toBeSome(
      Cl.tuple({
        wins: Cl.uint(1),
        losses: Cl.uint(0),
        "stx-won": Cl.uint(200),
        "games-played": Cl.uint(1)
      })
    );

    // Test get-all-player-stats function
    const allStatsResult = simnet.callReadOnlyFn(
      "stacks-xox-game",
      "get-all-player-stats",
      [],
      alice
    );

    // Should return a list with both players' stats
    expect(allStatsResult).toBeOk(Cl.list([
      Cl.tuple({
        wins: Cl.uint(1),
        losses: Cl.uint(0),
        "stx-won": Cl.uint(200),
        "games-played": Cl.uint(1)
      }),
      Cl.tuple({
        wins: Cl.uint(0),
        losses: Cl.uint(1),
        "stx-won": Cl.uint(0),
        "games-played": Cl.uint(1)
      })
    ]));
  });

  it("updates player stats correctly for a draw", () => {
    createGame(100, 0, 1, alice);
    joinGame(1, 2, bob);
    play(2, 1, alice);
    play(3, 2, bob);
    play(5, 1, alice);
    play(4, 2, bob);
    play(6, 1, alice);
    play(7, 2, bob);
    play(8, 1, alice); // Draw

    // Check Alice's stats
    const aliceStats = simnet.getMapEntry("stacks-xox-game", "player-stats", Cl.principal(alice));
    expect(aliceStats).toBeSome(
      Cl.tuple({
        wins: Cl.uint(0),
        losses: Cl.uint(0),
        "stx-won": Cl.uint(0),
        "games-played": Cl.uint(1)
      })
    );

    // Check Bob's stats
    const bobStats = simnet.getMapEntry("stacks-xox-game", "player-stats", Cl.principal(bob));
    expect(bobStats).toBeSome(
      Cl.tuple({
        wins: Cl.uint(0),
        losses: Cl.uint(0),
        "stx-won": Cl.uint(0),
        "games-played": Cl.uint(1)
      })
    );
  });
});

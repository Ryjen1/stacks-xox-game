(define-constant THIS_CONTRACT (as-contract tx-sender)) ;; The address of this contract itself
(define-constant ERR_MIN_BET_AMOUNT u100) ;; Error thrown when a player tries to create a game with a bet amount less than the minimum (0.0001 STX)
(define-constant ERR_INVALID_MOVE u101) ;; Error thrown when a move is invalid, i.e. not within range of the board or not an X or an O
(define-constant ERR_GAME_NOT_FOUND u102) ;; Error thrown when a game cannot be found given a Game ID, i.e. invalid Game ID
(define-constant ERR_GAME_CANNOT_BE_JOINED u103) ;; Error thrown when a game cannot be joined, usually because it already has two players
(define-constant ERR_NOT_YOUR_TURN u104) ;; Error thrown when a player tries to make a move when it is not their turn
(define-constant ERR_GAME_ALREADY_FINISHED u105) ;; Error thrown when trying to claim timeout on a finished game
(define-constant ERR_TIMEOUT_NOT_REACHED u106) ;; Error thrown when timeout has not been reached yet
(define-constant ERR_NOT_OPPONENT u107) ;; Error thrown when non-opponent tries to claim timeout
(define-constant TIMEOUT_BLOCKS u10) ;; Number of blocks after which timeout can be claimed

;; The Game ID to use for the next game
(define-data-var latest-game-id uint u0)

;; Player statistics tracking
(define-map player-stats
    principal ;; Key (Player address)
    { ;; Value (Player Stats)
        wins: uint,
        losses: uint,
        stx-won: uint,
        games-played: uint
    }
)

(define-map games
    uint ;; Key (Game ID)
    { ;; Value (Game Tuple)
        player-one: principal,
        player-two: (optional principal),
        is-player-one-turn: bool,

        bet-amount: uint,
        board: (list 9 uint),

        winner: (optional principal),
        finished: bool,
        last-move-block-height: uint,
        ;; moves: list of all moves made in the game as {move-index, move} tuples
        moves: (list 9 {move-index: uint, move: uint}),
        is-ai-game: bool
    }
)

;; Creates a new game with the specified bet amount and initial move by the creator (X).
;; The creator places their first move and the contract holds the bet amount.
;; Returns the new game ID on success.
(define-public (create-game (bet-amount uint) (move-index uint) (move uint))
    (let (
        ;; Get the Game ID to use for creation of this new game
        (game-id (var-get latest-game-id))
        ;; The initial starting board for the game with all cells empty
        (starting-board (list u0 u0 u0 u0 u0 u0 u0 u0 u0))
        ;; Updated board with the starting move played by the game creator (X)
        (game-board (unwrap! (replace-at? starting-board move-index move) (err ERR_INVALID_MOVE)))
        ;; Create the game data tuple with initial move tracking
        (game-data {
            player-one: contract-caller,
            player-two: none,
            is-player-one-turn: false,
            bet-amount: bet-amount,
            board: game-board,
            winner: none,
            finished: false,
            last-move-block-height: stacks-block-height,
            moves: (list {move-index: move-index, move: move})
        })
    )

    ;; Ensure that user has put up a bet amount of at least the minimum
    (asserts! (>= bet-amount u100) (err ERR_MIN_BET_AMOUNT))
    ;; Ensure that the move being played is an `X`, not an `O`
    (asserts! (is-eq move u1) (err ERR_INVALID_MOVE))
    ;; Ensure that the move meets validity requirements
    (asserts! (validate-move starting-board move-index move) (err ERR_INVALID_MOVE))

    ;; Transfer the bet amount STX from user to this contract
    (try! (stx-transfer? bet-amount contract-caller THIS_CONTRACT))
    ;; Update the games map with the new game data
    (map-set games game-id game-data)
    ;; Increment the Game ID counter
    (var-set latest-game-id (+ game-id u1))

    ;; Log the creation of the new game
    (print { action: "create-game", data: game-data})
    ;; Return the Game ID of the new game
    (ok game-id)
))

;; Joins an existing game by providing the game ID and the second player's initial move (O).
;; The second player places their first move and the contract holds the bet amount.
;; Returns the game ID on success.
(define-public (join-game (game-id uint) (move-index uint) (move uint))
    (let (
        ;; Load the game data for the game being joined, throw an error if Game ID is invalid
        (original-game-data (unwrap! (map-get? games game-id) (err ERR_GAME_NOT_FOUND)))
        ;; Get the original board from the game data
        (original-board (get board original-game-data))

        ;; Update the game board by placing the player's move at the specified index
        (game-board (unwrap! (replace-at? original-board move-index move) (err ERR_INVALID_MOVE)))
        ;; Update the copy of the game data with the updated board and marking the next turn to be player two's turn
        (game-data (merge original-game-data {
            board: game-board,
            player-two: (some contract-caller),
            is-player-one-turn: true,
            finished: false,
            last-move-block-height: stacks-block-height,
            moves: (append (get moves original-game-data) {move-index: move-index, move: move})
        }))
    )

    ;; Ensure that the game being joined is able to be joined
    ;; i.e. player-two is currently empty
    (asserts! (is-none (get player-two original-game-data)) (err ERR_GAME_CANNOT_BE_JOINED)) 
    ;; Ensure that the move being played is an `O`, not an `X`
    (asserts! (is-eq move u2) (err ERR_INVALID_MOVE))
    ;; Ensure that the move meets validity requirements
    (asserts! (validate-move original-board move-index move) (err ERR_INVALID_MOVE))

    ;; Transfer the bet amount STX from user to this contract
    (try! (stx-transfer? (get bet-amount original-game-data) contract-caller THIS_CONTRACT))
    ;; Update the games map with the new game data
    (map-set games game-id game-data)

    ;; Log the joining of the game
    (print { action: "join-game", data: game-data})
    ;; Return the Game ID of the game
    (ok game-id)
))

;; Allows a player to claim a win if their opponent has not made a move within the timeout period.
;; Transfers all bets to the claimant and updates player statistics.
;; Returns the game ID on success.
(define-public (claim-timeout (game-id uint))
    (let (
        ;; Load the game data for the game being claimed, throw an error if Game ID is invalid
        (original-game-data (unwrap! (map-get? games game-id) (err ERR_GAME_NOT_FOUND)))
        ;; Get the player whose turn it currently is (the one who should have moved)
        (current-turn-player (if (get is-player-one-turn original-game-data) (get player-one original-game-data) (unwrap! (get player-two original-game-data) (err ERR_GAME_NOT_FOUND))))
        ;; The opponent is the one claiming timeout
        (opponent (if (get is-player-one-turn original-game-data) (unwrap! (get player-two original-game-data) (err ERR_GAME_NOT_FOUND)) (get player-one original-game-data)))
        ;; Check if enough blocks have passed
        (blocks-passed (- stacks-block-height (get last-move-block-height original-game-data)))
    )

    ;; Ensure that the game is not already finished
    (asserts! (not (get finished original-game-data)) (err ERR_GAME_ALREADY_FINISHED))
    ;; Ensure that the caller is the opponent of the current turn player
    (asserts! (is-eq opponent contract-caller) (err ERR_NOT_OPPONENT))
    ;; Ensure that the timeout period has been reached
    (asserts! (>= blocks-passed TIMEOUT_BLOCKS) (err ERR_TIMEOUT_NOT_REACHED))

    ;; Transfer all bets to the opponent (timeout claimer)
    (try! (as-contract (stx-transfer? (* u2 (get bet-amount original-game-data)) tx-sender opponent)))
    ;; Update winner and loser stats
    (update-winner-stats opponent (* u2 (get bet-amount original-game-data)))
    (update-loser-stats current-turn-player)

    ;; Update the games map with finished game and winner
    (map-set games game-id (merge original-game-data {
        winner: (some opponent),
        finished: true
    }))

    ;; Log the timeout claim
    (print { action: "claim-timeout", data: { game-id: game-id, winner: opponent }})
    ;; Return the Game ID
    (ok game-id)
))

;; Makes a move in an ongoing game by placing the player's mark (X or O) at the specified position.
;; Handles win, loss, or draw conditions, updates player statistics, and distributes payouts.
;; Returns the game ID on success.
(define-public (play (game-id uint) (move-index uint) (move uint))
    (let (
        ;; Load the game data for the game being joined, throw an error if Game ID is invalid
        (original-game-data (unwrap! (map-get? games game-id) (err ERR_GAME_NOT_FOUND)))
        ;; Get the original board from the game data
        (original-board (get board original-game-data))

        ;; Is it player one's turn?
        (is-player-one-turn (get is-player-one-turn original-game-data))
        ;; Get the player whose turn it currently is based on the is-player-one-turn flag
        (player-turn (if is-player-one-turn (get player-one original-game-data) (unwrap! (get player-two original-game-data) (err ERR_GAME_NOT_FOUND))))
        ;; Get the expected move based on whose turn it is (X or O?)
        (expected-move (if is-player-one-turn u1 u2))

        ;; Update the game board by placing the player's move at the specified index
        (game-board (unwrap! (replace-at? original-board move-index move) (err ERR_INVALID_MOVE)))
        ;; Check if the game has been won now with this modified board
        (is-now-winner (has-won game-board))
        ;; Check if the board is now full (for draw detection)
        (is-now-full (is-board-full game-board))
        ;; Determine if the game is finished (won or drawn)
        (is-finished (or is-now-winner is-now-full))
        ;; Merge the game data with the updated board and marking the next turn to be player two's turn
        ;; Also mark the winner if the game has been won, and finished status
        (game-data (merge original-game-data {
            board: game-board,
            is-player-one-turn: (not is-player-one-turn),
            winner: (if is-now-winner (some player-turn) none),
            finished: is-finished,
            last-move-block-height: stacks-block-height,
            moves: (append (get moves original-game-data) {move-index: move-index, move: move})
        }))
    )

    ;; Ensure that the function is being called by the player whose turn it is
    (asserts! (is-eq player-turn contract-caller) (err ERR_NOT_YOUR_TURN))
    ;; Ensure that the move being played is the correct move based on the current turn (X or O)
    (asserts! (is-eq move expected-move) (err ERR_INVALID_MOVE))
    ;; Ensure that the move meets validity requirements
    (asserts! (validate-move original-board move-index move) (err ERR_INVALID_MOVE))

    ;; Handle payouts and stats based on game outcome
    (if is-now-winner
        ;; Game won: transfer all bets to winner, update winner and loser stats
        (begin
            (try! (as-contract (stx-transfer? (* u2 (get bet-amount game-data)) tx-sender player-turn)))
            (update-winner-stats player-turn (* u2 (get bet-amount game-data)))
            (let ((loser (if is-player-one-turn (unwrap! (get player-two original-game-data) (err ERR_GAME_NOT_FOUND)) (get player-one original-game-data))))
                (update-loser-stats loser))
        )
        (if is-now-full
            ;; Game drawn: return bets to both players, update draw stats
            (begin
                (try! (as-contract (stx-transfer? (get bet-amount game-data) tx-sender (get player-one original-game-data))))
                (try! (as-contract (stx-transfer? (get bet-amount game-data) tx-sender (unwrap! (get player-two original-game-data) (err ERR_GAME_NOT_FOUND)))))
                (update-draw-stats (get player-one original-game-data) (unwrap! (get player-two original-game-data) (err ERR_GAME_NOT_FOUND)))
            )
            false
        )
    )

    ;; Update the games map with the new game data
    (map-set games game-id game-data)

    ;; Log the action of a move being made
    (print {action: "play", data: game-data})
    ;; Return the Game ID of the game
    (ok game-id)
))

;; Retrieves the details of a specific game by its ID.
(define-read-only (get-game (game-id uint))
    (map-get? games game-id)
)

;; Retrieves the ID of the most recently created game.
(define-read-only (get-latest-game-id)
    (var-get latest-game-id)
)

;; Retrieves the statistics for a specific player.
(define-read-only (get-player-stats (player principal))
    (map-get? player-stats player)
)

;; Retrieves statistics for all players, used for leaderboard functionality.
(define-read-only (get-all-player-stats)
    (map-values player-stats)
)

(define-private (validate-move (board (list 9 uint)) (move-index uint) (move uint))
    (let (
        ;; Validate that the move is being played within range of the board
        (index-in-range (and (>= move-index u0) (< move-index u9)))

        ;; Validate that the move is either an X or an O
        (x-or-o (or (is-eq move u1) (is-eq move u2)))

        ;; Validate that the cell the move is being played on is currently empty
        (empty-spot (is-eq (unwrap! (element-at? board move-index) false) u0))
    )

    ;; All three conditions must be true for the move to be valid
    (and (is-eq index-in-range true) (is-eq x-or-o true) empty-spot)
))

;; Given a board, return true if any possible three-in-a-row line has been completed
(define-private (has-won (board (list 9 uint)))
    (or
        (is-line board u0 u1 u2) ;; Row 1
        (is-line board u3 u4 u5) ;; Row 2
        (is-line board u6 u7 u8) ;; Row 3
        (is-line board u0 u3 u6) ;; Column 1
        (is-line board u1 u4 u7) ;; Column 2
        (is-line board u2 u5 u8) ;; Column 3
        (is-line board u0 u4 u8) ;; Left to Right Diagonal
        (is-line board u2 u4 u6) ;; Right to Left Diagonal
    )
)

;; Given a board, return true if all cells are filled (no empty spots)
(define-private (is-board-full (board (list 9 uint)))
    (is-eq (len (filter is-empty board)) u0)
)

;; Helper function to check if a cell is empty
(define-private (is-empty (cell uint))
    (is-eq cell u0)
)

;; Given a board and three cells to look at on the board
;; Return true if all three are not empty and are the same value (all X or all O)
;; Return false if any of the three is empty or a different value
(define-private (is-line (board (list 9 uint)) (a uint) (b uint) (c uint))
    (let (
        ;; Value of cell at index a
        (a-val (unwrap! (element-at? board a) false))
        ;; Value of cell at index b
        (b-val (unwrap! (element-at? board b) false))
        ;; Value of cell at index c
        (c-val (unwrap! (element-at? board c) false))
    )

    ;; a-val must equal b-val and must also equal c-val while not being empty (non-zero)
    (and (is-eq a-val b-val) (is-eq a-val c-val) (not (is-eq a-val u0)))
))

;; Initialize player stats if they don't exist
(define-private (init-player-stats (player principal))
    (let (
        (current-stats (map-get? player-stats player))
    )
    (if (is-none current-stats)
        (map-set player-stats player {
            wins: u0,
            losses: u0,
            stx-won: u0,
            games-played: u0
        })
        current-stats
    )
))

;; Update player stats when a game is won
(define-private (update-winner-stats (winner principal) (stx-amount uint))
    (let (
        (current-stats (init-player-stats winner))
        (stats-data (unwrap! current-stats (err ERR_GAME_NOT_FOUND)))
    )
    (map-set player-stats winner {
        wins: (+ (get wins stats-data) u1),
        losses: (get losses stats-data),
        stx-won: (+ (get stx-won stats-data) stx-amount),
        games-played: (+ (get games-played stats-data) u1)
    })
))

;; Update player stats when a game is lost
(define-private (update-loser-stats (loser principal))
    (let (
        (current-stats (init-player-stats loser))
        (stats-data (unwrap! current-stats (err ERR_GAME_NOT_FOUND)))
    )
    (map-set player-stats loser {
        wins: (get wins stats-data),
        losses: (+ (get losses stats-data) u1),
        stx-won: (get stx-won stats-data),
        games-played: (+ (get games-played stats-data) u1)
    })
))

;; Update player stats for a draw (increment games-played for both players)
(define-private (update-draw-stats (player1 principal) (player2 principal))
    (begin
        (update-draw-player-stats player1)
        (update-draw-player-stats player2)
    )
)

;; Update player stats for a single player in a draw
(define-private (update-draw-player-stats (player principal))
    (let (
        (current-stats (init-player-stats player))
        (stats-data (unwrap! current-stats (err ERR_GAME_NOT_FOUND)))
    )
    (map-set player-stats player {
        wins: (get wins stats-data),
        losses: (get losses stats-data),
        stx-won: (get stx-won stats-data),
        games-played: (+ (get games-played stats-data) u1)
    })
))
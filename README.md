# Stacks XOX Game

A decentralized XOX (Tic-Tac-Toe) game built on the Stacks blockchain using Clarity smart contracts. Play classic tic-tac-toe on-chain with real STX betting and blockchain-secured game logic.

## 🎮 About

This project demonstrates blockchain gaming on Stacks by implementing a fully decentralized tic-tac-toe game where players can:
- Create games with STX betting
- Join existing games as the second player
- Play turns on-chain with immutable game logic
- Win STX prizes through skillful gameplay

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Stacks wallet (for mainnet/testnet interaction)

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Ryjen1/stacks-xox-game.git
cd stacks-xox-game

# Install dependencies for the root project
npm install

# Install frontend dependencies
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

### Running Tests

```bash
# Run the test suite
npm test

# Run tests with coverage report
npm run test:report
```

## 🏗️ Project Structure

```
stacks-xox-game/
├── contracts/           # Clarity smart contracts
│   └── xox-game.clar   # Main game contract
├── frontend/           # Next.js web application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility libraries
├── tests/             # Contract test suite
│   └── xox-game.test.ts
├── deployments/       # Network deployment configs
└── settings/         # Clarinet settings
```

## ✨ Features

- **On-Chain Game Logic**: All game rules enforced by Clarity smart contracts
- **STX Betting**: Players can wager STX on games
- **Multiplayer**: Create and join games with other players
- **Real-time Updates**: Live game state synchronization
- **Stacks Connect Integration**: Seamless wallet connection
- **Sound Effects**: Audio feedback for moves, victories, defeats, and draws
- **Testnet Ready**: Deploy and test on Stacks testnet

## 🎯 Game Rules

1. **Creating a Game**: Players create games by specifying a bet amount and making the first move (X)
2. **Joining Games**: Another player can join by matching the bet amount and playing O
3. **Turn-based Play**: Players alternate turns placing X and O
4. **Winning**: First player to get 3 in a row (horizontal, vertical, or diagonal) wins
5. **Prize**: Winner receives the total bet amount (both players' stakes)

## 🔧 Smart Contract Functions

- `create-game`: Create a new game with bet amount and first move
- `join-game`: Join an existing game as the second player
- `play`: Make a move in an active game
- `get-game`: Read-only function to get game state
- `get-latest-game-id`: Get the ID of the most recently created game

## 🧪 Testing

The project includes comprehensive tests covering:
- Game creation and joining logic
- Move validation and turn management
- Win condition detection
- Error handling for invalid moves
- Betting and prize distribution

## 🌐 Networks

- **Simnet**: Local development network
- **Testnet**: Stacks testnet for testing
- **Mainnet**: Stacks mainnet (when ready)

## 📝 License

This project is open source and available under the [ISC License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Learn More

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language](https://docs.stacks.co/clarity)
- [Stacks Connect](https://docs.stacks.co/build/tools/stacks-connect)
- [Learn Web3 for Stacks](https://www.hiro.so/learn)

---

Built with ❤️ for the Stacks ecosystem
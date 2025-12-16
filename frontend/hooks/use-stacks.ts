import { createNewGame, createRematchGame, acceptRematchGame, joinGame, Move, play, Game } from "@/lib/contract";
import { getStxBalance } from "@/lib/stx-utils";
import {
  AppConfig,
  openContractCall,
  showConnect,
  type UserData,
  UserSession,
} from "@stacks/connect";
import { PostConditionMode } from "@stacks/transactions";
import { useEffect, useState, useCallback } from "react";

const appDetails = {
  name: "Tic Tac Toe",
  icon: "https://cryptologos.cc/logos/stacks-stx-logo.png",
};

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

export type TransactionType =
  | "createGame"
  | "joinGame"
  | "playGame"
  | "rematchGame"
  | "acceptRematch";

interface TransactionState {
  type: TransactionType | null;
  isPending: boolean;
  error: string | null;
  txId: string | null;
}

interface NotificationState {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
}

export function useStacks() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stxBalance, setStxBalance] = useState(0);
  const [transactionState, setTransactionState] = useState<TransactionState>({
    type: null,
    isPending: false,
    error: null,
    txId: null,
  });
  const [notification, setNotification] = useState<NotificationState>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showNotification = useCallback((message: string, type: "success" | "error" | "info") => {
    setNotification({ message, type, isVisible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const startTransaction = useCallback((type: TransactionType) => {
    setTransactionState({
      type,
      isPending: true,
      error: null,
      txId: null,
    });
  }, []);

  const completeTransaction = useCallback((type: TransactionType, txId?: string) => {
    setTransactionState(prev => ({
      ...prev,
      isPending: false,
      txId: txId || null,
    }));

    const messages = {
      createGame: "Game created successfully!",
      joinGame: "Joined game successfully!",
      playGame: "Move submitted successfully!",
      rematchGame: "Rematch requested successfully!",
      acceptRematch: "Rematch accepted successfully!",
    };

    showNotification(messages[type], "success");
  }, [showNotification]);

  const failTransaction = useCallback((type: TransactionType, error: string) => {
    setTransactionState(prev => ({
      ...prev,
      isPending: false,
      error,
    }));

    showNotification(error, "error");
  }, [showNotification]);

  function connectWallet() {
    showConnect({
      appDetails,
      onFinish: () => {
        window.location.reload();
      },
      userSession,
    });
  }

  function disconnectWallet() {
    userSession.signUserOut();
    setUserData(null);
  }

  async function handleCreateGame(
    betAmount: number,
    moveIndex: number,
    move: Move
  ) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      showNotification("Invalid move. Please make a valid move.", "error");
      return;
    }
    if (betAmount === 0) {
      showNotification("Please make a bet", "error");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      
      startTransaction("createGame");
      const txOptions = await createNewGame(betAmount, moveIndex, move);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          completeTransaction("createGame", data.txId);
        },
        onCancel: () => {
          failTransaction("createGame", "Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      failTransaction("createGame", err.message);
    }
  }

  async function handleJoinGame(gameId: number, moveIndex: number, move: Move) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      showNotification("Invalid move. Please make a valid move.", "error");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      
      startTransaction("joinGame");
      const txOptions = await joinGame(gameId, moveIndex, move);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          completeTransaction("joinGame", data.txId);
        },
        onCancel: () => {
          failTransaction("joinGame", "Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      failTransaction("joinGame", err.message);
    }
  }

  async function handlePlayGame(gameId: number, moveIndex: number, move: Move) {
    if (typeof window === "undefined") return;
    if (moveIndex < 0 || moveIndex > 8) {
      showNotification("Invalid move. Please make a valid move.", "error");
      return;
    }

    try {
      if (!userData) throw new Error("User not connected");
      
      startTransaction("playGame");
      const txOptions = await play(gameId, moveIndex, move);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          completeTransaction("playGame", data.txId);
        },
        onCancel: () => {
          failTransaction("playGame", "Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      failTransaction("playGame", err.message);
    }
  }

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData);
      });
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  useEffect(() => {
    if (userData) {
      const address = userData.profile.stxAddress.testnet;
      getStxBalance(address).then((balance) => {
        setStxBalance(balance);
      });
    }
  }, [userData]);

  async function handleRematchGame(
    originalGame: Game,
    moveIndex: number,
    move: Move
  ) {
    if (typeof window === "undefined") return;

    try {
      if (!userData) throw new Error("User not connected");
      
      startTransaction("rematchGame");
      const txOptions = await createRematchGame(originalGame, moveIndex, move);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          completeTransaction("rematchGame", data.txId);
        },
        onCancel: () => {
          failTransaction("rematchGame", "Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      failTransaction("rematchGame", err.message);
    }
  }

  async function handleAcceptRematch(
    gameId: number,
    moveIndex: number,
    move: Move
  ) {
    if (typeof window === "undefined") return;

    try {
      if (!userData) throw new Error("User not connected");
      
      startTransaction("acceptRematch");
      const txOptions = await acceptRematchGame(gameId, moveIndex, move);
      await openContractCall({
        ...txOptions,
        appDetails,
        onFinish: (data) => {
          console.log(data);
          completeTransaction("acceptRematch", data.txId);
        },
        onCancel: () => {
          failTransaction("acceptRematch", "Transaction cancelled");
        },
        postConditionMode: PostConditionMode.Allow,
      });
    } catch (_err) {
      const err = _err as Error;
      console.error(err);
      failTransaction("acceptRematch", err.message);
    }
  }

  return {
    userData,
    stxBalance,
    connectWallet,
    disconnectWallet,
    handleCreateGame,
    handleJoinGame,
    handlePlayGame,
    handleRematchGame,
    handleAcceptRematch,
    transactionState,
    notification,
    hideNotification,
  };
}

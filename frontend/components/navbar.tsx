"use client";

import React, { useState } from "react";
import { useStacks } from "@/hooks/use-stacks";
import { abbreviateAddress } from "@/lib/stx-utils";
import Link from "next/link";

export function Navbar() {
  const { userData, connectWallet, disconnectWallet } = useStacks();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="flex w-full items-center justify-between gap-4 p-4 h-16 border-b border-gray-500">
      <Link href="/" className="text-xl sm:text-2xl font-bold">
        TicTacToe 🎲
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-gray-300 hover:text-gray-50 text-sm sm:text-base">
          Home
        </Link>
        <Link href="/create" className="text-gray-300 hover:text-gray-50 text-sm sm:text-base">
          Create Game
        </Link>
        <Link href="/history" className="text-gray-300 hover:text-gray-50 text-sm sm:text-base">
          History
        </Link>
        <Link href="/profile" className="text-gray-300 hover:text-gray-50 text-sm sm:text-base">
          Profile
        </Link>
        <Link href="/leaderboard" className="text-gray-300 hover:text-gray-50 text-sm sm:text-base">
          Leaderboard
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Wallet Buttons */}
      <div className="flex items-center gap-2">
        {userData ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-blue-500 px-3 py-2 min-h-10 text-xs sm:text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {abbreviateAddress(userData.profile.stxAddress.testnet)}
            </button>
            <button
              type="button"
              onClick={disconnectWallet}
              className="rounded-lg bg-red-500 px-3 py-2 min-h-10 text-xs sm:text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            className="rounded-lg bg-blue-500 px-3 py-2 min-h-10 text-xs sm:text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gray-800 border-b border-gray-500 md:hidden z-50">
          <div className="flex flex-col gap-4 p-4">
            <Link href="/" className="text-gray-300 hover:text-gray-50" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/create" className="text-gray-300 hover:text-gray-50" onClick={() => setIsMenuOpen(false)}>
              Create Game
            </Link>
            <Link href="/history" className="text-gray-300 hover:text-gray-50" onClick={() => setIsMenuOpen(false)}>
              History
            </Link>
            <Link href="/profile" className="text-gray-300 hover:text-gray-50" onClick={() => setIsMenuOpen(false)}>
              Profile
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-gray-50" onClick={() => setIsMenuOpen(false)}>
              Leaderboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

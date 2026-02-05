"use client";

import { FaStar } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";

interface GameOverProps {
  playerName: string;
  flippedCard: number;
  collectionName: string;
  onRestart: () => void;
  onBackToCollections: () => void;
}

export function GameOver({
  playerName,
  flippedCard,
  collectionName,
  onRestart,
  onBackToCollections,
}: GameOverProps) {
  return (
    <div className="animate-scale-in w-full max-w-md px-4 sm:px-0">
      <div className="bg-card/95 space-y-8 rounded-2xl border border-white/20 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <FaStar
              className="text-accent h-14 w-14 animate-pulse"
              aria-hidden
            />
          </div>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Game Over!
          </h2>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Collection: {collectionName}
            </p>
            <p className="text-foreground text-base">
              {playerName}, you flipped
            </p>
            <div
              className="from-primary to-accent animate-number-pop bg-linear-to-br bg-clip-text text-7xl font-bold text-transparent opacity-0 sm:text-8xl"
              style={{ animationDelay: "0.2s" }}
            >
              {flippedCard}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onRestart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-full rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onBackToCollections}
            className="text-foreground flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-lg font-semibold transition-all duration-200 hover:bg-white/20"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Collections
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FlipCard } from "@/components/flip-card";
import { getCardBackImage } from "@/lib/theme";

interface CardGameProps {
  playerName: string;
  collectionCards: number[];
  onCardFlip: (cardNumber: number) => void;
  theme: string;
}

export function CardGame({
  playerName,
  collectionCards,
  onCardFlip,
  theme,
}: CardGameProps) {
  const [hasFlipped, setHasFlipped] = useState(false);
  const shuffledCards = useMemo(() => {
    const arr = [...collectionCards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [collectionCards]);

  return (
    <div className="w-full max-w-4xl space-y-8">
      {/* Preload card back image for the current theme so flips feel instant */}
      <div className="pointer-events-none fixed -top-[9999px] -left-[9999px] h-0 w-0 opacity-0">
        <Image
          src={getCardBackImage(theme)}
          alt=""
          width={400}
          height={533}
          priority
        />
      </div>
      <header
        className="animate-fade-in-up space-y-2 text-center opacity-0"
        style={{ animationDelay: "0.05s" }}
      >
        <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
          Welcome, {playerName}!
        </h2>
        <p className="text-base text-white/90 sm:text-lg">
          Choose a card to flip. The game ends when you flip one.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
        {shuffledCards.map((cardValue, index) => (
          <div
            key={`${cardValue}-${index}`}
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${0.1 + index * 0.06}s` }}
          >
            <FlipCard
              number={index + 1}
              value={cardValue}
              disabled={hasFlipped}
              onFlipStart={() => {
                if (!hasFlipped) setHasFlipped(true);
              }}
              onFlip={() => {
                onCardFlip(cardValue);
              }}
              theme={theme}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

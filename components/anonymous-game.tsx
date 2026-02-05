"use client";

import { useState, useRef, useEffect } from "react";
import { CardGame } from "@/components/card-game";
import { GameOver } from "@/components/game-over";
import { FiArrowLeft } from "react-icons/fi";

interface AnonymousGameProps {
  collection: {
    _id: string;
    name: string;
    cards: number[];
  };
  onBack: () => void;
  theme?: string;
}

export function AnonymousGame({
  collection,
  onBack,
  theme = "ocean",
}: AnonymousGameProps) {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const clientIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Ensure we have a browser-scoped client ID, even if the play page didn't initialize it
    if (typeof window === "undefined") return;

    const existingClientId = localStorage.getItem("cardGameClientId");
    if (existingClientId) {
      clientIdRef.current = existingClientId;
      return;
    }

    const newClientId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("cardGameClientId", newClientId);
    clientIdRef.current = newClientId;
  }, []);

  const handleCardFlip = async (cardNumber: number) => {
    setFlippedCard(cardNumber);

    // Now that the user has actually played, record this play for their IP
    try {
      await fetch("/api/collections/play-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: collection._id,
          recordPlay: true,
          flippedCard: cardNumber,
          clientId: clientIdRef.current,
        }),
      });
    } catch (error) {
      console.error("Failed to record anonymous play", error);
    }
  };

  if (flippedCard !== null) {
    return (
      <GameOver
        playerName="Guest"
        flippedCard={flippedCard}
        onRestart={() => {
          setFlippedCard(null);
        }}
        onBackToCollections={onBack}
      />
    );
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-center justify-center space-y-4 px-4 sm:px-0">
      {/* <button
        type="button"
        onClick={onBack}
        className="text-foreground flex items-center gap-2 self-start px-4 py-2 transition-colors hover:text-white/90"
      >
        <FiArrowLeft className="h-5 w-5" />
        Back
      </button> */}

      <CardGame
        playerName="Guest"
        collectionCards={collection.cards}
        onCardFlip={handleCardFlip}
        theme={theme}
      />
    </div>
  );
}

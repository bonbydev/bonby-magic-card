"use client";

import { useState } from "react";
import { createCollection } from "@/lib/auth";
import { toast } from "react-toastify";
import { FiArrowLeft, FiPlus } from "react-icons/fi";

interface CollectionBuilderProps {
  username: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function CollectionBuilder({
  username,
  onBack,
  onSuccess,
}: CollectionBuilderProps) {
  const [collectionName, setCollectionName] = useState("");
  const [cards, setCards] = useState<number[]>([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(false);

  const formatNumberWithDots = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleCardChange = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    const newCards = [...cards];
    newCards[index] = num;
    setCards(newCards);
  };

  const hasDuplicateCards = (values: number[]) => {
    const seen = new Set<number>();

    for (const value of values) {
      // Treat 0 as "empty" and ignore it in duplicate checks
      if (value === 0) continue;

      if (seen.has(value)) {
        return true;
      }

      seen.add(value);
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collectionName.trim()) {
      toast.error("Collection name cannot be empty");
      return;
    }

    if (hasDuplicateCards(cards)) {
      toast.error("Card values must be unique");
      return;
    }

    setLoading(true);

    try {
      const result = await createCollection(collectionName, cards);
      if (result.success) {
        toast.success("Collection created successfully!");
        onSuccess();
      } else {
        toast.error(result.error || "Failed to create collection");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-lg px-4 sm:px-0">
      <button
        type="button"
        onClick={onBack}
        className="text-foreground mb-6 flex items-center gap-2 transition-colors hover:text-white/90"
      >
        <FiArrowLeft className="h-5 w-5" />
        Back
      </button>

      <div className="bg-card/95 rounded-2xl border border-white/20 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <h1 className="text-foreground mb-2 text-3xl font-bold">
          Create Collection
        </h1>
        <p className="text-muted-foreground mb-6">
          Enter a name and 5 card values
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="text-foreground mb-2 block text-sm font-medium"
            >
              Collection Name
            </label>
            <input
              id="name"
              type="text"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="My Awesome Collection"
              className="bg-background/80 border-border text-foreground placeholder-muted-foreground focus:ring-primary w-full rounded-xl border px-4 py-2.5 transition-all duration-200 focus:ring-2 focus:outline-none"
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-foreground mb-4 block text-sm font-medium">
              Card Values
            </label>
            <div className="space-y-3">
              {cards.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <p className="text-muted-foreground mb-1 flex-1 text-sm">
                    Card {index + 1}
                  </p>
                  <div className="flex flex-4 items-center gap-2">
                    <input
                      type="text"
                      value={formatNumberWithDots(value)}
                      inputMode="numeric"
                      pattern="[0-9.]*"
                      onChange={(e) =>
                        handleCardChange(
                          index,
                          e.target.value.replace(/[^0-9]/g, ""),
                        )
                      }
                      placeholder={`${index + 1}`}
                      className="bg-background/80 border-border text-foreground placeholder-muted-foreground focus:ring-primary w-full flex-1 rounded-xl border px-4 py-3 text-left transition-all duration-200 focus:ring-2 focus:outline-none"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleCardChange(index, String((value || 0) * 1000))
                      }
                      className="bg-primary/80 text-primary-foreground hover:bg-primary rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      x1000
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {hasDuplicateCards(cards) && (
              <p className="mt-2 text-sm text-red-500">
                Card values must be unique.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || hasDuplicateCards(cards)}
            className={`bg-primary text-primary-foreground mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all duration-200 ${
              hasDuplicateCards(cards)
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-primary/90"
            } disabled:bg-primary/50`}
          >
            <FiPlus className="h-5 w-5" />
            {loading ? "Creating..." : "Create Collection"}
          </button>
        </form>
      </div>
    </div>
  );
}

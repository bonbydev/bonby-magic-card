"use client";

import { useRef, useState } from "react";

import { formatCardValue } from "@/utils";
import { getCardBackImage } from "@/lib/theme";

interface FlipCardProps {
  number: number;
  value: number;
  onFlip: () => void;
  theme: string;
  disabled?: boolean;
  onFlipStart?: () => void;
}

export function FlipCard({
  number,
  value,
  onFlip,
  theme,
  disabled = false,
  onFlipStart,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const hasFlippedRef = useRef(false);

  const handleClick = () => {
    if (disabled) return;
    // Prevent multiple rapid clicks from triggering multiple flips
    if (hasFlippedRef.current) return;
    hasFlippedRef.current = true;

    // Notify parent immediately so it can lock the board
    onFlipStart?.();

    setIsFlipped(true);
    setTimeout(onFlip, 550);
  };

  return (
    <div className="perspective-1000 mx-auto w-full max-w-[150px] sm:max-w-[160px] md:max-w-[240px]">
      <div
        className={`transform-style-3d relative aspect-3/4 w-full ${
          disabled ? "cursor-default" : "cursor-pointer"
        } transition-transform duration-500 ease-in-out ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={disabled ? undefined : handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={
          disabled
            ? undefined
            : (e) => (e.key === "Enter" || e.key === " ") && handleClick()
        }
        aria-pressed={isFlipped}
      >
        {/* Card back (visible by default) */}
        <div className="bg-card absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border-2 border-white/20 shadow-xl transition-transform duration-200 backface-hidden hover:scale-[1.03] active:scale-[0.98]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getCardBackImage(theme)})` }}
          />
          <span className="relative text-4xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-5xl">
            ?
          </span>
        </div>

        {/* Card face (visible when flipped) */}
        <div className="bg-card/95 absolute inset-0 flex rotate-y-180 items-center justify-center rounded-xl border-2 border-white/20 shadow-xl backdrop-blur-sm backface-hidden">
          <div className="px-2 text-center">
            <p className="from-primary to-accent bg-linear-to-br bg-clip-text text-2xl font-bold text-transparent">
              {formatCardValue(value)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

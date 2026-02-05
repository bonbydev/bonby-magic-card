"use client";

import { FiUser, FiLogIn } from "react-icons/fi";

interface HomeScreenProps {
  onNewUser: () => void;
  onLogin: () => void;
}

export function HomeScreen({ onNewUser, onLogin }: HomeScreenProps) {
  return (
    <div className="w-full max-w-lg px-4 text-center sm:px-0">
      <h1
        className="text-foreground animate-fade-in-up mb-4 text-4xl font-bold opacity-0 md:text-6xl"
        style={{ animationDelay: "0.05s" }}
      >
        Card Flip
      </h1>
      <p
        className="animate-fade-in-up mb-10 text-base text-white/90 opacity-0 md:mb-12 md:text-xl"
        style={{ animationDelay: "0.15s" }}
      >
        Flip a card and discover your fate
      </p>

      <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-5">
        <button
          type="button"
          onClick={onNewUser}
          className="bg-primary hover:bg-primary/90 text-primary-foreground animate-fade-in-up flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold opacity-0 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
          style={{ animationDelay: "0.25s" }}
        >
          <FiUser className="h-6 w-6" />
          New User
        </button>
        <button
          type="button"
          onClick={onLogin}
          className="text-foreground animate-fade-in-up flex items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/15 px-8 py-4 text-lg font-semibold opacity-0 transition-all duration-200 hover:bg-white/25"
          style={{ animationDelay: "0.35s" }}
        >
          <FiLogIn className="h-6 w-6" />
          Login
        </button>
      </div>

      <p
        className="animate-fade-in mx-auto mt-14 max-w-sm text-sm text-white/80 opacity-0"
        style={{ animationDelay: "0.5s" }}
      >
        Create your account and build card collections. Each collection has 5
        numbered cards.
      </p>
    </div>
  );
}

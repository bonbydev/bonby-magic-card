"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { CardGame } from "@/components/card-game";
import { GameOver } from "@/components/game-over";
import { Register } from "@/components/register";
import { Login } from "@/components/login";
import { HomeScreen } from "@/components/home-screen";
import { CollectionBuilder } from "@/components/collection-builder";
import { CollectionList } from "@/components/collection-list";
import { ThemeSelector } from "@/components/theme-selector";
import { getCurrentUser, logoutUser, CardCollection } from "@/lib/auth";
import { getThemeBackgroundImage, THEME_IDS } from "@/lib/theme";
import { FiSettings } from "react-icons/fi";

type AppScreen =
  | "home"
  | "register"
  | "login"
  | "collections"
  | "builder"
  | "game"
  | "gameover";

export default function HomePage() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentCollection, setCurrentCollection] =
    useState<CardCollection | null>(null);
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>("ocean");
  const [authLoading, setAuthLoading] = useState(true);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Initialize user and theme
  useEffect(() => {
    const initUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setScreen("collections");
      } else {
        setScreen("home");
      }

      setAuthLoading(false);
    };

    initUser();

    const savedTheme = localStorage.getItem("cardGameTheme");
    if (
      savedTheme &&
      THEME_IDS.includes(savedTheme as (typeof THEME_IDS)[number])
    ) {
      setCurrentTheme(savedTheme);
    } else {
      const randomTheme =
        THEME_IDS[Math.floor(Math.random() * THEME_IDS.length)];
      setCurrentTheme(randomTheme);
      localStorage.setItem("cardGameTheme", randomTheme);
    }
  }, []);

  // Apply theme to body
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  // Handle click outside settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettings]);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("cardGameTheme", theme);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setScreen("home");
    setFlippedCard(null);
    setCurrentCollection(null);
  };

  const handlePlayCollection = (collection: CardCollection) => {
    setCurrentCollection(collection);
    setFlippedCard(null);
    setScreen("game");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
      {/* Background image (optimized with next/image) */}
      <div className="fixed inset-0 -z-20">
        <Image
          key={currentTheme}
          src={getThemeBackgroundImage(currentTheme)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover transition-opacity duration-700 ease-out"
        />
      </div>
      {/* Overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-black/55 transition-opacity duration-500" />

      {authLoading ? (
        <div className="z-10 flex flex-col items-center justify-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          <p className="text-lg font-medium text-white/90">
            Checking your session...
          </p>
        </div>
      ) : (
        <>
          {/* Settings */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="text-foreground focus:ring-primary/50 absolute top-14 right-4 z-20 rounded-full bg-white/10 p-2.5 transition-all duration-200 hover:scale-105 hover:bg-white/20 focus:ring-2 focus:outline-none lg:top-4"
            aria-label="Settings"
          >
            <FiSettings className="h-5 w-5" />
          </button>

          {showSettings && (
            <div
              ref={settingsRef}
              className="animate-scale-in absolute top-16 right-4 z-20 origin-top-right"
            >
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
              />
            </div>
          )}

          {/* Screen Routes */}
          {screen === "home" && (
            <HomeScreen
              onNewUser={() => setScreen("register")}
              onLogin={() => setScreen("login")}
            />
          )}

          {screen === "register" && (
            <Register
              onBack={() => setScreen("home")}
              onSuccess={(username) => {
                setCurrentUser(username);
                setScreen("collections");
              }}
            />
          )}

          {screen === "login" && (
            <Login
              onBack={() => setScreen("home")}
              onSuccess={(username) => {
                setCurrentUser(username);
                setScreen("collections");
              }}
            />
          )}

          {screen === "collections" && currentUser && (
            <CollectionList
              username={currentUser}
              onLogout={handleLogout}
              onCreateNew={() => setScreen("builder")}
              onPlayCollection={handlePlayCollection}
            />
          )}

          {screen === "builder" && currentUser && (
            <CollectionBuilder
              username={currentUser}
              onBack={() => setScreen("collections")}
              onSuccess={() => setScreen("collections")}
            />
          )}

          {screen === "game" &&
            currentUser &&
            currentCollection &&
            flippedCard === null && (
              <CardGame
                playerName={currentUser}
                collectionCards={currentCollection.cards}
                onCardFlip={async (cardNumber) => {
                  // Record this logged-in play for statistics
                  try {
                    await fetch("/api/collections/logged-play", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        collectionId: currentCollection._id,
                        flippedCard: cardNumber,
                      }),
                    });
                  } catch (err) {
                    console.error("Failed to record logged-in play", err);
                  }

                  setFlippedCard(cardNumber);
                  setScreen("gameover");
                }}
                theme={currentTheme}
              />
            )}

          {screen === "gameover" &&
            currentUser &&
            flippedCard !== null &&
            currentCollection && (
              <GameOver
                playerName={currentUser}
                flippedCard={flippedCard}
                onRestart={() => {
                  setFlippedCard(null);
                  setScreen("game");
                }}
                onBackToCollections={() => {
                  setFlippedCard(null);
                  setCurrentCollection(null);
                  setScreen("collections");
                }}
              />
            )}
        </>
      )}
    </div>
  );
}

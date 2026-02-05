"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnonymousGame } from "@/components/anonymous-game";
import { getThemeBackgroundImage, THEME_IDS } from "@/lib/theme";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";

interface PlayPageProps {
  params: Promise<{ id: string }>;
}

interface Collection {
  _id: string;
  name: string;
  cards: number[];
}

export default function PlayPage({ params }: PlayPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<string>("ocean");
  const hasCheckedPlay = useRef(false);
  const clientIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Load saved theme or select random theme
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

    // Apply theme to document
    document.documentElement.className = `theme-${currentTheme}`;

    // Initialize anonymous client ID for this browser (used instead of IP)
    const existingClientId = localStorage.getItem("cardGameClientId");
    if (existingClientId) {
      clientIdRef.current = existingClientId;
    } else {
      const newClientId =
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? (crypto as any).randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem("cardGameClientId", newClientId);
      clientIdRef.current = newClientId;
    }

    const unwrapParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    // Prevent duplicate checks (e.g. React StrictMode double-invoking effects in development)
    if (hasCheckedPlay.current) return;
    hasCheckedPlay.current = true;

    const checkAndLoadCollection = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/collections/play-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Only *check* if the user can play; do not record the play yet
          body: JSON.stringify({
            collectionId: id,
            recordPlay: false,
            clientId: clientIdRef.current,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Unable to load collection");
          toast.error(data.error || "Unable to load collection");
          return;
        }

        if (!data.canPlay) {
          setError(data.error);
          toast.error(data.error);
          return;
        }

        setCollection(data.collection);
      } catch (err) {
        console.error("Error loading collection:", err);
        setError("Failed to load collection");
        toast.error("Failed to load collection");
      } finally {
        setLoading(false);
      }
    };

    checkAndLoadCollection();
  }, [id]);

  const bgImage = getThemeBackgroundImage(currentTheme);
  const overlay =
    "fixed inset-0 bg-black/55 -z-10 transition-opacity duration-500";
  const bgLayer = (
    <div
      className="fixed inset-0 -z-20 bg-cover bg-center transition-[background-image] duration-700 ease-out"
      style={{ backgroundImage: `url(${bgImage})` }}
    />
  );

  if (loading) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        {bgLayer}
        <div className={overlay} />
        <p className="text-foreground">Loading collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        {bgLayer}
        <div className={overlay} />
        <div className="bg-card/95 animate-scale-in max-w-md space-y-6 rounded-2xl border border-white/20 p-8 text-center shadow-2xl backdrop-blur-md">
          <h2 className="text-foreground text-2xl font-bold">
            Collection Not Available
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-medium transition-all duration-200"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        {bgLayer}
        <div className={overlay} />
        <p className="text-foreground">Collection not found</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {bgLayer}
      <div className={overlay} />
      <AnonymousGame
        collection={collection}
        onBack={() => router.push("/")}
        theme={currentTheme}
      />
    </div>
  );
}

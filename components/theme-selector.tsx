"use client";

import { THEME_IDS } from "@/lib/theme";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const THEME_OPTIONS = [
  { id: "galaxy" as const, name: "Galaxy", color: "bg-purple-500" },
  { id: "candy" as const, name: "Candy City", color: "bg-pink-500" },
  { id: "forest" as const, name: "The Forest", color: "bg-emerald-500" },
  { id: "ocean" as const, name: "Ocean Depths", color: "bg-blue-500" },
  { id: "sunset" as const, name: "Sunset Valley", color: "bg-amber-500" },
] satisfies { id: (typeof THEME_IDS)[number]; name: string; color: string }[];

export function ThemeSelector({
  currentTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  return (
    <div className="p-4 space-y-3 bg-card/95 backdrop-blur-md border border-white/20 rounded-xl min-w-[220px] shadow-2xl">
      <h3 className="font-semibold text-center text-foreground text-sm">
        Choose Theme
      </h3>
      <div className="space-y-1.5">
        {THEME_OPTIONS.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onThemeChange(theme.id)}
            className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentTheme === theme.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-white/5 border border-white/10 text-foreground hover:bg-white/15"
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full shrink-0 ${theme.color}`}
            />
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  );
}

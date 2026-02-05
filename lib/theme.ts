/** Theme id used in app state and body class (e.g. theme-ocean). */
export type ThemeId = "galaxy" | "candy" | "forest" | "ocean" | "sunset";

export const THEME_IDS: ThemeId[] = [
  "galaxy",
  "candy",
  "forest",
  "ocean",
  "sunset",
];

/** Background image filename (without path) for each theme. */
const THEME_BG_IMAGES: Record<ThemeId, string> = {
  galaxy: "bg-galaxy.webp",
  candy: "bg-candy.webp",
  forest: "bg-forest.webp",
  ocean: "bg-ocean.webp",
  sunset: "bg-sunset.webp",
};

export function getThemeBackgroundImage(themeId: string): string {
  const filename = THEME_BG_IMAGES[themeId as ThemeId] ?? "bg-ocean.webp";
  return `/images/${filename}`;
}

/** Card back image filename for each theme (e.g. card-galaxy.jpg). */
export function getCardBackImage(themeId: string): string {
  const id = THEME_IDS.includes(themeId as ThemeId) ? themeId : "ocean";
  return `/images/card-${id}.webp`;
}

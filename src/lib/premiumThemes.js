// Premium color themes. Each overrides key CSS variables (HSL channel triplets)
// on top of the base Budgie light/dark palette. Applied only when the user has
// an active Premium entitlement and Premium Mode is ON.

export const PREMIUM_THEMES = [
  {
    id: "ocean",
    name: "Ocean",
    swatch: "#3b82f6",
    vars: {
      "--primary": "217 91% 50%",
      "--accent": "199 89% 43%",
      "--ring": "217 91% 50%",
      "--chart-1": "217 91% 50%",
      "--chart-2": "199 89% 43%",
      "--chart-3": "142 60% 45%",
      "--chart-4": "280 65% 60%",
      "--chart-5": "30 10% 50%"
    }
  },
  {
    id: "grape",
    name: "Grape",
    swatch: "#8b5cf6",
    vars: {
      "--primary": "265 85% 60%",
      "--accent": "285 85% 60%",
      "--ring": "265 85% 60%",
      "--chart-1": "265 85% 60%",
      "--chart-2": "285 85% 60%",
      "--chart-3": "320 70% 55%",
      "--chart-4": "200 80% 55%",
      "--chart-5": "30 10% 50%"
    }
  },
  {
    id: "forest",
    name: "Forest",
    swatch: "#22c55e",
    vars: {
      "--primary": "142 65% 40%",
      "--accent": "160 70% 38%",
      "--ring": "142 65% 40%",
      "--chart-1": "142 65% 40%",
      "--chart-2": "160 70% 38%",
      "--chart-3": "90 55% 45%",
      "--chart-4": "200 70% 50%",
      "--chart-5": "30 10% 50%"
    }
  },
  {
    id: "sunset",
    name: "Sunset",
    swatch: "#f97316",
    vars: {
      "--primary": "24 90% 55%",
      "--accent": "12 85% 55%",
      "--ring": "24 90% 55%",
      "--chart-1": "24 90% 55%",
      "--chart-2": "12 85% 55%",
      "--chart-3": "340 75% 55%",
      "--chart-4": "45 90% 50%",
      "--chart-5": "30 10% 50%"
    }
  },
  {
    id: "rose",
    name: "Rose",
    swatch: "#ec4899",
    vars: {
      "--primary": "330 80% 55%",
      "--accent": "350 85% 58%",
      "--ring": "330 80% 55%",
      "--chart-1": "330 80% 55%",
      "--chart-2": "350 85% 58%",
      "--chart-3": "280 70% 60%",
      "--chart-4": "200 80% 55%",
      "--chart-5": "30 10% 50%"
    }
  },
  {
    id: "midnight",
    name: "Midnight",
    swatch: "#6366f1",
    vars: {
      "--primary": "230 70% 55%",
      "--accent": "250 75% 65%",
      "--ring": "230 70% 55%",
      "--chart-1": "230 70% 55%",
      "--chart-2": "250 75% 65%",
      "--chart-3": "190 80% 50%",
      "--chart-4": "280 70% 60%",
      "--chart-5": "30 10% 50%"
    }
  }
];

export function getThemeVars(themeId) {
  const theme = PREMIUM_THEMES.find((t) => t.id === themeId);
  return theme ? theme.vars : null;
}

export const PREMIUM_THEME_VARS = [
  "--primary",
  "--accent",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5"
];
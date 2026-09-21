/* @refresh reset */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { getThemeVars, PREMIUM_THEME_VARS } from "@/lib/premiumThemes";

const ThemeContext = createContext();

// Derive Pro status from a PremiumEntitlement row: active if permanent OR pro_until is in the future.
function derivePro(row) {
  if (!row) return { premium: false, totalPaid: 0, lifetime: false };
  const lifetime = !!row.is_permanent;
  const active = lifetime || (row.pro_until && new Date(row.pro_until) > new Date());
  return { premium: active, totalPaid: Number(row.total_paid || 0), lifetime };
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [colorTheme, setColorThemeState] = useState("default");
  const [isPremium, setIsPremium] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isProLifetime, setIsProLifetime] = useState(false);
  const [premiumModeEnabled, setPremiumModeEnabledState] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const premiumActive = isPremium && premiumModeEnabled;

  // Apply light/dark class + premium color-theme CSS variable overrides.
  const applyAll = useCallback((dark, colorThemeId, active) => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    // Clear any previously-applied premium theme overrides so the base palette shows through.
    PREMIUM_THEME_VARS.forEach((v) => root.style.removeProperty(v));
    // Apply the selected premium theme's overrides only when Premium is active.
    if (active && colorThemeId && colorThemeId !== "default") {
      const vars = getThemeVars(colorThemeId);
      if (vars) Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    }
    window.setTimeout(() => root.classList.remove("theme-transition"), 500);
  }, []);

  // Initial load: prefer backend user settings, fall back to localStorage, then system.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let dark = null;
      let cTheme = "default";
      let premium = false;
      let modeEnabled = true;
      try { dark = localStorage.getItem("budgie-theme") === "dark"; } catch (e) {}
      try {
        const me = await base44.auth.me();
        if (!cancelled) {
          if (me?.data?.theme) dark = me.data.theme === "dark";
          if (me?.data?.color_theme) cTheme = me.data.color_theme;
          if (me?.data?.premium_mode_enabled === false) modeEnabled = false;
        }
      } catch (e) {
        // not logged in — keep local/system preference
      }
      try {
        const ent = await base44.entities.PremiumEntitlement.filter({});
        if (!cancelled) {
          const pro = derivePro(ent && ent[0]);
          premium = pro.premium;
          setTotalPaid(pro.totalPaid);
          setIsProLifetime(pro.lifetime);
        }
      } catch (e) {
        // not logged in or no entitlement yet
      }
      if (dark === null) {
        dark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      }
      if (!cancelled) {
        setThemeState(dark ? "dark" : "light");
        setColorThemeState(cTheme);
        setIsPremium(premium);
        setPremiumModeEnabledState(modeEnabled);
        applyAll(dark, cTheme, premium && modeEnabled);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [applyAll]);

  const setTheme = useCallback(async (next) => {
    setThemeState(next);
    applyAll(next === "dark", colorTheme, isPremium && premiumModeEnabled);
    try { localStorage.setItem("budgie-theme", next); } catch (e) {}
    try { await base44.auth.updateMe({ theme: next }); } catch (e) {}
  }, [colorTheme, isPremium, premiumModeEnabled, applyAll]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const setColorTheme = useCallback(async (next) => {
    setColorThemeState(next);
    applyAll(theme === "dark", next, isPremium && premiumModeEnabled);
    try { await base44.auth.updateMe({ color_theme: next }); } catch (e) {}
  }, [theme, isPremium, premiumModeEnabled, applyAll]);

  const setPremiumModeEnabled = useCallback(async (enabled) => {
    setPremiumModeEnabledState(enabled);
    applyAll(theme === "dark", colorTheme, isPremium && enabled);
    try { await base44.auth.updateMe({ premium_mode_enabled: enabled }); } catch (e) {}
  }, [theme, colorTheme, isPremium, applyAll]);

  const refreshPremium = useCallback(async () => {
    try {
      const ent = await base44.entities.PremiumEntitlement.filter({});
      const pro = derivePro(ent && ent[0]);
      setIsPremium(pro.premium);
      setTotalPaid(pro.totalPaid);
      setIsProLifetime(pro.lifetime);
      applyAll(theme === "dark", colorTheme, pro.premium && premiumModeEnabled);
      return pro.premium;
    } catch (e) {
      return false;
    }
  }, [theme, colorTheme, premiumModeEnabled, applyAll]);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, toggleTheme, loaded,
      colorTheme, setColorTheme,
      isPremium, premiumActive, premiumModeEnabled, setPremiumModeEnabled,
      totalPaid, isProLifetime, refreshPremium,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
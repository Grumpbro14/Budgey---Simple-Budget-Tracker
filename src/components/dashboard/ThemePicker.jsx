import React from "react";
import { motion } from "framer-motion";
import { Check, RotateCcw } from "lucide-react";
import { PREMIUM_THEMES } from "@/lib/premiumThemes";
import { useTheme } from "@/lib/ThemeContext";

export default function ThemePicker() {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setColorTheme("default")}
          className={`relative rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center gap-1 ${
            colorTheme === "default"
              ? "border-primary shadow-cartoon"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="w-full h-8 rounded-lg bg-gradient-to-r from-primary to-accent" />
          <span className="text-[11px] font-bold">Budgie</span>
          {colorTheme === "default" && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Check className="w-3 h-3" strokeWidth={3} />
            </span>
          )}
        </button>

        {PREMIUM_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setColorTheme(t.id)}
            className={`relative rounded-2xl p-2.5 border-2 transition-all flex flex-col items-center gap-1 ${
              colorTheme === t.id
                ? "border-primary shadow-cartoon"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="w-full h-8 rounded-lg" style={{ background: t.swatch }} />
            <span className="text-[11px] font-bold">{t.name}</span>
            {colorTheme === t.id && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="w-3 h-3" strokeWidth={3} />
              </span>
            )}
          </button>
        ))}
      </div>
      {colorTheme !== "default" && (
        <button
          onClick={() => setColorTheme("default")}
          className="mt-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
          Reset to default Budgie theme
        </button>
      )}
    </div>
  );
}
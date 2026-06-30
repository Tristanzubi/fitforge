"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Changer le thème"
      className="h-8 w-8 rounded-full bg-app-card border border-app-edge flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      style={{ boxShadow: isDark ? "none" : "0 1px 4px rgb(0 0 0 / 0.12)" }}
    >
      {isDark
        ? <Sun className="h-3.5 w-3.5 text-orange-400" />
        : <Moon className="h-3.5 w-3.5 text-app-fg2" />
      }
    </button>
  );
}

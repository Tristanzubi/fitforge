"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, History, BarChart2, MessageCircle } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/s-entrainer", label: "S'entraîner", icon: Dumbbell },
  { href: "/historique", label: "Historique", icon: History },
  { href: "/progression", label: "Stats", icon: BarChart2 },
];

export function BottomNav({
  onChatToggle,
  chatOpen,
}: {
  onChatToggle?: () => void;
  chatOpen?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-stretch">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors ${
                isActive ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${isActive ? "bg-orange-500/15" : ""}`}>
                <Icon className={`h-4 w-4 ${isActive ? "stroke-2" : "stroke-[1.5]"}`} />
              </span>
              {label}
            </Link>
          );
        })}
        <button
          onClick={onChatToggle}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors ${
            chatOpen ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${chatOpen ? "bg-orange-500/15" : ""}`}>
            <MessageCircle className={`h-4 w-4 ${chatOpen ? "stroke-2" : "stroke-[1.5]"}`} />
          </span>
          Coach
        </button>
      </div>
    </nav>
  );
}

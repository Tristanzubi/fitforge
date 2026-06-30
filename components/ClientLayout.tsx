"use client";

import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { ChatDrawer } from "./ChatDrawer";
import { ThemeToggle } from "./ThemeToggle";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <>
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
      <div className="fixed top-3 right-4 z-30">
        <ThemeToggle />
      </div>
      {children}
      <BottomNav onChatToggle={() => setChatOpen((o) => !o)} chatOpen={chatOpen} />
    </>
  );
}

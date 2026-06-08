"use client";

import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { ChatDrawer } from "./ChatDrawer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <>
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
      {children}
      <BottomNav onChatToggle={() => setChatOpen((o) => !o)} chatOpen={chatOpen} />
    </>
  );
}

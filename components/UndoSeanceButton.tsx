"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";

export function UndoSeanceButton({ seanceId }: { seanceId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUndo = async (e: React.MouseEvent) => {
    e.preventDefault(); // éviter de naviguer vers la séance
    e.stopPropagation();
    setLoading(true);
    try {
      await fetch(`/api/logs?seanceId=${seanceId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUndo}
      disabled={loading}
      className="flex items-center gap-1 text-[10px] text-app-fg3 hover:text-app-fg2 transition-colors disabled:opacity-40 px-2 py-1 rounded-lg hover:bg-app-deep"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RotateCcw className="h-3 w-3" />
      )}
      Annuler
    </button>
  );
}

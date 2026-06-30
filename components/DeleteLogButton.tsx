"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteLogButton({ logId, seanceId }: { logId: string; seanceId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000); // reset après 3s
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/logs?seanceId=${seanceId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all disabled:opacity-40 ${
        confirm
          ? "border-red-500/50 bg-red-500/10 text-red-400"
          : "border-app-edge text-app-fg3 hover:border-red-500/40 hover:text-red-400"
      }`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Trash2 className="h-3 w-3" />
      )}
      {confirm ? "Confirmer ?" : "Supprimer"}
    </button>
  );
}

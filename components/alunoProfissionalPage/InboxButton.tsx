"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface InboxButtonProps {
  userId: string;
  onClick: () => void;
}

export default function InboxButton({ userId, onClick }: InboxButtonProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("pedidos")
        .select("*", { count: "exact", head: true })
        .eq("destinatario_id", userId)
        .eq("status", "pendente");

      if (error) {
        console.error("Error fetching pending count:", error);
        return;
      }

      setPendingCount(count || 0);
    } catch (err) {
      console.error("Error in fetchPendingCount:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPendingCount();

    // Set up real-time subscription to pedidos table
    const channel = supabase
      .channel(`pedidos:destinatario_id=eq.${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos",
          filter: `destinatario_id=eq.${userId}`,
        },
        () => {
          // Refetch count when pedidos change
          fetchPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchPendingCount]);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="text-text-primary hover:bg-gray-50"
        aria-label="Inbox"
        onClick={onClick}
      >
        <Inbox className="h-4 w-4" />
      </Button>
      {pendingCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-primary-yellow text-text-primary text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
          {pendingCount}
        </div>
      )}
    </div>
  );
}

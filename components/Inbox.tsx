"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface PedidoItem {
  id: string;
  solicitante_id: string;
  solicitante_tipo: string;
  destinatario_id: string;
  destinatario_tipo: string;
  status: string;
  criado_em: string;
  respondido_em?: string;
}

interface PedidoDetalhado extends PedidoItem {
  solicitante_nome?: string;
  solicitante_email?: string;
  destinatario_nome?: string;
  destinatario_email?: string;
}

interface InboxProps {
  userType: "aluno" | "profissional";
  userId: string;
  onAccept?: (pedidoId: string) => void;
  onDecline?: (pedidoId: string) => void;
}

export default function Inbox({ userType, userId, onAccept, onDecline }: InboxProps) {
  const [pedidos, setPedidos] = useState<PedidoDetalhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    try {
      setLoading(true);
      setError("");

      // Fetch pending requests for current user as destinatario
      const { data: pedidosData, error: pedidosError } = await supabase
        .from("pedidos")
        .select("*")
        .eq("destinatario_id", userId)
        .eq("status", "pendente")
        .order("criado_em", { ascending: false });

      if (pedidosError) throw pedidosError;

      if (!pedidosData || pedidosData.length === 0) {
        setPedidos([]);
        setLoading(false);
        return;
      }

      // Fetch details for solicitantes
      const detalhados: PedidoDetalhado[] = await Promise.all(
        pedidosData.map(async (pedido) => {
          let solicitante_nome = "";
          let solicitante_email = "";

          try {
            if (pedido.solicitante_tipo === "aluno") {
              const { data: alunoData } = await supabase
                .from("alunos")
                .select("nome, email")
                .eq("id", pedido.solicitante_id)
                .single();
              solicitante_nome = alunoData?.nome || "";
              solicitante_email = alunoData?.email || "";
            } else {
              const { data: profData } = await supabase
                .from("profissionais")
                .select("nome, email")
                .eq("id", pedido.solicitante_id)
                .single();
              solicitante_nome = profData?.nome || "";
              solicitante_email = profData?.email || "";
            }
          } catch (err) {
            console.error("Error fetching solicitante details:", err);
          }

          return {
            ...pedido,
            solicitante_nome,
            solicitante_email,
          };
        })
      );

      setPedidos(detalhados);
    } catch (err) {
      console.error("Error fetching pedidos:", err);
      setError("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(pedidoId: string) {
    setActionLoading(pedidoId);
    try {
      const { data, error: rpcError } = await supabase.rpc("aceitar_pedido", {
        pedido_id_input: pedidoId,
      });

      if (rpcError) throw rpcError;
      if (data && !data.success) {
        setError(data.message || "Erro ao aceitar pedido");
        return;
      }

      // Refresh list
      await fetchPedidos();
      onAccept?.(pedidoId);
    } catch (err) {
      console.error("Error accepting pedido:", err);
      setError("Erro ao aceitar pedido");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline(pedidoId: string) {
    setActionLoading(pedidoId);
    try {
      const { data, error: rpcError } = await supabase.rpc("recusar_pedido", {
        pedido_id_input: pedidoId,
      });

      if (rpcError) throw rpcError;
      if (data && !data.success) {
        setError(data.message || "Erro ao recusar pedido");
        return;
      }

      // Refresh list
      await fetchPedidos();
      onDecline?.(pedidoId);
    } catch (err) {
      console.error("Error declining pedido:", err);
      setError("Erro ao recusar pedido");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
          <p className="text-text-primary/70 mt-4">A carregar pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-text-primary/70">Nenhum pedido pendente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary">
                {pedido.solicitante_nome}
              </h3>
              <p className="text-sm text-text-primary/70">{pedido.solicitante_email}</p>
              <p className="text-xs text-text-primary/50 mt-1">
                {userType === "aluno"
                  ? `Profissional pedindo para se conectar`
                  : `Aluno pedindo para se conectar`}
              </p>
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                onClick={() => handleAccept(pedido.id)}
                disabled={actionLoading !== null}
                variant="outline"
                className="border-green-200 text-green-600 hover:bg-green-50"
                aria-label={`Aceitar pedido de ${pedido.solicitante_nome}`}
              >
                <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                Aceitar
              </Button>
              <Button
                onClick={() => handleDecline(pedido.id)}
                disabled={actionLoading !== null}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                aria-label={`Recusar pedido de ${pedido.solicitante_nome}`}
              >
                <X className="h-4 w-4 mr-1" aria-hidden="true" />
                Recusar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

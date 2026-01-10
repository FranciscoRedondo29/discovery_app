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
  instituicao?: string;
  ano_escolaridade?: number;
  funcao?: string;
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
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPedidos();
  }, []);

  async function fetchPedidos() {
    try {
      setLoading(true);
      setError("");

      // Validate userId
      if (!userId || userId.trim() === "") {
        setError("ID de utilizador inválido");
        setLoading(false);
        return;
      }

      // Try using RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "get_pedidos_detalhados",
        { destinatario_id_input: userId }
      );

      // If RPC function doesn't exist, fall back to manual query
      if (rpcError && rpcError.code === "42883") {
        console.warn("RPC function not found, using fallback query. Please run supabase-pedidos-detalhados-rpc.sql");
        await fetchPedidosFallback();
        return;
      }

      if (rpcError) {
        console.error("Error fetching pedidos:", rpcError);
        throw rpcError;
      }

      console.log("Pedidos detalhados from RPC:", rpcData);

      // Validate rpcData is an array
      if (!Array.isArray(rpcData)) {
        console.error("RPC returned non-array data:", rpcData);
        setPedidos([]);
        setLoading(false);
        return;
      }

      if (rpcData.length === 0) {
        setPedidos([]);
        setLoading(false);
        return;
      }

      // Map to PedidoDetalhado interface with validation
      const detalhados: PedidoDetalhado[] = rpcData
        .filter((pedido: any) => {
          // Log any invalid entries
          if (!pedido || !pedido.id) {
            console.warn("Skipping invalid pedido entry:", pedido);
            return false;
          }
          return true;
        })
        .map((pedido: any) => ({
          id: String(pedido.id), // Ensure ID is a string
          solicitante_id: String(pedido.solicitante_id || ""),
          solicitante_tipo: pedido.solicitante_tipo || "",
          destinatario_id: String(pedido.destinatario_id || ""),
          destinatario_tipo: pedido.destinatario_tipo || "",
          status: pedido.status || "pendente",
          criado_em: pedido.criado_em || new Date().toISOString(),
          respondido_em: pedido.respondido_em || undefined,
          solicitante_nome: pedido.solicitante_nome || "Utilizador",
          solicitante_email: pedido.solicitante_email || "Email não disponível",
          instituicao: pedido.instituicao || "Não especificado",
          ano_escolaridade: pedido.ano_escolaridade || undefined,
          funcao: pedido.funcao || "Não especificado",
        }));

      console.log("Pedidos mapped:", detalhados);
      setPedidos(detalhados);
    } catch (err) {
      console.error("Error fetching pedidos:", err);
      setError("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPedidosFallback() {
    try {
      // Fetch pending requests without details
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

      // Map with minimal data (names will show as default values)
      const detalhados: PedidoDetalhado[] = pedidosData
        .filter((pedido) => pedido && pedido.id)
        .map((pedido) => ({
          ...pedido,
          id: String(pedido.id),
          solicitante_id: String(pedido.solicitante_id || ""),
          destinatario_id: String(pedido.destinatario_id || ""),
          solicitante_nome: "Utilizador",
          solicitante_email: "Email não disponível",
          instituicao: "Não especificado",
          ano_escolaridade: undefined,
          funcao: "Não especificado",
        }));

      setPedidos(detalhados);
      setError("Aviso: Execute supabase-pedidos-detalhados-rpc.sql no Supabase para ver detalhes completos dos pedidos");
    } catch (err) {
      console.error("Error in fallback:", err);
      setError("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(pedidoId: string) {
    setActionLoading(pedidoId);
    setError("");
    try {
      console.log("Accepting pedido:", pedidoId);
      const { data, error: rpcError } = await supabase.rpc("aceitar_pedido", {
        pedido_id_input: pedidoId,
      });

      console.log("RPC aceitar_pedido response:", { data, error: rpcError });

      if (rpcError) {
        console.error("RPC error:", rpcError);
        setError(`Erro ao aceitar: ${rpcError.message}`);
        return;
      }
      
      if (data && !data.success) {
        setError(data.message || "Erro ao aceitar pedido");
        return;
      }

      // Remove from list immediately for better UX
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
      setSuccessMessage("Pedido aceite com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
      onAccept?.(pedidoId);
    } catch (err: any) {
      console.error("Error accepting pedido:", err);
      setError(`Erro ao aceitar pedido: ${err?.message || "Erro desconhecido"}`);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline(pedidoId: string) {
    setActionLoading(pedidoId);
    setError("");
    try {
      console.log("Declining pedido:", pedidoId);
      const { data, error: rpcError } = await supabase.rpc("recusar_pedido", {
        pedido_id_input: pedidoId,
      });

      console.log("RPC recusar_pedido response:", { data, error: rpcError });

      if (rpcError) {
        console.error("RPC error:", rpcError);
        setError(`Erro ao recusar: ${rpcError.message}`);
        return;
      }
      
      if (data && !data.success) {
        setError(data.message || "Erro ao recusar pedido");
        return;
      }

      // Remove from list immediately for better UX
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
      setSuccessMessage("Pedido recusado com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
      onDecline?.(pedidoId);
    } catch (err: any) {
      console.error("Error declining pedido:", err);
      setError(`Erro ao recusar pedido: ${err?.message || "Erro desconhecido"}`);
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
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 font-medium">{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {pedidos.filter(pedido => pedido && pedido.id).map((pedido) => (
        <div
          key={`pedido-${pedido.id}`}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-text-primary text-lg">
                {pedido.solicitante_nome || "Utilizador"}
              </h3>
              <p className="text-sm text-text-primary/70 mt-0.5">{pedido.solicitante_email || "Email não disponível"}</p>
              <p className="text-sm text-text-primary/60 mt-1">
                {pedido.instituicao || "Não especificado"}
                {" • "}
                {pedido.solicitante_tipo === "aluno"
                  ? `Ano ${pedido.ano_escolaridade ?? "N/A"}`
                  : pedido.funcao || "Não especificado"}
              </p>
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                onClick={() => handleAccept(pedido.id)}
                disabled={actionLoading !== null}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                aria-label={`Aceitar pedido de ${pedido.solicitante_nome || "utilizador"}`}
              >
                <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                Aceitar
              </Button>
              <Button
                onClick={() => handleDecline(pedido.id)}
                disabled={actionLoading !== null}
                variant="outline"
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                aria-label={`Recusar pedido de ${pedido.solicitante_nome || "utilizador"}`}
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

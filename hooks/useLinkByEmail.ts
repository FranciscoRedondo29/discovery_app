import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type LinkMode = "aluno" | "profissional";

interface UseLinkByEmailProps {
  mode: LinkMode;
  currentUserId: string;
}

interface LinkByEmailResult {
  loading: boolean;
  error: string;
  success: boolean;
  linkByEmail: (email: string) => Promise<void>;
  resetState: () => void;
}

export function useLinkByEmail({ mode, currentUserId }: UseLinkByEmailProps): LinkByEmailResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setError("");
    setSuccess(false);
    setLoading(false);
  };

  const linkByEmail = async (email: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (!trimmedEmail) {
        setError("Por favor, introduza um email.");
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError("Por favor, introduza um email válido.");
        setLoading(false);
        return;
      }

      // Call RPC to create pending request
      const { data, error: rpcError } = await supabase.rpc("criar_pedido", {
        destinatario_email: trimmedEmail,
        tipo_solicitante: mode,
      });

      if (rpcError) {
        setError("Erro ao enviar pedido. Tente novamente.");
        setLoading(false);
        return;
      }

      if (!data || !data.success) {
        setError(data?.message || "Erro ao enviar pedido.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    linkByEmail,
    resetState,
  };
}


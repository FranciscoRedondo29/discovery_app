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

      if (mode === "aluno") {
        // Aluno adding a profissional
        // 1. Look up profissional by email using secure RPC
        const { data: profissionalId, error: lookupError } = await supabase
          .rpc("lookup_profissional_id_by_email", { email_input: trimmedEmail });

        if (lookupError) {
          // RPC function error (e.g., authentication issue)
          setError("Erro ao procurar profissional. Tente novamente.");
          setLoading(false);
          return;
        }

        if (!profissionalId) {
          // Email not found in profissionais table
          setError("Profissional não encontrado com este email.");
          setLoading(false);
          return;
        }

        // 2. Insert into join table
        const { error: insertError } = await supabase
          .from("aluno_profissionais")
          .insert({
            aluno_id: currentUserId,
            profissional_id: profissionalId,
          });

        if (insertError) {
          // Check for duplicate constraint violation (PostgreSQL error code 23505)
          if (insertError.code === "23505") {
            setError("Este profissional já está adicionado.");
          } else {
            setError("Erro ao adicionar profissional. Tente novamente.");
          }
          setLoading(false);
          return;
        }

        setSuccess(true);
        setLoading(false);
      } else {
        // Profissional adding an aluno
        // 1. Look up aluno by email using secure RPC
        const { data: alunoId, error: lookupError } = await supabase
          .rpc("lookup_aluno_id_by_email", { email_input: trimmedEmail });

        if (lookupError) {
          // RPC function error (e.g., authentication issue)
          setError("Erro ao procurar aluno. Tente novamente.");
          setLoading(false);
          return;
        }

        if (!alunoId) {
          // Email not found in alunos table
          setError("Aluno não encontrado com este email.");
          setLoading(false);
          return;
        }

        // 2. Insert into join table
        const { error: insertError } = await supabase
          .from("aluno_profissionais")
          .insert({
            aluno_id: alunoId,
            profissional_id: currentUserId,
          });

        if (insertError) {
          // Check for duplicate constraint violation
          if (insertError.code === "23505") {
            setError("Este aluno já está adicionado.");
          } else {
            setError("Erro ao adicionar aluno. Tente novamente.");
          }
          setLoading(false);
          return;
        }

        setSuccess(true);
        setLoading(false);
      }
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


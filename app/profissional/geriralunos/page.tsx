"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLinkByEmail } from "@/hooks/useLinkByEmail";
import { LoadingState } from "@/components/gerir/LoadingState";
import { GerirHeader } from "@/components/gerir/GerirHeader";
import { AddByEmailForm } from "@/components/gerir/AddByEmailForm";
import { PersonList } from "@/components/gerir/PersonList";

export default function GerirAlunosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [alunos, setAlunos] = useState<any[]>([]);
  const [email, setEmail] = useState("");

  const { loading: adding, error: addError, success, linkByEmail, resetState } = useLinkByEmail({
    mode: "profissional",
    currentUserId: userId,
  });

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.replace("/login");
          return;
        }

        // verify user is a profissional
        const { data: profData, error: profError } = await supabase
          .from("profissionais")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (profError || !profData) {
          setError("Acesso não autorizado.");
          setTimeout(() => router.replace("/login"), 1500);
          return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user.email || "");

        await fetchAlunos(session.user.id);
        setLoading(false);
      } catch (err) {
        setError("Erro ao verificar autenticação.");
        setLoading(false);
      }
    }

    checkAuthAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (success) {
      fetchAlunos(userId);
      resetState();
      setEmail("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  async function fetchAlunos(profissionalId: string) {
    try {
      const { data: links, error: linksError } = await supabase
        .from("aluno_profissionais")
        .select("aluno_id")
        .eq("profissional_id", profissionalId);

      if (linksError) throw linksError;

      if (!links || links.length === 0) {
        setAlunos([]);
        return;
      }

      const ids = links.map((l: any) => l.aluno_id);
      const { data: alunosData, error: alunosError } = await supabase
        .from("alunos")
        .select("id, nome, email, escola_instituicao, ano_escolaridade")
        .in("id", ids);

      if (alunosError) throw alunosError;
      setAlunos(alunosData || []);
    } catch (err) {
      console.error(err);
      setAlunos([]);
    }
  }

  const handleRemove = async (alunoId: string) => {
    if (!confirm("Remover este aluno?")) return;
    try {
      const { error } = await supabase
        .from("aluno_profissionais")
        .delete()
        .eq("aluno_id", alunoId)
        .eq("profissional_id", userId);

      if (error) throw error;
      await fetchAlunos(userId);
    } catch (err) {
      console.error(err);
      setError("Erro ao remover aluno.");
    }
  };

  const handleAddByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    await linkByEmail(email);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-soft-yellow flex flex-col">
      <GerirHeader
        title="Gerir Alunos"
        backRoute="/profissional"
        onBack={() => router.push('/profissional')}
      />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          <AddByEmailForm
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleAddByEmail}
            loading={adding}
            error={error}
            addError={addError}
            placeholder="Email do aluno"
            label="Adicionar aluno por email"
          />

          <PersonList
            persons={alunos}
            title="Alunos ligados"
            emptyMessage="Nenhum aluno ligado."
            onRemove={handleRemove}
            renderDetails={(a) => `${a.email} • Ano ${a.ano_escolaridade}`}
            showProgressButton={true}
          />
        </div>
      </main>
    </div>
  );
}

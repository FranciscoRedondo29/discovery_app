"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLinkByEmail } from "@/hooks/useLinkByEmail";
import { LoadingState } from "@/components/gerir/LoadingState";
import { GerirHeader } from "@/components/gerir/GerirHeader";
import { AddByEmailForm } from "@/components/gerir/AddByEmailForm";
import { PersonList } from "@/components/gerir/PersonList";

export default function GerirProfissionaisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [email, setEmail] = useState("");

  const { loading: adding, error: addError, success, linkByEmail, resetState } = useLinkByEmail({
    mode: "aluno",
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

        // verify user is an aluno
        const { data: alunoData, error: alunoError } = await supabase
          .from("alunos")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (alunoError || !alunoData) {
          setError("Acesso não autorizado.");
          setTimeout(() => router.replace("/login"), 1500);
          return;
        }

        setUserId(session.user.id);
        setUserEmail(session.user.email || "");

        await fetchProfissionais(session.user.id);
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
      // refresh list after successful add
      fetchProfissionais(userId);
      resetState();
      setEmail("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  async function fetchProfissionais(alunoId: string) {
    try {
      const { data: links, error: linksError } = await supabase
        .from("aluno_profissionais")
        .select("profissional_id")
        .eq("aluno_id", alunoId);

      if (linksError) throw linksError;

      if (!links || links.length === 0) {
        setProfissionais([]);
        return;
      }

      const ids = links.map((l: any) => l.profissional_id);
      const { data: profs, error: profsError } = await supabase
        .from("profissionais")
        .select("id, nome, email, escola_instituicao, funcao")
        .in("id", ids);

      if (profsError) throw profsError;
      setProfissionais(profs || []);
    } catch (err) {
      console.error(err);
      setProfissionais([]);
    }
  }

  const handleRemove = async (profissionalId: string) => {
    if (!confirm("Remover este profissional?")) return;
    try {
      const { error } = await supabase
        .from("aluno_profissionais")
        .delete()
        .eq("aluno_id", userId)
        .eq("profissional_id", profissionalId);

      if (error) throw error;
      await fetchProfissionais(userId);
    } catch (err) {
      console.error(err);
      setError("Erro ao remover profissional.");
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
        title="Gerir Profissionais"
        backRoute="/aluno"
        onBack={() => router.push('/aluno')}
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
            placeholder="Email do profissional"
            label="Adicionar profissional por email"
          />

          <PersonList
            persons={profissionais}
            title="Profissionais ligados"
            emptyMessage="Nenhum profissional ligado."
            onRemove={handleRemove}
            renderDetails={(p) => `${p.email} • ${p.funcao}`}
          />
        </div>
      </main>
    </div>
  );
}

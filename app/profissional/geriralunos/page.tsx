"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, UserPlus } from "lucide-react";
import { useLinkByEmail } from "@/hooks/useLinkByEmail";

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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
          <p className="text-text-primary/70 mt-4">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-yellow flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Gerir Alunos</h1>
          <div>
            <Button variant="ghost" onClick={() => router.push('/profissional')}>Voltar</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          <section className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Adicionar aluno por email</h2>
            <form onSubmit={handleAddByEmail} className="flex gap-2">
              <Input
                type="email"
                placeholder="Email do aluno"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                aria-label="Email do aluno"
              />
              <Button type="submit" disabled={adding} className="bg-primary-yellow">
                {adding ? "A adicionar..." : "Adicionar"}
              </Button>
            </form>
            {addError && <p className="text-red-600 text-sm mt-2">{addError}</p>}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">Alunos ligados ({alunos.length})</h2>
            {alunos.length === 0 ? (
              <div className="text-text-primary/70">Nenhum aluno ligado.</div>
            ) : (
              <div className="grid gap-4">
                {alunos.map((a) => (
                  <div key={a.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{a.nome}</div>
                      <div className="text-sm text-text-primary/70">{a.email} • Ano {a.ano_escolaridade}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="border-red-200 text-red-600" onClick={() => handleRemove(a.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

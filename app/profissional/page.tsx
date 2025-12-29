"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { LogOut, Eye, CheckSquare, Inbox } from "lucide-react";
import LinkByEmailInline from "@/components/linking/LinkByEmailInline";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  escola_instituicao: string;
  ano_escolaridade: number;
}

export default function ProfissionalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profissionalName, setProfissionalName] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // No session, redirect to login
          router.replace("/login");
          return;
        }

        // Check if user exists in profissionais table
        const { data: profissionalData, error: profissionalError } = await supabase
          .from("profissionais")
          .select("id, nome")
          .eq("id", session.user.id)
          .single();

        if (profissionalError || !profissionalData) {
          // User is not a profissional, redirect to login
          setError("Acesso não autorizado. Esta página é apenas para profissionais.");
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
          return;
        }

        // User is authenticated and is a profissional
        setProfissionalName(profissionalData.nome);
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");

        // Fetch associated students
        await fetchAlunos(session.user.id);
        
        setLoading(false);
      } catch (err) {
        setError("Ocorreu um erro ao verificar a autenticação.");
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      }
    }

    async function fetchAlunos(profissionalId: string) {
      try {
        // Query join table to get student IDs, then get their details
        const { data: links, error: linksError } = await supabase
          .from("aluno_profissionais")
          .select("aluno_id")
          .eq("profissional_id", profissionalId);

        if (linksError) throw linksError;

        if (links && links.length > 0) {
          const alunoIds = links.map((link) => link.aluno_id);
          const { data: alunosData, error: alunosError } = await supabase
            .from("alunos")
            .select("id, nome, email, escola_instituicao, ano_escolaridade")
            .in("id", alunoIds);

          if (alunosError) throw alunosError;
          setAlunos(alunosData || []);
        } else {
          setAlunos([]);
        }
      } catch (err) {
        console.error("Error fetching alunos:", err);
        setAlunos([]);
      }
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      setError("Erro ao terminar sessão.");
    }
  };

  const handleViewProgress = (alunoId: string, alunoName: string) => {
    // TODO: Implement view progress functionality
    alert(`Funcionalidade em desenvolvimento: Ver progresso de ${alunoName}`);
  };

  const handleAddTasks = (alunoId: string, alunoName: string) => {
    // TODO: Implement add tasks functionality
    alert(`Funcionalidade em desenvolvimento: Adicionar tarefas para ${alunoName}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto"></div>
          <p className="text-text-primary/70">A carregar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
          <p className="text-text-primary/70 text-sm">A redirecionar...</p>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-soft-yellow flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto max-w-7xl">
          <div>
            <div className="grid grid-cols-3 items-center">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                  aria-label="Terminar sessão"
                >
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                  Logout
                </Button>

                <Button variant="ghost" className="text-text-primary hover:bg-gray-50" aria-label="Inbox" onClick={() => router.push("/profissional/pedidos")}>
                  <Inbox className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-bold text-text-primary">Olá, {profissionalName}!</h1>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setShowAddForm((s) => !s)}
                  variant="outline"
                  className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                  aria-label="Adicionar aluno"
                >
                  Adicionar aluno
                </Button>
              </div>
            </div>

            {/* Full-width form area under header row */}
            <div className="mt-4 w-full">
              <LinkByEmailInline
                mode="profissional"
                currentUserId={userId}
                currentUserEmail={userEmail}
                buttonLabelDesktop="Adicionar aluno"
                buttonLabelMobile="Adicionar"
                hideToggleButton
                showForm={showAddForm}
                onToggle={() => setShowAddForm((s) => !s)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          {alunos.length === 0 ? (
            // Empty state
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-text-primary">
                  Sem alunos
                </h2>
                <p className="text-text-primary/70 text-lg">
                  Ainda não tem alunos atribuídos. Os seus alunos aparecerão aqui quando forem adicionados.
                </p>
              </div>
            </div>
          ) : (
            // Students list
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-text-primary">Os Meus Alunos</h2>
                  <div>
                    <Button
                      onClick={() => router.push("/profissional/geriralunos")}
                      variant="outline"
                      className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                      aria-label="Gerir alunos"
                    >
                      Gerir alunos
                    </Button>
                  </div>
                </div>
              <div className="grid gap-4">
                {alunos.map((aluno) => (
                  <div
                    key={aluno.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-text-primary">
                          {aluno.nome}
                        </h3>
                        <p className="text-text-primary/70 text-sm">
                          {aluno.email}
                        </p>
                        <p className="text-text-primary/60 text-xs mt-1">
                          {aluno.escola_instituicao} • {aluno.ano_escolaridade}º ano 
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleViewProgress(aluno.id, aluno.nome)}
                          variant="outline"
                          className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                          aria-label={`Ver progresso de ${aluno.nome}`}
                          title="Ver progresso"
                        >
                          <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span className="hidden sm:inline">Ver progresso</span>
                          <span className="sm:hidden">Progresso</span>
                        </Button>
                        <Button
                          onClick={() => handleAddTasks(aluno.id, aluno.nome)}
                          variant="outline"
                          className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                          aria-label={`Adicionar tarefas para ${aluno.nome}`}
                          title="Adicionar tarefas"
                        >
                          <CheckSquare className="h-4 w-4 mr-2" aria-hidden="true" />
                          <span className="hidden sm:inline">Adicionar tarefas</span>
                          <span className="sm:hidden">Tarefas</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


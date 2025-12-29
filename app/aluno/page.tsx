"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic, LogOut, Inbox } from "lucide-react";
import LinkByEmailInline from "@/components/linking/LinkByEmailInline";

export default function AlunoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alunoName, setAlunoName] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
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

        // Check if user exists in alunos table
        const { data: alunoData, error: alunoError } = await supabase
          .from("alunos")
          .select("id, nome")
          .eq("id", session.user.id)
          .single();

        if (alunoError || !alunoData) {
          // User is not an aluno, redirect to login without signOut
          setError("Acesso não autorizado. Esta página é apenas para alunos.");
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
          return;
        }

        // User is authenticated and is an aluno
        setAlunoName(alunoData.nome);
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        setLoading(false);
      } catch (err) {
        setError("Ocorreu um erro ao verificar a autenticação.");
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
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

  const handleLearn = () => {
    // TODO: Implement learn mode navigation
    alert("Funcionalidade em desenvolvimento: Modo Aprender");
  };

  const handlePractice = () => {
    // TODO: Implement practice mode navigation
    alert("Funcionalidade em desenvolvimento: Modo Praticar");
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

                <Button variant="ghost" className="text-text-primary hover:bg-gray-50" aria-label="Inbox" onClick={() => router.push("/aluno/pedidos")}>
                  <Inbox className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-bold text-text-primary">Olá, {alunoName}!</h1>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setShowAddForm((s) => !s)}
                  variant="outline"
                  className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                  aria-label="Adicionar profissional"
                >
                  Adicionar profissional
                </Button>
              </div>
            </div>

            {/* Full-width form area under header row */}
            <div className="mt-4 w-full">
              <LinkByEmailInline
                mode="aluno"
                currentUserId={userId}
                currentUserEmail={userEmail}
                buttonLabelDesktop="Adicionar profissional responsável"
                buttonLabelMobile="Adicionar prof."
                hideToggleButton
                showForm={showAddForm}
                onToggle={() => setShowAddForm((s) => !s)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12 flex items-center">
        <div className="w-full space-y-6">
          {/* Learn Button */}
          <button
            onClick={handleLearn}
            className="w-full bg-white hover:bg-primary-yellow/10 border-2 border-primary-yellow rounded-2xl p-12 transition-all duration-300 hover:shadow-xl group"
            aria-label="Modo Aprender"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-yellow group-hover:bg-primary-yellow/20 transition-colors">
                <BookOpen className="h-8 w-8 text-primary-yellow" aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-bold text-text-primary">
                Aprender
              </h2>
              <p className="text-text-primary/70 max-w-md">
                Ouve e segue o texto com realce visual
              </p>
            </div>
          </button>

          {/* Practice Button */}
          <button
            onClick={handlePractice}
            className="w-full bg-white hover:bg-primary-yellow/10 border-2 border-primary-yellow rounded-2xl p-12 transition-all duration-300 hover:shadow-xl group"
            aria-label="Modo Praticar"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft-yellow group-hover:bg-primary-yellow/20 transition-colors">
                <Mic className="h-8 w-8 text-primary-yellow" aria-hidden="true" />
              </div>
              <h2 className="text-3xl font-bold text-text-primary">
                Praticar
              </h2>
              <p className="text-text-primary/70 max-w-md">
                Lê em voz alta e recebe feedback imediato
              </p>
            </div>
          </button>
        </div>
      </main>

      {/* Bottom Section - Tasks */}
      <footer className="bg-white border-t border-gray-200 px-4 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Tarefas</h3>
            <div>
              <Button
                onClick={() => router.push("/aluno/gerirprofissionais")}
                variant="outline"
                className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                aria-label="Gerir profissionais"
              >
                Gerir profissionais
              </Button>
            </div>
          </div>
          <div className="text-text-primary/50 text-center py-8">
            <p>Nenhuma tarefa atribuída ainda.</p>
            <p className="text-sm mt-2">As tarefas do seu profissional responsável aparecerão aqui.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


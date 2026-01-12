"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic, TrendingUp } from "lucide-react";
import TopBar from "@/components/alunoProfissionalPage/TopBar";
import LoadingState from "@/components/alunoProfissionalPage/LoadingState";
import ErrorState from "@/components/alunoProfissionalPage/ErrorState";

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
    router.push("/aluno/learning");
  };

  const handlePractice = () => {
    router.push("/aluno/practice");
  };

  const handleProgress = () => {
    router.push("/aluno/progress");
  };

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Main UI
  return (
    <div className="min-h-screen bg-soft-yellow flex flex-col">
      <TopBar
        userName={alunoName}
        userId={userId}
        userEmail={userEmail}
        userType="aluno"
        showAddForm={showAddForm}
        onHomeClick={() => router.push("/")}
        onLogoutClick={handleLogout}
        onInboxClick={() => router.push("/aluno/pedidos")}
        onToggleAddForm={() => setShowAddForm((s) => !s)}
      />

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
                Exercícios de leitura e escrita com feedback imediato
              </p>
            </div>
          </button>

          {/* Progress Button */}
          <button
            onClick={handleProgress}
            className="w-full bg-white hover:bg-primary-yellow/10 border-2 border-primary-yellow rounded-2xl p-8 transition-all duration-300 hover:shadow-xl group"
            aria-label="Meu Progresso"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-soft-yellow group-hover:bg-primary-yellow/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary-yellow" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">
                O meu Progresso
              </h2>
              <p className="text-text-primary/70 max-w-md text-sm">
                Vê o teu desempenho e evolução
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


"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import TopBar from "@/components/alunoProfissionalPage/TopBar";
import LoadingState from "@/components/alunoProfissionalPage/LoadingState";
import ErrorState from "@/components/alunoProfissionalPage/ErrorState";
import StudentProgressView from "@/components/progress/StudentProgressView";
import { ArrowLeft } from "lucide-react";

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alunoName, setAlunoName] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.replace("/login");
          return;
        }

        // Check if user is an aluno
        const { data: alunoData, error: alunoError } = await supabase
          .from("alunos")
          .select("id, nome")
          .eq("id", session.user.id)
          .single();

        if (alunoError || !alunoData) {
          setError("Acesso não autorizado. Esta página é apenas para alunos.");
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
          return;
        }

        setAlunoName(alunoData.nome);
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Ocorreu um erro ao carregar os dados.");
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      setError("Erro ao terminar sessão.");
    }
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
        homeButtonText="Voltar"
        homeButtonIcon={ArrowLeft}
        onHomeClick={() => router.push("/aluno")}
        onLogoutClick={handleLogout}
        onInboxClick={() => router.push("/aluno/pedidos")}
        onToggleAddForm={() => setShowAddForm((s) => !s)}
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <StudentProgressView studentId={userId} />
      </main>
    </div>
  );
}

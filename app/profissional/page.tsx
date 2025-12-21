"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function ProfissionalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profissionalName, setProfissionalName] = useState("");

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
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">
              Olá, {profissionalName}!
            </h1>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
            aria-label="Terminar sessão"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">
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
        </div>
      </main>
    </div>
  );
}


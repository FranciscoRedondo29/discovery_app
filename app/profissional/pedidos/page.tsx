"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Inbox from "@/components/Inbox";

export default function ProfissionalPedidosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.replace("/login");
          return;
        }

        // Verify user is a profissional
        const { data: profData, error: profError } = await supabase
          .from("profissionais")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (profError || !profData) {
          setError("Acesso não autorizado");
          setTimeout(() => router.replace("/login"), 1500);
          return;
        }

        setUserId(session.user.id);
        setLoading(false);
      } catch (err) {
        setError("Erro ao verificar autenticação");
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      setError("Erro ao terminar sessão");
    }
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
          <h1 className="text-2xl font-bold text-text-primary">Pedidos Pendentes</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/profissional")}
              variant="ghost"
            >
              Voltar
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4">Alunos pedindo para se conectar</h2>
          <Inbox userType="profissional" userId={userId} />
        </section>
      </main>
    </div>
  );
}

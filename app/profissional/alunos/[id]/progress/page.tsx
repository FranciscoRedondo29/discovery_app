"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/alunoProfissionalPage/LoadingState";
import ErrorState from "@/components/alunoProfissionalPage/ErrorState";
import StudentProgressView from "@/components/progress/StudentProgressView";

export default function ProfessionalStudentProgressPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkAccess() {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.replace("/login");
          return;
        }

        // Check if user is a professional
        const { data: profData, error: profError } = await supabase
          .from("profissionais")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (profError || !profData) {
          setError("Acesso não autorizado. Esta página é apenas para profissionais.");
          setTimeout(() => {
            router.replace("/login");
          }, 2000);
          return;
        }

        // Check if professional has a relationship with the student
        const { data: relationData, error: relationError } = await supabase
          .from("aluno_profissionais")
          .select("aluno_id")
          .eq("profissional_id", session.user.id)
          .eq("aluno_id", studentId)
          .maybeSingle();

        if (relationError) {
          console.error("Error checking relationship:", relationError);
          setError("Erro ao verificar permissões.");
          setTimeout(() => {
            router.replace("/profissional");
          }, 2000);
          return;
        }

        if (!relationData) {
          setError("Acesso negado. Você não tem permissão para ver o progresso deste aluno.");
          setTimeout(() => {
            router.replace("/profissional");
          }, 2000);
          return;
        }

        setHasAccess(true);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Ocorreu um erro ao verificar permissões.");
        setLoading(false);
      }
    }

    checkAccess();
  }, [router, studentId]);

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
      {/* Header */}
      <header className="bg-white border-b border-primary-yellow/20 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/profissional")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Alunos
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        {hasAccess && <StudentProgressView studentId={studentId} />}
      </main>
    </div>
  );
}

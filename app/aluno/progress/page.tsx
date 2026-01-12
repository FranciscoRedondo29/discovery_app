"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, TrendingUp, AlertCircle, Target } from "lucide-react";
import TopBar from "@/components/alunoProfissionalPage/TopBar";
import LoadingState from "@/components/alunoProfissionalPage/LoadingState";
import ErrorState from "@/components/alunoProfissionalPage/ErrorState";

interface DictationMetric {
  id: string;
  difficulty: string;
  correct_count: number;
  error_count: number;
  missing_count: number;
  extra_count: number;
  accuracy_percent: number;
  created_at: string;
}

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alunoName, setAlunoName] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [metrics, setMetrics] = useState<DictationMetric[]>([]);
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

        // Fetch dictation metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from("dictation_metrics")
          .select("*")
          .eq("student_id", session.user.id)
          .order("created_at", { ascending: false });

        if (metricsError) {
          console.error("Error fetching metrics:", metricsError);
          setError("Erro ao carregar métricas.");
          return;
        }

        setMetrics(metricsData || []);
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

  // Calculate summary statistics
  const totalExercises = metrics.length;
  const averageAccuracy = totalExercises > 0
    ? (metrics.reduce((sum, m) => sum + m.accuracy_percent, 0) / totalExercises).toFixed(1)
    : "0";

  // Calculate most common error type
  const totalOmissions = metrics.reduce((sum, m) => sum + m.missing_count, 0);
  const totalSubstitutions = metrics.reduce((sum, m) => sum + m.error_count, 0);
  const totalInsertions = metrics.reduce((sum, m) => sum + m.extra_count, 0);

  let mostCommonError = "Nenhum";
  if (totalOmissions > 0 || totalSubstitutions > 0 || totalInsertions > 0) {
    const maxErrors = Math.max(totalOmissions, totalSubstitutions, totalInsertions);
    if (maxErrors === totalOmissions) {
      mostCommonError = "Omissões";
    } else if (maxErrors === totalSubstitutions) {
      mostCommonError = "Substituições";
    } else {
      mostCommonError = "Inserções";
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
        onHomeClick={() => router.push("/aluno")}
        onLogoutClick={handleLogout}
        onInboxClick={() => router.push("/aluno/pedidos")}
        onToggleAddForm={() => setShowAddForm((s) => !s)}
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <TrendingUp className="h-10 w-10 text-primary-yellow" />
            Meu Progresso
          </h1>
          <p className="text-text-primary/70">
            Acompanhe o seu desempenho nos exercícios de prática
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Exercises Card */}
          <Card className="border-2 border-primary-yellow/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-text-primary/70 flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Exercícios Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary-yellow">
                {totalExercises}
              </div>
              <p className="text-xs text-text-primary/60 mt-2">
                Total de práticas completas
              </p>
            </CardContent>
          </Card>

          {/* Average Accuracy Card */}
          <Card className="border-2 border-primary-yellow/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-text-primary/70 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Precisão Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary-yellow">
                {averageAccuracy}%
              </div>
              <p className="text-xs text-text-primary/60 mt-2">
                Média de acertos em todas as práticas
              </p>
            </CardContent>
          </Card>

          {/* Most Common Error Card */}
          <Card className="border-2 border-primary-yellow/20 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-text-primary/70 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Erro Mais Comum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-yellow">
                {mostCommonError}
              </div>
              <p className="text-xs text-text-primary/60 mt-2">
                {totalOmissions} Omissões · {totalSubstitutions} Substituições · {totalInsertions} Inserções
              </p>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card className="border-2 border-primary-yellow/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-text-primary">
              Histórico de Exercícios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-12 text-text-primary/60">
                <BarChart className="h-16 w-16 mx-auto mb-4 text-primary-yellow/40" />
                <p className="text-lg font-medium">Ainda não há exercícios realizados</p>
                <p className="text-sm mt-2">Complete um exercício de prática para ver o seu progresso aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="bg-soft-yellow/30 rounded-lg p-4 border border-primary-yellow/20 hover:border-primary-yellow/40 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      {/* Date and Accuracy */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-text-primary/70">
                            {formatDate(metric.created_at)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-yellow/20 text-primary-yellow border border-primary-yellow/30">
                            {metric.difficulty === "easy" ? "Fácil" : metric.difficulty === "medium" ? "Médio" : "Difícil"}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-text-primary">
                          {metric.accuracy_percent.toFixed(1)}%
                          <span className="text-sm font-normal text-text-primary/60 ml-2">
                            de precisão
                          </span>
                        </div>
                      </div>

                      {/* Error Breakdown */}
                      <div className="flex flex-wrap gap-4 md:gap-6">
                        <div className="text-center">
                          <div className="text-xs font-medium text-text-primary/60 mb-1">
                            Omissões
                          </div>
                          <div className="text-lg font-bold text-red-600">
                            {metric.missing_count}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-text-primary/60 mb-1">
                            Substituições
                          </div>
                          <div className="text-lg font-bold text-orange-600">
                            {metric.error_count}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-text-primary/60 mb-1">
                            Inserções
                          </div>
                          <div className="text-lg font-bold text-yellow-600">
                            {metric.extra_count}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-medium text-text-primary/60 mb-1">
                            Corretas
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {metric.correct_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

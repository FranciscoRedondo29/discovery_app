"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, TrendingUp, AlertCircle, Target } from "lucide-react";
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
  letter_omission_count: number;
  letter_insertion_count: number;
  letter_substitution_count: number;
  transposition_count: number;
  split_join_count: number;
  punctuation_error_count: number;
  capitalization_error_count: number;
  error_words: string[];
  resolution: string;
}

interface StudentProgressViewProps {
  studentId: string;
}

export default function StudentProgressView({ studentId }: StudentProgressViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [metrics, setMetrics] = useState<DictationMetric[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch student name
        const { data: studentData, error: studentError } = await supabase
          .from("alunos")
          .select("nome")
          .eq("id", studentId)
          .single();

        if (studentError) {
          console.error("Error fetching student:", studentError);
          setError("Erro ao carregar dados do aluno.");
          setLoading(false);
          return;
        }

        setStudentName(studentData.nome);

        // Fetch dictation metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from("dictation_metrics")
          .select("id, difficulty, correct_count, error_count, missing_count, extra_count, accuracy_percent, created_at, letter_omission_count, letter_insertion_count, letter_substitution_count, transposition_count, split_join_count, punctuation_error_count, capitalization_error_count, error_words, resolution")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (metricsError) {
          console.error("Error fetching metrics:", metricsError);
          setError("Erro ao carregar métricas.");
          setLoading(false);
          return;
        }

        setMetrics(metricsData || []);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setError("Ocorreu um erro ao carregar os dados.");
        setLoading(false);
      }
    }

    loadData();
  }, [studentId]);

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
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <TrendingUp className="h-10 w-10 text-primary-yellow" />
          Progresso de {studentName}
        </h1>
        <p className="text-text-primary/70">
          Acompanhe o desempenho do aluno nos exercícios de prática
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
              <p className="text-sm mt-2">O aluno ainda não completou nenhum exercício de prática.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {metrics.map((metric) => (
                <AccordionItem key={metric.id} value={metric.id} className="bg-soft-yellow/30 rounded-lg border border-primary-yellow/20">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-soft-yellow/50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full pr-4">
                      {/* Date and Accuracy */}
                      <div className="flex-1 text-left">
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
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {/* Resolution Text */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-text-primary/70 mb-2">
                        Texto do Aluno:
                      </h4>
                      <p className="text-lg leading-relaxed text-text-primary bg-white p-4 rounded-lg border border-gray-200">
                        {metric.resolution}
                      </p>
                    </div>

                    {/* Error Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Letter Errors */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {metric.letter_omission_count + metric.letter_insertion_count + metric.letter_substitution_count}
                        </div>
                        <div className="text-xs font-medium text-text-primary/70 uppercase">
                          Erros de Letra
                        </div>
                        <div className="text-xs text-text-primary/50 mt-1">
                          omissão + inserção + substituição
                        </div>
                      </div>

                      {/* Transpositions */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {metric.transposition_count}
                        </div>
                        <div className="text-xs font-medium text-text-primary/70 uppercase">
                          Transposições
                        </div>
                        <div className="text-xs text-text-primary/50 mt-1">
                          troca de letras
                        </div>
                      </div>

                      {/* Formatting */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {metric.punctuation_error_count + metric.capitalization_error_count}
                        </div>
                        <div className="text-xs font-medium text-text-primary/70 uppercase">
                          Formatação
                        </div>
                        <div className="text-xs text-text-primary/50 mt-1">
                          pontuação + maiúsculas
                        </div>
                      </div>

                      {/* Words Missed */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {metric.error_words.length}
                        </div>
                        <div className="text-xs font-medium text-text-primary/70 uppercase">
                          Palavras Erradas
                        </div>
                        <div className="text-xs text-text-primary/50 mt-1">
                          palavras com erro
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

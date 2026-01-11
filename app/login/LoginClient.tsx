"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/ui/Navbar";
import { Sparkles } from "lucide-react";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  /**
   * Checks the user's role and redirects to the appropriate dashboard
   */
  const checkUserRoleAndRedirect = async (userId: string): Promise<boolean> => {
    try {
      // Check if user is an aluno
      const { data: alunoData } = await supabase
        .from("alunos")
        .select("id")
        .eq("id", userId)
        .single();

      if (alunoData) {
        router.replace("/aluno");
        return true;
      }

      // Check if user is a profissional
      const { data: profissionalData } = await supabase
        .from("profissionais")
        .select("id")
        .eq("id", userId)
        .single();

      if (profissionalData) {
        router.replace("/profissional");
        return true;
      }

      // Profile not found
      return false;
    } catch (err) {
      console.error("Error checking user role:", err);
      return false;
    }
  };

  // Auto-redirect on mount if user is already authenticated
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user is an aluno
          const { data: alunoData } = await supabase
            .from("alunos")
            .select("id")
            .eq("id", user.id)
            .single();

          if (alunoData) {
            router.replace("/aluno");
            return;
          }

          // Check if user is a profissional
          const { data: profissionalData } = await supabase
            .from("profissionais")
            .select("id")
            .eq("id", user.id)
            .single();

          if (profissionalData) {
            router.replace("/profissional");
            return;
          }

          // User is authenticated but has no profile
          setError("Perfil não encontrado. Por favor, finalize o registo.");
          setChecking(false);
        } else {
          setChecking(false);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setChecking(false);
      }
    };

    checkExistingSession();
  }, [router]);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess(true);
      // Clear the success message after 5 seconds
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Credenciais inválidas. Por favor, verifique o seu email e palavra-passe.");
        setLoading(false);
        return;
      }

      if (data.user) {
        const redirected = await checkUserRoleAndRedirect(data.user.id);
        
        if (!redirected) {
          // If neither profile found, show error
          setError("Perfil não encontrado. Por favor, finalize o registo.");
          setLoading(false);
        }
      }
    } catch (err) {
      setError("Ocorreu um erro. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        {checking ? (
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-yellow border-r-transparent"></div>
                <p className="text-text-primary/70">A verificar sessão...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <Sparkles className="h-8 w-8 text-primary-yellow" />
              </div>
              <CardTitle className="text-2xl font-bold text-text-primary">
                Entrar na sua conta
              </CardTitle>
              <CardDescription className="text-text-primary/70">
                Introduza o seu email e palavra-passe para continuar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {success && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                    Conta criada com sucesso! Por favor, faça login.
                  </div>
                )}
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Palavra-passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
                  disabled={loading}
                >
                  {loading ? "A entrar..." : "Entrar"}
                </Button>

                <div className="text-center text-sm text-text-primary/70">
                  Não tem conta?{" "}
                  <Link
                    href="/register"
                    className="text-primary-yellow hover:underline font-medium"
                  >
                    Registar
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}


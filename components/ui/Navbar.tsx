"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { ProfileType } from "@/types/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profileType, setProfileType] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        // Check if user is aluno
        const { data: alunoData } = await supabase
          .from("alunos")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (alunoData) {
          setProfileType("aluno");
        } else {
          // Check if user is profissional
          const { data: profissionalData } = await supabase
            .from("profissionais")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (profissionalData) {
            setProfileType("profissional");
          }
        }
      } else {
        setProfileType(null);
      }

      setLoading(false);
    }

    fetchUserProfile();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Re-fetch profile type on auth change
        const { data: alunoData } = await supabase
          .from("alunos")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (alunoData) {
          setProfileType("aluno");
        } else {
          const { data: profissionalData } = await supabase
            .from("profissionais")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (profissionalData) {
            setProfileType("profissional");
          }
        }
      } else {
        setProfileType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfileType(null);
    router.push("/");
    router.refresh();
  };

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname?.startsWith("/register");
  const isAuthPage = isLoginPage || isRegisterPage;
  const isLandingPage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary-yellow" aria-hidden="true" />
          <span className="text-xl font-bold text-text-primary">Discovery</span>
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          {/* "Voltar ao início" button - visible on auth pages */}
          {isAuthPage && (
            <Link href="/">
              <Button
                variant="outline"
                className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                aria-label="Voltar à página inicial"
              >
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Voltar ao início</span>
                <span className="sm:hidden">Início</span>
              </Button>
            </Link>
          )}
          {!loading && (
            <>
              {user && profileType && isLandingPage ? (
                // On landing page with logged in user - show Back to role + Logout
                <>
                  <Link href={profileType === "aluno" ? "/aluno" : "/profissional"}>
                    <Button
                      variant="outline"
                      className="border-primary-yellow text-text-primary hover:bg-soft-yellow"
                      aria-label={profileType === "aluno" ? "Voltar para Aluno" : "Voltar para Profissional"}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">
                        {profileType === "aluno" ? "Voltar para Aluno" : "Voltar para Profissional"}
                      </span>
                      <span className="sm:hidden">
                        {profileType === "aluno" ? "Aluno" : "Profissional"}
                      </span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-text-primary hover:bg-soft-yellow"
                    aria-label="Sair"
                  >
                    Sair
                  </Button>
                </>
              ) : user ? (
                // On other pages with logged in user - just show Logout
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-text-primary hover:bg-soft-yellow"
                  aria-label="Sair"
                >
                  Sair
                </Button>
              ) : (
                // Not logged in - show Login and Register
                <>
                  {!isLoginPage && (
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="text-text-primary hover:bg-soft-yellow"
                        aria-label="Fazer login"
                      >
                        Login
                      </Button>
                    </Link>
                  )}
                  {!isRegisterPage && (
                    <Link href="/register">
                      <Button
                        className="bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
                        aria-label="Criar conta"
                      >
                        Registar
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}


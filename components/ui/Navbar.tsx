"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname?.startsWith("/register");
  const isAuthPage = isLoginPage || isRegisterPage;

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
              {user ? (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-text-primary hover:bg-soft-yellow"
                  aria-label="Sair"
                >
                  Sair
                </Button>
              ) : (
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


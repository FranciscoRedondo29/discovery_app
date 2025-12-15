"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

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
          <Link href="/register">
            <Button 
              className="bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
              aria-label="Criar conta"
            >
              Registar
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

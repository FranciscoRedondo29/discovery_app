"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Sparkles, GraduationCap, Briefcase } from "lucide-react";
import { ProfileType } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();

  const handleProfileSelection = (profileType: ProfileType) => {
    router.push(`/register/${profileType}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary-yellow" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">
              Criar uma conta
            </h1>
            <p className="text-text-primary/70">
              Selecione o seu tipo de perfil para começar
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Aluno Card */}
            <Card
              className="cursor-pointer transition-all duration-300 hover:border-primary-yellow hover:shadow-lg group"
              onClick={() => handleProfileSelection("aluno")}
            >
              <CardHeader className="space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-soft-yellow group-hover:bg-primary-yellow/20 transition-colors">
                  <GraduationCap className="h-8 w-8 text-primary-yellow" />
                </div>
                <CardTitle className="text-2xl text-text-primary">Aluno</CardTitle>
                <CardDescription className="text-base text-text-primary/70">
                  Sou um estudante que quer melhorar as minhas competências de leitura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileSelection("aluno");
                  }}
                >
                  Selecionar Aluno
                </Button>
              </CardContent>
            </Card>

            {/* Profissional Card */}
            <Card
              className="cursor-pointer transition-all duration-300 hover:border-primary-yellow hover:shadow-lg group"
              onClick={() => handleProfileSelection("profissional")}
            >
              <CardHeader className="space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-soft-yellow group-hover:bg-primary-yellow/20 transition-colors">
                  <Briefcase className="h-8 w-8 text-primary-yellow" />
                </div>
                <CardTitle className="text-2xl text-text-primary">Profissional</CardTitle>
                <CardDescription className="text-base text-text-primary/70">
                  Sou um educador ou profissional que trabalha com estudantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileSelection("profissional");
                  }}
                >
                  Selecionar Profissional
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-text-primary/70 hover:text-primary-yellow transition-colors"
            >
              Já tem uma conta? Entrar
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}


"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Mic } from "lucide-react";

export default function PracticePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-soft-yellow flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/aluno")}
              variant="ghost"
              size="sm"
              aria-label="Voltar ao dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-text-primary">
              Escolhe o tipo de prática
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-12 flex items-center">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Escrita Option */}
          <Card 
            className="border-2 border-primary-yellow cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
            onClick={() => router.push("/aluno/practice/dictation")}
          >
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-soft-yellow">
                  <Pencil className="h-10 w-10 text-primary-yellow" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl">Escrita</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-text-primary/70">
                Ouve uma frase e escreve o que ouviste. Recebe feedback detalhado sobre cada palavra.
              </p>
            </CardContent>
          </Card>

          {/* Fala Option - Em desenvolvimento */}
          <Card 
            className="border-2 border-gray-300 opacity-60 cursor-not-allowed relative"
          >
            <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-300 rounded-full px-3 py-1">
              <span className="text-xs font-semibold text-yellow-800">Em desenvolvimento</span>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Mic className="h-10 w-10 text-gray-400" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl text-text-primary/50">Fala</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-text-primary/40">
                Lê em voz alta e recebe feedback sobre a tua pronúncia e fluência.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Info Section */}
      <footer className="bg-white border-t border-gray-200 px-4 py-6">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-text-primary/60 text-sm">
            <strong>Dica:</strong> Começa pela prática de escrita para desenvolveres as tuas competências de audição e ortografia.
          </p>
        </div>
      </footer>
    </div>
  );
}

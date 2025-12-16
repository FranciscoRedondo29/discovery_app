"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import { ProfileType, RegistrationFormData, FuncaoProfissional } from "@/types/auth";

export default function RegisterFormPage() {
  const router = useRouter();
  const params = useParams();
  const profileType = params.profileType as ProfileType;

  const [formData, setFormData] = useState<RegistrationFormData>({
    nome: "",
    email: "",
    password: "",
    escola_instituicao: "",
    ano_escolaridade: undefined,
    funcao: undefined,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Validate profile type
    if (profileType !== "aluno" && profileType !== "profissional") {
      router.push("/register");
    }
  }, [profileType, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ano_escolaridade" ? parseInt(value) || undefined : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      funcao: value as FuncaoProfissional,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.nome || formData.nome.trim().length < 2) {
      setError("Por favor, introduza o seu nome completo (mínimo 2 caracteres).");
      return false;
    }

    if (!formData.email || !formData.email.includes("@")) {
      setError("Por favor, introduza um email válido.");
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (!formData.escola_instituicao.trim()) {
      setError("Por favor, introduza o nome da escola/instituição.");
      return false;
    }

    if (profileType === "aluno") {
      const ano = formData.ano_escolaridade;
      if (!ano || ano < 1 || ano > 12) {
        setError("O ano de escolaridade deve ser entre 1 e 12.");
        return false;
      }
    }

    if (profileType === "profissional") {
      if (!formData.funcao) {
        setError("Por favor, selecione a sua função.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Este email já está registado. Por favor, faça login.");
        } else {
          setError(`Erro ao criar conta: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Erro ao criar utilizador. Por favor, tente novamente.");
        setLoading(false);
        return;
      }

      // Insert profile data into appropriate table
      if (profileType === "aluno") {
        const { error: insertError } = await supabase
          .from("alunos")
          .insert({
            id: authData.user.id,
            nome: formData.nome.trim(),
            email: formData.email,
            escola_instituicao: formData.escola_instituicao,
            ano_escolaridade: formData.ano_escolaridade,
          });

        if (insertError) {
          setError(`Erro ao guardar dados do aluno: ${insertError.message}`);
          setLoading(false);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("profissionais")
          .insert({
            id: authData.user.id,
            nome: formData.nome.trim(),
            email: formData.email,
            escola_instituicao: formData.escola_instituicao,
            funcao: formData.funcao,
          });

        if (insertError) {
          setError(`Erro ao guardar dados do profissional: ${insertError.message}`);
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch (err) {
      setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-text-primary">
                Conta criada com sucesso!
              </CardTitle>
              <CardDescription className="text-text-primary/70">
                A redirecionar para a página de login...
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Link
              href="/register"
              className="inline-flex items-center text-sm text-text-primary/70 hover:text-primary-yellow mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
            <CardTitle className="text-2xl font-bold text-text-primary">
              Criar conta - {profileType === "aluno" ? "Aluno" : "Profissional"}
            </CardTitle>
            <CardDescription className="text-text-primary/70">
              Preencha os dados para criar a sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Primeiro e último nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-text-primary/50">
                  Primeiro e Último nome
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <p className="text-xs text-text-primary/50">
                  Mínimo de 6 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escola_instituicao">Escola/Instituição</Label>
                <Input
                  id="escola_instituicao"
                  name="escola_instituicao"
                  type="text"
                  placeholder="Nome da escola ou instituição"
                  value={formData.escola_instituicao}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {profileType === "aluno" && (
                <div className="space-y-2">
                  <Label htmlFor="ano_escolaridade">Ano de Escolaridade</Label>
                  <Input
                    id="ano_escolaridade"
                    name="ano_escolaridade"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="1-12"
                    value={formData.ano_escolaridade || ""}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-text-primary/50">
                    Entre 1 e 12
                  </p>
                </div>
              )}

              {profileType === "profissional" && (
                <div className="space-y-2">
                  <Label htmlFor="funcao">Função</Label>
                  <Select
                    value={formData.funcao || ""}
                    onValueChange={handleSelectChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Psicólogo(a)">Psicólogo(a)</SelectItem>
                      <SelectItem value="Terapeuta da fala">Terapeuta da fala</SelectItem>
                      <SelectItem value="Professor(a)">Professor(a)</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
                disabled={loading}
              >
                {loading ? "A criar conta..." : "Criar Conta"}
              </Button>

              <div className="text-center text-sm text-text-primary/70">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="text-primary-yellow hover:underline font-medium"
                >
                  Entrar
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

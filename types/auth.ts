export type FuncaoProfissional = 'Psicólogo(a)' | 'Terapeuta da fala' | 'Professor(a)' | 'Outro';

export interface AlunoData {
  nome: string;
  email: string;
  escola_instituicao: string;
  ano_escolaridade: number;
}

export interface ProfissionalData {
  nome: string;
  email: string;
  escola_instituicao: string;
  funcao: FuncaoProfissional;
}

export type ProfileType = "aluno" | "profissional";

export interface RegistrationFormData {
  nome: string;
  email: string;
  password: string;
  escola_instituicao: string;
  ano_escolaridade?: number; // Only for aluno
  funcao?: FuncaoProfissional; // Only for profissional
}



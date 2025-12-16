export interface AlunoData {
  email: string;
  escola_instituicao: string;
  ano_escolaridade: number;
}

export interface ProfissionalData {
  email: string;
  escola_instituicao: string;
}

export type ProfileType = "aluno" | "profissional";

export interface RegistrationFormData {
  email: string;
  password: string;
  escola_instituicao: string;
  ano_escolaridade?: number; // Only for aluno
}


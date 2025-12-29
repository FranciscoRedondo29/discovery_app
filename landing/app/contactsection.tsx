'use client';

import { useState } from 'react';
import { supabase } from "@/lib/supabase";

export function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  
    const form = e.currentTarget; // 👈 GUARDA A REFERÊNCIA AQUI
  
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const formData = new FormData(form);
  
      const { error } = await supabase.from('Contacts').insert({
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        message: formData.get('message'),
      });
  
      if (error) {
        throw error;
      }
  
      setSuccess(true);
      form.reset(); // 👈 agora funciona sempre
    } catch (err: any) {
      console.error('Contact form error:', err);
      setError(err.message ?? 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <section id="contactos" className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl bg-amber-50/80 p-6 sm:p-8 shadow-lg ring-1 ring-black/5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-800">Nome</label>
              <input
                name="name"
                required
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="O teu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-800">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="teuemail@exemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-800">Sou</label>
            <select
              name="role"
              required
              defaultValue=""
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="" disabled>Seleciona uma opção</option>
              <option value="Aluno">Aluno</option>
              <option value="Professor">Professor</option>
              <option value="Terapeuta">Terapeuta</option>
              <option value="Psicólogo">Psicólogo</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-800">Mensagem</label>
            <textarea
              name="message"
              required
              rows={5}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Escreve aqui..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-amber-400 px-6 py-4 text-base font-semibold text-stone-900 shadow-lg hover:bg-amber-500 transition disabled:opacity-60"
          >
            {loading ? 'A enviar…' : 'Enviar mensagem'}
          </button>

          {success && (
            <p className="text-green-700 text-sm mt-2">
              Obrigado! O teu contacto foi enviado com sucesso.
            </p>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-2">
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

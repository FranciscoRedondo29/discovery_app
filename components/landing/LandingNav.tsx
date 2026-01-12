'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { LogOut, User } from 'lucide-react';

export default function LandingNav() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'aluno' | 'profissional' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user is an aluno
          const { data: alunoData } = await supabase
            .from("alunos")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (alunoData) {
            setUserRole('aluno');
            setLoading(false);
            return;
          }

          // Check if user is a profissional
          const { data: profissionalData } = await supabase
            .from("profissionais")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          if (profissionalData) {
            setUserRole('profissional');
            setLoading(false);
            return;
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error checking session:", err);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole(null);
      router.refresh();
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleGoToDashboard = () => {
    if (userRole === 'aluno') {
      router.push('/aluno');
    } else if (userRole === 'profissional') {
      router.push('/profissional');
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '10px 30px',
        margin: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: 'calc(100% - 20px)',
      }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="text-2xl font-bold flex items-center gap-2">
          <span className="text-gray-800">Discovery</span>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-8 items-center">
          {loading ? (
            <div className="h-10 w-32 animate-pulse bg-gray-200 rounded-lg" />
          ) : userRole ? (
            <div className="flex gap-3 sm:gap-4">
              <button
                onClick={handleGoToDashboard}
               className="px-8 py-3 text-lg font-bold text-white rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all duration-500 shadow-2xl hover:shadow-yellow-400/50 hover:scale-110 flex items-center gap-4"
              >
                <User className="h-4 w-4" />
                Ir para {userRole === 'aluno' ? 'Aluno' : 'Profissional'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-yellow-700 hover:text-yellow-900 transition-all duration-300 border-2 border-yellow-500 rounded-lg hover:shadow-lg hover:shadow-yellow-400/30 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          ) : (
            <div className="flex gap-3 sm:gap-4">
              <Link
                href="/login"
                className="px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-yellow-700 hover:text-yellow-900 transition-all duration-300 border-2 border-yellow-500 rounded-lg hover:shadow-lg hover:shadow-yellow-400/30"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-4 sm:px-6 py-2 text-sm sm:text-base font-semibold text-white rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-yellow-500/50 hover:scale-105 transform"
              >
                Registar-se
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

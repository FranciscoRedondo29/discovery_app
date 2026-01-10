'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface ScrollRevealElement {
  element: HTMLElement;
  triggerPoint: number;
  revealed: boolean;
}

export default function Home() {
  const [scrollRevealElements, setScrollRevealElements] = useState<ScrollRevealElement[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Initialize scroll reveal observers
  useEffect(() => {
    const observerOptions = {
      threshold:   0.1,
      rootMargin:   '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries. forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, observerOptions);

    // Observe all elements with reveal class
    const revealElements = document.querySelectorAll('.reveal-item');
    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Copy email to clipboard
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('startupdislexia@gmail. com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-yellow-50 text-gray-800 overflow-hidden pt-24">
      {/* Custom Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '10px 30px',
        margin: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: 'calc(100% - 20px)',
      }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo Section */}
          <div className="text-2xl font-bold flex items-center gap-2">
            <span className="text-gray-800">Discovery</span>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-8 items-center">
            <div className="flex gap-3 sm:gap-4">
              <Link
                href="/login"
                className="px-4 sm:px-6 py-2 text-sm sm:text-base font-medium text-yellow-700 hover:text-yellow-900 transition-all duration-300 border-2 border-yellow-500 rounded-lg hover:shadow-lg hover:shadow-yellow-400/30"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-4 sm:px-6 py-2 text-sm sm: text-base font-semibold text-white rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-yellow-500/50 hover:scale-105 transform"
              >
                Registar-se
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Main heading with professional three-line title */}
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="font-poppins leading-relaxed tracking-tight">
              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-gray-700 mb-2">
                O teu
              </span>

              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold my-3 drop-shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Companheiro de leitura
              </span>

              <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-gray-700 mt-2">
                Inteligente
              </span>
            </h1>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/register"
                className="group px-8 py-4 text-lg font-bold rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-2xl hover:shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 active:scale-95 transform inline-block text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  Começar Agora
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>

              <Link
                href="/login"
                className="group px-8 py-4 text-lg font-bold rounded-xl border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-100 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/30 inline-block text-center"
              >
                <span className="flex items-center justify-center gap-2">
                  Já Tenho Conta
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* A dislexia afeta a leitura em múltiplas dimensões Section */}
      <section
        ref={featuresRef}
        className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-yellow-50"
      >
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Main Title */}
          <div className="reveal-item text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-6 text-gray-800 leading-tight">
              A dislexia afeta a leitura em <br />
              <span className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-800 leading-tight">
                múltiplas dimensões
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mt-4">
              Compreenda os desafios que as crianças com dislexia enfrentam no seu dia a dia
            </p>
          </div>

          {/* Enhanced Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                icon: '📖',
                title: 'Dificuldades na fluência',
                description: 'Ler pode ser lento, cansativo e frustrante para alunos com dislexia.',
                color: 'from-yellow-100 to-orange-100',
                borderColor: 'border-yellow-300',
                hoverBorder: 'hover:border-orange-500',
                hoverShadow: 'hover:shadow-orange-300/50',
              },
              {
                icon: '💔',
                title: 'Impacto emocional',
                description: 'A frustração pode afetar a autoestima e a motivação para aprender.',
                color: 'from-red-100 to-pink-100',
                borderColor: 'border-red-300',
                hoverBorder: 'hover:border-red-500',
                hoverShadow: 'hover:shadow-red-300/50',
              },
              {
                icon: '🤝',
                title: 'Falta de apoio diário',
                description: 'Muitas ferramentas são isoladas ou não se adaptam às necessidades individuais.',
                color: 'from-blue-100 to-cyan-100',
                borderColor:   'border-blue-300',
                hoverBorder: 'hover:border-blue-500',
                hoverShadow: 'hover:shadow-blue-300/50',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`reveal-item group p-8 sm:p-10 rounded-3xl bg-gradient-to-br ${feature.color} border-3 ${feature.borderColor} ${feature.hoverBorder} transition-all duration-300 ${feature.hoverShadow} hover:shadow-2xl hover:-translate-y-3 transform cursor-pointer`}
              >
                {/* Icon Container */}
                <div className="mb-6 flex items-center justify-center">
                  <div className="text-6xl sm:text-7xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 transform">
                    {feature. icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-black mb-4 text-gray-800 text-center group-hover:text-gray-900 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-700 text-center group-hover:text-gray-900 transition-colors duration-300 leading-relaxed mb-6 text-base sm:text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Info Section - Enhanced */}
          <div className="mt-20 sm:mt-24">
            {/* Main Cards Section */}
            <div className="mb-16 sm:mb-20">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-12 text-gray-800">
                Como a Discovery ajuda
              </h3>

              {/* 4-Column Grid with Responsive Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {/* Card 1 - Ler com apoio */}
                <div className="reveal-item group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-yellow-100 to-orange-100 border-3 border-yellow-300 hover:border-orange-500 transition-all duration-300 hover: shadow-2xl hover:shadow-orange-300/50 hover:-translate-y-3 transform cursor-pointer">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="text-5xl sm:text-6xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 transform">
                      📖
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-lg sm:text-xl font-black text-gray-800 text-center mb-3 group-hover:text-gray-900 transition-colors duration-300">
                    Ler com apoio
                  </h4>

                  {/* Description */}
                  <p className="text-gray-700 text-center text-sm sm:text-base group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                    Ferramentas inteligentes que adaptam o conteúdo à velocidade e estilo de aprendizagem.  
                  </p>
                </div>

                {/* Card 2 - Análise automática */}
                <div className="reveal-item group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-red-100 to-pink-100 border-3 border-red-300 hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:shadow-red-300/50 hover:-translate-y-3 transform cursor-pointer">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="text-5xl sm:text-6xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 transform">
                      🔍
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-lg sm: text-xl font-black text-gray-800 text-center mb-3 group-hover:text-gray-900 transition-colors duration-300">
                    Análise automática
                  </h4>

                  {/* Description */}
                  <p className="text-gray-700 text-center text-sm sm:text-base group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                    Deteção inteligente de dificuldades e geração automática de relatórios personalizados.
                  </p>
                </div>

                {/* Card 3 - Ver progresso */}
                <div className="reveal-item group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 border-3 border-blue-300 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-300/50 hover:-translate-y-3 transform cursor-pointer">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="text-5xl sm: text-6xl group-hover: scale-125 group-hover: rotate-12 transition-all duration-300 transform">
                      📈
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-lg sm:text-xl font-black text-gray-800 text-center mb-3 group-hover:text-gray-900 transition-colors duration-300">
                    Ver progresso
                  </h4>

                  {/* Description */}
                  <p className="text-gray-700 text-center text-sm sm:text-base group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                    Acompanhe o desenvolvimento em tempo real com gráficos visuais e métricas personalizadas.
                  </p>
                </div>

                {/* Card 4 - Personalização */}
                <div className="reveal-item group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 border-3 border-purple-300 hover:border-violet-500 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-300/50 hover:-translate-y-3 transform cursor-pointer">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="text-5xl sm:text-6xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 transform">
                      ⚙️
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-lg sm:text-xl font-black text-gray-800 text-center mb-3 group-hover:text-gray-900 transition-colors duration-300">
                    Personalização
                  </h4>

                  {/* Description */}
                  <p className="text-gray-700 text-center text-sm sm:text-base group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                    Adapta-se a cada criança com ajustes personalizados para máxima eficácia.  
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-16 sm:mt-20">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-4 text-gray-800">
                Resultados Comprovados
              </h3>
              <p className="text-lg sm:text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
                Descobre como a Discovery transforma a experiência de leitura
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Stat Card 1 - Leituras Analisadas */}
                <div className="reveal-item group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-2xl blur-lg opacity-20 group-hover:opacity-35 transition-all duration-300"></div>
                  <div className="relative p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-yellow-200 to-orange-200 border-2 border-yellow-400 hover:border-orange-600 transition-all duration-300 hover:shadow-xl hover:shadow-orange-400/50 hover: scale-105 transform cursor-pointer text-center">
                    {/* Icon */}
                    <div className="mb-4 flex justify-center">
                      <div className="text-5xl sm:text-6xl group-hover:scale-120 group-hover:rotate-12 transition-all duration-300 transform">
                        ✅
                      </div>
                    </div>

                    {/* Main Number */}
                    <div className="mb-4">
                      <div className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg group-hover: scale-110 transition-transform duration-300">
                        100%
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-xl sm:text-2xl font-black text-gray-800 group-hover:text-gray-900 transition-colors duration-300 mb-2">
                      Leituras Analisadas
                    </h4>

                    {/* Description */}
                    <p className="text-gray-700 text-sm sm:text-base group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                      Todas as leituras feitas pelos alunos são analisadas pela aplicação, oferecendo feedback sobre a precisão e a velocidade da leitura.
                    </p>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-yellow-300">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        ✨ Taxa 100%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stat Card 2 - Tempo de Processamento */}
                <div className="reveal-item group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-300 to-pink-300 rounded-2xl blur-lg opacity-20 group-hover:opacity-35 transition-all duration-300"></div>
                  <div className="relative p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-pink-200 to-red-200 border-2 border-red-400 hover:border-red-600 transition-all duration-300 hover:shadow-xl hover:shadow-red-400/50 hover:scale-105 transform cursor-pointer text-center">
                    {/* Icon */}
                    <div className="mb-4 flex justify-center">
                      <div className="text-5xl sm:text-6xl group-hover:scale-120 group-hover:rotate-12 transition-all duration-300 transform">
                        ⚡
                      </div>
                    </div>

                    {/* Main Number */}
                    <div className="mb-4">
                      <div className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                        &lt;1 minuto
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-xl sm:text-2xl font-black text-gray-800 group-hover:text-gray-900 transition-colors duration-300 mb-2">
                      Tempo de Processamento
                    </h4>

                    {/* Description */}
                    <p className="text-gray-700 text-sm sm:text-base group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                      Menos de 1 minuto para gerar métricas e feedback.
                    </p>

                    {/* Additional Info */}
                    <div className="mt-4 pt-4 border-t border-red-300">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        ⚡ Ultra-rápido
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        ref={ctaRef}
        className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="reveal-item space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800">
              Vamos começar?
            </h2>

            {/* Large CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link
                href="/register"
                className="group px-10 py-5 text-lg font-bold rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-2xl hover:shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 active:scale-95 transform inline-flex items-center justify-center gap-2"
              >
                Criar Conta
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              <Link
                href="/login"
                className="group px-10 py-5 text-lg font-bold rounded-xl border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-100 transition-all duration-300 hover: shadow-lg hover:shadow-yellow-400/40 inline-flex items-center justify-center gap-2"
              >
                Entrar na Conta
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Footer - Contact Only */}
      <footer className="border-t-4 border-yellow-400 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          {/* Contact Section */}
          <div className="reveal-item text-center">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 mb-4">
              📧 Entre em Contacto
            </h3>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Tem alguma pergunta ou gostaria de saber mais sobre o Discovery?
            </p>

            {/* Email Button */}
            <button
              onClick={copyEmailToClipboard}
              className="group inline-flex items-center gap-2 px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold rounded-lg hover:shadow-lg hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 active:scale-95 transform mb-6"
              aria-label="Copiar email startupdislexia@gmail.com"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>
                {emailCopied ? '✅ Email copiado!' : 'startupdislexia@gmail. com'}
              </span>
            </button>

            {/* Divider */}
            <div className="border-t-2 border-yellow-300 pt-8 mt-8">
            </div>
          </div>
        </div>
      </footer>

      {/* Tailwind CSS animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        . font-poppins {
          font-family: 'Poppins', sans-serif;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }

        .reveal-item {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }

        .reveal-item.reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .delay-1000 {
          animation-delay:  1000ms;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width:  8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 245, 230, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background:  linear-gradient(to bottom, #fbbf24, #f97316);
          border-radius:  4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background:  linear-gradient(to bottom, #f59e0b, #ea580c);
        }
      `}</style>
    </main>
  );
}
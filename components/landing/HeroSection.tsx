'use client';

import { useRef } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
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
  );
}

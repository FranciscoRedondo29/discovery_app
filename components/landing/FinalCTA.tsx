'use client';

import { useRef } from 'react';
import Link from 'next/link';

export default function FinalCTA() {
  const ctaRef = useRef<HTMLDivElement>(null);

  return (
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
              className="group px-10 py-5 text-lg font-bold rounded-xl border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-100 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/40 inline-flex items-center justify-center gap-2"
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
  );
}

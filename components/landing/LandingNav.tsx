'use client';

import Link from 'next/link';

export default function LandingNav() {
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
        </div>
      </div>
    </nav>
  );
}

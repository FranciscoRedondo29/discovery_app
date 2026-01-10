'use client';

import { useState } from 'react';

export default function LandingFooter() {
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('startupdislexia@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
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
              {emailCopied ? '✅ Email copiado!' : 'startupdislexia@gmail.com'}
            </span>
          </button>

          {/* Divider */}
          <div className="border-t-2 border-yellow-300 pt-8 mt-8"></div>
        </div>
      </div>
    </footer>
  );
}

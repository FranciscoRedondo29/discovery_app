'use client';

import { dyslexiaChallenges } from '@/lib/landingContent';

export default function DyslexiaChallenges() {
  return (
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
        {dyslexiaChallenges.map((feature, index) => (
          <div
            key={index}
            className={`reveal-item group p-8 sm:p-10 rounded-3xl bg-gradient-to-br ${feature.color} border-3 ${feature.borderColor} ${feature.hoverBorder} transition-all duration-300 ${feature.hoverShadow} hover:shadow-2xl hover:-translate-y-3 transform cursor-pointer`}
          >
            {/* Icon Container */}
            <div className="mb-6 flex items-center justify-center">
              <div className="text-6xl sm:text-7xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 transform">
                {feature.icon}
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
    </div>
  );
}

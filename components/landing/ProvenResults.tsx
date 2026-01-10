'use client';

import { provenResults } from '@/lib/landingContent';

export default function ProvenResults() {
  return (
    <div className="mt-16 sm:mt-20">
      <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-4 text-gray-800">
        Resultados Comprovados
      </h3>
      <p className="text-lg sm:text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
        Descobre como a Discovery transforma a experiência de leitura
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {provenResults.map((stat, index) => (
          <div key={index} className="reveal-item group relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.blurColor} rounded-2xl blur-lg opacity-20 group-hover:opacity-35 transition-all duration-300`}></div>
            <div className={`relative p-6 sm:p-10 rounded-2xl bg-gradient-to-br ${stat.color} border-2 ${stat.borderColor} ${stat.hoverBorder} transition-all duration-300 hover:shadow-xl ${stat.hoverShadow} hover:scale-105 transform cursor-pointer text-center`}>
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="text-5xl sm:text-6xl group-hover:scale-120 group-hover:rotate-12 transition-all duration-300 transform">
                  {stat.icon}
                </div>
              </div>

              {/* Main Number */}
              <div className="mb-4">
                <div className="text-5xl sm:text-6xl font-black text-white group-hover:scale-110 transition-transform duration-300" style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5), 0px 0px 16px rgba(0, 0, 0, 0.4)' }}>
                  {stat.number}
                </div>
              </div>

              {/* Title */}
              <h4 className="text-xl sm:text-2xl font-black text-gray-800 group-hover:text-gray-900 transition-colors duration-300 mb-2">
                {stat.title}
              </h4>

              {/* Description */}
              <p className="text-gray-700 text-sm sm:text-base group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                {stat.description}
              </p>

              {/* Additional Info */}
              <div className={`mt-4 pt-4 border-t ${stat.borderColor}`}>
                <p className="text-xs sm:text-sm font-semibold text-gray-800">
                  {stat.additionalInfo}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

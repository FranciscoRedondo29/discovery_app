'use client';

import { discoveryFeatures } from '@/lib/landingContent';

export default function HowDiscoveryHelps() {
  return (
    <div className="mt-20 sm:mt-24">
      <div className="mb-16 sm:mb-20">
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-12 text-gray-800">
          Como a Discovery ajuda
        </h3>

        {/* 4-Column Grid with Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {discoveryFeatures.map((card, index) => (
            <div
              key={index}
              className={`reveal-item group p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${card.color} border-3 ${card.borderColor} ${card.hoverBorder} transition-all duration-300 ${card.hoverShadow} hover:shadow-2xl hover:-translate-y-3 transform cursor-pointer`}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="text-5xl sm:text-6xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 transform">
                  {card.icon}
                </div>
              </div>

              {/* Title */}
              <h4 className="text-lg sm:text-xl font-black text-gray-800 text-center mb-3 group-hover:text-gray-900 transition-colors duration-300">
                {card.title}
              </h4>

              {/* Description */}
              <p className="text-gray-700 text-center text-sm sm:text-base group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

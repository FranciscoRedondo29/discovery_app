export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-950 px-4">
      {/* Background video */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover pointer-events-none"
        src="/video/0_Children_Students_3840x2160.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* Dark overlay for contrast (dark brown vertical gradient) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#2c1b12]/55 via-[#2c1b12]/50 to-[#2c1b12]/40"
        aria-hidden="true"
      />

      {/* Smooth transition into the page background */}
      <div
        className="absolute inset-x-0 bottom-0 z-[2] h-32 sm:h-40 pointer-events-none bg-gradient-to-b from-transparent to-amber-100"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Main Headline */}
        <h1 className="mb-8 text-4xl font-extrabold leading-tight text-white opacity-0 transform translate-y-3 animate-[hero-fade-in_800ms_ease-out_200ms_forwards]">
          O teu companheiro de leitura inteligente
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl opacity-0 transform translate-y-3 animate-[hero-fade-in_800ms_ease-out_400ms_forwards]">
          Apoio para alunos com dislexia
        </p>

        {/* Primary CTA */}
        <a
          href="#contactos"
          className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-amber-400 px-8 py-4 text-lg font-semibold text-stone-900 shadow-xl shadow-black/30 opacity-0 transform translate-y-3 transition-[opacity,transform] duration-800 ease-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#2c1b12] motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.03] motion-safe:hover:bg-amber-500 motion-safe:hover:shadow-2xl active:translate-y-0 active:scale-[1.01] animate-[hero-fade-in_800ms_ease-out_600ms_forwards]"
        >
          Contacte-nos
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 opacity-0 transform translate-y-3 animate-[hero-fade-in_800ms_ease-out_800ms_forwards]">
        <svg className="w-6 h-6 text-white/70 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes hero-fade-in {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-\[hero-fade-in_800ms_ease-out_200ms_forwards\] {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .animate-\[hero-fade-in_800ms_ease-out_400ms_forwards\] {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .animate-\[hero-fade-in_800ms_ease-out_600ms_forwards\] {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .animate-\[hero-fade-in_800ms_ease-out_800ms_forwards\] {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}

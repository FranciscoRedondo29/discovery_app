'use client';

import { 
  BookOpen, 
  Mic, 
  Eye,
  TrendingUp,
  FileText,
  BarChart3,
  Users,
  Star,
  type LucideIcon,
  AlertCircle,
  Search,
  AlertTriangle,
  ArrowRight,
  Mail,
  Gauge,
  HeartCrack,
  HandHelping
} from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { ContactSection } from './contactsection';
import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const currentYear = new Date().getFullYear();
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('startupdislexia@gmail.com');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  return (
    <>
      <Navbar />
      
      <main>
        <Hero />

        {/* Seção: O desafio da leitura na dislexia */}
        <ChallengeSection />


        {/* Seção: Solution - How DIScovery Helps */}
        <SolutionsSection />

        {/* Seção: Bolhas de impacto - Nova Seção Independente */}
        <BenefitsBubblesSection />

        {/* Seção: Para quem é a DIScovery */}
        <AudienceSection />

        {/* Seção: CTA Secundário */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 sm:py-10 text-center">
            <h2 className="mx-auto max-w-4xl text-3xl sm:text-4xl lg:text-6xl font-extrabold text-stone-900 leading-tight">
              Contactos
            </h2>
            <p className="mt-4 text-lg text-stone-700 leading-relaxed">
              Vamos apoiar mais crianças a ler com confiança
            </p>
          </div>
        </section>

        {/* Seção: Contacto */}
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-stone-900/95 backdrop-blur-sm px-4 py-12 sm:px-6 lg:px-8 lg:py-16 rounded-t-3xl">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left side */}
            <div>
              <h3 className="text-2xl font-extrabold text-white mb-4">
                DIScovery
              </h3>
              <p className="text-stone-400 leading-relaxed max-w-md">
                Um companheiro de leitura inteligente, criado em Portugal, com foco na inclusão educativa.
              </p>
            </div>

            {/* Right side */}
            <div>
              <h3 className="text-xl font-extrabold text-white mb-4">
                Email
              </h3>
              <button
                onClick={copyEmailToClipboard}
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-900 rounded-sm"
                aria-label="Copiar email startupdislexia@gmail.com para área de transferência"
              >
                <Mail className="h-5 w-5" />
                {emailCopied ? 'Email copiado' : 'startupdislexia@gmail.com'}
              </button>
            </div>
          </div>

          <div className="border-t border-stone-800 mt-12 pt-8">
            <p className="text-sm text-stone-500 text-center">
              © {currentYear} DIScovery. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

// Challenge Section Component with Enhanced Animations
function ChallengeSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -100px 0px'
        }
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const challengeCards = [
    {
      icon: Gauge,
      title: 'Dificuldades na fluência',
      description: 'Ler pode ser lento, cansativo e frustrante para alunos com dislexia.',
      gradient: 'from-amber-300 via-yellow-300 to-amber-400',
      iconColor: 'text-amber-800',
      hoverBorder: 'hover:border-amber-300'
    },
    {
      icon: HeartCrack,
      title: 'Impacto emocional',
      description: 'A frustração pode afetar a autoestima e a motivação para aprender.',
      gradient: 'from-orange-300 via-amber-300 to-orange-400',
      iconColor: 'text-orange-800',
      hoverBorder: 'hover:border-orange-300'
    },
    {
      icon: HandHelping,
      title: 'Falta de apoio diário',
      description: 'Muitas ferramentas são isoladas ou não se adaptam às necessidades individuais.',
      gradient: 'from-orange-400 via-red-300 to-pink-400',
      iconColor: 'text-orange-900',
      hoverBorder: 'hover:border-orange-300'
    }
  ];

  return (
    <section id="problema" className="px-4 py-12 sm:px-6 lg:px-8">
      <style jsx>{`
        @keyframes slideUpFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes gentleFloatDelayed1 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes gentleFloatDelayed2 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .card-animate-0 {
          animation: slideUpFadeIn 800ms ease-out forwards;
          animation-delay: 0.15s;
        }

        .card-animate-1 {
          animation: slideUpFadeIn 800ms ease-out forwards;
          animation-delay: 0.35s;
        }

        .card-animate-2 {
          animation: slideUpFadeIn 800ms ease-out forwards;
          animation-delay: 0.55s;
        }

        .card-hidden {
          opacity: 0;
          transform: translateY(12px);
        }

        /* Icon float animations with offsets */
        .icon-float-0 {
          animation: gentleFloat 9s ease-in-out infinite;
          animation-delay: 0s;
        }

        .icon-float-1 {
          animation: gentleFloatDelayed1 10s ease-in-out infinite;
          animation-delay: 1s;
        }

        .icon-float-2 {
          animation: gentleFloatDelayed2 11s ease-in-out infinite;
          animation-delay: 2s;
        }

        /* Hover effect for icon containers */
        .icon-container:hover {
          transform: scale(1.03) rotate(1deg);
          transition: transform 700ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .card-animate-0,
          .card-animate-1,
          .card-animate-2 {
            animation: none;
            opacity: 1;
            transform: none;
          }

          .icon-float-0,
          .icon-float-1,
          .icon-float-2 {
            animation: none;
          }

          .icon-container:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="mb-6 text-3xl sm:text-4xl lg:text-6xl font-extrabold text-stone-900 leading-tight px-4">
            A dislexia afeta a leitura <br />
            
            em múltiplas dimensões
          </h2>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {challengeCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <article
                key={`challenge-${index}`}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className={`
                  group rounded-2xl border border-amber-200/40 bg-amber-50 p-8 sm:p-10
                  hover:bg-amber-100 hover:scale-[1.02] ${card.hoverBorder}
                  transition-[background-color,border-color,transform] duration-700 ease-out cursor-pointer
                  flex flex-col items-center text-center
                  ${visibleCards.includes(index) ? `card-animate-${index}` : 'card-hidden'}
                `}
              >
                <div className={`icon-container icon-float-${index} mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} shadow-sm transition-shadow duration-500`}>
                  <Icon 
                    className={`h-8 w-8 ${card.iconColor}`} 
                    aria-hidden="true" 
                  />
                </div>
                <h3 className="mb-4 text-2xl font-extrabold text-stone-900 leading-snug">
                  {card.title}
                </h3>
                <p className="leading-relaxed text-stone-600 text-base">
                  {card.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => (prev.includes(index) ? prev : [...prev, index]));
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -120px 0px',
        }
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  type AudienceCard = {
    icon: LucideIcon;
    title: string;
    description: string;
    bullets: readonly string[];
    surface: string;
    accent: string;
    iconColor: string;
    ring: string;
    badgeIcon?: LucideIcon;
    badgeText?: string;
  };

  const cards: AudienceCard[] = [
    {
      icon: Users,
      title: 'Profissionais de apoio educativo',
      description:
        'Uma visão clara para apoiar cada aluno com mais segurança e consistência.',
      bullets: [
        'Acompanhar o progresso com continuidade',
        'Identificar dificuldades mais cedo',
        'Apoiar decisões pedagógicas baseadas em dados',
      ],
      surface: 'from-amber-50/75 via-amber-50/55 to-orange-50/55',
      accent: 'from-orange-400 to-amber-500',
      iconColor: 'text-white',
      ring: 'ring-orange-200/60',
    },
    {
      icon: BookOpen,
      title: 'Alunos',
      description:
        'Um companheiro de leitura que reduz a pressão e aumenta a vontade de continuar.',
      bullets: [
        'Leitura com apoio quando é preciso',
        'Menos frustração no dia a dia',
        'Mais confiança e autonomia',
      ],
      surface: 'from-amber-50/75 via-orange-50/55 to-amber-50/60',
      accent: 'from-amber-500 to-orange-500',
      iconColor: 'text-white',
      ring: 'ring-amber-200/70',
    },
  ];

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 sm:py-24 lg:py-28 overflow-hidden">
      <style jsx>{`
        @keyframes audienceEnter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .audience-hidden {
          opacity: 0;
          transform: translateY(16px);
        }

        .audience-animate {
          will-change: transform, opacity;
          animation: audienceEnter 850ms ease-out forwards;
        }

        .audience-animate-0 {
          animation-delay: 0.1s;
        }
        .audience-animate-1 {
          animation-delay: 0.25s;
        }

        @media (prefers-reduced-motion: reduce) {
          .audience-hidden {
            opacity: 1;
            transform: none;
          }
          .audience-animate {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-6xl text-center mb-10">
          <h2 className="mx-auto max-w-4xl text-3xl sm:text-4xl lg:text-6xl font-extrabold text-stone-900 leading-tight">
            Para quem é a DIScovery
          </h2>
          <p className="mt-4 text-lg text-stone-700 leading-relaxed">
            Uma plataforma pensada para apoiar quem acompanha — e para dar mais confiança a quem aprende.
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {cards.map((card, index) => {
              const Icon = card.icon;
              const BadgeIcon = card.badgeIcon;
              const isVisible = visibleCards.includes(index);

              return (
                <article
                  key={`audience-${index}`}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className={`
                    group relative overflow-hidden rounded-3xl p-7 sm:p-9 shadow-md ring-1 ring-black/5
                    bg-amber-50
                    min-h-[320px]
                    transition-[box-shadow,transform] duration-700 ease-out
                    hover:shadow-xl
                    motion-safe:hover:-translate-y-1
                    ${card.ring}
                    ${isVisible ? `audience-animate audience-animate-${index}` : 'audience-hidden'}
                  `}
                >
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start gap-4">
                      <div
                        className={`
                          flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl
                          bg-gradient-to-br ${card.accent}
                          shadow-lg ring-1 ring-black/10
                          transition-transform duration-500 ease-out
                          group-hover:scale-[1.04]
                        `}
                      >
                        <Icon className={`h-6 w-6 ${card.iconColor}`} aria-hidden="true" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-tight">
                          {card.title}
                        </h3>
                        <p className="mt-2 text-base sm:text-lg text-stone-700 leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-3 text-left">
                      {card.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-stone-800">
                          <span
                            aria-hidden="true"
                            className="mt-2 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm"
                          />
                          <span className="text-base sm:text-lg leading-relaxed">{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Solutions Section Component - Simplified and Unified
function SolutionsSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const percentageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                if (!prev.includes(index)) {
                  return [...prev, index];
                }
                return prev;
              });
            }
          });
        },
        {
          threshold: 0.2,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  // Animate percentage from 0 to 100
  useEffect(() => {
    if (!percentageRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            
            // Check for reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
              // Skip animation, set to 100 immediately
              setAnimatedPercentage(100);
              return;
            }

            const duration = 3000; // 3 seconds for gentle animation
            const steps = 60;
            const increment = 100 / steps;
            const stepDuration = duration / steps;

            let currentStep = 0;

            const timer = setInterval(() => {
              currentStep++;
              const newValue = Math.min(Math.round(currentStep * increment), 100);
              setAnimatedPercentage(newValue);

              if (currentStep >= steps) {
                clearInterval(timer);
                setAnimatedPercentage(100);
              }
            }, stepDuration);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px'
      }
    );

    observer.observe(percentageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  const howItWorksSteps = [
    {
      icon: BookOpen,
      title: 'Ler com apoio',
      description: 'Leitura assistida com apoio visual e auditivo, adaptada ao ritmo do aluno.',
      gradient: 'from-amber-300 via-yellow-300 to-amber-400',
      iconColor: 'text-amber-800'
    },
    {
      icon: Search,
      title: 'Análise automática',
      description: 'A leitura e escrita são analisadas em tempo real para identificar padrões e dificuldades.',
      gradient: 'from-orange-300 via-amber-300 to-orange-400',
      iconColor: 'text-orange-800'
    },
    {
      icon: TrendingUp,
      title: 'Ver progresso',
      description: 'Métricas claras mostram a evolução ao longo do tempo.',
      gradient: 'from-orange-400 via-red-300 to-pink-400',
      iconColor: 'text-orange-900'
    }
  ];

  const impactMetrics = [
    {
      isAnimated: true,
      text: 'das leituras analisadas com sucesso na aplicação'
    },
    {
      isAnimated: false,
      number: '< 1 minuto',
      text: 'para gerar métricas e feedback'
    }
  ];


  return (
    <section id="como-funciona" className="px-4 py-12 sm:px-6 lg:px-8">
      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes gentleFloatDelayed1 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes gentleFloatDelayed2 {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes subtlePulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }

        .card-animate-0 {
          animation: slideUpFade 800ms ease-out forwards;
          animation-delay: 0.15s;
        }

        .card-animate-1 {
          animation: slideUpFade 800ms ease-out forwards;
          animation-delay: 0.35s;
        }

        .card-animate-2 {
          animation: slideUpFade 800ms ease-out forwards;
          animation-delay: 0.55s;
        }

        .card-hidden {
          opacity: 0;
          transform: translateY(12px);
        }

        .step-card:hover {
          transform: translateY(-4px);
        }

        /* Enhanced icon animations with offsets */
        .icon-float-0 {
          animation: gentleFloat 9s ease-in-out infinite;
          animation-delay: 0s;
        }

        .icon-float-1 {
          animation: gentleFloatDelayed1 10s ease-in-out infinite;
          animation-delay: 1s;
        }

        .icon-float-2 {
          animation: gentleFloatDelayed2 11s ease-in-out infinite;
          animation-delay: 2s;
        }

        /* Hover effect for icon containers */
        .icon-container:hover {
          transform: scale(1.03) rotate(1deg);
          transition: transform 700ms ease-out;
        }

        .step-indicator {
          animation: subtlePulse 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .card-animate-0,
          .card-animate-1,
          .card-animate-2 {
            animation: none;
            opacity: 1;
            transform: none;
          }

          .step-card:hover {
            transform: none;
          }

          .icon-float-0,
          .icon-float-1,
          .icon-float-2 {
            animation: none;
          }

          .icon-container:hover {
            transform: none;
          }

          .step-indicator {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="mx-auto max-w-4xl text-3xl sm:text-4xl lg:text-6xl font-extrabold text-stone-900 leading-tight">
            Companheiro inteligente para apoiar a leitura
          </h2>
        </div>

        {/* How It Works - 3 Steps */}
        <div className="mb-16">
          {/* Badge Label */}
          

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={`step-${index}`}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  className={`
                    step-card relative rounded-2xl border border-amber-200/40 bg-amber-50 p-6
                    hover:bg-amber-100 transition-[background-color,border-color,transform] duration-700 ease-out
                    ${visibleCards.includes(index) ? `card-animate-${index}` : 'card-hidden'}
                  `}
                >
                  {/* Step Number Indicator */}
                  <div className="absolute -top-3 -right-3 step-indicator">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  <div className={`icon-container icon-float-${index} mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-md hover:shadow-lg transition-shadow duration-500`}>
                    <Icon className={`h-8 w-8 ${step.iconColor}`} aria-hidden="true" />
                  </div>
                  <h4 className="mb-2 text-xl font-extrabold text-stone-900">
                    {step.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-stone-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        {/* Impact in Numbers */}
        <div>
          <div className="grid gap-8 sm:grid-cols-2 max-w-5xl mx-auto">
            {impactMetrics.map((metric, index) => {
              const cardIndex = howItWorksSteps.length + index;
              return (
                <article
                  key={`metric-${index}`}
                  ref={(el) => {
                    cardsRef.current[cardIndex] = el;
                    if (index === 0 && metric.isAnimated && el) {
                      percentageRef.current = el as HTMLDivElement;
                    }
                  }}
                  className={`
                    rounded-3xl border border-amber-200/50 bg-amber-50 p-10 sm:p-12
                    hover:bg-amber-100 hover:border-amber-200/70 transition-[background-color,border-color] duration-700 ease-out
                    ${visibleCards.includes(cardIndex) ? `card-animate-${Math.min(index, 2)}` : 'card-hidden'}
                  `}
                >
                  {metric.isAnimated ? (
                    <>
                      <div className="text-6xl sm:text-7xl lg:text-8xl font-extrabold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-6">
                        {animatedPercentage}%
                      </div>
                      <p className="text-lg sm:text-xl leading-relaxed text-stone-800 font-medium">
                        {metric.text}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-amber-600 mb-6">
                        {metric.number}
                      </div>
                      <p className="text-lg sm:text-xl leading-relaxed text-stone-800 font-medium">
                        {metric.text}
                      </p>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Benefits Bubbles Section - New Standalone Section
function BenefitsBubblesSection() {
  const [visibleBenefits, setVisibleBenefits] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  const benefitsCount = 5;

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVisibleBenefits(Array.from({ length: benefitsCount }, (_, i) => i));
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(sectionEl);

    return () => {
      observer.disconnect();
    };
  }, [benefitsCount]);

  const benefits = [
    { icon: BookOpen, text: 'Menos frustração e ansiedade ao ler', span: 'md:col-span-3' },
    { icon: Gauge, text: 'Mais confiança e autonomia', span: 'md:col-span-3' },
    { icon: HandHelping, text: 'Apoio adaptado ao ritmo de cada aluno', span: 'md:col-span-2' },
    { icon: TrendingUp, text: 'Progresso visível e motivador', span: 'md:col-span-2' },
    { icon: Eye, text: 'Uma experiência de leitura sem julgamento', span: 'md:col-span-2' },
  ];

  return (
    <section
      ref={sectionRef}
      className="px-4 py-20 sm:px-6 lg:px-8 sm:py-24 lg:py-28 overflow-hidden"
    >
      <style jsx>{`
        @keyframes benefitEnter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes softFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .benefit-hidden {
          opacity: 0;
          transform: translateY(16px);
        }

        .benefit-animate {
          will-change: transform, opacity;
          animation: benefitEnter 850ms ease-out forwards;
        }

        .benefit-animate-0 { animation-delay: 0.08s; }
        .benefit-animate-1 { animation-delay: 0.18s; }
        .benefit-animate-2 { animation-delay: 0.28s; }
        .benefit-animate-3 { animation-delay: 0.38s; }
        .benefit-animate-4 { animation-delay: 0.48s; }

        .benefit-card-float-0 {
          animation: softFloat 10s ease-in-out infinite;
          animation-delay: 0s;
        }

        .benefit-card-float-1 {
          animation: softFloat 11s ease-in-out infinite;
          animation-delay: 0.8s;
        }

        .benefit-card-float-2 {
          animation: softFloat 12s ease-in-out infinite;
          animation-delay: 1.6s;
        }

        .benefit-card-float-3 {
          animation: softFloat 13s ease-in-out infinite;
          animation-delay: 2.4s;
        }

        .benefit-card-float-4 {
          animation: softFloat 14s ease-in-out infinite;
          animation-delay: 3.2s;
        }

        @media (prefers-reduced-motion: reduce) {
          .benefit-hidden {
            opacity: 1;
            transform: none;
          }

          .benefit-animate {
            animation: none;
            opacity: 1;
            transform: none;
          }

          .benefit-card:hover {
            transform: none !important;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) !important;
          }

          .benefit-icon:hover {
            transform: none !important;
            filter: none !important;
          }

          .benefit-card-float-0,
          .benefit-card-float-1,
          .benefit-card-float-2,
          .benefit-card-float-3,
          .benefit-card-float-4 {
            animation: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-6xl text-center mb-10">
          <h2 className="mx-auto max-w-4xl text-3xl sm:text-4xl lg:text-6xl font-extrabold text-stone-900 leading-tight">
            O que muda para quem aprende
          </h2>
        </div>

        {/* Cards (2 em cima, 3 em baixo no desktop) */}
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const isVisible = visibleBenefits.includes(index);
              const isTopRow = index < 2;
              
              return (
                <article
                  key={`benefit-${index}`}
                  className={`
                    benefit-card benefit-card-float-${index}
                    group relative overflow-hidden rounded-3xl 
                    bg-amber-50
                    shadow-md ring-1 ring-amber-200/70
                    ${isTopRow ? 'p-7 sm:p-8 min-h-[132px] sm:min-h-[144px]' : 'p-5 sm:p-6 min-h-[104px] sm:min-h-[112px]'}
                    transition-[transform,box-shadow] duration-700 ease-out
                    hover:shadow-[0_12px_40px_-10px_rgba(217,119,6,0.35)]
                    motion-safe:hover:-translate-y-[3px]
                    ${benefit.span}
                    ${isVisible ? `benefit-animate benefit-animate-${index}` : 'benefit-hidden'}
                  `}
                >
                  <div className="relative flex flex-col items-center justify-center text-center gap-4">
                    <div
                      className={`
                        benefit-icon
                        flex shrink-0 items-center justify-center rounded-2xl
                        ${isTopRow ? 'h-16 w-16 sm:h-18 sm:w-18' : 'h-14 w-14 sm:h-16 sm:w-16'}
                        bg-gradient-to-br from-amber-500 to-orange-500
                        shadow-md ring-1 ring-black/10
                        transition-[transform,box-shadow] duration-500 ease-out
                        motion-safe:group-hover:scale-[1.06]
                        motion-safe:group-hover:rotate-2
                        motion-safe:group-hover:shadow-lg
                      `}
                    >
                      <Icon className={`${isTopRow ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-7 w-7 sm:h-8 sm:w-8'} text-white`} />
                    </div>
                    <p className={`${isTopRow ? 'text-base sm:text-lg' : 'text-base'} leading-snug text-stone-900 font-extrabold`}>
                      {benefit.text}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

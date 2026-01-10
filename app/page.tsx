'use client';

import { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import DyslexiaChallenges from '@/components/landing/DyslexiaChallenges';
import HowDiscoveryHelps from '@/components/landing/HowDiscoveryHelps';
import ProvenResults from '@/components/landing/ProvenResults';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Home() {
  // Initialize scroll reveal observers
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-yellow-50 text-gray-800 overflow-hidden pt-24">
      <LandingNav />
      <HeroSection />
      
      {/* A dislexia afeta a leitura em múltiplas dimensões Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-yellow-50">
        <DyslexiaChallenges />
        <HowDiscoveryHelps />
        <ProvenResults />
      </section>

      <FinalCTA />
      <LandingFooter />
    </main>
  );
}
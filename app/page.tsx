import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Mic, TrendingUp, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-yellow" aria-hidden="true" />
            <span className="text-xl font-bold text-text-primary">Discovery</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-text-primary hover:bg-soft-yellow"
              aria-label="Fazer login"
            >
              Login
            </Button>
            <Button 
              className="bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
              aria-label="Criar conta"
            >
              Registar
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-soft-yellow to-white">
          <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                    Leitura sem barreiras, aprendizagem com confiança.
                  </h1>
                  <p className="text-lg text-text-primary/90 sm:text-xl leading-relaxed">
                    O companheiro de IA que adapta textos e analisa o progresso de leitura. 
                    Otimizado para dislexia em Português.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                  <Button 
                    size="xl" 
                    className="bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold shadow-lg hover:shadow-xl transition-all"
                    aria-label="Começar a usar Discovery gratuitamente"
                  >
                    Experimentar Gratuitamente
                  </Button>
                </div>

                {/* Social Proof / Trust Indicator */}
                <div className="flex items-center gap-2 text-sm text-text-primary/70">
                  <svg 
                    className="h-5 w-5 text-primary-yellow" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <span>Sem necessidade de cartão de crédito</span>
                </div>
              </div>

              {/* Right Side - Visual Placeholder */}
              <div className="relative lg:order-last">
                <div className="aspect-square w-full max-w-lg mx-auto rounded-2xl bg-gradient-to-br from-primary-yellow/20 via-soft-yellow to-primary-yellow/10 shadow-2xl flex items-center justify-center border border-primary-yellow/20">
                  <div className="text-center space-y-4 p-8">
                    <BookOpen className="h-24 w-24 text-primary-yellow mx-auto" aria-hidden="true" />
                    <p className="text-text-primary/60 text-sm font-medium">
                      [Ilustração: Criança lendo com confiança]
                    </p>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary-yellow/10 blur-2xl" aria-hidden="true"></div>
                <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary-yellow/10 blur-3xl" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16 sm:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                Como funciona
              </h2>
              <p className="text-lg text-text-primary/70 max-w-2xl mx-auto">
                Três modos poderosos para tornar a leitura acessível e eficaz
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1: Learning Mode */}
              <Card className="group hover:border-primary-yellow/50 transition-all duration-300">
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-soft-yellow group-hover:bg-primary-yellow/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary-yellow" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-2xl">Modo Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Ouve e segue o texto com realce visual. Perfeito para absorver novos conteúdos 
                    com apoio auditivo e acompanhamento sincronizado.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card 2: Practice Mode */}
              <Card className="group hover:border-primary-yellow/50 transition-all duration-300">
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-soft-yellow group-hover:bg-primary-yellow/20 transition-colors">
                    <Mic className="h-6 w-6 text-primary-yellow" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-2xl">Modo Practice</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Lê em voz alta e recebe feedback imediato. Desenvolve confiança e fluência 
                    com correções construtivas e personalizadas.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card 3: Progress Tracking */}
              <Card className="group hover:border-primary-yellow/50 transition-all duration-300 md:col-span-2 lg:col-span-1">
                <CardHeader className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-soft-yellow group-hover:bg-primary-yellow/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-primary-yellow" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-2xl">Evolução Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Vê os erros diminuírem com dados claros. Acompanha o progresso ao longo do tempo 
                    e celebra cada conquista.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            {/* Secondary CTA */}
            <div className="mt-16 text-center">
              <Button 
                size="lg" 
                className="bg-primary-yellow text-text-primary hover:bg-primary-yellow/90 font-semibold"
                aria-label="Começar agora"
              >
                Começar Agora
              </Button>
            </div>
          </div>
        </section>

        {/* Additional Benefits Section (Optional - adds more value) */}
        <section className="bg-soft-yellow py-16 sm:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  Construído especialmente para dislexia
                </h2>
                <div className="space-y-4 text-text-primary/90">
                  <div className="flex items-start gap-3">
                    <svg className="h-6 w-6 text-primary-yellow mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg">Fontes e espaçamento otimizados para legibilidade</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="h-6 w-6 text-primary-yellow mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg">Sincronização áudio-visual para reforço multissensorial</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="h-6 w-6 text-primary-yellow mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg">Interface intuitiva sem distrações visuais</p>
                  </div>
                </div>
              </div>
              <div className="aspect-video w-full rounded-2xl bg-white shadow-xl flex items-center justify-center border border-gray-200">
                <p className="text-text-primary/40 text-sm font-medium px-4 text-center">
                  [Demo: Interface de leitura adaptada]
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-yellow" aria-hidden="true" />
                <span className="text-lg font-bold text-text-primary">Discovery</span>
              </div>
              <p className="text-sm text-text-primary/70 max-w-xs">
                Tornando a leitura acessível e confiante para todos os estudantes.
              </p>
            </div>

            {/* Links - Product */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Produto</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-text-primary/70 hover:text-primary-yellow transition-colors">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-primary/70 hover:text-primary-yellow transition-colors">
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-primary/70 hover:text-primary-yellow transition-colors">
                    Preços
                  </a>
                </li>
              </ul>
            </div>

            {/* Links - Support */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Suporte</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-text-primary/70 hover:text-primary-yellow transition-colors">
                    Centro de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-primary/70 hover:text-primary-yellow transition-colors">
                    Contacto
                  </a>
                </li>
                <li>
                  <a href="#" className="text-text-primary/70 hover:text-primary-yellow transition-colors">
                    Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-12 border-t border-gray-200 pt-8 text-center">
            <p className="text-sm text-text-primary/60">
              © {new Date().getFullYear()} Discovery. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

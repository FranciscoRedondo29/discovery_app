import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-amber-400">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Navegação principal">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-transparent">
            <BookOpen className="h-5 w-5 text-stone-900" />
          </div>
          <Link 
            href="/" 
            className="text-xl font-extrabold text-stone-900 transition-colors hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:ring-offset-amber-400 rounded-sm px-1"
          >
            <span className="text-stone-900">DIS</span><span className="text-stone-900">covery</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <a
            href="#como-funciona"
            className="text-sm font-medium text-stone-800 hover:text-stone-950 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:ring-offset-amber-400 rounded-sm px-2 py-1 hidden sm:inline-block"
          >
            Como Funciona
          </a>
          <a
            href="#contactos"
            className="text-sm font-medium text-stone-800 hover:text-stone-950 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:ring-offset-amber-400 rounded-sm px-2 py-1 hidden sm:inline-block"
          >
            Contactos
          </a>
        </div>
      </nav>
    </header>
  );
}
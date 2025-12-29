import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Script from 'next/script';


const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'DIScovery - Companheiro de Leitura Inteligente para Alunos com Dislexia',
  description: 'A DIScovery ajuda alunos a ler com mais confiança e fornece métricas claras para pais, professores e terapeutas.',
  keywords: ['dislexia', 'leitura', 'educação', 'Portugal', 'apoio escolar'],
  authors: [{ name: 'Discovery' }],
  openGraph: {
    title: 'DIScovery - Companheiro de Leitura Inteligente',
    description: 'A DIScovery ajuda alunos a ler com mais confiança e fornece métricas claras para pais, professores e terapeutas.',
    type: 'website',
    locale: 'pt_PT',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${poppins.variable}`}>
  
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="c69092ff-2e9f-4dff-8dd7-bc70b7951e4e"
      />
  
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
   
}


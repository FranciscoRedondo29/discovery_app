import { ReactNode } from 'react';

interface SectionWrapperProps {
  id?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'accent';
}

export function SectionWrapper({ 
  id, 
  children, 
  className = '', 
  variant = 'default' 
}: SectionWrapperProps) {
  const variantClasses = {
    default: 'bg-gradient-to-br from-amber-100/30 via-yellow-100/25 to-orange-100/20',
    secondary: 'bg-gradient-to-br from-amber-100/35 via-yellow-100/30 to-orange-100/25',
    accent: 'bg-gradient-to-br from-orange-200/30 via-amber-200/25 to-yellow-200/25',
  };

  return (
    <section 
      id={id} 
      className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${variantClasses[variant]} ${className} relative overflow-hidden`}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 bg-pattern opacity-30 pointer-events-none" aria-hidden="true"></div>
      
      <div className="mx-auto max-w-6xl relative z-10">
        {children}
      </div>
    </section>
  );
}


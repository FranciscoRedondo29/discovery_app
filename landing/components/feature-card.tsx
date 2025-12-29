import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="group rounded-2xl border border-amber-200/40 bg-amber-100/15 p-6 sm:p-8 shadow-none transition-colors duration-600 ease-out hover:border-orange-300 hover:bg-amber-100/20 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 focus-within:ring-offset-amber-100">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white transition-all duration-600 ease-out group-hover:scale-110 group-hover:rotate-3 shadow-lg">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="mb-3 text-xl font-extrabold text-stone-900 leading-tight">
        {title}
      </h3>
      <p className="leading-relaxed text-stone-700 text-base">
        {description}
      </p>
    </article>
  );
}


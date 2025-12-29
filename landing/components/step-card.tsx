interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex gap-4 sm:gap-6 group">
      <div className="flex-shrink-0">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
          {number}
        </div>
      </div>
      <div className="flex-1 rounded-xl p-4 bg-amber-100/15 ring-1 ring-amber-200/30 shadow-none transition-colors group-hover:bg-amber-100/20">
        <h3 className="mb-2 text-lg sm:text-xl font-extrabold text-stone-900 leading-tight">
          {title}
        </h3>
        <p className="leading-relaxed text-stone-700 text-base">
          {description}
        </p>
      </div>
    </div>
  );
}


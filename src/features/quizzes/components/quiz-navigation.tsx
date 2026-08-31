'use client';

interface QuizNavigationProps {
  total: number;
  current: number;
  // índices respondidos (tienen response no nulo)
  answered: Set<number>;
  onSelect: (index: number) => void;
}

// Matriz de números de preguntas indicando estado (actual, respondida, pendiente)
export function QuizNavigation({ total, current, answered, onSelect }: QuizNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === current;
        const isAnswered = answered.has(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`h-8 w-8 rounded-md text-xs font-semibold transition ${
              isCurrent
                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                : isAnswered
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

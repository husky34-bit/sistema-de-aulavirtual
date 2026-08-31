'use client';

export interface ClozeValue {
  text: string;
  gaps: {
    gapNumber: number;
    options: { text: string; fraction: number }[];
  }[];
}

interface ClozeEditorProps {
  value: ClozeValue;
  onChange: (v: ClozeValue) => void;
}

export function ClozeEditor({ value, onChange }: ClozeEditorProps) {
  const gapNumbers = [...value.text.matchAll(/\[\[(\d+)\]\]/g)].map((m) => Number(m[1]));
  const uniqueGaps = Array.from(new Set(gapNumbers));

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label htmlFor="cloze-text" className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Texto del Enunciado (con huecos [[1]], [[2]]...)
        </label>
        <p className="mt-0.5 text-xs text-slate-400">
          Escribe el texto de la pregunta e inserta marcas como <code className="text-blue-600 font-semibold">[[1]]</code> donde quieras que aparezca una lista desplegable.
        </p>
        <textarea
          id="cloze-text"
          value={value.text}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          rows={4}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          placeholder="La capital de Francia es [[1]] y la capital de España es [[2]]."
        />
      </div>

      {uniqueGaps.length > 0 && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Configuración de Opciones por Hueco
          </h4>

          {uniqueGaps.map((num) => {
            const gap = value.gaps.find((g) => g.gapNumber === num) ?? {
              gapNumber: num,
              options: [
                { text: '', fraction: 1 },
                { text: '', fraction: 0 },
              ],
            };

            return (
              <div key={num} className="rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-[10px] text-white">
                    {num}
                  </span>
                  Opciones para el Hueco [[{num}]]
                </p>

                <div className="mt-3 space-y-2">
                  {gap.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={opt.text}
                        placeholder={`Opción ${i + 1}`}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                        onChange={(e) => {
                          const gaps = value.gaps.filter((g) => g.gapNumber !== num);
                          const updated = {
                            ...gap,
                            options: gap.options.map((o, j) =>
                              j === i ? { ...o, text: e.target.value } : o
                            ),
                          };
                          onChange({ ...value, gaps: [...gaps, updated] });
                        }}
                      />
                      <select
                        value={opt.fraction}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                        onChange={(e) => {
                          const gaps = value.gaps.filter((g) => g.gapNumber !== num);
                          const updated = {
                            ...gap,
                            options: gap.options.map((o, j) =>
                              j === i ? { ...o, fraction: Number(e.target.value) } : o
                            ),
                          };
                          onChange({ ...value, gaps: [...gaps, updated] });
                        }}
                      >
                        <option value={1}>Correcta (100%)</option>
                        <option value={0}>Incorrecta (0%)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

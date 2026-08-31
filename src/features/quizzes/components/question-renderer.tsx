'use client';

import type { QuestionData } from '@/features/questions/schemas/question.schema';
import type { QuestionResponse, GradeResult } from '@/features/questions/types/question.types';
import { interpolateText } from '@/features/questions/services/calculated-datasets';

interface QuestionRendererProps {
  data: QuestionData;
  text: string;
  // valores del dataset calculado para este intento (para interpolar {var})
  datasetValues?: Record<string, number>;
  response: QuestionResponse | null;
  onChange?: (response: QuestionResponse) => void;
  readOnly?: boolean;
  gradeResult?: GradeResult | null;
  // puntaje obtenido (modo revisión)
  score?: number | null;
  // puntaje máximo de la pregunta (modo revisión)
  maxScore?: number | null;
}

export function QuestionRenderer({
  data,
  text,
  datasetValues,
  response,
  onChange,
  readOnly = false,
  gradeResult,
  score,
  maxScore,
}: QuestionRendererProps) {
  // Interpolar variables calculadas en el enunciado
  const displayText =
    data.type === 'calculated'
      ? interpolateText(text, { datasetValues: datasetValues ?? {} })
      : text;

  return (
    <div className="space-y-3">
      <p className="whitespace-pre-wrap text-slate-800 font-medium">{displayText}</p>

      {renderInput()}

      {readOnly && gradeResult && (
        <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">
              {gradeResult.correct ? '✓ Correcta' : gradeResult.fraction > 0 ? '○ Parcial' : '✗ Incorrecta'}
            </span>
            <span className="text-slate-600">
              {score ?? gradeResult.score} / {maxScore ?? gradeResult.score} pts
            </span>
          </div>
          {gradeResult.feedback && (
            <p className="mt-1 text-slate-600 text-xs">{gradeResult.feedback}</p>
          )}
          {gradeResult.needsManualGrading && (
            <p className="mt-1 text-amber-600 text-xs font-medium">Pendiente de calificación manual</p>
          )}
        </div>
      )}
    </div>
  );

  function renderInput() {
    switch (data.type) {
      case 'multichoice':
        return renderMultichoice();
      case 'truefalse':
        return renderTrueFalse();
      case 'shortanswer':
        return renderShortanswer();
      case 'numerical':
        return renderNumerical();
      case 'calculated':
        return renderCalculated();
      case 'essay':
        return renderEssay();
      case 'ordering':
        return renderOrdering();
      case 'match':
        return renderMatch();
      case 'gapselect':
      case 'multianswer':
        return renderGaps();
      case 'ddimageortext':
      case 'ddmarker':
      case 'ddwtos':
        return renderDragdrop();
      default:
        return <p className="text-xs text-slate-500">Tipo no renderizable</p>;
    }
  }

  function renderMultichoice() {
    if (data.type !== 'multichoice') return null;
    const selected = response?.kind === 'choice' ? new Set(response.selected) : new Set<number>();

    const toggle = (idx: number) => {
      if (!onChange) return;
      if (data.single) {
        onChange({ kind: 'choice', selected: [idx] });
      } else {
        const next = new Set(selected);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        onChange({ kind: 'choice', selected: [...next] });
      }
    };

    return (
      <div className="space-y-2">
        {data.options.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm transition ${
              selected.has(i)
                ? 'border-blue-400 bg-blue-50'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <input
              type={data.single ? 'radio' : 'checkbox'}
              checked={selected.has(i)}
              onChange={() => !readOnly && toggle(i)}
              disabled={readOnly}
              className="h-4 w-4"
            />
            <span className="text-slate-700">{opt.text}</span>
          </label>
        ))}
      </div>
    );
  }

  function renderTrueFalse() {
    if (data.type !== 'truefalse') return null;
    const value = response?.kind === 'boolean' ? response.value : null;

    return (
      <div className="flex gap-3">
        {[true, false].map((v) => (
          <label
            key={String(v)}
            className={`flex-1 rounded-lg border p-3 text-center text-sm transition ${
              value === v
                ? 'border-blue-400 bg-blue-50 font-medium text-blue-700'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <input
              type="radio"
              name={`tf-${data.type}`}
              checked={value === v}
              onChange={() => onChange?.({ kind: 'boolean', value: v })}
              disabled={readOnly}
              className="hidden"
            />
            {v ? 'Verdadero' : 'Falso'}
          </label>
        ))}
      </div>
    );
  }

  function renderShortanswer() {
    const value = response?.kind === 'text' ? response.value : '';
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.({ kind: 'text', value: e.target.value })}
        disabled={readOnly}
        placeholder="Escribe tu respuesta..."
        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
      />
    );
  }

  function renderNumerical() {
    const value = response?.kind === 'number' ? response.value : '';
    return (
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) =>
          onChange?.({ kind: 'number', value: Number(e.target.value) })
        }
        disabled={readOnly}
        placeholder="0"
        className="w-48 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
      />
    );
  }

  function renderCalculated() {
    if (data.type !== 'calculated') return null;
    const value = response?.kind === 'number' ? response.value : '';
    return (
      <div className="space-y-1">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) =>
            onChange?.({ kind: 'number', value: Number(e.target.value) })
          }
          disabled={readOnly}
          placeholder="Resultado"
          className="w-48 rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
        />
      </div>
    );
  }

  function renderEssay() {
    if (data.type !== 'essay') return null;
    const value = response?.kind === 'essay' ? response.value : '';
    return (
      <div className="space-y-1">
        <textarea
          value={value}
          onChange={(e) => onChange?.({ kind: 'essay', value: e.target.value })}
          disabled={readOnly}
          rows={6}
          placeholder="Redacta tu respuesta..."
          className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
        />
        {data.minWords > 0 && (
          <p className="text-xs text-slate-500">Mínimo {data.minWords} palabras</p>
        )}
      </div>
    );
  }

  function renderOrdering() {
    if (data.type !== 'ordering') return null;
    // En modo interactivo mostramos el orden actual del estudiante; el orden
    // correcto es el de data.items (índice 0 = primero). El estudiante reordena
    // subiendo/bajando elementos. positions[i] = índice original del elemento
    // colocado en la posición i.
    const positions: number[] =
      response?.kind === 'order' && response.positions.length === data.items.length
        ? response.positions
        : data.items.map((_, i) => i);

    const move = (from: number, dir: -1 | 1) => {
      if (!onChange) return;
      const to = from + dir;
      if (to < 0 || to >= positions.length) return;
      const next = [...positions];
      [next[from], next[to]] = [next[to], next[from]];
      onChange({ kind: 'order', positions: next });
    };

    return (
      <div className="space-y-2">
        {positions.map((origIdx, pos) => (
          <div
            key={origIdx}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {pos + 1}
            </span>
            <span className="flex-1 text-slate-700">{data.items[origIdx]}</span>
            {!readOnly && (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => move(pos, -1)}
                  disabled={pos === 0}
                  className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(pos, 1)}
                  disabled={pos === positions.length - 1}
                  className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderMatch() {
    if (data.type !== 'match') return null;
    // assignments: leftIdx → rightIdx (índice en la lista barajada de right).
    // Aquí mostramos los pares en su orden original y un select con las
    // opciones de la derecha (barajadas) para cada concepto de la izquierda.
    const assignments: Record<number, number> =
      response?.kind === 'pairs' ? response.assignments : {};

    const rightOptions = data.pairs.map((p) => p.right);

    const assign = (leftIdx: number, rightValue: string) => {
      if (!onChange) return;
      const rightIdx = rightOptions.indexOf(rightValue);
      onChange({ kind: 'pairs', assignments: { ...assignments, [leftIdx]: rightIdx } });
    };

    return (
      <div className="space-y-2">
        {data.pairs.map((pair, leftIdx) => (
          <div key={leftIdx} className="flex items-center gap-3 text-sm">
            <span className="flex-1 text-slate-700">{pair.left}</span>
            <span className="text-slate-400">→</span>
            <select
              value={assignments[leftIdx] !== undefined ? rightOptions[assignments[leftIdx]] : ''}
              onChange={(e) => assign(leftIdx, e.target.value)}
              disabled={readOnly}
              className="flex-1 rounded-lg border border-slate-300 bg-white p-2 text-sm"
            >
              <option value="">—</option>
              {rightOptions.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  function renderGaps() {
    if (data.type !== 'gapselect' && data.type !== 'multianswer') return null;
    const answers: Record<number, string> =
      response?.kind === 'gaps' ? response.answers : {};

    return (
      <div className="space-y-3">
        {data.gaps.map((gap) => (
          <div key={gap.gapNumber} className="text-sm">
            <span className="mr-2 font-medium text-slate-600">
              Hueco {gap.gapNumber}:
            </span>
            <select
              value={answers[gap.gapNumber] ?? ''}
              onChange={(e) =>
                onChange?.({
                  kind: 'gaps',
                  answers: { ...answers, [gap.gapNumber]: e.target.value },
                })
              }
              disabled={readOnly}
              className="rounded border border-slate-300 bg-white p-1.5 text-sm"
            >
              <option value="">—</option>
              {gap.options.map((o, i) => (
                <option key={i} value={o.text}>
                  {o.text}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  function renderDragdrop() {
    if (
      data.type !== 'ddimageortext' &&
      data.type !== 'ddmarker' &&
      data.type !== 'ddwtos'
    )
      return null;
    // Versión simplificada: lista de items y, para cada uno, un select con las
    // zonas disponibles. El grader espera placements: Record<zoneId, itemId[]>.
    const placements: Record<string, string[]> =
      response?.kind === 'zones' ? response.placements : {};

    const setItemZone = (itemId: string, zoneId: string) => {
      if (!onChange) return;
      const next: Record<string, string[]> = {};
      for (const z of data.zones) {
        next[z.id] = (placements[z.id] ?? []).filter((id) => id !== itemId);
      }
      if (zoneId) {
        next[zoneId] = [...(next[zoneId] ?? []), itemId];
      }
      onChange({ kind: 'zones', placements: next });
    };

    const currentZoneOf = (itemId: string): string => {
      for (const z of data.zones) {
        if ((placements[z.id] ?? []).includes(itemId)) return z.id;
      }
      return '';
    };

    return (
      <div className="space-y-2">
        {data.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <span className="flex-1 text-slate-700">{item.text}</span>
            <span className="text-slate-400">→</span>
            <select
              value={currentZoneOf(item.id)}
              onChange={(e) => setItemZone(item.id, e.target.value)}
              disabled={readOnly}
              className="rounded border border-slate-300 bg-white p-1.5 text-sm"
            >
              <option value="">— Sin zona —</option>
              {data.zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }
}

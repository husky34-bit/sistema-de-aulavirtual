'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createQuestion } from '../actions/create-question';

const TYPES = [
  { value: 'multichoice', label: 'Opción múltiple' },
  { value: 'truefalse', label: 'Verdadero/Falso' },
  { value: 'shortanswer', label: 'Respuesta corta' },
  { value: 'numerical', label: 'Numérica' },
  { value: 'essay', label: 'Ensayo' },
  { value: 'match', label: 'Emparejamiento' },
  { value: 'ordering', label: 'Ordenamiento' },
  { value: 'calculated', label: 'Calculada' },
  { value: 'gapselect', label: 'Selección en huecos (editor JSON)' },
  { value: 'ddimageortext', label: 'Drag & drop (editor JSON)' },
] as const;

interface Props {
  courseId: string;
  categories: { id: string; name: string }[];
}

export function NewQuestionForm({ courseId, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<string>('multichoice');
  const [error, setError] = useState<string | null>(null);

  // estado por tipo
  const [options, setOptions] = useState([
    { text: 'Opción A', fraction: 1, feedback: 'Correcto' },
    { text: 'Opción B', fraction: 0, feedback: 'Incorrecto' },
  ]);
  const [correctTF, setCorrectTF] = useState(true);
  const [acceptedAnswers, setAcceptedAnswers] = useState('París');
  const [numAnswer, setNumAnswer] = useState('3.14');
  const [numTolerance, setNumTolerance] = useState('0.01');
  const [calcFormula, setCalcFormula] = useState('{a} + {b}');
  const [calcTolerance, setCalcTolerance] = useState('0.01');
  const [pairs, setPairs] = useState([
    { left: 'España', right: 'Madrid' },
    { left: 'Francia', right: 'París' },
  ]);
  const [orderItems, setOrderItems] = useState('Primero\nSegundo\nTercero');
  const [jsonData, setJsonData] = useState(
    JSON.stringify(
      {
        type: 'calculated',
        formula: '{a} + {b}',
        tolerance: 0.01,
        variables: [
          { name: 'a', min: 1, max: 10, decimals: 0 },
          { name: 'b', min: 1, max: 10, decimals: 0 },
        ],
      },
      null,
      2
    )
  );

  const isJsonType = ['gapselect', 'multianswer', 'ddimageortext', 'ddmarker', 'ddwtos'].includes(type);

  function buildData(): unknown {
    switch (type) {
      case 'multichoice':
        return {
          type,
          single: true,
          shuffle: true,
          options: options.filter((o) => o.text.trim()),
        };
      case 'truefalse':
        return {
          type,
          correctAnswer: correctTF,
          feedbackTrue: '¡Correcto!',
          feedbackFalse: 'Incorrecto',
        };
      case 'shortanswer':
        return {
          type,
          caseSensitive: false,
          answers: acceptedAnswers
            .split('\n')
            .filter(Boolean)
            .map((text) => ({ text: text.trim(), fraction: 1 })),
        };
      case 'numerical':
        return {
          type,
          answer: Number(numAnswer),
          tolerance: Number(numTolerance),
        };
      case 'calculated':
        return {
          type: 'calculated',
          formula: calcFormula,
          tolerance: Number(calcTolerance),
          variables: [
            { name: 'a', min: 1, max: 10, decimals: 0 },
            { name: 'b', min: 1, max: 10, decimals: 0 },
          ],
        };
      case 'essay':
        return { type, minWords: 0, allowAttachments: false };
      case 'match':
        return {
          type,
          shuffle: true,
          pairs: pairs.filter((p) => p.left && p.right),
          distractors: [],
        };
      case 'ordering':
        return {
          type,
          items: orderItems.split('\n').map((s) => s.trim()).filter(Boolean),
        };
      default:
        return JSON.parse(jsonData); // editor JSON para tipos complejos
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    let data: unknown;
    try {
      data = buildData();
    } catch {
      setError('El JSON del editor no es válido');
      return;
    }

    startTransition(async () => {
      const result = await createQuestion({
        name: form.get('name'),
        text: form.get('text'),
        defaultScore: Number(form.get('defaultScore') || 1),
        categoryId: form.get('categoryId'),
        data,
      });

      if (result.success) {
        router.push(`/dashboard/courses/${courseId}/questions`);
        router.refresh();
      } else {
        setError(JSON.stringify(result.errors ?? result.error));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700">Tipo de pregunta</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre interno</label>
          <input
            name="name"
            required
            placeholder="MQ-001"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Puntaje por defecto</label>
          <input
            name="defaultScore"
            type="number"
            step="0.5"
            min="0.5"
            defaultValue="1"
            className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Categoría</label>
        <select
          name="categoryId"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Enunciado</label>
        <textarea
          name="text"
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
          placeholder={type === 'calculated' ? '¿Cuánto es {a} + {b}?' : 'Escribe el enunciado de la pregunta...'}
        />
      </div>

      {/* ---- Sub-formularios por tipo ---- */}

      {type === 'multichoice' && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-4 border border-slate-200">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Opciones de respuesta
          </label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={opt.text}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = { ...opt, text: e.target.value };
                  setOptions(next);
                }}
                placeholder={`Opción ${i + 1}`}
                className="flex-1 rounded border border-slate-300 bg-white p-2 text-sm"
              />
              <select
                value={opt.fraction}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = { ...opt, fraction: Number(e.target.value) };
                  setOptions(next);
                }}
                className="rounded border border-slate-300 bg-white p-2 text-sm"
              >
                <option value={1}>Correcta (100%)</option>
                <option value={0}>Incorrecta (0%)</option>
                <option value={0.5}>Parcial (50%)</option>
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setOptions([...options, { text: '', fraction: 0, feedback: '' }])}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 pt-1"
          >
            + Agregar otra opción
          </button>
        </div>
      )}

      {type === 'truefalse' && (
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Respuesta correcta
          </label>
          <select
            value={String(correctTF)}
            onChange={(e) => setCorrectTF(e.target.value === 'true')}
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
          >
            <option value="true">Verdadero</option>
            <option value="false">Falso</option>
          </select>
        </div>
      )}

      {type === 'shortanswer' && (
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Respuestas aceptadas (una por línea, * = comodín)
          </label>
          <textarea
            value={acceptedAnswers}
            onChange={(e) => setAcceptedAnswers(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
          />
        </div>
      )}

      {type === 'numerical' && (
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Respuesta correcta
            </label>
            <input
              value={numAnswer}
              onChange={(e) => setNumAnswer(e.target.value)}
              type="number"
              step="any"
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Tolerancia (±)
            </label>
            <input
              value={numTolerance}
              onChange={(e) => setNumTolerance(e.target.value)}
              type="number"
              step="any"
              min="0"
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            />
          </div>
        </div>
      )}

      {type === 'calculated' && (
        <div className="space-y-3 rounded-lg bg-slate-50 p-4 border border-slate-200">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Fórmula de respuesta (usa variables como &#123;a&#125;, &#123;b&#125;)
            </label>
            <input
              value={calcFormula}
              onChange={(e) => setCalcFormula(e.target.value)}
              placeholder="{a} + {b} * 2"
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Tolerancia
            </label>
            <input
              value={calcTolerance}
              onChange={(e) => setCalcTolerance(e.target.value)}
              type="number"
              step="any"
              className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
            />
          </div>
        </div>
      )}

      {type === 'match' && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-4 border border-slate-200">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Pares (concepto → pareja)
          </label>
          {pairs.map((pair, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={pair.left}
                placeholder="Concepto"
                onChange={(e) => {
                  const next = [...pairs];
                  next[i] = { ...pair, left: e.target.value };
                  setPairs(next);
                }}
                className="flex-1 rounded border border-slate-300 bg-white p-2 text-sm"
              />
              <input
                value={pair.right}
                placeholder="Pareja"
                onChange={(e) => {
                  const next = [...pairs];
                  next[i] = { ...pair, right: e.target.value };
                  setPairs(next);
                }}
                className="flex-1 rounded border border-slate-300 bg-white p-2 text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setPairs([...pairs, { left: '', right: '' }])}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            + Agregar par
          </button>
        </div>
      )}

      {type === 'ordering' && (
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Elementos en orden correcto (uno por línea)
          </label>
          <textarea
            value={orderItems}
            onChange={(e) => setOrderItems(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm"
          />
        </div>
      )}

      {isJsonType && (
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Datos del tipo (JSON — validado por Zod)
          </label>
          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-mono text-xs"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 p-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {isPending ? 'Guardando pregunta...' : 'Crear pregunta'}
      </button>
    </form>
  );
}

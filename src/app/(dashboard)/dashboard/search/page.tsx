'use client';

import { useState, useTransition, useEffect } from 'react';
import { globalSearch, SearchResultItem } from '@/features/search/actions/global-search';
import Link from 'next/link';
import { SearchIcon, BookOpenIcon, FileTextIcon, MessageSquareIcon, FilterIcon } from '@/components/Icons';

const AREAS = [
  { id: 'all', label: 'Todas las áreas' },
  { id: 'ciberseguridad', label: '🛡️ Ciberseguridad' },
  { id: 'cloud', label: '☁️ Cloud & AWS' },
  { id: 'bim', label: '📐 BIM & Arquitectura' },
  { id: 'pmp', label: '📊 Gestión PMP®' },
  { id: 'bi', label: '📈 Power BI & Analytics' },
];

const MODALITIES = [
  { id: 'all', label: 'Todas las modalidades' },
  { id: 'live', label: 'Virtual en Vivo' },
  { id: 'async', label: 'A tu Ritmo' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'course' | 'page' | 'forum'>('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedModality, setSelectedModality] = useState('all');
  const [isPending, startTransition] = useTransition();

  function executeSearch(searchQuery: string, area: string, modality: string) {
    startTransition(async () => {
      const res = await globalSearch(searchQuery, {
        area: area !== 'all' ? area : undefined,
        modality: modality !== 'all' ? modality : undefined,
      });
      if (res.success) {
        setResults(res.data);
      }
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    executeSearch(query, selectedArea, selectedModality);
  }

  function handleAreaChange(area: string) {
    setSelectedArea(area);
    executeSearch(query, area, selectedModality);
  }

  function handleModalityChange(modality: string) {
    setSelectedModality(modality);
    executeSearch(query, selectedArea, modality);
  }

  // Cargar catálogo inicial
  useEffect(() => {
    executeSearch('', 'all', 'all');
  }, []);

  const filteredResults = filterType === 'all'
    ? results
    : results.filter((r) => r.entityType === filterType);

  return (
    <div className="space-y-8 font-poppins">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00155C] via-[#002147] to-[#0A1A3A] p-8 text-white shadow-xl shadow-[#00155C]/20 ring-1 ring-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-56 w-56 rounded-full bg-[#026BCA]/20 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00BCE4]/15 px-3.5 py-1 text-xs font-bold text-[#00BCE4] ring-1 ring-[#00BCE4]/30 backdrop-blur-sm">
            <SearchIcon size={14} className="shrink-0" /> CATÁLOGO & BUSCADOR INTELIGENTE
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
            Explora los Programas de Grupo Cognos
          </h1>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed font-normal">
            Encuentra certificaciones internacionales, clases en vivo, material de estudio y foros especializados.
          </p>
        </div>

        {/* Search Bar inside Hero */}
        <form onSubmit={handleSearch} className="relative z-10 mt-6 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por certificación, herramienta (PMP, AWS, Revit, CEH, Power BI) o tema..."
              className="w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-300 focus:bg-white/20 focus:text-white focus:placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-[#00BCE4]/40 shadow-lg backdrop-blur-md transition-all"
            />
            <SearchIcon size={16} className="absolute left-4 top-3.5 text-slate-300" />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#026BCA]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isPending ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Filtros Inteligentes por Área de Conocimiento */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#00155C]">
          <FilterIcon size={14} className="text-[#026BCA]" />
          <span>Filtrar por Área de Especialización:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((area) => {
            const isSelected = selectedArea === area.id;
            return (
              <button
                key={area.id}
                onClick={() => handleAreaChange(area.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#00155C] text-white shadow-md shadow-[#00155C]/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#026BCA] hover:text-[#00155C]'
                }`}
              >
                {area.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtro por Modalidad y Tipo de Contenido */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Modalidad:</span>
          {MODALITIES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => handleModalityChange(mod.id)}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                selectedModality === mod.id
                  ? 'bg-[#EDF6FF] text-[#00155C] font-bold ring-1 ring-[#00155C]/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mod.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Tipo:</span>
          {(['all', 'course', 'page', 'forum'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                filterType === type
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {type === 'all' && `Todos (${results.length})`}
              {type === 'course' && `Cursos (${results.filter((r) => r.entityType === 'course').length})`}
              {type === 'page' && `Páginas (${results.filter((r) => r.entityType === 'page').length})`}
              {type === 'forum' && `Foros (${results.filter((r) => r.entityType === 'forum').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF6FF] text-[#00155C]">
              <SearchIcon size={28} />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#00155C]">No se encontraron resultados</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Prueba cambiando los filtros de área o buscando términos como &quot;PMP&quot;, &quot;AWS&quot;, &quot;Revit&quot;, &quot;CEH&quot; o &quot;Power BI&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDF6FF] text-[#00155C]">
                        {item.entityType === 'course' && <BookOpenIcon size={15} />}
                        {item.entityType === 'page' && <FileTextIcon size={15} />}
                        {item.entityType === 'forum' && <MessageSquareIcon size={15} />}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#026BCA]">
                        {item.entityType === 'course' && 'Programa Oficial'}
                        {item.entityType === 'page' && 'Material de Estudio'}
                        {item.entityType === 'forum' && 'Foro de Debate'}
                      </span>
                    </div>

                    {item.modality === 'live' && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                        Virtual en Vivo
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-[#00155C] group-hover:text-[#026BCA] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {item.snippet && (
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {item.snippet}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {item.area ? (
                    <span className="text-[10px] font-bold text-slate-400 capitalize">
                      {item.area}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Grupo Cognos</span>
                  )}
                  <span className="font-bold text-[#026BCA] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Acceder →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

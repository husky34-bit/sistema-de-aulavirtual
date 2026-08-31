'use client';

import { useState } from 'react';

export interface DropZone {
  id: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  label?: string;
}

export interface DraggableItem {
  id: string;
  text: string;
  correctZoneId: string;
}

interface DragDropImageEditorProps {
  imageUrl: string;
  zones: DropZone[];
  items: DraggableItem[];
  onChange: (data: { zones: DropZone[]; items: DraggableItem[] }) => void;
}

export function DragDropImageEditor({
  imageUrl,
  zones,
  items,
  onChange,
}: DragDropImageEditorProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newZone: DropZone = {
      id: `zone_${Date.now()}`,
      xPercent: Math.round(x),
      yPercent: Math.round(y),
      widthPercent: 20,
      heightPercent: 12,
      label: `Zona ${zones.length + 1}`,
    };

    onChange({
      zones: [...zones, newZone],
      items,
    });
  }

  function addItem() {
    const newItem: DraggableItem = {
      id: `item_${Date.now()}`,
      text: `Elemento ${items.length + 1}`,
      correctZoneId: zones[0]?.id ?? '',
    };
    onChange({
      zones,
      items: [...items, newItem],
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Zonas de Caída sobre la Imagen
          </h4>
          <p className="text-xs text-slate-400">
            Haz clic sobre la imagen para agregar una nueva zona receptora
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
        >
          + Agregar Elemento Arrastrable
        </button>
      </div>

      {/* Visor interactivo */}
      <div
        onClick={handleImageClick}
        className="relative min-h-[300px] w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-100 cursor-crosshair flex items-center justify-center"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Base para zonas" className="w-full object-contain" />
        ) : (
          <p className="text-xs text-slate-400">Sin imagen de fondo configurada</p>
        )}

        {zones.map((z) => (
          <div
            key={z.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZoneId(z.id);
            }}
            style={{
              left: `${z.xPercent}%`,
              top: `${z.yPercent}%`,
              width: `${z.widthPercent}%`,
              height: `${z.heightPercent}%`,
            }}
            className={`absolute flex items-center justify-center rounded-lg border-2 text-[10px] font-bold transition ${
              selectedZoneId === z.id
                ? 'border-blue-600 bg-blue-500/30 text-blue-900'
                : 'border-dashed border-slate-700 bg-black/20 text-white backdrop-blur-[2px]'
            }`}
          >
            {z.label ?? z.id}
          </div>
        ))}
      </div>

      {/* Lista de elementos */}
      {items.length > 0 && (
        <div className="border-t border-slate-100 pt-3 space-y-2">
          <h5 className="text-xs font-semibold text-slate-700">Asociación de Elementos a Zonas:</h5>
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                value={item.text}
                onChange={(e) => {
                  const updated = items.map((it, i) =>
                    i === idx ? { ...it, text: e.target.value } : it
                  );
                  onChange({ zones, items: updated });
                }}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-900"
                placeholder="Texto del elemento"
              />
              <select
                value={item.correctZoneId}
                onChange={(e) => {
                  const updated = items.map((it, i) =>
                    i === idx ? { ...it, correctZoneId: e.target.value } : it
                  );
                  onChange({ zones, items: updated });
                }}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700"
              >
                <option value="">Selecciona zona correcta...</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label ?? z.id}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

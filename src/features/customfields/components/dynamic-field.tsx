'use client';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  label: string;
  fieldType: string; // 'text' | 'textarea' | 'date' | 'select' | 'checkbox'
  options?: string[];
  required?: boolean;
}

interface DynamicFieldProps {
  field: CustomFieldDefinition;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function DynamicField({ field, value, onChange, disabled }: DynamicFieldProps) {
  const { name, label, fieldType, options = [], required } = field;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {fieldType === 'text' && (
        <input
          id={name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        />
      )}

      {fieldType === 'textarea' && (
        <textarea
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          rows={3}
          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        />
      )}

      {fieldType === 'date' && (
        <input
          id={name}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        />
      )}

      {fieldType === 'select' && (
        <select
          id={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="">-- Seleccionar --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {fieldType === 'checkbox' && (
        <div className="flex items-center gap-2">
          <input
            id={name}
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            disabled={disabled}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-600">Activo / Confirmado</span>
        </div>
      )}
    </div>
  );
}

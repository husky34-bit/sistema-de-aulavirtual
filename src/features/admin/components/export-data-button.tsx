'use client';

interface ExportDataButtonProps {
  data: unknown;
  userName: string;
}

export function ExportDataButton({ data, userName }: ExportDataButtonProps) {
  function handleDownload() {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mis-datos-${userName.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      ↓ Descargar mis datos (JSON)
    </button>
  );
}

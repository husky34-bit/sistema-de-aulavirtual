"use client";

import { useState, useTransition, useRef } from "react";
import { updateProfileName, updateProfileAvatar, removeProfileAvatar } from "../actions/update-profile";
import { CheckCircleIcon } from "@/components/Icons";
import { useRouter } from "next/navigation";

export function EditProfileNameForm({
  initialName,
  email,
  roleLabel,
  currentImage,
}: {
  initialName: string;
  email: string;
  roleLabel: string;
  currentImage?: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState<string | null>(currentImage ?? null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = name || email.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    startTransition(async () => {
      const res = await updateProfileName({ name });
      if (!res.success) {
        setError(res.error);
      } else {
        setSuccess(res.message);
        setIsEditingName(false);
        router.refresh();
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handlePhotoUpload = () => {
    if (!selectedFile) return;
    setError(null);
    setSuccess(null);
    setIsUploadingPhoto(true);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await updateProfileAvatar(formData);
      setIsUploadingPhoto(false);

      if (!res.success) {
        setError(res.error);
      } else {
        setImage(res.imageUrl);
        setPreviewImage(null);
        setSelectedFile(null);
        setSuccess(res.message);
        router.refresh();
      }
    });
  };

  const handlePhotoRemove = () => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await removeProfileAvatar();
      if (!res.success) {
        setError(res.error);
      } else {
        setImage(null);
        setPreviewImage(null);
        setSelectedFile(null);
        setSuccess(res.message);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Sección Foto de Perfil */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm font-poppins">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-lg font-bold text-[#00155C]">Foto de Perfil</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sube tu foto personalizada para que aparezca en la barra superior, foros y cursos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Preview */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-gradient-to-br from-[#026BCA] to-[#00155C] flex items-center justify-center text-2xl font-bold text-white">
              {previewImage ? (
                <img src={previewImage} alt="Vista previa" className="h-full w-full object-cover" />
              ) : image ? (
                <img src={image} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
            />

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                📁 Seleccionar Imagen
              </button>

              {selectedFile && (
                <button
                  type="button"
                  disabled={isUploadingPhoto || isPending}
                  onClick={handlePhotoUpload}
                  className="rounded-xl bg-[#00155C] px-5 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition shadow-md disabled:opacity-50"
                >
                  {isUploadingPhoto ? "Subiendo..." : "Guardar Foto"}
                </button>
              )}

              {image && !selectedFile && (
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  disabled={isPending}
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                >
                  Eliminar Foto
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Formatos soportados: JPG, PNG, WEBP o GIF (Máx. 5 MB).
            </p>
          </div>
        </div>
      </div>

      {/* Sección Información Personal (Nombre) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm font-poppins">
        <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#00155C]">Información Personal</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consulta y actualiza tu nombre visible en la plataforma.
            </p>
          </div>
          {!isEditingName && (
            <button
              type="button"
              onClick={() => {
                setIsEditingName(true);
                setSuccess(null);
                setError(null);
              }}
              className="rounded-xl border border-[#026BCA] bg-[#EDF6FF] px-4 py-2 text-xs font-bold text-[#026BCA] transition hover:bg-[#026BCA] hover:text-white"
            >
              ✏️ Editar Nombre
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircleIcon size={16} className="text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {isEditingName ? (
          <form onSubmit={handleNameSave} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-[#026BCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#026BCA]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Correo Electrónico (Solo lectura)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setName(initialName);
                  setIsEditingName(false);
                  setError(null);
                }}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-slate-400 uppercase tracking-wider">Nombre Completo</p>
              <p className="text-base font-bold text-slate-800">{name}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-400 uppercase tracking-wider">Correo Electrónico</p>
              <p className="text-base font-medium text-slate-700">{email}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-400 uppercase tracking-wider">Tipo de Cuenta</p>
              <p className="text-sm font-bold text-[#00155C]">{roleLabel}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

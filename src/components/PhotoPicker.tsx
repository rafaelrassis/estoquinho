"use client";
import { useState } from "react";

type Props = { value: string | null; onChange: (url: string | null) => void };

export function PhotoPicker({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });

    setUploading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Erro ao enviar foto");
      return;
    }
    const { url } = await res.json();
    onChange(url);
  }

  return (
    <div className="space-y-1">
      <label className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
          {uploading ? (
            <span className="text-xs text-slate-500">...</span>
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Foto do produto" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">📷</span>
          )}
        </div>
        <span className="text-sm text-slate-400">
          {uploading ? "Enviando..." : value ? "Trocar foto" : "Tirar/escolher foto"}
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

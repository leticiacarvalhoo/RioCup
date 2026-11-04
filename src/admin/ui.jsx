import { createContext, useCallback, useContext, useState } from "react";
import { supabase } from "../lib/supabase";

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((text, type = "ok") => {
    const id = Math.random();
    setList((l) => [...l, { id, text, type }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {list.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

// Envia a imagem para o Supabase Storage (bucket "media") e devolve a URL pública.
export function ImageUpload({ value, onChange, folder = "misc" }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Escolha um arquivo de imagem (JPG, PNG, WebP).", "error");
    if (file.size > 5 * 1024 * 1024) return toast("A imagem deve ter no máximo 5 MB.", "error");
    setBusy(true);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000" });
    setBusy(false);
    if (error) return toast(`Falha no upload: ${error.message}`, "error");
    onChange(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
  }

  return (
    <div className="upload">
      {value && <img src={value} alt="" className="upload-preview" />}
      <div className="actions">
        <input type="file" accept="image/*" onChange={pick} disabled={busy} />
        {value && <button type="button" className="button button-outline small" onClick={() => onChange("")}>Remover foto</button>}
      </div>
      {busy && <small>Enviando…</small>}
    </div>
  );
}

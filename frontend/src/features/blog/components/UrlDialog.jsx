import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Diálogo de una sola entrada para el editor.
 *
 * Sustituye a window.prompt, que además de no poder estilarse bloquea el hilo
 * y, sobre todo, congela la extensión del navegador cuando hay automatización
 * en marcha.
 *
 * Va por portal a document.body: dentro del editor quedaría atrapado por el
 * overflow del contenedor.
 */
export default function UrlDialog({
  open,
  title,
  label = "URL",
  placeholder = "https://",
  initialValue = "",
  confirmLabel = "Aceptar",
  hint,
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setValue(initialValue);
    // El foco va al campo al abrir: se escribe o se pega sin tocar el ratón.
    const id = requestAnimationFrame(() => inputRef.current?.select());
    return () => cancelAnimationFrame(id);
  }, [open, initialValue]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    onConfirm(value.trim());
  };

  return createPortal(
    <div className="url-dialog" role="dialog" aria-modal="true" aria-label={title}>
      <div className="url-dialog__backdrop" onClick={onCancel} />
      <form className="url-dialog__panel" onSubmit={submit}>
        <div className="url-dialog__header">
          <h2>{title}</h2>
          <button type="button" className="url-dialog__close" onClick={onCancel} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <label className="url-dialog__label" htmlFor="url-dialog-input">
          {label}
        </label>
        <input
          id="url-dialog-input"
          ref={inputRef}
          type="url"
          className="url-dialog__input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
        />
        {hint && <p className="url-dialog__hint">{hint}</p>}

        <div className="url-dialog__actions">
          <button type="button" className="url-dialog__cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="url-dialog__confirm">
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

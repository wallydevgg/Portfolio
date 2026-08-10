import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import "./ConfirmDialog.scss";

/**
 * Confirmación propia, en sustitución de window.confirm.
 *
 * Además de no poder estilarse, window.confirm bloquea el hilo principal y
 * congela la automatización del navegador mientras está abierto.
 *
 * `tone="danger"` es para lo irreversible: pinta el botón en rojo y añade el
 * icono de aviso.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-label={title}>
      <div className="confirm-dialog__backdrop" onClick={() => !busy && onCancel()} />
      <div className={`confirm-dialog__panel confirm-dialog__panel--${tone}`}>
        <div className="confirm-dialog__header">
          <h2>
            {tone === "danger" && <AlertTriangle size={16} />}
            {title}
          </h2>
          <button
            type="button"
            className="confirm-dialog__close"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <p className="confirm-dialog__message">{message}</p>

        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-dialog__confirm confirm-dialog__confirm--${tone}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

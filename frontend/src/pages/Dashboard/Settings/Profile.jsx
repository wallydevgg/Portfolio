import { useRef, useState } from "react";
import { Loader2, Trash2, Upload, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getStoredToken } from "@/features/auth/tokenStorage";
import { useToast } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/ui/ConfirmDialog/ConfirmDialog";
import "./Profile.scss";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

// La misma lista blanca que aplica el backend. Aquí solo sirve para que el
// selector de archivos no ofrezca lo que se va a rechazar; quien decide es el
// servidor, que además comprueba los bytes.
const ACCEPTED = "image/png,image/jpeg,image/gif,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

export default function ProfileSettingsPage() {
  const { profile, setProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();

  const displayName = profile?.display_name || profile?.username || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    // Permite volver a elegir el mismo archivo tras un fallo: sin esto el input
    // no vuelve a disparar change con el mismo nombre.
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_BYTES) {
      toast.error("La imagen debe pesar 5 MB o menos.");
      return;
    }

    const body = new FormData();
    body.append("file", file);

    try {
      setBusy(true);
      const response = await fetch(`${API_BASE}/users/me/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getStoredToken()}` },
        body,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setProfile(await response.json());
      toast.success("Foto de perfil actualizada.");
    } catch {
      toast.error("No se pudo subir la foto. Probá con otra imagen.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    try {
      setBusy(true);
      const response = await fetch(`${API_BASE}/users/me/avatar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getStoredToken()}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setProfile(await response.json());
      toast.success("Foto de perfil quitada.");
    } catch {
      toast.error("No se pudo quitar la foto.");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <div className="profile-settings">
      <div className="profile-settings__header">
        <div className="profile-settings__header-text">
          <UserRound className="profile-settings__header-icon" />
          <div>
            <h1>Profile Photo</h1>
            <p>
              Se muestra junto a tu nombre en el panel y en las respuestas a los
              comentarios del blog.
            </p>
          </div>
        </div>
      </div>

      <div className="profile-settings__card">
        <div className="profile-settings__preview">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} />
          ) : (
            <span className="profile-settings__initial" aria-hidden="true">
              {initial}
            </span>
          )}
        </div>

        <div className="profile-settings__body">
          <h2>{displayName}</h2>
          <p className="profile-settings__desc">
            PNG, JPEG, GIF o WebP, hasta 5 MB. Se recorta en círculo, así que
            conviene una imagen cuadrada.
          </p>

          <div className="profile-settings__actions">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              onChange={handleFile}
              hidden
            />
            <button
              type="button"
              className="btn-upload"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <Loader2 className="icon spinning" size={16} />
              ) : (
                <Upload className="icon" size={16} />
              )}
              {profile?.avatar_url ? "Cambiar foto" : "Subir foto"}
            </button>

            {profile?.avatar_url && (
              <button
                type="button"
                className="btn-remove"
                disabled={busy}
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="icon" size={16} />
                Quitar
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        tone="danger"
        title="Quitar foto de perfil"
        message="Tu avatar volverá a ser la inicial de tu nombre."
        confirmLabel="Quitar"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

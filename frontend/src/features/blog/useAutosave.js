import { useEffect, useRef, useState } from "react";

const LOCAL_INTERVAL_MS = 30_000;
const REMOTE_INTERVAL_MS = 120_000;

/**
 * Autoguardado híbrido para el editor de posts.
 *
 * - localStorage cada 30 s, y de golpe al cerrar u ocultar la pestaña.
 * - PUT al servidor cada 2 min, solo si `enableRemote`.
 *
 * Los dos ticks comprueban primero si hay cambios: si no tocás nada, no se
 * escribe ni se hace ninguna petición.
 *
 * `enableRemote` es false para posts nuevos (evita borradores huérfanos) y para
 * posts publicados (sus ediciones están en vivo; empujar un párrafo a medio
 * escribir al blog público es peor que perderlo).
 */
export function useAutosave({ data, storageKey, enableRemote, onRemoteSave, serverUpdatedAt }) {
  const [status, setStatus] = useState("idle");
  const [savedAt, setSavedAt] = useState(null);
  const [recovered, setRecovered] = useState(null);

  const dataRef = useRef(data);
  const lastLocalRef = useRef(null);
  const lastRemoteRef = useRef(null);

  // El consumidor pasa `onRemoteSave` como flecha inline, así que cambia de
  // identidad en cada render. Guardarlo en una ref lo saca de las deps del
  // efecto: si estuviera ahí, cada tecla reiniciaría el intervalo de 2 min y
  // el guardado remoto no dispararía nunca mientras se escribe.
  const onRemoteSaveRef = useRef(onRemoteSave);

  dataRef.current = data;
  onRemoteSaveRef.current = onRemoteSave;

  // Recuperación: al montar, si la copia local es más nueva que la del
  // servidor, se ofrece — nunca se aplica sola.
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const serverTime = serverUpdatedAt ? new Date(serverUpdatedAt).getTime() : 0;
      if (new Date(parsed.savedAt).getTime() > serverTime) {
        setRecovered(parsed);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, serverUpdatedAt]);

  const writeLocal = () => {
    if (!storageKey) return;
    const snapshot = JSON.stringify(dataRef.current);
    if (snapshot === lastLocalRef.current) return;
    lastLocalRef.current = snapshot;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ ...dataRef.current, savedAt: new Date().toISOString() })
      );
    } catch {
      // Cuota llena o modo privado: el guardado remoto sigue funcionando.
    }
  };

  useEffect(() => {
    const timer = setInterval(writeLocal, LOCAL_INTERVAL_MS);
    const flush = () => writeLocal();
    window.addEventListener("beforeunload", flush);
    window.addEventListener("blur", flush);
    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("blur", flush);
    };
  }, [storageKey]);

  useEffect(() => {
    if (!enableRemote) return;
    const timer = setInterval(async () => {
      const snapshot = JSON.stringify(dataRef.current);
      if (snapshot === lastRemoteRef.current) return;
      try {
        setStatus("saving");
        await onRemoteSaveRef.current(dataRef.current);
        lastRemoteRef.current = snapshot;
        setSavedAt(new Date());
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, REMOTE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enableRemote]);

  /** Limpia la copia local. Llamar tras un guardado manual correcto. */
  const clearLocal = () => {
    if (!storageKey) return;
    window.localStorage.removeItem(storageKey);
    lastLocalRef.current = null;
    lastRemoteRef.current = JSON.stringify(dataRef.current);
  };

  const discardRecovered = () => {
    setRecovered(null);
    if (storageKey) window.localStorage.removeItem(storageKey);
  };

  return { status, savedAt, recovered, discardRecovered, clearLocal };
}

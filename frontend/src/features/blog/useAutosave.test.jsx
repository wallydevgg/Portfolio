import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAutosave } from "./useAutosave";

const KEY = "post-draft:1";

describe("useAutosave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("escribe en localStorage a los 30 segundos", () => {
    renderHook(() =>
      useAutosave({
        data: { title: "Hola", content: "<p>x</p>" },
        storageKey: KEY,
        enableRemote: false,
        onRemoteSave: vi.fn(),
      })
    );

    expect(window.localStorage.getItem(KEY)).toBeNull();

    act(() => vi.advanceTimersByTime(30_000));

    const saved = JSON.parse(window.localStorage.getItem(KEY));
    expect(saved.title).toBe("Hola");
    expect(saved.savedAt).toBeTruthy();
  });

  it("no vuelve a escribir si no hubo cambios", () => {
    renderHook(() =>
      useAutosave({
        data: { title: "Hola", content: "<p>x</p>" },
        storageKey: KEY,
        enableRemote: false,
        onRemoteSave: vi.fn(),
      })
    );

    act(() => vi.advanceTimersByTime(30_000));
    const primero = window.localStorage.getItem(KEY);

    act(() => vi.advanceTimersByTime(30_000));

    expect(window.localStorage.getItem(KEY)).toBe(primero);
  });

  it("guarda en el servidor a los 2 minutos cuando enableRemote es true", async () => {
    const onRemoteSave = vi.fn().mockResolvedValue({});

    renderHook(() =>
      useAutosave({
        data: { title: "Hola", content: "<p>x</p>" },
        storageKey: KEY,
        enableRemote: true,
        onRemoteSave,
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(120_000);
    });

    expect(onRemoteSave).toHaveBeenCalledTimes(1);
  });

  /**
   * Este es el test que importa: el consumidor pasa `onRemoteSave` como flecha
   * inline, así que cambia de identidad en cada render. Cuando el callback
   * estaba en las dependencias del efecto, cada tecla reiniciaba el intervalo
   * de 2 minutos y el guardado remoto no llegaba a dispararse nunca mientras se
   * escribía — justo el fallo que el diseño "intervalo con guardia" pretendía
   * evitar.
   */
  it("dispara el guardado remoto aunque el componente se re-renderice al escribir", async () => {
    const onRemoteSave = vi.fn().mockResolvedValue({});

    const { rerender } = renderHook(
      ({ title }) =>
        useAutosave({
          data: { title, content: "<p>x</p>" },
          storageKey: KEY,
          enableRemote: true,
          // Flecha nueva en cada render, como en el editor real.
          onRemoteSave: (d) => onRemoteSave(d),
        }),
      { initialProps: { title: "H" } }
    );

    // Simula escritura: un render cada 10 s durante los 2 minutos.
    for (let i = 0; i < 12; i++) {
      rerender({ title: "H".repeat(i + 2) });
      await act(async () => {
        vi.advanceTimersByTime(10_000);
      });
    }

    expect(onRemoteSave).toHaveBeenCalled();
  });

  it("ofrece la copia local cuando es más nueva que la del servidor", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        title: "Sin guardar",
        content: "<p>y</p>",
        savedAt: "2026-08-09T12:00:00.000Z",
      })
    );

    const { result } = renderHook(() =>
      useAutosave({
        data: { title: "Servidor", content: "<p>x</p>" },
        storageKey: KEY,
        enableRemote: false,
        onRemoteSave: vi.fn(),
        serverUpdatedAt: "2026-08-09T11:00:00.000Z",
      })
    );

    expect(result.current.recovered?.title).toBe("Sin guardar");
  });

  it("descarta la copia local cuando el servidor va por delante", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        title: "Vieja",
        content: "<p>y</p>",
        savedAt: "2026-08-09T10:00:00.000Z",
      })
    );

    const { result } = renderHook(() =>
      useAutosave({
        data: { title: "Servidor", content: "<p>x</p>" },
        storageKey: KEY,
        enableRemote: false,
        onRemoteSave: vi.fn(),
        serverUpdatedAt: "2026-08-09T11:00:00.000Z",
      })
    );

    expect(result.current.recovered).toBeNull();
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});

/**
 * useSeoApi — Hook para interactuar con el endpoint de configuración SEO.
 * GET es público; PUT requiere token JWT de AuthContext.
 */
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = "/api/v1/settings";

export function useSeoApi() {
  const { token } = useAuth();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  /**
   * Obtiene la configuración SEO actual (pública).
   */
  const getSeoSettings = async () => {
    const res = await fetch(`${API_BASE}/seo`);
    if (!res.ok) throw new Error("Error fetching SEO settings");
    return res.json();
  };

  /**
   * Actualiza la configuración SEO (requiere autenticación).
   */
  const updateSeoSettings = async (data) => {
    const res = await fetch(`${API_BASE}/seo`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let detail = "Error updating SEO settings";
      try { detail = (await res.json()).detail ?? detail; } catch {}
      throw new Error(detail);
    }
    return res.json();
  };

  return { getSeoSettings, updateSeoSettings };
}

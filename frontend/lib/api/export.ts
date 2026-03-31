import { API_BASE_URL, authTokenStorage } from "@/lib/api/client";

export async function downloadCsv(resource: "properties" | "units" | "tenants" | "payments" | "maintenance") {
  try {
    const token = authTokenStorage.get();
    const response = await fetch(`${API_BASE_URL}/export/${resource}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({ message: "CSV export failed" }));
      throw new Error(payload.message || "CSV export failed");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resource}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    window.alert(error instanceof Error ? error.message : "CSV export failed");
  }
}

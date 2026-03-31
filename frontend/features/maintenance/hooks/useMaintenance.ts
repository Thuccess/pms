import { useCallback, useEffect, useState } from "react";
import { MaintenanceRequest } from "@/types";
import { maintenanceApi } from "@/lib/api/maintenance";

type MaintenanceCreatePayload = Omit<MaintenanceRequest, "id" | "propertyId" | "date"> &
  Partial<Pick<MaintenanceRequest, "propertyId" | "date" | "vendor">>;

export function useMaintenance() {
  const [data, setData] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await maintenanceApi.getAll();
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: MaintenanceCreatePayload) => {
      const created = await maintenanceApi.create(payload);
      await refresh();
      return created;
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, payload: Partial<MaintenanceRequest>) => {
      const updated = await maintenanceApi.update(id, payload);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await maintenanceApi.remove(id);
      await refresh();
    },
    [refresh]
  );

  return { data, loading, error, refresh, create, update, remove };
}

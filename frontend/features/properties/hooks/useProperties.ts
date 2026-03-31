import { useCallback, useEffect, useState } from "react";
import { Property } from "@/types";
import { propertiesApi } from "@/lib/api/properties";

export function useProperties() {
  const [data, setData] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await propertiesApi.getAll();
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: Omit<Property, "id" | "units" | "occupancy" | "revenue"> & Partial<Pick<Property, "units" | "occupancy" | "revenue">>) => {
      const created = await propertiesApi.create(payload);
      await refresh();
      return created;
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, payload: Partial<Property>) => {
      const updated = await propertiesApi.update(id, payload);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await propertiesApi.remove(id);
      await refresh();
    },
    [refresh]
  );

  return { data, loading, error, refresh, create, update, remove };
}

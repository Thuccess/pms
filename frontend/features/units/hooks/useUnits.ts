import { useCallback, useEffect, useState } from "react";
import { Unit } from "@/types";
import { unitsApi } from "@/lib/api/units";

export function useUnits() {
  const [data, setData] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await unitsApi.getAll();
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load units");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: Omit<Unit, "id">) => {
      const created = await unitsApi.create(payload);
      await refresh();
      return created;
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, payload: Partial<Unit>) => {
      const updated = await unitsApi.update(id, payload);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await unitsApi.remove(id);
      await refresh();
    },
    [refresh]
  );

  return { data, loading, error, refresh, create, update, remove };
}

import { useCallback, useEffect, useState } from "react";
import { Tenant } from "@/types";
import { tenantsApi } from "@/lib/api/tenants";

export function useTenants() {
  const [data, setData] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await tenantsApi.getAll();
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: Omit<Tenant, "id">) => {
      const created = await tenantsApi.create(payload);
      await refresh();
      return created;
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, payload: Partial<Tenant>) => {
      const updated = await tenantsApi.update(id, payload);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await tenantsApi.remove(id);
      await refresh();
    },
    [refresh]
  );

  return { data, loading, error, refresh, create, update, remove };
}

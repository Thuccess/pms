import { useCallback, useEffect, useState } from "react";
import { Payment } from "@/types";
import { paymentsApi } from "@/lib/api/payments";

type PaymentCreatePayload = Omit<Payment, "id" | "propertyId" | "description"> &
  Partial<Pick<Payment, "propertyId" | "description">>;

export function usePayments() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await paymentsApi.getAll();
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (payload: PaymentCreatePayload) => {
      const created = await paymentsApi.create(payload);
      await refresh();
      return created;
    },
    [refresh]
  );

  const update = useCallback(
    async (id: string, payload: Partial<Payment>) => {
      const updated = await paymentsApi.update(id, payload);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      await paymentsApi.remove(id);
      await refresh();
    },
    [refresh]
  );

  return { data, loading, error, refresh, create, update, remove };
}

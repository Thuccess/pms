import { useCallback, useEffect, useState } from "react";
import { recordsApi, RecordsPayload } from "@/lib/api/records";

const INITIAL: RecordsPayload = {
  properties: [],
  units: [],
  tenants: [],
  payments: [],
  maintenance: [],
};

export function useRecords() {
  const [data, setData] = useState<RecordsPayload>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await recordsApi.getAll();
      setData(records);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

import { useMemo, useState } from "react";

export function useEntityFilters<T>(
  items: T[],
  predicate: (item: T, query: string, activeFilter: string) => boolean,
  initialFilter = "All"
) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter);

  const filteredItems = useMemo(() => {
    return items.filter((item) => predicate(item, query, activeFilter));
  }, [items, predicate, query, activeFilter]);

  return {
    query,
    setQuery,
    activeFilter,
    setActiveFilter,
    filteredItems,
  };
}

type LoaderOptions<T> = {
  key: string;
  fallback: T[];
};

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export function loadCollection<T>({ key, fallback }: LoaderOptions<T>): T[] {
  if (!canUseStorage()) {
    return clone(fallback);
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      const seeded = clone(fallback);
      window.localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return clone(fallback);
    }

    return parsed as T[];
  } catch {
    return clone(fallback);
  }
}

export function saveCollection<T>(key: string, items: T[]): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function nextId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

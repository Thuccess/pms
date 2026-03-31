type ServerEntity = {
  _id?: string;
  id?: string;
  [key: string]: unknown;
};

export function toClientEntity<T extends ServerEntity>(entity: T): Omit<T, "_id"> & { id: string } {
  const { _id, id, ...rest } = entity;
  return {
    ...rest,
    id: String(_id || id || ""),
  } as Omit<T, "_id"> & { id: string };
}

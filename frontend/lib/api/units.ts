import { apiRequest } from "@/lib/api/client";
import { toClientEntity } from "@/lib/api/transformers";
import { Unit } from "@/types";

type UnitCreate = Omit<Unit, "id">;

export const unitsApi = {
  async getAll(): Promise<Unit[]> {
    const items = await apiRequest<any[]>("/units");
    return items.map((item) => toClientEntity(item) as Unit);
  },

  async getById(id: string): Promise<Unit | undefined> {
    try {
      const item = await apiRequest<any>(`/units/${id}`);
      return toClientEntity(item) as Unit;
    } catch {
      return undefined;
    }
  },

  async create(data: UnitCreate): Promise<Unit> {
    const created = await apiRequest<any>("/units", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return toClientEntity(created) as Unit;
  },

  async update(id: string, data: Partial<Unit>): Promise<Unit | undefined> {
    const { id: _ignored, ...payload } = data;
    try {
      const updated = await apiRequest<any>(`/units/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return toClientEntity(updated) as Unit;
    } catch {
      return undefined;
    }
  },

  async remove(id: string): Promise<void> {
    await apiRequest(`/units/${id}`, {
      method: "DELETE",
    });
  },
};

import { apiRequest } from "@/lib/api/client";
import { toClientEntity } from "@/lib/api/transformers";
import { Property } from "@/types";

type PropertyCreate = Omit<Property, "id" | "units" | "occupancy" | "revenue"> &
  Partial<Pick<Property, "units" | "occupancy" | "revenue">>;

export const propertiesApi = {
  async getAll(): Promise<Property[]> {
    const items = await apiRequest<any[]>("/properties");
    return items.map((item) => toClientEntity(item) as Property);
  },

  async getById(id: string): Promise<Property | undefined> {
    try {
      const item = await apiRequest<any>(`/properties/${id}`);
      return toClientEntity(item) as Property;
    } catch {
      return undefined;
    }
  },

  async create(data: PropertyCreate): Promise<Property> {
    const created = await apiRequest<any>("/properties", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        units: data.units ?? 0,
        occupancy: data.occupancy ?? 0,
        revenue: data.revenue ?? 0,
      }),
    });
    return toClientEntity(created) as Property;
  },

  async update(id: string, data: Partial<Property>): Promise<Property | undefined> {
    const { id: _ignored, ...payload } = data;
    try {
      const updated = await apiRequest<any>(`/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return toClientEntity(updated) as Property;
    } catch {
      return undefined;
    }
  },

  async remove(id: string): Promise<void> {
    await apiRequest(`/properties/${id}`, {
      method: "DELETE",
    });
  },
};

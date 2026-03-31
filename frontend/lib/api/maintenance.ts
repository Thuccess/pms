import { MaintenanceRequest } from "@/types";
import { apiRequest } from "@/lib/api/client";
import { toClientEntity } from "@/lib/api/transformers";

type MaintenanceCreate = Omit<MaintenanceRequest, "id" | "propertyId" | "date"> &
  Partial<Pick<MaintenanceRequest, "propertyId" | "date" | "vendor">>;

export const maintenanceApi = {
  async getAll(): Promise<MaintenanceRequest[]> {
    const items = await apiRequest<any[]>("/maintenance");
    return items.map((item) => toClientEntity(item) as MaintenanceRequest);
  },

  async getById(id: string): Promise<MaintenanceRequest | undefined> {
    try {
      const item = await apiRequest<any>(`/maintenance/${id}`);
      return toClientEntity(item) as MaintenanceRequest;
    } catch {
      return undefined;
    }
  },

  async create(data: MaintenanceCreate): Promise<MaintenanceRequest> {
    const created = await apiRequest<any>("/maintenance", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        date: data.date || new Date().toISOString().slice(0, 10),
      }),
    });
    return toClientEntity(created) as MaintenanceRequest;
  },

  async update(id: string, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const { id: _ignored, ...payload } = data;
    try {
      const updated = await apiRequest<any>(`/maintenance/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return toClientEntity(updated) as MaintenanceRequest;
    } catch {
      return undefined;
    }
  },

  async remove(id: string): Promise<void> {
    await apiRequest(`/maintenance/${id}`, {
      method: "DELETE",
    });
  },
};

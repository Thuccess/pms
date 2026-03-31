import { apiRequest } from "@/lib/api/client";
import { toClientEntity } from "@/lib/api/transformers";
import { Tenant } from "@/types";

type TenantCreate = Omit<Tenant, "id">;

export const tenantsApi = {
  async getAll(): Promise<Tenant[]> {
    const items = await apiRequest<any[]>("/tenants");
    return items.map((item) => toClientEntity(item) as Tenant);
  },

  async getById(id: string): Promise<Tenant | undefined> {
    try {
      const item = await apiRequest<any>(`/tenants/${id}`);
      return toClientEntity(item) as Tenant;
    } catch {
      return undefined;
    }
  },

  async create(data: TenantCreate): Promise<Tenant> {
    const created = await apiRequest<any>("/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return toClientEntity(created) as Tenant;
  },

  async update(id: string, data: Partial<Tenant>): Promise<Tenant | undefined> {
    const { id: _ignored, ...payload } = data;
    try {
      const updated = await apiRequest<any>(`/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return toClientEntity(updated) as Tenant;
    } catch {
      return undefined;
    }
  },

  async remove(id: string): Promise<void> {
    await apiRequest(`/tenants/${id}`, {
      method: "DELETE",
    });
  },
};

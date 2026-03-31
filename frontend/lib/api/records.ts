import { apiRequest } from "@/lib/api/client";
import { toClientEntity } from "@/lib/api/transformers";
import { MaintenanceRequest, Payment, Property, Tenant, Unit } from "@/types";

type RecordsResponse = {
  properties: any[];
  units: any[];
  tenants: any[];
  payments: any[];
  maintenance: any[];
};

export type RecordsPayload = {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  payments: Payment[];
  maintenance: MaintenanceRequest[];
};

export const recordsApi = {
  async getAll(): Promise<RecordsPayload> {
    const data = await apiRequest<RecordsResponse>("/records");
    return {
      properties: data.properties.map((item) => toClientEntity(item) as Property),
      units: data.units.map((item) => toClientEntity(item) as Unit),
      tenants: data.tenants.map((item) => toClientEntity(item) as Tenant),
      payments: data.payments.map((item) => toClientEntity(item) as Payment),
      maintenance: data.maintenance.map((item) => toClientEntity(item) as MaintenanceRequest),
    };
  },
};

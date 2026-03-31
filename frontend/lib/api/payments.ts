import { Payment } from "@/types";
import { apiRequest } from "@/lib/api/client";
import { toClientEntity } from "@/lib/api/transformers";

type PaymentCreate = Omit<Payment, "id" | "propertyId" | "description"> &
  Partial<Pick<Payment, "propertyId" | "description">>;

export const paymentsApi = {
  async getAll(): Promise<Payment[]> {
    const items = await apiRequest<any[]>("/payments");
    return items.map((item) => toClientEntity(item) as Payment);
  },

  async getById(id: string): Promise<Payment | undefined> {
    try {
      const item = await apiRequest<any>(`/payments/${id}`);
      return toClientEntity(item) as Payment;
    } catch {
      return undefined;
    }
  },

  async create(data: PaymentCreate): Promise<Payment> {
    const created = await apiRequest<any>("/payments", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        description: data.description || "Recorded Payment",
      }),
    });
    return toClientEntity(created) as Payment;
  },

  async update(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
    const { id: _ignored, ...payload } = data;
    try {
      const updated = await apiRequest<any>(`/payments/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return toClientEntity(updated) as Payment;
    } catch {
      return undefined;
    }
  },

  async remove(id: string): Promise<void> {
    await apiRequest(`/payments/${id}`, {
      method: "DELETE",
    });
  },
};

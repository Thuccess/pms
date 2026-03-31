import { Payment } from "@/types";

export const MOCK_PAYMENTS: Payment[] = [
  { id: "p1", tenantId: "t1", propertyId: "1", amount: 25000, date: "2024-03-01", status: "Paid", method: "Bank Transfer", description: "March Rent - PH-01" },
  { id: "p2", tenantId: "t2", propertyId: "1", amount: 15000, date: "2024-03-05", status: "Pending", method: "Credit Card", description: "March Rent - 4001" },
  { id: "p3", tenantId: "t3", propertyId: "2", amount: 12000, date: "2024-02-01", status: "Paid", method: "Bank Transfer", description: "February Rent - 101" },
  { id: "p4", tenantId: "t1", propertyId: "1", amount: 25000, date: "2024-02-01", status: "Paid", method: "Bank Transfer", description: "February Rent - PH-01" },
];

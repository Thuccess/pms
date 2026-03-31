export type PropertyStatus = "Active" | "Under Maintenance" | "Sold";
export type UnitStatus = "Occupied" | "Vacant" | "Maintenance";
export type PaymentStatus = "Paid" | "Pending" | "Late";
export type TicketStatus = "Open" | "In Progress" | "Resolved";
export type Priority = "Low" | "Medium" | "High";

export interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  price: number;
  image: string;
  images?: string[];
  status: PropertyStatus;
  units: number;
  occupancy: number;
  revenue: number;
  description: string;
  amenities: string[];
}

export interface Unit {
  id: string;
  propertyId: string;
  number: string;
  type: string;
  rent: number;
  status: UnitStatus;
  tenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  propertyId: string;
  unitId: string;
  leaseStart: string;
  leaseEnd: string;
  balance: number;
  status?: "Active" | "Inactive";
  property?: string;
  unit?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  method: string;
  description: string;
}

export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  unitId: string;
  issue: string;
  priority: Priority;
  status: TicketStatus;
  date: string;
  vendor?: string;
  description: string;
}

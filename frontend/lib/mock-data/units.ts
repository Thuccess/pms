import { Unit } from "@/types";

export const MOCK_UNITS: Unit[] = [
  { id: "u1", propertyId: "1", number: "PH-01", type: "Penthouse", rent: 25000, status: "Occupied", tenantId: "t1" },
  { id: "u2", propertyId: "1", number: "PH-02", type: "Penthouse", rent: 22000, status: "Vacant" },
  { id: "u3", propertyId: "1", number: "4001", type: "3BR Apartment", rent: 15000, status: "Occupied", tenantId: "t2" },
  { id: "u4", propertyId: "2", number: "101", type: "2BR Apartment", rent: 12000, status: "Occupied", tenantId: "t3" },
];

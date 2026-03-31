import { MaintenanceRequest } from "@/types";

export const MOCK_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: "m1",
    propertyId: "1",
    unitId: "u1",
    issue: "Smart Home System Malfunction",
    priority: "High",
    status: "In Progress",
    date: "2024-03-28",
    vendor: "TechElite Solutions",
    description: "The central hub is unresponsive to voice commands and mobile app connectivity is intermittent.",
  },
  {
    id: "m2",
    propertyId: "2",
    unitId: "u4",
    issue: "AC Filter Replacement",
    priority: "Low",
    status: "Open",
    date: "2024-03-29",
    description: "Routine maintenance: AC filters need replacement in the master bedroom.",
  },
  {
    id: "m3",
    propertyId: "1",
    unitId: "u3",
    issue: "Kitchen Faucet Leak",
    priority: "Medium",
    status: "Resolved",
    date: "2024-03-25",
    vendor: "Luxury Plumbing Co.",
    description: "Minor leak detected in the kitchen island faucet. Gasket replaced.",
  },
];

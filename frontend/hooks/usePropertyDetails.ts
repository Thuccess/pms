import { useEffect, useState } from "react";
import { maintenanceApi } from "@/lib/api/maintenance";
import { paymentsApi } from "@/lib/api/payments";
import { propertiesApi } from "@/lib/api/properties";
import { tenantsApi } from "@/lib/api/tenants";
import { unitsApi } from "@/lib/api/units";
import { MaintenanceRequest, Payment, Property, Tenant, Unit } from "@/types";

export function usePropertyDetails(propertyId: string | undefined) {
  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [propertyUnits, setPropertyUnits] = useState<Unit[]>([]);
  const [propertyTenants, setPropertyTenants] = useState<Tenant[]>([]);
  const [propertyPayments, setPropertyPayments] = useState<Payment[]>([]);
  const [propertyMaintenance, setPropertyMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!propertyId) {
        setProperty(undefined);
        setPropertyUnits([]);
        setPropertyTenants([]);
        setPropertyPayments([]);
        setPropertyMaintenance([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [allProperties, allUnits, allTenants, allPayments, allMaintenance] = await Promise.all([
          propertiesApi.getAll(),
          unitsApi.getAll(),
          tenantsApi.getAll(),
          paymentsApi.getAll(),
          maintenanceApi.getAll(),
        ]);

        const selectedProperty = allProperties.find((p) => p.id === propertyId);
        const scopedUnits = allUnits.filter((u) => u.propertyId === propertyId);
        const scopedTenants = allTenants.filter((t) => t.propertyId === propertyId);
        const scopedPayments = allPayments.filter((p) => scopedTenants.some((t) => t.id === p.tenantId));
        const scopedMaintenance = allMaintenance.filter((m) => m.propertyId === propertyId);

        setProperty(selectedProperty);
        setPropertyUnits(scopedUnits);
        setPropertyTenants(scopedTenants);
        setPropertyPayments(scopedPayments);
        setPropertyMaintenance(scopedMaintenance);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [propertyId]);

  return {
    loading,
    property,
    propertyUnits,
    propertyTenants,
    propertyPayments,
    propertyMaintenance,
  };
}

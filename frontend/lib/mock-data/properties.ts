import { Property } from "@/types";

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "The Golden Heights",
    location: "Dubai Marina, UAE",
    type: "Luxury Penthouse",
    price: 12500000,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    status: "Active",
    units: 45,
    occupancy: 92,
    revenue: 450000,
    description:
      "A masterpiece of modern architecture, offering panoramic views of the Arabian Gulf. Featuring private pools, 24/7 concierge, and world-class amenities.",
    amenities: ["Private Pool", "Gym", "Concierge", "Spa", "Valet Parking"],
  },
  {
    id: "2",
    name: "Onyx Residences",
    location: "Mayfair, London",
    type: "Boutique Apartments",
    price: 8900000,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    status: "Active",
    units: 12,
    occupancy: 100,
    revenue: 280000,
    description:
      "Exclusive boutique living in the heart of Mayfair. Each residence is meticulously designed with the finest materials and finishes.",
    amenities: ["Wine Cellar", "Private Cinema", "Roof Terrace", "Smart Home System"],
  },
  {
    id: "3",
    name: "Aurum Villas",
    location: "Beverly Hills, CA",
    type: "Estate Villa",
    price: 24000000,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    status: "Under Maintenance",
    units: 1,
    occupancy: 0,
    revenue: 0,
    description:
      "An sprawling estate in the hills, offering ultimate privacy and luxury. Featuring a 10-car garage, infinity pool, and guest house.",
    amenities: ["Tennis Court", "Infinity Pool", "10-Car Garage", "Guest House", "Helipad"],
  },
];

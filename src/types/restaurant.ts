// ============================================
// RESTAURANT TYPES
// ============================================
export interface OpeningHours {
  lundi?: string;
  mardi?: string;
  mercredi?: string;
  jeudi?: string;
  vendredi?: string;
  samedi?: string;
  dimanche?: string;
}

export interface Restaurant {
  id: string;
  userId: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  openingHours: OpeningHours | null;
}

export interface RestaurantFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  openingHours: OpeningHours;
}

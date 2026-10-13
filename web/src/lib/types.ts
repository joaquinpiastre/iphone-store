export type Condition = "NEW" | "USED" | "LIKE_NEW";
export type PhoneStatus = "AVAILABLE" | "RESERVED" | "SOLD";
export type RequestStatus = "NEW" | "CONTACTED" | "CLOSED" | "REJECTED";

export interface PhoneImage {
  id?: string;
  url: string;
  publicId?: string | null;
  position?: number;
}

export interface Phone {
  id: string;
  slug: string;
  model: string;
  storageGb: number;
  color: string;
  condition: Condition;
  batteryHealth: number | null;
  accessories: string[];
  warrantyMonths: number;
  priceUsd: number;
  description: string | null;
  featured: boolean;
  status: PhoneStatus;
  images: PhoneImage[];
  createdAt: string;
  updatedAt: string;
  // sólo admin
  costUsd?: number;
  imei?: string | null;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface CatalogResponse extends Paged<Phone> {
  facets: {
    models: string[];
    storages: number[];
    colors: string[];
    minPrice: number;
    maxPrice: number;
  };
}

export interface QuoteResult {
  basePriceUsd: number;
  totalDiscountPct: number;
  estimatedUsd: number;
  lines: { label: string; discountPct: number }[];
  differenceUsd: number | null;
  target: { id: string; model: string; storageGb: number; priceUsd: number } | null;
}

export interface TradeInRequest {
  id: string;
  customerName: string;
  contact: string;
  email: string | null;
  model: string;
  storageGb: number;
  color: string;
  screen: string;
  body: string;
  batteryPct: number;
  powersOn: boolean;
  faceIdWorks: boolean;
  hasBox: boolean;
  hasCharger: boolean;
  estimatedUsd: number;
  differenceUsd: number | null;
  status: RequestStatus;
  notes: string | null;
  createdAt: string;
  targetPhone: { id: string; model: string; storageGb: number; color: string; priceUsd: number } | null;
}

export const CONDITION_LABEL: Record<Condition, string> = {
  NEW: "Nuevo",
  LIKE_NEW: "Seminuevo",
  USED: "Usado",
};

export const STATUS_LABEL: Record<PhoneStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  NEW: "Nueva",
  CONTACTED: "Contactada",
  CLOSED: "Cerrada",
  REJECTED: "Rechazada",
};

export const SCREEN_LABEL: Record<string, string> = {
  perfect: "Impecable",
  scratched: "Con rayones",
  cracked: "Rota / quebrada",
};

export const BODY_LABEL: Record<string, string> = {
  perfect: "Impecable",
  worn: "Marcas de uso",
  dented: "Golpeada / doblada",
};

export type PlanType = "starter" | "growth" | "business";

export interface PlanConfig {
  name: string;
  price: number;
  exportsPerMonth: number; // -1 = unlimited
  maxLists: number; // -1 = unlimited
  advancedSearch: boolean;
  techStackFilter: boolean;
  fullCompanyInfo: boolean;
  apiAccess: boolean;
  alerts: boolean;
  features: string[];
}

export const PLANS: Record<PlanType, PlanConfig> = {
  starter: {
    name: "Starter",
    price: 39,
    exportsPerMonth: 50,
    maxLists: 3,
    advancedSearch: false,
    techStackFilter: false,
    fullCompanyInfo: false,
    apiAccess: false,
    alerts: false,
    features: [
      "50 exportaciones/mes",
      "Búsqueda por texto",
      "3 listas máximo",
      "Info básica (nombre, CIF, ciudad, sector)",
    ],
  },
  growth: {
    name: "Growth",
    price: 99,
    exportsPerMonth: 500,
    maxLists: -1,
    advancedSearch: true,
    techStackFilter: false,
    fullCompanyInfo: true,
    apiAccess: false,
    alerts: false,
    features: [
      "500 exportaciones/mes",
      "Búsqueda avanzada (CNAE, provincia, empleados, facturación)",
      "Listas ilimitadas",
      "Info completa (email, web, teléfono, LinkedIn, tech stack)",
    ],
  },
  business: {
    name: "Business",
    price: 199,
    exportsPerMonth: -1,
    maxLists: -1,
    advancedSearch: true,
    techStackFilter: true,
    fullCompanyInfo: true,
    apiAccess: true,
    alerts: true,
    features: [
      "Exportaciones ilimitadas",
      "Todo lo de Growth",
      "Filtro por tech stack",
      "Acceso API",
      "Alertas de nuevas empresas por sector/zona",
    ],
  },
};

export function getPlanConfig(plan: string): PlanConfig {
  return PLANS[(plan as PlanType)] || PLANS.starter;
}

export function canUseAdvancedSearch(plan: string): boolean {
  return getPlanConfig(plan).advancedSearch;
}

export function canSeeFullInfo(plan: string): boolean {
  return getPlanConfig(plan).fullCompanyInfo;
}

export function getMaxLists(plan: string): number {
  return getPlanConfig(plan).maxLists;
}

export function getExportLimit(plan: string): number {
  return getPlanConfig(plan).exportsPerMonth;
}

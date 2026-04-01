export type PlanType = "starter" | "growth" | "enterprise";

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
    price: 79,
    exportsPerMonth: 100,
    maxLists: 3,
    advancedSearch: false,
    techStackFilter: false,
    fullCompanyInfo: false,
    apiAccess: false,
    alerts: false,
    features: [
      "100 exportaciones/mes",
      "Búsqueda por texto",
      "3 listas máximo",
      "Info básica (nombre, CIF, ciudad, sector)",
    ],
  },
  growth: {
    name: "Growth",
    price: 149,
    exportsPerMonth: 1000,
    maxLists: -1,
    advancedSearch: true,
    techStackFilter: false,
    fullCompanyInfo: true,
    apiAccess: false,
    alerts: false,
    features: [
      "1.000 exportaciones/mes",
      "Búsqueda avanzada (CNAE, provincia, empleados, facturación)",
      "Listas ilimitadas",
      "Info completa (email, web, teléfono, LinkedIn, tech stack)",
    ],
  },
  enterprise: {
    name: "Enterprise",
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

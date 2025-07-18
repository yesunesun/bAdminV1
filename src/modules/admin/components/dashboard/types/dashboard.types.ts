// src/modules/admin/components/dashboard/types/dashboard.types.ts

export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  pendingApprovals: number;
  propertiesAddedToday: number;
  propertiesAddedThisWeek: number;
  propertiesAddedThisMonth: number;
}

export interface PropertyTypeDistribution {
  residential: number;
  commercial: number;
  land: number;
}

export interface PropertyPerformance {
  averageTimeToPublish: number; // in days
  mostPopularType: string;
  priceRangeDistribution: PriceRangeData[];
}

export interface PriceRangeData {
  range: string;
  count: number;
  percentage: number;
}

export interface FinancialAnalytics {
  averagePrices: {
    residential: number;
    commercial: number;
    land: number;
  };
  marketSplit: {
    rental: number;
    sale: number;
  };
  priceTrends: PriceTrendData[];
}

export interface PriceTrendData {
  date: string;
  averagePrice: number;
  count: number;
}

export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface AdminMetrics {
  propertiesApprovedToday: number;
  propertiesRejectedToday: number;
  pendingAdminActions: number;
  averageResponseTime: number; // in hours
  moderationQueueCount: number;
}

export interface QualityMetrics {
  propertiesWithCompleteData: number;
  propertiesWithImages: number;
  propertiesWithoutImages: number;
  dataCompletenessScore: number;
  propertiesWithGPS: number;
}

export interface LocationAnalytics {
  topCities: Array<{
    city: string;
    count: number;
    averagePrice: number;
  }>;
  topStates: Array<{
    state: string;
    count: number;
    averagePrice: number;
  }>;
  propertyDensity: Array<{
    location: string;
    density: number;
    coordinates: [number, number];
  }>;
}

export interface TrendAnalytics {
  registrationTrends: Array<{
    period: string;
    count: number;
    growth: number;
  }>;
  seasonalPatterns: Array<{
    month: string;
    average: number;
    currentYear: number;
    previousYear: number;
  }>;
  yearOverYear: {
    currentYear: number;
    previousYear: number;
    growthPercentage: number;
  };
}

export interface DashboardData {
  propertyStats: PropertyStats;
  propertyTypeDistribution: PropertyTypeDistribution;
  propertyPerformance: PropertyPerformance;
  financialAnalytics: FinancialAnalytics;
  adminMetrics?: AdminMetrics;
  qualityMetrics?: QualityMetrics;
  locationAnalytics?: LocationAnalytics;
  trendAnalytics?: TrendAnalytics;
}

export interface DashboardError {
  message: string;
  code?: string;
  details?: any;
}

export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: DashboardError | null;
  lastUpdated: Date | null;
}
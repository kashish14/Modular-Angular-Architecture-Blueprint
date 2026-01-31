export interface Metric {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface AnalyticsData {
  metrics: Metric[];
  chartData: ChartDataPoint[];
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user?: string;
}

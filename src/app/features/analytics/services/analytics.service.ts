import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AnalyticsData, Metric, ChartDataPoint, Activity } from '../models/analytics.model';

// Mock data
const MOCK_METRICS: Metric[] = [
  {
    id: '1',
    label: 'Total Users',
    value: 12450,
    change: 12.5,
    trend: 'up',
    icon: 'users'
  },
  {
    id: '2',
    label: 'Revenue',
    value: 89500,
    change: 8.2,
    trend: 'up',
    icon: 'dollar'
  },
  {
    id: '3',
    label: 'Active Sessions',
    value: 2453,
    change: -3.1,
    trend: 'down',
    icon: 'activity'
  },
  {
    id: '4',
    label: 'Conversion Rate',
    value: 3.24,
    change: 1.8,
    trend: 'up',
    icon: 'trending'
  }
];

const MOCK_CHART_DATA: ChartDataPoint[] = [
  { label: 'Jan', value: 4000 },
  { label: 'Feb', value: 3000 },
  { label: 'Mar', value: 5000 },
  { label: 'Apr', value: 4500 },
  { label: 'May', value: 6000 },
  { label: 'Jun', value: 5500 },
  { label: 'Jul', value: 7000 }
];

const MOCK_ACTIVITY: Activity[] = [
  {
    id: '1',
    type: 'user_registration',
    description: 'New user registered',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    user: 'john.doe@example.com'
  },
  {
    id: '2',
    type: 'purchase',
    description: 'Purchase completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    user: 'jane.smith@example.com'
  },
  {
    id: '3',
    type: 'system',
    description: 'System backup completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  }
];

@Injectable()
export class AnalyticsService {
  constructor() {}

  getAnalyticsData(): Observable<AnalyticsData> {
    return of({
      metrics: MOCK_METRICS,
      chartData: MOCK_CHART_DATA,
      recentActivity: MOCK_ACTIVITY
    }).pipe(delay(600));
  }

  getMetrics(): Observable<Metric[]> {
    return of(MOCK_METRICS).pipe(delay(400));
  }
}

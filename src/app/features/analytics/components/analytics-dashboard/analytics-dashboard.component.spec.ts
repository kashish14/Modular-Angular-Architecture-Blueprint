import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { AnalyticsService } from '../../services/analytics.service';
import { SharedModule } from '@shared/shared.module';
import { of } from 'rxjs';
import { AnalyticsData } from '../../models/analytics.model';

describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;
  let fixture: ComponentFixture<AnalyticsDashboardComponent>;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  const mockAnalyticsData: AnalyticsData = {
    metrics: [
      {
        id: '1',
        label: 'Total Users',
        value: 1000,
        change: 10,
        trend: 'up',
        icon: 'users'
      }
    ],
    chartData: [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 200 }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'test',
        description: 'Test activity',
        timestamp: new Date()
      }
    ]
  };

  beforeEach(async () => {
    const analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['getAnalyticsData']);

    await TestBed.configureTestingModule({
      declarations: [AnalyticsDashboardComponent],
      imports: [SharedModule],
      providers: [
        { provide: AnalyticsService, useValue: analyticsSpy }
      ]
    }).compileComponents();

    analyticsService = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
    analyticsService.getAnalyticsData.and.returnValue(of(mockAnalyticsData));

    fixture = TestBed.createComponent(AnalyticsDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load analytics data on init', () => {
    fixture.detectChanges();

    expect(analyticsService.getAnalyticsData).toHaveBeenCalled();
    expect(component.analyticsData).toEqual(mockAnalyticsData);
    expect(component.loading).toBeFalsy();
  });

  it('should format revenue values with dollar sign', () => {
    const formatted = component.formatValue(1000, 'Revenue');
    expect(formatted).toBe('$1,000');
  });

  it('should format rate values with percentage', () => {
    const formatted = component.formatValue(50, 'Conversion Rate');
    expect(formatted).toBe('50%');
  });

  it('should return correct trend colors', () => {
    expect(component.getTrendColor('up')).toBe('#10B981');
    expect(component.getTrendColor('down')).toBe('#EF4444');
    expect(component.getTrendColor('neutral')).toBe('#6B7280');
  });
});

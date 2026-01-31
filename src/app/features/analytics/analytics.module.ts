import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { AnalyticsService } from './services/analytics.service';

@NgModule({
  declarations: [
    AnalyticsDashboardComponent
  ],
  imports: [
    SharedModule,
    AnalyticsRoutingModule
  ],
  providers: [
    AnalyticsService
  ]
})
export class AnalyticsModule { }

import { Component } from '@angular/core';
import { StateService } from '@core/services/state.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  title = 'Enterprise Admin Workspace';
  sidebarCollapsed$ = this.state.sidebarCollapsed$;

  constructor(private state: StateService, _theme: ThemeService) {
    // Start with the navigation drawer closed on small screens.
    this.state.setSidebarCollapsed(window.matchMedia('(max-width: 768px)').matches);
  }

  closeSidebar(): void {
    this.state.setSidebarCollapsed(true);
  }
}

import { Component } from '@angular/core';
import { StateService } from '@core/services/state.service';

interface NavItem {
  label: string;
  icon: 'chart' | 'users' | 'settings';
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'chart', route: '/dashboard' },
    { label: 'Users', icon: 'users', route: '/users' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  collapsed$ = this.state.sidebarCollapsed$;

  constructor(private state: StateService) {}

  onNavigate(): void {
    // On small screens the sidebar is an overlay drawer: close it after navigating.
    if (window.matchMedia('(max-width: 768px)').matches) {
      this.state.setSidebarCollapsed(true);
    }
  }
}

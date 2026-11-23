import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { StateService } from '@core/services/state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  user$ = this.auth.currentUser$;
  sidebarCollapsed$ = this.state.sidebarCollapsed$;

  constructor(private auth: AuthService, private state: StateService) {}

  toggleSidebar(): void {
    this.state.toggleSidebar();
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}

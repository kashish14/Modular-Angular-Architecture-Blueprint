import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Enterprise Admin Workspace';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Auto-login for demo purposes
    if (!this.authService.isAuthenticated) {
      this.authService.login({ 
        email: 'admin@enterprise.com', 
        password: 'demo' 
      }).subscribe();
    }
  }
}

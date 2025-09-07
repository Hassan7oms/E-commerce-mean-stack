import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/authService/auth.service';

@Component({
  selector: 'app-redirect',
  template: '<div>Redirecting...</div>',
  standalone: true
})
export class RedirectComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.handleRedirect();
  }

  private handleRedirect() {
    const user = this.authService.getCurrentUser();
    
    if (user && user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}

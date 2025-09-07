import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/authService/auth.service';
import { UserInterface } from '../../../../shared/models/user.interface';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
  currentUser: UserInterface | null = null;
  isSidebarOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Navigate to home even if logout request fails
        this.router.navigate(['/home']);
      }
    });
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return 'A';
    return `${this.currentUser.name.first?.[0] || ''}${this.currentUser.name.last?.[0] || ''}`.toUpperCase();
  }

  getUserFullName(): string {
    if (!this.currentUser?.name) return 'Admin';
    return `${this.currentUser.name.first || ''} ${this.currentUser.name.last || ''}`.trim();
  }
}

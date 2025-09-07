import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserInterface } from '../../../../shared/models/user.interface';

@Component({
  selector: 'app-admin-header',
  imports: [CommonModule],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css'
})
export class AdminHeader {
 pageTitle: string = 'Dashboard'; // Default title, change as needed
 pageDescription: string = 'Welcome to the admin panel'; // Default description, change as needed
 User: UserInterface | null = null


 onToggleSidebar() {
   // Add logic to toggle the sidebar here
   // For example, emit an event or call a service
   console.log('Sidebar toggle requested');
 }
}

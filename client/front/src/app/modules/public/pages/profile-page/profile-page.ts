// src/app/pages/profile/profile-page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Using FormsModule for [(ngModel)]
import { AuthService } from '../../../../core/services/authService/auth.service';// Corrected path
import { UserInterface } from '../../../../shared/models/user.interface'; // Corrected path
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css']
})
export class ProfilePage implements OnInit {
  currentUser: UserInterface | null = null;
  isEditing = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Form data model
  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    defaultAddress: ''
  };

  // Note: UserService is no longer needed here for profile updates,
  // as AuthService orchestrates this process. You would keep UserService
  // for other user-related tasks (e.g., an admin fetching a list of users).
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // PROBLEM 1 SOLVED: Use the correct method to get the current user
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.resetForm();
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.isEditing) {
      this.resetForm();
    }
  }

  resetForm(): void {
    if (!this.currentUser) return;

    const defaultAddr = this.currentUser.addresses.find(a => a.isDefault) || this.currentUser.addresses[0];
    const addressString = defaultAddr ? `${defaultAddr.street}, ${defaultAddr.area}, ${defaultAddr.city}` : '';

    this.profileForm = {
      firstName: this.currentUser.name.first,
      lastName: this.currentUser.name.last,
      email: this.currentUser.email,
      defaultAddress: addressString
    };
  }

  saveProfile(): void {
    if (!this.currentUser) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Construct the payload required by the backend
    const payload: Partial<UserInterface> = {
      name: {
        first: this.profileForm.firstName,
        last: this.profileForm.lastName
      },
      email: this.profileForm.email
      // Note: Address updating is a more complex feature.
      // The payload for `updateProfile` in AuthService accepts Partial<UserInterface>.
    };

    // PROBLEM 2 & 3 SOLVED: Call updateProfile from AuthService.
    // This single call handles the API request AND updates the local user state.
    this.authService.updateProfile(payload).subscribe({
      next: (updatedUser: UserInterface) => {
        // The service has already updated the BehaviorSubject and localStorage.
        // We just need to update the local component property.
        this.currentUser = updatedUser;
        
        this.isEditing = false;
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        console.error('Profile update error:', error);
      }
    });
  }

  changePassword(): void {
    // This is how you could implement this with your AuthService
    const currentPassword = prompt("Please enter your current password:");
    if (!currentPassword) return;

    const newPassword = prompt("Please enter your new password:");
    if (!newPassword) return;

    this.isLoading = true;
    this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
            this.isLoading = false;
            this.successMessage = "Password changed successfully!";
            setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || "Failed to change password.";
        }
    });
  }
}
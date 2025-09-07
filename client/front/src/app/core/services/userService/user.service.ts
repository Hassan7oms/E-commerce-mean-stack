// src/app/core/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../envirmonets/environment';// Adjust path if needed
import { UserInterface } from '../../../shared/models/user.interface';

// Interface for the data payload when updating a profile
export interface IProfileUpdatePayload {
  name: {
    first: string;
    last: string;
  };
  email: string;
  // Add other fields you want to allow updating
}

export interface UserResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiURL}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Fetches the profile of the currently logged-in user.
   * Assumes the backend has a protected route like GET /api/users/profile
   * @returns An Observable of the user's profile data.
   */
  getProfile(): Observable<UserInterface> {
    return this.http.get<UserInterface>(`${this.apiUrl}/profile`);
  }

  /**
   * Updates the profile of the currently logged-in user.
   * Assumes the backend has a protected route like PATCH /api/users/profile
   * @param profileData The data to update.
   * @returns An Observable of the updated user profile.
   */
  updateProfile(profileData: IProfileUpdatePayload): Observable<UserInterface> {
    return this.http.patch<UserInterface>(`${this.apiUrl}/profile`, profileData);
  }

  /**
   * Changes the user's password.
   * Assumes the backend has a protected route like POST /api/users/change-password
   * @param passwords An object with currentPassword and newPassword.
   * @returns An Observable of the success response.
   */
  changePassword(passwords: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwords);
  }

  /**
   * Get all users with pagination and filters
   * @param queryParams Query parameters for filtering and pagination
   * @returns Observable of user response
   */
  getAllUsers(queryParams: any = {}): Observable<any> {
    let params = new HttpParams();
    
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        params = params.set(key, queryParams[key].toString());
      }
    });

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  /**
   * Get user statistics
   * @returns Observable of user statistics
   */
  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  /**
   * Toggle user active status
   * @param userId User ID to toggle status
   * @returns Observable of updated user
   */
  toggleUserStatus(userId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${userId}/toggle-status`, {});
  }

  /**
   * Delete user (soft delete)
   * @param userId User ID to delete
   * @returns Observable of success response
   */
  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Search users
   * @param query Search query
   * @param page Page number
   * @param limit Items per page
   * @returns Observable of user response
   */
  searchUsers(query: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }
  
  // You can add other methods here like:
  // addAddress(address: IAddress): Observable<UserInterface> { ... }
  // updateAddress(addressId: string, address: IAddress): Observable<UserInterface> { ... }
  // deleteAddress(addressId: string): Observable<UserInterface> { ... }
}
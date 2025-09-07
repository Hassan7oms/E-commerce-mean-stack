import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from '../apiService/api.service';
import { UserInterface } from '../../../shared/models/user.interface';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: UserInterface;
  token: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInterface | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.currentUserSubject.next(userData);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  // Login user
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/users/login', credentials).pipe(
      tap(response => {
        this.setAuthData(response.user, response.token);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  // Register user
  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Transform the data to match backend expectations
    const [firstName, ...lastNameParts] = userData.name.split(' ');
    const lastName = lastNameParts.join(' ') || '';
    
    const backendData = {
      name: {
        first: firstName,
        last: lastName
      },
      email: userData.email,
      password: userData.password,
      addresses: [] // Default empty addresses array
    };
    
    return this.apiService.post<AuthResponse>('/users/register', backendData).pipe(
      tap(response => {
        this.setAuthData(response.user, response.token);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  // Logout user
  logout(): Observable<any> {
    return this.apiService.post('/logout', {}).pipe(
      tap(() => {
        this.clearAuthData();
      }),
      catchError(error => {
        // Even if logout fails on server, clear local data
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  // Get current user
  getCurrentUser(): UserInterface | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Refresh user data
  refreshUser(): Observable<UserInterface> {
    return this.apiService.get<UserInterface>('/profile').pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError(error => {
        console.error('Error refreshing user data:', error);
        return throwError(() => error);
      })
    );
  }

  // Update user profile
  updateProfile(userData: Partial<UserInterface>): Observable<UserInterface> {
    return this.apiService.put<UserInterface>('/profile', userData).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        return throwError(() => error);
      })
    );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.apiService.put('/change-password', {
      currentPassword,
      newPassword
    }).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => error);
      })
    );
  }

  // Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.apiService.post('/forgot-password', { email }).pipe(
      catchError(error => {
        console.error('Error sending password reset:', error);
        return throwError(() => error);
      })
    );
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.apiService.post('/reset-password', {
      token,
      newPassword
    }).pipe(
      catchError(error => {
        console.error('Error resetting password:', error);
        return throwError(() => error);
      })
    );
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Private helper methods
  private setAuthData(user: UserInterface, token: string): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearAuthData(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Validate token (optional - for token expiration checking)
  validateToken(): Observable<boolean> {
    return this.apiService.get<{valid: boolean}>('/validate-token').pipe(
      map(response => response.valid),
      catchError(() => {
        this.clearAuthData();
        return throwError(() => new Error('Invalid token'));
      })
    );
  }
}

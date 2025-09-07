import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../envirmonets/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  // Generic GET request
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params });
  }

  // Authenticated GET request
  getWithAuth<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { headers, params });
  }

  // Generic POST request
  post<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  // Generic PUT request
  put<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  // Generic DELETE request
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers });
  }

  // Generic PATCH request
  patch<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data, { headers });
  }

  // Upload file with FormData
  uploadFile<T>(endpoint: string, formData: FormData, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, { headers });
  }

  // Get headers with authentication token
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get headers for file upload
  getUploadHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}

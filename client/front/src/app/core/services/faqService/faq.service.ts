import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../apiService/api.service';
import { HttpParams } from '@angular/common/http';

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQResponse {
  data: FAQ[];
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
export class FAQService {

  constructor(private apiService: ApiService) {}

  // Get all FAQs with pagination
  getAllFAQs(page: number = 1, limit: number = 10): Observable<FAQResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService.get<FAQResponse>('/faq', params);
  }

  // Create new FAQ
  createFAQ(faqData: any): Observable<{ data: FAQ }> {
    return this.apiService.post<{ data: FAQ }>('/faq', faqData);
  }

  // Update FAQ
  updateFAQ(faqId: string, faqData: any): Observable<{ data: FAQ }> {
    return this.apiService.put<{ data: FAQ }>(`/faq/${faqId}`, faqData);
  }

  // Delete FAQ
  deleteFAQ(faqId: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/faq/${faqId}`);
  }

  // Toggle FAQ status
  toggleFAQStatus(faqId: string): Observable<{ data: FAQ }> {
    return this.apiService.patch<{ data: FAQ }>(`/faq/${faqId}/toggle-status`, {});
  }

  // Search FAQs
  searchFAQs(query: string, page: number = 1, limit: number = 10): Observable<FAQResponse> {
    const params = new HttpParams()
      .set('search', query)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.apiService.get<FAQResponse>('/faq/search', params);
  }

  // Get FAQ statistics
  getFAQStats(): Observable<any> {
    return this.apiService.get<any>('/faq/stats');
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../apiService/api.service';
import { Itestmonials } from '../../../shared/models/itestmonials';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {

  constructor(private apiService: ApiService) {}

  // Get all testimonials
  getAllTestimonials(): Observable<Itestmonials[]> {
    return this.apiService.get<Itestmonials[]>('/gettestimonials');
  }

  // Get approved testimonials only
  getApprovedTestimonials(): Observable<Itestmonials[]> {
    return this.apiService.get<Itestmonials[]>('/gettestimonials?approved=true');
  }

  // Get testimonials by product
  getTestimonialsByProduct(productId: string): Observable<Itestmonials[]> {
    return this.apiService.get<Itestmonials[]>(`/gettestimonials?product=${productId}`);
  }

  // Get testimonials by user
  getTestimonialsByUser(userId: string): Observable<Itestmonials[]> {
    return this.apiService.get<Itestmonials[]>(`/gettestimonials?user=${userId}`);
  }

  // Get featured testimonials (for home page)
  getFeaturedTestimonials(limit: number = 3): Observable<Itestmonials[]> {
    return this.apiService.get<Itestmonials[]>(`/gettestimonials?featured=true&limit=${limit}`);
  }

  // Helper method to filter approved testimonials
  filterApprovedTestimonials(testimonials: Itestmonials[]): Itestmonials[] {
    return testimonials.filter(testimonial => 
      testimonial.isApproved && 
      testimonial.isActive && 
      !testimonial.isDeleted
    );
  }

  // Helper method to get average rating
  getAverageRating(testimonials: Itestmonials[]): number {
    if (testimonials.length === 0) return 0;
    const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
    return totalRating / testimonials.length;
  }

  // Helper method to get rating distribution
  getRatingDistribution(testimonials: Itestmonials[]): { [key: number]: number } {
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    testimonials.forEach(testimonial => {
      distribution[testimonial.rating]++;
    });
    return distribution;
  }
}

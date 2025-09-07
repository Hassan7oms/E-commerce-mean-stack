import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../envirmonets/environment';
import { WishlistInterface } from '../../../shared/models/wishlist.interface';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  constructor(private _http: HttpClient) {}
  private url = environment.apiURL + '/wishlist'

  getWishlist() {
    return this._http.get<WishlistInterface[]>(this.url + '/getWishlist');
  }

  removeFromWishlist(productId: string) {
    // Assuming backend expects DELETE to /wishlist/remove/:productId
    return this._http.delete(this.url + '/remove/' + productId);
  }

  clearWishlist() {
    return this._http.delete(this.url + '/clear');
  }
}

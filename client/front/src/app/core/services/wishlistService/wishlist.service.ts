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
    return this._http.get<WishlistInterface[]>(this.url + '/getwishlist');
  }

  addToWishlist(productId: string) {
    return this._http.post(this.url + '/addtowishlist', { productId });
  }

  removeFromWishlist(productId: string) {
    return this._http.delete(this.url + '/removewishlist/' + productId);
  }

  clearWishlist() {
    return this._http.delete(this.url + '/clear');
  }
}

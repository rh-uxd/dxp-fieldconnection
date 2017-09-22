import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { ProductModel } from '../models/product.model';


@Injectable()
export class ProductService {

  constructor (private http: Http) {
  }

  getProducts(): Observable<ProductModel[]> {
    return this.http
      .get('data/products.json')
      .map(response => {
        return response.json().products as ProductModel[];
      });
  }
}

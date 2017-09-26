import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { ProductGroupModel } from '../models/productGroup.model';

@Injectable()
export class ProductService {

  constructor (private http: Http) {
  }

  getProducts(): Observable<ProductGroupModel[]> {
    return this.http
      .get('data/products.json')
      .map(response => {
        return response.json().productGroups as ProductGroupModel[];
      });
  }
}

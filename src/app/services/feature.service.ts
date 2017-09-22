import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { FeatureModel } from '../models/feature.model';

@Injectable()
export class FeatureService {

  constructor (private http: Http) {
  }

  getFeatures(): Observable<FeatureModel[]> {
    return this.http
      .get('data/features.json')
      .map(response => {
        return response.json().features as FeatureModel[];
      });
  }
}

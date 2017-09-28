import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { ResultsModel } from '../models/results.model';

@Injectable()
export class ResultsService {

  constructor (private http: Http) {
  }

  getResults(): Observable<ResultsModel[]> {
    return this.http
      .get('data/results.json')
      .map(response => {
        return response.json().results as ResultsModel[];
      });
  }
}

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Http } from '@angular/http';
import { SurveyModel } from '../models/survey.model';

@Injectable()
export class SurveyService {

  constructor (private http: Http) {
  }

  getSurveys(): Observable<SurveyModel[]> {
    return this.http
      .get('data/surveys.json')
      .map(response => {
        return response.json().surveys as SurveyModel[];
      });
  }
}

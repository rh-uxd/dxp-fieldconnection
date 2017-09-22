import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { FeedbackModel } from '../models/feedback.model';

@Injectable()
export class FeedbackService {

  constructor (private http: Http) {
  }

  getFeedback(): Observable<FeedbackModel[]> {
    return this.http
      .get('data/feedback.json')
      .map(response => {
        return response.json().feedback as FeedbackModel[];
      });
  }
}

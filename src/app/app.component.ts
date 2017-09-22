import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FeatureService } from './services/feature.service';
import { FeatureModel } from './models/feature.model';
import { Subscription } from 'rxjs/Subscription';
import { SurveyModel } from './models/survey.model';
import { SurveyService } from './services/survey.service';
import { ProductModel } from './models/product.model';
import { ProductService } from './services/product.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';
import { FeedbackService } from './services/feedback.service';
import { FeedbackModel } from './models/feedback.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {

  public features: FeatureModel[];
  public surveys: SurveyModel[];
  public products: ProductModel[];
  public feedbacks: FeedbackModel[];

  private featureSubscription: Subscription;

  constructor (private featureService: FeatureService,
               private surveyService: SurveyService,
               private feedbackService: FeedbackService,
               private productService: ProductService) {
  }

  ngOnInit() {
    const featureObservable = this.featureService.getFeatures();
    const surveyObservable = this.surveyService.getSurveys();
    const productObservable = this.productService.getProducts();
    const feedbackObservable = this.feedbackService.getFeedback();

    this.featureSubscription = Observable.forkJoin([featureObservable, surveyObservable, productObservable, feedbackObservable])
      .subscribe(([features, surveys, products, feedback]) => {
        this.products = products;
        this.features = features;
        this.surveys = surveys;
        this.feedbacks = feedback;
    });
  }

  ngOnDestroy() {
    this.featureSubscription.unsubscribe();
  }

  getProductName(productId: string ): string {
    if (this.products) {
      const matching = this.products.find((product) => {
        return product.id === productId;
      });
      return matching.name;
    }
  }
}

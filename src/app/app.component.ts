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
import { ResultsService } from './services/results.service';
import { ResultsModel } from './models/results.model';

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
  public results: ResultsModel[];
  public resultsDisplay: ResultsModel[] = [];
  public totalResults = 0;

  private featureSubscription: Subscription;

  constructor (private featureService: FeatureService,
               private surveyService: SurveyService,
               private feedbackService: FeedbackService,
               private productService: ProductService,
               private resultsService: ResultsService) {
  }

  ngOnInit() {
    const featureObservable = this.featureService.getFeatures();
    const surveyObservable = this.surveyService.getSurveys();
    const productObservable = this.productService.getProducts();
    const feedbackObservable = this.feedbackService.getFeedback();
    const resultsObservable = this.resultsService.getResults();

    this.featureSubscription = Observable.forkJoin([
      featureObservable,
      surveyObservable,
      productObservable,
      feedbackObservable,
      resultsObservable])
      .subscribe(([features, surveys, products, feedback, results]) => {
        this.products = products;
        this.features = features;
        this.surveys = surveys;
        this.feedbacks = feedback;
        this.results = results;
        this.totalResults = results.length;
        this.resultsDisplay = this.results.splice(0, 4);
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

  loadMoreResults(): void {
    if (this.results.length > 0) {
      this.resultsDisplay = this.resultsDisplay.concat(this.results.splice(0, 4));
    }
  }
}

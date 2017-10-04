import { Component, OnChanges, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FeatureService } from './services/feature.service';
import { FeatureModel } from './models/feature.model';
import { Subscription } from 'rxjs/Subscription';
import { SurveyModel } from './models/survey.model';
import { SurveyService } from './services/survey.service';
import { ProductService } from './services/product.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import { FeedbackService } from './services/feedback.service';
import { FeedbackModel } from './models/feedback.model';
import { ResultsService } from './services/results.service';
import { ResultsModel } from './models/results.model';
import { SlickComponent } from 'ngx-slick';
import { DatePipe } from '@angular/common';
import { ProductGroupModel } from './models/productGroup.model';
import { ProductModel } from './models/product.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {

  public features: FeatureModel[];
  public surveys: SurveyModel[] = [];
  public productGroups: ProductGroupModel[] = [];
  public feedbacks: FeedbackModel[]= [];
  public results: ResultsModel[];
  public resultsDisplay: ResultsModel[] = [];
  public totalResults = 0;

  public sessionConfig: any;
  public surveyConfig: any;
  public surveySlide = 0;
  public sessionSlide = 0;
  public currentFilters: string[] = [];

  @ViewChild('surveyModal') surveyModal: SlickComponent;
  @ViewChild('sessionModal') sessionModal: SlickComponent;

  private featureSubscription: Subscription;
  private currentBreakpoint: number;
  private slidesToShow: number;

  constructor (private featureService: FeatureService,
               private surveyService: SurveyService,
               private feedbackService: FeedbackService,
               private productService: ProductService,
               private resultsService: ResultsService,
               private datePipe: DatePipe) {
  }

  ngOnInit() {
    const featureObservable = this.featureService.getFeatures();
    const surveyObservable = this.surveyService.getSurveys();
    const productObservable = this.productService.getProducts();
    const feedbackObservable = this.feedbackService.getFeedback();
    const resultsObservable = this.resultsService.getResults();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    this.featureSubscription = Observable.forkJoin([
      featureObservable,
      surveyObservable,
      productObservable,
      feedbackObservable,
      resultsObservable])
      .subscribe(([features, surveys, productGroups, feedbacks, results]) => {
        this.productGroups = productGroups;
        this.features = features;
        this.surveys = surveys.filter((survey) => {
          return new Date(survey.expirationDate) > yesterday;
        });
        this.feedbacks = feedbacks.filter((feedback) => {
          return new Date(feedback.endDate) > yesterday;
        });
        this.results = results;
        this.totalResults = results.length;
        this.resultsDisplay = this.results.splice(0, 4);
    });

    this.sessionConfig = {
      appendArrows: '#carousel1 .pagination',
      prevArrow: '<button class="slick-prev">Previous</button>',
      nextArrow: '<button class="slick-next">Next</button>',
      dots: false,
      infinite: false,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
          }
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };

    this.surveyConfig = {
      appendArrows: '#carousel0 .pagination',
      prevArrow: '<button class="slick-prev">Previous</button>',
      nextArrow: '<button class="slick-next">Next</button>',
      dots: false,
      infinite: false,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
          }
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };
    this.slidesToShow = this.surveyConfig.slidesToShow;
  }

  ngOnDestroy() {
    this.featureSubscription.unsubscribe();
  }

  getProductName(productId: string): string {
    let productName = '';
    if (this.productGroups) {
      this.productGroups.forEach( (productGroup) => {
        const matchingProduct = productGroup.products.find((product) => {
          return product.id === productId;
        });
        if (matchingProduct) {
          productName = matchingProduct.name;
        }
      });
    }
    return productName;
  }

  getProductGroup(productId: string): string {
    let groupGroupName = '';
    if (this.productGroups) {
      this.productGroups.forEach( (productGroup) => {
        const matchingProduct = productGroup.products.find((product) => {
          return product.id === productId;
        });
        if (matchingProduct) {
          groupGroupName = productGroup.groupName;
        }
      });
    }
    return groupGroupName;
  }

  getProductGroupIndex(productId: string): number {
    let index = 0,
      matchingIndex = 0;
    if (this.productGroups) {
      this.productGroups.forEach( (productGroup) => {
        const matchingProduct = productGroup.products.find((product) => {
          return product.id === productId;
        });
        if (matchingProduct) {
          matchingIndex = index;
        }
        index++;
      });
    }
    return matchingIndex;
  }

  loadMoreResults(): void {
    if (this.results.length > 0) {
      this.resultsDisplay = this.resultsDisplay.concat(this.results.splice(0, 4));
    }
  }

  getFilteredSurveys(): SurveyModel[] {
    if (this.currentFilters.length > 0 ) {
      const filteredSurveys: SurveyModel[] = [];
      this.surveys.forEach((survey) => {
        if (this.currentFilters.indexOf(survey.productId) > -1) {
          filteredSurveys.push(survey);
        }
      });
      return filteredSurveys;
    }
    return this.surveys;
  }

  getFilteredSessions(): FeedbackModel[] {
    if (this.currentFilters.length > 0 ) {
      const filteredSessions: FeedbackModel[] = [];
      this.feedbacks.forEach((feedback) => {
        if (this.currentFilters.indexOf(feedback.productId) > -1) {
          filteredSessions.push(feedback);
        }
      });
      return filteredSessions;
    }
    return this.feedbacks;
  }

  generateEventLink(event: FeedbackModel): string {
    const startDate = this.datePipe.transform(event.startDate, 'yMMddThhmmss');
    const endDate = this.datePipe.transform(event.endDate, 'yMMddThhmmss');
    const title = 'DXP Feedback Session: ' + this.getProductName(event.productId);
    // tslint:disable-next-line
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${event.description}&sf=true&output=xml`;
  }

  // Slick functions
  afterSurveyChange(event: any): void {
    this.surveySlide = event.currentSlide;
  }

  afterSessionChange(event: any): void {
    this.sessionSlide = event.currentSlide;
  }

  calculateSurveyPaging(currentSlideNumber: number): string {
    const comp = this.surveyModal;
    const totalSlides = this.getFilteredSurveys().length;
    return this.calculatePaging(currentSlideNumber, this.slidesToShow, totalSlides);
  }

  calculateSessionPaging(currentSlideNumber: number): string {
    const comp = this.sessionModal;
    const totalSlides = this.getFilteredSessions().length;
    return this.calculatePaging(currentSlideNumber, this.slidesToShow, totalSlides);
  }

  calculatePaging(currentSlideNumber: number, slidesToShow: number, totalSlides: number): string {
    const total = ((currentSlideNumber + slidesToShow) > totalSlides) ?
      totalSlides :
      currentSlideNumber + slidesToShow;

    if (total === 0) {
      return '0';
    }
    let start = currentSlideNumber;
    if (total < currentSlideNumber + slidesToShow && (total - slidesToShow > 0)) {
      start = total - slidesToShow;
    } else if (total === currentSlideNumber + 1 && slidesToShow !== 1) {
      start = total - slidesToShow;
    }

    return slidesToShow === 1 ? (start + 1).toString() : (start + 1) + ' - ' + total;
  }

  onBreakpointChange(event: any): void {
    this.currentBreakpoint = event.breakpoint;
    const slick = event.slick;
    if (this.currentBreakpoint) {
      this.slidesToShow = slick['breakpointSettings'][this.currentBreakpoint].slidesToShow;
    } else {
      this.slidesToShow = this.surveyConfig.slidesToShow;
    }
  }
  // End slick functions

  // Filter logic
  triggerGroupSelect(productGroup: ProductGroupModel): void {
    const deselectAll = this.allProductsInGroupSelected(productGroup);
    productGroup.products.forEach((product) => {
      if (deselectAll) {
        product.filter = false;
        this.remove(this.currentFilters, product.id);
      } else {
        product.filter = true;
        if (this.currentFilters.indexOf(product.id) === -1 ) {
          this.currentFilters.push(product.id);
        }
      }
    });
  }

  triggerProductSelect(product: ProductModel): void {
    if (product.filter) {
      setTimeout(() => {
        product.filter = false;
      });
      this.remove(this.currentFilters, product.id);
    } else {
      setTimeout(() => {
        product.filter = true;
      });
      this.currentFilters.push(product.id);
    }
  }

  allProductsInGroupSelected(productGroup: ProductGroupModel): boolean {
    const matching = productGroup.products.find((product) => {
      return !product.filter;
    });
    // if any aren't selected, return false
    return !matching;
  }

  removeFilter(product: ProductModel): void {
    product.filter = false;
    this.remove(this.currentFilters, product.id);
  }

  getActiveFilters(): any[] {
    const activeFilters: any[] = [];
    let i = 0;
    this.productGroups.forEach( (productGroup) => {
      productGroup.products.forEach((product) => {
        if (product.filter && product.filter) {
          activeFilters.push({'productGroupIndex': i, 'product': product});
        }
      });
      i++;
    });
    return activeFilters;
  }
  // End filter logic

  /**
   * Remove element from array
   * @param array
   * @param element
   */
  private remove(array, element): void {
    const index = array.indexOf(element);

    if (index !== -1) {
      array.splice(index, 1);
    }
  }
}

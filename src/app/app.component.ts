import { Component, OnChanges, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FeatureService } from './services/feature.service';
import { FeatureModel } from './models/feature.model';
import { Subscription } from 'rxjs/Subscription';
import { SurveyModel } from './models/survey.model';
import { SurveyService } from './services/survey.service';
import { ProductService } from './services/product.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/switch';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/concatAll';

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

  public featuresDisplay: FeatureModel[] = [];
  public surveysDisplay: SurveyModel[] = [];
  public productGroups: ProductGroupModel[] = [];
  public feedbacksDisplay: FeedbackModel[]= [];
  public filteredResults: ResultsModel[] = [];
  public resultsDisplay: ResultsModel[] = [];
  public totalResults = 0;

  public sessionConfig: any;
  public surveyConfig: any;
  public surveySlide = 0;
  public sessionSlide = 0;
  public currentFilters: string[] = [];
  public formOpen = false;

  public surveys: SurveyModel[] = [];
  public features: FeatureModel[] = [];
  public feedbacks: FeedbackModel[]= [];
  public results: ResultsModel[] = [];

  @ViewChild('surveyModal') surveyModal: SlickComponent;
  @ViewChild('sessionModal') sessionModal: SlickComponent;

  private featureSubscription: Subscription;
  private currentBreakpoint: number;
  private slidesToShow: number;
  private filterObservable: Observable<string []>;
  private emitter: any;


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

    if (localStorage.getItem('dxp-filter')) {
      this.currentFilters = JSON.parse(localStorage.getItem('dxp-filter'));
    }

    this.filterObservable = Observable.create(e => this.emitter = e);
    this.filterObservable.subscribe((filters) => {
      this.productGroups.forEach((group) => {
        group.products.forEach((product) => {
          product.filter = (this.currentFilters.indexOf(product.id) !== -1 );
        });
      });

      this.featuresDisplay = this.features.filter((feature) => {
        return this.currentFilters.length === 0 || this.currentFilters.indexOf(feature.productId) !== -1;
      });

      this.surveysDisplay = this.surveys.filter((survey) => {
        return this.currentFilters.length === 0 || this.intersects(this.currentFilters, survey.productIds);
      });

      this.feedbacksDisplay = this.feedbacks.filter((feedback) => {
        return this.currentFilters.length === 0 || this.intersects(this.currentFilters, feedback.productIds);
      });

      this.filteredResults = this.results.filter((result) => {
        return this.currentFilters.length === 0 || this.intersects(this.currentFilters, result.productIds);
      });
      this.resultsDisplay = this.filteredResults.splice(0, 4);
      this.totalResults = this.filteredResults.length + this.resultsDisplay.length;
    });

    this.featureSubscription = Observable.forkJoin([
      featureObservable,
      surveyObservable,
      productObservable,
      feedbackObservable,
      resultsObservable])
      .subscribe(([features, surveys, productGroups, feedbacks, results]) => {
        // apply any existing filters
        this.productGroups = productGroups;
        this.features = features;
        this.surveys = surveys.filter((survey) => {
          return new Date(survey.expirationDate) > yesterday;
        });
        this.feedbacks = feedbacks.filter((feedback) => {
          return new Date(feedback.endDate) > yesterday;
        });
        this.results = results;
        this.emitter.next(this.currentFilters);
      });

    this.sessionConfig = {
      appendArrows: '#carousel1 .cards__pagination',
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
      appendArrows: '#carousel0 .cards__pagination',
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

  getJoinedProducts(productIds: string[] = []): string {
    let joinedProducts: string[] = [];
    productIds.forEach((id) => {
      joinedProducts.push(this.getProductName(id));
    });
    return joinedProducts.join(', ');
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

  getMatchingProductGroups(productIds: string[] = []): any[] {
    const matchingGroups: any[] = [];
    const addedIndex: number[] = [];
    productIds.forEach((productId) => {
      const index = this.getProductGroupIndex(productId);
      const matchingGroup = {name: this.getProductGroup(productId), index: index};
      if (addedIndex.indexOf(index) === -1) {
        matchingGroups.push(matchingGroup);
        addedIndex.push(index);
      }
    });
    return matchingGroups;
  }

  loadMoreResults(): void {
    if (this.filteredResults.length > 0) {
      this.resultsDisplay = this.resultsDisplay.concat(this.filteredResults.splice(0, 4));
    }
  }

  generateEventLink(event: FeedbackModel): string {
    const startDate = this.datePipe.transform(event.startDate, 'yMMddThhmmss');
    const endDate = this.datePipe.transform(event.endDate, 'yMMddThhmmss');
    const title = 'DXP Feedback Session: ' + this.getJoinedProducts(event.productIds);
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
    const totalSlides = this.surveysDisplay.length;
    return this.calculatePaging(currentSlideNumber, this.slidesToShow, totalSlides);
  }

  calculateSessionPaging(currentSlideNumber: number): string {
    const comp = this.sessionModal;
    const totalSlides = this.feedbacksDisplay.length;
    return this.calculatePaging(currentSlideNumber, this.slidesToShow, totalSlides);
  }

  calculatePaging(currentSlideNumber: number, slidesToShow: number, totalSlides: number): string {
    const total = ((currentSlideNumber + slidesToShow) > totalSlides) ?
      totalSlides :
      currentSlideNumber + slidesToShow;

    if (total === 0 || total === 1) {
      return total.toString();
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
  openFilter(): void {
    this.formOpen = true;
  }

  closeFilter(): void {
    this.formOpen = false;
  }

  updateFilter(): void {
    // save to local storage here
    this.updateSavedFilter();
    this.formOpen = false;
  }

  updateSavedFilter(): void {
    this.emitter.next(this.currentFilters);
    localStorage.setItem('dxp-filter', JSON.stringify(this.currentFilters));
  }

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
    this.updateSavedFilter();
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
    this.updateSavedFilter();
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
    this.updateSavedFilter();
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

  private intersects(first: string[], second: string[]): boolean {
    let intersects = false;
    first.forEach((item) => {
      if (second.indexOf(item) > -1 ){
        intersects = true;
      }
    });
    return intersects;
  }
}

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
  public surveys: SurveyModel[];
  public productGroups: ProductGroupModel[] = [];
  public feedbacks: FeedbackModel[];
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

    this.featureSubscription = Observable.forkJoin([
      featureObservable,
      surveyObservable,
      productObservable,
      feedbackObservable,
      resultsObservable])
      .subscribe(([features, surveys, productGroups, feedback, results]) => {
        this.productGroups = productGroups;
        this.features = features;
        this.surveys = surveys;
        this.feedbacks = feedback;
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

  afterSurveyChange(event: any): void {
    this.surveySlide = event.currentSlide;
  }

  afterSessionChange(event: any): void {
    this.sessionSlide = event.currentSlide;
  }

  loadMoreResults(): void {
    if (this.results.length > 0) {
      this.resultsDisplay = this.resultsDisplay.concat(this.results.splice(0, 4));
    }
  }

  generateEventLink(event: FeedbackModel): string {
    const startDate = this.datePipe.transform(event.startDate, 'yMMddThhmmss');
    const endDate = this.datePipe.transform(event.endDate, 'yMMddThhmmss');
    const title = 'DXP Feedback Session: ' + this.getProductName(event.productId);
    // tslint:disable-next-line
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${event.description}&sf=true&output=xml`;
  }

  calculateSurveyPaging(currentSlideNumber: number): string {
    const comp = this.surveyModal;
    return this.calculatePaging(currentSlideNumber, comp);
  }

  calculateSessionPaging(currentSlideNumber: number): string {
    const comp = this.sessionModal;
    return this.calculatePaging(currentSlideNumber, comp);
  }

  calculatePaging(currentSlideNumber: number, comp: SlickComponent): string {
    const total = ((currentSlideNumber + comp.config.slidesToShow) > comp.slides.length) ?
      comp.slides.length :
      currentSlideNumber + comp.config.slidesToShow;

    let start = currentSlideNumber;
    if (total === currentSlideNumber + 1 && comp.config.slidesToShow !== 1) {
      start = total - comp.config.slidesToShow;
    }

    return comp.config.slidesToShow === 1 ? (start + 1).toString() : (start + 1) + ' - ' + total;
  }

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
      product.filter = false;
      this.remove(this.currentFilters, product.id);
    } else {
      product.filter = true;
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

  getActiveFilters(): ProductModel[] {
    const activeFilters: ProductModel[] = [];
    this.productGroups.forEach( (productGroup) => {
      productGroup.products.forEach((product) => {
        if (product.filter && product.filter) {
          activeFilters.push(product);
        }
      });
    });
    return activeFilters;
  }

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

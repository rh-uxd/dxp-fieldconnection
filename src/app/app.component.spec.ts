import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { FeatureService } from './services/feature.service';
import { ProductService } from './services/product.service';
import { SurveyService } from './services/survey.service';
import { BaseRequestOptions, Http } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { FeedbackService } from './services/feedback.service';
import { ResultsService } from './services/results.service';
import { DatePipe } from '@angular/common';
import { SlickModule } from 'ngx-slick';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        SlickModule.forRoot()
      ],
      providers: [
        FeatureService,
        ProductService,
        SurveyService,
        FeedbackService,
        ResultsService,
        DatePipe,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend, options) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        }
  ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});

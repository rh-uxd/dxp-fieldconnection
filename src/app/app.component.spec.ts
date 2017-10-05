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
import { FormsModule } from '@angular/forms';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        SlickModule.forRoot(),
        FormsModule
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

  it('should calculate paging correctly', async( () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    let paging = app.calculatePaging(1, 4, 3);
    expect(paging).toBe('2 - 3');

    paging = app.calculatePaging(0, 4, 1);
    expect(paging).toBe('1');

    paging = app.calculatePaging(2, 4, 4);
    expect(paging).toBe('3 - 4');

    paging = app.calculatePaging(4, 4, 6);
    expect(paging).toBe('3 - 6');

    paging = app.calculatePaging(4, 2, 6);
    expect(paging).toBe('5 - 6');
  }));
});

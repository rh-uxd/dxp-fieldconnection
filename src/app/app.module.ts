import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FeatureService } from './services/feature.service';
import { HttpModule } from '@angular/http';
import { SurveyService } from './services/survey.service';
import { ProductService } from './services/product.service';
import { FeedbackService } from './services/feedback.service';
import { ResultsService } from './services/results.service';
import { SlickModule } from 'ngx-slick';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    // Specify your library as an import
    SlickModule.forRoot()
  ],
  providers: [FeatureService, SurveyService, ProductService, FeedbackService, ResultsService],
  bootstrap: [AppComponent]
})
export class AppModule { }

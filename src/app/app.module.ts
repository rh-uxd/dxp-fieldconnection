import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FeatureService } from './services/feature.service';
import { HttpModule } from '@angular/http';
import { SurveyService } from './services/survey.service';
import { ProductService } from './services/product.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [FeatureService, SurveyService, ProductService],
  bootstrap: [AppComponent]
})
export class AppModule { }

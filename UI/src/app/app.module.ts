import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

/* Angular Material */
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  LOCALE_ID,
  SecurityContext,
} from '@angular/core';

/* FormsModule */
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* Components */
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { Globals } from './globals';

import { AuthenticationService } from './services/auth.service';
import { RestaurantService } from './services/restaurant.service';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MenuService } from './services/menu.service';
import { QrMenuService } from './services/qrmenu.service';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { registerLocaleData } from '@angular/common';
import localeBe from '@angular/common/locales/be';
import localeRu from '@angular/common/locales/ru';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { SidenavService } from './services/sidenav.service';
import { DrawService } from './services/draw.service';
import { ScreenService } from './services/screen.service';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { FeedbackService } from './services/feedback.service';

import { TranslateHelperClass } from './services/translate-helper.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MarkdownModule } from 'ngx-markdown';
import { TutorialComponent } from './components/tutorial/tutorial';
import { OnlyNumbersAndLetters } from './directives/only-numbers-and-letters';
import { ContactUsDialog } from './components/contact-us/contact-us';
import { AngularMaterialModule } from './angular-material.module';
import { ConfirmationDialog } from './components/confirmation-dialog/confirmation-dialog';
import { AppRoutingModule } from './app-routing.module';
import { CreateCodeComponent } from './components/create-code/create-code.component';
import { CodesComponent } from './components/codes/codes.component';
import { QrMenuComponent } from './components/qr-menu/qr-menu.component';
import { MenuOcrComponent } from './menus/menu-ocr/menu-ocr.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import {
  EditMealsComponent,
  SearchFilterPipe,
} from './components/edit-meals/edit-meals.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApiModule } from './api/api.module';
import { Configuration, ConfigurationParameters } from './api/configuration';
import { TopToolbarComponent } from './components/top-toolbar/top-toolbar.component';
import { DrawerContentComponent } from './components/drawer-content/drawer-content.component';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenusModule } from './menus/menus.module';
import { GeocodingService } from './services/geocoding.service';
import { NgOcrEditorComponent } from 'ng-ocr-editor';

registerLocaleData(localeBe);
registerLocaleData(localeRu);

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: 'http://localhost:3000',
  };
  return new Configuration(params);
}

@NgModule({
  declarations: [
    AppComponent,
    TutorialComponent,
    OnlyNumbersAndLetters,
    ContactUsDialog,
    ConfirmationDialog,
    CreateCodeComponent,
    CodesComponent,
    QrMenuComponent,
    LogInComponent,
    TopToolbarComponent,
    DrawerContentComponent,
    RegisterComponent,
    EditMealsComponent,
    SearchFilterPipe,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    // https://www.kevinboosten.dev/how-i-use-an-openapi-spec-in-my-angular-projects
    ApiModule.forRoot(apiConfigFactory),
    AngularMaterialModule,
    RestaurantsModule,
    MenusModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatSliderModule,
    MatStepperModule,
    MatProgressBarModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      sanitize: SecurityContext.NONE,
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'ru',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    Globals,
    AuthenticationService,
    GeocodingService,
    RestaurantService,
    MenuService,
    QrMenuService,
    SidenavService,
    DrawService,
    ScreenService,
    FeedbackService,
    TranslateHelperClass,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },
    { provide: LOCALE_ID, useValue: 'ru-RU' },
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService],
    },
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } },
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule { }

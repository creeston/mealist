import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantCardComponent } from './restaurant-card/restaurant-card.component';
import { RestaurantsComponent } from './restaurants/restaurants.component';
import { RestaurantFormDialog } from './restaurant-form/restaurant-form.component';
import { AngularMaterialModule } from '../angular-material.module';
import { HttpLoaderFactory } from '../app.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestaurantMapComponent } from './restaurant-map/restaurant-map.component';

@NgModule({
  declarations: [
    RestaurantCardComponent,
    RestaurantsComponent,
    RestaurantFormDialog,
    RestaurantMapComponent
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule.forRoot({
      defaultLanguage: 'ru',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
})
export class RestaurantsModule { }

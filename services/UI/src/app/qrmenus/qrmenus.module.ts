import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../angular-material.module';
import { HttpLoaderFactory } from '../app.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QrMenusComponent } from './qrmenus/qrmenus.component';
import { QrMenuFormComponent } from './qrmenu-form/qrmenu-form.component';
import {
  EditMealsComponent,
  SearchFilterPipe,
} from './edit-meals/edit-meals.component';
import { QrMenuComponent } from './qrmenu/qrmenu.component';
import { NgxKjuaComponent } from 'ngx-kjua';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QrmenuCardComponent } from './qrmenu-card/qrmenu-card.component';
import { QrmenuPreviewComponent } from './qrmenu-preview/qrmenu-preview.component';
import { MccColorPickerModule } from 'material-community-components/color-picker';
import { ColorInputComponent } from '../components/color-input/color-input.component';
import { GradientBorderComponent } from '../components/gradient-border/gradient-border.component';

@NgModule({
  declarations: [
    QrmenuCardComponent,
    QrMenusComponent,
    QrMenuFormComponent,
    EditMealsComponent,
    QrMenuComponent,
    SearchFilterPipe,
    QrmenuPreviewComponent,
  ],
  imports: [
    NgxKjuaComponent,
    ColorInputComponent,
    GradientBorderComponent,
    CommonModule,
    MatStepperModule,
    MatFormFieldModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    MccColorPickerModule,
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
export class QrMenusModule {}

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
import { NgxKjuaComponent } from 'ngx-kjua';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QrmenuCardComponent } from './qrmenu-card/qrmenu-card.component';
import { QrmenuPreviewComponent } from './qrmenu-preview/qrmenu-preview.component';
import { MccColorPickerModule } from 'material-community-components/color-picker';
import { ColorInputComponent } from '../components/color-input/color-input.component';
import { QrMenuFormGeneralStepComponent } from './qrmenu-form/qrmenu-form-general-step/qrmenu-form-general-step.component';
import { QrMenuFormMenusStepComponent } from './qrmenu-form/qrmenu-form-menus-step/qrmenu-form-menus-step.component';
import { QrMenuFormStyleStepComponent } from './qrmenu-form/qrmenu-form-style-step/qrmenu-form-style-step.component';
import { QrMenuFormLoadingPreviewStepComponent } from './qrmenu-form/qrmenu-form-loading-preview-step/qrmenu-form-loading-preview-step.component';
import { GradientBorderComponent } from '../../../../qrmenu-lib/src/lib/gradient-border/gradient-border.component';
import { QrMenuComponent } from '../../../../qrmenu-lib/src/lib/qrmenu/qrmenu.component';

@NgModule({
  declarations: [
    QrmenuCardComponent,
    QrMenusComponent,
    QrMenuFormComponent,
    EditMealsComponent,
    QrMenuFormGeneralStepComponent,
    QrMenuFormMenusStepComponent,
    QrMenuFormStyleStepComponent,
    QrMenuFormLoadingPreviewStepComponent,
    SearchFilterPipe,
    QrmenuPreviewComponent,
  ],
  imports: [
    NgxKjuaComponent,
    ColorInputComponent,
    GradientBorderComponent,
    QrMenuComponent,
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

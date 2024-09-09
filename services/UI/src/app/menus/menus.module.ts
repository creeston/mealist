import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../angular-material.module';
import { HttpLoaderFactory } from '../app.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuFormDialog } from './menu-form/menu-form.component';
import { MenuCardComponent } from './menu-card/menu-card.component';
import { MenuComponent } from './menu/menu.component';
import { MenusComponent } from './menus/menus.component';
import { MenuOcrComponent } from './menu-ocr/menu-ocr.component';
import { NgOcrEditorComponent } from 'ng-ocr-editor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@NgModule({
  declarations: [
    MenuFormDialog,
    MenuCardComponent,
    MenuComponent,
    MenusComponent,
    MenuOcrComponent,
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgOcrEditorComponent,
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
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic'
      }
    }
  ],
})
export class MenusModule { }

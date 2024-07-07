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

@NgModule({
  declarations: [
    MenuFormDialog,
    MenuCardComponent,
    MenuComponent,
    MenusComponent,
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
export class MenusModule {}

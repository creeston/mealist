import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RestaurantsComponent } from './restaurants/restaurants/restaurants.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { MenuOcrComponent } from './menus/menu-ocr/menu-ocr.component';
import { QrMenusComponent } from './qrmenus/qrmenus/qrmenus.component';
import { QrMenuFormComponent } from './qrmenus/qrmenu-form/qrmenu-form.component';
import { MenusComponent } from './menus/menus/menus.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'menus' },
  { path: 'login', component: LogInComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'menus', component: MenusComponent },
  { path: 'menus/:menuId', component: MenuOcrComponent },
  { path: 'restaurants', component: RestaurantsComponent },
  { path: 'qrmenus', component: QrMenusComponent },
  { path: 'qrmenu-create', component: QrMenuFormComponent },
  { path: 'qrmenus/:menuId', component: QrMenuFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

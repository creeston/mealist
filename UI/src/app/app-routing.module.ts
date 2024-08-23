import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RestaurantsComponent } from './restaurants/restaurants/restaurants.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { MenuMarkupComponent } from './menus/menu-markup/menu-markup.component';
import { CodesComponent } from './components/codes/codes.component';
import { CreateCodeComponent } from './components/create-code/create-code.component';
import { QrMenuComponent } from './components/qr-menu/qr-menu.component';
import { MenusComponent } from './menus/menus/menus.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'menus' },
  { path: 'login', component: LogInComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'menus', component: MenusComponent },
  { path: 'menus/:menuId', component: MenuMarkupComponent },
  { path: 'restaurants', component: RestaurantsComponent },
  { path: 'codes', component: CodesComponent },
  { path: 'code-create', component: CreateCodeComponent },
  { path: 'codes/:menuId', component: CreateCodeComponent },
  { path: 'qr/:userId/:menuId', component: QrMenuComponent },
  { path: 'menu/:suffix', component: QrMenuComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

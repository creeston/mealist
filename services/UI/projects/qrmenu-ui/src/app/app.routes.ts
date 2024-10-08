import { Routes } from '@angular/router';
import { QrmenuViewerComponent } from './components/qrmenu-viewer/qrmenu-viewer.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: ':qrSuffix',
    component: QrmenuViewerComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

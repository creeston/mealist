import { Component, OnInit } from '@angular/core';
import { QrMenuComponent } from '../../../../../qrmenu-lib/src/lib/qrmenu/qrmenu.component';
import { QrService } from '../../api';
import { ActivatedRoute, Router } from '@angular/router';
import { QrMenuSpecification } from '../../../../../qrmenu-lib/src/models/qrmenu-specification';
import { GradientBorderComponent } from '../../../../../qrmenu-lib/src/lib/gradient-border/gradient-border.component';
import { CommonModule } from '@angular/common';
import { RestaurantInfo } from '../../../../../qrmenu-lib/src/models/restaurant-info';

@Component({
  selector: 'app-qrmenu-viewer',
  standalone: true,
  imports: [QrMenuComponent, GradientBorderComponent, CommonModule],
  templateUrl: './qrmenu-viewer.component.html',
  styleUrl: './qrmenu-viewer.component.scss',
  providers: [QrService],
})
export class QrmenuViewerComponent implements OnInit {
  qrSuffix: string = '';
  loadingPlaceholderUrl: string | null = null;
  qrMenu: QrMenuSpecification | null = null;

  constructor(
    private qrService: QrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.qrSuffix = params['qrSuffix'];
      this.loadingPlaceholderUrl = `http://localhost:9000/mealist-public/QrMenus/${this.qrSuffix}/loadingPlaceholder.png`;
      this.qrService.getQrMenuBySuffix(this.qrSuffix).subscribe((qrMenu) => {
        if (qrMenu) {
          this.qrMenu = {
            title: qrMenu.title,
            restaurant: qrMenu.restaurant as RestaurantInfo,
            sectionsToShow: qrMenu.sectionsToShow,
            style: qrMenu.style,
            menus: qrMenu.menus,
          } as QrMenuSpecification;
        } else {
          this.router.navigate(['not-found']);
        }
      });
    });
  }
}

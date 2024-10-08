import { Component, Input } from '@angular/core';
import { RestaurantInfo } from '../../models/restaurant-info';
import { QrMenuStyle } from '../../models/qrmenu-style';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'lib-menu-header',
  standalone: true,
  imports: [CommonModule, NgIconsModule],
  templateUrl: './qrmenu-header.component.html',
  styleUrl: './qrmenu-header.component.scss',
})
export class QrMenuHeader {
  @Input({ required: true })
  title!: string;

  @Input({ required: true })
  restaurant!: RestaurantInfo | null;

  @Input({ required: true })
  sectionsToShow!: string[];

  @Input({ required: true })
  style!: QrMenuStyle;
}

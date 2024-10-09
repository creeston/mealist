import { Component, Input } from '@angular/core';
import { RestaurantInfo } from '../../models/restaurant-info';
import { QrMenuStyle } from '../../models/qrmenu-style';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lib-menu-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
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

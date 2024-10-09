import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuSpecification } from '../../models/menu-specification';
import { CommonModule } from '@angular/common';
import { QrMenuStyle } from '../../models/qrmenu-style';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-qrmenu-item',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './qrmenu-item.component.html',
  styleUrl: './qrmenu-item.component.scss',
})
export class QrmenuItemComponent {
  @Output()
  onMenuSelected: EventEmitter<MenuSpecification> = new EventEmitter();

  @Input({ required: true })
  menu!: MenuSpecification;

  @Input({ required: true })
  style!: QrMenuStyle;
}

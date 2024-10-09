import { Component, Input } from '@angular/core';
import { QrMenuSpecification } from '../../../../../qrmenu-lib/src/models/qrmenu-specification';

@Component({
  selector: 'app-qrmenu-preview',
  templateUrl: './qrmenu-preview.component.html',
  styleUrls: ['./qrmenu-preview.component.scss'],
})
export class QrmenuPreviewComponent {
  @Input({ required: true }) qrmenu!: QrMenuSpecification;
}

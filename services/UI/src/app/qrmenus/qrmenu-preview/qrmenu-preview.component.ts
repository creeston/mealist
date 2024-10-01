import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReadOnlyQrMenu } from '../../api';

@Component({
  selector: 'app-qrmenu-preview',
  templateUrl: './qrmenu-preview.component.html',
  styleUrls: ['./qrmenu-preview.component.scss'],
})
export class QrmenuPreviewComponent {
  @Input({ required: true }) qrmenu!: ReadOnlyQrMenu;
  @Input({ required: true }) previewImageParam!: string;
  @Input({ required: true }) menuLoading!: boolean;
  @Output() public colorDetected = new EventEmitter<any>();

  onColorDetected(event: any) {
    this.colorDetected.emit(event);
  }
}

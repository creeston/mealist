import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
} from '@angular/core';
import ColorThief from 'colorthief';
const colorThief = new ColorThief();

@Component({
  selector: 'app-gradient-border',
  templateUrl: './gradient-border.component.html',
  styleUrls: ['./gradient-border.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class GradientBorderComponent implements AfterContentInit {
  @ContentChildren('image')
  contentChildren!: QueryList<ElementRef>;

  public color1 = '';
  public color2 = '';
  public color3 = '';
  public color4 = '';
  isColorDetected = false;

  ngAfterContentInit(): void {
    if (this.isColorDetected) {
      return;
    }
    const images = this.contentChildren.toArray();
    if (images.length > 0) {
      const image = images[0];
      image.nativeElement.crossOrigin = 'Anonymous';
      const imageLoad = this.onImageLoad.bind(this);
      image.nativeElement.addEventListener('load', imageLoad);
    }
  }

  onImageLoad(image: any): void {
    if (image.target.width === 0 || image.target.height === 0) {
      return;
    }

    this.checkColors(image.target);
  }

  checkColors(image: any) {
    if (image.naturalWidth === 0 || image.naturalHeight === 0) {
      return;
    }
    let result = colorThief.getColor(image);
    let palette = colorThief.getPalette(image);
    this.color1 = this.rgbToHex(result[0], result[1], result[2]);
    this.color2 = this.rgbToHex(palette[0][0], palette[0][1], palette[0][2]);
    this.color3 = this.rgbToHex(palette[1][0], palette[1][1], palette[1][2]);
    this.color4 = this.rgbToHex(palette[2][0], palette[2][1], palette[2][2]);
    this.isColorDetected = true;
  }

  rgbToHex(r: number, g: number, b: number) {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }
}

import { Injectable } from '@angular/core';

@Injectable()
export class DrawService {
  drawStopDish(
    context: any,
    x: number,
    y: number,
    w: number,
    h: number,
    stopStyle: string,
    stopColor: string
  ) {
    context.beginPath();
    if (stopStyle == 'underline') {
      let opacityColor = this.addAlpha(stopColor, 0.9);
      context.fillStyle = opacityColor;
      context.lineWidth = 1;
      context.strokeStyle = stopColor;
      context.rect(x, y, w, h);
      context.fill();
      context.stroke();

      // let strokePosition = y + Math.floor(h/2);
      // context.moveTo(x, strokePosition);
      // context.lineTo(x + w, strokePosition);
      // context.stroke();
    } else if (stopStyle == 'overflow') {
      this.drawStripes(context, stopColor, x, y, w, h);
    }
  }

  drawStripes(
    ctx: any,
    color: string,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    let opacityColor = this.addAlpha(color, 0.5);
    let numberOfStripes = 10;
    let step = h / numberOfStripes;
    let nSteps = Math.round(w / step);
    var thickness = step;
    for (let i = 0; i < nSteps; i++) {
      if (i % 2) {
        continue;
      }
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';

      ctx.moveTo(x + i * step, y);
      ctx.lineTo(x + Math.max(i * step - h, 0), Math.min(y + i * step, y + h));
      ctx.stroke();
    }

    for (let i = 0; i < nSteps; i++) {
      if (i % 2) {
        continue;
      }
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';

      ctx.moveTo(x + i * step, y + h);
      ctx.lineTo(
        Math.min(x + i * step + h, x + (nSteps - 1) * step),
        Math.max(y, y + h - (nSteps - 1 - i) * step)
      );
      ctx.stroke();
    }

    // for (let i = 0; i < numberOfStripes + 1; i++){
    //   if (i % 2 == 0) {
    //     continue
    //   }
    //   ctx.beginPath();
    //   ctx.strokeStyle = color;
    //   ctx.lineWidth = thickness;
    //   ctx.lineCap = 'round';

    //   ctx.moveTo(x + w - i * step, y + h);
    //   ctx.lineTo(x + w, y + h - i * step);
    //   ctx.stroke();
    // }
  }

  addAlpha(color: string, opacity: number): string {
    if (color.length == 9) {
      // there is already opacity
      let trueColor = color.substr(0, 7);
      let currentOpacity = parseInt(color.substr(7, 2), 16);
      currentOpacity = Math.round(currentOpacity * opacity);
      return trueColor + currentOpacity.toString(16).toUpperCase();
    } else {
      const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
      return color + _opacity.toString(16).toUpperCase();
    }
  }
}

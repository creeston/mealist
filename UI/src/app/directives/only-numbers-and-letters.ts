import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[OnlyNumbersAndLetters]',
})
export class OnlyNumbersAndLetters {
  regexStr = '^[0-9A-z_]*$';

  constructor(private el: ElementRef) {}

  @Input() OnlyNumber: boolean = false;

  @HostListener('keydown', ['$event']) onKeyDown(event: any) {
    let e = <KeyboardEvent>event;
    if (this.OnlyNumber) {
      if (
        [
          'Delete',
          'Backspace',
          'Tab',
          'Escape',
          'Enter',
          'NumpadDecimal',
          'Period',
        ].indexOf(e.key) !== -1 ||
        // Allow: Ctrl+A
        (e.key == 'a' && e.ctrlKey === true) ||
        // Allow: Ctrl+C
        (e.key == 'c' && e.ctrlKey === true) ||
        // Allow: Ctrl+V
        (e.key == 'v' && e.ctrlKey === true) ||
        // Allow: Ctrl+X
        (e.key == 'x' && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        e.key == 'Home' ||
        e.key == 'End' ||
        e.key == 'ArrowLeft' ||
        e.key == 'ArrowRight'
      ) {
        // let it happen, don't do anything
        return;
      }
      let ch = e.key;
      let regEx = new RegExp(this.regexStr);
      if (regEx.test(ch)) return;
      else e.preventDefault();
    }
  }
}

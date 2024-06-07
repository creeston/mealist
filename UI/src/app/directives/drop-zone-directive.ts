import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';

// Angular Drag and Drop File
//
// Add this directive to an element to turn it into a dropzone
// for drag and drop of files.
// Example:
//
// <div (appDropZone)="onDrop($event)"></div>
//
// Any files dropped onto the region are then
// returned as a Javascript array of file objects.
// Which in TypeScript is `Array<File>`
//

@Directive({
  selector: '[appDropZone]',
})
export class DropZoneDirective {
  // The directive emits a `fileDrop` event
  // with the list of files dropped on the element
  // as an JS array of `File` objects.
  @Output('appDropZone') fileDrop = new EventEmitter<Array<File>>();

  // Disable dropping on the body of the document.
  // This prevents the browser from loading the dropped files
  // using it's default behaviour if the user misses the drop zone.
  // Set this input to false if you want the browser default behaviour.
  @Input() preventBodyDrop = true;

  // The `drop-zone-active` class is applied to the host
  // element when a drag is currently over the target.
  @HostBinding('class.drop-zone-active')
  active = false;

  counter = 0;

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    this.counter = 0;
    event.preventDefault();
    this.active = false;

    const { dataTransfer } = event;

    if (dataTransfer?.items) {
      const files = [];
      for (let i = 0; i < dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (dataTransfer.items[i].kind === 'file') {
          const file = dataTransfer.items[i].getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      dataTransfer.items.clear();
      if (files != null) {
        this.fileDrop.emit(files);
      }
    } else {
      const files = dataTransfer?.files;
      dataTransfer?.clearData();
      if (files) {
        this.fileDrop.emit(Array.from(files));
      }
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.active = true;
  }

  @HostListener('dragenter', ['$event'])
  onDragEnter(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.counter++;
    this.active = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent) {
    this.counter--;
    if (this.counter == 0) {
      this.active = false;
    }
  }

  @HostListener('body:dragover', ['$event'])
  onBodyDragOver(event: DragEvent) {
    if (this.preventBodyDrop) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  @HostListener('body:drop', ['$event'])
  onBodyDrop(event: DragEvent) {
    if (this.preventBodyDrop) {
      event.preventDefault();
    }
  }
}

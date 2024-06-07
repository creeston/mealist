import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'confirmation-dialog',
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.css'],
})
export class ConfirmationDialog {
  public disabled = false;
  public message: string;
  public secondary_message: string;

  @Output()
  public callback = new EventEmitter(true);

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.message = data.message;
    this.secondary_message = data.secondary_message;
  }

  ngOnInit() {}

  onClick() {
    this.disabled = true;
    this.callback.emit();
  }

  close() {
    this.disabled = false;
    this.dialogRef.close(true);
  }
}

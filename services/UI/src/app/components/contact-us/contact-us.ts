import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ScreenService } from '../../services/screen.service';
import { Globals } from '../../globals';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'contact-us-dialog',
  templateUrl: './contact-us.html',
  styleUrls: ['./contact-us.css'],
})
export class ContactUsDialog {
  public feedbackControl = new FormControl('', []);
  public disabled = false;
  public triedToSend = false;

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(
    public dialogRef: MatDialogRef<ContactUsDialog>,
    public screen: ScreenService,
    public globals: Globals,
    private service: FeedbackService,
    private snack: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit() {}

  sendFeedback() {
    this.triedToSend = true;
    if (!this.feedbackControl.value) {
      this.feedbackControl.setErrors({ empty: true });
      return;
    }
    if (!this.globals.email && !this.emailFormControl.valid) {
      return;
    }

    this.disabled = true;
    let email = this.globals.isLogged
      ? this.globals.email
      : this.emailFormControl.value;
    this.translate.get('contact.feedback_sent').subscribe((text: string) => {
      this.translate.get('close').subscribe((closeText: string) => {
        this.service
          .sendFeedback(this.feedbackControl.value ?? '', email ?? '')
          .subscribe(
            (r: any) => {
              this.dialogRef.close(true);
              this.snack.open(text, closeText, { duration: 2000 });
            },
            (error: any) => {
              this.disabled = false;
            }
          );
      });
    });
  }
}

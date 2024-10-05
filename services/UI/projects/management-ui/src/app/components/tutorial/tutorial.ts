import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'tutorial',
  templateUrl: './tutorial.html',
  styleUrls: ['./tutorial.css'],
})
export class TutorialComponent {
  tutorial_id: string;
  simple: boolean;

  constructor(
    public dialogRef: MatDialogRef<TutorialComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private translate: TranslateService
  ) {
    this.simple = data.simple;
    this.tutorial_id = data.tutorial_id;
  }

  public stopTutorial = false;

  ngOnInit() {}

  onContinue() {
    this.dialogRef.close(new TutorialResponse(this.stopTutorial));
  }

  onClose() {
    this.dialogRef.close(null);
  }

  getTutorialPath() {
    let currentLang = this.translate.currentLang;
    return '/assets/tutorials/' + currentLang + '/' + this.tutorial_id + '.md';
  }
}

export class TutorialResponse {
  constructor(public stopTutorial: boolean) {}
}

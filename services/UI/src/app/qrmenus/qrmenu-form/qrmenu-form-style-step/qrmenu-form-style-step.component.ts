import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QrMenu } from '../../../api';

@Component({
  selector: 'app-qrmenu-form-style-step',
  templateUrl: './qrmenu-form-style-step.component.html',
  styleUrls: ['./qrmenu-form-style-step.component.scss'],
})
export class QrMenuFormStyleStepComponent implements OnInit {
  @Input({ required: true }) previewQrMenu!: QrMenu;
  @Input({ required: true }) form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form.addControl('primaryColorControl', this.fb.control('989089'));
    this.form.addControl('secondaryColorControl', this.fb.control('A0B454b0'));
    this.form.addControl('backgroundColorControl', this.fb.control('FFFFFF'));
    this.form.addControl('fontColorControl', this.fb.control('FFFFFF'));

    this.form.controls.primaryColorControl.valueChanges.subscribe((value) => {
      if (value) {
        if (value.startsWith('#')) {
          this.previewQrMenu.primaryColor = value;
        } else {
          this.previewQrMenu.primaryColor = '#' + value;
        }
      }
    });

    this.form.controls.secondaryColorControl.valueChanges.subscribe((value) => {
      if (value) {
        if (value.startsWith('#')) {
          this.previewQrMenu.secondaryColor = value;
        } else {
          this.previewQrMenu.secondaryColor = '#' + value;
        }
      }
    });

    this.form.controls.backgroundColorControl.valueChanges.subscribe(
      (value) => {
        if (value) {
          if (value.startsWith('#')) {
            this.previewQrMenu.backgroundColor = value;
          } else {
            this.previewQrMenu.backgroundColor = '#' + value;
          }
        }
      }
    );

    this.form.controls.fontColorControl.valueChanges.subscribe((value) => {
      if (value) {
        if (value.startsWith('#')) {
          this.previewQrMenu.fontColor = value;
        } else {
          this.previewQrMenu.fontColor = '#' + value;
        }
      }
    });
  }
}

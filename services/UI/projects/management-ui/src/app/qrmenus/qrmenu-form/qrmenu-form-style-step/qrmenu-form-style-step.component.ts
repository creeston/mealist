import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { QrMenuStyle, ReadonlyQrMenu } from '../../../api';

@Component({
  selector: 'app-qrmenu-form-style-step',
  templateUrl: './qrmenu-form-style-step.component.html',
  styleUrls: ['./qrmenu-form-style-step.component.scss'],
})
export class QrMenuFormStyleStepComponent implements OnInit {
  @Input({ required: true }) previewQrMenu!: ReadonlyQrMenu;
  @Input({ required: true }) form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form.addControl('primaryColorControl', this.fb.control('989089'));
    this.form.addControl('secondaryColorControl', this.fb.control('A0B454b0'));
    this.form.addControl('backgroundColorControl', this.fb.control('FFFFFF'));
    this.form.addControl('fontColorControl', this.fb.control('FFFFFF'));

    this.form.controls['primaryColorControl'].valueChanges.subscribe(
      (value) => {
        if (value) {
          if (value.startsWith('#')) {
            this.previewQrMenu.style.headerColor = value;
          } else {
            this.previewQrMenu.style.headerColor = '#' + value;
          }
        }
      }
    );

    this.form.controls['secondaryColorControl'].valueChanges.subscribe(
      (value) => {
        if (value) {
          if (value.startsWith('#')) {
            this.previewQrMenu.style.actionsColor = value;
          } else {
            this.previewQrMenu.style.actionsColor = '#' + value;
          }
        }
      }
    );

    this.form.controls['backgroundColorControl'].valueChanges.subscribe(
      (value) => {
        if (value) {
          if (value.startsWith('#')) {
            this.previewQrMenu.style.backgroundColor = value;
          } else {
            this.previewQrMenu.style.backgroundColor = '#' + value;
          }
        }
      }
    );

    this.form.controls['fontColorControl'].valueChanges.subscribe((value) => {
      if (value) {
        if (value.startsWith('#')) {
          this.previewQrMenu.style.fontColor = value;
        } else {
          this.previewQrMenu.style.fontColor = '#' + value;
        }
      }
    });
  }

  setFieldValues(style: QrMenuStyle) {
    this.form.controls['primaryColorControl'].setValue(style.headerColor);
    this.form.controls['secondaryColorControl'].setValue(style.actionsColor);
    this.form.controls['backgroundColorControl'].setValue(
      style.backgroundColor
    );
    this.form.controls['fontColorControl'].setValue(style.fontColor);
  }
}

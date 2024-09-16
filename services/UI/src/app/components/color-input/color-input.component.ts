import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { MccColorPickerModule } from 'material-community-components/color-picker';

@Component({
  selector: 'app-color-input',
  templateUrl: './color-input.component.html',
  styleUrls: ['./color-input.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MccColorPickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class ColorInputComponent implements OnInit {
  @Input({ required: true }) colorControl!: FormControl;
  @Input({ required: true }) label!: string;

  ngOnInit() {
    this.colorControl.valueChanges.subscribe((value) => {
      if (value && value.startsWith('#')) {
        // Prepend the '#' if it is missing
        value = value.substr(1);
        this.colorControl.setValue(`${value}`, { emitEvent: false });
      }
    });
  }
}

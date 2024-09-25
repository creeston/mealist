import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { QrMenu } from '../../../api';

const PLACEHOLDER_URL = 'assets/placeholder.png';

@Component({
  selector: 'app-qrmenu-form-loading-preview-step',
  templateUrl: './qrmenu-form-loading-preview-step.component.html',
  styleUrls: ['./qrmenu-form-loading-preview-step.component.scss'],
})
export class QrMenuFormLoadingPreviewStepComponent
  implements OnInit, OnChanges
{
  @Input({ required: true }) previewQrMenu!: QrMenu;
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) isStepActive!: boolean;

  @ViewChild('fileUpload') fileUploadInput: any;
  @ViewChild('imgBuffer') imageElement!: ElementRef;

  @Output() previewImageChange = new EventEmitter<string>();

  selectedFile: Blob | null = null;
  selectedFilename: string = '';
  selectedFileBase64String: string = '';
  public previewImage: string = PLACEHOLDER_URL;
  public uploadedCustomPreview: string = '';

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.isStepActive || !this.isStepActive) {
      return;
    }

    const menuItems = this.previewQrMenu.items;
    if (
      !menuItems ||
      menuItems.length === 0 ||
      (this.previewQrMenu.loadingPlaceholderIndex !== undefined &&
        this.previewQrMenu.loadingPlaceholderIndex >= menuItems.length)
    ) {
      this.form.controls.loadingPlaceholderIndexControl.setValue(-1);
      this.onPreviewSelected(-1);
      return;
    }

    if (this.previewQrMenu.loadingPlaceholderIndex === -1) {
      this.form.controls.loadingPlaceholderIndexControl.setValue(0);
      this.onPreviewSelected(0);
      return;
    }
  }

  ngOnInit(): void {
    this.form.addControl('loadingPlaceholderIndexControl', this.fb.control(-1));
    this.form.addControl('fileControl', this.fb.control(''));

    this.form.controls.loadingPlaceholderIndexControl.valueChanges.subscribe(
      (value: any) => {
        this.previewQrMenu.loadingPlaceholderIndex = value;
      }
    );

    this.form.setValidators(this.loadingPlaceholderValidator());
    this.previewImageChange.emit(this.previewImage);
  }

  clearFileInput(event: any) {
    this.fileUploadInput._inputValueRef.nativeElement.value = '';
    this.previewImage = PLACEHOLDER_URL;
    this.previewImageChange.emit(this.previewImage);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.name) {
      this.selectedFilename = file.name;
      if (!this.form.controls.fileControl.value) {
        this.form.controls.fileControl.setValue(file.name);
      }
      this.selectedFile = file;
      this.readSelectedFileIntoString(this.selectedFile);
    }
  }

  onPreviewSelected(menuIndex: number) {
    if (menuIndex >= 0) {
      let menuItem = this.previewQrMenu.items![menuIndex];
      this.previewImage = menuItem.menu!.pages![0].imageUrl;
      this.previewQrMenu.loadingPlaceholderIndex = menuIndex;
    } else if (this.selectedFileBase64String) {
      this.previewImage = this.selectedFileBase64String;
    } else {
      this.previewImage = PLACEHOLDER_URL;
    }

    this.previewImageChange.emit(this.previewImage);
  }

  readSelectedFileIntoString(file: any) {
    if (file.size == 0) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      this.selectedFileBase64String = event.target.result;
      this.previewImage = this.selectedFileBase64String;
      this.previewImageChange.emit(this.previewImage);
    };
  }

  public loadingPlaceholderValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors => {
      const group = control as FormGroup;
      const fileControl = group.controls['fileControl'];
      const indexControl = group.controls['loadingPlaceholderIndexControl'];

      if (indexControl.value === -1 && !fileControl.value) {
        fileControl.setErrors({ required: true });
        return { required: true };
      } else {
        fileControl.setErrors(null);
      }
      return {};
    };
  }
}

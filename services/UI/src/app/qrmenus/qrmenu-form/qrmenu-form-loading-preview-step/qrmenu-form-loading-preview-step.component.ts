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

export interface LoadingPlaceholderConfiguration {
  loadingPlaceholderIndex: number;
  file: Blob | null;
}

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
  @Output() loadingPlaceholderConfigurationChange =
    new EventEmitter<LoadingPlaceholderConfiguration>();

  selectedFile: Blob | null = null;
  selectedFilename: string = '';
  selectedFileBase64String: string = '';
  public previewImage: string = PLACEHOLDER_URL;
  public uploadedCustomPreview: string = '';
  public loadingPlaceholderMenuIndex: number = -1;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.isStepActive || !this.isStepActive) {
      return;
    }

    const menuItems = this.previewQrMenu.menus;
    if (!menuItems || menuItems.length === 0) {
      this.loadingPlaceholderMenuIndex = -1;
    } else {
      this.loadingPlaceholderMenuIndex = 0;
    }

    this.onPreviewSelected(this.loadingPlaceholderMenuIndex);
    this.form.controls.loadingPlaceholderIndexControl.setValue(
      this.loadingPlaceholderMenuIndex
    );
    this.notifyConfigurationChange();
  }

  ngOnInit(): void {
    this.form.addControl('loadingPlaceholderIndexControl', this.fb.control(-1));
    this.form.addControl('fileControl', this.fb.control(''));

    this.form.controls.loadingPlaceholderIndexControl.valueChanges.subscribe(
      (value: any) => {
        this.loadingPlaceholderMenuIndex = value;
        this.notifyConfigurationChange();
      }
    );

    this.form.setValidators(this.loadingPlaceholderValidator());
    this.previewImageChange.emit(this.previewImage);
  }

  clearFileInput(event: any) {
    this.fileUploadInput._inputValueRef.nativeElement.value = '';
    this.previewImage = PLACEHOLDER_URL;
    this.previewImageChange.emit(this.previewImage);
    this.notifyConfigurationChange();
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
      this.notifyConfigurationChange();
    }
  }

  onPreviewSelected(menuIndex: number) {
    if (menuIndex >= 0) {
      let menuItem = this.previewQrMenu.menus![menuIndex];
      this.previewImage = menuItem.pages![0].imageUrl;
      this.loadingPlaceholderMenuIndex = menuIndex;
    } else if (this.selectedFileBase64String) {
      this.previewImage = this.selectedFileBase64String;
    } else {
      this.previewImage = PLACEHOLDER_URL;
    }

    this.notifyConfigurationChange();
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

  notifyConfigurationChange() {
    this.loadingPlaceholderConfigurationChange.emit({
      loadingPlaceholderIndex: this.loadingPlaceholderMenuIndex,
      file: this.selectedFile!,
    });
  }
}

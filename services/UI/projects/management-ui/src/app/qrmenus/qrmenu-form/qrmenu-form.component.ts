import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { QrMenuService } from '../../services/qrmenu.service';
import { environment } from '../../../environments/environment';
import { Globals } from '../../globals';
import { CreateQrMenuItem, QrMenu, QrMenuItem } from '../../api/model/models';
import { QrMenuFormGeneralStepComponent } from './qrmenu-form-general-step/qrmenu-form-general-step.component';
import { QrMenuFormMenusStepComponent } from './qrmenu-form-menus-step/qrmenu-form-menus-step.component';
import { QrMenuFormLoadingPreviewStepComponent } from './qrmenu-form-loading-preview-step/qrmenu-form-loading-preview-step.component';
import { QrMenuFormStyleStepComponent } from './qrmenu-form-style-step/qrmenu-form-style-step.component';
import { QrMenuSpecification } from '../../../../../qrmenu-lib/src/models/qrmenu-specification';

@Component({
  selector: 'qrmenu-form-component',
  templateUrl: './qrmenu-form.component.html',
  styleUrls: ['./qrmenu-form.component.css'],
})
export class QrMenuFormComponent implements OnInit, AfterViewInit {
  public disabled = false;
  public creationAttempt = false;
  public loading: boolean = true;
  public previewImage: string = '';
  public currentStep: number = 0;
  public previewQrMenu: QrMenuSpecification = {
    style: {
      headerColor: '#989089',
      actionsColor: '#A0B454b0',
      fontColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
    },
    restaurant: null as any,
    sectionsToShow: [],
    menus: [],
    loadingPlaceholderUrl: '',
  };
  public existingQrMenu: QrMenu | null = null;
  public menuLoading: boolean = false;
  public mode: string = 'plain';
  public qrMenuNameControl = new FormControl('', [Validators.required]);

  @ViewChild('fileUpload') fileUploadInput: any;
  @ViewChild('stepper') stepper!: MatStepper;

  @ViewChild('generalStep')
  generalStepComponent!: QrMenuFormGeneralStepComponent;

  @ViewChild('menusStep')
  menusStepComponent!: QrMenuFormMenusStepComponent;

  @ViewChild('styleStep')
  styleStepComponent!: QrMenuFormStyleStepComponent;

  @ViewChild('loadingPreviewStep')
  loadingPreviewStepComponent!: QrMenuFormLoadingPreviewStepComponent;

  environment = environment;

  menuId: string | undefined;
  restaurantSections: any = [];

  formGroup1: FormGroup;
  formGroup2: FormGroup;
  formGroup3: FormGroup;
  formGroup4: FormGroup;

  constructor(
    public router: Router,
    public globals: Globals,
    private qrMenuService: QrMenuService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.formGroup1 = this.fb.group({});
    this.formGroup2 = this.fb.group({});
    this.formGroup3 = this.fb.group({});
    this.formGroup4 = this.fb.group({});
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.route.params.subscribe((p: any) => {
      this.menuId = p.menuId;
      if (!this.menuId) {
        this.loading = false;
      } else {
        this.qrMenuService.getMenu(this.menuId).then((qrMenu: QrMenu) => {
          this.existingQrMenu = qrMenu;
          this.loading = false;
          this.initializeFormFields(qrMenu);
        });
      }
    });
  }

  initializeFormFields(qrMenu: QrMenu) {
    this.qrMenuNameControl.setValue(qrMenu.name);

    this.generalStepComponent.setFieldValues(
      qrMenu.title ?? '',
      qrMenu.urlSuffix,
      qrMenu.restaurant!.id!,
      qrMenu.sectionsToShow
    );

    this.menusStepComponent.setFieldValues(qrMenu.menus);
    this.styleStepComponent.setFieldValues(qrMenu.style);
    this.loadingPreviewStepComponent.setFieldValues(
      qrMenu.loadingPlaceholderMenuIndex,
      qrMenu.loadingPlaceholderUrl
    );

    this.stepper.steps.forEach((step: MatStep) => {
      step.completed = true;
    });
  }

  async createCode() {
    this.creationAttempt = true;
    this.disabled = true;

    const generalConfiguration = this.generalStepComponent.configuration;
    const menusConfiguration = this.menusStepComponent.configuration;
    const loadingPlaceholderConfiguration =
      this.loadingPreviewStepComponent.configuration;

    if (
      !this.validate() ||
      !generalConfiguration ||
      !menusConfiguration ||
      !loadingPlaceholderConfiguration
    ) {
      this.disabled = false;
      return;
    }

    let menuItems = menusConfiguration.menus.map((i: QrMenuItem) => {
      let item = {
        title: i.title,
        menuId: i.menu!.id,
      } as CreateQrMenuItem;
      return item;
    });

    const name = this.qrMenuNameControl.value ?? '';
    const urlSuffix = generalConfiguration.urlSuffix;
    const title = generalConfiguration.title;
    const restaurantId = generalConfiguration.restaurant.id!;
    const sectionsToShow = generalConfiguration.sections;

    const style = {
      headerColor: this.previewQrMenu.style.headerColor,
      actionsColor: this.previewQrMenu.style.actionsColor,
      fontColor: this.previewQrMenu.style.fontColor,
      backgroundColor: this.previewQrMenu.style.backgroundColor,
    };

    const loadingPlaceholder = {
      menuIndex: loadingPlaceholderConfiguration.loadingPlaceholderIndex,
      file: loadingPlaceholderConfiguration.file,
    };

    const menus = menuItems;

    try {
      await this.qrMenuService.create(
        {
          name,
          urlSuffix,
          restaurantId,
          sectionsToShow,
          style,
          loadingPlaceholder,
          menus,
          title,
        },
        loadingPlaceholder.file ?? undefined
      );
      this.router.navigate(['qrmenus']);
    } catch (error) {
      this.disabled = false;
    }
  }

  async updateCode() {
    this.disabled = true;

    const generalConfiguration = this.generalStepComponent.configuration;
    const menusConfiguration = this.menusStepComponent.configuration;
    const loadingPlaceholderConfiguration =
      this.loadingPreviewStepComponent.configuration;

    if (
      !this.validate() ||
      !generalConfiguration ||
      !menusConfiguration ||
      !loadingPlaceholderConfiguration
    ) {
      this.disabled = false;
      return;
    }

    let menuItems = menusConfiguration.menus.map((i: QrMenuItem) => {
      let item = {
        title: i.title,
        menuId: i.menu!.id,
      } as CreateQrMenuItem;
      return item;
    });

    const name = this.qrMenuNameControl.value ?? '';
    const urlSuffix = generalConfiguration.urlSuffix;
    const title = generalConfiguration.title;
    const restaurantId = generalConfiguration.restaurant.id!;
    const sectionsToShow = generalConfiguration.sections;

    const style = {
      headerColor: this.previewQrMenu.style.headerColor,
      actionsColor: this.previewQrMenu.style.actionsColor,
      fontColor: this.previewQrMenu.style.fontColor,
      backgroundColor: this.previewQrMenu.style.backgroundColor,
    };

    const loadingPlaceholder = {
      menuIndex: loadingPlaceholderConfiguration.loadingPlaceholderIndex,
      file: loadingPlaceholderConfiguration.file,
    };

    const menus = menuItems;

    try {
      await this.qrMenuService.update(
        this.menuId!,
        {
          name,
          urlSuffix,
          restaurantId,
          sectionsToShow,
          style,
          loadingPlaceholder,
          menus,
          title,
        },
        loadingPlaceholder.file ?? undefined
      );
      this.disabled = false;
    } catch (error) {
      this.disabled = false;
    }
  }

  get allStepsCompleted() {
    if (!this.stepper) {
      return false;
    }
    return this.stepper.steps.toArray().every((step) => step.completed);
  }

  validate() {
    let isValid = true;
    if (!this.qrMenuNameControl.value) {
      this.qrMenuNameControl.setErrors({ empty: true });
      this.qrMenuNameControl.markAsTouched();
      isValid = false;
    }
    if (
      this.formGroup1.invalid ||
      this.formGroup2.invalid ||
      this.formGroup3.invalid ||
      this.formGroup4.invalid
    ) {
      isValid = false;
    }

    return isValid;
  }

  isHexColor(hex: string) {
    hex = hex.substr(1);
    return !isNaN(Number('0x' + hex));
  }

  areColorsSelected(qrmenu: QrMenu) {
    return (
      this.isHexColor(qrmenu.style.headerColor!) &&
      this.isHexColor(qrmenu.style.actionsColor!) &&
      this.isHexColor(qrmenu.style.fontColor!) &&
      this.isHexColor(qrmenu.style.backgroundColor!)
    );
  }

  addQrMenuToFormData(formData: any, qrmenu: QrMenu) {
    formData.append('qrmenu', JSON.stringify(qrmenu));
  }

  addPreviewimageToFormData(formData: FormData) {
    // if (this.previewQrMenu.previewIndex === -1 && this.uploadedCustomPreview) {
    //   const file = this.fileControl.value;
    //   formData.append('preview_image', file!);
    // }
  }

  goForward(stepper: MatStepper) {
    stepper.next();
  }

  stepperChange(event: any) {
    this.currentStep = event.selectedIndex;

    if (this.currentStep === 3) {
      this.menuLoading = true;
    } else {
      this.menuLoading = false;
    }
  }
}

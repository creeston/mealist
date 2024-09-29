import { Component, ViewChild } from '@angular/core';
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
import { CreateQrMenuItem, QrMenu } from '../../api/model/models';
import { IdGenerator } from '../../utils/IdGenerator';
import { GeneralConfiguration } from './qrmenu-form-general-step/qrmenu-form-general-step.component';
import {
  MenusConfiguration,
  QrMenuSelectedMenu,
} from './qrmenu-form-menus-step/qrmenu-form-menus-step.component';
import { LoadingPlaceholderConfiguration } from './qrmenu-form-loading-preview-step/qrmenu-form-loading-preview-step.component';

@Component({
  selector: 'qrmenu-form-component',
  templateUrl: './qrmenu-form.component.html',
  styleUrls: ['./qrmenu-form.component.css'],
})
export class QrMenuFormComponent {
  public disabled = false;
  public creationAttempt = false;
  public loading: boolean = true;
  public previewImage: string = '';
  public currentStep: number = 0;
  public previewQrMenu: QrMenu = {
    id: '-1',
    name: '',
    style: {
      headerColor: '#989089',
      actionsColor: '#A0B454b0',
      fontColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
    },
    restaurant: null as any,
    sectionsToShow: [],
    urlSuffix: IdGenerator.generateId(5),
    menus: [],
    loadingPlaceholderUrl: '',
    scanCount: 0,
    creationDate: new Date().toISOString(),
  };
  public menuLoading: boolean = false;
  public mode: string = 'plain';
  public qrMenuNameControl = new FormControl('', [Validators.required]);

  @ViewChild('fileUpload') fileUploadInput: any;
  @ViewChild('stepper') stepper!: MatStepper;

  environment = environment;

  menuId: string | undefined;
  restaurantSections: any = [];

  generalConfiguration: GeneralConfiguration | null = null;
  formGroup1: FormGroup;

  menusConfiguration: MenusConfiguration | null = null;
  formGroup2: FormGroup;
  formGroup3: FormGroup;

  loadingPlaceholderConfiguration: LoadingPlaceholderConfiguration | null =
    null;
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

  ngOnInit() {
    this.route.params.subscribe((p: any) => {
      this.menuId = p.menuId;
      if (!this.menuId) {
        this.loading = false;
      } else {
        // this.loadExistingQrMenu(restaurantsPromise, menusPromise).finally(
        //   () => {
        //     this.loading = false;
        //   }
        // );
      }
    });

    this.qrMenuNameControl.valueChanges.subscribe((value) => {
      this.previewQrMenu.name = value ?? '';
    });
  }

  async loadExistingQrMenu(restaurantsPromise: any, menusPromise: any) {
    // const qrMenu = await this.qrMenuService.getMenu(
    //   this.menuId!,
    //   this.globals.userId
    // );
    // this.previewQrMenu.previewIndex = qrMenu.previewIndex;
    // if (qrMenu.previewIndex === -1) {
    //   this.previewImage =
    //     'https://qrmenuapistorage.blob.core.windows.net/preview/' +
    //     qrMenu.urlSuffix +
    //     '.jpg';
    // }
    // this.previewQrMenu.name = qrMenu.name;
    // this.previewQrMenu.displayName = qrMenu.displayName;
    // this.previewQrMenu.primaryColor = qrMenu.primaryColor;
    // this.previewQrMenu.secondaryColor = qrMenu.secondaryColor;
    // this.previewQrMenu.sectionsToShow = qrMenu.sectionsToShow;
    // this.previewQrMenu.urlSuffix = qrMenu.urlSuffix;
    // this.formGroup1.controls.urlSuffixControl.setValue(qrMenu.urlSuffix);
    // this.qrMenuNameControl.setValue(qrMenu.name ?? '');
    // restaurantsPromise.subscribe((rests: any) => {
    //   let restId = rests.findIndex(
    //     (r: Restaurant) => r.id == qrMenu.restaurant!.id
    //   );
    //   this.previewQrMenu.restaurant = this.restaurants[restId];
    //   this.formGroup1.controls.restaurantNameControl.setValue(
    //     this.previewQrMenu.restaurant?.name ?? ''
    //   );
    //   this.onRestaurantChange(
    //     this.previewQrMenu.restaurant,
    //     qrMenu.sectionsToShow
    //   );
    //   menusPromise.subscribe((menus: Menu[]) => {
    //     qrMenu.items?.forEach((item: QrMenuItem) => {
    //       let title = item.title;
    //       let firstImage = item.menu!.pages![0].imageUrl;
    //       let menuIdx = menus.findIndex((m: any) => m.images[0] == firstImage);
    //       let menuItem = this.menus[menuIdx];
    //       let qrItem = {
    //         title: title,
    //         thumbnailIndex: item.thumbnailIndex,
    //         menu: menuItem,
    //       } as QrMenuItem;
    //       this.previewQrMenu.items!.push(qrItem);
    //       this.loading = false;
    //     });
    //     if (this.previewQrMenu.previewIndex! >= 0) {
    //       let previewMenuItem =
    //         this.previewQrMenu.items![this.previewQrMenu.previewIndex!];
    //       this.previewImage =
    //         previewMenuItem.menu!.pages![
    //           previewMenuItem.thumbnailIndex!
    //         ]!.imageUrl;
    //       this.previewIndexControl.setValue(
    //         this.previewQrMenu.previewIndex ?? 0
    //       );
    //     }
    //   });
    // });
  }

  ngAfterViewInit(): void {
    if (this.menuId) {
      this.stepper.steps.forEach((step: MatStep) => {
        step.completed = true;
      });
    }
  }

  async createCode() {
    this.creationAttempt = true;
    this.disabled = true;
    if (
      !this.validate() ||
      !this.generalConfiguration ||
      !this.menusConfiguration ||
      !this.loadingPlaceholderConfiguration
    ) {
      this.disabled = false;
      return;
    }

    let menuItems = this.menusConfiguration.menus.map(
      (i: QrMenuSelectedMenu) => {
        let item = {
          title: i.title,
          menuId: i.menuId,
        } as CreateQrMenuItem;
        return item;
      }
    );

    const name = this.qrMenuNameControl.value ?? '';

    const urlSuffix = this.generalConfiguration.urlSuffix;
    const title = this.generalConfiguration.title;
    const restaurantId = this.generalConfiguration.restaurant.id!;
    const sectionsToShow = this.generalConfiguration.sections;

    const style = {
      headerColor: this.previewQrMenu.style.headerColor,
      actionsColor: this.previewQrMenu.style.actionsColor,
      fontColor: this.previewQrMenu.style.fontColor,
      backgroundColor: this.previewQrMenu.style.backgroundColor,
    };

    const loadingPlaceholder = {
      menuIndex: this.loadingPlaceholderConfiguration.loadingPlaceholderIndex,
      file: this.loadingPlaceholderConfiguration.file,
    };

    const menus = menuItems;

    await this.qrMenuService.create(
      name,
      urlSuffix,
      restaurantId,
      sectionsToShow,
      style,
      loadingPlaceholder,
      menus,
      title,
      loadingPlaceholder.file ?? undefined
    );
    this.router.navigate(['qrmenus']);
  }

  updateCode() {
    this.disabled = true;
    if (!this.validate()) {
      this.disabled = false;
      return;
    }

    // let menuItems = this.previewQrMenu.items!.filter(
    //   (i: QrMenuItem) => i.menu?.pages
    // );

    // let qrModel = {
    //   name: this.qrMenuNameControl.value ?? '',
    //   displayName: this.previewQrMenu.displayName,
    //   restaurant: this.previewQrMenu.restaurant,
    //   primaryColor: this.previewQrMenu.primaryColor,
    //   secondaryColor: this.previewQrMenu.secondaryColor,
    //   fontColor: this.previewQrMenu.fontColor,
    //   backgroundColor: this.previewQrMenu.backgroundColor,
    //   urlSuffix: this.formGroup1.controls.urlSuffixControl.value ?? '',
    //   sectionsToShow: this.previewQrMenu.sectionsToShow,
    //   items: menuItems,
    //   previewIndex: this.previewQrMenu.loadingPlaceholderIndex,
    // } as QrMenu;

    // const formData = new FormData();
    // this.addQrMenuToFormData(formData, qrModel);
    // this.addPreviewimageToFormData(formData);

    // this.qrMenuService.update(formData, this.menuId!).subscribe(
    //   (r: any) => {
    //     this.router.navigate(['qrmenus']);
    //   },
    //   (error: any) => {
    //     this.disabled = false;
    //   }
    // );
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

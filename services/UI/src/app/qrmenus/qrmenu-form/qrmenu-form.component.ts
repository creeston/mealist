import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../services/restaurant.service';
import { MenuService } from '../../services/menu.service';
import { QrMenuService } from '../../services/qrmenu.service';
import { environment } from '../../../environments/environment';
import { Globals } from '../../globals';
import { DrawService } from '../../services/draw.service';
import {
  CreateQrMenuItem,
  CreateQrMenuRequest,
  Menu,
  QrMenu,
  QrMenuItem,
  Restaurant,
} from '../../api/model/models';
import { IdGenerator } from '../../utils/IdGenerator';

const PLACEHOLDER_URL = 'assets/placeholder.png';

@Component({
  selector: 'qrmenu-form-component',
  templateUrl: './qrmenu-form.component.html',
  styleUrls: ['./qrmenu-form.component.css'],
})
export class QrMenuFormComponent {
  selectedFile: Blob | null = null;

  public disabled = false;
  public restaurantsLoaded = false;
  public menusLoaded = false;
  public creationAttempt = false;
  public restaurants: Restaurant[] = [];
  public menus: Menu[] = [];
  public loading: boolean = true;
  public previewQrMenu: QrMenu = {
    primaryColor: '#989089',
    secondaryColor: '#A0B454b0',
    fontColor: '#FFFFFF',
    urlSuffix: IdGenerator.generateId(5),
    items: [],
  };
  public previewImage: string = PLACEHOLDER_URL;
  public uploadedCustomPreview: string = '';
  public menuLoading: boolean = false;
  public mode: string = 'plain';

  public qrMenuNameControl = new FormControl('', []);
  public qrMenuDisplayNameControl = new FormControl('', []);
  public restaurantNameControl = new FormControl('', []);
  public primaryColorControl = new FormControl('989089');
  public secondaryColorControl = new FormControl('A0B454b0');
  public fontColorControl = new FormControl('FFFFFF');
  public previewIndexControl = new FormControl('', []);
  public urlSuffixControl = new FormControl({
    value: this.previewQrMenu.urlSuffix,
    disabled: this.restaurantsLoaded,
  });
  public fileControl = new FormControl('', []);

  @ViewChild('fileUpload') fileUploadInput: any;
  @ViewChild('imgBuffer') imageElement!: ElementRef;
  @ViewChild('stepper') stepper!: MatStepper;

  environment = environment;

  menuId: string | undefined;

  primaryColors: string[] = [
    '#3f51b5',
    '#da5167',
    '#45606f',
    '#704b4b',
    '#4caf50',
    '#e6c026',
  ];

  secondaryColors: string[] = [
    '#3f51b5c0',
    '#464154',
    '#0288d1',
    '#d72feb',
    '#e04712',
    '#12bce0',
  ];

  fontColors: string[] = ['#ffffff', '#000000'];

  urlSuffixRegex = new RegExp('^[0-9A-z_]+$');

  restaurantSections: any = [];

  constructor(
    public router: Router,
    public globals: Globals,

    private restService: RestaurantService,
    private menuService: MenuService,
    private qrMenuService: QrMenuService,
    private route: ActivatedRoute,
    private draw: DrawService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    let restaurantsPromise = this.restService.listRestaurants();
    let menusPromise = this.menuService.listMenus();

    restaurantsPromise.then((data: any) => {
      this.restaurants = data;
      this.restaurantsLoaded = true;
    });
    menusPromise.then((data: any) => {
      this.menus = data;
      this.menusLoaded = true;
    });

    this.route.params.subscribe((p: any) => {
      this.menuId = p.menuId;
      if (!this.menuId) {
        this.loading = false;
      } else {
        this.loadExistingQrMenu(restaurantsPromise, menusPromise).finally(
          () => {
            this.loading = false;
          }
        );
      }
    });

    this.qrMenuNameControl.valueChanges.subscribe((value) => {
      this.previewQrMenu.name = value ?? '';
    });

    this.qrMenuDisplayNameControl.valueChanges.subscribe((value) => {
      this.previewQrMenu.displayName = value ?? '';
    });

    this.restaurantNameControl.valueChanges.subscribe((value) => {
      let restaurant = this.restaurants.find((r) => r.name === value);
      this.previewQrMenu.restaurant = restaurant;
      this.previewQrMenu.sectionsToShow = this.restaurantSections;
    });

    this.primaryColorControl.valueChanges.subscribe((value) => {
      if (value) {
        if (value.startsWith('#')) {
          this.previewQrMenu.primaryColor = value;
        } else {
          this.previewQrMenu.primaryColor = '#' + value;
        }
      }
    });

    this.secondaryColorControl.valueChanges.subscribe((value) => {
      if (value) {
        if (value.startsWith('#')) {
          this.previewQrMenu.secondaryColor = value;
        } else {
          this.previewQrMenu.secondaryColor = '#' + value;
        }
      }
    });

    this.fontColorControl.valueChanges.subscribe((value) => {
      if (value) {
        if (value.startsWith('#')) {
          this.previewQrMenu.fontColor = value;
        } else {
          this.previewQrMenu.fontColor = '#' + value;
        }
      }
    });
  }

  async loadExistingQrMenu(restaurantsPromise: any, menusPromise: any) {
    const qrMenu = await this.qrMenuService.getMenu(
      this.menuId!,
      this.globals.userId
    );
    this.previewQrMenu.previewIndex = qrMenu.previewIndex;
    if (qrMenu.previewIndex === -1) {
      this.previewImage =
        'https://qrmenuapistorage.blob.core.windows.net/preview/' +
        qrMenu.urlSuffix +
        '.jpg';
    }
    this.previewQrMenu.name = qrMenu.name;
    this.previewQrMenu.displayName = qrMenu.displayName;
    this.previewQrMenu.primaryColor = qrMenu.primaryColor;
    this.previewQrMenu.secondaryColor = qrMenu.secondaryColor;
    this.previewQrMenu.sectionsToShow = qrMenu.sectionsToShow;

    this.previewQrMenu.urlSuffix = qrMenu.urlSuffix;
    this.urlSuffixControl.setValue(qrMenu.urlSuffix);
    this.qrMenuNameControl.setValue(qrMenu.name ?? '');

    restaurantsPromise.subscribe((rests: any) => {
      let restId = rests.findIndex(
        (r: Restaurant) => r.id == qrMenu.restaurant!.id
      );
      this.previewQrMenu.restaurant = this.restaurants[restId];
      this.restaurantNameControl.setValue(
        this.previewQrMenu.restaurant?.name ?? ''
      );
      this.onRestaurantChange(
        this.previewQrMenu.restaurant,
        qrMenu.sectionsToShow
      );
      menusPromise.subscribe((menus: Menu[]) => {
        qrMenu.items?.forEach((item: QrMenuItem) => {
          let title = item.title;
          let firstImage = item.menu!.pages![0].imageUrl;
          let menuIdx = menus.findIndex((m: any) => m.images[0] == firstImage);
          let menuItem = this.menus[menuIdx];
          let qrItem = {
            title: title,
            thumbnailIndex: item.thumbnailIndex,
            menu: menuItem,
          } as QrMenuItem;
          this.previewQrMenu.items!.push(qrItem);
          this.loading = false;
        });

        if (this.previewQrMenu.previewIndex! >= 0) {
          let previewMenuItem =
            this.previewQrMenu.items![this.previewQrMenu.previewIndex!];
          this.previewImage =
            previewMenuItem.menu!.pages![
              previewMenuItem.thumbnailIndex!
            ]!.imageUrl;
          this.previewIndexControl.setValue(
            this.previewQrMenu.previewIndex + ''
          );
        }
      });
    });
  }

  ngAfterViewInit(): void {
    this.fileControl.valueChanges.subscribe((value: any) =>
      this.getFiles(value)
    );
    if (this.menuId) {
      this.stepper.steps.forEach((step: MatStep) => {
        step.completed = true;
      });
    }
  }

  onRestaurantChange(restaurant: Restaurant, sectionsToShow: string[] = []) {
    this.previewQrMenu.restaurant = restaurant;
    this.restaurantSections = [];
    if (restaurant.address) {
      this.restaurantSections.push({
        key: 'address',
        name: this.translate.instant('code.sections.address'),
        checked: true,
      });
    }
    if (restaurant.name) {
      this.restaurantSections.push({
        key: 'name',
        name: this.translate.instant('code.sections.name'),
        checked: true,
      });
    }
    if (restaurant.wifiName && restaurant.wifiPassword) {
      this.restaurantSections.push({
        key: 'wifi',
        name: this.translate.instant('code.sections.wifi'),
        checked: true,
      });
    }
    if (
      restaurant.facebookUrl ||
      restaurant.instagramUrl ||
      restaurant.vkUrl ||
      restaurant.tripAdvisorUrl
    ) {
      this.restaurantSections.push({
        key: 'social',
        name: this.translate.instant('code.sections.social'),
        checked: true,
      });
    }
    if (sectionsToShow.length == 0) {
      this.previewQrMenu.sectionsToShow = this.restaurantSections
        .filter((s: any) => s.checked)
        .map((s: any) => s.key);
    } else {
      this.restaurantSections.forEach((s: any) => {
        s.checked = sectionsToShow.includes(s.key);
      });
    }
  }

  updateRestaurantSections() {
    this.previewQrMenu.sectionsToShow = this.restaurantSections
      .filter((s: any) => s.checked)
      .map((s: any) => s.key);
  }

  addMenuField() {
    this.previewQrMenu.items!.push({
      title: '',
      thumbnailIndex: -1,
    } as QrMenuItem);
  }

  removeMenuField(i: number) {
    this.previewQrMenu.items = this.previewQrMenu.items!.filter(
      (item, index) => index !== i
    );
  }

  async createCode() {
    this.creationAttempt = true;
    this.disabled = true;
    if (!this.validate()) {
      this.disabled = false;
      return;
    }

    let menuItems = this.previewQrMenu
      .items!.filter(
        (i: QrMenuItem) =>
          i.thumbnailIndex && i.thumbnailIndex >= 0 && i.menu?.pages
      )
      .map((i: QrMenuItem) => {
        let item = {
          title: i.title,
          thumbnailIndex: i.thumbnailIndex,
          menuId: i.menu!.id,
        } as CreateQrMenuItem;
        return item;
      });

    // const formData = new FormData();
    // this.addPreviewimageToFormData(formData);
    // this.addQrMenuToFormData(formData, qrModel);

    const creationRequest = {
      name: this.qrMenuNameControl.value ?? '',
      displayName: this.previewQrMenu.displayName,
      restaurantId: this.previewQrMenu.restaurant!.id,
      primaryColor: this.previewQrMenu.primaryColor,
      secondaryColor: this.previewQrMenu.secondaryColor,
      fontColor: this.previewQrMenu.fontColor,
      urlSuffix: this.urlSuffixControl.value ?? '',
      sectionsToShow: this.previewQrMenu.sectionsToShow,
      items: menuItems,
    } as CreateQrMenuRequest;

    await this.qrMenuService.create(creationRequest);
    this.router.navigate(['qrmenus']);
  }

  updateCode() {
    this.disabled = true;
    if (!this.validate()) {
      this.disabled = false;
      return;
    }

    let menuItems = this.previewQrMenu.items!.filter(
      (i: QrMenuItem) =>
        i.thumbnailIndex && i.thumbnailIndex >= 0 && i.menu?.pages
    );

    let qrModel = {
      name: this.qrMenuNameControl.value ?? '',
      displayName: this.previewQrMenu.displayName,
      restaurant: this.previewQrMenu.restaurant,
      primaryColor: this.previewQrMenu.primaryColor,
      secondaryColor: this.previewQrMenu.secondaryColor,
      fontColor: this.previewQrMenu.fontColor,
      urlSuffix: this.urlSuffixControl.value ?? '',
      sectionsToShow: this.previewQrMenu.sectionsToShow,
      items: menuItems,
      previewIndex: this.previewQrMenu.previewIndex,
    } as QrMenu;

    const formData = new FormData();
    this.addQrMenuToFormData(formData, qrModel);
    this.addPreviewimageToFormData(formData);

    this.qrMenuService.update(formData, this.menuId!).subscribe(
      (r: any) => {
        this.router.navigate(['qrmenus']);
      },
      (error: any) => {
        this.disabled = false;
      }
    );
  }

  validate() {
    let isValid = true;
    if (!this.qrMenuNameControl.value) {
      this.qrMenuNameControl.setErrors({ empty: true });
      this.qrMenuNameControl.markAsTouched();
      isValid = false;
    }
    if (!this.restaurantNameControl.value) {
      isValid = false;
      this.restaurantNameControl.setErrors({ empty: true });
    }

    if (this.isAnyMenuItem()) {
      if (
        this.previewQrMenu.previewIndex === -1 &&
        !this.uploadedCustomPreview &&
        !this.menuId
      ) {
        this.previewIndexControl.setErrors({ empty: true });
        this.previewIndexControl.markAsTouched();
        this.fileControl.markAsTouched();
        isValid = false;
      }
    } else {
      if (!this.uploadedCustomPreview) {
        isValid = false;
        this.fileControl.markAsTouched();
      }
    }

    if (!this.urlSuffixControl.value) {
      isValid = false;
      this.urlSuffixControl.setErrors({ empty: true });
    } else if (!this.urlSuffixRegex.test(this.urlSuffixControl.value)) {
      isValid = false;
      this.urlSuffixControl.setErrors({ invalid: true });
    }
    return isValid;
  }

  isAnyMenuItem() {
    let isValid = false;
    this.previewQrMenu.items!.forEach((item) => {
      isValid =
        isValid ||
        !!(
          item.menu?.id &&
          item.thumbnailIndex != undefined &&
          item.thumbnailIndex >= 0
        );
    });

    return isValid;
  }

  isHexColor(hex: string) {
    hex = hex.substr(1);
    return !isNaN(Number('0x' + hex));
  }

  areColorsSelected(qrmenu: QrMenu) {
    return (
      this.isHexColor(qrmenu.primaryColor!) &&
      this.isHexColor(qrmenu.secondaryColor!) &&
      this.isHexColor(qrmenu.fontColor!)
    );
  }

  areMenuItemsValid(qrmenu: QrMenu) {
    if (qrmenu.items?.length == 0) {
      return false;
    }

    let isVaild = true;
    qrmenu.items!.forEach((item) => {
      isVaild = !!(
        item.menu?.id &&
        item.thumbnailIndex &&
        item.thumbnailIndex >= 0
      );
    });

    return isVaild;
  }

  addQrMenuToFormData(formData: any, qrmenu: QrMenu) {
    formData.append('qrmenu', JSON.stringify(qrmenu));
  }

  addPreviewimageToFormData(formData: FormData) {
    if (this.previewQrMenu.previewIndex === -1 && this.uploadedCustomPreview) {
      const file = this.fileControl.value;
      formData.append('preview_image', file!);
    }
  }

  goForward(stepper: MatStepper) {
    stepper.next();
  }

  async onMenuSelected(menuItem: QrMenuItem, event: any) {
    let menu = event.value as Menu;
    menuItem.thumbnailIndex = 0;
    menuItem.menu = menu;
  }

  onPreviewSelected(menuIndex: number) {
    if (menuIndex >= 0) {
      let menuItem = this.previewQrMenu.items![menuIndex];
      this.previewImage =
        menuItem.menu!.pages![menuItem.thumbnailIndex!].imageUrl;
      this.previewQrMenu.previewIndex = menuIndex;
    } else if (this.uploadedCustomPreview) {
      this.previewImage = this.uploadedCustomPreview;
    } else {
      this.previewImage = PLACEHOLDER_URL;
    }
  }

  stepperChange(event: any) {
    if (event.selectedIndex === 3) {
      this.menuLoading = true;
    } else {
      this.menuLoading = false;
    }

    if (
      event.selectedIndex === 1 &&
      this.previewQrMenu.items &&
      this.previewQrMenu.items.length === 0
    ) {
      this.addMenuField();
    }
  }

  getFiles(file: any) {
    if (file.size == 0) {
      return;
    }
    this.mode = 'plain';
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event2: any) => {
      this.uploadedCustomPreview = event2.target.result;
      this.previewQrMenu.previewIndex = -1;
      this.previewImage = this.uploadedCustomPreview;
    };
  }

  clearFileInput(event: any) {
    this.fileUploadInput._inputValueRef.nativeElement.value = '';
    this.uploadedCustomPreview = '';
    if (this.isAnyMenuItem() && this.previewQrMenu.previewIndex! >= 0) {
      let menuItem =
        this.previewQrMenu.items![this.previewQrMenu.previewIndex!];
      this.previewImage =
        menuItem.menu!.pages![menuItem.thumbnailIndex!].imageUrl;
    } else {
      this.previewImage = PLACEHOLDER_URL;
    }
  }

  onColorDetected(event: any) {
    const [color1, color2, color3, color4] = event;
    this.previewQrMenu.primaryColor = color1;
    this.previewQrMenu.secondaryColor = this.draw.addAlpha(color2, 0.7);
    this.previewQrMenu.fontColor = color3;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file && file.name) {
      this.uploadedCustomPreview = file.name;
      if (!this.fileControl.value) {
        this.fileControl.setValue(file.name);
      }
      this.selectedFile = file;
    }
  }
}

import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { getDocument } from 'pdfjs-dist';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../services/restaurant.service';
import { MenuService } from '../../services/menu.service';
import { QrItem, QrMenu, QrMenuService } from '../../services/qrmenu.service';
import { environment } from '../../../environments/environment';
import { Globals } from '../../globals';
import { DrawService } from '../../services/draw.service';
import { Menu, Restaurant } from '../../api/model/models';

const PLACEHOLDER_URL = 'assets/placeholder.png';

@Component({
  selector: 'create-code-component',
  templateUrl: './create-code.component.html',
  styleUrls: ['./create-code.component.css'],
})
export class CreateCodeComponent {
  Arr = Array;

  public disabled = false;
  public restsLoaded = false;
  public menusLoaded = false;
  public creationAttempt = false;
  public rests: Restaurant[] = [];
  public menus: Menu[] = [];
  public menuFieldsCount = 1;
  public loading: boolean = true;
  public qrmenu: QrMenu = new QrMenu(
    '',
    '',
    null,
    [],
    '#989089',
    '#A0B454b0',
    '#FFFFFF',
    this.makeid(5)
  );
  public previewImage: string = PLACEHOLDER_URL;
  public uploadedCustomPreview: string = '';
  public menuLoading: boolean = false;
  public mode: string = 'plain';

  public menuNameControl = new FormControl('', []);
  public restControl = new FormControl('', []);
  public previewIndexControl = new FormControl('', []);
  public urlSuffixControl = new FormControl(this.qrmenu.urlSuffix, []);
  public fileControl = new FormControl(null, []);

  @ViewChild('removableInput') removableInput: any;
  @ViewChild('imgBuffer') imageElement!: ElementRef;
  @ViewChild('stepper') stepper!: MatStepper;
  imgNativeElement = undefined;

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
  ) { }

  ngOnInit() {
    let restPromise = this.restService.listRestaurants();
    let menusPromise = this.menuService.listMenus();

    restPromise?.subscribe((data: any) => {
      this.rests = data;
      this.restsLoaded = true;
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
        this.loadMenu(restPromise, menusPromise);
      }
    });
  }

  loadMenu(restPromise: any, menusPromise: any) {
    this.qrMenuService
      .getMenu(this.menuId!, this.globals.userId)
      .subscribe((r: QrMenu) => {
        let menu = r;
        this.qrmenu.previewIndex = menu.previewIndex;
        if (menu.previewIndex === -1) {
          this.previewImage =
            'https://qrmenuapistorage.blob.core.windows.net/preview/' +
            r.urlSuffix +
            '.jpg';
        }
        this.qrmenu.name = menu.name;
        this.qrmenu.displayName = menu.displayName;
        this.qrmenu.primaryColor = menu.primaryColor;
        this.qrmenu.secondaryColor = menu.secondaryColor;
        this.qrmenu.hideSections = menu.hideSections;

        this.qrmenu.urlSuffix = menu.urlSuffix;
        this.urlSuffixControl.setValue(menu.urlSuffix);
        this.menuNameControl.setValue(menu.name);

        restPromise.subscribe((rests: any) => {
          let restId = rests.findIndex(
            (r: Restaurant) => r.id == menu.restaurant!.id
          );
          this.qrmenu.restaurant = this.rests[restId];
          this.restControl.setValue(this.qrmenu.restaurant?.name ?? '');
          this.onRestChange(this.qrmenu.restaurant, menu.hideSections);
          menusPromise.subscribe((menus: Menu[]) => {
            menu.menuItems.forEach((item: QrItem) => {
              let title = item.title;
              let firstImage = item.images[0];
              let menuIdx = menus.findIndex(
                (m: any) => m.images[0] == firstImage
              );
              let menuItem = this.menus[menuIdx];
              let qrItem = new QrItem(item.menuId, title, item.thumbnailIndex);
              qrItem.images = item.images;
              qrItem.originalFileUrl = menuItem.originalFileUrl ?? '';
              qrItem.entity = menuItem;
              this.qrmenu.menuItems.push(qrItem);
              this.loading = false;
            });

            if (this.qrmenu.previewIndex >= 0) {
              let previewMenuItem =
                this.qrmenu.menuItems[this.qrmenu.previewIndex];
              this.previewImage =
                previewMenuItem.images[previewMenuItem.thumbnailIndex];
              this.previewIndexControl.setValue(this.qrmenu.previewIndex + '');
            }
          });
        });
      });
  }

  ngAfterViewInit(): void {
    this.fileControl.valueChanges.subscribe((value) => this.getFiles(value));
    if (this.menuId) {
      this.stepper.steps.forEach((step: MatStep) => {
        step.completed = true;
      });
    }
  }

  onRestChange(rest: Restaurant, hideSections: string[] = []) {
    this.qrmenu.restaurant = rest;
    this.restaurantSections = [];
    if (rest.address) {
      this.restaurantSections.push({
        key: 'address',
        name: this.translate.instant('code.sections.address'),
        checked: true,
      });
    }
    if (rest.name) {
      this.restaurantSections.push({
        key: 'name',
        name: this.translate.instant('code.sections.name'),
        checked: true,
      });
    }
    if (rest.wifiName && rest.wifiPassword) {
      this.restaurantSections.push({
        key: 'wifi',
        name: this.translate.instant('code.sections.wifi'),
        checked: true,
      });
    }
    if (
      rest.facebookUrl ||
      rest.instagramUrl ||
      rest.vkUrl ||
      rest.tripAdvisorUrl
    ) {
      this.restaurantSections.push({
        key: 'social',
        name: this.translate.instant('code.sections.social'),
        checked: true,
      });
    }
    if (hideSections.length == 0) {
      this.qrmenu.hideSections = this.restaurantSections
        .filter((s: any) => !s.checked)
        .map((s: any) => s.key);
    } else {
      this.restaurantSections.forEach((s: any) => {
        s.checked = !hideSections.includes(s.key);
      });
    }
  }

  updateRestSections() {
    this.qrmenu.hideSections = this.restaurantSections
      .filter((s: any) => !s.checked)
      .map((s: any) => s.key);
  }

  async getMenuImages(menu: Menu) {
    if (menu.menuCompressed) {
      return menu.images ?? [];
    }
    let images = [];
    let i = this.menus.indexOf(menu);
    let pagesCount = menu.images?.length ?? 0;
    let pdfDoc = await getDocument(menu.originalFileUrl!).promise;
    for (let j = 0; j < pagesCount; j++) {
      let page = await pdfDoc.getPage(j + 1);
      var viewport = page.getViewport({ scale: 1 });
      var canvas = document.getElementById('canvas_' + i + '_' + j) as any;
      var context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      images.push(canvas.toDataURL('image/jpeg'));
      canvas.width = 0;
      canvas.height = 0;
    }
    return images;
  }

  addMenuField() {
    this.qrmenu.menuItems.push(new QrItem('', '', -1));
  }

  removeMenuField() {
    this.qrmenu.menuItems = this.qrmenu.menuItems.slice(0, -1);
  }

  createCode() {
    this.creationAttempt = true;
    this.disabled = true;
    if (!this.validate()) {
      this.disabled = false;
      return;
    }

    let menuItems = this.qrmenu.menuItems
      .filter((i: QrItem) => i.thumbnailIndex >= 0 && i.images)
      .map((i: QrItem) => {
        let item = new QrItem(
          i.menuId,
          i.title,
          i.thumbnailIndex,
          i.originalFileUrl
        );
        if (i.menuCompressed) {
          item.images = i.images;
        }
        item.pagesCount = i.pagesCount;
        return item;
      });

    let qrModel = new QrMenu(
      this.menuNameControl.value ?? '',
      this.qrmenu.displayName,
      this.qrmenu.restaurant,
      menuItems,
      this.qrmenu.primaryColor,
      this.qrmenu.secondaryColor,
      this.qrmenu.fontColor,
      this.urlSuffixControl.value ?? '',
      this.qrmenu.hideSections,
      '12',
      this.qrmenu.previewIndex
    );

    const formData = new FormData();
    this.addPreviewimageToFormData(formData);
    this.addQrMenuToFormData(formData, qrModel);

    this.qrMenuService.create(formData).subscribe(
      (r: any) => {
        this.router.navigate(['codes']);
      },
      (error: any) => {
        // this.notify.error(JSON.stringify(error));
        this.disabled = false;
      }
    );
  }

  updateCode() {
    this.disabled = true;
    if (!this.validate()) {
      this.disabled = false;
      return;
    }

    let menuItems = this.qrmenu.menuItems.filter(
      (i: QrItem) => i.thumbnailIndex >= 0 && i.images
    );
    let qrModel = new QrMenu(
      this.menuNameControl.value ?? '',
      this.qrmenu.displayName,
      this.qrmenu.restaurant,
      menuItems,
      this.qrmenu.primaryColor,
      this.qrmenu.secondaryColor,
      this.qrmenu.fontColor,
      this.urlSuffixControl.value ?? '',
      this.qrmenu.hideSections,
      '1',
      this.qrmenu.previewIndex
    );

    const formData = new FormData();
    this.addQrMenuToFormData(formData, qrModel);
    this.addPreviewimageToFormData(formData);

    this.qrMenuService.update(formData, this.menuId!).subscribe(
      (r: any) => {
        this.router.navigate(['codes']);
      },
      (error: any) => {
        // this.notify.error(JSON.stringify(error));
        this.disabled = false;
      }
    );
  }

  validate() {
    let isValid = true;
    if (!this.menuNameControl.value) {
      this.menuNameControl.setErrors({ empty: true });
      this.menuNameControl.markAsTouched();
      isValid = false;
    }
    if (!this.restControl.value) {
      isValid = false;
      this.restControl.setErrors({ empty: true });
    }
    this.qrmenu.menuItems.forEach((item) => {
      if (!item.entity) {
        isValid = false;
      }
    });

    if (this.isAnyMenuItem()) {
      if (
        this.qrmenu.previewIndex === -1 &&
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
    this.qrmenu.menuItems.forEach((item) => {
      isValid =
        isValid || (item.menuId !== undefined && item.thumbnailIndex >= 0);
    });

    return isValid;
  }

  isHexColor(hex: string) {
    hex = hex.substr(1);
    return !isNaN(Number('0x' + hex));
  }

  areColorsSelected(qrmenu: QrMenu) {
    return (
      this.isHexColor(qrmenu.primaryColor) &&
      this.isHexColor(qrmenu.secondaryColor) &&
      this.isHexColor(qrmenu.fontColor)
    );
  }

  areMenuItemsValid(qrmenu: QrMenu) {
    if (qrmenu.menuItems.length == 0) {
      return false;
    }

    let isVaild = true;
    qrmenu.menuItems.forEach((item) => {
      isVaild = item.menuId !== undefined && item.thumbnailIndex >= 0;
    });

    return isVaild;
  }

  addQrMenuToFormData(formData: any, qrmenu: QrMenu) {
    formData.append('qrmenu', JSON.stringify(qrmenu));
  }

  addPreviewimageToFormData(formData: FormData) {
    if (this.qrmenu.previewIndex === -1 && this.uploadedCustomPreview) {
      const file = this.fileControl.value;
      formData.append('preview_image', file!);
    }
  }

  DataURIToBlob(dataURI: string) {
    const splitDataURI = dataURI.split(',');
    const byteString =
      splitDataURI[0].indexOf('base64') >= 0
        ? atob(splitDataURI[1])
        : decodeURI(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  goForward(stepper: MatStepper) {
    stepper.next();
  }

  async onMenuSelected(menuItem: QrItem, event: any) {
    let menu = event.value as Menu;
    menuItem.images = await this.getMenuImages(menu);
    menuItem.thumbnailIndex = 0;
    menuItem.menuId = menu.id!;
    menuItem.menuCompressed = menu.menuCompressed!;
    menuItem.originalFileUrl = menu.originalFileUrl!;
    menuItem.pagesCount = menu.pagesCount!;
  }

  onPreviewSelected(menuIndex: number) {
    if (menuIndex >= 0) {
      let menuItem = this.qrmenu.menuItems[menuIndex];
      this.previewImage = menuItem.images[menuItem.thumbnailIndex];
      this.qrmenu.previewIndex = menuIndex;
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

    if (event.selectedIndex === 1 && this.qrmenu.menuItems.length === 0) {
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
      this.qrmenu.previewIndex = -1;
      this.previewImage = this.uploadedCustomPreview;
    };
  }

  makeid(length: number) {
    var result = [];
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * charactersLength))
      );
    }
    return result.join('');
  }

  clearFileInput(event: any) {
    this.removableInput._inputValueRef.nativeElement.value = '';
    this.uploadedCustomPreview = '';
    if (this.isAnyMenuItem() && this.qrmenu.previewIndex >= 0) {
      let menuItem = this.qrmenu.menuItems[this.qrmenu.previewIndex];
      this.previewImage = menuItem.images[menuItem.thumbnailIndex];
    } else {
      this.previewImage = PLACEHOLDER_URL;
    }
  }

  onColorDetected(event: any) {
    const [color1, color2, color3, color4] = event;
    this.qrmenu.primaryColor = color1;
    this.qrmenu.secondaryColor = this.draw.addAlpha(color2, 0.7);
    this.qrmenu.fontColor = color3;
  }
}

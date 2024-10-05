import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  Menu,
  QrMenuItem,
  ReadonlyQrMenu,
  ReadonlyQrMenuItem,
} from '../../../api';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';

export interface MenusConfiguration {
  menus: QrMenuItem[];
}

@Component({
  selector: 'app-qmenu-form-menus-step',
  templateUrl: './qmenu-form-menus-step.component.html',
  styleUrls: ['./qmenu-form-menus-step.component.scss'],
})
export class QrMenuFormMenusStepComponent implements OnInit, OnChanges {
  @Input({ required: true }) previewQrMenu!: ReadonlyQrMenu;
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) isStepActive!: boolean;

  public menus: Menu[] = [];
  public menusLoaded = false;

  constructor(private menuService: MenuService, private fb: FormBuilder) {}

  get menusFormArray(): FormArray<FormGroup> {
    return this.form.get('menus') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    let menusPromise = this.menuService.listMenus();
    menusPromise.then((data: any) => {
      this.menus = data;
      this.menusLoaded = true;
    });

    this.form.addControl(
      'menus',
      this.fb.array([] as FormGroup[], [Validators.required])
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['isStepActive'] &&
      this.isStepActive &&
      this.previewQrMenu.menus?.length == 0
    ) {
      this.addEmptyMenuField();
    }
  }

  setFieldValues(menus: QrMenuItem[]) {
    this.menusFormArray.clear();

    menus.forEach((menu) => {
      if (!menu.menu) {
        return;
      }
      const formGroup = this.addMenuField(menu.title ?? '', menu.menu);
      formGroup.controls.menuControl.setValue(menu.menu.id!);
    });
  }

  async onMenuSelected(menuItem: ReadonlyQrMenuItem, event: any) {
    let menuId = event.value as string;
    let menu = this.menus.find((m) => m.id === menuId);
    if (!menu) {
      return;
    }
    menuItem.pages = menu.pages;
    menuItem.stopColor = menu.stopColor;
    menuItem.stopStyle = menu.stopStyle;
  }

  addEmptyMenuField() {
    this.addMenuField('');
  }

  addMenuField(title: string, menu: Menu | null = null) {
    const qrMenuItem = {
      title: title,
      pages: menu?.pages ?? [],
    } as ReadonlyQrMenuItem;

    this.previewQrMenu.menus!.push(qrMenuItem);

    const formGroup = this.fb.group({
      menuControl: this.fb.control('', [Validators.required]),
      titleControl: this.fb.control(title, [Validators.required]),
    });

    formGroup.controls.titleControl.valueChanges.subscribe((value) => {
      qrMenuItem.title = value ?? '';
    });

    this.menusFormArray.push(formGroup);

    return formGroup;
  }

  removeMenuField(i: number) {
    this.previewQrMenu.menus = this.previewQrMenu.menus!.filter(
      (item, index) => index !== i
    );

    this.menusFormArray.removeAt(i);
  }

  get configuration(): MenusConfiguration {
    return {
      menus: this.menusFormArray.controls.map((menuFormGroup) => {
        const menuId = menuFormGroup.get('menuControl')?.value;
        const menu = this.menus.find((m) => m.id === menuId);
        return {
          menu: menu,
          title: menuFormGroup.get('titleControl')?.value,
        };
      }),
    };
  }
}

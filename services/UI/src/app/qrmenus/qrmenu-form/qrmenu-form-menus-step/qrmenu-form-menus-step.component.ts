import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Menu, QrMenu, QrMenuItem } from '../../../api';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';

export interface MenusConfiguration {
  menus: QrMenuSelectedMenu[];
}

export interface QrMenuSelectedMenu {
  menuId: string;
  title: string;
}

@Component({
  selector: 'app-qmenu-form-menus-step',
  templateUrl: './qmenu-form-menus-step.component.html',
  styleUrls: ['./qmenu-form-menus-step.component.scss'],
})
export class QrMenuFormMenusStepComponent implements OnInit, OnChanges {
  @Input({ required: true }) previewQrMenu!: QrMenu;
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) isStepActive!: boolean;
  @Output() menusConfigurationChange = new EventEmitter<MenusConfiguration>();

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
      changes.isStepActive &&
      this.isStepActive &&
      this.previewQrMenu.menus?.length == 0
    ) {
      this.addMenuField();
    }
  }

  async onMenuSelected(menuItem: QrMenuItem, event: any) {
    let menu = event.value as Menu;
    menuItem.pages = menu.pages;
    menuItem.stopColor = menu.stopColor;
    menuItem.stopStyle = menu.stopStyle;
  }

  addMenuField() {
    const qrMenuItem = {
      title: '',
      menu: undefined,
    } as QrMenuItem;

    this.previewQrMenu.menus!.push(qrMenuItem);

    const formGroup = this.fb.group({
      menuControl: this.fb.control('', [Validators.required]),
      titleControl: this.fb.control('', [Validators.required]),
    });

    formGroup.controls.titleControl.valueChanges.subscribe((value) => {
      qrMenuItem.title = value ?? '';
    });

    this.menusFormArray.push(formGroup);
  }

  removeMenuField(i: number) {
    this.previewQrMenu.menus = this.previewQrMenu.menus!.filter(
      (item, index) => index !== i
    );

    this.menusFormArray.removeAt(i);
  }

  notifyMenusConfigurationChange() {
    this.menusConfigurationChange.emit({
      menus: this.menusFormArray.controls.map((menuFormGroup) => ({
        menuId: menuFormGroup.get('menuControl')?.value?.id,
        title: menuFormGroup.get('titleControl')?.value,
      })),
    });
  }
}

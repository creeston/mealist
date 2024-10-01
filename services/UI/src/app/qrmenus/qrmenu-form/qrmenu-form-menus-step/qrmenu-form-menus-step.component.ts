import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  Menu,
  QrMenuItem,
  ReadOnlyQrMenu,
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
  @Input({ required: true }) previewQrMenu!: ReadOnlyQrMenu;
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
      changes.isStepActive &&
      this.isStepActive &&
      this.previewQrMenu.menus?.length == 0
    ) {
      this.addMenuField();
    }
  }

  async onMenuSelected(menuItem: ReadonlyQrMenuItem, event: any) {
    let menu = event.value as Menu;
    menuItem.pages = menu.pages;
    menuItem.stopColor = menu.stopColor;
    menuItem.stopStyle = menu.stopStyle;
  }

  addMenuField() {
    const qrMenuItem = {
      title: '',
      pages: [],
    } as ReadonlyQrMenuItem;

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

  get configuration(): MenusConfiguration {
    return {
      menus: this.menusFormArray.controls.map((menuFormGroup) => ({
        menu: menuFormGroup.get('menuControl')?.value,
        title: menuFormGroup.get('titleControl')?.value,
      })),
    };
  }
}

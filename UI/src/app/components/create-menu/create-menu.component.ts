import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { merge } from 'rxjs';
import { Menu, MenuService } from '../../services/menu.service';

@Component({
  selector: 'create-menu-dialog',
  templateUrl: './create-menu.component.html',
  styleUrls: ['./create-menu.component.css'],
})
export class CreateMenuDialog {
  public fileControl = new FormControl([] as any[], [Validators.required]);
  public menuNameControl = new FormControl('', []);
  public disabled = true;
  public menuNames: string[] | undefined;
  public duplicatedMenuName: string | undefined;

  color: ThemePalette = 'primary';
  accept: string = 'application/pdf,image/png';

  constructor(
    public dialogRef: MatDialogRef<CreateMenuDialog>,
    private service: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.fileControl.registerOnChange((e: any) => {
      console.log(e);
    });
    this.fileControl.valueChanges.subscribe((v: any) => {
      if (!this.menuNameControl.value) {
        if (v.length == 1) {
          this.menuNameControl.setValue(v[0].name);
        }
      }
    });

    if (this.data) {
      this.fileControl.setValue(this.data);
      this.fileControl.markAsTouched();
    }

    this.service.listMenus().subscribe((menus: any) => {
      this.menuNames = menus.map((m: Menu) => m.name);
      this.disabled = false;
    });
  }

  createNameForMenu(file: any, files: any[], menuName: string) {
    if (files.length > 1) {
      return menuName + ' ' + file.name;
    } else {
      return menuName;
    }
  }

  isMenuNameUnique(files: any[], menuName: string) {
    this.duplicatedMenuName = '';
    let isMenuNameValid = true;
    if (this.menuNames === undefined) {
      return isMenuNameValid;
    }
    files.forEach((f) => {
      let name = this.createNameForMenu(f, files, menuName);
      if (this.menuNames!.indexOf(name) >= 0) {
        isMenuNameValid = false;
        this.duplicatedMenuName = name;
      }
    });
    return isMenuNameValid;
  }

  createMenu() {
    if (this.fileControl.invalid || this.menuNameControl.invalid) {
      return;
    }

    const menuName = this.menuNameControl.value;
    const files = this.fileControl.value as any[] | null;

    if (!files || !menuName) {
      return;
    }

    let isMenuNameValid = this.isMenuNameUnique(files, menuName);
    if (!isMenuNameValid) {
      this.menuNameControl.setErrors({ duplicate: true });
      return;
    }

    this.disabled = true;
    let requests: any[] = [];
    files.forEach((f) => {
      let menu = new Menu();
      menu.name = this.createNameForMenu(f, files, menuName);
      let request = this.service.createMenu(f, menu);
      requests.push(request);
    });

    merge(...requests).subscribe(
      (r: any) => {
        this.dialogRef.close(true);
      },
      (error: any) => {
        // this.notify.error(JSON.stringify(error));
        this.disabled = false;
      }
    );
  }
}

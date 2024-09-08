import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-menu-form-dialog',
  templateUrl: './menu-form.component.html',
  styleUrls: ['./menu-form.component.scss'],
})
export class MenuFormDialog {
  public fileControl = new FormControl([] as any[], [Validators.required]);
  public menuNameControl = new FormControl('', []);
  public languageControl = new FormControl('eng', []);
  public disabled = false;
  fileName = '';
  selectedFile: Blob | null = null;
  languages = [
    {
      code: 'eng',
      name: 'English',
    },
    {
      code: 'rus',
      name: 'Russian',
    },
    {
      code: 'pol',
      name: 'Polish',
    },
    {
      code: 'deu',
      name: 'German',
    },
    {
      code: 'ukr',
      name: 'Ukrainian',
    },
    {
      code: 'bel',
      name: 'Belarusian',
    },
  ];

  color: ThemePalette = 'primary';
  accept: string = 'application/pdf,image/png';

  constructor(
    public dialogRef: MatDialogRef<MenuFormDialog>,
    private service: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;
      if (!this.menuNameControl.value) {
        this.menuNameControl.setValue(file.name);
      }
      this.selectedFile = file;
    }
  }

  async createMenu() {
    if (this.fileControl.invalid) {
      return;
    }

    const menuName = this.menuNameControl.value;
    const files = this.fileControl.value as any[];
    const language = this.languageControl.value;

    if (!files) {
      return;
    }
    const file = files[0];

    if (!file || !this.selectedFile) {
      return;
    }

    this.disabled = true;

    try {
      await this.service.createMenu(
        this.selectedFile,
        menuName ? menuName : undefined,
        language ?? 'eng'
      );
      this.dialogRef.close(true);
    } finally {
      this.disabled = false;
    }
  }
}

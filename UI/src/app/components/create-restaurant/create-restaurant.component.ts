import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RestaurantService } from '../../services/restaurant.service';
import { ScreenService } from '../../services/screen.service';
import { Restaurant } from '../../api/model/models';

@Component({
  selector: 'create-rest-dialog',
  templateUrl: './create-restaurant.component.html',
  styleUrls: ['./create-restaurant.component.css'],
})
export class CreateRestaurantDialog {
  public restNameControl = new FormControl('', []);
  public restAddressControl = new FormControl('', []);
  public restCityControl = new FormControl('', []);

  public restDescriptionControl = new FormControl('', []);
  public wifiNameControl = new FormControl('', []);
  public wifiPasswordControl = new FormControl('', []);

  public facebookControl = new FormControl('', []);
  public instagramControl = new FormControl('', []);
  public vkControl = new FormControl('', []);
  public tripAdvisorControl = new FormControl('', []);

  public disabled = false;

  public showFacebook: boolean = false;
  public showInstagram: boolean = false;
  public showVk: boolean = false;
  public showTripAdvisor: boolean = false;

  public mapUrl: string | null = null;

  public triedToSend = false;

  constructor(
    public dialogRef: MatDialogRef<CreateRestaurantDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Restaurant,
    private service: RestaurantService,
    public screen: ScreenService
  ) {}

  ngOnInit() {
    if (this.data) {
      this.restNameControl.setValue(this.data.name);
      this.restAddressControl.setValue(this.data.address);
      this.restCityControl.setValue(this.data.city ?? '');
      this.restDescriptionControl.setValue(this.data.description ?? '');
      this.wifiNameControl.setValue(this.data.wifiName ?? '');
      this.wifiPasswordControl.setValue(this.data.wifiPassword ?? '');
      if (this.data.facebookUrl) {
        this.facebookControl.setValue(this.data.facebookUrl);
        this.showFacebook = true;
      }
      if (this.data.instagramUrl) {
        this.instagramControl.setValue(this.data.instagramUrl);
        this.showInstagram = true;
      }
      if (this.data.vkUrl) {
        this.vkControl.setValue(this.data.vkUrl);
        this.showVk = true;
      }
      if (this.data.tripAdvisorUrl) {
        this.tripAdvisorControl.setValue(this.data.tripAdvisorUrl);
        this.showTripAdvisor = true;
      }
    }
  }

  createRestaurant() {
    this.triedToSend = true;
    let valid = true;
    if (!this.restNameControl.value) {
      this.restNameControl.setErrors({ empty: true });
      valid = false;
    }

    if (!this.restAddressControl.value) {
      this.restAddressControl.setErrors({ empty: true });
      valid = false;
    }

    if (!this.restCityControl.value) {
      this.restCityControl.setErrors({ empty: true });
      valid = false;
    }

    if (!valid) {
      return;
    }

    if (
      this.restNameControl.invalid ||
      this.restAddressControl.invalid ||
      this.restCityControl.invalid
    ) {
      return;
    }

    let restModel: Restaurant = this.getRestModel();
    this.createRest(restModel);
  }

  updatePreview() {
    if (
      this.restNameControl.invalid ||
      this.restAddressControl.invalid ||
      this.restCityControl.invalid
    ) {
      return;
    }

    let restModel: Restaurant = this.getRestModel();
    this.loadMapPreview(restModel);
  }

  getRestModel() {
    let restModel: Restaurant | null = null;
    if (this.data) {
      restModel = this.data;
    } else {
      restModel = {} as Restaurant;
    }

    restModel.name = this.restNameControl.value ?? '';
    restModel.address = this.restAddressControl.value ?? '';
    restModel.city = this.restCityControl.value ?? '';
    restModel.description = this.restDescriptionControl.value ?? '';
    restModel.wifiName = this.wifiNameControl.value ?? '';

    if (this.wifiPasswordControl.value) {
      restModel.wifiPassword = this.wifiPasswordControl.value;
    }

    if (this.showFacebook && this.facebookControl.value) {
      restModel.facebookUrl = this.facebookControl.value;
    } else {
      restModel.facebookUrl = '';
    }
    if (this.showInstagram && this.instagramControl.value) {
      restModel.instagramUrl = this.instagramControl.value;
    } else {
      restModel.instagramUrl = '';
    }
    if (this.showVk && this.vkControl.value) {
      restModel.vkUrl = this.vkControl.value;
    } else {
      restModel.vkUrl = '';
    }
    if (this.showTripAdvisor && this.tripAdvisorControl.value) {
      restModel.tripAdvisorUrl = this.tripAdvisorControl.value;
    } else {
      restModel.tripAdvisorUrl = '';
    }
    return restModel;
  }

  createRest(restModel: Restaurant) {
    let promise = null;
    this.disabled = true;
    if (this.data) {
      promise = this.service.updateRestaurant(restModel);
    } else {
      promise = this.service.createRestaurant(restModel);
    }

    promise.subscribe(
      (r: any) => {
        this.service.clearCache();
        this.dialogRef.close(r);
      },
      (error: any) => {
        // this.notify.error(JSON.stringify(error));
        this.disabled = false;
      }
    );
  }

  loadMapPreview(restModel: Restaurant) {
    this.disabled = true;
    this.service.getRestaurantImage(restModel).subscribe(
      (r: any) => {
        this.mapUrl = r.mapsUrl + '&rand=' + new Date().getTime();
        this.disabled = false;
      },
      (error: any) => {
        // this.notify.error(JSON.stringify(error));
        this.disabled = false;
      }
    );
  }
}

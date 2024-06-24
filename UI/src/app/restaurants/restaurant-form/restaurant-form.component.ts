import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RestaurantService } from '../../services/restaurant.service';
import { ScreenService } from '../../services/screen.service';
import { CreateRestaurantRequest, Restaurant } from '../../api/model/models';

@Component({
  selector: 'app-restaurant-form',
  templateUrl: './restaurant-form.component.html',
  styleUrls: ['./restaurant-form.component.css'],
})
export class RestaurantFormDialog {
  public restaurantForm: FormGroup;

  public showFacebook: boolean = false;
  public showInstagram: boolean = false;
  public showVk: boolean = false;
  public showTripAdvisor: boolean = false;
  public mapUrl: string | null = null;

  public triedToSend = false;
  public disabled = false;

  constructor(
    public dialogRef: MatDialogRef<RestaurantFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Restaurant,
    private service: RestaurantService,
    public screen: ScreenService,
    private fb: FormBuilder
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      description: [''],
      wifiName: [''],
      wifiPassword: [''],
      facebookUrl: [''],
      instagramUrl: [''],
      vkUrl: [''],
      tripAdvisorUrl: [''],
    });
  }

  ngOnInit() {
    if (this.data) {
      this.restaurantForm.patchValue({
        name: this.data.name,
        address: this.data.address,
        city: this.data.city,
        description: this.data.description,
        wifiName: this.data.wifiName,
        wifiPassword: this.data.wifiPassword,
        facebookUrl: this.data.facebookUrl,
        instagramUrl: this.data.instagramUrl,
        vkUrl: this.data.vkUrl,
        tripAdvisorUrl: this.data.tripAdvisorUrl,
      });

      this.showFacebook = !!this.data.facebookUrl;
      this.showInstagram = !!this.data.instagramUrl;
      this.showVk = !!this.data.vkUrl;
      this.showTripAdvisor = !!this.data.tripAdvisorUrl;
    }
  }

  async submit() {
    this.triedToSend = true;

    if (this.restaurantForm.invalid) {
      return;
    }

    let model: CreateRestaurantRequest = this.getRestaurantModel();
    let result = null;
    this.disabled = true;
    try {
      if (this.data && this.data.id) {
        result = await this.service.updateRestaurant(model, this.data.id);
      } else {
        result = await this.service.createRestaurant(model);
      }

      this.service.clearCache();
      this.dialogRef.close(result);
    } finally {
      this.disabled = false;
    }
  }

  getRestaurantModel(): CreateRestaurantRequest {
    return {
      name: this.restaurantForm.get('name')?.value,
      address: this.restaurantForm.get('address')?.value,
      city: this.restaurantForm.get('city')?.value,
      description: this.restaurantForm.get('description')?.value,
      wifiName: this.restaurantForm.get('wifiName')?.value,
      wifiPassword: this.restaurantForm.get('wifiPassword')?.value,
      facebookUrl: this.showFacebook
        ? this.restaurantForm.get('facebookUrl')?.value
        : '',
      instagramUrl: this.showInstagram
        ? this.restaurantForm.get('instagramUrl')?.value
        : '',
      vkUrl: this.showVk ? this.restaurantForm.get('vkUrl')?.value : '',
      tripAdvisorUrl: this.showTripAdvisor
        ? this.restaurantForm.get('tripAdvisorUrl')?.value
        : '',
    };
  }

  updatePreview() {
    let restModel: Restaurant = this.getRestaurantModel();
    this.loadMapPreview(restModel);
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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ReadonlyQrMenu, Restaurant } from '../../../api';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { RestaurantService } from '../../../services/restaurant.service';
import { IdGenerator } from '../../../utils/IdGenerator';

export interface GeneralConfiguration {
  restaurant: Restaurant;
  title: string;
  urlSuffix: string;
  sections: string[];
}

@Component({
  selector: 'app-qmenu-form-general-step',
  templateUrl: './qrmenu-form-general-step.component.html',
  styleUrls: ['./qrmenu-form-general-step.component.scss'],
})
export class QrMenuFormGeneralStepComponent implements OnInit {
  public restaurants: Restaurant[] = [];
  public restaurantsLoaded = false;
  urlSuffixRegex = new RegExp('^[0-9A-z_]+$');

  restaurantSections: any = [];
  environment = environment;
  @Input({ required: true }) previewQrMenu!: ReadonlyQrMenu;
  @Input({ required: true }) form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private restaurantsService: RestaurantService
  ) {}

  ngOnInit(): void {
    let restaurantsPromise = this.restaurantsService.listRestaurants();
    restaurantsPromise.then((data: any) => {
      this.restaurants = data;
      this.restaurantsLoaded = true;
    });

    this.form.addControl(
      'restaurantNameControl',
      this.fb.control('', [Validators.required])
    );
    this.form.addControl('qrMenuDisplayNameControl', this.fb.control('', []));
    this.form.addControl(
      'urlSuffixControl',
      this.fb.control({
        value: IdGenerator.generateId(5),
        disabled: this.restaurantsLoaded,
      })
    );
    this.form.addControl('sections', this.fb.array([]));

    this.form.controls['qrMenuDisplayNameControl'].valueChanges.subscribe(
      (value) => {
        this.previewQrMenu.title = value ?? '';
      }
    );

    this.form.controls['restaurantNameControl'].valueChanges.subscribe(
      (value) => {
        let restaurant = this.restaurants.find((r) => r.name === value);
        if (restaurant) {
          this.previewQrMenu.restaurant = restaurant;
          this.previewQrMenu.sectionsToShow = this.restaurantSections;
        }
      }
    );
  }

  setFieldValues(
    menuTitle: string,
    urlSuffix: string,
    restaurantId: string,
    sectionsToShow: string[]
  ) {
    this.form.controls['qrMenuDisplayNameControl'].setValue(menuTitle);
    this.form.controls['urlSuffixControl'].setValue(urlSuffix);

    const restaurant = this.restaurants.find((r) => r.id === restaurantId);
    if (restaurant) {
      this.form.controls['restaurantNameControl'].setValue(restaurant);
      this.onRestaurantChange(restaurant, sectionsToShow);
    }
  }

  get sectionsFormArray(): FormArray<FormControl> {
    if (!this.form) {
      return this.fb.array([]);
    }
    return this.form.get('sections') as FormArray<FormControl>;
  }

  onRestaurantChange(
    restaurant: Restaurant,
    sectionsToShow: string[] | null = null
  ) {
    this.previewQrMenu.restaurant = restaurant;
    this.sectionsFormArray.clear();
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
      restaurant.tripAdvisorUrl
    ) {
      this.restaurantSections.push({
        key: 'social',
        name: this.translate.instant('code.sections.social'),
        checked: true,
      });
    }

    if (sectionsToShow != null) {
      for (let section of this.restaurantSections) {
        section.checked = sectionsToShow.includes(section.key);
      }
    }

    this.previewQrMenu.sectionsToShow = this.restaurantSections
      .filter((s: any) => s.checked)
      .map((s: any) => s.key);

    this.restaurantSections.forEach((section: any) => {
      this.sectionsFormArray.push(this.fb.control(section.checked));
    });
  }

  updateRestaurantSections() {
    const selectedSections = this.sectionsFormArray.value;
    this.restaurantSections.forEach((section: any, index: number) => {
      section.checked = selectedSections[index];
    });
    this.previewQrMenu.sectionsToShow = this.restaurantSections
      .filter((s: any) => s.checked)
      .map((s: any) => s.key);
  }

  get configuration(): GeneralConfiguration {
    return {
      restaurant: this.form.controls['restaurantNameControl']
        .value as Restaurant,
      title: this.previewQrMenu.title ?? '',
      urlSuffix: this.form.controls['urlSuffixControl'].value as string,
      sections: this.previewQrMenu.sectionsToShow,
    };
  }
}

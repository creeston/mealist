import { Component, OnInit, Input } from '@angular/core';
import * as L from 'leaflet';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-restaurant-map',
  templateUrl: 'restaurant-map.component.html',
  styleUrls: ['./restaurant-map.component.css']
})
export class RestaurantMapComponent implements OnInit {
  @Input() address: string = '';
  @Input() city: string = '';
  @Input() restaurantName: string = '';

  private map: L.Map | null = null;

  constructor(private geocodingService: GeocodingService) { }

  private initMap(latitude: number, longitude: number): void {
    this.map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      trackResize: false,
      boxZoom: false,
      dragging: false,
      keyboard: false,
      tap: false,
      doubleClickZoom: false,
    }).setView([latitude, longitude], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    const marker = L.marker([latitude, longitude]).addTo(this.map);;
  }

  ngOnInit(): void {
    if (this.address) {
      this.geocodingService.geocodeAddress(this.address, this.city).then((result) => {
        if (result && result.length > 0) {
          const latitude = parseFloat(result[0].lat);
          const longitude = parseFloat(result[0].lon);
          this.initMap(latitude, longitude);
        } else {
          console.error('Geocoding API returned no results.');
        }
      }, error => {
        console.error('Geocoding API error:', error);
      });
    }
  }
}

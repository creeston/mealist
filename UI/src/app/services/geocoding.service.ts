import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GeocodingService {

    private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

    constructor(private http: HttpClient) { }

    async geocodeAddress(street: string, city: string): Promise<any> {
        const params = {
            street: street,
            city: city,
            format: 'json',
            addressdetails: '1',
            limit: '1',
        };

        return await firstValueFrom(this.http.get(this.nominatimUrl, { params }));
    }
}

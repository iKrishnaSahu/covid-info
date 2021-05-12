import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private vaccineAvailabilityEndpoint = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin';

  constructor(private http: HttpClient) { }

  getVaccineAvailability(pincode: string, date: string): Promise<any> {
    return this.http.get(`${this.vaccineAvailabilityEndpoint}?pincode=${pincode}&date=${date}`).toPromise();
  }
}

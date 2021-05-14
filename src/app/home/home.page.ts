import { Component } from '@angular/core';
import { DataService } from '../services/data/data.service';
import _ from 'lodash';
import * as moment from 'moment';
import { Vibration } from '@ionic-native/vibration/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  pincode = '';
  availableVaccineHospitalList: VaccineAvailability[] = [];
  interval;
  updatedOn;
  today;
  tommorrow;
  isFetching = false;

  constructor(private dataService: DataService, private vibration: Vibration) { }

  startSearch() {
    this.interval = setInterval(() => this.getData(), 5000);
  }

  getData() {
    if (!_.isEmpty(this.pincode)) {
      this.today = moment().format('DD-MM-YYYY');
      this.tommorrow = moment().add(1, 'day').format('DD-MM-YYYY');
      this.isFetching = true;
      Promise.all([this.dataService.getVaccineAvailability(this.pincode, this.today),
      this.dataService.getVaccineAvailability(this.pincode, this.tommorrow)])
        .then((data) => {
          this.updatedOn = moment().valueOf();
          this.availableVaccineHospitalList = [];
          const todayCenter = data[0].centers;
          const tommorrowCenter = data[1].centers;
          console.log(todayCenter, tommorrowCenter);
          _.forEach(todayCenter, (center) => {
            const numberOfVaccineAvailableToday = this.getAvailableVaccineCount(center);
            this.availableVaccineHospitalList.push({ name: center.name, numberOfVaccineAvailableToday });
          });
          _.forEach(tommorrowCenter, (center) => {
            const numberOfVaccineAvailableTommorow = this.getAvailableVaccineCount(center);
            const index = this.availableVaccineHospitalList.findIndex(x => x.name === center.name);
            if (index) {
              this.availableVaccineHospitalList[index].numberOfVaccineAvailableTommorow = numberOfVaccineAvailableTommorow;
            } else {
              this.availableVaccineHospitalList.push({ name: center.name, numberOfVaccineAvailableTommorow });
            }
          });
          const playAudiAndVibrate = _.some(this.availableVaccineHospitalList, (availableObject) => {
            if (availableObject.numberOfVaccineAvailableToday > 0 || availableObject.numberOfVaccineAvailableTommorow > 0) {
              return true;
            }
          });
          if (playAudiAndVibrate) {
            this.playAudioAndVibrate();
          }
        }).finally(() => {
          setTimeout(() => { this.isFetching = false; }, 1000);
        });
    }
  }

  playAudioAndVibrate() {
    try {
      const audio = new Audio();
      audio.src = '/assets/audio/ring.mp3';
      audio.load();
      audio.play();
      setTimeout(() => {
        audio.pause();
      }, 5000);
      this.vibration.vibrate(1000);
    }
    catch (err) { }
  }

  getAvailableVaccineCount(center: any) {
    return center.sessions ? (center.sessions as []).reduce((prev, curr) => prev + (curr as any).available_capacity, 0) : 0;
  }

  stopSearch() {
    clearInterval(this.interval);
    this.interval = undefined;
  }
}


export interface VaccineAvailability {
  name: string;
  numberOfVaccineAvailableToday?: number;
  numberOfVaccineAvailableTommorow?: number;
}

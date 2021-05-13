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
  availableVaccineHospitalList: { name: string; numberOfVaccineAvailable: number }[] = [];
  interval;
  updatedOn;
  currentDate;

  constructor(private dataService: DataService, private vibration: Vibration) { }

  startSearch() {
    this.interval = setInterval(() => this.getData(), 5000);
  }

  getData() {
    if (!_.isEmpty(this.pincode)) {
      this.currentDate = moment().add(1, 'day').format('DD-MM-YYYY');
      this.dataService.getVaccineAvailability(this.pincode, this.currentDate)
        .then((data) => {
          this.updatedOn = moment().valueOf();
          this.availableVaccineHospitalList = [];
          const centers = data.centers as [];
          console.log(centers);
          _.forEach(centers, (center) => {
            const numberOfVaccineAvailable = this.getAvailableVaccineCount(center);
            if (numberOfVaccineAvailable > 0) {
              this.playAudioAndVibrate();
            }
            this.availableVaccineHospitalList.push({ name: center.name, numberOfVaccineAvailable });
          });
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

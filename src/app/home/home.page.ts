import { Component } from '@angular/core';
import { DataService } from '../services/data/data.service';
import _ from 'lodash';
import * as moment from 'moment';

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

  constructor(private dataService: DataService) { }

  startSearch() {
    this.interval = setInterval(() => this.getData(), 5000);
  }

  getData() {
    if (!_.isEmpty(this.pincode)) {
      const currenDate = moment().format('DD-MM-YYYY');
      this.dataService.getVaccineAvailability(this.pincode, currenDate)
        .then((data) => {
          this.updatedOn = moment().valueOf();
          this.availableVaccineHospitalList = [];
          const centers = data.centers as [];
          _.forEach(centers, (center) => {
            const numberOfVaccineAvailable = this.getAvailableVaccineCount(center);
            if (numberOfVaccineAvailable > 0) {
              this.playAudio();
            }
            this.availableVaccineHospitalList.push({ name: center.name, numberOfVaccineAvailable });
          });
        });
    }
  }

  playAudio() {
    const audio = new Audio();
    audio.src = '/assets/audio/ring.mp3';
    audio.load();
    audio.play();
    setTimeout(() => {
      audio.pause();
    }, 5000);
  }

  getAvailableVaccineCount(center: any) {
    return center.sessions ? (center.sessions as []).reduce((prev, curr) => prev + (curr as any).available_capacity, 0) : 0;
  }

  stopSearch() {
    clearInterval(this.interval);
    this.interval = undefined;
  }
}

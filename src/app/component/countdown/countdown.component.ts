import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {

  targetDate = 1601805600000;
  countDownTime: any;

  constructor(public myElement: ElementRef) { }

  ngOnInit(): void {
    this.countDownTime = {
      date: null,
      hours: null,
      mins: null,
      seconds: null
    };

    const currentDate = Date.now();
    const remainingTimeBySeconds = Math.round((this.targetDate - currentDate) / 1000);
    if (remainingTimeBySeconds > 0) {
      const remainingTimeByMinutes = Math.floor(remainingTimeBySeconds / 60);
      this.countDownTime.seconds = remainingTimeBySeconds % 60;

      const remainingTimeByHours = Math.floor(remainingTimeByMinutes / 60);
      this.countDownTime.mins = remainingTimeByMinutes % 60;

      const remainingTimeByDate = Math.floor(remainingTimeByHours / 24);
      this.countDownTime.hours = remainingTimeByHours % 24;

      this.countDownTime.date = remainingTimeByDate;

      const intervalTime = setInterval(() => {
        if (!this.countDownTime.date && !this.countDownTime.hours && !this.countDownTime.mins && !this.countDownTime.seconds) {
          clearInterval(intervalTime);
        }
        if (this.countDownTime.seconds === 0) {
          if (Date.now() >= this.targetDate) {
            clearInterval(intervalTime);
            return;
          }
          this.countDownTime.seconds = 59;
          if (this.countDownTime.mins === 0) {
            this.countDownTime.mins = 59;
            if (this.countDownTime.hours === 0) {
              this.countDownTime.hours = 23;
              this.countDownTime.date--;
            } else {
              this.countDownTime.hours--;
            }
          } else {
            this.countDownTime.mins--;
          }
        } else {
          this.countDownTime.seconds--;
        }
      }, 1000);
    } else {
      this.countDownTime = {
        date: 0,
        hours: 0,
        mins: 0,
        seconds: 0
      };
    }

  }

}

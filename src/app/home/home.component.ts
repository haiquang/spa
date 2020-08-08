import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CoupleComponent } from '../component/couple/couple.component';
import { PhotoSliderComponent } from '../component/photo-slider/photo-slider.component';
import { CountdownComponent } from '../component/countdown/countdown.component';
import { EventComponent } from '../component/event/event.component';
import { WishesComponent } from '../component/wishes/wishes.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  scrollYTransform: string;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
  }

  scrollTo(type) {
    let el;
    setTimeout(() => {
      switch (type) {
        case 'home':
          el = this.elementRef.nativeElement.querySelector('.photo-slider__view');
          break;
        case 'couple':
          el = this.elementRef.nativeElement.querySelector('.couple__view');
          break;
        case 'countdown':
          el = this.elementRef.nativeElement.querySelector('.countdown__view');
          break;
        case 'event':
          el = this.elementRef.nativeElement.querySelector('.event__view');
          break;
        case 'wish':
          el = this.elementRef.nativeElement.querySelector('.wishes__view');
          break;
        default:
          el = this.elementRef.nativeElement.querySelector('.photo-slider__view');
          break;
      }
      el.scrollIntoView();
    }, 100);
  }
}

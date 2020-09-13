import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  scrollYTransform: string;
  items: any;

  @ViewChild('sidenav') sidenav: any;
  constructor(private elementRef: ElementRef) {}

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
        case 'gallery':
          el = this.elementRef.nativeElement.querySelector('.gallery__view');
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

  toggle() {
    this.sidenav.toggle();
  }
}

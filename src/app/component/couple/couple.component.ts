import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Rainy } from 'src/app/class/rainy/rainy';

@Component({
  selector: 'app-couple',
  templateUrl: './couple.component.html',
  styleUrls: ['./couple.component.scss']
})
export class CoupleComponent implements OnInit {

  @ViewChild('background1', {static: false}) background1: ElementRef;
  @ViewChild('parentElement1', {static: false}) parentElement1: ElementRef;
  @ViewChild('background2', {static: false}) background2: ElementRef;
  @ViewChild('parentElement2', {static: false}) parentElement2: ElementRef;
  constructor(public myElement: ElementRef) { }

  ngOnInit(): void {
    setTimeout(() => {
      // this.initRainy(this.background1.nativeElement, this.parentElement1.nativeElement);
      // this.initRainy(this.background2.nativeElement, this.parentElement2.nativeElement);
    }, 100);
  }

  initRainy(index) {
    let element, parentElement;
    switch (index) {
      case 1:
        element = this.background1.nativeElement;
        parentElement = this.parentElement1.nativeElement;
        break;
      case 2:
        element = this.background2.nativeElement;
        parentElement = this.parentElement2.nativeElement;
        break;
      default: break;
    }
    const rainyDay = new Rainy({
      image: element,
      parentElement: parentElement
    });

    rainyDay.trail = rainyDay.TRAIL_SMUDGE;

    rainyDay.rain([
      [1, 3, 5]
    ], 500);
  }

}

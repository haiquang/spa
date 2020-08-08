import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-photo-slider',
  templateUrl: './photo-slider.component.html',
  styleUrls: ['./photo-slider.component.scss']
})
export class PhotoSliderComponent implements OnInit {

  constructor(public myElement: ElementRef) { }

  ngOnInit(): void {
  }

}

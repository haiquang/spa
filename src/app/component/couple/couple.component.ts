import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-couple',
  templateUrl: './couple.component.html',
  styleUrls: ['./couple.component.scss']
})
export class CoupleComponent implements OnInit {

  constructor(public myElement: ElementRef) { }

  ngOnInit(): void {
  }

}

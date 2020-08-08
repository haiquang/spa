import { Component, OnInit, ElementRef } from '@angular/core';
import { faClock, faMapMarker } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {

  faMapMarker = faMapMarker;
  faClock = faClock;
  constructor(public myElement: ElementRef) { }

  ngOnInit(): void {
    console.log(this.myElement.nativeElement);
  }

}

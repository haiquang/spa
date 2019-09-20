import { Component, OnInit, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  @ViewChild('videoArea') videoArea;

  scrollYTransform: string;

  constructor() { }

  @HostListener('window:scroll', ['$event']) 
    scrollHandler(event) {
      this.scrollYTransform = '' + (200 - window.scrollY + (window.scrollY*0.3)) + 'px';
      this.videoArea.nativeElement.style.transform = "translate3d(0," + this.scrollYTransform + ", 0)";
    }

  ngOnInit() {
  }

}

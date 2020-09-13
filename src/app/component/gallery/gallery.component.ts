import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database/database.service';
declare var Isotope: any;
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  items = [];
  mode: boolean;
  isotope: any;
  time: number;
  MAX_NUMBER = 3;
  constructor(private database: DatabaseService) { }

  ngOnInit(): void {
    this.database.getImages().subscribe((data: Array<any>) => {
      data.forEach((src) => {
        this.items.push({src, number: this.getRandomNum()});
      });

      setTimeout(() => {
        const grid = document.querySelector('.grid');
        this.isotope = new Isotope(grid, {
          itemSelector: '.grid-item',
          layoutMode: 'masonry',
        });

        if (!this.mode) {
          this.isotope.arrange({filter: '.even'});
        }
      }, 1000);
    });
  }

  setFilter(mode) {
    this.mode = mode;
    if (!mode) {
      this.isotope.arrange({filter: '.even'});
    } else {
      this.isotope.arrange({filter: (itemElem) => {
        return true;
      }});
    }
  }

  loaded() {
    if (this.time) {
      clearTimeout(this.time);
    }
    this.time = setTimeout(() => {
      this.isotope.layout();
    }, 1000);
  }

  showImage() {

  }

  getRandomNum() {
    return Math.floor(Math.random() * Math.floor(this.MAX_NUMBER));
  }
}

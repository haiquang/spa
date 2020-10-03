import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from 'src/app/services/database/database.service';
import { AppConst } from 'src/app/constant/app-const';
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
  MAX_NUMBER = 4;
  imageLoaded = {};
  constructor(private database: DatabaseService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.database.getImages(AppConst.IMAGE.ORIGINAL).subscribe((data: Array<any>) => {
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
      }, 500);
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

  loaded(index) {
    this.imageLoaded[index] = true;
    if (this.time) {
      clearTimeout(this.time);
    }
    this.time = setTimeout(() => {
      this.isotope.layout();
    }, 100);
  }

  showImage(index) {
    // const dialogRef = this.dialog.open(PictureDetailComponent, {
    //   data: {
    //     index: index,
    //     items: this.items
    //   }
    // });
  }

  getRandomNum() {
    return Math.floor(Math.random() * Math.floor(this.MAX_NUMBER));
  }
}

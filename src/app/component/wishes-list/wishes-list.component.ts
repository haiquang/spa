import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from 'src/app/services/database/database.service';

@Component({
  selector: 'app-wishes-list',
  templateUrl: './wishes-list.component.html',
  styleUrls: ['./wishes-list.component.scss']
})
export class WishesListComponent implements OnInit {
  wishesList = [];
  disabledBtnLeft = false;
  disabledBtnRight = false;
  time: any;
  dataForDisplay: any = {};
  @ViewChild('wishesContainer', {static: false}) wishesListElement: ElementRef;
  @ViewChild('matCardContainer', {static: false}) matCardElement: ElementRef;
  @ViewChild('detailView', {static: false}) detailView: ElementRef;

  constructor(private elementRef: ElementRef, private database: DatabaseService) {
  }

  ngOnInit(): void {
    this.database.wishesObjectCame.subscribe(() => {
      this.handle();
    });
  }

  scrollHandler(event) {
    if (this.time) {
      clearTimeout(this.time);
    }

    this.time = setTimeout(() => {
      this.handleDisableBtn();
    }, 500);
  }

  handle() {
    this.wishesList = [];
    const wishesObj = this.database.getWishes();
    Object.keys(wishesObj).map(key => {
      if (wishesObj[key] && Array.isArray(wishesObj[key])) {
        wishesObj[key].map(infor => {
          const tempInfor = JSON.parse(JSON.stringify(infor));
          tempInfor.dateTime = key;
          this.wishesList.push(tempInfor);
        });
      }
    });

    this.wishesList = this.wishesList.sort((before, after) => {
      return after.timestamp - before.timestamp;
    });

    this.wishesList.forEach((data, index) => {
      this.resolveCanvas(data.name, data.dateTime, index, () => {
        setTimeout(() => {
          this.handleDisableBtn();
        }, 300);
      });
    });
  }

  handleDisableBtn() {
    this.disabledBtnLeft = (this.wishesListElement.nativeElement.scrollLeft < 20);
    // tslint:disable-next-line: max-line-length
    this.disabledBtnRight = (this.wishesListElement.nativeElement.scrollWidth <= this.matCardElement.nativeElement.clientWidth || (this.wishesListElement.nativeElement.scrollLeft + this.matCardElement.nativeElement.clientWidth) >= this.wishesListElement.nativeElement.scrollWidth);
  }

  resolveCanvas(name, datetime, index, callback) {
    setTimeout(() => {
      const canvas = this.wishesListElement.nativeElement.querySelector(`#canvas-${index}`);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        const local = this;

        img.onload = function () {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          ctx.font = '16px Dancing';
          ctx.fillText('From', 20, 80);
          local.wrapText(ctx, name, 15, 110, 95, 16);
          ctx.font = '10px Dancing';
          ctx.fillText(datetime, 20, 180);

          if (index === (local.wishesList.length - 1) && typeof callback === 'function') {
            callback();
          }
        };

        img.src = 'assets/photo/small-paper.png';
      }
    }, 500);
  }



  wrapText(context, text, x, y, line_width, line_height) {
    let line = '';
    const paragraphs = text.split('\n');
    for (let i = 0; i < paragraphs.length; i++) {
      const words = paragraphs[i].split(' ');
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > line_width && n > 0) {
          context.fillText(line, x, y);
          line = words[n] + ' ';
          y += line_height;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
      y += line_height;
      line = '';
    }
  }

  goTo(num, $event) {
    $event.stopPropagation();
    switch (num) {
      case -1:
        this.wishesListElement.nativeElement.scrollTo({
          left: this.wishesListElement.nativeElement.scrollLeft - 200,
          behavior: 'smooth'
        });
        break;
      case 1:
        this.wishesListElement.nativeElement.scrollTo({
          left: this.wishesListElement.nativeElement.scrollLeft + 200,
          behavior: 'smooth'
        });
        break;
      default:
        break;
    }
  }

  showDetail(index) {
    const data = this.wishesList[index];
    this.dataForDisplay = {
      name: data.name,
      content: data.comment
    };
  }

  removeDetail() {
    this.dataForDisplay = {};
  }

  getStyle() {
    if (this.dataForDisplay.name) {
      return {
        visibility: 'visible',
        opacity: 1
      };
    }
    return '';
  }

}

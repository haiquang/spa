import { Component, OnInit, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database/database.service';
import { IpService } from 'src/app/services/ip-service/ip-service.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../dialog/alertDialog/alert/alert.component';

@Component({
  selector: 'app-wishes',
  templateUrl: './wishes.component.html',
  styleUrls: ['./wishes.component.scss']
})
export class WishesComponent implements OnInit {
  name: string;
  nickname: string;
  selectValue: string;
  comment: string;
  ipAdress: string;

  disableSelect = new FormControl(false);
  select = new FormControl();
  constructor(public myElement: ElementRef, private database: DatabaseService, private datePipe: DatePipe, private ipService: IpService,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.ipService.getIpAdress().subscribe((res: any) => this.ipAdress = res.ip);
  }

  submit() {
    let wishesObj = this.database.getWishes();
    const now = this.datePipe.transform(Date.now(), 'yyyyMMdd');
    if (wishesObj) {
      if (!wishesObj[now]) {
        wishesObj[now] = [];
      }
      let index, count = 0;

      wishesObj[now].forEach((item, id) => {
        if (item.name === this.name && item.nickname === this.nickname && !index) {
          index = id;
        }
        if (this.ipAdress === item.ipAdress) {
          count++;
        }
      });

      if (count) {
        this.dialog.open(AlertComponent, {
          data: {
            title: 'Oops',
            content: 'Bạn đã gởi lời chúc quá 5 lần trong hôm nay. Hãy thử lại vào ngày mai nhé..'
          }
        });
        return;
      }

      if (index > -1) {
        wishesObj[now][index] = {
          name: this.name,
          nickname: this.nickname,
          comment: this.comment,
          gender: this.selectValue
        };
      } else {
        wishesObj[now].push({
          name: this.name,
          nickname: this.nickname,
          comment: this.comment,
          gender: this.selectValue,
          ipAdress: this.ipAdress
        });
      }
    } else {
      wishesObj = {};
    }
    this.database.update(wishesObj);
  }
}

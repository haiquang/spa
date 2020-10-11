import { Component, OnInit, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database/database.service';
import { IpService } from 'src/app/services/ip-service/ip-service.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../dialog/alertDialog/alert/alert.component';
import { AppConst } from 'src/app/constant/app-const';

@Component({
  selector: 'app-wishes',
  templateUrl: './wishes.component.html',
  styleUrls: ['./wishes.component.scss']
})
export class WishesComponent implements OnInit {
  selectValue: string;
  ipAdress: string;
  userAgent: string;

  wishForm: FormGroup;

  disableSelect = new FormControl(false);
  select = new FormControl();
  constructor(public myElement: ElementRef, private database: DatabaseService, private datePipe: DatePipe, private ipService: IpService,
              public dialog: MatDialog, private formbuilder: FormBuilder) {
    this.wishForm = this.formbuilder.group({
      'name': [null, Validators.required],
      'nickname': [null],
      'comment': [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.ipService.getIpAdress().subscribe((res: any) => this.ipAdress = res.ip);
    this.userAgent = navigator.userAgent;
  }

  submit() {
    this.markFormTouched(this.wishForm);

    if (this.wishForm.valid) {
      // You will get form value if your form is valid
      const formValues = this.wishForm.getRawValue();
      let wishesObj = this.database.getWishes();
      const now = this.datePipe.transform(Date.now(), 'dd-MM-yyyy');
      if (wishesObj) {
        if (!wishesObj[now]) {
          wishesObj[now] = [];
        }
        let index, count = 0;

        wishesObj[now].forEach((item, id) => {
          if (item.name === formValues.name && item.nickname === formValues.nickname && this.userAgent === item.userAgent && !index) {
            index = id;
          }
          if (this.ipAdress === item.ipAdress && this.userAgent === item.userAgent) {
            count++;
          }
        });

        if (count > AppConst.MAX_LENGTH.WISH) {
          this.dialog.open(AlertComponent, {
            data: {
              title: 'Oops',
              content: 'Bạn đã gởi lời chúc quá 5 lần trong hôm nay. Hãy thử lại vào ngày mai nhé..',
              type: AppConst.POPUP.ALERT
            }
          });
          return;
        }

        if (index > -1) {
          wishesObj[now][index] = {
            name: formValues.name,
            nickname: formValues.nickname,
            comment: formValues.comment,
            gender: this.selectValue
          };
        } else {
          wishesObj[now].push({
            name: formValues.name,
            nickname: formValues.nickname,
            comment: formValues.comment,
            gender: this.selectValue || '',
            ipAdress: this.ipAdress,
            userAgent: this.userAgent
          });
        }
      } else {
        wishesObj = {};
      }
      this.database.update(wishesObj).then(res => {
        const successOpen = this.dialog.open(AlertComponent, {
          data: {
            title: 'Thành Công',
            content: 'Bạn đã gởi lời chúc thành công đến Cô Dâu/Chú Rể. Cảm ơn và hẹn gặp lại ở buổi tiệc nhé!',
            type: AppConst.POPUP.SUCCESS
          }
        });

        successOpen.afterClosed().subscribe(result => {
          this.selectValue = '';
          this.wishForm.reset();
        });
      });

    }
  }

  markFormTouched(group: FormGroup | FormArray) {
    Object.keys(group.controls).forEach((key: string) => {
      const control = group.controls[key];
      if (control instanceof FormGroup || control instanceof FormArray) {
        control.markAsTouched();
        this.markFormTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  removeField(field) {
    this.wishForm.get(field).setValue('');
  }
}

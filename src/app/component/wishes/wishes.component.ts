import { Component, OnInit, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-wishes',
  templateUrl: './wishes.component.html',
  styleUrls: ['./wishes.component.scss']
})
export class WishesComponent implements OnInit {
  name: string;
  nickname: string;
  selectValue: string;

  disableSelect = new FormControl(false);
  select = new FormControl();
  constructor(public myElement: ElementRef) { }

  ngOnInit(): void {
  }

}

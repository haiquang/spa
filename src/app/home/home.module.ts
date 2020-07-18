import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { NavitationBarComponent } from '../component/navitation-bar/navitation-bar.component';
import { MaterialModule } from '../material/material.module';
import { PhotoSliderComponent } from '../component/photo-slider/photo-slider.component';
import { CoupleComponent } from '../component/couple/couple.component';
import { CountdownComponent } from '../component/countdown/countdown.component';
import { EventComponent } from '../component/event/event.component';
import { WishesComponent } from '../component/wishes/wishes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    HomeComponent,
    NavitationBarComponent,
    PhotoSliderComponent,
    CoupleComponent,
    CountdownComponent,
    EventComponent,
    WishesComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class HomeModule { }

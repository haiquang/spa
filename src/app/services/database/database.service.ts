import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  wishesDbs: AngularFireObject<any>;
  private wishesObj;
  private images = [];
  private imageObse: Observable<any>;

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) {
    this.wishesDbs = this.db.object('wishes');
    this.wishesDbs.valueChanges().subscribe(arg => {
      this.wishesObj = arg;
    });
  }

  getWishes() {
    return this.wishesObj;
  }

  save(obj) {
    this.wishesDbs.set(obj);
  }

  update(obj) {
    this.wishesDbs.update(obj);
  }

  delete() {
    this.wishesDbs.remove();
  }

  getImages(type) {
    const imageObservable = new Observable((observer) => {
      this.storage.ref(type).listAll().subscribe((listImages) => {
        listImages.items.forEach(item => {
          this.images.push(item.getDownloadURL());
        });
        forkJoin(this.images).subscribe((data) => {
          observer.next(data);
        });
      });
    });
    return imageObservable;
  }
}

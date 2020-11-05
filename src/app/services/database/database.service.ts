import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable, Subject } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  wishesDbs: AngularFireObject<any>;
  private wishesObj;
  private images = [];
  private imageObse: Observable<any>;
  public wishesObjectCame: Subject<any>;

  googleApi = 'https://storage.googleapis.com/';


  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage, private http: HttpClient) {
    this.wishesDbs = this.db.object('wishes');
    this.wishesObjectCame = new Subject();
    this.wishesDbs.valueChanges().subscribe(arg => {
      this.wishesObj = arg;
      this.wishesObjectCame.next();
    });
  }

  getWishes() {
    return this.wishesObj;
  }

  save(obj) {
    return this.wishesDbs.set(obj);
  }

  update(obj) {
    return this.wishesDbs.update(obj);
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
      }, err => {
        observer.error(err);
      });
    });
    return imageObservable;
  }

  getImagesFromGoogleCloud() {
    return new Observable((observer) => {
      const data = [];
      this.http.get(`${this.googleApi}storage/v1/b/confident-pen-138413.appspot.com/o`).subscribe((res: any) => {
        if (res && res.items && res.items.length) {
          res.items.map((item) => {
            const url = `${this.googleApi}${item.bucket}/${item.name}`;
            data.push(url);
          });
        }
        observer.next(data);
      }, err => {
        observer.error(err);
      });
    });
  }
}

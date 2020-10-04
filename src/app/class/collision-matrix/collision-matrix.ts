import { DropItem } from '../drop-item/drop-item';

export class CollisionMatrix {
  resolution: any;
  xc: any;
  yc: any;
  matrix: Array<any>;

  constructor(x, y, r) {
    this.resolution = r;
    this.xc = x;
    this.yc = y;
    this.matrix = new Array(x);
    for (let i = 0; i <= x + 5; i++) {
      this.matrix[i] = new Array(y);
      for (let j = 0; j <= y + 5; ++j) {
        this.matrix[i][j] = new DropItem(null);
      }
    }
  }

  update(drop, forceDelete) {
    if (drop.gid) {
      if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
        return null;
      }
      this.matrix[drop.gmx][drop.gmy].remove(drop);
      if (forceDelete) {
        return null;
      }

      drop.gmx = Math.floor(drop.x / this.resolution);
      drop.gmy = Math.floor(drop.y / this.resolution);
      if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
        return null;
      }
      this.matrix[drop.gmx][drop.gmy].add(drop);

      const collisions = this.collisions(drop);
      if (collisions && collisions.next != null) {
        return collisions.next;
      }
    } else {
      drop.gid = Math.random()
        .toString(36)
        .substr(2, 9);
      drop.gmx = Math.floor(drop.x / this.resolution);
      drop.gmy = Math.floor(drop.y / this.resolution);
      if (!this.matrix[drop.gmx] || !this.matrix[drop.gmx][drop.gmy]) {
        return null;
      }

      this.matrix[drop.gmx][drop.gmy].add(drop);
    }
    return null;
  }

  collisions(drop) {
    let item = new DropItem(null);
    const first = item;

    item = this.addAll(item, drop.gmx - 1, drop.gmy + 1);
    item = this.addAll(item, drop.gmx, drop.gmy + 1);
    item = this.addAll(item, drop.gmx + 1, drop.gmy + 1);

    return first;
  }

  addAll(to, x, y) {
    if (x > 0 && y > 0 && x < this.xc && y < this.yc) {
      let items = this.matrix[x][y];
      while (items.next != null) {
        items = items.next;
        to.next = new DropItem(items.drop);
        to = to.next;
      }
    }
    return to;
  }

  remove(drop) {
    this.matrix[drop.gmx][drop.gmy].remove(drop);
  }


}

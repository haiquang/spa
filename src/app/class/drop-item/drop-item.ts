export class DropItem {
  drop: any;
  next: any;

  constructor(drop) {
    this.drop = drop;
    this.next = null;
  }

  add(drop) {
    let item = this;
    while (item.next != null) {
      item = item.next;
    }
    item.next = new DropItem(drop);
  }

  remove(drop) {
    let item = this;
    let prevItem = null;
    while (item.next != null) {
      prevItem = item;
      item = item.next;
      if (item.drop.gid === drop.gid) {
        prevItem.next = item.next;
      }
    }
  }


}

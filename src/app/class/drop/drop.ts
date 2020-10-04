export class Drop {
  x: number;
  y: number;
  r: number;
  rainyday: any;
  context: any;
  reflection: any;
  colliding: any;
  yspeed: any;
  terminate: any;

  constructor(rainyday, centerX, centerY, min, base) {
    this.x = Math.floor(centerX);
    this.y = Math.floor(centerY);
    this.r = Math.ceil(Math.random() * base + min);
    this.rainyday = rainyday;
    this.context = rainyday.context;
    this.reflection = rainyday.reflected;
  }

  draw() {
    this.context.save();
    this.context.beginPath();

    const orgR = this.r;
    this.r = Math.floor(0.95 * this.r);
    if (this.r < 3) {
      this.context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
      this.context.closePath();
    } else if (this.colliding || this.yspeed > 2) {
      if (this.colliding) {
        const collider = this.colliding;
        this.r = 1.001 * (this.r > collider.r ? this.r : collider.r);
        this.x += collider.x - this.x;
        this.colliding = null;
      }

      const yr = 1 + 0.1 * this.yspeed;
      this.context.moveTo(this.x - this.r / yr, this.y);
      this.context.bezierCurveTo(
        this.x - this.r,
        this.y - this.r * 2,
        this.x + this.r,
        this.y - this.r * 2,
        this.x + this.r / yr,
        this.y
      );
      this.context.bezierCurveTo(
        this.x + this.r,
        this.y + yr * this.r,
        this.x - this.r,
        this.y + yr * this.r,
        this.x - this.r / yr,
        this.y
      );
    } else {
      this.context.arc(this.x, this.y, this.r * 0.9, 0, Math.PI * 2, true);
      this.context.closePath();
    }

    this.context.clip();

    this.r = orgR;

    if (this.rainyday.reflection) {
      this.rainyday.reflection(this);
    }

    this.context.restore();
  }

  clear(force) {
    this.context.clearRect(
      this.x - this.r - 1,
      this.y - this.r - 2,
      2 * this.r + 2,
      2 * this.r + 2
    );

    if (force) {
      this.terminate = true;
      return true;
    }
    if (
      this.y - this.r > this.rainyday.canvas.height ||
      this.x - this.r > this.rainyday.canvas.width ||
      this.x + this.r < 0
    ) {
      // over edge so stop this drop
      return true;
    }
    return false;
  }

  animate() {
    if (this.terminate) {
      return false;
    }

    const stopped = this.rainyday.gravity(this);
    if (!stopped && this.rainyday.trail) {
      this.rainyday.trail(this);
    }
    if (this.rainyday.options.enableCollisions) {
      const collisions = this.rainyday.matrix.update(this, stopped);
      if (collisions) {
        this.rainyday.collision(this, collisions);
      }
    }
    return !stopped || this.terminate;
  }
}

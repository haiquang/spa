import { BlurStack } from '../blur-stack/blur-stack';
import { CollisionMatrix } from '../collision-matrix/collision-matrix';
import { Drop } from '../drop/drop';

export class Rainy {
  imgSource: any;
  img: any;
  bckStyle: any;
  canvas: any;
  customDrop: any;
  imgDownscaled: any;
  options: any;
  drops: any;
  reflection: any;
  trail: any;
  gravity: any;
  collision: any;
  glass: any;
  addDropCallback: any;
  requestID: any;
  requestAnimFrame: any;
  reflected: any;
  context: any;
  presets: any;
  PRIVATE_GRAVITY_FORCE_FACTOR_Y: any;
  PRIVATE_GRAVITY_FORCE_FACTOR_X: any;
  matrix: any;
  clearbackground: any;
  background: any;

  constructor(options) {
    // if (this === window) {
    //   // if *this* is the window object, start over with a *new* object
    //   return new RainyDay(options)
    // }

    const src =
      typeof options.image === 'string'
        ? document.getElementById(options.image)
        : options.image;

    if (src.tagName.toLowerCase() === 'img') {
      this.imgSource = null;
      this.img = src;
      this.initialize(options);
    } else {
      const self = this;
      const style = src.currentStyle || window.getComputedStyle(src),
        bi = style.backgroundImage.slice(4, -1).replace(/"/g, '');

      const imgTemp = document.createElement('img');
      imgTemp.onload = function () {
        self.imgSource = src;
        self.img = this;
        self.initialize(options);
      };

      imgTemp.src = bi;
      // backup bck url
      self.bckStyle = style;
    }
  }


  destroy() {
    this.pause();
    this.canvas.parentNode.removeChild(this.canvas);

    if (this.bckStyle) {
      this.imgSource.style.background = this.bckStyle.background;
    }

    Object.keys(this).forEach(function (item) {
      delete this[item];
    });
  }

  initialize(options) {
    const sourceParent = this.imgSource || options.parentElement || document.getElementsByTagName('body')[0];
    const parentOffset = this.getOffset(sourceParent);

    this.imgDownscaled = this.customDrop || this.downscaleImage(this.img, 50);
    if (options.sound) {
      this.playSound(options.sound);
    }

    const defaults = {
      opacity: 1,
      blur: 10,
      crop: [0, 0, this.img.naturalWidth, this.img.naturalHeight],
      enableSizeChange: true,
      parentElement: sourceParent,
      fps: 24,
      fillStyle: '#8ED6FF',
      enableCollisions: true,
      gravityThreshold: 3,
      gravityAngle: Math.PI / 2,
      gravityAngleconstiance: 0,
      reflectionScaledownFactor: 5,
      reflectionDropMappingWidth: 200,
      reflectionDropMappingHeight: 200,
      width: sourceParent.clientWidth,
      height: sourceParent.clientHeight,
      position: 'absolute',
      // top: parentOffset.top + 'px',
      // left: parentOffset.left + 'px',
      top: '0px',
      left: '0px'
    };

    // add the defaults to options
    for (const option in defaults) {
      if (typeof options[option] === 'undefined') {
        options[option] = defaults[option];
      }
    }
    this.options = options;

    this.drops = [];

    // prepare canvas elements
    this.canvas = this.options.canvas || this.prepareCanvas();
    this.prepareBackground();
    this.prepareGlass();

    // assume defaults
    this.reflection = this.REFLECTION_MINIATURE;
    this.trail = this.TRAIL_DROPS;
    this.gravity = this.GRAVITY_NON_LINEAR;
    this.collision = this.COLLISION_SIMPLE;

    // set polyfill of requestAnimationFrame
    this.setRequestAnimFrame();

    // Start rain engine
    this.rain([[3, 5, 0.5]], 50);
  }

  prepareCanvas() {
    const canvas = document.createElement('canvas');
    const { position, top, left, width, height } = this.options;
    canvas.style.position = position;
    canvas.style.top = top;
    canvas.style.left = left;
    canvas.width = width;
    canvas.height = height;
    if (this.img.style.zIndex) {
      canvas.style.zIndex = this.img.style.zIndex;
      this.img.style.zIndex += 1;
    } else {
      canvas.style.zIndex = '99';
    }
    // this.options.parentElement.appendChild(canvas);
    if (this.imgSource) {
      this.options.parentElement.parentNode.insertBefore(canvas, this.imgSource);

      // Set z-index to show canvas on top of img/element
      this.imgSource.style.zIndex = 100;
      this.imgSource.style.position = position;
      this.imgSource.style.top = top;
      this.imgSource.style.left = left;
      this.imgSource.style.width = width;
      this.imgSource.style.height = height;
      this.imgSource.style.background = 'none';
      this.imgSource.style.width = width + 'px';
    } else {
      this.options.parentElement.appendChild(canvas);
    }

    // this.options.parentElement.parentNode.style.position = 'relative'
    this.options.parentElement.parentNode.style.height =
      this.options.height + 'px';

    if (this.options.enableSizeChange) {
      this.setResizeHandler();
    }
    return canvas;
  }

  setResizeHandler() {
    window.onresize = this.checkSize.bind(this);
    // tslint:disable-next-line: deprecation
    window.onorientationchange = this.checkSize.bind(this);
  }

  checkSize() {
    let { width, height, offsetLeft, offsetTop } = this.canvas;

    const source = this.options.parentElement.getBoundingClientRect();
    const sourceWidth = source.width;
    const sourceHeight = source.bottom - source.top;

    const clientWidth = sourceWidth;
    const clientHeight = sourceHeight;
    const clientOffsetLeft = source.left;
    const clientOffsetTop = source.top;

    const canvasWidth = width;
    const canvasHeight = height;
    const canvasOffsetLeft = offsetLeft;
    const canvasOffsetTop = offsetTop;

    if (this.options.parentElement.style.zIndex) {
      this.canvas.style.zIndex = this.options.parentElement.style.zIndex;
    }

    if (canvasWidth !== clientWidth || canvasHeight !== clientHeight) {
      width = clientWidth;
      height = clientHeight;
      this.glass.width = width;
      this.glass.height = height;
      this.prepareBackground();
      this.prepareReflections();
    }

    if (
      canvasOffsetLeft !== clientOffsetLeft ||
      canvasOffsetTop !== clientOffsetTop
    ) {
      this.canvas.style.left = clientOffsetLeft;
      this.canvas.style.top = clientOffsetTop;
    }
  }

  animateDrops() {
    if (this.addDropCallback) {
      this.addDropCallback();
    }
    // |this.drops| array may be changed as we iterate over drops
    const dropsClone = this.drops.slice();
    const newDrops = [];
    for (let i = 0; i < dropsClone.length; ++i) {
      if (dropsClone[i].animate()) {
        newDrops.push(dropsClone[i]);
      }
    }
    this.drops = newDrops;
    this.requestID = this.requestAnimFrame(this.animateDrops.bind(this));
  }

  pause() {
    window.cancelAnimationFrame(this.requestID);
  }

  resume() {
    this.requestID = this.requestAnimFrame(this.animateDrops.bind(this));
  }

  setRequestAnimFrame() {
    const fps = this.options.fps;
    this.requestAnimFrame = (() => {
      return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        (<any>window).mozRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / fps);
        }
      );
    })();
  }

  prepareReflections() {
    this.reflected = document.createElement('canvas');
    this.reflected.width = Math.floor(
      this.canvas.width / this.options.reflectionScaledownFactor
    );
    this.reflected.height = Math.floor(
      this.canvas.height / this.options.reflectionScaledownFactor
    );
    const ctx = this.reflected.getContext('2d');
    ctx.drawImage(
      this.imgDownscaled,
      0,
      0,
      this.imgDownscaled.width,
      this.imgDownscaled.height,
      0,
      0,
      this.reflected.width,
      this.reflected.height
    );
  }

  prepareGlass() {
    this.glass = document.createElement('canvas');
    this.glass.width = this.canvas.width;
    this.glass.height = this.canvas.height;
    this.context = this.glass.getContext('2d');
  }

  rain(presets, speed) {
    // prepare canvas for drop reflections
    if (this.reflection !== this.REFLECTION_NONE) {
      this.prepareReflections();
    }

    this.animateDrops();

    // animation
    this.presets = presets;

    this.PRIVATE_GRAVITY_FORCE_FACTOR_Y = this.options.fps * 0.001 / 25;
    this.PRIVATE_GRAVITY_FORCE_FACTOR_X =
      (Math.PI / 2 - this.options.gravityAngle) * (this.options.fps * 0.001) / 50;

    // prepare gravity matrix
    if (this.options.enableCollisions) {
      // calculate max radius of a drop to establish gravity matrix resolution
      let maxDropRadius = 0;
      for (let i = 0; i < presets.length; i++) {
        if (presets[i][0] + presets[i][1] > maxDropRadius) {
          maxDropRadius = Math.floor(presets[i][0] + presets[i][1]);
        }
      }

      if (maxDropRadius > 0) {
        // initialize the gravity matrix
        const mwi = Math.ceil(this.canvas.width / maxDropRadius);
        const mhi = Math.ceil(this.canvas.height / maxDropRadius);
        this.matrix = new CollisionMatrix(mwi, mhi, maxDropRadius);
      } else {
        this.options.enableCollisions = false;
      }
    }

    for (let i = 0; i < presets.length; i++) {
      if (!presets[i][3]) {
        presets[i][3] = -1;
      }
    }

    let lastExecutionTime = 0;
    this.addDropCallback = function () {
      const timestamp = new Date().getTime();
      if (timestamp - lastExecutionTime < speed) {
        return;
      }
      lastExecutionTime = timestamp;
      const context = this.canvas.getContext('2d');
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      context.drawImage(
        this.background,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      // select matching preset
      let preset;
      for (let i = 0; i < presets.length; i++) {
        if (presets[i][2] > 1 || presets[i][3] === -1) {
          if (presets[i][3] !== 0) {
            presets[i][3]--;
            for (let y = 0; y < presets[i][2]; ++y) {
              this.putDrop(
                new Drop(
                  this,
                  Math.random() * this.canvas.width,
                  Math.random() * this.canvas.height,
                  presets[i][0],
                  presets[i][1]
                )
              );
            }
          }
        } else if (Math.random() < presets[i][2]) {
          preset = presets[i];
          break;
        }
      }
      if (preset) {
        this.putDrop(
          new Drop(
            this,
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            preset[0],
            preset[1]
          )
        );
      }
      context.save();
      context.globalAlpha = this.options.opacity;
      context.drawImage(this.glass, 0, 0, this.canvas.width, this.canvas.height);
      context.restore();
    }.bind(this);
  }

  /**
   * Adds a new raindrop to the animation.
   * @param drop drop object to be added to the animation
  */
  putDrop(drop) {
    drop.draw();
    if (this.gravity && drop.r > this.options.gravityThreshold) {
      if (this.options.enableCollisions) {
        this.matrix.update(drop);
      }
      this.drops.push(drop);
    }
  }

  /**
   * Clear the drop and remove from the list if applicable.
   * @drop to be cleared
   * @force force removal from the list
   * result if true animation of this drop should be stopped
    */
  clearDrop(drop, force?) {
    const result = drop.clear(force);
    if (result) {
      const index = this.drops.indexOf(drop);
      if (index >= 0) {
        this.drops.splice(index, 1);
      }
    }
    return result;
  }

  TRAIL_NONE() {
    // nothing going on here
  }

  TRAIL_DROPS(drop) {
    if (!drop.trailY || drop.y - drop.trailY >= Math.random() * 100 * drop.r) {
      drop.trailY = drop.y;
      this.putDrop(
        new Drop(
          this,
          Math.floor(drop.x + (Math.random() * 2 - 1) * Math.random()),
          drop.y - drop.r - 5,
          Math.ceil(drop.r / 5),
          0
        )
      );
    }
  }

  TRAIL_SMUDGE(drop) {
    const y = drop.y - drop.r - 3;
    const x = drop.x - Math.floor(drop.r / 2) + Math.random() * 2;
    if (y < 0 || x < 0) {
      return;
    }
    this.context.drawImage(this.clearbackground, x, y, drop.r, 2, x, y, drop.r, 2);
  }

  GRAVITY_NONE() {
    return true;
  }

  GRAVITY_LINEAR(drop) {
    if (this.clearDrop(drop)) {
      return true;
    }

    if (drop.yspeed) {
      drop.yspeed += this.PRIVATE_GRAVITY_FORCE_FACTOR_Y * Math.floor(drop.r);
      drop.xspeed += Math.floor(
        this.PRIVATE_GRAVITY_FORCE_FACTOR_X * Math.floor(drop.r)
      );
    } else {
      drop.yspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_Y;
      drop.xspeed = Math.floor(this.PRIVATE_GRAVITY_FORCE_FACTOR_X);
    }

    drop.y += Math.floor(drop.yspeed);
    drop.draw();
    return false;
  }

  GRAVITY_NON_LINEAR(drop) {
    if (this.clearDrop(drop)) {
      return true;
    }

    if (drop.collided) {
      drop.collided = false;
      drop.seed = Math.floor(drop.r * Math.random() * this.options.fps);
      drop.skipping = false;
      drop.slowing = false;
    } else if (!drop.seed || drop.seed < 0) {
      drop.seed = Math.floor(drop.r * Math.random() * this.options.fps);
      drop.skipping = drop.skipping === false;
      drop.slowing = true;
    }

    drop.seed--;

    if (drop.yspeed) {
      if (drop.slowing) {
        drop.yspeed /= 1.1;
        drop.xspeed /= 1.1;
        if (drop.yspeed < this.PRIVATE_GRAVITY_FORCE_FACTOR_Y) {
          drop.slowing = false;
        }
      } else if (drop.skipping) {
        drop.yspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_Y;
        drop.xspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_X;
      } else {
        drop.yspeed +=
          1 * this.PRIVATE_GRAVITY_FORCE_FACTOR_Y * Math.floor(drop.r);
        drop.xspeed +=
          1 * this.PRIVATE_GRAVITY_FORCE_FACTOR_X * Math.floor(drop.r);
      }
    } else {
      drop.yspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_Y;
      drop.xspeed = this.PRIVATE_GRAVITY_FORCE_FACTOR_X;
    }

    if (this.options.gravityAngleconstiance !== 0) {
      drop.xspeed +=
        (Math.random() * 2 - 1) * drop.yspeed * this.options.gravityAngleconstiance;
    }

    drop.y += Math.floor(drop.yspeed);
    drop.x += Math.floor(drop.xspeed);

    drop.draw();
    return false;
  }

  positiveMin(val1, val2) {
    let result = 0;
    if (val1 < val2) {
      if (val1 <= 0) {
        result = val2;
      } else {
        result = val1;
      }
    } else {
      if (val2 <= 0) {
        result = val1;
      } else {
        result = val2;
      }
    }
    return result <= 0 ? 1 : result;
  }

  REFLECTION_NONE() {
    this.context.fillStyle = this.options.fillStyle;
    this.context.fill();
  }

  REFLECTION_MINIATURE(drop) {
    const sx = Math.max(
      (drop.x - this.options.reflectionDropMappingWidth) /
      this.options.reflectionScaledownFactor,
      0
    );
    const sy = Math.max(
      (drop.y - this.options.reflectionDropMappingHeight) /
      this.options.reflectionScaledownFactor,
      0
    );

    const sw = this.positiveMin(
      this.options.reflectionDropMappingWidth *
      2 /
      this.options.reflectionScaledownFactor,
      this.reflected.width - sx
    );
    const sh = this.positiveMin(
      this.options.reflectionDropMappingHeight *
      2 /
      this.options.reflectionScaledownFactor,
      this.reflected.height - sy
    );
    const dx = Math.max(drop.x - 1.1 * drop.r, 0);
    const dy = Math.max(drop.y - 1.1 * drop.r, 0);
    this.context.drawImage(
      this.reflected,
      Math.floor(sx),
      Math.floor(sy),
      Math.floor(sw),
      Math.floor(sh),
      Math.floor(dx),
      Math.floor(dy),
      drop.r * 2,
      drop.r * 2
    );
  }

  COLLISION_SIMPLE(drop, collisions) {
    let item = collisions;
    let drop2;
    while (item != null) {
      const p = item.drop;
      const radiusSum = drop.r + p.r;
      const dx = drop.x - p.x;
      const dy = drop.y - p.y;
      if (Math.abs(dx) < radiusSum) {
        if (Math.abs(dy) < radiusSum) {
          if (
            Math.sqrt(Math.pow(drop.x - p.x, 2) + Math.pow(drop.y - p.y, 2)) <
            drop.r + p.r
          ) {
            drop2 = p;
            break;
          }
        }
      }
      item = item.next;
    }

    if (!drop2) {
      return;
    }

    // rename so that we're dealing with low/high drops
    let higher, lower;
    if (drop.y > drop2.y) {
      higher = drop;
      lower = drop2;
    } else {
      higher = drop2;
      lower = drop;
    }

    this.clearDrop(lower);
    // force stopping the second drop
    this.clearDrop(higher, true);
    this.matrix.remove(higher);
    lower.draw();

    lower.colliding = higher;
    lower.collided = true;
  }

  prepareBackground() {
    this.background = document.createElement('canvas');
    this.background.width = this.canvas.width;
    this.background.height = this.canvas.height;

    this.clearbackground = document.createElement('canvas');
    this.clearbackground.width = this.canvas.width;
    this.clearbackground.height = this.canvas.height;

    let context = this.background.getContext('2d');
    // context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    context.drawImage(
      this.img,
      this.options.crop[0],
      this.options.crop[1],
      this.options.crop[2],
      this.options.crop[3],
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    context = this.clearbackground.getContext('2d');
    // context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(
      this.img,
      this.options.crop[0],
      this.options.crop[1],
      this.options.crop[2],
      this.options.crop[3],
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (!isNaN(this.options.blur) && this.options.blur >= 1) {
      this.stackBlurCanvasRGB(
        this.canvas.width,
        this.canvas.height,
        this.options.blur
      );
    }
  }

  stackBlurCanvasRGB(width, height, radius) {
    const shgTable = [
      [0, 9],
      [1, 11],
      [2, 12],
      [3, 13],
      [5, 14],
      [7, 15],
      [11, 16],
      [15, 17],
      [22, 18],
      [31, 19],
      [45, 20],
      [63, 21],
      [90, 22],
      [127, 23],
      [181, 24]
    ];

    const mulTable = [
      512,
      512,
      456,
      512,
      328,
      456,
      335,
      512,
      405,
      328,
      271,
      456,
      388,
      335,
      292,
      512,
      454,
      405,
      364,
      328,
      298,
      271,
      496,
      456,
      420,
      388,
      360,
      335,
      312,
      292,
      273,
      512,
      482,
      454,
      428,
      405,
      383,
      364,
      345,
      328,
      312,
      298,
      284,
      271,
      259,
      496,
      475,
      456,
      437,
      420,
      404,
      388,
      374,
      360,
      347,
      335,
      323,
      312,
      302,
      292,
      282,
      273,
      265,
      512,
      497,
      482,
      468,
      454,
      441,
      428,
      417,
      405,
      394,
      383,
      373,
      364,
      354,
      345,
      337,
      328,
      320,
      312,
      305,
      298,
      291,
      284,
      278,
      271,
      265,
      259,
      507,
      496,
      485,
      475,
      465,
      456,
      446,
      437,
      428,
      420,
      412,
      404,
      396,
      388,
      381,
      374,
      367,
      360,
      354,
      347,
      341,
      335,
      329,
      323,
      318,
      312,
      307,
      302,
      297,
      292,
      287,
      282,
      278,
      273,
      269,
      265,
      261,
      512,
      505,
      497,
      489,
      482,
      475,
      468,
      461,
      454,
      447,
      441,
      435,
      428,
      422,
      417,
      411,
      405,
      399,
      394,
      389,
      383,
      378,
      373,
      368,
      364,
      359,
      354,
      350,
      345,
      341,
      337,
      332,
      328,
      324,
      320,
      316,
      312,
      309,
      305,
      301,
      298,
      294,
      291,
      287,
      284,
      281,
      278,
      274,
      271,
      268,
      265,
      262,
      259,
      257,
      507,
      501,
      496,
      491,
      485,
      480,
      475,
      470,
      465,
      460,
      456,
      451,
      446,
      442,
      437,
      433,
      428,
      424,
      420,
      416,
      412,
      408,
      404,
      400,
      396,
      392,
      388,
      385,
      381,
      377,
      374,
      370,
      367,
      363,
      360,
      357,
      354,
      350,
      347,
      344,
      341,
      338,
      335,
      332,
      329,
      326,
      323,
      320,
      318,
      315,
      312,
      310,
      307,
      304,
      302,
      299,
      297,
      294,
      292,
      289,
      287,
      285,
      282,
      280,
      278,
      275,
      273,
      271,
      269,
      267,
      265,
      263,
      261,
      259
    ];

    radius |= 0;

    const context = this.background.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let x,
      y,
      i,
      p,
      yp,
      yi,
      yw,
      rSum,
      gSum,
      bSum,
      rOutSum,
      gOutSum,
      bOutSum,
      rInSum,
      gInSum,
      bInSum,
      pr,
      pg,
      pb,
      rbs;
    const radiusPlus1 = radius + 1;
    const sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

    const stackStart = new BlurStack();
    let stackEnd = new BlurStack();
    let stack = stackStart;
    for (i = 1; i < 2 * radius + 1; i++) {
      stack = stack.next = new BlurStack();
      if (i === radiusPlus1) {
        stackEnd = stack;
      }
    }
    stack.next = stackStart;
    let stackIn = null;
    let stackOut = null;

    yw = yi = 0;

    const mulSum = mulTable[radius];
    let shgSum;
    for (let ssi = 0; ssi < shgTable.length; ++ssi) {
      if (radius <= shgTable[ssi][0]) {
        shgSum = shgTable[ssi - 1][1];
        break;
      }
    }

    for (y = 0; y < height; y++) {
      rInSum = gInSum = bInSum = rSum = gSum = bSum = 0;

      rOutSum = radiusPlus1 * (pr = pixels[yi]);
      gOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
      bOutSum = radiusPlus1 * (pb = pixels[yi + 2]);

      rSum += sumFactor * pr;
      gSum += sumFactor * pg;
      bSum += sumFactor * pb;

      stack = stackStart;

      for (i = 0; i < radiusPlus1; i++) {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }

      for (i = 1; i < radiusPlus1; i++) {
        // tslint:disable-next-line: no-bitwise
        p = yi + ((width - 1 < i ? width - 1 : i) << 2);
        rSum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
        gSum += (stack.g = pg = pixels[p + 1]) * rbs;
        bSum += (stack.b = pb = pixels[p + 2]) * rbs;

        rInSum += pr;
        gInSum += pg;
        bInSum += pb;

        stack = stack.next;
      }

      stackIn = stackStart;
      stackOut = stackEnd;
      for (x = 0; x < width; x++) {
        // tslint:disable-next-line: no-bitwise
        pixels[yi] = (rSum * mulSum) >> shgSum;
        // tslint:disable-next-line: no-bitwise
        pixels[yi + 1] = (gSum * mulSum) >> shgSum;
        // tslint:disable-next-line: no-bitwise
        pixels[yi + 2] = (bSum * mulSum) >> shgSum;

        rSum -= rOutSum;
        gSum -= gOutSum;
        bSum -= bOutSum;

        rOutSum -= stackIn.r;
        gOutSum -= stackIn.g;
        bOutSum -= stackIn.b;

        // tslint:disable-next-line: no-bitwise
        p = (yw + ((p = x + radius + 1) < width - 1 ? p : width - 1)) << 2;

        rInSum += stackIn.r = pixels[p];
        gInSum += stackIn.g = pixels[p + 1];
        bInSum += stackIn.b = pixels[p + 2];

        rSum += rInSum;
        gSum += gInSum;
        bSum += bInSum;

        stackIn = stackIn.next;

        rOutSum += pr = stackOut.r;
        gOutSum += pg = stackOut.g;
        bOutSum += pb = stackOut.b;

        rInSum -= pr;
        gInSum -= pg;
        bInSum -= pb;

        stackOut = stackOut.next;

        yi += 4;
      }
      yw += width;
    }

    for (x = 0; x < width; x++) {
      gInSum = bInSum = rInSum = gSum = bSum = rSum = 0;

      // tslint:disable-next-line: no-bitwise
      yi = x << 2;
      rOutSum = radiusPlus1 * (pr = pixels[yi]);
      gOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
      bOutSum = radiusPlus1 * (pb = pixels[yi + 2]);

      rSum += sumFactor * pr;
      gSum += sumFactor * pg;
      bSum += sumFactor * pb;

      stack = stackStart;

      for (i = 0; i < radiusPlus1; i++) {
        stack.r = pr;
        stack.g = pg;
        stack.b = pb;
        stack = stack.next;
      }

      yp = width;

      for (i = 1; i < radiusPlus1; i++) {
        // tslint:disable-next-line: no-bitwise
        yi = (yp + x) << 2;

        rSum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
        gSum += (stack.g = pg = pixels[yi + 1]) * rbs;
        bSum += (stack.b = pb = pixels[yi + 2]) * rbs;

        rInSum += pr;
        gInSum += pg;
        bInSum += pb;

        stack = stack.next;

        if (i < height - 1) {
          yp += width;
        }
      }

      yi = x;
      stackIn = stackStart;
      stackOut = stackEnd;
      for (y = 0; y < height; y++) {
        // tslint:disable-next-line: no-bitwise
        p = yi << 2;
        // tslint:disable-next-line: no-bitwise
        pixels[p] = (rSum * mulSum) >> shgSum;
        // tslint:disable-next-line: no-bitwise
        pixels[p + 1] = (gSum * mulSum) >> shgSum;
        // tslint:disable-next-line: no-bitwise
        pixels[p + 2] = (bSum * mulSum) >> shgSum;

        rSum -= rOutSum;
        gSum -= gOutSum;
        bSum -= bOutSum;

        rOutSum -= stackIn.r;
        gOutSum -= stackIn.g;
        bOutSum -= stackIn.b;

        // tslint:disable-next-line: no-bitwise
        p = (x + ((p = y + radiusPlus1) < height - 1 ? p : height - 1) * width) << 2;

        rSum += rInSum += stackIn.r = pixels[p];
        gSum += gInSum += stackIn.g = pixels[p + 1];
        bSum += bInSum += stackIn.b = pixels[p + 2];

        stackIn = stackIn.next;

        rOutSum += pr = stackOut.r;
        gOutSum += pg = stackOut.g;
        bOutSum += pb = stackOut.b;

        rInSum -= pr;
        gInSum -= pg;
        bInSum -= pb;

        stackOut = stackOut.next;

        yi += width;
      }
    }

    context.putImageData(imageData, 0, 0);
  }

  downscaleImage (img, width) {
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d');
    cv.width = width || 50;
    cv.height = cv.width * img.height / img.width;
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, cv.width, cv.height);
    return cv;
  }

  playSound (url) {
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.25;
    audio.play();
  }

  getOffset = function (element) {
    // Preserve chaining for setter
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }

    let doc,
      docElem,
      rect,
      win;
    const elem = element;

    if (!elem) {
      return;
    }

    // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
    // Support: IE <=11 only
    // Running getBoundingClientRect on a
    // disconnected node in IE throws an error
    if (!elem.getClientRects().length) {
      return {
        top: 0,
        left: 0
      };
    }

    rect = elem.getBoundingClientRect();

    doc = elem.ownerDocument;
    docElem = doc.documentElement;
    win = doc.defaultView;

    return {
      top: rect.top + win.pageYOffset - docElem.clientTop,
      left: rect.left + win.pageXOffset - docElem.clientLeft
    };
  };
};
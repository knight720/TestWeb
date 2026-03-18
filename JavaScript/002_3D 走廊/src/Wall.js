class Wall {
  static COLORS = ['lime', '#00aaff', '#ff6600', '#ff0055', '#aa00ff', '#ffcc00'];

  constructor(canvasWidth, canvasHeight, frame) {
    this.canvasWidth  = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.frame        = frame;
    this._randomize();
  }

  _randomize() {
    this.color = Wall.COLORS[Math.floor(Math.random() * Wall.COLORS.length)];

    // Random size < 50% of canvas
    this.w = this.canvasWidth  * Math.random() * 0.5;
    this.h = this.canvasHeight * Math.random() * 0.5;

    // Random position so wall stays within canvas bounds
    this.x = Math.random() * (this.canvasWidth  - this.w);
    this.y = Math.random() * (this.canvasHeight - this.h);

    // Random Z in the far half of the corridor (50%~100% of depth)
    this.z = this.frame.depth * (0.5 + Math.random() * 0.5);
  }

  regenerate() {
    this._randomize();
  }

  draw(ctx) {
    if (this.z < this.frame.z) return;

    // Project all 4 corners via perspective
    const tl = this.frame.d3ToD2(this.x,          this.y,          this.z);
    const tr = this.frame.d3ToD2(this.x + this.w,  this.y,          this.z);
    const br = this.frame.d3ToD2(this.x + this.w,  this.y + this.h, this.z);
    const bl = this.frame.d3ToD2(this.x,           this.y + this.h, this.z);

    ctx.save();

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(tl.x, tl.y);
    ctx.lineTo(tr.x, tr.y);
    ctx.lineTo(br.x, br.y);
    ctx.lineTo(bl.x, bl.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.stroke();

    ctx.restore();
  }
}

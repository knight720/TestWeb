// 矩形：靜態面板，固定於走廊深處
class Rect extends Shape {
  static COLORS = ['lime', '#00aaff', '#ff6600', '#ff0055', '#aa00ff', '#ffcc00'];

  constructor(canvasWidth, canvasHeight, frame) {
    super(frame);
    this.canvasWidth  = canvasWidth;
    this.canvasHeight = canvasHeight;
    this._randomize();
  }

  _randomize() {
    this.color = Rect.COLORS[Math.floor(Math.random() * Rect.COLORS.length)];
    this.w = this.canvasWidth  * Math.random() * 0.5;
    this.h = this.canvasHeight * Math.random() * 0.5;
    this.x = Math.random() * (this.canvasWidth  - this.w);
    this.y = Math.random() * (this.canvasHeight - this.h);
    this.z = this.frame.depth * (0.5 + Math.random() * 0.5);
  }

  // 靜態，不移動
  move(dt) {}

  draw(ctx) {
    if (!this.isVisible()) return;
    const tl = this.project(this.x,          this.y         );
    const tr = this.project(this.x + this.w,  this.y         );
    const br = this.project(this.x + this.w,  this.y + this.h);
    const bl = this.project(this.x,           this.y + this.h);

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
    ctx.lineWidth   = 1;
    ctx.lineJoin    = 'round';
    ctx.stroke();
    ctx.restore();
  }
}

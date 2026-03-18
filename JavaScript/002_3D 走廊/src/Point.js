// 點：飛向鏡頭的彩色圓點
class Point extends Shape {
  static COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Purple'];

  constructor(canvasWidth, canvasHeight, frame) {
    super(frame);
    this.canvasWidth  = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.size = 20;
    this._reset();
  }

  _reset() {
    this.color = Point.COLORS[Math.floor(Math.random() * Point.COLORS.length)];
    this.x  = Math.random() * this.canvasWidth;
    this.y  = Math.random() * this.canvasHeight;
    this.z  = this.frame.depth;
    this.dz = 0.25 * Math.random() * 30; // units/sec
  }

  move(dt) {
    this.z -= this.dz * dt;
    if (!this.isVisible()) this._reset();
  }

  draw(ctx) {
    if (!this.isVisible()) return;
    const pos = this.project(this.x, this.y);
    const s   = this.scale();

    ctx.save();
    ctx.fillStyle   = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.size * s, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

// 線：飛向鏡頭的線段
class Line extends Shape {
  static COLORS = ['#00ffff', '#ff00ff', '#ffff00', '#ffffff', '#00ff88', '#ff8800'];

  constructor(canvasWidth, canvasHeight, frame) {
    super(frame);
    this.canvasWidth  = canvasWidth;
    this.canvasHeight = canvasHeight;
    this._reset();
  }

  _reset() {
    this.color = Line.COLORS[Math.floor(Math.random() * Line.COLORS.length)];
    this.x1 = Math.random() * this.canvasWidth;
    this.y1 = Math.random() * this.canvasHeight;
    this.x2 = Math.random() * this.canvasWidth;
    this.y2 = Math.random() * this.canvasHeight;
    this.z  = this.frame.depth;
    this.dz = 0.2 * Math.random() * 30; // units/sec
  }

  move(dt) {
    this.z -= this.dz * dt;
    if (!this.isVisible()) this._reset();
  }

  draw(ctx) {
    if (!this.isVisible()) return;
    const p1 = this.project(this.x1, this.y1);
    const p2 = this.project(this.x2, this.y2);
    const s  = this.scale();

    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth   = Math.max(1, 3 * s);
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }
}

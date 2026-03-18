// 三角形：靜態面板，固定於走廊深處
class Triangle extends Shape {
  static COLORS = ['#ff4444', '#44ff44', '#4444ff', '#ffaa00', '#aa44ff', '#00ffaa'];

  constructor(canvasWidth, canvasHeight, frame) {
    super(frame);
    this.canvasWidth  = canvasWidth;
    this.canvasHeight = canvasHeight;
    this._randomize();
  }

  _randomize() {
    this.color = Triangle.COLORS[Math.floor(Math.random() * Triangle.COLORS.length)];

    // Pick a random center, then 3 vertices within 25% radius of canvas min-dimension
    const cx = this.canvasWidth  * (0.2 + Math.random() * 0.6);
    const cy = this.canvasHeight * (0.2 + Math.random() * 0.6);
    const r  = Math.min(this.canvasWidth, this.canvasHeight) * (0.1 + Math.random() * 0.2);

    this.x1 = cx + Math.cos(0)              * r;
    this.y1 = cy + Math.sin(0)              * r;
    this.x2 = cx + Math.cos(2 * Math.PI / 3) * r;
    this.y2 = cy + Math.sin(2 * Math.PI / 3) * r;
    this.x3 = cx + Math.cos(4 * Math.PI / 3) * r;
    this.y3 = cy + Math.sin(4 * Math.PI / 3) * r;

    this.z = this.frame.depth * (0.5 + Math.random() * 0.5);
  }

  // 靜態，不移動
  move(dt) {}

  draw(ctx) {
    if (!this.isVisible()) return;
    const p1 = this.project(this.x1, this.y1);
    const p2 = this.project(this.x2, this.y2);
    const p3 = this.project(this.x3, this.y3);

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth   = 1;
    ctx.lineJoin    = 'round';
    ctx.stroke();
    ctx.restore();
  }
}

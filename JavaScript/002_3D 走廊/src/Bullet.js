const BULLET_COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Purple'];

class Bullet {
  constructor(canvasWidth, canvasHeight, frame) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.frame = frame;
    this.size = 20;
    this._reset();
  }

  _reset() {
    this.color = BULLET_COLORS[Math.floor(Math.random() * BULLET_COLORS.length)];
    this.x = Math.random() * this.canvasWidth;
    this.y = Math.random() * this.canvasHeight;
    this.z = this.frame.depth;
    // dz stored as units/sec (normalised to original ~30fps behaviour)
    this.dz = 0.25 * Math.random() * 30;
  }

  move(dt) {
    this.z -= this.dz * dt;
    if (this.z < this.frame.z) this._reset();
  }

  draw(ctx) {
    if (this.z < this.frame.z) return;
    const pos = this.frame.d3ToD2(this.x, this.y, this.z);
    const scale = this.frame.getScale(this.z);

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.size * scale, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}

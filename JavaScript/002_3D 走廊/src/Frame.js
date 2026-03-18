class Frame {
  constructor(w, h, d) {
    this.width = w;
    this.height = h;
    this.depth = d;
    this.centerX = w / 2;
    this.centerY = h / 2;
    this.z = 0;
    this.maxScale = 0.4;
    this.wallCenterX = this.centerX;
    this.wallCenterY = this.centerY;
    this.wallScale = this.maxScale;
    // wallX/wallY are set each draw() call and shared with d3ToD2()
    this.wallX = 0;
    this.wallY = 0;
    this._updateWallScale();
  }

  // Returns apparent scale of an object at depth z (1=full size at viewer, maxScale=far wall)
  getScale(z) {
    const denom = this.depth - this.z;
    if (denom <= 0) return 1;
    return this.maxScale + (1 - this.maxScale) * (this.depth - z) / denom;
  }

  // Inner rectangle grows as camera moves forward
  _updateWallScale() {
    this.wallScale = this.maxScale + (1 - this.maxScale) * this.z / this.depth;
  }

  move(value) {
    this.z = Math.max(0, Math.min(this.depth * 0.8, this.z + value));
    this._updateWallScale();
  }

  updateMouse(mouseX, mouseY) {
    const dx = this.centerX - mouseX;
    const dy = this.centerY - mouseY;
    this.wallCenterX = dx + this.centerX;
    this.wallCenterY = dy + this.centerY;
  }

  // Projects 3D point (x, y, z) to 2D canvas coordinates
  d3ToD2(x, y, z) {
    const wallx = this.wallX + x * this.wallScale;
    const wally = this.wallY + y * this.wallScale;
    const scale = (z - this.z) / (this.depth - this.z);
    return {
      x: x + (wallx - x) * scale,
      y: y + (wally - y) * scale,
    };
  }

  draw(ctx) {
    const w = this.width * this.wallScale;
    const h = this.height * this.wallScale;
    const w2 = w / 2;
    const h2 = h / 2;

    // Update wallX/wallY so d3ToD2() uses current mouse-offset position
    this.wallX = this.wallCenterX - w2;
    this.wallY = this.wallCenterY - h2;
    const p2x = this.wallCenterX + w2, p2y = this.wallY;
    const p3x = p2x,                  p3y = this.wallCenterY + h2;
    const p4x = this.wallX,           p4y = p3y;

    ctx.save();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    // Inner rectangle (far wall)
    ctx.moveTo(this.wallX, this.wallY);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.lineTo(p4x, p4y);
    ctx.closePath();
    // Corner connecting lines
    ctx.moveTo(0,           0          ); ctx.lineTo(this.wallX, this.wallY);
    ctx.moveTo(this.width,  0          ); ctx.lineTo(p2x,        p2y);
    ctx.moveTo(this.width,  this.height); ctx.lineTo(p3x,        p3y);
    ctx.moveTo(0,           this.height); ctx.lineTo(p4x,        p4y);

    ctx.stroke();
    ctx.restore();
  }
}

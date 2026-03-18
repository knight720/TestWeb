class Shape {
  constructor(frame) {
    if (new.target === Shape) throw new Error('Shape is abstract');
    this.frame = frame;
    this.z = 0;
  }

  // Project this shape's canvas-space point at its own Z to 2D screen coords
  project(x, y) {
    return this.frame.d3ToD2(x, y, this.z);
  }

  // Apparent scale at this shape's Z position
  scale() {
    return this.frame.getScale(this.z);
  }

  // False when shape has passed the camera
  isVisible() {
    return this.z >= this.frame.z;
  }

  move(dt) {}
  draw(ctx) {}
}

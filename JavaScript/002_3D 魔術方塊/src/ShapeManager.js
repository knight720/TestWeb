class ShapeManager {
  constructor(canvasWidth, canvasHeight, frame, {
    pointCount    = 8,
    lineCount     = 4,
    rectCount     = 2,
    triangleCount = 2,
  } = {}) {
    const make = (Cls, n) =>
      Array.from({ length: n }, () => new Cls(canvasWidth, canvasHeight, frame));

    this.shapes = [
      ...make(Point,    pointCount),
      ...make(Line,     lineCount),
      ...make(Rect,     rectCount),
      ...make(Triangle, triangleCount),
    ];
  }

  move(dt) {
    this.shapes.forEach(s => s.move(dt));
  }

  draw(ctx) {
    // Painter's algorithm: sort far-to-near so nearer shapes occlude distant ones
    this.shapes
      .slice()
      .sort((a, b) => b.z - a.z)
      .forEach(s => s.draw(ctx));
  }
}

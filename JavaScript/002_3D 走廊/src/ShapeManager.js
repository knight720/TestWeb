class ShapeManager {
  constructor(canvasWidth, canvasHeight, frame, bulletCount = 10, wallCount = 1) {
    this.shapes = [
      ...Array.from({ length: bulletCount }, () => new Bullet(canvasWidth, canvasHeight, frame)),
      ...Array.from({ length: wallCount   }, () => new Wall  (canvasWidth, canvasHeight, frame)),
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

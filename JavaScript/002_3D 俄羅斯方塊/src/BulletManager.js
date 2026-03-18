class BulletManager {
  constructor(count, canvasWidth, canvasHeight, frame) {
    this.bullets = Array.from(
      { length: count },
      () => new Bullet(canvasWidth, canvasHeight, frame)
    );
  }

  move(dt) {
    this.bullets.forEach(b => b.move(dt));
  }

  draw(ctx) {
    // Sort far-to-near so closer bullets correctly overlap distant ones
    this.bullets
      .slice()
      .sort((a, b) => b.z - a.z)
      .forEach(b => b.draw(ctx));
  }
}

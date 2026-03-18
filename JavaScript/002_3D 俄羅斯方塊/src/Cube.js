class Cube {
  // Camera focal length in Z-units (camera sits at Z = -FOCAL)
  static FOCAL      = 5;
  // Screen pixels per world unit at the reference plane (Z = 0)
  static UNIT_SCALE = 150;

  // 12 edges: pairs of vertex indices
  static EDGES = [
    [0,1],[1,2],[2,3],[3,0],  // front face
    [4,5],[5,6],[6,7],[7,4],  // back face
    [0,4],[1,5],[2,6],[3,7],  // connecting edges
  ];

  constructor(canvasW, canvasH) {
    this.cx       = canvasW / 2;
    this.cy       = canvasH / 2;
    this.halfSize = 0.5;   // 1-unit cube (half-size in each axis)
    this.cz       = 0;     // cube centre Z, starts at near end
    this.maxZ     = 10;    // depth limit
    this.speed    = 2;     // world units per second
  }

  // Perspective-project a single world-space point to canvas coords.
  // Returns null if the point is behind or at the camera plane.
  _project(vx, vy, vz) {
    const dz = vz + Cube.FOCAL;
    if (dz <= 0) return null;
    const s = Cube.FOCAL / dz;
    return {
      x: this.cx + vx * Cube.UNIT_SCALE * s,
      y: this.cy + vy * Cube.UNIT_SCALE * s,
    };
  }

  move(dt) {
    this.cz += this.speed * dt;
    if (this.cz > this.maxZ) this.cz = 0;
  }

  draw(ctx) {
    const h = this.halfSize;
    const z = this.cz;

    // 8 vertices: indices 0-3 = front face (z-h), 4-7 = back face (z+h)
    const V = [
      [-h, -h, z-h], [ h, -h, z-h], [ h,  h, z-h], [-h,  h, z-h],
      [-h, -h, z+h], [ h, -h, z+h], [ h,  h, z+h], [-h,  h, z+h],
    ];

    const P = V.map(([vx, vy, vz]) => this._project(vx, vy, vz));

    ctx.save();
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur  = 12;

    ctx.beginPath();
    for (const [a, b] of Cube.EDGES) {
      if (!P[a] || !P[b]) continue;
      ctx.moveTo(P[a].x, P[a].y);
      ctx.lineTo(P[b].x, P[b].y);
    }
    ctx.stroke();
    ctx.restore();
  }
}

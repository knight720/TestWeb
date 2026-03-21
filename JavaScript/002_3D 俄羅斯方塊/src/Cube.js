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
    this.wx       = 0;     // cube centre X in world space
    this.wy       = 0;     // cube centre Y in world space
    this.cz       = 0;     // cube centre Z, starts at near end
    this.maxZ     = 10;    // depth limit
    this.speed    = 2;     // world units per second
  }

  /** 以鍵盤方向移動 cube 的世界座標（X/Y 軸），並夾緊至投影空間 */
  moveXY(dx, dy) {
    this.wx += dx;
    this.wy += dy;
    this._clampXY();
  }

  /**
   * 計算當前深度下，cube 中心在 X/Y 軸可移動的最大世界單位距離。
   * 以 cube 最近面（z = cz - halfSize）的視錐半寬為基準，
   * 再扣除 halfSize，確保整個 cube 都在視錐內。
   *   frustumHalf(z) = cx * (z + FOCAL) / (UNIT_SCALE * FOCAL)
   */
  _xyBound() {
    const nearZ      = this.cz - this.halfSize;
    const frustumHalf = this.cx * (nearZ + Cube.FOCAL) / (Cube.UNIT_SCALE * Cube.FOCAL);
    return Math.max(0, frustumHalf - this.halfSize);
  }

  /** 將 wx / wy 夾緊至目前深度的合法範圍 */
  _clampXY() {
    const b  = this._xyBound();
    this.wx  = Math.max(-b, Math.min(b, this.wx));
    this.wy  = Math.max(-b, Math.min(b, this.wy));
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
    this._clampXY(); // cz 改變後（尤其 reset 時）重新夾緊 XY
  }

  draw(ctx) {
    const h = this.halfSize;
    const z = this.cz;

    const x = this.wx;
    const y = this.wy;

    // 8 vertices: indices 0-3 = front face (z-h), 4-7 = back face (z+h)
    const V = [
      [x-h, y-h, z-h], [x+h, y-h, z-h], [x+h, y+h, z-h], [x-h, y+h, z-h],
      [x-h, y-h, z+h], [x+h, y-h, z+h], [x+h, y+h, z+h], [x-h, y+h, z+h],
    ];

    const P = V.map(([vx, vy, vz]) => this._project(vx, vy, vz));

    ctx.save();
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.shadowColor = '#e11d48';
    ctx.shadowBlur  = 10;

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

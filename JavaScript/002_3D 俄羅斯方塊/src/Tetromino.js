class Tetromino {
  /**
   * 七種 Tetris 方塊形狀。
   * offsets: 各子方塊中心相對於整體中心的 (dx, dy) 世界單位偏移。
   * 視覺化（Y 向下為正）：
   *
   *  I  ████           O  ██           T  ███          S  .██
   *                       ██              █                ██.
   *
   *  Z  ██.            L  ███          J  ███
   *     .██               █..             ..█
   */
  static SHAPES = [
    { name: 'I', color: '#2563eb', offsets: [[-1.5,0],[-0.5,0],[0.5,0],[1.5,0]] },
    { name: 'O', color: '#16a34a', offsets: [[-0.5,-0.5],[0.5,-0.5],[-0.5,0.5],[0.5,0.5]] },
    { name: 'T', color: '#7c3aed', offsets: [[-1,0],[0,0],[1,0],[0,1]] },
    { name: 'S', color: '#e11d48', offsets: [[-1,0],[0,0],[0,-1],[1,-1]] },
    { name: 'Z', color: '#ea580c', offsets: [[-1,-1],[0,-1],[0,0],[1,0]] },
    { name: 'L', color: '#0891b2', offsets: [[-1,0],[0,0],[1,0],[1,1]] },
    { name: 'J', color: '#be185d', offsets: [[-1,0],[0,0],[1,0],[-1,1]] },
  ];

  static EDGES = [
    [0,1],[1,2],[2,3],[3,0],  // 前面
    [4,5],[5,6],[6,7],[7,4],  // 後面
    [0,4],[1,5],[2,6],[3,7],  // 連接邊
  ];

  constructor(canvasW, canvasH) {
    this.cx       = canvasW / 2;
    this.cy       = canvasH / 2;
    this.halfSize = 0.5;
    this.maxZ     = 10;
    this.speed    = 3;   // 世界單位/秒
    this.wx       = 0;
    this.wy       = 0;
    this.cz       = this.maxZ;
    this.shape    = Tetromino.SHAPES[0];
    this._spawn();
  }

  // ── 生成 ──────────────────────────────────────────────────────────

  _spawn() {
    const idx  = Math.floor(Math.random() * Tetromino.SHAPES.length);
    this.shape = Tetromino.SHAPES[idx];
    this.cz    = 0;   // 從靠近鏡頭端出發
    this.wx    = 0;
    this.wy    = 0;
  }

  // ── 邊界計算 ──────────────────────────────────────────────────────

  /**
   * 此形狀各子方塊距整體中心的最大偏移（含半方塊寬），
   * 分 X / Y 軸計算，以支援 I 型等不對稱形狀。
   */
  _shapeExtent() {
    let mx = 0, my = 0;
    for (const [dx, dy] of this.shape.offsets) {
      mx = Math.max(mx, Math.abs(dx));
      my = Math.max(my, Math.abs(dy));
    }
    return { x: mx + this.halfSize, y: my + this.halfSize };
  }

  /**
   * 整體中心 (wx, wy) 在目前深度下的合法移動範圍。
   * 以最近面 (cz - halfSize) 的視錐半寬扣除形狀外輪廓，
   * 確保所有子方塊邊緣皆落在投影空間內。
   *   frustumHalf(z) = cx * (z + FOCAL) / (UNIT_SCALE * FOCAL)
   */
  _xyBound() {
    const nearZ = this.cz - this.halfSize;
    const fh    = this.cx * (nearZ + Cube.FOCAL) / (Cube.UNIT_SCALE * Cube.FOCAL);
    const ext   = this._shapeExtent();
    return {
      x: Math.max(0, fh - ext.x),
      y: Math.max(0, fh - ext.y),
    };
  }

  _clampXY() {
    const { x: bx, y: by } = this._xyBound();
    this.wx = Math.max(-bx, Math.min(bx, this.wx));
    this.wy = Math.max(-by, Math.min(by, this.wy));
  }

  // ── 更新 ──────────────────────────────────────────────────────────

  /** 鍵盤方向控制，每次一個世界單位 */
  moveXY(dx, dy) {
    this.wx += dx;
    this.wy += dy;
    this._clampXY();
  }

  /** 每幀遠離鏡頭；抵達遠端後隨機生成下一塊 */
  move(dt) {
    this.cz += this.speed * dt;
    if (this.cz > this.maxZ) {
      this._spawn();
    } else {
      this._clampXY();
    }
  }

  // ── 渲染 ──────────────────────────────────────────────────────────

  _project(vx, vy, vz) {
    const dz = vz + Cube.FOCAL;
    if (dz <= 0) return null;
    const s = Cube.FOCAL / dz;
    return {
      x: this.cx + vx * Cube.UNIT_SCALE * s,
      y: this.cy + vy * Cube.UNIT_SCALE * s,
    };
  }

  draw(ctx) {
    const h = this.halfSize;
    ctx.save();
    ctx.strokeStyle = this.shape.color;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.shadowColor = this.shape.color;
    ctx.shadowBlur  = 10;
    ctx.beginPath();

    for (const [dx, dy] of this.shape.offsets) {
      const bx = this.wx + dx;
      const by = this.wy + dy;
      const bz = this.cz;

      // 8 頂點（前面 0-3，後面 4-7）
      const V = [
        [bx-h, by-h, bz-h], [bx+h, by-h, bz-h], [bx+h, by+h, bz-h], [bx-h, by+h, bz-h],
        [bx-h, by-h, bz+h], [bx+h, by-h, bz+h], [bx+h, by+h, bz+h], [bx-h, by+h, bz+h],
      ];
      const P = V.map(([vx, vy, vz]) => this._project(vx, vy, vz));

      for (const [a, b] of Tetromino.EDGES) {
        if (!P[a] || !P[b]) continue;
        ctx.moveTo(P[a].x, P[a].y);
        ctx.lineTo(P[b].x, P[b].y);
      }
    }

    ctx.stroke();
    ctx.restore();
  }
}

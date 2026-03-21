/**
 * Tetromino — 方塊遊戲邏輯
 *
 * 職責：
 *   - 形狀資料定義（SHAPES）
 *   - 遊戲狀態：wx, wy, cz, shape
 *   - 移動 / 重生
 *   - 視錐邊界夾緊（依賴 Camera）
 *
 * 不含任何渲染邏輯，由 TetrominoRenderer 負責繪製。
 */
class Tetromino {
  /**
   * 七種形狀。offsets: 子方塊中心相對整體中心的 (dx, dy) 世界單位偏移。
   *
   *  I  ████   O  ██   T  ███   S  .██   Z  ██.   L  ███   J  ███
   *               ██      █        ██.      .██      █..      ..█
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

  /**
   * @param {Camera} camera
   * @param {number} maxZ  走廊最大深度
   * @param {number} speed 世界單位 / 秒
   */
  constructor(camera, maxZ = 10, speed = 1.5) {
    this.camera   = camera;
    this.halfSize = 0.5;
    this.maxZ     = maxZ;
    this.speed    = speed;

    this.wx    = 0;
    this.wy    = 0;
    this.cz    = 0;
    this.shape = Tetromino.SHAPES[0];
    this.spawn();
  }

  // ── 生成 ────────────────────────────────────────────────────────

  spawn() {
    const idx  = Math.floor(Math.random() * Tetromino.SHAPES.length);
    this.shape = Tetromino.SHAPES[idx];
    this.cz    = 0;
    this.wx    = 0;
    this.wy    = 0;
  }

  // ── 邊界計算 ────────────────────────────────────────────────────

  /** 形狀在 X/Y 軸的最大外輪廓偏移（含半方塊寬） */
  _shapeExtent() {
    let mx = 0, my = 0;
    for (const [dx, dy] of this.shape.offsets) {
      mx = Math.max(mx, Math.abs(dx));
      my = Math.max(my, Math.abs(dy));
    }
    return { x: mx + this.halfSize, y: my + this.halfSize };
  }

  /**
   * 以 Z=0 的 8×8 格場邊界為固定移動範圍，不隨深度改變。
   * frustumHalfAt(0) = GRID_SIZE / 2 = 4（世界單位）。
   */
  xyBound() {
    const fh  = this.camera.frustumHalfAt(0);
    const ext = this._shapeExtent();
    return {
      x: Math.max(0, fh - ext.x),
      y: Math.max(0, fh - ext.y),
    };
  }

  clampXY() {
    const { x: bx, y: by } = this.xyBound();
    this.wx = Math.max(-bx, Math.min(bx, this.wx));
    this.wy = Math.max(-by, Math.min(by, this.wy));
  }

  // ── 更新 ────────────────────────────────────────────────────────

  /** 鍵盤方向控制：每次一個世界單位，並夾緊至視錐邊界 */
  moveXY(dx, dy) {
    this.wx += dx;
    this.wy += dy;
    this.clampXY();
  }

  /** 每幀遠離鏡頭；抵達遠端後重生下一塊 */
  move(dt) {
    this.cz += this.speed * dt;
    if (this.cz > this.maxZ) {
      this.spawn();
    } else {
      this.clampXY();
    }
  }
}

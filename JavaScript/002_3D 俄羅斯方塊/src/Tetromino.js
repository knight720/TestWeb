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
   *
   * spawnX / spawnY：出生時的世界座標，確保每個子方塊中心落在半整數格心。
   *   I  dx = ±0.5/±1.5（半整數）→ spawnX=0；dy 全為 0 → spawnY=-0.5 使 y 對齊格心。
   *   O  dx/dy = ±0.5（半整數）→ spawn 在 (0,0)。
   *   T/S/Z/L/J 偏移為整數 → spawn 在 (-0.5,-0.5)，x/y 均對齊格心。
   */
  static SHAPES = [
    { name: 'I', color: '#2563eb', spawnX:    0, spawnY: -0.5, offsets: [[-1.5,0],[-0.5,0],[0.5,0],[1.5,0]] },
    { name: 'O', color: '#16a34a', spawnX:    0, spawnY:    0, offsets: [[-0.5,-0.5],[0.5,-0.5],[-0.5,0.5],[0.5,0.5]] },
    { name: 'T', color: '#7c3aed', spawnX: -0.5, spawnY: -0.5, offsets: [[-1,0],[0,0],[1,0],[0,1]] },
    { name: 'S', color: '#e11d48', spawnX: -0.5, spawnY: -0.5, offsets: [[-1,0],[0,0],[0,-1],[1,-1]] },
    { name: 'Z', color: '#ea580c', spawnX: -0.5, spawnY: -0.5, offsets: [[-1,-1],[0,-1],[0,0],[1,0]] },
    { name: 'L', color: '#0891b2', spawnX: -0.5, spawnY: -0.5, offsets: [[-1,0],[0,0],[1,0],[1,1]] },
    { name: 'J', color: '#be185d', spawnX: -0.5, spawnY: -0.5, offsets: [[-1,0],[0,0],[1,0],[-1,1]] },
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
    this.wx    = this.shape.spawnX;
    this.wy    = this.shape.spawnY;
  }

  // ── 邊界計算 ────────────────────────────────────────────────────

  /**
   * 各方向含半方塊寬的極值偏移（非對稱，逐方向獨立計算）。
   * 回傳：子方塊整體在 ±X / ±Y 方向的最遠邊緣（相對 wx/wy）。
   */
  _shapeBounds() {
    let minDx = Infinity, maxDx = -Infinity;
    let minDy = Infinity, maxDy = -Infinity;
    for (const [dx, dy] of this.shape.offsets) {
      if (dx < minDx) minDx = dx;
      if (dx > maxDx) maxDx = dx;
      if (dy < minDy) minDy = dy;
      if (dy > maxDy) maxDy = dy;
    }
    const h = this.halfSize;
    return { minDx: minDx - h, maxDx: maxDx + h, minDy: minDy - h, maxDy: maxDy + h };
  }

  /**
   * 以 Z=0 的 8×8 格場邊界，計算四方向各自的移動極限。
   * 不對稱形狀（如 T/L/J/S/Z）各方向獨立計算，確保可精確貼牆。
   *   wx + b.maxDx ≤  fh  →  xMax =  fh - b.maxDx
   *   wx + b.minDx ≥ -fh  →  xMin = -fh - b.minDx
   */
  xyBound() {
    const fh = this.camera.frustumHalfAt(0);
    const b  = this._shapeBounds();
    return {
      xMin: -fh - b.minDx,
      xMax:  fh - b.maxDx,
      yMin: -fh - b.minDy,
      yMax:  fh - b.maxDy,
    };
  }

  clampXY() {
    const { xMin, xMax, yMin, yMax } = this.xyBound();
    this.wx = Math.max(xMin, Math.min(xMax, this.wx));
    this.wy = Math.max(yMin, Math.min(yMax, this.wy));
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

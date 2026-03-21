/**
 * TetrominoRenderer — 方塊渲染
 *
 * 職責：
 *   - 3D 線框渲染（draw）
 *   - 四面牆投影陰影（drawWallShadows）
 *
 * 依賴：Camera（投影計算）、Tetromino（遊戲狀態，唯讀）
 * 不含任何遊戲邏輯與狀態。
 */
class TetrominoRenderer {
  static EDGES = [
    [0,1],[1,2],[2,3],[3,0],  // 前面
    [4,5],[5,6],[6,7],[7,4],  // 後面
    [0,4],[1,5],[2,6],[3,7],  // 連接邊
  ];

  /** @param {Camera} camera */
  constructor(camera) {
    this.camera = camera;
  }

  // ── 3D 線框 ─────────────────────────────────────────────────────

  /**
   * 將 Tetromino 的所有子方塊以透視投影繪製成 3D 線框。
   * @param {CanvasRenderingContext2D} ctx
   * @param {Tetromino} tetromino
   */
  draw(ctx, tetromino) {
    const { camera }  = this;
    const h = tetromino.halfSize;

    ctx.save();
    ctx.strokeStyle = tetromino.shape.color;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.shadowColor = tetromino.shape.color;
    ctx.shadowBlur  = 10;
    ctx.beginPath();

    for (const [dx, dy] of tetromino.shape.offsets) {
      const bx = tetromino.wx + dx;
      const by = tetromino.wy + dy;
      const bz = tetromino.cz;

      // 8 頂點（前面 0-3，後面 4-7）
      const V = [
        [bx-h, by-h, bz-h], [bx+h, by-h, bz-h], [bx+h, by+h, bz-h], [bx-h, by+h, bz-h],
        [bx-h, by-h, bz+h], [bx+h, by-h, bz+h], [bx+h, by+h, bz+h], [bx-h, by+h, bz+h],
      ];
      const P = V.map(([vx, vy, vz]) => camera.project(vx, vy, vz));

      for (const [a, b] of TetrominoRenderer.EDGES) {
        if (!P[a] || !P[b]) continue;
        ctx.moveTo(P[a].x, P[a].y);
        ctx.lineTo(P[b].x, P[b].y);
      }
    }

    ctx.stroke();
    ctx.restore();
  }

  // ── 牆面投影陰影 ─────────────────────────────────────────────────

  /**
   * 將各子方塊在四個正交視角的投影繪製在對應牆面的梯形區域內：
   *
   *   左/右牆（YZ 側視角）：
   *     深度 bz → 牆面 X 位置（從畫布邊緣沿透視線滑入）
   *     高度 by → 透視投影 Y（反映方塊垂直位置）
   *
   *   上/下牆（XZ 俯視角）：
   *     深度 bz → 牆面 Y 位置
   *     水平 bx → 透視投影 X（反映方塊水平位置）
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {Tetromino} tetromino
   */
  drawWallShadows(ctx, tetromino) {
    const { camera }  = this;
    const sFar = camera.scaleAt(tetromino.maxZ);
    const ix1  = camera.cx * (1 - sFar);   // 最遠截面：左邊 x
    const iy1  = camera.cy * (1 - sFar);   // 最遠截面：上邊 y
    const ix2  = camera.cx * (1 + sFar);   // 最遠截面：右邊 x
    const iy2  = camera.cy * (1 + sFar);   // 最遠截面：下邊 y

    ctx.save();
    ctx.fillStyle   = tetromino.shape.color + '40';
    ctx.strokeStyle = tetromino.shape.color + 'aa';
    ctx.lineWidth   = 0.8;

    for (const [dx, dy] of tetromino.shape.offsets) {
      const bx = tetromino.wx + dx;
      const by = tetromino.wy + dy;
      const bz = tetromino.cz;
      const t  = bz / tetromino.maxZ;   // 深度比例 0(近) → 1(遠)

      const s  = camera.scaleAt(bz);
      const px = camera.cx + bx * Camera.UNIT_SCALE * s;  // 投影 X
      const py = camera.cy + by * Camera.UNIT_SCALE * s;  // 投影 Y
      const ph = tetromino.halfSize * Camera.UNIT_SCALE * s;  // 投影半徑
      const dw = ix1 * (tetromino.halfSize * 2 / tetromino.maxZ);  // 牆面深度方向寬度
      const dh = iy1 * (tetromino.halfSize * 2 / tetromino.maxZ);  // 牆面深度方向高度

      // 左牆
      { const wx = t * ix1;
        ctx.beginPath(); ctx.rect(wx - dw/2, py - ph, dw, ph*2);
        ctx.fill(); ctx.stroke(); }

      // 右牆
      { const wx = camera.w - t * (camera.w - ix2);
        ctx.beginPath(); ctx.rect(wx - dw/2, py - ph, dw, ph*2);
        ctx.fill(); ctx.stroke(); }

      // 上牆
      { const wy = t * iy1;
        ctx.beginPath(); ctx.rect(px - ph, wy - dh/2, ph*2, dh);
        ctx.fill(); ctx.stroke(); }

      // 下牆
      { const wy = camera.h - t * (camera.h - iy2);
        ctx.beginPath(); ctx.rect(px - ph, wy - dh/2, ph*2, dh);
        ctx.fill(); ctx.stroke(); }
    }

    ctx.restore();
  }
}

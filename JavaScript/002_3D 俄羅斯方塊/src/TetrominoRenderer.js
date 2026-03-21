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
    const { camera } = this;
    const maxZ = tetromino.maxZ;
    const h    = tetromino.halfSize;

    ctx.save();
    ctx.fillStyle   = tetromino.shape.color + '40';
    ctx.strokeStyle = tetromino.shape.color + 'aa';
    ctx.lineWidth   = 0.8;

    const quad = (x0,y0, x1,y1, x2,y2, x3,y3) => {
      ctx.beginPath();
      ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    };

    for (const [dx, dy] of tetromino.shape.offsets) {
      const bx = tetromino.wx + dx;
      const by = tetromino.wy + dy;
      const bz = tetromino.cz;

      // 方塊深度範圍（夾緊至走廊）
      const zN = Math.max(0,    bz - h);
      const zF = Math.min(maxZ, bz + h);

      // 近/遠端透視縮放——與 Frustum、Camera.project 使用同一公式
      const sN = camera.scaleAt(zN);
      const sF = camera.scaleAt(zF);

      // 牆面邊緣位置：cx * (1 ± s)，直接由透視縮放決定，不做線性插值
      const wLN = camera.cx * (1 - sN);  // 左牆近端 x
      const wLF = camera.cx * (1 - sF);  // 左牆遠端 x
      const wRN = camera.cx * (1 + sN);  // 右牆近端 x
      const wRF = camera.cx * (1 + sF);  // 右牆遠端 x
      const wTN = camera.cy * (1 - sN);  // 上牆近端 y
      const wTF = camera.cy * (1 - sF);  // 上牆遠端 y
      const wBN = camera.cy * (1 + sN);  // 下牆近端 y
      const wBF = camera.cy * (1 + sF);  // 下牆遠端 y

      // 方塊 Y 在近/遠端的透視投影（左/右牆用）
      const yTN = camera.cy + (by - h) * Camera.UNIT_SCALE * sN;
      const yBN = camera.cy + (by + h) * Camera.UNIT_SCALE * sN;
      const yTF = camera.cy + (by - h) * Camera.UNIT_SCALE * sF;
      const yBF = camera.cy + (by + h) * Camera.UNIT_SCALE * sF;

      // 方塊 X 在近/遠端的透視投影（上/下牆用）
      const xLN = camera.cx + (bx - h) * Camera.UNIT_SCALE * sN;
      const xRN = camera.cx + (bx + h) * Camera.UNIT_SCALE * sN;
      const xLF = camera.cx + (bx - h) * Camera.UNIT_SCALE * sF;
      const xRF = camera.cx + (bx + h) * Camera.UNIT_SCALE * sF;

      quad(wLN, yTN,  wLN, yBN,  wLF, yBF,  wLF, yTF);  // 左牆
      quad(wRN, yTN,  wRN, yBN,  wRF, yBF,  wRF, yTF);  // 右牆
      quad(xLN, wTN,  xRN, wTN,  xRF, wTF,  xLF, wTF);  // 上牆
      quad(xLN, wBN,  xRN, wBN,  xRF, wBF,  xLF, wBF);  // 下牆
    }

    ctx.restore();
  }
}

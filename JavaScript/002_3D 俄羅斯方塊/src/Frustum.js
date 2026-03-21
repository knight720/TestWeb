/**
 * Frustum — 視錐渲染
 *
 * 職責：繪製走廊透視參考框（深度截面矩形 + 四條收斂透視線）
 *       + 8×8 格場透視格線（近端平面 → 遠端截面）
 * 依賴：Camera（投影計算）
 */
class Frustum {
  /**
   * @param {Camera} camera
   * @param {number} maxZ 走廊最大深度
   */
  constructor(camera, maxZ) {
    this.camera = camera;
    this.maxZ   = maxZ;
  }

  /**
   * 繪製 8×8 格場透視格線、深度截面矩形，以及收斂透視線。
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const { camera, maxZ } = this;
    ctx.save();
    ctx.lineJoin = 'round';

    const N    = Camera.GRID_SIZE;    // 8
    const US   = Camera.UNIT_SCALE;   // 50
    const sFar = camera.scaleAt(maxZ);

    // 遠端截面四邊位置
    const farL = camera.cx - camera.cx * sFar;
    const farR = camera.cx + camera.cx * sFar;
    const farT = camera.cy - camera.cy * sFar;
    const farB = camera.cy + camera.cy * sFar;

    // ── 近端平面格線（Z=0，填滿整個畫布）────────────────────────
    ctx.strokeStyle = 'rgba(59,130,246,0.06)';
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    for (let i = -(N / 2 - 1); i <= N / 2 - 1; i++) {
      const x = camera.cx + i * US;
      const y = camera.cy + i * US;
      ctx.moveTo(x, 0);        ctx.lineTo(x, camera.h);  // 垂直線
      ctx.moveTo(0, y);        ctx.lineTo(camera.w, y);  // 水平線
    }
    ctx.stroke();

    // ── 3D 透視格線（近端邊緣 → 遠端截面，含遠端線段）──────────
    ctx.strokeStyle = 'rgba(59,130,246,0.10)';
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    for (let i = -(N / 2 - 1); i <= N / 2 - 1; i++) {
      const nearX = camera.cx + i * US;
      const farX  = camera.cx + i * US * sFar;
      const nearY = camera.cy + i * US;
      const farY  = camera.cy + i * US * sFar;

      // 垂直格線：頂邊收斂 + 底邊收斂 + 遠端線段
      ctx.moveTo(nearX, 0);        ctx.lineTo(farX, farT);
      ctx.moveTo(nearX, camera.h); ctx.lineTo(farX, farB);
      ctx.moveTo(farX,  farT);     ctx.lineTo(farX, farB);

      // 水平格線：左邊收斂 + 右邊收斂 + 遠端線段
      ctx.moveTo(0,        nearY);  ctx.lineTo(farL, farY);
      ctx.moveTo(camera.w, nearY);  ctx.lineTo(farR, farY);
      ctx.moveTo(farL,     farY);   ctx.lineTo(farR, farY);
    }
    ctx.stroke();

    // ── 深度截面矩形（三層，由近至遠漸深）─────────────────────────
    const layers = [
      { z: maxZ * 0.3, alpha: 0.10 },
      { z: maxZ * 0.6, alpha: 0.15 },
      { z: maxZ,       alpha: 0.30 },
    ];
    for (const { z, alpha } of layers) {
      const s  = camera.scaleAt(z);
      const hw = camera.cx * s;
      const hh = camera.cy * s;
      ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.rect(camera.cx - hw, camera.cy - hh, hw * 2, hh * 2);
      ctx.stroke();
    }

    // ── 透視收斂線（畫布四角 → 最遠截面角落）──────────────────────
    ctx.strokeStyle = 'rgba(59,130,246,0.18)';
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.moveTo(0,        0);        ctx.lineTo(farL, farT);
    ctx.moveTo(camera.w, 0);        ctx.lineTo(farR, farT);
    ctx.moveTo(camera.w, camera.h); ctx.lineTo(farR, farB);
    ctx.moveTo(0,        camera.h); ctx.lineTo(farL, farB);
    ctx.stroke();

    ctx.restore();
  }
}

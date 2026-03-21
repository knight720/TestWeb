/**
 * Frustum — 視錐渲染
 *
 * 職責：繪製走廊透視參考框（深度截面矩形 + 四條收斂透視線）
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
   * 繪製三層深度截面矩形，以及從畫布四角收斂至最遠截面的透視線。
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    const { camera, maxZ } = this;
    ctx.save();
    ctx.lineJoin = 'round';

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
    const sFar = camera.scaleAt(maxZ);
    const ix1  = camera.cx - camera.cx * sFar;
    const iy1  = camera.cy - camera.cy * sFar;
    const ix2  = camera.cx + camera.cx * sFar;
    const iy2  = camera.cy + camera.cy * sFar;

    ctx.strokeStyle = 'rgba(59,130,246,0.18)';
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.moveTo(0,        0);        ctx.lineTo(ix1, iy1);  // 左上
    ctx.moveTo(camera.w, 0);        ctx.lineTo(ix2, iy1);  // 右上
    ctx.moveTo(camera.w, camera.h); ctx.lineTo(ix2, iy2);  // 右下
    ctx.moveTo(0,        camera.h); ctx.lineTo(ix1, iy2);  // 左下
    ctx.stroke();

    ctx.restore();
  }
}

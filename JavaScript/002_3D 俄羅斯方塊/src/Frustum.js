class Frustum {
  /**
   * 以 Cube 相同的透視參數，繪製投影空間的邊界：
   *   - 數條深度截面矩形（z = maxZ * 0.3 / 0.6 / 1.0）
   *   - 四條由畫布角落收斂至最遠截面角落的透視線
   *
   * 推導：在深度 z 處，剛好填滿畫布的世界空間半寬為
   *   halfWorld = cx * (z + FOCAL) / (UNIT_SCALE * FOCAL)
   * 投影回螢幕後，該點座標剛好等於畫布邊緣。
   * 因此，改以「相對於近裁切面(z=0)的縮放比 s = FOCAL/(z+FOCAL)」
   * 來決定截面矩形的螢幕尺寸，以呈現視覺上的深度遠近感。
   */
  constructor(canvasW, canvasH, maxZ = 10) {
    this.cx   = canvasW / 2;
    this.cy   = canvasH / 2;
    this.w    = canvasW;
    this.h    = canvasH;
    this.maxZ = maxZ;
  }

  /** 深度 z 的透視縮放（與 Cube._project 一致） */
  _scaleAt(z) {
    return Cube.FOCAL / (z + Cube.FOCAL);
  }

  draw(ctx) {
    ctx.save();
    ctx.lineJoin = 'round';

    // ── 深度截面矩形 ──────────────────────────────────────────────
    const layers = [
      { z: this.maxZ * 0.3, alpha: 0.10 },
      { z: this.maxZ * 0.6, alpha: 0.15 },
      { z: this.maxZ,       alpha: 0.30 },
    ];

    for (const { z, alpha } of layers) {
      const s  = this._scaleAt(z);
      const hw = this.cx * s;
      const hh = this.cy * s;
      ctx.strokeStyle = `rgba(0,255,255,${alpha})`;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.rect(this.cx - hw, this.cy - hh, hw * 2, hh * 2);
      ctx.stroke();
    }

    // ── 透視收斂線（畫布四角 → 最遠截面角落） ────────────────────
    const sFar = this._scaleAt(this.maxZ);
    const ihw  = this.cx * sFar;
    const ihh  = this.cy * sFar;
    const ix1  = this.cx - ihw,  iy1 = this.cy - ihh;
    const ix2  = this.cx + ihw,  iy2 = this.cy + ihh;

    ctx.strokeStyle = 'rgba(0,255,255,0.18)';
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.moveTo(0,      0);       ctx.lineTo(ix1, iy1);  // 左上
    ctx.moveTo(this.w, 0);       ctx.lineTo(ix2, iy1);  // 右上
    ctx.moveTo(this.w, this.h);  ctx.lineTo(ix2, iy2);  // 右下
    ctx.moveTo(0,      this.h);  ctx.lineTo(ix1, iy2);  // 左下
    ctx.stroke();

    ctx.restore();
  }
}

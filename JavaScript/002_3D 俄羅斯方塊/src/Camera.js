/**
 * Camera — 透視相機
 *
 * 唯一持有透視參數的地方，提供所有投影相關的純計算方法。
 * 其他模組一律透過 Camera 實例進行投影，不得自行硬編 FOCAL / UNIT_SCALE。
 */
class Camera {
  /** 相機焦距（世界單位）；相機位於 Z = -FOCAL */
  static FOCAL      = 5;
  /** 參考平面 (Z=0) 上每個世界單位對應的畫素數 */
  static UNIT_SCALE = 150;

  constructor(canvasW, canvasH) {
    this.cx = canvasW / 2;
    this.cy = canvasH / 2;
    this.w  = canvasW;
    this.h  = canvasH;
  }

  /** 深度 z 的透視縮放比：s = FOCAL / (z + FOCAL) */
  scaleAt(z) {
    return Camera.FOCAL / (z + Camera.FOCAL);
  }

  /**
   * 3D 世界座標 → 2D 畫布座標。
   * 若點位在相機後方（z + FOCAL <= 0）回傳 null。
   */
  project(vx, vy, vz) {
    const dz = vz + Camera.FOCAL;
    if (dz <= 0) return null;
    const s = Camera.FOCAL / dz;
    return {
      x: this.cx + vx * Camera.UNIT_SCALE * s,
      y: this.cy + vy * Camera.UNIT_SCALE * s,
    };
  }

  /**
   * 深度 z 的視錐半寬（世界單位）。
   * 此寬度投影後剛好對應畫布邊緣（cx pixels）。
   *   frustumHalf = cx * (z + FOCAL) / (UNIT_SCALE * FOCAL)
   */
  frustumHalfAt(z) {
    return this.cx * (z + Camera.FOCAL) / (Camera.UNIT_SCALE * Camera.FOCAL);
  }
}

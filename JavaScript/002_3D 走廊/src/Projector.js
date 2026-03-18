// 投影器：純投影數學，不持有任何狀態，只讀 Camera
class Projector {
  constructor(camera) {
    this.camera = camera;
  }

  get depth()   { return this.camera.depth; }
  get cameraZ() { return this.camera.z; }

  // 將走廊空間中的 3D 點 (x, y, z) 投影到 2D 畫布座標
  project(x, y, z) {
    const { wallX, wallY, wallScale, z: camZ, depth } = this.camera;
    const wx = wallX + x * wallScale;
    const wy = wallY + y * wallScale;
    const t  = (z - camZ) / (depth - camZ);
    return {
      x: x + (wx - x) * t,
      y: y + (wy - y) * t,
    };
  }

  // 物件在 z 位置的視覺縮放比例（1 = 鏡頭前，maxScale = 最遠端）
  getScale(z) {
    const { maxScale, z: camZ, depth } = this.camera;
    const denom = depth - camZ;
    if (denom <= 0) return 1;
    return maxScale + (1 - maxScale) * (depth - z) / denom;
  }

  // 物件是否在鏡頭前方（可見）
  isInFront(z) {
    return z >= this.camera.z;
  }
}

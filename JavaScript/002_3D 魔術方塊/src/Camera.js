// 相機：管理鏡頭狀態，計算並快取投影所需的衍生值
class Camera {
  constructor(w, h, depth, maxScale = 0.4) {
    this.width    = w;
    this.height   = h;
    this.depth    = depth;
    this.maxScale = maxScale;
    this.z        = 0;

    // 消失點（視覺上走廊線條的收斂點），預設畫布中心
    this.vpX = w / 2;
    this.vpY = h / 2;

    // 衍生快取：由 _update() 維護，保證隨時一致
    this.wallScale = maxScale;
    this.wallX     = 0;
    this.wallY     = 0;

    this._update();
  }

  // 根據滑鼠位置更新消失點（鏡像於畫布中心）
  setVanishingPoint(mouseX, mouseY) {
    this.vpX = this.width  - mouseX;
    this.vpY = this.height - mouseY;
    this._update();
  }

  // 前進 / 後退（滾輪）
  move(value) {
    this.z = Math.max(0, Math.min(this.depth * 0.8, this.z + value));
    this._update();
  }

  // 同步所有衍生快取值，每次狀態改變後呼叫
  _update() {
    this.wallScale = this.maxScale + (1 - this.maxScale) * this.z / this.depth;
    const w2    = (this.width  * this.wallScale) / 2;
    const h2    = (this.height * this.wallScale) / 2;
    this.wallX  = this.vpX - w2;
    this.wallY  = this.vpY - h2;
  }
}

// 場景：純集合管理，不知道具體 Shape 型別
class Scene {
  constructor() {
    this.shapes = [];
  }

  add(shape) {
    this.shapes.push(shape);
    return this; // 支援 chain: scene.add(...).add(...)
  }

  move(dt) {
    this.shapes.forEach(s => s.move(dt));
  }

  draw(ctx) {
    // 畫家演算法：遠→近排序，確保近物遮擋遠物
    this.shapes
      .slice()
      .sort((a, b) => b.z - a.z)
      .forEach(s => s.draw(ctx));
  }
}

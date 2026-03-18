// 走廊：只負責繪製單點透視走廊線框
class Corridor {
  constructor(camera) {
    this.camera = camera;
  }

  draw(ctx) {
    const { width, height, wallX, wallY, wallScale } = this.camera;
    const w  = width  * wallScale;
    const h  = height * wallScale;

    // 遠端牆壁的四個角點
    const tl = { x: wallX,     y: wallY     };
    const tr = { x: wallX + w, y: wallY     };
    const br = { x: wallX + w, y: wallY + h };
    const bl = { x: wallX,     y: wallY + h };

    ctx.save();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur  = 10;

    ctx.beginPath();
    // 遠端牆壁矩形
    ctx.moveTo(tl.x, tl.y);
    ctx.lineTo(tr.x, tr.y);
    ctx.lineTo(br.x, br.y);
    ctx.lineTo(bl.x, bl.y);
    ctx.closePath();
    // 四條透視延伸線（畫布角→遠端牆壁角）
    ctx.moveTo(0,      0      ); ctx.lineTo(tl.x, tl.y);
    ctx.moveTo(width,  0      ); ctx.lineTo(tr.x, tr.y);
    ctx.moveTo(width,  height ); ctx.lineTo(br.x, br.y);
    ctx.moveTo(0,      height ); ctx.lineTo(bl.x, bl.y);

    ctx.stroke();
    ctx.restore();
  }
}

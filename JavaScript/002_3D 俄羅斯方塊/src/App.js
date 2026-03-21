/**
 * App — 主迴圈與輸入
 *
 * 職責：
 *   - 建立所有物件（Camera、Tetromino、Frustum、TetrominoRenderer）
 *   - requestAnimationFrame 遊戲迴圈
 *   - 鍵盤輸入處理
 *   - UI 資訊更新
 */
const App = (() => {
  const canvas = document.getElementById('myCanvas');
  const ctx    = canvas.getContext('2d');
  const info   = document.getElementById('info');

  const camera   = new Camera(canvas.width, canvas.height);
  const tetromino = new Tetromino(camera);
  const frustum  = new Frustum(camera, tetromino.maxZ);
  const renderer = new TetrominoRenderer(camera);

  let lastTimestamp = null;

  function gameLoop(timestamp) {
    const dt = lastTimestamp !== null ? (timestamp - lastTimestamp) / 1000 : 1 / 60;
    lastTimestamp = timestamp;

    tetromino.move(dt);
    info.value = `${tetromino.shape.name}  Z:${tetromino.cz.toFixed(1)}`;

    ctx.fillStyle = '#f8fbff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    frustum.draw(ctx);
    renderer.drawWallShadows(ctx, tetromino);
    renderer.draw(ctx, tetromino);

    requestAnimationFrame(gameLoop);
  }

  function init() {
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(gameLoop);
  }

  function onKeyDown(e) {
    const STEP = 1;
    switch (e.key) {
      case 'ArrowUp':    tetromino.moveXY( 0, -STEP); break;
      case 'ArrowDown':  tetromino.moveXY( 0,  STEP); break;
      case 'ArrowLeft':  tetromino.moveXY(-STEP,  0); break;
      case 'ArrowRight': tetromino.moveXY( STEP,  0); break;
      default: return;
    }
    e.preventDefault();
  }

  return { init };
})();

App.init();

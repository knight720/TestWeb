const App = (() => {
  const canvas = document.getElementById('myCanvas');
  const ctx    = canvas.getContext('2d');
  const info   = document.getElementById('info');

  const cube    = new Cube(canvas.width, canvas.height);
  const frustum = new Frustum(canvas.width, canvas.height, cube.maxZ);
  let lastTimestamp = null;

  function gameLoop(timestamp) {
    const dt = lastTimestamp !== null ? (timestamp - lastTimestamp) / 1000 : 1 / 60;
    lastTimestamp = timestamp;

    cube.move(dt);
    info.value = `Z: ${cube.cz.toFixed(2)}`;

    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    frustum.draw(ctx);
    cube.draw(ctx);

    requestAnimationFrame(gameLoop);
  }

  function init() {
    window.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(gameLoop);
  }

  function onKeyDown(e) {
    const STEP = 1; // 每次移動一個世界單位
    switch (e.key) {
      case 'ArrowUp':    cube.moveXY( 0, -STEP); break;
      case 'ArrowDown':  cube.moveXY( 0,  STEP); break;
      case 'ArrowLeft':  cube.moveXY(-STEP,  0); break;
      case 'ArrowRight': cube.moveXY( STEP,  0); break;
      default: return;
    }
    e.preventDefault(); // 避免觸發頁面捲動
  }

  return { init };
})();

App.init();

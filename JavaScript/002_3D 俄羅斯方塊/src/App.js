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
    requestAnimationFrame(gameLoop);
  }

  return { init };
})();

App.init();

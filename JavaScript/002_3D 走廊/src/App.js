const App = (() => {
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  const info = document.getElementById('info');

  const frame = new Frame(canvas.width, canvas.height, 25);
  const bulletManager = new BulletManager(10, canvas.width, canvas.height, frame);

  const mouse = { x: frame.centerX, y: frame.centerY };
  let lastTimestamp = null;

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseWheel(e) {
    e.preventDefault();
    const delta = typeof e.deltaY === 'number' ? -e.deltaY / 100 : e.wheelDelta / 120;
    frame.move(delta);
    info.value = `Z: ${frame.z.toFixed(2)}`;
  }

  function drawScene(ctx) {
    // Merge wall + bullets, sort far-to-near (painter's algorithm)
    // so nearer objects correctly occlude farther ones
    const objects = [frame.wall, ...bulletManager.bullets];
    objects.sort((a, b) => b.z - a.z);
    objects.forEach(obj => obj.draw(ctx));
  }

  function gameLoop(timestamp) {
    const dt = lastTimestamp !== null ? (timestamp - lastTimestamp) / 1000 : 1 / 60;
    lastTimestamp = timestamp;

    frame.updateMouse(mouse.x, mouse.y);
    bulletManager.move(dt);

    // Dark background instead of clearRect for subtle trail feel
    ctx.fillStyle = '#000010';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    frame.draw(ctx);
    drawScene(ctx);

    requestAnimationFrame(gameLoop);
  }

  function init() {
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onMouseWheel, { passive: false });
    canvas.addEventListener('mousewheel', onMouseWheel, { passive: false });
    requestAnimationFrame(gameLoop);
  }

  return { init };
})();

App.init();

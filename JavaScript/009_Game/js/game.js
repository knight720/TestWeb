'use strict';

// ── Camera ────────────────────────────────────────────────────────────────────
class Camera {
  constructor(width, height) {
    this.x      = 0;
    this.y      = 0;
    this.width  = width;
    this.height = height;
  }

  follow(targetX, targetY) {
    this.x = targetX - this.width  * 0.5;
    this.y = targetY - this.height * 0.5;
    this._clamp();
  }

  _clamp() {
    const mapW = MAP_COLS * TILE_SIZE;
    const mapH = MAP_ROWS * TILE_SIZE;
    this.x = Math.max(0, Math.min(mapW - this.width,  this.x));
    this.y = Math.max(0, Math.min(mapH - this.height, this.y));
  }

  resize(w, h) {
    this.width  = w;
    this.height = h;
    this._clamp();
  }
}

// ── Input handler ─────────────────────────────────────────────────────────────
class InputHandler {
  constructor() {
    this._keys        = {};
    this._justPressed = {};

    window.addEventListener('keydown', e => {
      if (!this._keys[e.code]) this._justPressed[e.code] = true;
      this._keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      this._keys[e.code] = false;
    });
  }

  get up()    { return !!(this._keys['ArrowUp']    || this._keys['KeyW']); }
  get down()  { return !!(this._keys['ArrowDown']  || this._keys['KeyS']); }
  get left()  { return !!(this._keys['ArrowLeft']  || this._keys['KeyA']); }
  get right() { return !!(this._keys['ArrowRight'] || this._keys['KeyD']); }

  wasPressed(code) {
    if (this._justPressed[code]) {
      delete this._justPressed[code];
      return true;
    }
    return false;
  }
}

// ── Game ──────────────────────────────────────────────────────────────────────
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx    = this.canvas.getContext('2d');

    this._resize();
    window.addEventListener('resize', () => this._resize());

    // Build the world
    const SEED  = 54321;
    this.map    = new GameMap(SEED);
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.input  = new InputHandler();

    const [startX, startY] = this._findStartPosition();
    this.player = new Player(startX, startY);
    this.camera.follow(this.player.x, this.player.y);

    // HUD element references
    this._elTerrain  = document.getElementById('terrain-name');
    this._elPosition = document.getElementById('position-info');

    this._lastTime = performance.now();
    requestAnimationFrame(ts => this._loop(ts));
  }

  // ── Initialisation helpers ──────────────────────────────────────────────────

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.camera) this.camera.resize(this.canvas.width, this.canvas.height);
  }

  /**
   * Spiral search outward from map centre to find the first grass tile.
   * Falls back to any passable tile, then the bare map centre.
   */
  _findStartPosition() {
    const cx = Math.floor(MAP_COLS / 2);
    const cy = Math.floor(MAP_ROWS / 2);

    for (let r = 0; r <= Math.max(MAP_COLS, MAP_ROWS); r++) {
      for (let dr = -r; dr <= r; dr++) {
        for (let dc = -r; dc <= r; dc++) {
          // Only inspect the perimeter ring of this radius
          if (Math.abs(dr) !== r && Math.abs(dc) !== r) continue;
          const col = cx + dc;
          const row = cy + dr;
          if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) continue;
          const t = this.map.getTileAt(col, row);
          if (t.passable && t.speedMod === 1.0) { // prefer grass
            return [(col + 0.5) * TILE_SIZE, (row + 0.5) * TILE_SIZE];
          }
        }
      }
    }

    // Fallback: any passable tile
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        if (this.map.getTileAt(col, row).passable) {
          return [(col + 0.5) * TILE_SIZE, (row + 0.5) * TILE_SIZE];
        }
      }
    }

    return [(cx + 0.5) * TILE_SIZE, (cy + 0.5) * TILE_SIZE];
  }

  // ── Game loop ───────────────────────────────────────────────────────────────

  _loop(timestamp) {
    // Cap dt to avoid huge jumps after tab switches / breakpoints
    const dt = Math.min(timestamp - this._lastTime, 50);
    this._lastTime = timestamp;

    this._update(dt);
    this._render();

    requestAnimationFrame(ts => this._loop(ts));
  }

  _update(dt) {
    if (this.input.wasPressed('KeyE')) this.player.toggleBoat();

    this.map.update(dt);
    this.player.update(this.input, this.map, dt);
    this.camera.follow(this.player.x, this.player.y);

    // Update HUD
    const terrain = this.map.getTerrainAtPixel(this.player.x, this.player.y);
    this._elTerrain.textContent  = terrain.name;
    this._elPosition.textContent = `${this.player.tileCol}, ${this.player.tileRow}`;
  }

  _render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.map.render(ctx, this.camera);
    this.player.render(ctx, this.camera);
    this.map.renderMinimap(
      ctx,
      this.player.x, this.player.y,
      this.camera.x, this.camera.y,
      this.camera.width, this.camera.height,
    );
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
window.addEventListener('load', () => { new Game(); });

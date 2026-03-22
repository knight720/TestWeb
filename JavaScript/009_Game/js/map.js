'use strict';

class GameMap {
  constructor(seed) {
    this.cols     = MAP_COLS;
    this.rows     = MAP_ROWS;
    this.tileSize = TILE_SIZE;
    this._noise   = new PerlinNoise(seed);

    /** @type {Object[][]} 2-D grid [row][col] → terrain object */
    this.tiles = [];
    this._generate();

    /** Pre-rendered minimap (entire map at 1 px/tile) — built once */
    this._minimapCanvas = this._buildMinimapCanvas();

    /** Running timer used for water shimmer animation */
    this._waterTick = 0;

    /** Cache derived edge colours per terrain to avoid recomputing each frame */
    this._edgeCache = new Map();
    for (const terrain of Object.values(T)) {
      this._edgeCache.set(terrain, {
        light: lightenColor(terrain.color, 24),
        dark:  darkenColor (terrain.color, 20),
      });
    }
  }

  // ── Map generation ──────────────────────────────────────────────────────────
  _generate() {
    for (let row = 0; row < this.rows; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.cols; col++) {
        const h = this._noise.fbm(col * NOISE_SCALE, row * NOISE_SCALE);
        this.tiles[row][col] = getTerrainByHeight(h);
      }
    }
  }

  // ── Accessors ───────────────────────────────────────────────────────────────
  getTileAt(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return T.DEEP_WATER;
    }
    return this.tiles[row][col];
  }

  getTerrainAtPixel(px, py) {
    return this.getTileAt(
      Math.floor(px / this.tileSize),
      Math.floor(py / this.tileSize),
    );
  }

  // ── Minimap ─────────────────────────────────────────────────────────────────
  _buildMinimapCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width  = this.cols;
    canvas.height = this.rows;
    const ctx = canvas.getContext('2d');

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        ctx.fillStyle = this.tiles[row][col].color;
        ctx.fillRect(col, row, 1, 1);
      }
    }
    return canvas;
  }

  renderMinimap(ctx, playerX, playerY, camX, camY, camW, camH) {
    const PAD     = 12;
    const DISPLAY = 190;          // pixels to display the minimap at
    const BORDER  = 2;
    const mmX     = ctx.canvas.width - DISPLAY - PAD;
    const mmY     = PAD;

    // Border + dark background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(mmX - BORDER, mmY - BORDER, DISPLAY + BORDER * 2, DISPLAY + BORDER * 2);

    // Map texture (scaled from 1 px/tile → DISPLAY px)
    ctx.drawImage(this._minimapCanvas, mmX, mmY, DISPLAY, DISPLAY);

    // Viewport rectangle
    const scaleX = DISPLAY / this.cols;
    const scaleY = DISPLAY / this.rows;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(
      mmX + (camX / this.tileSize) * scaleX,
      mmY + (camY / this.tileSize) * scaleY,
      (camW / this.tileSize) * scaleX,
      (camH / this.tileSize) * scaleY,
    );

    // Player dot
    const markerX = mmX + (playerX / (this.cols * this.tileSize)) * DISPLAY;
    const markerY = mmY + (playerY / (this.rows * this.tileSize)) * DISPLAY;

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(markerX, markerY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(markerX, markerY, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Update (water animation) ─────────────────────────────────────────────────
  update(dt) {
    this._waterTick += dt;
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  render(ctx, camera) {
    const ts       = this.tileSize;
    const startCol = Math.max(0, Math.floor(camera.x / ts));
    const startRow = Math.max(0, Math.floor(camera.y / ts));
    const endCol   = Math.min(this.cols - 1, Math.ceil((camera.x + camera.width)  / ts));
    const endRow   = Math.min(this.rows - 1, Math.ceil((camera.y + camera.height) / ts));

    // Water shimmer: gentle sine-wave brightness shift
    const waterShift = (Math.sin(this._waterTick * 0.0014) * 14) | 0;

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const terrain = this.tiles[row][col];
        const sx      = (col * ts - camera.x) | 0;
        const sy      = (row * ts - camera.y) | 0;

        // ── Base fill ──────────────────────────────────────────────────────
        if (terrain.animated) {
          const [r, g, b] = hexToRgb(terrain.color);
          ctx.fillStyle = `rgb(${r},${Math.max(0, g)},${Math.min(255, b + waterShift)})`;
          ctx.fillRect(sx, sy, ts, ts);
        } else {
          ctx.fillStyle = terrain.color;
          ctx.fillRect(sx, sy, ts, ts);

          // ── Subtle raised-edge shading for non-water tiles ────────────────
          const edges = this._edgeCache.get(terrain);
          ctx.fillStyle = edges.light;
          ctx.fillRect(sx, sy, ts, 2);         // top
          ctx.fillRect(sx, sy, 2, ts);         // left
          ctx.fillStyle = edges.dark;
          ctx.fillRect(sx, sy + ts - 2, ts, 2); // bottom
          ctx.fillRect(sx + ts - 2, sy, 2, ts); // right
        }
      }
    }
  }
}

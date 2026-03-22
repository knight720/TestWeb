'use strict';

class Player {
  constructor(x, y) {
    this.x         = x;
    this.y         = y;
    this.size      = PLAYER_SIZE;  // 22 px
    this.direction = 'down';       // 'up' | 'down' | 'left' | 'right'
    this.moving    = false;

    this._animFrame = 0;
    this._animTimer = 0;
  }

  /** Tile coordinates (read-only) */
  get tileCol() { return Math.floor(this.x / TILE_SIZE); }
  get tileRow() { return Math.floor(this.y / TILE_SIZE); }

  // ── Update ──────────────────────────────────────────────────────────────────
  update(input, gameMap, dt) {
    const terrain = gameMap.getTerrainAtPixel(this.x, this.y);
    const speed   = terrain.passable ? PLAYER_SPEED * terrain.speedMod : 0;

    // Raw direction from input
    let dx = 0, dy = 0;
    if (input.up)    dy -= 1;
    if (input.down)  dy += 1;
    if (input.left)  dx -= 1;
    if (input.right) dx += 1;

    // Normalise diagonal so it doesn't move faster
    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    this.moving = dx !== 0 || dy !== 0;

    // Update facing direction (vertical takes priority over horizontal)
    if      (dy < 0) this.direction = 'up';
    else if (dy > 0) this.direction = 'down';
    else if (dx < 0) this.direction = 'left';
    else if (dx > 0) this.direction = 'right';

    // Attempt pixel-accurate movement with axis-separated collision (wall sliding)
    if (speed > 0 && this.moving) {
      const hitbox = this.size * 0.36; // slightly smaller than visual
      const nx = this.x + dx * speed;
      const ny = this.y + dy * speed;

      if (this._canMoveTo(nx, this.y, hitbox, gameMap)) this.x = nx;
      if (this._canMoveTo(this.x, ny, hitbox, gameMap)) this.y = ny;

      // Clamp to map bounds
      const mapW = gameMap.cols * TILE_SIZE;
      const mapH = gameMap.rows * TILE_SIZE;
      this.x = Math.max(hitbox, Math.min(mapW - hitbox, this.x));
      this.y = Math.max(hitbox, Math.min(mapH - hitbox, this.y));
    }

    // Walking animation
    if (this.moving) {
      this._animTimer += dt;
      if (this._animTimer >= 140) {
        this._animFrame = (this._animFrame + 1) & 3;
        this._animTimer = 0;
      }
    } else {
      this._animFrame = 0;
      this._animTimer = 0;
    }
  }

  /** Returns true if all four corners of the player AABB are on passable tiles. */
  _canMoveTo(x, y, half, gameMap) {
    return (
      gameMap.getTerrainAtPixel(x - half, y - half).passable &&
      gameMap.getTerrainAtPixel(x + half, y - half).passable &&
      gameMap.getTerrainAtPixel(x - half, y + half).passable &&
      gameMap.getTerrainAtPixel(x + half, y + half).passable
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  render(ctx, camera) {
    const sx  = (this.x - camera.x) | 0;
    const sy  = (this.y - camera.y) | 0;
    const s   = this.size;
    const hcy = -s * 0.18; // head centre Y (relative to player centre)
    const hr  = s * 0.27;  // head radius

    ctx.save();

    // Ground shadow
    ctx.globalAlpha = 0.22;
    ctx.fillStyle   = '#000';
    ctx.beginPath();
    ctx.ellipse(sx, sy + s * 0.42, s * 0.42, s * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Walking bob (subtle vertical oscillation)
    const bob = this.moving ? Math.sin(this._animFrame * Math.PI * 0.5) * 1.5 : 0;
    ctx.translate(sx, sy + bob);

    // ── Body (cloak) ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#2471a3';
    ctx.beginPath();
    ctx.ellipse(0, 2, s * 0.42, s * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body highlight (adds slight 3-D feel)
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.12, -s * 0.05, s * 0.2, s * 0.16, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // ── Head ─────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#f0d9b5'; // skin tone
    ctx.beginPath();
    ctx.arc(0, hcy, hr, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#7b4e2d';
    ctx.beginPath();
    ctx.arc(0, hcy - hr * 0.35, hr * 0.85, Math.PI, 0);
    ctx.fill();

    // Eyes (always face camera for simplicity)
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(-s * 0.09, hcy + s * 0.04, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc( s * 0.09, hcy + s * 0.04, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // ── Facing indicator ─────────────────────────────────────────────────────
    // A small red dot on the edge of the head in the current facing direction
    const FACE_DIR = {
      up:    [ 0,    -hr ],
      down:  [ 0,     hr ],
      left:  [-hr,    0  ],
      right: [ hr,    0  ],
    };
    const [fdx, fdy] = FACE_DIR[this.direction];
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(fdx, hcy + fdy, 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

'use strict';

const _playerSprite = new Image();
_playerSprite.src = 'assets/player.png';

class Player {
  constructor(x, y) {
    this.x         = x;
    this.y         = y;
    this.size      = PLAYER_SIZE;
    this.direction = 'down';
    this.moving    = false;
    this.boatActive = false;

    this._animFrame = 0;
    this._animTimer = 0;
  }

  /** Tile coordinates (read-only) */
  get tileCol() { return Math.floor(this.x / TILE_SIZE); }
  get tileRow() { return Math.floor(this.y / TILE_SIZE); }

  toggleBoat() { this.boatActive = !this.boatActive; }

  /** Water is passable when on a boat */
  _isPassable(terrain) {
    if (this.boatActive && terrain.animated) return true;
    return terrain.passable;
  }

  // ── Update ──────────────────────────────────────────────────────────────────
  update(input, gameMap, dt) {
    const terrain = gameMap.getTerrainAtPixel(this.x, this.y);
    const speed   = this._isPassable(terrain)
      ? PLAYER_SPEED * (terrain.speedMod > 0 ? terrain.speedMod : (this.boatActive ? 0.75 : 0))
      : 0;

    // Raw direction from input
    let dx = 0, dy = 0;
    if (input.up)    dy -= 1;
    if (input.down)  dy += 1;
    if (input.left)  dx -= 1;
    if (input.right) dx += 1;

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
      this._isPassable(gameMap.getTerrainAtPixel(x - half, y - half)) &&
      this._isPassable(gameMap.getTerrainAtPixel(x + half, y - half)) &&
      this._isPassable(gameMap.getTerrainAtPixel(x - half, y + half)) &&
      this._isPassable(gameMap.getTerrainAtPixel(x + half, y + half))
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  render(ctx, camera) {
    const sx  = (this.x - camera.x) | 0;
    const sy  = (this.y - camera.y) | 0;
    const s   = this.size * 2.2;  // sprite display size

    ctx.save();

    // Ground shadow
    ctx.globalAlpha = 0.22;
    ctx.fillStyle   = '#000';
    ctx.beginPath();
    ctx.ellipse(sx, sy + this.size * 0.42, this.size * 0.42, this.size * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    const bob = this.moving ? Math.sin(this._animFrame * Math.PI * 0.5) * 1.5 : 0;
    ctx.translate(sx, sy + bob);

    // Boat (drawn beneath player)
    if (this.boatActive) {
      ctx.fillStyle   = '#00eeff';
      ctx.shadowColor = '#00eeff';
      ctx.shadowBlur  = 16;
      ctx.beginPath();
      ctx.ellipse(0, s * 0.3, s * 0.55, s * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      // boat rim highlight
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }

    // Sprite (upside-down when no boat; right-side up with boat; flip X when facing left)
    ctx.save();
    const flipX = this.direction === 'left' ? -1 : 1;
    const flipY = this.boatActive ? 1 : -1;
    ctx.scale(flipX, flipY);
    if (_playerSprite.complete && _playerSprite.naturalWidth > 0) {
      ctx.drawImage(_playerSprite, -s / 2, -s / 2, s, s);
    } else {
      ctx.fillStyle = '#2471a3';
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Direction arrow (drawn after sprite, always faces correctly)
    this._drawDirectionArrow(ctx, s);

    ctx.restore();
  }

  _drawDirectionArrow(ctx, s) {
    const OFFSET = s * 0.55;
    const AW     = 5;
    const AL     = 9;
    const ROTATIONS = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };

    ctx.save();
    ctx.rotate(ROTATIONS[this.direction]);
    ctx.translate(OFFSET, 0);

    ctx.fillStyle   = '#ff00cc';
    ctx.shadowColor = '#ff00cc';
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.moveTo(AL,  0);
    ctx.lineTo(0,  -AW);
    ctx.lineTo(0,   AW);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

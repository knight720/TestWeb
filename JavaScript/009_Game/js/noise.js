'use strict';

/**
 * Seeded Perlin Noise — classic implementation with doubled permutation table.
 * Uses xorshift32 as a PRNG so results are fully deterministic for a given seed.
 */
class PerlinNoise {
  constructor(seed = 42) {
    this._p = this._buildPermTable(seed);
  }

  // ── PRNG ───────────────────────────────────────────────────────────────────
  _seededRandom(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 0x100000000;
    };
  }

  _buildPermTable(seed) {
    const rand = this._seededRandom(seed);
    const perm = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    return [...perm, ...perm]; // doubled for wrap-around indexing
  }

  // ── Classic Perlin helpers ─────────────────────────────────────────────────
  _fade(t)       { return t * t * t * (t * (t * 6 - 15) + 10); }
  _lerp(t, a, b) { return a + t * (b - a); }

  _grad(hash, x, y) {
    switch (hash & 3) {
      case 0: return  x + y;
      case 1: return -x + y;
      case 2: return  x - y;
      case 3: return -x - y;
    }
    return 0;
  }

  /** Single octave noise — returns a value in ≈ [−1, 1]. */
  get(x, y) {
    const X  = Math.floor(x) & 255;
    const Y  = Math.floor(y) & 255;
    const fx = x - Math.floor(x);
    const fy = y - Math.floor(y);
    const u  = this._fade(fx);
    const v  = this._fade(fy);

    const a = this._p[X]     + Y;
    const b = this._p[X + 1] + Y;

    return this._lerp(v,
      this._lerp(u,
        this._grad(this._p[a    ], fx,     fy    ),
        this._grad(this._p[b    ], fx - 1, fy    )),
      this._lerp(u,
        this._grad(this._p[a + 1], fx,     fy - 1),
        this._grad(this._p[b + 1], fx - 1, fy - 1))
    );
  }

  /**
   * Fractional Brownian Motion — sums multiple octaves of noise.
   * Returns a value normalised to ≈ [0, 1].
   */
  fbm(x, y, octaves = 6, persistence = 0.5, lacunarity = 2.0) {
    let value     = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue  = 0;

    for (let i = 0; i < octaves; i++) {
      value     += this.get(x * frequency, y * frequency) * amplitude;
      maxValue  += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return (value / maxValue + 1) * 0.5; // remap [-1,1] → [0,1]
  }
}

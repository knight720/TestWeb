'use strict';

// ── Tile / map dimensions ─────────────────────────────────────────────────────
const TILE_SIZE   = 32;
const MAP_COLS    = 150;  // 150 * 32 = 4800 px wide
const MAP_ROWS    = 150;  // 150 * 32 = 4800 px tall

// Controls "zoom" level of terrain features (lower = larger continents)
const NOISE_SCALE = 0.024;

// ── Player settings ───────────────────────────────────────────────────────────
const PLAYER_SPEED = 2.8;  // base pixels per frame
const PLAYER_SIZE  = 22;   // visual / hitbox reference

// ── Terrain type definitions ──────────────────────────────────────────────────
/**
 * Each terrain object:
 *   id        – numeric id (unused at runtime, useful for debugging)
 *   name      – display name (繁體中文)
 *   color     – base hex colour for rendering
 *   passable  – whether the player can walk on this tile
 *   speedMod  – movement speed multiplier (0 = impassable check is via passable)
 *   animated  – true for tiles that get a per-frame colour variation (water)
 */
const T = {
  DEEP_WATER:    { id: 0, name: '深水',  color: '#1b4f72', passable: false, speedMod: 0.0, animated: true  },
  SHALLOW_WATER: { id: 1, name: '淺水',  color: '#2471a3', passable: false, speedMod: 0.0, animated: true  },
  SAND:          { id: 2, name: '沙灘',  color: '#f9e79f', passable: true,  speedMod: 0.7, animated: false },
  GRASS:         { id: 3, name: '草地',  color: '#27ae60', passable: true,  speedMod: 1.0, animated: false },
  FOREST:        { id: 4, name: '森林',  color: '#1e8449', passable: true,  speedMod: 0.6, animated: false },
  MOUNTAIN:      { id: 5, name: '山地',  color: '#7f8c8d', passable: true,  speedMod: 0.4, animated: false },
  SNOW:          { id: 6, name: '雪峰',  color: '#d6eaf8', passable: false, speedMod: 0.0, animated: false },
};

// Thresholds are checked in order; first match wins (noise value is in [0, 1])
const HEIGHT_THRESHOLDS = [
  [0.27, T.DEEP_WATER   ],
  [0.37, T.SHALLOW_WATER],
  [0.44, T.SAND         ],
  [0.63, T.GRASS        ],
  [0.73, T.FOREST       ],
  [0.84, T.MOUNTAIN     ],
  [1.00, T.SNOW         ],
];

function getTerrainByHeight(h) {
  for (const [max, terrain] of HEIGHT_THRESHOLDS) {
    if (h <= max) return terrain;
  }
  return T.SNOW;
}

// ── Colour utility helpers ────────────────────────────────────────────────────
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lightenColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.min(255, r + amount)},${Math.min(255, g + amount)},${Math.min(255, b + amount)})`;
}

function darkenColor(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return `rgb(${Math.max(0, r - amount)},${Math.max(0, g - amount)},${Math.max(0, b - amount)})`;
}

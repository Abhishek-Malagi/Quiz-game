export const GAME_SETTINGS = {
    PLAYER_SPEED: 200,
    JUMP_VELOCITY: -450,
    TILE_SPACING: 180,
    AUTO_SCROLL_SPEED: 0.8,
    LIVES: 3,
    POINTS_PER_CORRECT: 10
};
export const MOBILE_GAME_SETTINGS = {
    JUMP_VELOCITY: -600,      // Higher jump for mobile
    TILE_SPACING: 280,        // More space for mobile
};

export const ASSETS = {
    IMAGES: {
        PLAYER_IDLE: '/assets/images/characters/character_beige_idle.png',
        PLAYER_JUMP: '/assets/images/characters/character_beige_jump.png',
        PLAYER_WALK_A: '/assets/images/characters/character_beige_walk_a.png',
        PLAYER_WALK_B: '/assets/images/characters/character_beige_walk_b.png',
        GROUND_PLATFORM: '/assets/images/platforms/tile_0156.png',
        TILE_0153: '/assets/images/platforms/tile_0153.png',
        TILE_0154: '/assets/images/platforms/tile_0154.png',
        TILE_0155: '/assets/images/platforms/tile_0155.png',
        BACKGROUND: '/assets/images/backgrounds/background_solid_sky.png',
        HUD_HEART: '/assets/images/effects/hud_heart.png',
        HUD_HEART_EMPTY: '/assets/images/effects/hud_heart_empty.png'
    }
};

export const COLORS = {
    PRIMARY: '#4CAF50',
    SECONDARY: '#2196F3',
    SUCCESS: '#4CAF50',
    ERROR: '#FF5722',
    WARNING: '#FF9800',
    INFO: '#2196F3',
    GOLD: '#FFD700'
};

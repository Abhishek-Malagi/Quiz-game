import Phaser from 'phaser';
import { GAME_SETTINGS, MOBILE_GAME_SETTINGS } from '../utils/constants';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, scale = 1, isMobile = false) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.responsiveScale = scale;
        this.gameWidth = scene.gameWidth || 800;
        this.gameHeight = scene.gameHeight || 600;
        this.isMobile = isMobile;

        this.setBounce(0);
        this.setDepth(2000);

        const playerScale = this.calculatePlayerScale();
        this.setScale(playerScale);

        const bodyW = Math.max(16 * this.responsiveScale, 12);
        const bodyH = Math.max(18 * this.responsiveScale, 14);
        const offsetX = Math.max(12 * this.responsiveScale, 10);
        const offsetY = Math.max(32 * this.responsiveScale, 24);

        this.body.setSize(bodyW, bodyH);
        this.body.setOffset(offsetX, offsetY);

        this.createAdvancedTrail();
        this.justLanded = false;
        this.landingCooldown = 0;
        this.canJump = true;
        this.isOnSafeTile = false;
        this.forceStayGrounded = false;
    }

    getCurrentGameSettings() {
        if (this.isMobile) {
            return { ...GAME_SETTINGS, ...MOBILE_GAME_SETTINGS };
        }
        return GAME_SETTINGS;
    }

    calculatePlayerScale() {
        if (this.gameWidth <= 736) {
            return Math.max(0.15 * this.responsiveScale, 0.12);
        } else if (this.gameWidth <= 1024) {
            return Math.max(0.18 * this.responsiveScale, 0.15);
        } else if (this.gameWidth <= 1200) {
            return Math.max(0.20 * this.responsiveScale, 0.18);
        } else {
            return Math.max(0.22 * this.responsiveScale, 0.20);
        }
    }

    updateResponsiveScale(newScale, gameWidth, gameHeight, isMobile) {
        this.responsiveScale = newScale;
        this.gameWidth = gameWidth || 800;
        this.gameHeight = gameHeight || 600;
        this.isMobile = isMobile;

        const playerScale = this.calculatePlayerScale();
        this.setScale(playerScale);

        const bodyW = Math.max(16 * this.responsiveScale, 12);
        const bodyH = Math.max(18 * this.responsiveScale, 14);
        const offsetX = Math.max(12 * this.responsiveScale, 10);
        const offsetY = Math.max(32 * this.responsiveScale, 24);

        this.body.setSize(bodyW, bodyH);
        this.body.setOffset(offsetX, offsetY);
    }

    createAdvancedTrail() {
        this.trail = [];
        this.trailLength = Math.max(8 * this.responsiveScale, 6);
        this.trailParticles = [];
    }

    jump() {
        if (this.body.touching.down && this.canJump && this.landingCooldown <= 0) {
            const settings = this.getCurrentGameSettings();
            const jumpVelocity = settings.JUMP_VELOCITY * this.responsiveScale;
            this.setVelocityY(jumpVelocity);
            this.justLanded = false;
            this.canJump = false;
            this.landingCooldown = 1;
            this.isOnSafeTile = false;
            this.forceStayGrounded = false;
            this.createProfessionalJumpEffect();
            return true;
        }
        return false;
    }

    createProfessionalJumpEffect() {
        const colors = [0x4CAF50, 0x2196F3, 0xFFD700, 0xFF5722];
        const count = this.isMobile ? Math.max(8 * this.responsiveScale, 6) : Math.max(6 * this.responsiveScale, 4);
        const particleSize = this.isMobile ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(2, 3);
        const offsetY = this.isMobile ? 15 * this.responsiveScale : 12 * this.responsiveScale;
        
        for (let i = 0; i < count; i++) {
            const p = this.scene.add.circle(
                this.x + Phaser.Math.Between(-10 * this.responsiveScale, 10 * this.responsiveScale),
                this.y + offsetY,
                particleSize * this.responsiveScale,
                colors[Math.floor(Math.random() * colors.length)],
                this.isMobile ? 0.7 : 0.5
            ).setDepth(1900);
            
            const moveY = this.isMobile ? Phaser.Math.Between(20, 40) : Phaser.Math.Between(15, 30);
            const moveX = this.isMobile ? Phaser.Math.Between(-20, 20) : Phaser.Math.Between(-15, 15);
            
            this.scene.tweens.add({
                targets: p,
                y: p.y + moveY * this.responsiveScale,
                x: p.x + moveX * this.responsiveScale,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: this.isMobile ? 500 : 400,
                ease: 'Power2',
                onComplete: () => p.destroy()
            });
        }
        
        const shockSize = this.isMobile ? Math.max(8 * this.responsiveScale, 6) : Math.max(6 * this.responsiveScale, 4);
        const shockOffsetY = this.isMobile ? 12 * this.responsiveScale : 10 * this.responsiveScale;
        const shock = this.scene.add.circle(
            this.x,
            this.y + shockOffsetY,
            shockSize,
            0x87CEEB,
            this.isMobile ? 0.2 : 0.15
        ).setDepth(1800);
        
        this.scene.tweens.add({
            targets: shock,
            scaleX: this.isMobile ? 2.0 : 1.8,
            scaleY: this.isMobile ? 1.2 : 1.1,
            alpha: 0,
            duration: this.isMobile ? 250 : 200,
            ease: 'Power2',
            onComplete: () => shock.destroy()
        });
    }

    moveLeft() {
        const speed = GAME_SETTINGS.PLAYER_SPEED * this.responsiveScale;
        this.setVelocityX(-speed);
        try {
            this.setTexture('player_walk_a');
        } catch (error) {
            // Fallback if texture doesn't exist
        }
        this.setFlipX(true);
        this.createMovementTrail();
    }

    moveRight() {
        const speed = GAME_SETTINGS.PLAYER_SPEED * this.responsiveScale;
        this.setVelocityX(speed);
        try {
            this.setTexture('player_walk_b');
        } catch (error) {
            // Fallback if texture doesn't exist
        }
        this.setFlipX(false);
        this.createMovementTrail();
    }

    stop() {
        this.setVelocityX(0);
        try {
            this.setTexture('player');
        } catch (error) {
            // Fallback if texture doesn't exist
        }
    }

    createMovementTrail() {
        const trailChance = this.isMobile ? 0.2 : 0.15;
        if (Math.random() < trailChance) {
            const ts = this.isMobile ? Math.max(1.5 * this.responsiveScale, 1) : Math.max(1 * this.responsiveScale, 0.5);
            const offsetRange = this.isMobile ? 3 : 2;
            const yRange = this.isMobile ? [8, 12] : [6, 10];
            
            const trail = this.scene.add.circle(
                this.x + Phaser.Math.Between(-offsetRange * this.responsiveScale, offsetRange * this.responsiveScale),
                this.y + Phaser.Math.Between(yRange[0] * this.responsiveScale, yRange[1] * this.responsiveScale),
                ts, 0x87CEEB, this.isMobile ? 0.3 : 0.25
            ).setDepth(1800);
            
            this.scene.tweens.add({
                targets: trail,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: this.isMobile ? 300 : 250,
                onComplete: () => trail.destroy()
            });
        }
    }

    landOnTile(tile) {
        const landingOffset = this.isMobile ? 45 : 38;
        this.setY(tile.y - (landingOffset * this.responsiveScale));
        this.setVelocity(0, 0);
        this.body.setVelocity(0, 0);
        this.justLanded = true;
        this.canJump = false;
        this.landingCooldown = 1;
        this.isOnSafeTile = tile && (tile.isSolidPlatform || tile.hasBeenHit);
        this.forceStayGrounded = false;
    }

    update() {
        if (this.landingCooldown > 0) {
            this.landingCooldown--;
        } else {
            this.canJump = true;
        }
        
        const boundOffset = this.isMobile ? 40 : 30;
        const leftBound = Math.max(boundOffset * this.responsiveScale, 25);
        const rightBound = this.gameWidth - leftBound;
        
        if (this.x < leftBound) this.x = leftBound;
        if (this.x > rightBound) this.x = rightBound;
        
        this.updateAdvancedTrail();
    }

    updateAdvancedTrail() {
        this.trail.unshift({ x: this.x, y: this.y, time: this.scene.time.now });
        if (this.trail.length > this.trailLength) this.trail.pop();
        
        this.trailParticles.forEach((p, i) => {
            if (p.alpha <= 0) {
                p.destroy();
                this.trailParticles.splice(i, 1);
            }
        });
    }
}

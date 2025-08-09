import Phaser from 'phaser';

export default class Tile extends Phaser.GameObjects.Container {
    constructor(scene, x, y, option, isCorrect, scale = 1, gameWidth = 800, gameHeight = 600, isMobile = false) {
        super(scene, x, y);
        scene.add.existing(this);

        this.isCorrect = isCorrect;
        this.option = option;
        this.hasBeenHit = false;
        this.isHardPlatform = false;
        this.isPermanentPlatform = false;
        this.isSolidPlatform = false;
        this.isDestroyed = false;
        this.responsiveScale = scale;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.isMobile = isMobile;
        this.setDepth(20);

        this.tileWidth = this.calculateTileWidth();
        this.tileHeight = this.calculateTileHeight();

        this.createResponsiveTileVisuals();
    }

    calculateTileWidth() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(130 * this.responsiveScale, 110);
            } else if (this.gameWidth <= 768) {
                return Math.max(150 * this.responsiveScale, 130);
            } else if (this.gameWidth <= 1024) {
                return Math.max(170 * this.responsiveScale, 150);
            } else {
                return Math.max(180 * this.responsiveScale, 160);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(100 * this.responsiveScale, 80);
            } else if (this.gameWidth <= 1024) {
                return Math.max(120 * this.responsiveScale, 100);
            } else {
                return Math.max(140 * this.responsiveScale, 120);
            }
        }
    }

    calculateTileHeight() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(60 * this.responsiveScale, 50);
            } else if (this.gameWidth <= 768) {
                return Math.max(70 * this.responsiveScale, 60);
            } else if (this.gameWidth <= 1024) {
                return Math.max(80 * this.responsiveScale, 70);
            } else {
                return Math.max(85 * this.responsiveScale, 75);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(45 * this.responsiveScale, 35);
            } else if (this.gameWidth <= 1024) {
                return Math.max(55 * this.responsiveScale, 45);
            } else {
                return Math.max(60 * this.responsiveScale, 50);
            }
        }
    }

    updateResponsiveScale(newScale, gameWidth, gameHeight, isMobile) {
        this.responsiveScale = newScale;
        this.gameWidth = gameWidth || 800;
        this.gameHeight = gameHeight || 600;
        this.isMobile = isMobile;
        this.tileWidth = this.calculateTileWidth();
        this.tileHeight = this.calculateTileHeight();

        this.removeAll(true);
        this.createResponsiveTileVisuals();
    }

    createResponsiveTileVisuals() {
        const glowSize = this.calculateGlowSize();
        const glowAlpha = this.isMobile ? 0.15 : 0.1;
        this.outerGlow = this.scene.add.circle(0, 0, glowSize, 0x87CEEB, glowAlpha);
        this.innerGlow = this.scene.add.circle(0, 0, glowSize * 0.6, 0xFFFFFF, this.isMobile ? 0.08 : 0.05);
        this.add([this.outerGlow, this.innerGlow]);

        this.scene.tweens.add({
            targets: [this.outerGlow, this.innerGlow],
            alpha: this.isMobile ? 0.25 : 0.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const tileScale = this.calculateTileScale();
        const tileOffsetY = this.isMobile ? 12 * this.responsiveScale : 10 * this.responsiveScale;
        const tileSpacing = this.isMobile ? 20 * tileScale : 18 * tileScale;

        try {
            this.tile1 = this.scene.add.image(-tileSpacing, tileOffsetY, 'tile_0153').setScale(tileScale);
            this.tile2 = this.scene.add.image(0, tileOffsetY, 'tile_0154').setScale(tileScale);
            this.tile3 = this.scene.add.image(tileSpacing, tileOffsetY, 'tile_0155').setScale(tileScale);

            // UPDATED: Make all tiles the same blue color (removed correct tile special tint)
            this.tile1.setTint(0x4169E1); // Royal Blue
            this.tile2.setTint(0x4169E1); // Royal Blue
            this.tile3.setTint(0x4169E1); // Royal Blue

            // REMOVED: Sparkle effect for correct tiles
            // if (this.isCorrect) {
            //     this.createSparkleEffect();
            // }

            this.add([this.tile1, this.tile2, this.tile3]);
        } catch (error) {
            const fallbackTile = this.scene.add.graphics();
            // UPDATED: Use blue color for fallback tiles too
            fallbackTile.fillGradientStyle(0x4169E1, 0x1E3A8A, 0x1E3A8A, 0x4169E1);
            const width = this.tileWidth * 0.8;
            const height = this.tileHeight * 0.6;
            const cornerRadius = this.isMobile ? 10 : 8;
            fallbackTile.fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
            this.add(fallbackTile);
        }

        const bgWidth = this.calculateTextBgWidth();
        const bgHeight = this.calculateTextBgHeight();
        const bgOffsetY = this.isMobile ? -50 * this.responsiveScale : -40 * this.responsiveScale;
        const bgAlpha = this.isMobile ? 0.98 : 0.95;
        const borderRadius = this.isMobile ? 15 : 12;
        const borderThickness = this.isMobile ? 3 * this.responsiveScale : 2 * this.responsiveScale;

        this.textBg = this.scene.add.graphics();
        this.textBg.fillGradientStyle(0xFFFFFF, 0xF5F5F5, 0xF0F0F0, 0xFFFFFF, bgAlpha);
        this.textBg.fillRoundedRect(-bgWidth / 2, bgOffsetY, bgWidth, bgHeight, borderRadius);
        // UPDATED: Use blue border for all tiles (removed special green border for correct tiles)
        this.textBg.lineStyle(borderThickness, 0x2196F3, 1);
        this.textBg.strokeRoundedRect(-bgWidth / 2, bgOffsetY, bgWidth, bgHeight, borderRadius);
        this.add(this.textBg);

        const fontSize = this.calculateFontSize();
        const textOffsetY = this.isMobile ? -35 * this.responsiveScale : -28 * this.responsiveScale;
        const textStyle = {
            fontSize: `${fontSize}px`,
            fill: this.isMobile ? '#1a1a1a' : '#2C3E50',
            align: 'center',
            wordWrap: { width: bgWidth * 0.85 },
            fontWeight: this.isMobile ? '900' : 'bold',
            fontFamily: 'Arial Black'
        };

        this.text = this.scene.add.text(0, textOffsetY, this.option, textStyle).setOrigin(0.5);
        this.add(this.text);

        const floatAmount = this.isMobile ? Math.max(3 * this.responsiveScale, 2) : Math.max(2 * this.responsiveScale, 1);
        this.scene.tweens.add({
            targets: this,
            y: this.y + floatAmount,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    calculateGlowSize() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(80 * this.responsiveScale, 60);
            } else if (this.gameWidth <= 768) {
                return Math.max(95 * this.responsiveScale, 75);
            } else if (this.gameWidth <= 1024) {
                return Math.max(110 * this.responsiveScale, 90);
            } else {
                return Math.max(120 * this.responsiveScale, 100);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(60 * this.responsiveScale, 40);
            } else if (this.gameWidth <= 1024) {
                return Math.max(70 * this.responsiveScale, 50);
            } else {
                return Math.max(80 * this.responsiveScale, 60);
            }
        }
    }

    calculateTileScale() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(0.7 * this.responsiveScale, 0.6);
            } else if (this.gameWidth <= 768) {
                return Math.max(0.85 * this.responsiveScale, 0.7);
            } else if (this.gameWidth <= 1024) {
                return Math.max(1.0 * this.responsiveScale, 0.85);
            } else {
                return Math.max(1.1 * this.responsiveScale, 0.9);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(0.5 * this.responsiveScale, 0.4);
            } else if (this.gameWidth <= 1024) {
                return Math.max(0.65 * this.responsiveScale, 0.5);
            } else {
                return Math.max(0.8 * this.responsiveScale, 0.6);
            }
        }
    }

    calculateTextBgWidth() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(160 * this.responsiveScale, 130);
            } else if (this.gameWidth <= 768) {
                return Math.max(180 * this.responsiveScale, 150);
            } else if (this.gameWidth <= 1024) {
                return Math.max(200 * this.responsiveScale, 170);
            } else {
                return Math.max(220 * this.responsiveScale, 190);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(90 * this.responsiveScale, 70);
            } else if (this.gameWidth <= 1024) {
                return Math.max(110 * this.responsiveScale, 90);
            } else {
                return Math.max(120 * this.responsiveScale, 100);
            }
        }
    }

    calculateTextBgHeight() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(50 * this.responsiveScale, 40);
            } else if (this.gameWidth <= 768) {
                return Math.max(58 * this.responsiveScale, 48);
            } else if (this.gameWidth <= 1024) {
                return Math.max(65 * this.responsiveScale, 55);
            } else {
                return Math.max(70 * this.responsiveScale, 60);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(20 * this.responsiveScale, 16);
            } else if (this.gameWidth <= 1024) {
                return Math.max(22 * this.responsiveScale, 18);
            } else {
                return Math.max(24 * this.responsiveScale, 20);
            }
        }
    }

    calculateFontSize() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(16 * this.responsiveScale, 14);
            } else if (this.gameWidth <= 768) {
                return Math.max(18 * this.responsiveScale, 16);
            } else if (this.gameWidth <= 1024) {
                return Math.max(20 * this.responsiveScale, 18);
            } else {
                return Math.max(22 * this.responsiveScale, 20);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(8 * this.responsiveScale, 7);
            } else if (this.gameWidth <= 1024) {
                return Math.max(10 * this.responsiveScale, 8);
            } else {
                return Math.max(12 * this.responsiveScale, 10);
            }
        }
    }

    // createSparkleEffect() {
    //     this.sparkleTimer = this.scene.time.addEvent({
    //         delay: 1500,
    //         callback: () => {
    //             if (!this.hasBeenHit) {
    //                 const sparkleSize = this.isMobile ? Math.max(3 * this.responsiveScale, 2) : Math.max(2 * this.responsiveScale, 1);
    //                 const sparkleRange = this.isMobile ? 35 : 30;
    //                 const sparkle = this.scene.add.circle(
    //                     this.x + Phaser.Math.Between(-sparkleRange * this.responsiveScale, sparkleRange * this.responsiveScale),
    //                     this.y + Phaser.Math.Between(-25 * this.responsiveScale, 25 * this.responsiveScale),
    //                     sparkleSize,
    //                     0xFFD700,
    //                     this.isMobile ? 0.9 : 0.8
    //                 ).setDepth(25);

    //                 this.scene.tweens.add({
    //                     targets: sparkle,
    //                     alpha: 0,
    //                     scaleX: this.isMobile ? 2.5 : 2,
    //                     scaleY: this.isMobile ? 2.5 : 2,
    //                     duration: this.isMobile ? 1200 : 1000,
    //                     ease: 'Power2',
    //                     onComplete: () => sparkle.destroy()
    //                 });
    //             }
    //         },
    //         loop: true
    //     });
    // }

    makeHardPlatform(scene) {
        if (!this.isHardPlatform) {
            const platformY = this.y - (this.isMobile ? 35 : 26) * this.responsiveScale;
            const scaleX = this.calculatePlatformScaleX();
            const scaleY = this.calculatePlatformScaleY();

            try {
                this.hardPlatform = scene.physics.add.staticSprite(
                    this.x,
                    platformY,
                    'ground_platform'
                )
                    .setScale(scaleX, scaleY)
                    .setDepth(15)
                    .setAlpha(this.isMobile ? 0.15 : 0.1)
                    .setTint(this.isSolidPlatform ? 0xFFD700 : 0x4CAF50);
            } catch (error) {
                this.hardPlatform = scene.physics.add.staticSprite(
                    this.x,
                    platformY,
                    null
                )
                    .setScale(scaleX, scaleY)
                    .setDepth(15)
                    .setAlpha(this.isMobile ? 0.15 : 0.1);
            }

            if (this.hardPlatform.body) {
                const bodyWidth = this.calculatePlatformBodyWidth();
                const bodyHeight = this.calculatePlatformBodyHeight();
                this.hardPlatform.body.setSize(bodyWidth, bodyHeight);
                this.hardPlatform.body.enable = true;
            }

            this.isHardPlatform = true;
            this.isPermanentPlatform = true;

            return this.hardPlatform;
        }
        return null;
    }

    calculatePlatformScaleX() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(1.4 * this.responsiveScale, 1.1);
            } else if (this.gameWidth <= 768) {
                return Math.max(1.6 * this.responsiveScale, 1.3);
            } else if (this.gameWidth <= 1024) {
                return Math.max(1.8 * this.responsiveScale, 1.5);
            } else {
                return Math.max(2.0 * this.responsiveScale, 1.7);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(1.0 * this.responsiveScale, 0.8);
            } else if (this.gameWidth <= 1024) {
                return Math.max(1.2 * this.responsiveScale, 1.0);
            } else {
                return Math.max(1.3 * this.responsiveScale, 1.1);
            }
        }
    }

    calculatePlatformScaleY() {
        return this.isMobile ? Math.max(0.8 * this.responsiveScale, 0.6) : Math.max(0.6 * this.responsiveScale, 0.4);
    }

    calculatePlatformBodyWidth() {
        if (this.isMobile) {
            if (this.gameWidth <= 480) {
                return Math.max(130 * this.responsiveScale, 110);
            } else if (this.gameWidth <= 768) {
                return Math.max(150 * this.responsiveScale, 130);
            } else if (this.gameWidth <= 1024) {
                return Math.max(170 * this.responsiveScale, 150);
            } else {
                return Math.max(180 * this.responsiveScale, 160);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(100 * this.responsiveScale, 80);
            } else if (this.gameWidth <= 1024) {
                return Math.max(120 * this.responsiveScale, 100);
            } else {
                return Math.max(130 * this.responsiveScale, 110);
            }
        }
    }

    calculatePlatformBodyHeight() {
        return this.isMobile ? Math.max(20 * this.responsiveScale, 16) : Math.max(15 * this.responsiveScale, 12);
    }

    shouldRemainSolid() {
        return this.isSolidPlatform || (this.isPermanentPlatform && this.isCorrect && this.hasBeenHit);
    }

    destroy() {
        // UPDATED: Remove sparkle timer check since we removed sparkle effects
        // if (this.sparkleTimer) {
        //     this.sparkleTimer.destroy();
        // }

        if (this.hardPlatform && !this.isPermanentPlatform && !this.isSolidPlatform) {
            this.hardPlatform.destroy();
        }

        super.destroy();
    }
}

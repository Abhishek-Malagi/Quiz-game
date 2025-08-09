import Player from '../entities/Player';
import Tile from '../entities/Tile';
import { QUIZ_QUESTIONS, shuffleArray } from '../utils/questions';
import { GAME_SETTINGS, MOBILE_GAME_SETTINGS } from '../utils/constants';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.touchControls = {
            moveLeft: false,
            moveRight: false,
            jump: false
        };
    }

    create() {
        this.score = 0;
        this.lives = GAME_SETTINGS.LIVES;
        this.currentQuestion = 0;
        this.gameState = 'playing';
        this.allTileGroups = [];
        this.completedQuestionLevels = new Set();
        this.hardPlatformGroup = this.physics.add.staticGroup();
        this.groundPlatformY = 520;
        this.playerStartY = this.groundPlatformY - 38;
        this.autoScrollSpeed = 0;
        this.maxLevel = 0;
        this.jumpKeyWasPressed = false;
        this.gameStarted = false;
        this.responsiveScale = this.responsiveScale || 1;
        this.gameWidth = this.gameWidth || 800;
        this.gameHeight = this.gameHeight || 600;

        // Detect if mobile device based on screen size
        this.isMobileDevice = this.detectMobileDevice();

        this.currentBgLevel = 0;

        this.createBackground();
        this.createPlayer();
        this.createPlatforms();
        this.createUI();
        this.setupControls();
        this.setupCamera();
        this.generateQuestionLevels();

        // Show touch controls after first input
        this.input.once('pointerdown', () => {
            if (this.showTouchControls) {
                this.showTouchControls();
            }
        });
    }

    detectMobileDevice() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const maxDimension = Math.max(screenWidth, screenHeight);

        // Mobile if max dimension is 1024 or less, or has touch
        return (
            maxDimension <= 1024 ||
            ('ontouchstart' in window)
        );
    }

    getCurrentGameSettings() {
        if (this.isMobileDevice) {
            return { ...GAME_SETTINGS, ...MOBILE_GAME_SETTINGS };
        }
        return GAME_SETTINGS;
    }

    handleTouchInput(action) {
        switch (action) {
            case 'moveLeft':
                this.touchControls.moveLeft = true;
                this.touchControls.moveRight = false;
                break;
            case 'moveRight':
                this.touchControls.moveRight = true;
                this.touchControls.moveLeft = false;
                break;
            case 'stopMove':
                this.touchControls.moveLeft = false;
                this.touchControls.moveRight = false;
                break;
            case 'jump':
                this.touchControls.jump = true;
                if (!this.gameStarted) {
                    this.gameStarted = true;
                    this.startAutoScroll();
                    if (this.startInstruction) {
                        const ref = this.startInstruction;
                        this.startInstruction = null;
                        this.tweens.add({
                            targets: ref,
                            alpha: 0,
                            scaleX: 0,
                            scaleY: 0,
                            duration: 250,
                            onComplete: () => {
                                if (ref && ref.destroy) ref.destroy();
                            }
                        });
                    }
                }
                this.player.jump();
                this.time.delayedCall(100, () => {
                    this.touchControls.jump = false;
                });
                break;
        }
    }

    updateResponsiveScale(newScale, gameWidth, gameHeight) {
        this.responsiveScale = newScale;
        this.gameWidth = gameWidth || 800;
        this.gameHeight = gameHeight || 600;
        this.isMobileDevice = this.detectMobileDevice();

        this.updateUILayout();

        if (this.player && this.player.updateResponsiveScale) {
            this.player.updateResponsiveScale(newScale, gameWidth, gameHeight, this.isMobileDevice);
        }

        this.allTileGroups.forEach(tileGroup => {
            tileGroup.tiles.forEach(tile => {
                if (tile.updateResponsiveScale) {
                    tile.updateResponsiveScale(newScale, gameWidth, gameHeight, this.isMobileDevice);
                }
            });
        });
    }

    createBackground() {
        this.backgroundLayers = [];

        // Layer 0: Sky (Levels 1-5)
        this.skyBg = this.add.graphics();
        this.skyBg.fillGradientStyle(0x78bfff, 0xbfdff7, 0xd6ebfa, 0xf5fcff);
        this.skyBg.fillRect(0, -10000, this.gameWidth, 20000).setDepth(-100);
        this.backgroundLayers.push(this.skyBg);

        // Layer 1: High Atmosphere (Levels 6-10)
        this.atmosphereBg = this.add.graphics();
        this.atmosphereBg.fillGradientStyle(0x4a90e2, 0x2c5aa0, 0x1e3a5f, 0x0f1419);
        this.atmosphereBg.fillRect(0, -10000, this.gameWidth, 20000).setDepth(-100).setAlpha(0);
        this.backgroundLayers.push(this.atmosphereBg);

        // Layer 2: Near Space (Levels 11-15)  
        this.nearSpaceBg = this.add.graphics();
        this.nearSpaceBg.fillGradientStyle(0x1a237e, 0x0d1421, 0x000051, 0x000000);
        this.nearSpaceBg.fillRect(0, -10000, this.gameWidth, 20000).setDepth(-100).setAlpha(0);
        this.backgroundLayers.push(this.nearSpaceBg);

        // Layer 3: Deep Space (Levels 16-20)
        this.deepSpaceBg = this.add.graphics();
        this.deepSpaceBg.fillGradientStyle(0x000000, 0x0a0a0a, 0x1a0033, 0x000000);
        this.deepSpaceBg.fillRect(0, -10000, this.gameWidth, 20000).setDepth(-100).setAlpha(0);
        this.backgroundLayers.push(this.deepSpaceBg);

        this.createStarsForSpace();
    }

    createStarsForSpace() {
        this.stars = [];

        for (let i = 0; i < 100; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, this.gameWidth),
                Phaser.Math.Between(-10000, 10000),
                Phaser.Math.Between(1, 3),
                0xFFFFFF,
                Phaser.Math.Between(0.3, 0.9)
            ).setDepth(-90).setAlpha(0);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.Between(0.1, 1),
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.stars.push(star);
        }
    }

    // UPDATED: Dynamic background based on player's current position
    updateBackgroundForPlayerPosition() {
        // Calculate which level the player is currently at based on Y position
        const settings = this.getCurrentGameSettings();
        const questionSpacing = (settings.TILE_SPACING + 80) * this.responsiveScale;
        const firstQuestionY = this.playerStartY - (questionSpacing - 50);

        // Find current level based on player Y position
        let currentLevel = 1;
        if (this.player.y < firstQuestionY) {
            currentLevel = Math.floor((firstQuestionY - this.player.y) / questionSpacing) + 1;
            currentLevel = Math.max(1, Math.min(20, currentLevel));
        }

        let targetBgLevel;
        if (currentLevel <= 5) {
            targetBgLevel = 0;
        } else if (currentLevel <= 10) {
            targetBgLevel = 1;
        } else if (currentLevel <= 15) {
            targetBgLevel = 2;
        } else {
            targetBgLevel = 3;
        }

        if (targetBgLevel !== this.currentBgLevel) {
            this.transitionToBackground(targetBgLevel);
            this.currentBgLevel = targetBgLevel;
        }
    }

    updateBackgroundForLevel(level) {
        let targetBgLevel;
        if (level <= 5) {
            targetBgLevel = 0;
        } else if (level <= 10) {
            targetBgLevel = 1;
        } else if (level <= 15) {
            targetBgLevel = 2;
        } else {
            targetBgLevel = 3;
        }

        if (targetBgLevel !== this.currentBgLevel) {
            this.transitionToBackground(targetBgLevel);
            this.currentBgLevel = targetBgLevel;
        }
    }

    transitionToBackground(newBgLevel) {
        if (this.backgroundLayers[this.currentBgLevel]) {
            this.tweens.add({
                targets: this.backgroundLayers[this.currentBgLevel],
                alpha: 0,
                duration: 1000,
                ease: 'Power2.easeOut'
            });
        }

        if (this.backgroundLayers[newBgLevel]) {
            this.tweens.add({
                targets: this.backgroundLayers[newBgLevel],
                alpha: 1,
                duration: 1000,
                ease: 'Power2.easeIn'
            });
        }

        if (newBgLevel >= 2) {
            this.stars.forEach(star => {
                this.tweens.add({
                    targets: star,
                    alpha: Phaser.Math.Between(0.3, 0.9),
                    duration: 1500,
                    ease: 'Power2.easeIn'
                });
            });
        } else {
            this.stars.forEach(star => {
                this.tweens.add({
                    targets: star,
                    alpha: 0,
                    duration: 1500,
                    ease: 'Power2.easeOut'
                });
            });
        }

        // this.showBackgroundTransitionMessage(newBgLevel);
    }

    showBackgroundTransitionMessage(bgLevel) {
        const messages = [
            '🌤️ Sky Level!',
            '🌌 High Atmosphere!',
            '🚀 Near Space!',
            '🌟 Deep Space!'
        ];

        const colors = [
            '#4a90e2',
            '#2c5aa0',
            '#1a237e',
            '#FFD700'
        ];

        const fontSize = this.isMobileDevice ? Math.max(24 * this.responsiveScale, 20) : Math.max(20 * this.responsiveScale, 16);
        const message = this.add.text(this.gameWidth / 2, this.gameHeight * 0.3, messages[bgLevel], {
            fontSize: `${fontSize}px`,
            fill: colors[bgLevel],
            fontFamily: 'Arial Black',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1500);

        this.tweens.add({
            targets: message,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            ease: 'Back.easeOut'
        });

        this.tweens.add({
            targets: message,
            alpha: 0,
            y: this.gameHeight * 0.25,
            duration: 3000,
            delay: 1000,
            ease: 'Power2.easeOut',
            onComplete: () => message.destroy()
        });
    }

    createPlayer() {
        this.player = new Player(this, this.gameWidth / 2, this.playerStartY, this.responsiveScale, this.isMobileDevice);
        this.player.gameWidth = this.gameWidth;
        this.player.gameHeight = this.gameHeight;
        this.player.setDepth(2000);
    }

    createPlatforms() {
        this.groundPlatform = this.physics.add.staticGroup();
        const platformScale = Math.max(2.8 * this.responsiveScale, 2);
        this.groundPlatformSprite = this.groundPlatform.create(this.gameWidth / 2, this.groundPlatformY - 12, 'ground_platform')
            .setScale(platformScale, 0.2)
            .setAlpha(0)
            .refreshBody()
            .setDepth(5);
        this.groundPlatformSprite.body.setSize(280 * this.responsiveScale, 12);
        this.physics.add.collider(this.player, this.groundPlatform);
        this.physics.add.collider(this.player, this.hardPlatformGroup);
    }

    createUI() {
        this.createUIElements();
    }

    createUIElements() {
        const safeAreaTop = this.isMobileDevice ? Math.max(40, this.gameHeight * 0.08) : Math.max(20, this.gameHeight * 0.05);
        const safeAreaLeft = this.isMobileDevice ? Math.max(30, this.gameWidth * 0.06) : Math.max(20, this.gameWidth * 0.05);
        const safeAreaRight = this.gameWidth - safeAreaLeft;

        const questionFontSize = this.calculateQuestionFontSize();
        const questionY = safeAreaTop + questionFontSize + (this.isMobileDevice ? 15 : 0);

        // UPDATED: Enhanced question box with more height for level and question gap
        const questionBoxWidth = this.gameWidth * 0.92;
        const questionBoxHeight = questionFontSize * 3.2; // Increased height for gap

        this.questionBox = this.add.graphics();
        this.questionBox.fillStyle(0x000000, 0.85); // Semi-transparent black background
        this.questionBox.lineStyle(3, 0x4CAF50, 0.9); // Green border
        this.questionBox.fillRoundedRect(
            this.gameWidth / 2 - questionBoxWidth / 2,
            questionY - questionBoxHeight / 2 - 5,
            questionBoxWidth,
            questionBoxHeight,
            12
        );
        this.questionBox.strokeRoundedRect(
            this.gameWidth / 2 - questionBoxWidth / 2,
            questionY - questionBoxHeight / 2 - 5,
            questionBoxWidth,
            questionBoxHeight,
            12
        );
        this.questionBox.setScrollFactor(0).setDepth(101);

        // UPDATED: Level text inside question box at the top
        const levelFontSize = Math.max(questionFontSize * 0.7, 12);
        this.levelText = this.add.text(this.gameWidth / 2, questionY - questionFontSize * 0.8, 'Level 1', {
            fontSize: `${levelFontSize}px`,
            fill: '#4CAF50', // Green color to match border
            fontFamily: 'Arial Black',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(103);

        // UPDATED: Question text positioned below level with gap
        const questionTextStyle = {
            fontSize: `${questionFontSize}px`,
            fill: '#FFFFFF', // White for better contrast
            fontFamily: 'Arial Black',
            wordWrap: { width: this.gameWidth * 0.85 },
            fontWeight: this.isMobileDevice ? '900' : 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        };

        this.questionText = this.add.text(this.gameWidth / 2, questionY + questionFontSize * 0.3, '', questionTextStyle)
            .setOrigin(0.5).setScrollFactor(0).setDepth(102);

        const topUIFontSize = this.calculateTopUIFontSize();
        const topUIY = safeAreaTop;

        const topUIStyle = {
            fontSize: `${topUIFontSize}px`,
            fontWeight: 'bold',
            fontFamily: 'Arial Black'
        };

        if (this.isMobileDevice) {
            topUIStyle.stroke = '#fff';
            topUIStyle.strokeThickness = 2;
        }

        this.scoreText = this.add.text(safeAreaLeft, topUIY, `💰${this.score}`, {
            ...topUIStyle,
            fill: '#1565c0'
        }).setOrigin(0, 0).setScrollFactor(0).setDepth(103);

        this.livesText = this.add.text(safeAreaRight, topUIY, `❤️x${this.lives}`, {
            ...topUIStyle,
            fill: '#c62828'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(103);

        const instructionFontSize = this.calculateInstructionFontSize();
        const instructionStyle = {
            fontSize: `${instructionFontSize}px`,
            fill: '#fff',
            backgroundColor: this.isMobileDevice ? 'rgba(30, 90, 190, 0.8)' : 'rgba(30, 90, 190, 0.55)',
            padding: this.isMobileDevice ? { x: 25, y: 12 } : { x: 16, y: 6 },
            align: 'center',
            fontFamily: 'Arial Black'
        };

        if (this.isMobileDevice) {
            instructionStyle.fontWeight = '900';
        }

        this.startInstruction = this.add.text(
            this.gameWidth / 2,
            this.gameHeight * 0.75,
            this.isTouchDevice ? 'Tap jump button to start your adventure!' : 'Press SPACE/UP to jump through all 20 levels!',
            instructionStyle
        ).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.tweens.add({
            targets: this.startInstruction,
            alpha: this.isMobileDevice ? 0.7 : 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    calculateQuestionFontSize() {
        if (this.isMobileDevice) {
            if (this.gameWidth <= 480) {
                return Math.max(18 * this.responsiveScale, 16);
            } else if (this.gameWidth <= 768) {
                return Math.max(22 * this.responsiveScale, 20);
            } else if (this.gameWidth <= 1024) {
                return Math.max(24 * this.responsiveScale, 22);
            } else {
                return Math.max(26 * this.responsiveScale, 24);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(14 * this.responsiveScale, 12);
            } else if (this.gameWidth <= 1024) {
                return Math.max(16 * this.responsiveScale, 14);
            } else {
                return Math.max(20 * this.responsiveScale, 16);
            }
        }
    }

    calculateTopUIFontSize() {
        if (this.isMobileDevice) {
            if (this.gameWidth <= 480) {
                return Math.max(20 * this.responsiveScale, 18);
            } else if (this.gameWidth <= 768) {
                return Math.max(22 * this.responsiveScale, 20);
            } else if (this.gameWidth <= 1024) {
                return Math.max(24 * this.responsiveScale, 22);
            } else {
                return Math.max(26 * this.responsiveScale, 24);
            }
        } else {
            if (this.gameWidth <= 736) {
                return Math.max(16 * this.responsiveScale, 14);
            } else if (this.gameWidth <= 1024) {
                return Math.max(18 * this.responsiveScale, 16);
            } else {
                return Math.max(20 * this.responsiveScale, 18);
            }
        }
    }

    calculateInstructionFontSize() {
        if (this.isMobileDevice) {
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
                return Math.max(12 * this.responsiveScale, 10);
            } else if (this.gameWidth <= 1024) {
                return Math.max(14 * this.responsiveScale, 12);
            } else {
                return Math.max(18 * this.responsiveScale, 14);
            }
        }
    }

    updateUILayout() {
        if (!this.questionText) return;

        const safeAreaTop = this.isMobileDevice ? Math.max(40, this.gameHeight * 0.08) : Math.max(20, this.gameHeight * 0.05);
        const safeAreaLeft = this.isMobileDevice ? Math.max(30, this.gameWidth * 0.06) : Math.max(20, this.gameWidth * 0.05);
        const safeAreaRight = this.gameWidth - safeAreaLeft;

        const questionFontSize = this.calculateQuestionFontSize();
        const questionY = safeAreaTop + questionFontSize + (this.isMobileDevice ? 15 : 0);

        // UPDATED: Question box with increased height for gap
        const questionBoxWidth = this.gameWidth * 0.92;
        const questionBoxHeight = questionFontSize * 3.2; // Increased height

        this.questionBox.clear();
        this.questionBox.fillStyle(0x000000, 0.85);
        this.questionBox.lineStyle(3, 0x4CAF50, 0.9);
        this.questionBox.fillRoundedRect(
            this.gameWidth / 2 - questionBoxWidth / 2,
            questionY - questionBoxHeight / 2 - 5,
            questionBoxWidth,
            questionBoxHeight,
            12
        );
        this.questionBox.strokeRoundedRect(
            this.gameWidth / 2 - questionBoxWidth / 2,
            questionY - questionBoxHeight / 2 - 5,
            questionBoxWidth,
            questionBoxHeight,
            12
        );

        // UPDATED: Update level text position and size
        const levelFontSize = Math.max(questionFontSize * 0.7, 12);
        this.levelText.setPosition(this.gameWidth / 2, questionY - questionFontSize * 0.8);
        this.levelText.setFontSize(levelFontSize);

        // UPDATED: Update question text position with gap
        this.questionText.setPosition(this.gameWidth / 2, questionY + questionFontSize * 0.3);
        this.questionText.setFontSize(questionFontSize);
        this.questionText.setWordWrapWidth(this.gameWidth * 0.85);

        const topUIFontSize = this.calculateTopUIFontSize();
        const topUIY = safeAreaTop;

        this.scoreText.setPosition(safeAreaLeft, topUIY);
        this.scoreText.setFontSize(topUIFontSize);

        this.livesText.setPosition(safeAreaRight, topUIY);
        this.livesText.setFontSize(topUIFontSize);

        if (this.startInstruction) {
            const instructionFontSize = this.calculateInstructionFontSize();
            this.startInstruction.setPosition(this.gameWidth / 2, this.gameHeight * 0.75);
            this.startInstruction.setFontSize(instructionFontSize);
            this.startInstruction.setText(
                this.isTouchDevice ? 'Tap jump button to start your adventure!' : 'Press SPACE/UP to jump through all 20 levels!'
            );
        }
    }

    updateScoreDisplay() {
        this.scoreText.setText(`💰${this.score}`);
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });
    }

    updateLivesDisplay() {
        this.livesText.setText(`❤️x${this.lives}`);
        this.tweens.add({
            targets: this.livesText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });
    }

    updateQuestionDisplay() {
        if (this.currentQuestion < QUIZ_QUESTIONS.length) {
            this.questionText.setText(QUIZ_QUESTIONS[this.currentQuestion % QUIZ_QUESTIONS.length].question);
            this.levelText.setText(`Level ${this.currentQuestion + 1}/20`);
            this.updateBackgroundForLevel(this.currentQuestion + 1);
        }
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    setupCamera() {
        // UPDATED: Enhanced camera follow settings for fast movement
        this.cameras.main.startFollow(this.player, true, 1, 1, 0, 150);

        // Set camera bounds
        this.cameras.main.setBounds(0, -100000, this.gameWidth, 200000);

        // CRITICAL FIX: Disable smoothing for fast-moving scenarios
        this.cameras.main.setLerp(1, 1); // Instant tracking on both axes

        // Alternative: Use conditional lerp based on player velocity
        // this.cameras.main.setLerp(1, 0.8); // Instant X, slight Y smoothing
    }


    generateQuestionLevels() {
        const settings = this.getCurrentGameSettings();
        // UPDATED: Added more gap between levels
        const questionSpacing = (settings.TILE_SPACING + 80) * this.responsiveScale; // Added 80 pixels gap
        const firstQuestionY = this.playerStartY - (questionSpacing - 50);

        for (let level = 0; level < 20; level++) {
            const yPosition = firstQuestionY - (level * questionSpacing);
            this.createQuestionLevel(level, yPosition);
            this.maxLevel = Math.max(this.maxLevel, level);
        }
        this.updateQuestionDisplay();
    }

    createQuestionLevel(questionIndex, yPos) {
        const currentQ = QUIZ_QUESTIONS[questionIndex % QUIZ_QUESTIONS.length];
        const shuffledOptions = shuffleArray(currentQ.options);
        const tileGroup = {
            tiles: [],
            level: questionIndex,
            yPos,
            isCompleted: false,
            correctAnswer: currentQ.correct,
            correctTile: null
        };

        const tileSpacing = this.isMobileDevice ? this.gameWidth / 5.2 : this.gameWidth / 5;
        const startX = this.isMobileDevice ? tileSpacing * 0.8 : tileSpacing;

        const tilePositions = [
            { x: startX, y: yPos },
            { x: startX + tileSpacing, y: yPos },
            { x: startX + tileSpacing * 2, y: yPos },
            { x: startX + tileSpacing * 3, y: yPos }
        ];

        for (let i = 0; i < 4; i++) {
            const x = tilePositions[i].x;
            const option = shuffledOptions[i];
            const isCorrect = option === currentQ.correct;
            const tile = new Tile(this, x, yPos, option, isCorrect, this.responsiveScale, this.gameWidth, this.gameHeight, this.isMobileDevice);
            tile.questionLevel = questionIndex;
            if (isCorrect) tileGroup.correctTile = tile;
            tileGroup.tiles.push(tile);
        }
        this.allTileGroups.push(tileGroup);
    }

    startAutoScroll() {
        if (this.autoScrollTimer) this.autoScrollTimer.destroy();
        this.autoScrollSpeed = GAME_SETTINGS.AUTO_SCROLL_SPEED * this.responsiveScale;
        this.autoScrollTimer = this.time.addEvent({
            delay: 16,
            callback: () => {
                if (this.gameState === 'playing' && this.gameStarted) {
                    this.cameras.main.scrollY -= this.autoScrollSpeed;
                }
            },
            loop: true,
        });
    }

    checkTileCollisions() {
        const playerCenterX = this.player.x;
        const playerBottom = this.player.y + 15;
        const playerTop = this.player.y - 15;
        const vy = this.player.body.velocity.y;

        for (const tileGroup of this.allTileGroups) {
            for (const tile of tileGroup.tiles) {
                if (tile.isDestroyed || tile.hasBeenHit) continue;

                const tileLeft = tile.x - (tile.tileWidth / 2);
                const tileRight = tile.x + (tile.tileWidth / 2);
                const tileTopY = tile.y - (tile.tileHeight / 2);

                // UPDATED: Enhanced pass-through logic - allow pass through when coming from below OR when tile is set to allow pass through
                if (tile.isSolidPlatform && (vy < 0 || tile.allowPassThrough)) {
                    continue;
                }

                if (playerCenterX >= tileLeft &&
                    playerCenterX <= tileRight &&
                    vy > 0 &&
                    playerBottom >= tileTopY &&
                    playerBottom <= tileTopY + 16 &&
                    playerTop < tileTopY) {

                    if (!tile.isDestroyed) {
                        this.player.landOnTile(tile);
                        this.handleTileLanding(tile, tileGroup);
                        return;
                    }
                }
            }
        }
    }

    // UPDATED: Simplified - Check if player has fallen below ANY completed level
    checkPlayerBelowCompletedLevels() {
        const playerY = this.player.y;

        this.allTileGroups.forEach(tileGroup => {
            if (tileGroup.isCompleted) {
                // UPDATED: Immediate check - if player is below the level (even by 1 pixel), make passable
                const isPlayerBelowLevel = playerY > tileGroup.yPos;

                tileGroup.tiles.forEach(tile => {
                    if (tile.isSolidPlatform) {
                        if (isPlayerBelowLevel) {
                            // UPDATED: Player is below level, make tile passable from below
                            tile.allowPassThrough = true;
                            if (tile.hardPlatform && tile.hardPlatform.body) {
                                tile.hardPlatform.body.enable = false;
                            }
                        } else {
                            // UPDATED: Player is at or above level, make tile solid again
                            tile.allowPassThrough = false;
                            if (tile.hardPlatform && tile.hardPlatform.body) {
                                tile.hardPlatform.body.enable = true;
                            }
                        }
                    }
                });
            }
        });
    }

    // UPDATED: Enhanced solid tile creation with pass-through capability
    makeEntireRowSolid(tileGroup) {
        tileGroup.tiles.forEach(tile => {
            tile.isSolidPlatform = true;
            tile.isPermanentPlatform = true;
            tile.allowPassThrough = false; // NEW: Track pass-through state

            if (!tile.isHardPlatform) {
                const permPlatform = tile.makeHardPlatform(this);
                if (permPlatform) {
                    this.hardPlatformGroup.add(permPlatform);
                    permPlatform.setImmovable(true);
                    permPlatform.body.enable = true;
                }
            }

            this.createSolidTileEffect(tile);
        });
    }

    createSolidTileEffect(tile) {
        const glowSize = Math.max(50 * this.responsiveScale, 30);
        const solidGlow = this.add.circle(tile.x, tile.y, glowSize, 0xFFD700, 0.3)
            .setDepth(15);

        this.tweens.add({
            targets: solidGlow,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1000,
            ease: 'Power2.easeOut',
            onComplete: () => solidGlow.destroy()
        });
    }

    handleTileLanding(tile, tileGroup) {
        // UPDATED: Enhanced solid platform check with pass-through logic
        if (tile.isSolidPlatform && !tile.allowPassThrough) {
            this.player.setVelocity(0, 0);
            this.player.canJump = false;
            this.player.landingCooldown = 1;
            this.player.isOnSafeTile = true;
            this.player.forceStayGrounded = false;
            return;
        }

        if (tileGroup.isCompleted) {
            if (tile.isCorrect) {
                this.player.setVelocity(0, 0);
                this.player.canJump = false;
                this.player.landingCooldown = 1;
                this.player.forceStayGrounded = false;
                return;
            }
            tile.hasBeenHit = true;
            this.breakWrongTile(tile);
            return;
        }

        if (tile.isCorrect) {
            tileGroup.isCompleted = true;
            this.completedQuestionLevels.add(tileGroup.level);
            tile.hasBeenHit = true;

            this.makeEntireRowSolid(tileGroup);

            const settings = this.getCurrentGameSettings();
            this.score += settings.POINTS_PER_CORRECT;
            this.updateScoreDisplay();
            this.createSuccessFeedback(tile);
            this.currentQuestion++;
            this.updateQuestionDisplay();

            if (this.currentQuestion >= 20) {
                this.gameCompleted();
            }
            return;
        }

        tile.hasBeenHit = true;
        this.breakWrongTile(tile);
    }

    breakWrongTile(tile) {
        this.createBreakingEffect(tile.x, tile.y);
        tile.isDestroyed = true;
        setTimeout(() => tile.destroy(), 300);
        this.lives--;
        this.updateLivesDisplay();
        this.createWrongFeedback(tile);

        if (this.lives <= 0) {
            this.time.delayedCall(1500, () => this.gameOver());
        }
    }

    createSuccessFeedback(tile) {
        this.createParticleBurst(tile.x, tile.y - 30, 0x4CAF50);
        const fontSize = Math.max(16 * this.responsiveScale, 12);
        const text = this.add.text(tile.x, tile.y - 50, '✨ CORRECT!', {
            fontSize: `${fontSize}px`,
            fill: '#43a047',
            fontFamily: 'Arial Black',
            stroke: '#fff',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(500);

        this.tweens.add({
            targets: text,
            alpha: 0,
            y: tile.y - 90,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1100,
            onComplete: () => text.destroy()
        });
    }

    createWrongFeedback(tile) {
        this.createParticleBurst(tile.x, tile.y - 30, 0xFF5722);
        const fontSize = Math.max(16 * this.responsiveScale, 12);
        const text = this.add.text(tile.x, tile.y - 50, '💥 WRONG! 💥', {
            fontSize: `${fontSize}px`,
            fill: '#b71c1c',
            fontFamily: 'Arial Black',
            stroke: '#fff',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(500);

        this.tweens.add({
            targets: text,
            alpha: 0,
            y: tile.y - 90,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 900,
            onComplete: () => text.destroy()
        });
    }

    createParticleBurst(x, y, color) {
        const particleCount = Math.max(8 * this.responsiveScale, 6);
        for (let i = 0; i < particleCount; i++) {
            const p = this.add.circle(x, y, Phaser.Math.Between(2, 6) * this.responsiveScale, color, 0.92).setDepth(400);
            const a = (i / 12) * 2 * Math.PI;
            const v = Phaser.Math.Between(40, 73) * this.responsiveScale;
            this.tweens.add({
                targets: p,
                x: x + Math.cos(a) * v,
                y: y + Math.sin(a) * v,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 700,
                onComplete: () => p.destroy()
            });
        }
    }

    createBreakingEffect(x, y) {
        const debrisCount = Math.max(6 * this.responsiveScale, 4);
        for (let i = 0; i < debrisCount; i++) {
            let debris = this.add.rectangle(
                x + Phaser.Math.Between(-30, 30) * this.responsiveScale,
                y + Phaser.Math.Between(-10, 10) * this.responsiveScale,
                Phaser.Math.Between(7, 12) * this.responsiveScale,
                Phaser.Math.Between(5, 9) * this.responsiveScale,
                0xA0522D
            ).setDepth(100);

            this.tweens.add({
                targets: debris,
                x: debris.x + Phaser.Math.Between(-20, 20) * this.responsiveScale,
                y: debris.y - Phaser.Math.Between(30, 60) * this.responsiveScale,
                alpha: 0,
                duration: 700,
                onComplete: () => debris.destroy()
            });
        }
    }

    checkPlayerFallsBelowGround() {
        if (this.player.y > this.groundPlatformY + 100) {
            this.respawnPlayerOnGround();
        }
    }

    respawnPlayerOnGround() {
        this.lives--;
        this.updateLivesDisplay();
        this.createFallFeedback();
        this.player.setPosition(this.gameWidth / 2, this.playerStartY);
        this.player.setVelocity(0, 0);
        this.cameras.main.shake(300, 0.01);

        if (this.lives <= 0) {
            this.time.delayedCall(1000, () => this.gameOver());
        }
    }

    createFallFeedback() {
        const fontSize = Math.max(16 * this.responsiveScale, 12);
        const fallText = this.add.text(this.gameWidth / 2, this.groundPlatformY - 50, '⚠️ FELL OFF! RESPAWNING...', {
            fontSize: `${fontSize}px`,
            fill: '#FF5722',
            fontFamily: 'Arial Black',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(1000);

        this.tweens.add({
            targets: fallText,
            alpha: 0,
            y: this.groundPlatformY - 100,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => fallText.destroy()
        });
    }

    gameCompleted() {
        this.gameState = 'completed';
        if (this.autoScrollTimer) this.autoScrollTimer.destroy();

        const fontSize = Math.max(24 * this.responsiveScale, 18);
        const victoryText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, '🌟 CONGRATULATIONS! 🌟\nYou reached Deep Space!\nAll 20 levels completed!', {
            fontSize: `${fontSize}px`,
            fill: '#FFD700',
            fontFamily: 'Arial Black',
            align: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: 20, y: 20 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

        if (typeof window !== 'undefined') {
            const highScore = parseInt(localStorage.getItem('quizJumpHighScore')) || 0;
            if (this.score > highScore) {
                localStorage.setItem('quizJumpHighScore', this.score.toString());
            }
        }

        this.time.delayedCall(3000, () => {
            this.scene.start('MenuScene');
        });
    }

    playerFellBehind() {
        this.lives--;
        this.updateLivesDisplay();
        this.cameras.main.shake(400, 0.005);

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.landOnNearestPlatform();
        }
    }

    landOnNearestPlatform() {
        let nearestLevel = null;
        let shortestDistance = Infinity;

        for (const tileGroup of this.allTileGroups) {
            if (tileGroup.isCompleted && tileGroup.correctTile) {
                const distance = Math.abs(this.player.y - tileGroup.yPos);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestLevel = tileGroup;
                }
            }
        }

        if (nearestLevel && nearestLevel.correctTile) {
            this.player.setPosition(nearestLevel.correctTile.x, nearestLevel.correctTile.y - 28);
            this.player.setVelocity(0, 0);
        } else {
            this.player.setPosition(this.gameWidth / 2, this.playerStartY);
            this.player.setVelocity(0, 0);
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        if (this.autoScrollTimer) this.autoScrollTimer.destroy();

        if (typeof window !== 'undefined') {
            const highScore = parseInt(localStorage.getItem('quizJumpHighScore')) || 0;
            if (this.score > highScore) {
                localStorage.setItem('quizJumpHighScore', this.score.toString());
            }
        }

        this.scene.start('GameOverScene', {
            score: this.score,
            questionsAnswered: this.currentQuestion,
            maxCombo: 0
        });
    }

    update() {
        if (this.gameState !== 'playing') return;

        if (this.touchControls.moveLeft) {
            this.player.moveLeft();
        } else if (this.touchControls.moveRight) {
            this.player.moveRight();
        } else if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.moveLeft();
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.moveRight();
        } else {
            this.player.stop();
        }

        const jumpButtonPressed = (this.cursors.up.isDown || this.wasd.W.isDown || this.spaceBar.isDown);
        if (jumpButtonPressed && !this.jumpKeyWasPressed) {
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.startAutoScroll();
                if (this.startInstruction) {
                    const ref = this.startInstruction;
                    this.startInstruction = null;
                    this.tweens.add({
                        targets: ref,
                        alpha: 0,
                        scaleX: 0,
                        scaleY: 0,
                        duration: 250,
                        onComplete: () => {
                            if (ref && ref.destroy) ref.destroy();
                        }
                    });
                }
            }
            this.player.jump();
        }
        this.jumpKeyWasPressed = jumpButtonPressed;

        this.player.update();
        this.adjustCameraForFastMovement();
        this.checkTileCollisions();
        this.checkPlayerFallsBelowGround();

        // UPDATED: Check if player has fallen below completed levels - now with immediate detection
        this.checkPlayerBelowCompletedLevels();

        // UPDATED: Dynamic background update based on player position
        this.updateBackgroundForPlayerPosition();

        const settings = this.getCurrentGameSettings();
        // UPDATED: Adjust for increased spacing
        if (this.cameras.main.scrollY < -(this.maxLevel * (settings.TILE_SPACING + 80) * this.responsiveScale)) {
            this.generateMoreLevels();
        }
    }
    // NEW: Adjust camera responsiveness based on player velocity
    adjustCameraForFastMovement() {
        if (!this.player || !this.player.body) return;

        const playerVelocityY = Math.abs(this.player.body.velocity.y);
        const fastFallThreshold = 400; // Adjust based on your game feel

        if (playerVelocityY > fastFallThreshold) {
            // Player is falling fast - make camera instantly responsive
            this.cameras.main.setLerp(1, 1);
        } else {
            // Normal movement - slight smoothing for better feel
            this.cameras.main.setLerp(1, 0.9);
        }
    }


    generateMoreLevels() {
        const settings = this.getCurrentGameSettings();
        // UPDATED: Match the increased spacing
        const questionSpacing = (settings.TILE_SPACING + 80) * this.responsiveScale;
        const startLevel = this.maxLevel + 1;

        for (let i = 0; i < 5; i++) {
            const level = startLevel + i;
            if (level < 20) {
                const yPos = this.playerStartY - (questionSpacing - 50) - (level * questionSpacing);
                this.createQuestionLevel(level, yPos);
                this.maxLevel = Math.max(this.maxLevel, level);
            }
        }
    }
}

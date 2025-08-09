import { ASSETS } from '../utils/constants';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.responsiveScale = 1;
    }

    preload() {
        try {
            this.load.image('player', ASSETS.IMAGES.PLAYER_IDLE);
            this.load.image('player_walk_a', ASSETS.IMAGES.PLAYER_WALK_A);
            this.load.image('player_walk_b', ASSETS.IMAGES.PLAYER_WALK_B);
            this.load.image('ground_platform', ASSETS.IMAGES.GROUND_PLATFORM);
            this.load.image('tile_0153', ASSETS.IMAGES.TILE_0153);
            this.load.image('tile_0154', ASSETS.IMAGES.TILE_0154);
            this.load.image('tile_0155', ASSETS.IMAGES.TILE_0155);
            this.load.image('background', ASSETS.IMAGES.BACKGROUND);
            this.load.image('hud_heart', ASSETS.IMAGES.HUD_HEART);
            this.load.image('hud_heart_empty', ASSETS.IMAGES.HUD_HEART_EMPTY);
        } catch (error) {
            console.warn('Some assets may not load properly:', error);
        }

        this.createLoadingBar();
    }

    createLoadingBar() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();

        const boxWidth = Math.min(320 * this.responsiveScale, gameWidth * 0.7);
        const boxHeight = 50 * this.responsiveScale;
        const boxX = (gameWidth - boxWidth) / 2;
        const boxY = gameHeight / 2 - boxHeight / 2;

        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);

        const fontSize = Math.max(14 * this.responsiveScale, 12);
        const loadingText = this.add.text(gameWidth / 2, boxY - 30, 'Loading Amazing Content...', {
            fontSize: `${fontSize}px`,
            fill: '#FFFFFF',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x4CAF50, 1);
            progressBar.fillRoundedRect(boxX + 10, boxY + 10, (boxWidth - 20) * value, boxHeight - 20, 5);

            loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        this.responsiveScale = this.game.responsiveScale || 1;

        this.createAnimatedBackground();
        this.createResponsiveTitle();
        this.createResponsiveMenuButtons();
        this.createResponsiveFloatingElements();
        this.createResponsiveInstructions();
        this.displayResponsiveHighScore();
        this.createResponsiveFooter();
    }

    updateResponsiveScale(newScale) {
        this.responsiveScale = newScale;
    }

    createAnimatedBackground() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        for (let i = 0; i < 3; i++) {
            let bgTexture;
            try {
                bgTexture = 'background';
            } catch {
                const fallbackBg = this.add.graphics();
                fallbackBg.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x4169E1, 0x4169E1);
                fallbackBg.fillRect(0, 0, gameWidth, gameHeight);
                fallbackBg.setAlpha(0.6 - i * 0.1);
                continue;
            }

            const bg = this.add.tileSprite(0, 0, gameWidth, gameHeight, bgTexture)
                .setOrigin(0, 0)
                .setAlpha(0.6 - i * 0.1)
                .setDepth(-10 + i);

            this.tweens.add({
                targets: bg,
                tilePositionX: -gameWidth,
                duration: 20000 + i * 5000,
                repeat: -1,
                ease: 'Linear'
            });
        }

        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483);
        graphics.fillRect(0, 0, gameWidth, gameHeight);
        graphics.setAlpha(0.4);
    }

    createResponsiveTitle() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        const titleSize = Math.max(36 * this.responsiveScale, 28);
        const titleY = gameHeight * 0.15;

        // Enhanced title with professional glow effect
        const titleShadow = this.add.text(gameWidth / 2 + 3, titleY + 3, 'QUIZ JUMP', {
            fontSize: `${titleSize}px`,
            fill: '#000000',
            fontFamily: 'Arial Black',
            fontWeight: '900'
        }).setOrigin(0.5).setAlpha(0.6);

        const titleGlow = this.add.text(gameWidth / 2, titleY, 'QUIZ JUMP', {
            fontSize: `${titleSize}px`,
            fill: '#4CAF50',
            fontFamily: 'Arial Black',
            fontWeight: '900'
        }).setOrigin(0.5).setAlpha(0.3);

        const title = this.add.text(gameWidth / 2, titleY, 'QUIZ JUMP', {
            fontSize: `${titleSize}px`,
            fill: '#FFFFFF',
            fontFamily: 'Arial Black',
            fontWeight: '900',
            stroke: '#2E7D32',
            strokeThickness: Math.max(4 * this.responsiveScale, 3)
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [title, titleShadow],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: titleGlow,
            scaleX: 1.1,
            scaleY: 1.1,
            alpha: 0.5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const subtitleSize = Math.max(18 * this.responsiveScale, 14);
        const subtitle = this.add.text(gameWidth / 2, titleY + titleSize + 15, '', {
            fontSize: `${subtitleSize}px`,
            fill: '#FFD700',
            fontFamily: 'Arial Black',
            fontStyle: 'italic',
            stroke: '#B8860B',
            strokeThickness: 1
        }).setOrigin(0.5);

        const subtitleText = 'Jump, Learn, Conquer!';
        let charIndex = 0;

        this.time.addEvent({
            delay: 100,
            callback: () => {
                if (charIndex < subtitleText.length) {
                    subtitle.text += subtitleText[charIndex];
                    charIndex++;
                }
            },
            repeat: subtitleText.length - 1
        });
    }

    createResponsiveMenuButtons() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        const buttons = [
            {
                text: '🚀 START GAME',
                x: gameWidth / 2,
                y: gameHeight * 0.42,
                // Professional gaming colors - Electric Blue
                color: 0x0077BE,
                hoverColor: 0x0099FF,
                glowColor: 0x00CCFF,
                shadowColor: 0x004080,
                action: () => this.scene.start('GameScene')
            },
            {
                text: '📚 HOW TO PLAY',
                x: gameWidth / 2,
                y: gameHeight * 0.54,
                // Professional gaming colors - Emerald Green
                color: 0x00A86B,
                hoverColor: 0x00C878,
                glowColor: 0x00FF9F,
                shadowColor: 0x006B43,
                action: () => this.showInstructions()
            },
            {
                text: '🏆 HIGH SCORES',
                x: gameWidth / 2,
                y: gameHeight * 0.66,
                // Professional gaming colors - Royal Purple
                color: 0x6A0DAD,
                hoverColor: 0x8A2BE2,
                glowColor: 0xA020F0,
                shadowColor: 0x4B0082,
                action: () => this.showHighScores()
            }
        ];

        buttons.forEach(buttonData => {
            this.createProfessionalButton(buttonData);
        });
    }

    createProfessionalButton(buttonData) {
        const buttonWidth = Math.min(240 * this.responsiveScale, this.cameras.main.width * 0.65);
        const buttonHeight = Math.max(50 * this.responsiveScale, 40);
        const fontSize = Math.max(18 * this.responsiveScale, 14);

        // Create button shadow
        const shadowOffset = 4 * this.responsiveScale;
        const buttonShadow = this.add.graphics();
        buttonShadow.fillStyle(buttonData.shadowColor, 0.6);
        buttonShadow.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
        buttonShadow.x = buttonData.x + shadowOffset;
        buttonShadow.y = buttonData.y + shadowOffset;
        buttonShadow.setDepth(10);

        // Create button glow effect
        const buttonGlow = this.add.graphics();
        buttonGlow.fillStyle(buttonData.glowColor, 0.2);
        buttonGlow.fillRoundedRect(-buttonWidth / 2 - 6, -buttonHeight / 2 - 6, buttonWidth + 12, buttonHeight + 12, 18);
        buttonGlow.x = buttonData.x;
        buttonGlow.y = buttonData.y;
        buttonGlow.setDepth(11);

        // Create main button background
        const buttonBg = this.add.graphics();
        buttonBg.fillGradientStyle(
            buttonData.color,
            buttonData.color,
            Phaser.Display.Color.Interpolate.ColorWithColor(buttonData.color, 0x000000, 100, 15),
            Phaser.Display.Color.Interpolate.ColorWithColor(buttonData.color, 0x000000, 100, 15)
        );
        buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);

        // Add subtle border
        buttonBg.lineStyle(2, 0xFFFFFF, 0.3);
        buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);

        buttonBg.x = buttonData.x;
        buttonBg.y = buttonData.y;
        buttonBg.setDepth(12);

        // Create button text with enhanced styling
        const button = this.add.text(buttonData.x, buttonData.y, buttonData.text, {
            fontSize: `${fontSize}px`,
            fill: '#FFFFFF',
            fontFamily: 'Arial Black',
            fontWeight: '900',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 2,
                stroke: false,
                fill: true
            }
        }).setOrigin(0.5).setInteractive().setDepth(13);

        // Add subtle pulsing animation to glow
        this.tweens.add({
            targets: buttonGlow,
            alpha: 0.4,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Hover effects
        button.on('pointerover', () => {
            // Scale animation
            this.tweens.add({
                targets: [button, buttonBg, buttonShadow],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Back.easeOut'
            });

            // Enhanced glow on hover
            this.tweens.add({
                targets: buttonGlow,
                alpha: 0.6,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 150,
                ease: 'Power2.easeOut'
            });

            // Change button color
            buttonBg.clear();
            buttonBg.fillGradientStyle(
                buttonData.hoverColor,
                buttonData.hoverColor,
                Phaser.Display.Color.Interpolate.ColorWithColor(buttonData.hoverColor, 0x000000, 100, 20),
                Phaser.Display.Color.Interpolate.ColorWithColor(buttonData.hoverColor, 0x000000, 100, 20)
            );
            buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
            buttonBg.lineStyle(2, 0xFFFFFF, 0.5);
            buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);

            // Text glow effect on hover
            button.setStyle({
                fill: '#FFFFFF',
                stroke: buttonData.glowColor,
                strokeThickness: 3
            });
        });

        button.on('pointerout', () => {
            // Return to normal scale
            this.tweens.add({
                targets: [button, buttonBg, buttonShadow],
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.easeOut'
            });

            // Return glow to normal
            this.tweens.add({
                targets: buttonGlow,
                alpha: 0.2,
                scaleX: 1.02,
                scaleY: 1.02,
                duration: 150,
                ease: 'Power2.easeOut'
            });

            // Return button to original color
            buttonBg.clear();
            buttonBg.fillGradientStyle(
                buttonData.color,
                buttonData.color,
                Phaser.Display.Color.Interpolate.ColorWithColor(buttonData.color, 0x000000, 100, 15),
                Phaser.Display.Color.Interpolate.ColorWithColor(buttonData.color, 0x000000, 100, 15)
            );
            buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
            buttonBg.lineStyle(2, 0xFFFFFF, 0.3);
            buttonBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);

            // Return text to normal
            button.setStyle({
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2
            });
        });

        // Click effect
        button.on('pointerdown', () => {
            this.tweens.add({
                targets: [button, buttonBg, buttonShadow],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Power2.easeInOut',
                onComplete: buttonData.action
            });
        });
    }

    createResponsiveFloatingElements() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const icons = ['📝', '🧠', '⭐', '💎', '🏆', '🎯'];

        const iconsPerRow = Math.min(6, Math.floor(gameWidth / (80 * this.responsiveScale)));
        const iconSize = Math.max(22 * this.responsiveScale, 18);

        icons.slice(0, iconsPerRow).forEach((icon, index) => {
            const x = (gameWidth / (iconsPerRow + 1)) * (index + 1);
            const y = gameHeight * 0.78 + Math.sin(index) * 20;

            // Add glow effect to icons
            const iconGlow = this.add.text(x, y, icon, {
                fontSize: `${iconSize + 4}px`
            }).setOrigin(0.5).setAlpha(0.3).setTint(0x4CAF50);

            const element = this.add.text(x, y, icon, {
                fontSize: `${iconSize}px`
            }).setOrigin(0.5).setAlpha(0.8);

            this.tweens.add({
                targets: [element, iconGlow],
                y: element.y - 15,
                duration: 2000 + index * 300,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            this.tweens.add({
                targets: [element, iconGlow],
                rotation: 0.1,
                duration: 3000 + index * 200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    createResponsiveInstructions() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const fontSize = Math.max(11 * this.responsiveScale, 9);

        const instructions = [
            '🎮 Use ARROW KEYS or WASD to move and jump',
            '🎯 Land on correct answers to progress upward!',
            '💖 You have 3 lives - use them wisely!'
        ];

        instructions.forEach((instruction, index) => {
            this.add.text(gameWidth / 2, gameHeight * 0.88 + index * (fontSize + 6), instruction, {
                fontSize: `${fontSize}px`,
                fill: '#E0E0E0',
                fontFamily: 'Arial',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 8 * this.responsiveScale, y: 3 * this.responsiveScale }
            }).setOrigin(0.5).setAlpha(0.9);
        });
    }

    displayResponsiveHighScore() {
        const highScore = (typeof window !== 'undefined')
            ? parseInt(localStorage.getItem('quizJumpHighScore')) || 0
            : 0;

        const fontSize = Math.max(16 * this.responsiveScale, 13);
        const padding = Math.max(10 * this.responsiveScale, 8);

        const highScoreText = this.add.text(padding, padding, `🏆 Best Score: ${highScore}`, {
            fontSize: `${fontSize}px`,
            fill: '#FFD700',
            fontFamily: 'Arial Black',
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: { x: padding, y: padding / 2 },
            stroke: '#B8860B',
            strokeThickness: 1
        }).setAlpha(0.95);

        this.tweens.add({
            targets: highScoreText,
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createResponsiveFooter() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const fontSize = Math.max(11 * this.responsiveScale, 9);

        this.add.text(gameWidth / 2, gameHeight - 15, 'Made with ❤️ for Learning', {
            fontSize: `${fontSize}px`,
            fill: '#B0B0B0',
            fontFamily: 'Arial',
            fontStyle: 'italic'
        }).setOrigin(0.5).setAlpha(0.7);
    }

    showInstructions() {
        this.createResponsiveModal([
            "🎯 HOW TO PLAY QUIZ JUMP",
            "",
            "🏃 Move left/right with ARROW KEYS or A/D",
            "🦘 Jump with UP ARROW, W, or SPACEBAR",
            "📚 Read questions at the top of the screen",
            "✅ Jump on tiles with CORRECT answers",
            "❌ Avoid wrong answers - they break!",
            "💖 You have 3 lives - don't waste them!",
            "🚀 Keep climbing higher for more points!",
            "🔥 Build combos for bonus points!",
            "",
            "🎓 Learn while you play and have fun!",
            "",
            "Click anywhere to close"
        ]);
    }

    showHighScores() {
        const highScore = (typeof window !== 'undefined')
            ? parseInt(localStorage.getItem('quizJumpHighScore')) || 0
            : 0;

        this.createResponsiveModal([
            "🏆 HIGH SCORES",
            "",
            `🥇 Personal Best: ${highScore} points`,
            "",
            "🎯 Score Breakdown:",
            "• Correct Answer: 10 points",
            "• Combo Bonus: +3 points per combo level",
            "• Survival Bonus: Keep all 3 lives!",
            "",
            "💡 Tips to improve:",
            "• Read questions carefully",
            "• Build long combo streaks",
            "• Practice makes perfect!",
            "",
            "Click anywhere to close"
        ]);
    }

    createResponsiveModal(content) {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        const modal = this.add.graphics();
        modal.fillStyle(0x000000, 0.85);
        modal.fillRect(0, 0, gameWidth, gameHeight);
        modal.setDepth(1000);

        const modalWidth = Math.min(520 * this.responsiveScale, gameWidth * 0.9);
        const modalHeight = Math.min(420 * this.responsiveScale, gameHeight * 0.8);
        const modalX = (gameWidth - modalWidth) / 2;
        const modalY = (gameHeight - modalHeight) / 2;

        // Enhanced modal background with professional styling
        const contentBg = this.add.graphics();
        contentBg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483);
        contentBg.fillRoundedRect(modalX, modalY, modalWidth, modalHeight, 20);
        contentBg.lineStyle(3 * this.responsiveScale, 0x4CAF50, 0.8);
        contentBg.strokeRoundedRect(modalX, modalY, modalWidth, modalHeight, 20);
        contentBg.setDepth(1001);

        const titleFontSize = Math.max(22 * this.responsiveScale, 18);
        const textFontSize = Math.max(13 * this.responsiveScale, 11);
        const lineHeight = Math.max(20 * this.responsiveScale, 16);

        // Store all modal elements for proper cleanup
        const modalElements = [modal, contentBg];

        content.forEach((text, index) => {
            const style = index === 0 ?
                { fontSize: `${titleFontSize}px`, fill: '#4CAF50', fontFamily: 'Arial Black', stroke: '#2E7D32', strokeThickness: 1 } :
                text === "" ?
                    { fontSize: `${Math.max(6 * this.responsiveScale, 4)}px`, fill: '#FFFFFF' } :
                    text.startsWith('•') ?
                        { fontSize: `${Math.max(11 * this.responsiveScale, 9)}px`, fill: '#B0B0B0', fontFamily: 'Arial' } :
                        { fontSize: `${textFontSize}px`, fill: '#FFFFFF', fontFamily: 'Arial' };

            const textElement = this.add.text(gameWidth / 2, modalY + 35 + index * lineHeight, text, style)
                .setOrigin(0.5)
                .setDepth(1002);

            modalElements.push(textElement);
        });

        const buttonFontSize = Math.max(16 * this.responsiveScale, 13);
        const closeButton = this.add.text(gameWidth / 2, modalY + modalHeight - 45, '✖️ CLOSE', {
            fontSize: `${buttonFontSize}px`,
            fill: '#FFFFFF',
            fontFamily: 'Arial Black',
            backgroundColor: '#D32F2F',
            padding: { x: 20 * this.responsiveScale, y: 8 * this.responsiveScale },
            stroke: '#B71C1C',
            strokeThickness: 1
        }).setOrigin(0.5).setInteractive().setDepth(1002);

        modalElements.push(closeButton);

        closeButton.on('pointerover', () => {
            closeButton.setScale(1.05);
            closeButton.setStyle({ backgroundColor: '#F44336' });
        });

        closeButton.on('pointerout', () => {
            closeButton.setScale(1);
            closeButton.setStyle({ backgroundColor: '#D32F2F' });
        });

        const closeModal = () => {
            modalElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        };

        modal.setInteractive().on('pointerdown', closeModal);
        closeButton.on('pointerdown', closeModal);
    }
}

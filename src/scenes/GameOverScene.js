export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.responsiveScale = 1;
    }

    create(data) {
        this.score = data.score || 0;
        this.questionsAnswered = data.questionsAnswered || 0;
        this.maxCombo = data.maxCombo || 0;
        this.responsiveScale = this.game.responsiveScale || 1;

        this.createGameOverScreen();
        this.createStatsDisplay();
        this.createMenuButtons();
        this.createParticleEffects();
    }

    updateResponsiveScale(newScale) {
        this.responsiveScale = newScale;
    }

    createGameOverScreen() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        // Background overlay
        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483);
        overlay.fillRect(0, 0, gameWidth, gameHeight);
        overlay.setAlpha(0.9);

        // Game Over title
        const titleSize = Math.max(36 * this.responsiveScale, 28);
        const title = this.add.text(gameWidth / 2, gameHeight * 0.2, 'GAME OVER', {
            fontSize: `${titleSize}px`,
            fill: '#FF6B6B',
            fontFamily: 'Arial Black',
            fontWeight: '900',
            stroke: '#8B0000',
            strokeThickness: Math.max(4 * this.responsiveScale, 3)
        }).setOrigin(0.5);

        // Animate title
        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Score display
        const scoreSize = Math.max(24 * this.responsiveScale, 18);
        this.add.text(gameWidth / 2, gameHeight * 0.35, `Final Score: ${this.score}`, {
            fontSize: `${scoreSize}px`,
            fill: '#FFD700',
            fontFamily: 'Arial Black',
            fontWeight: 'bold'
        }).setOrigin(0.5);
    }

    createStatsDisplay() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        const statsSize = Math.max(16 * this.responsiveScale, 12);

        const stats = [
            `Questions Answered: ${this.questionsAnswered}/20`,
            `Best Combo: ${this.maxCombo}x`,
            `Accuracy: ${this.questionsAnswered > 0 ? Math.round((this.score / (this.questionsAnswered * 10)) * 100) : 0}%`
        ];

        stats.forEach((stat, index) => {
            this.add.text(gameWidth / 2, gameHeight * 0.5 + index * 30, stat, {
                fontSize: `${statsSize}px`,
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);
        });

        // High score check
        if (typeof window !== 'undefined') {
            const highScore = parseInt(localStorage.getItem('quizJumpHighScore')) || 0;
            if (this.score > highScore) {
                localStorage.setItem('quizJumpHighScore', this.score.toString());

                const newRecordSize = Math.max(20 * this.responsiveScale, 16);
                const newRecord = this.add.text(gameWidth / 2, gameHeight * 0.65, '🎉 NEW HIGH SCORE! 🎉', {
                    fontSize: `${newRecordSize}px`,
                    fill: '#FFD700',
                    fontFamily: 'Arial Black',
                    fontWeight: '900'
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: newRecord,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 800,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Back.easeInOut'
                });
            }
        }
    }

    createMenuButtons() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        const buttons = [
            {
                text: '🔄 PLAY AGAIN',
                x: gameWidth / 2 - 100 * this.responsiveScale,
                y: gameHeight * 0.8,
                action: () => this.scene.start('GameScene')
            },
            {
                text: '🏠 MAIN MENU',
                x: gameWidth / 2 + 100 * this.responsiveScale,
                y: gameHeight * 0.8,
                action: () => this.scene.start('MenuScene')
            }
        ];

        buttons.forEach(buttonData => {
            this.createButton(buttonData);
        });
    }

    createButton(buttonData) {
        const buttonWidth = Math.min(150 * this.responsiveScale, this.cameras.main.width * 0.4);
        const buttonHeight = Math.max(40 * this.responsiveScale, 30);
        const fontSize = Math.max(14 * this.responsiveScale, 11);

        const button = this.add.text(buttonData.x, buttonData.y, buttonData.text, {
            fontSize: `${fontSize}px`,
            fill: '#FFFFFF',
            fontFamily: 'Arial Black',
            fontWeight: 'bold',
            backgroundColor: '#4CAF50',
            padding: { x: 12 * this.responsiveScale, y: 8 * this.responsiveScale }
        }).setOrigin(0.5).setInteractive();

        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: '#45a049' });
            this.tweens.add({
                targets: button,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });

        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: '#4CAF50' });
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });

        button.on('pointerdown', buttonData.action);
    }

    createParticleEffects() {
        // Add some visual flair with particles
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);

            const particle = this.add.circle(x, y, 2, 0xFFFFFF, 0.5);

            this.tweens.add({
                targets: particle,
                alpha: 0,
                y: y - 100,
                duration: Phaser.Math.Between(2000, 4000),
                delay: Phaser.Math.Between(0, 2000),
                repeat: -1
            });
        }
    }
}

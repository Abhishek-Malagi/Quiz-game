'use client';
import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import MenuScene from '../scenes/MenuScene';
import GameScene from '../scenes/GameScene';
import GameOverScene from '../scenes/GameOverScene';

const PhaserGame = () => {
    const gameRef = useRef(null);
    const phaserGameRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [scaleFactor, setScaleFactor] = useState(1);
    const [isPortraitWarning, setIsPortraitWarning] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [showControls, setShowControls] = useState(false);

    // Detect touch device and viewport
    useEffect(() => {
        const checkTouchDevice = () => {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        };
        setIsTouchDevice(checkTouchDevice());

        // Handle fullscreen for mobile devices
        if (typeof window !== 'undefined') {
            const isMobile = checkTouchDevice();

            if (isMobile) {
                const enterFullscreen = () => {
                    const docEl = document.documentElement;

                    if (docEl.requestFullscreen) {
                        docEl.requestFullscreen().catch(() => { });
                    } else if (docEl.webkitRequestFullscreen) {
                        docEl.webkitRequestFullscreen().catch(() => { });
                    } else if (docEl.mozRequestFullScreen) {
                        docEl.mozRequestFullScreen().catch(() => { });
                    } else if (docEl.msRequestFullscreen) {
                        docEl.msRequestFullscreen().catch(() => { });
                    }

                    window.scrollTo(0, 1);
                    setTimeout(() => window.scrollTo(0, 1), 100);
                };

                enterFullscreen();
                setTimeout(enterFullscreen, 500);

                const handleFirstInteraction = () => {
                    enterFullscreen();
                    document.removeEventListener('touchstart', handleFirstInteraction);
                    document.removeEventListener('click', handleFirstInteraction);
                };

                document.addEventListener('touchstart', handleFirstInteraction);
                document.addEventListener('click', handleFirstInteraction);
            }
        }
    }, []);

    // Multi-device viewport handling
    const getGameDimensions = () => {
        if (typeof window === 'undefined') return { width: 800, height: 600, scale: 1 };

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const aspectRatio = screenWidth / screenHeight;

        // Check if portrait mode on mobile/tablet
        const isPortrait = screenWidth < screenHeight;
        const isMobileSize = screenWidth <= 1024 || screenHeight <= 768;

        setIsPortraitWarning(isPortrait && isMobileSize);

        let gameWidth, gameHeight, scale;

        // Mobile phones in landscape
        if (screenWidth <= 736 && !isPortrait) {
            gameWidth = screenWidth;
            gameHeight = screenHeight;
            scale = Math.min(gameWidth / 800, gameHeight / 600);
            return {
                width: Math.max(gameWidth, 600),
                height: Math.max(gameHeight, 350),
                scale: Math.max(scale, 0.4)
            };
        }

        // Tablets in landscape
        if (screenWidth <= 1024 && !isPortrait) {
            gameWidth = screenWidth * 0.95;
            gameHeight = screenHeight * 0.95;
            scale = Math.min(gameWidth / 800, gameHeight / 600);
            return {
                width: Math.max(gameWidth, 700),
                height: Math.max(gameHeight, 500),
                scale: Math.max(scale, 0.6)
            };
        }

        // Desktop/Laptop - keep original experience
        if (screenWidth > 1024) {
            gameWidth = Math.min(screenWidth * 0.85, 1200);
            gameHeight = Math.min(screenHeight * 0.80, 800);

            // Maintain aspect ratio for desktop
            const targetAspectRatio = 4 / 3;
            if (gameWidth / gameHeight > targetAspectRatio) {
                gameWidth = gameHeight * targetAspectRatio;
            } else {
                gameHeight = gameWidth / targetAspectRatio;
            }

            scale = Math.min(gameWidth / 800, gameHeight / 600);
            return {
                width: Math.max(gameWidth, 800),
                height: Math.max(gameHeight, 600),
                scale: Math.max(scale, 1.0)
            };
        }

        // Fallback for any edge cases
        return {
            width: Math.max(screenWidth * 0.9, 600),
            height: Math.max(screenHeight * 0.9, 400),
            scale: Math.max(Math.min(screenWidth / 800, screenHeight / 600), 0.5)
        };
    };

    const handleResize = () => {
        const newDimensions = getGameDimensions();
        setDimensions(newDimensions);
        setScaleFactor(newDimensions.scale);

        if (phaserGameRef.current) {
            phaserGameRef.current.scale.resize(newDimensions.width, newDimensions.height);

            phaserGameRef.current.scene.scenes.forEach(scene => {
                if (scene.updateResponsiveScale) {
                    scene.updateResponsiveScale(newDimensions.scale, newDimensions.width, newDimensions.height);
                }
                if (scene.handleResize) {
                    scene.handleResize(newDimensions.width, newDimensions.height, newDimensions.scale);
                }
            });
        }
    };

    const handleTouchControl = (action) => {
        if (phaserGameRef.current && phaserGameRef.current.scene.scenes) {
            const activeScene = phaserGameRef.current.scene.scenes.find(scene => scene.scene.isActive());
            if (activeScene && activeScene.handleTouchInput) {
                activeScene.handleTouchInput(action);
            }
        }
    };

    useEffect(() => {
        const initialDimensions = getGameDimensions();
        setDimensions(initialDimensions);
        setScaleFactor(initialDimensions.scale);

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 500);
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && !phaserGameRef.current) {
            const config = {
                type: Phaser.AUTO,
                width: dimensions.width,
                height: dimensions.height,
                parent: gameRef.current,
                backgroundColor: '#87CEEB',
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 300 * scaleFactor },
                        debug: false
                    }
                },
                scene: [MenuScene, GameScene, GameOverScene],
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    width: dimensions.width,
                    height: dimensions.height
                },
                render: {
                    antialias: true,
                    pixelArt: false,
                    roundPixels: false
                }
            };

            phaserGameRef.current = new Phaser.Game(config);

            // Set up touch controls visibility
            if (phaserGameRef.current) {
                setTimeout(() => {
                    if (phaserGameRef.current && phaserGameRef.current.scene) {
                        phaserGameRef.current.scene.scenes.forEach(scene => {
                            if (scene) {
                                scene.responsiveScale = scaleFactor;
                                scene.gameWidth = dimensions.width;
                                scene.gameHeight = dimensions.height;
                                scene.isTouchDevice = isTouchDevice;

                                // Set up control visibility callback
                                scene.showTouchControls = () => {
                                    setShowControls(true);
                                };
                            }
                        });
                    }
                }, 200);
            }
        }

        return () => {
            if (phaserGameRef.current) {
                phaserGameRef.current.destroy(true);
                phaserGameRef.current = null;
                setShowControls(false);
            }
        };
    }, []);

    const containerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden'
    };

    return (
        <>
            <style jsx global>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    width: 100%;
                    height: 100vh;
                    height: 100dvh;
                    touch-action: manipulation;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                    -webkit-overflow-scrolling: touch;
                }

                @media screen and (max-width: 1024px) {
                    html {
                        height: -webkit-fill-available;
                        overflow: hidden;
                    }
                    
                    body {
                        min-height: 100vh;
                        min-height: -webkit-fill-available;
                        min-height: 100dvh;
                        overflow: hidden;
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                    }
                }
                
                .portrait-warning {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    height: 100dvh;
                    background: rgba(0,0,0,0.95);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                }
                
                .rotation-icon {
                    font-size: 60px;
                    animation: rotate 2s linear infinite;
                    margin-bottom: 20px;
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                canvas {
                    max-width: 100vw !important;
                    max-height: 100vh !important;
                    max-height: 100dvh !important;
                    width: auto !important;
                    height: auto !important;
                    image-rendering: optimizeSpeed;
                }

                .touch-controls {
                    position: fixed;
                    z-index: 1000;
                    pointer-events: none;
                    width: 100%;
                    height: 100%;
                }

                .touch-controls button {
                    pointer-events: all;
                    border: none;
                    background: rgba(255, 255, 255, 0.25);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    backdrop-filter: blur(15px);
                    border: 3px solid rgba(255, 255, 255, 0.5);
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: manipulation;
                    transition: all 0.15s ease;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                    font-family: 'Arial Black', sans-serif;
                    cursor: pointer;
                }

                .touch-controls button:active {
                    background: rgba(255, 255, 255, 0.5);
                    transform: scale(0.95);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
                }

                .left-controls {
                    position: fixed;
                    left: 20px;
                    bottom: 20px;
                }

                .right-controls {
                    position: fixed;
                    right: 20px;
                    bottom: 20px;
                    display: flex;
                    gap: 15px;
                    flex-direction: row;
                }

                /* Hide on desktop/laptop */
                @media (hover: hover) and (pointer: fine) and (min-width: 1025px) {
                    .touch-controls {
                        display: none !important;
                    }
                }
                
                /* Mobile phones */
                @media screen and (max-width: 480px) {
                    .touch-controls button {
                        width: 70px;
                        height: 70px;
                        font-size: 28px;
                    }
                    
                    .left-controls {
                        left: 15px;
                        bottom: 15px;
                    }
                    
                    .right-controls {
                        right: 15px;
                        bottom: 15px;
                        gap: 12px;
                    }
                }
                
                /* Large phones */
                @media screen and (min-width: 481px) and (max-width: 768px) {
                    .touch-controls button {
                        width: 80px;
                        height: 80px;
                        font-size: 32px;
                    }
                    
                    .left-controls {
                        left: 20px;
                        bottom: 20px;
                    }
                    
                    .right-controls {
                        right: 20px;
                        bottom: 20px;
                        gap: 15px;
                    }
                }
                
                /* Tablets */
                @media screen and (min-width: 769px) and (max-width: 1024px) {
                    .touch-controls button {
                        width: 90px;
                        height: 90px;
                        font-size: 36px;
                    }
                    
                    .left-controls {
                        left: 25px;
                        bottom: 25px;
                    }
                    
                    .right-controls {
                        right: 25px;
                        bottom: 25px;
                        gap: 18px;
                    }
                }

                body {
                    overscroll-behavior: none;
                    -webkit-overflow-scrolling: auto;
                    position: fixed;
                    width: 100%;
                    height: 100%;
                }

                @supports (-webkit-touch-callout: none) {
                    .game-container {
                        height: -webkit-fill-available;
                    }
                    
                    body {
                        height: -webkit-fill-available;
                    }
                }
            `}</style>

            {isPortraitWarning && (
                <div className="portrait-warning">
                    <div className="rotation-icon">📱↻</div>
                    <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>
                        🔄 Please Rotate Your Device
                    </h2>
                    <p style={{ fontSize: '18px', lineHeight: '1.4', maxWidth: '80%' }}>
                        Quiz Jump is designed for <strong>landscape mode</strong> for the best gaming experience!
                    </p>
                    <p style={{ fontSize: '16px', opacity: 0.8, marginTop: '15px' }}>
                        Turn your device sideways to continue playing 🎮
                    </p>
                </div>
            )}

            <div style={containerStyle} className="game-container">
                <div
                    ref={gameRef}
                    style={{
                        position: 'relative',
                        width: `${dimensions.width}px`,
                        height: `${dimensions.height}px`,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        overflow: 'hidden'
                    }}
                />

                {isTouchDevice && showControls && (
                    <div className="touch-controls">
                        <div className="left-controls">
                            <button
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('jump');
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('jump');
                                }}
                                title="Jump"
                            >
                                ↑
                            </button>
                        </div>

                        <div className="right-controls">
                            <button
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('moveLeft');
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('stopMove');
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('moveLeft');
                                }}
                                onMouseUp={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('stopMove');
                                }}
                                title="Move Left"
                            >
                                ←
                            </button>
                            <button
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('moveRight');
                                }}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('stopMove');
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('moveRight');
                                }}
                                onMouseUp={(e) => {
                                    e.preventDefault();
                                    handleTouchControl('stopMove');
                                }}
                                title="Move Right"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PhaserGame;

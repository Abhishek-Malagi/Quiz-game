'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import PhaserGame to avoid SSR issues with Phaser 
const PhaserGame = dynamic(() => import('../components/PhaserGame'), {
    ssr: false,
    loading: () => (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="spinner"></div>
                <h2>🎮 Loading Quiz Jump Game...</h2>
                <p>Get ready for an amazing learning adventure!</p>
            </div>
            <style jsx>{`
                .loading-screen {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    font-family: 'Arial', sans-serif;
                }
                .loading-content {
                    text-align: center;
                    padding: 40px;
                    border-radius: 15px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-top: 4px solid #fff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                h2 {
                    margin: 0 0 10px 0;
                    font-size: 24px;
                }
                p {
                    margin: 0;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    )
});

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // AGGRESSIVE FULLSCREEN FOR MOBILE
        if (typeof window !== 'undefined') {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

            if (isMobile) {
                // Hide address bar immediately
                window.scrollTo(0, 1);
                document.body.style.height = '100vh';
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';

                // Multiple fullscreen attempts
                const enterFullscreen = () => {
                    const elem = document.documentElement;

                    if (elem.requestFullscreen) {
                        elem.requestFullscreen().catch(() => { });
                    } else if (elem.webkitRequestFullscreen) {
                        elem.webkitRequestFullscreen().catch(() => { });
                    } else if (elem.mozRequestFullScreen) {
                        elem.mozRequestFullScreen().catch(() => { });
                    } else if (elem.msRequestFullscreen) {
                        elem.msRequestFullscreen().catch(() => { });
                    }

                    // Force hide address bar
                    setTimeout(() => {
                        window.scrollTo(0, 1);
                        document.body.scrollTop = 1;
                    }, 100);
                };

                // Try multiple times
                enterFullscreen();
                setTimeout(enterFullscreen, 300);
                setTimeout(enterFullscreen, 1000);

                // Also try on any user interaction
                const handleInteraction = () => {
                    enterFullscreen();
                };

                document.addEventListener('touchstart', handleInteraction, { once: true });
                document.addEventListener('click', handleInteraction, { once: true });
                document.addEventListener('keydown', handleInteraction, { once: true });

                // Prevent scrolling and zooming
                document.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                }, { passive: false });

                document.addEventListener('gesturestart', (e) => {
                    e.preventDefault();
                });
            }
        }
    }, []);

    if (!mounted) {
        return (
            <>
                <Head>
                    <title>Quiz Jump - Educational Game</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="theme-color" content="#667eea" />
                    <meta name="format-detection" content="telephone=no" />
                    <meta name="msapplication-tap-highlight" content="no" />
                    <link rel="manifest" href="/manifest.json" />
                    <style>{`
                        @media screen and (max-width: 1024px) {
                            html, body {
                                height: 100vh !important;
                                height: 100dvh !important;
                                overflow: hidden !important;
                                position: fixed !important;
                                width: 100% !important;
                            }
                        }
                    `}</style>
                </Head>
                <div className="initializing-screen">
                    <div className="init-content">
                        <div className="pulse-circle"></div>
                        <h2>🚀 Initializing Game Engine...</h2>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                    </div>
                    <style jsx>{`
                        .initializing-screen {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            min-height: 100dvh;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: #fff;
                            font-family: 'Arial', sans-serif;
                        }
                        .init-content {
                            text-align: center;
                            padding: 40px;
                        }
                        .pulse-circle {
                            width: 80px;
                            height: 80px;
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 50%;
                            margin: 0 auto 20px;
                            animation: pulse 1.5s ease-in-out infinite;
                        }
                        @keyframes pulse {
                            0% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.1); opacity: 0.7; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                        .progress-bar {
                            width: 200px;
                            height: 4px;
                            background: rgba(255, 255, 255, 0.3);
                            border-radius: 2px;
                            margin: 20px auto;
                            overflow: hidden;
                        }
                        .progress-fill {
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(90deg, #4CAF50, #8BC34A);
                            animation: progress 2s ease-in-out infinite;
                        }
                        @keyframes progress {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                        }
                        h2 {
                            margin: 0;
                            font-size: 24px;
                        }
                    `}</style>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Quiz Jump - Educational Game</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#667eea" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="msapplication-tap-highlight" content="no" />
                <link rel="manifest" href="/manifest.json" />
                <style>{`
                    @media screen and (max-width: 1024px) {
                        html, body {
                            height: 100vh !important;
                            height: 100dvh !important;
                            overflow: hidden !important;
                            position: fixed !important;
                            width: 100% !important;
                        }
                    }
                `}</style>
            </Head>
            <style jsx global>{`
                html, body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Arial', sans-serif;
                    overflow: hidden;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    height: 100vh;
                    height: 100dvh;
                    width: 100vw;
                    overscroll-behavior: none;
                    -webkit-overflow-scrolling: touch;
                    touch-action: manipulation;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                }
                * {
                    box-sizing: border-box;
                }
            `}</style>
            <PhaserGame />
        </>
    );
}

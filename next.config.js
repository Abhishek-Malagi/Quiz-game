/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        // Handle Phaser's build system and prevent SSR issues
        config.module.rules.push({
            test: /\.js$/,
            include: /node_modules\/phaser/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['next/babel']
                }
            }
        });

        // Ensure proper handling of ES modules
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
        };

        return config;
    },
    // Disable image optimization for game assets
    images: {
        unoptimized: true
    }
};

module.exports = nextConfig;

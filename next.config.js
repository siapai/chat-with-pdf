/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        webpackBuildWorker: true
    },
    async redirects() {
        return [
            {
                source: '/sign-in',
                destination: '/api/auth/login',
                permanent: true,
            },
            {
                source: '/sign-up',
                destination: '/api/auth/register',
                permanent: true,
            },
            {
                source: '/sign-out',
                destination: '/api/auth/logout',
                permanent: true,
            },
        ]
    },
    webpack: (config, {buildId, dev, isServer, defaultLoaders}) => {
        config.resolve.alias.canvas = false
        config.resolve.alias.encoding = false
        return config
    },
    images: {
        remotePatterns: [
            {
                hostname: 'lh3.googleusercontent.com',
            },
        ],
    },
}

module.exports = nextConfig

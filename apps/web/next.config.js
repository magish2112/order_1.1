/** @type {import('next').NextConfig} */
// Паттерны для медиа с хоста из NEXT_PUBLIC_API_URL (деплой по IP/домену)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
let apiMediaPatterns = []
try {
  if (apiUrl) {
    const u = new URL(apiUrl)
    if (u.hostname && !['localhost', 'api'].includes(u.hostname)) {
      const port = u.port || (u.protocol === 'https:' ? '443' : '80')
      const protocol = u.protocol === 'https:' ? 'https' : 'http'
      apiMediaPatterns = [
        { protocol, hostname: u.hostname, port, pathname: '/api/v1/media/**' },
        { protocol, hostname: u.hostname, port, pathname: '/uploads/**' },
      ]
    }
  }
} catch (_) {}

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Для Docker оптимизации
  images: {
    domains: ['localhost'],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/api/v1/media/**' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'api', port: '4000', pathname: '/api/v1/media/**' },
      { protocol: 'http', hostname: 'api', port: '4000', pathname: '/uploads/**' },
      ...apiMediaPatterns,
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
  },
}

module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com', 'cdn.shopify.com', 'images.unsplash.com'],
  },
  // Allow Shopify iframe embed
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.myshopify.com https://admin.shopify.com" },
        ],
      },
    ]
  },
}
module.exports = nextConfig

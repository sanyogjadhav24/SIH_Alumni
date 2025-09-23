/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig
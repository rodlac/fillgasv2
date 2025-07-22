/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 'serverComponentsExternalPackages' foi movido para 'serverExternalPackages' no Next.js 15
    // Removendo esta linha, pois o Prisma é automaticamente externalizado
    // serverComponentsExternalPackages: ['@prisma/client'],
  },
  serverExternalPackages: ['@prisma/client'], // Nova opção para externalizar pacotes do servidor
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
}

export default nextConfig

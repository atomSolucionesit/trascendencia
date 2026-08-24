/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Genera un build standalone compatible con el server.js de Plesk.
  output: "standalone",
  // Cada ruta se exporta como /ruta/index.html. Esto funciona bien tanto en
  // Apache como en nginx y permite abrir directamente una URL interna.
  trailingSlash: true,
}

export default nextConfig

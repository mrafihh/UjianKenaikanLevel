/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wiratech.co.id',
        pathname: '/**',
      },
      // Anda bisa menambahkan domain lain di sini jika ada sumber gambar dari tempat lain
    ],
  },
};

module.exports = nextConfig; 
// Catatan: Jika file Anda berakhiran .mjs, gunakan 'export default nextConfig;'
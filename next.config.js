/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false, // Recommended for the `pages` directory, default in `app`., reactStrictMode: true - dev módban 2x renderelődik
	swcMinify: true,
	experimental: {
		//appDir: true,
		serverComponentsExternalPackages: ["sequelize"], // elszáll a sequelize import hibával ha ez nincs benne
	  },
}

module.exports = nextConfig
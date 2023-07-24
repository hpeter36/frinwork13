const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite/**/*.js',
    './node_modules/flowbite-react/**/*.js',
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {
      colors:{
        primary_c: colors.green,
        secondary_c: colors.slate,
        terniary_c: colors.blue,
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  //prefix: 'tw-',
  //important: true,
  // corePlugins: {
  //   preflight: true,
  // },
  darkMode: "class",
  plugins: [
    require("flowbite/plugin"),
    require("tw-elements/dist/plugin.cjs")
  ],
}

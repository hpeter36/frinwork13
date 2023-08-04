const colors = require('tailwindcss/colors')

const themeOld = {
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
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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
    require("tw-elements/dist/plugin.cjs")
  ],
}

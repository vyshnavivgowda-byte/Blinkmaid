module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ===== BRAND COLORS (FROM LOGO) ===== */
      colors: {
        blinkred: "#E63946",     // Logo red (maid)
        blinkblack: "#000000",   // Logo black (Blink)
        blinkwhite: "#FFFFFF",   // Background white
      },

      /* ===== ANIMATIONS (UNCHANGED) ===== */
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 1.5s ease-in-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};

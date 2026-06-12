module.exports = {
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnightNavy: "#0B1F3A",
        deepForest: "#1F3A2D",
        champagneGold: "#C8A96B",
        ivory: "#F8F5EF",
        charcoal: "#232323",
        wineRed: "#7A1F2B",
        noblePurple: "#0B1F3A",
        burlywoodSoft: "#C8A96B",
      },
      borderRadius: { "2xl": "0.5rem" },
      boxShadow: { "soft-glass": "0 8px 32px rgba(11, 31, 58, 0.08)" }
    }
  },
  plugins: []
}

module.exports = {
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.5s',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
    },
  },
}

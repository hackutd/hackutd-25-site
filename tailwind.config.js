module.exports = {
  mode: 'jit',
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  // darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        default: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      },
      colors: {
        primary: '#7B81FF', //purple
        primaryDark: '#05149C',
        secondary: '#54DDE8', //aqua
        secondaryDark: '#40B7BA', // dark aqua
        tertiary: '#F5A3B6', //pink
        complementary: '#8AD47E', //green
        complementaryDark: '#252427',
        complementaryLight: '#4C495080', //gray
      },
      fontFamily: {
        dmSans: ['DM Sans', 'sans-serif'],
        fredoka: ['Fredoka', 'sans-serif'],
        fredokaOne: ['Fredoka One', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Fredoka', 'Roboto', 'sans-serif'],
        concertOne: ['Concert One', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        atlasi: ['Atlasi', 'sans-serif'],
      },
      width: {
        '1/8': '12.5%',
        '3/8': '37.5%',
        '5/8': '62.5%',
        '7/8': '87.5%',
        '1/7': '14.29%',
        '6/7': '85.71%',
      },
      height: {
        '9/10': '90%',
      },
      minWidth: {
        64: '16rem',
        56: '14rem',
        '160px': '160px',
        '3/4': '75%',
        '9/10': '90%',
      },
      minHeight: {
        '1/3': '33.33%',
        '9/10': '90%',
        '1/2': '50%',
        '1/4': '25%',
        '5/8': '62.5%',
        16: '4rem',
      },
      backgroundColor: (theme) => ({
        lightBackground: '#F4F4F4',
        aqua: '#D8F8FF',
        darkAqua: '#B0F1FF',
      }),
      backgroundImage: {
        'hero-pattern': `url(${'/assets/bg2.jpeg'})`, // !change
      },
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

import { Roboto } from 'next/font/google';
import { ThemeOptions } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// == tw breakpoints
//const breakpoints =

// custom vars -> TS module augmentation to Theme, ThemeOptions

// https://mui.com/material-ui/customization/default-theme/
// theme.palette.primary light, dark theme palette

const typography = {
  fontFamily: roboto.style.fontFamily,
}

const muiLightTheme: ThemeOptions = {
  palette: {
    mode: 'light',
    background: {
      paper: '#cbd5e1',
      default: '#cbd5e1'
    }
    // primary: {
    //   main: '#',
    //   light: '#',
    //   dark: '#',
    //   contrastText: '#'
    // },
    // secondary: {},
    // info: {},
    // success: {},
    // warning: {},
    // error: {},
  },
  typography: typography,
  components: {
  },
};

const muiDarkTheme: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      paper: '#334155',
      default: '#334155'
    }
  },
  typography: typography,
  components: {
  },
};

export { muiLightTheme, muiDarkTheme };

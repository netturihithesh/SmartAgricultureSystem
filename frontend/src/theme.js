import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Dark Green
    },
    secondary: {
      main: '#66BB6A', // Light Green
    },
    warning: {
      main: '#FBC02D', // Golden Yellow
    },
    background: {
      default: '#F5F7F6', // Off-white for sections
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '52px',
    },
    h2: {
      fontWeight: 700,
      fontSize: '32px',
    },
    h3: {
      fontWeight: 600,
      fontSize: '20px',
    },
    body1: {
      fontSize: '16px',
    },
    body2: {
      fontSize: '14px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '10px 22px',
        },
      },
    },
  },
});

export default theme;

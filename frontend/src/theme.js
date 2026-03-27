import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2E7D32',
      },
      secondary: {
        main: '#66BB6A',
      },
      warning: {
        main: '#FBC02D',
      },
      background: {
        default: mode === 'light' ? '#F5F7F6' : '#1e2a24',
        paper: mode === 'light' ? '#FFFFFF' : '#2a3830',
      },
      text: {
        primary: mode === 'light' ? '#333333' : '#E8F0EB',
        secondary: mode === 'light' ? '#666666' : '#99B3A5',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700, fontSize: '52px' },
      h2: { fontWeight: 700, fontSize: '32px' },
      h3: { fontWeight: 600, fontSize: '20px' },
      body1: { fontSize: '16px' },
      body2: { fontSize: '14px' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 6, padding: '10px 22px' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#243028',
            color: mode === 'light' ? '#333' : '#E8F0EB',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#fff' : '#2a3830',
          },
        },
      },
    },
  });

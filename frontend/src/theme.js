import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main:        mode === 'light' ? '#00A851' : '#39FF6A',
        light:       mode === 'light' ? '#52D08A' : '#7AE893',
        dark:        mode === 'light' ? '#007F3D' : '#16A34A',
        contrastText: mode === 'light' ? '#ffffff' : '#0D1208',
      },
      secondary: {
        main:  mode === 'light' ? '#526E5F' : '#8FA886',
        light: mode === 'light' ? '#7CA28D' : '#A8BEA4',
        dark:  mode === 'light' ? '#3B5045' : '#6A7E66',
      },
      error:   { main: '#EF4444' },
      warning: { main: '#F59E0B' },
      info:    { main: '#0288d1' },
      success: { main: '#00A851' },
      background: {
        default: mode === 'light' ? '#F4F9F6' : '#0A0D0B',
        paper:   mode === 'light' ? '#FFFFFF' : '#111613',
      },
      text: {
        primary:   mode === 'light' ? '#0B1E14' : '#EDF2EA',
        secondary: mode === 'light' ? '#526E5F' : '#9CA3AF',
        disabled:  mode === 'light' ? '#8AA394' : '#4A5E48',
      },
      divider: mode === 'light' ? '#E0EDE5' : '#1A241E',
      // Custom tokens accessible via theme.palette
      earth: {
        parchment:  '#F6F1EB',
        cream:      '#FDFAF6',
        gold:       '#B5883A',
        goldLight:  '#D4A853',
        terracotta: '#C97B4B',
        soil:       '#7A5C3A',
        mist:       '#E8F0E4',
        forest:     '#2D5A27',
        forestDeep: '#1A3A16',
      },
    },

    typography: {
      fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 900,
        fontSize: '64px',
        lineHeight: 1.08,
        letterSpacing: '-1.5px',
      },
      h2: {
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        fontSize: '44px',
        lineHeight: 1.15,
        letterSpacing: '-0.5px',
      },
      h3: {
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        fontSize: '32px',
        lineHeight: 1.2,
      },
      h4: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 800,
        fontSize: '24px',
      },
      h5: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 700,
        fontSize: '20px',
      },
      h6: {
        fontFamily: '"Inter", sans-serif',
        fontWeight: 700,
        fontSize: '17px',
      },
      subtitle1: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600,
        fontSize: '16px',
        letterSpacing: '0.3px',
      },
      subtitle2: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600,
        fontSize: '14px',
        letterSpacing: '0.3px',
      },
      body1: { fontSize: '16px', lineHeight: 1.7 },
      body2: { fontSize: '14px', lineHeight: 1.65 },
      overline: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 700,
        letterSpacing: '2.5px',
        fontSize: '11px',
      },
      button: {
        fontFamily: '"Outfit", sans-serif',
        textTransform: 'none',
        fontWeight: 700,
        letterSpacing: '0.2px',
      },
      caption: {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '12px',
        letterSpacing: '0.4px',
      },
    },

    shape: { borderRadius: 12 },

    shadows: [
      'none',
      '0 1px 3px rgba(45,90,39,0.06)',
      '0 2px 8px rgba(45,90,39,0.08)',
      '0 4px 16px rgba(45,90,39,0.09)',
      '0 6px 20px rgba(45,90,39,0.1)',
      '0 8px 24px rgba(45,90,39,0.11)',
      '0 10px 28px rgba(45,90,39,0.12)',
      '0 12px 32px rgba(45,90,39,0.12)',
      '0 14px 36px rgba(45,90,39,0.13)',
      '0 16px 40px rgba(45,90,39,0.13)',
      '0 18px 44px rgba(45,90,39,0.14)',
      '0 20px 48px rgba(45,90,39,0.14)',
      '0 22px 52px rgba(45,90,39,0.15)',
      '0 24px 56px rgba(45,90,39,0.15)',
      '0 26px 60px rgba(45,90,39,0.16)',
      '0 28px 64px rgba(45,90,39,0.16)',
      '0 30px 68px rgba(45,90,39,0.17)',
      '0 32px 72px rgba(45,90,39,0.17)',
      '0 34px 76px rgba(45,90,39,0.18)',
      '0 36px 80px rgba(45,90,39,0.18)',
      '0 38px 84px rgba(45,90,39,0.19)',
      '0 40px 88px rgba(45,90,39,0.19)',
      '0 42px 92px rgba(45,90,39,0.2)',
      '0 44px 96px rgba(45,90,39,0.2)',
      '0 46px 100px rgba(45,90,39,0.21)',
    ],

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#F8FAFC' : '#0A0D0B',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '999px',
            padding: '11px 26px',
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 700,
            fontSize: '14.5px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { transform: 'translateY(-2px)', opacity: 0.88 },
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: '20px',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#111613',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '14px',
            fontFamily: '"Inter", sans-serif',
            backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(17,22,19,0.8)',
            transition: 'all 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#059669' : '#39FF6A',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#059669' : '#39FF6A',
              borderWidth: '2px',
            },
            '&.Mui-focused': {
              boxShadow: mode === 'light'
                ? '0 0 0 4px rgba(5,150,105,0.1)'
                : '0 0 0 4px rgba(57,255,106,0.1)',
            },
          },
          notchedOutline: {
            borderColor: mode === 'light' ? '#E2E8F0' : '#1A241E',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
            borderRadius: '8px',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: '"Outfit", sans-serif',
            backgroundColor: mode === 'light' ? '#0F172A' : '#EDF2EA',
            color: mode === 'light' ? '#EDF2EA' : '#0F172A',
            fontSize: '12px',
            borderRadius: '8px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? '#E2E8F0' : '#1A241E',
          },
        },
      },
    },
  });

import React, { createContext, useContext, useState, useMemo } from 'react';

const ColorModeContext = createContext({ toggleColorMode: () => {}, mode: 'light' });

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
  const mode = 'light';

  const toggleColorMode = () => {
    // Disabled dark mode toggle
  };

  React.useEffect(() => {
    document.body.dataset.theme = 'light';
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  const value = useMemo(() => ({ mode, toggleColorMode }), []);

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
};

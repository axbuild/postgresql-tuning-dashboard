import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { PostgresDashboard } from './components/PostgresDashboard';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PostgresDashboard />
    </ThemeProvider>
  );
}

export default App; 
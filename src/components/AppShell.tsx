'use client';

import { type PropsWithChildren, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import Header from '@src/components/Header';
import Sidebar from '@src/components/Sidebar';
import ContentProvider from '@src/components/ContentProvider';

const drawerWidth = 260;

export default function AppShell({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark',
          background: {
            default: '#0c0f14',
            paper: '#121826',
          },
          primary: {
            main: '#5eead4',
          },
        },
        typography: {
          fontFamily: 'Minecraftia, sans-serif',
        },
      }),
    [],
  );
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });

  const handleToggle = () => {
    if (isDesktop) {
      setDesktopOpen((open) => !open);
    } else {
      setMobileOpen((open) => !open);
    }
  };
  const handleClose = () => setMobileOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContentProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header onMenuClick={handleToggle} />
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Sidebar
              drawerWidth={drawerWidth}
              mobileOpen={mobileOpen}
              desktopOpen={desktopOpen}
              onClose={handleClose}
            />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: { xs: 3, md: 4 },
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </ContentProvider>
    </ThemeProvider>
  );
}

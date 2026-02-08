'use client';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES } from '@src/data/content';
import { getCategoryRoute } from '@src/utils/navigation';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  desktopOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  drawerWidth,
  mobileOpen,
  desktopOpen,
  onClose,
}: SidebarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const pathname = usePathname();
  const headerOffset = { xs: '56px', md: '64px' };
  const orderedSlugs = [
    'tutorials',
    'tech',
    'documents',
    'downloads',
    'apps-tools',
    'discords',
    'youtube',
    'fanart',
  ];
  const orderedCategories = orderedSlugs
    .map((slug) => CATEGORIES.find((category) => category.slug === slug))
    .filter(Boolean);
  const drawerContent = (
    <Box sx={{ p: 0 }}>
      <List sx={{ display: 'grid', gap: 0 }}>
        <ListItemButton
          component={Link}
          prefetch={false}
          href="/"
          selected={pathname === '/'}
          onClick={() => {
            if (!isDesktop) onClose();
          }}
          sx={{
            width: '100%',
            borderRadius: 0,
            '&.Mui-selected': {
              backgroundColor: 'rgba(94,234,212,0.15)',
              color: 'primary.main',
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, letterSpacing: 0.5}}
          >
            Home
          </Typography>
        </ListItemButton>
        {orderedCategories.map((category) => {
          if (!category) return null;
          const route = getCategoryRoute(category.slug);
          const selected = pathname?.startsWith(route);
          return (
            <ListItemButton
              key={category.slug}
              component={Link}
              prefetch={false}
              href={route}
              selected={selected}
              onClick={() => {
                if (!isDesktop) onClose();
              }}
              sx={{
                width: '100%',
                borderRadius: 0,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(94,234,212,0.15)',
                  color: 'primary.main',
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, letterSpacing: 0.5 }}
              >
                {category.label}
              </Typography>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: desktopOpen ? drawerWidth : 0 }, flexShrink: 0 }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            top: headerOffset,
            height: `calc(100% - ${headerOffset.xs})`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="persistent"
        open={desktopOpen}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: desktopOpen ? drawerWidth : 0,
            top: headerOffset,
            height: `calc(100% - ${headerOffset.md})`,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

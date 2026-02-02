'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import RegularCard from '@src/components/RegularCard';
import { getDailyChannel, getDailyTip } from '@src/utils/dailyTip';
import { useContent } from '@src/components/ContentProvider';

export default function Home() {
  const { cards, loading } = useContent();
  const dailyTip = useMemo(() => getDailyTip(cards), [cards]);
  const dailyChannel = useMemo(() => getDailyChannel(cards), [cards]);

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      <Box
        aria-hidden="true"
        className="absolute inset-0"
        sx={{
          backgroundImage: 'linear-gradient(180deg, #0b0f16 0%, #0c1118 60%)',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(94,234,212,0.2), transparent 50%), radial-gradient(circle at 70% 20%, rgba(248,113,113,0.2), transparent 55%), radial-gradient(circle at 60% 80%, rgba(59,130,246,0.15), transparent 55%)',
        }}
      />
      <Container sx={{ position: 'relative', py: { xs: 6, md: 10 } }}>
        <Stack spacing={6}>
          <Box className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <Stack spacing={3}>
              {/* <Typography variant="overline" color="text.secondary">
                MCSR Hub
              </Typography> */}
              <Typography variant="h2" sx={{ fontWeight: 800 }}>
                {/* MCSR guides, tech, and community resources — in one place. */}
                MCSR Hub
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Search fast, jump to playlists, and keep up with the latest MCSR
                tutorials, tools, and community resources without digging
                through endless threads.
              </Typography>
              <Button
                component={Link}
                href="/tutorials"
                variant="contained"
                color="primary"
                sx={{ width: { xs: '100%', sm: 'fit-content' } }}
              >
                Explore
              </Button>
            </Stack>
            {/* <Box
              className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6"
              sx={{ minHeight: 260 }}
            >
              <Box className="grid h-full place-items-center rounded-2xl border border-slate-800/70 bg-slate-950/70">
                <img src="images/Hero2.png" alt="Hero graphic" />
                <Typography className="text-right" variant="subtitle1" color="text.secondary">
                - DanDannyBoy Chatter
                </Typography>
                
              </Box>
            </Box> */}
          </Box>

          <Box className="grid gap-6 md:grid-cols-2">
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(18, 24, 38, 0.8)' }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Featured Channel
                </Typography>
                <Divider />
                {loading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading featured channel...
                  </Typography>
                ) : dailyChannel ? (
                  <RegularCard card={dailyChannel} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add Youtube channel cards in `src/data/content.ts`.
                  </Typography>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(18, 24, 38, 0.8)' }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Daily Tech Tip
                </Typography>
                <Divider />
                {loading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading daily tip...
                  </Typography>
                ) : dailyTip ? (
                  <RegularCard card={dailyTip} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add cards in `src/data/content.ts` to show a daily tip.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
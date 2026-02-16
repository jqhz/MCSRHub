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
          backgroundImage: "url('/images/mc_pics/igloo_split.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.20, // optional
        }}
      />
      <Container maxWidth={false} sx={{ position: 'relative', px: { xs: 2, md: 4 }, py: 0 }}>
        <Stack spacing={6}>
          <Box
            className="grid md:items-center"
            sx={{
              minHeight: '100vh',
              py: { xs: 2, md: 3, lg: 4 },
              alignContent: 'center',
            }}
          >
            <Box
              sx={{
                // border: '1px solid rgba(148, 163, 184, 0.5)',
                // background:
                //   'linear-gradient(135deg, rgba(14, 25, 33, 0.95), rgba(33, 30, 38, 0.92))',
                px: { xs: 3, md: 5 },
                py: { xs: 4, md: 6 },
                maxWidth: { xs: '100%', md: 760, lg: '100%' },
              }}
            >
              <Stack spacing={6}>
              {/* <Typography variant="overline" color="text.secondary">
                MCSR Hub
              </Typography> */}
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.6rem', md: '4.1rem', lg: '8rem' },
                  letterSpacing: 1,
                }}
              >
                {/* MCSR guides, tech, and community resources — in one place. */}
                MCSR Hub
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: '1rem', md: '1.2rem', lg: '2rem' } }}
                color="text.secondary"
              >
                Search fast, jump to playlists, and keep up with the latest MCSR tutorials, tools, and community resources without digging through endless threads.
              </Typography>
              <Button
                component={Link}
                prefetch={false}
                href="/tutorials"
                variant="contained"
                color="primary"
                sx={{
                  width: 'fit-content',
                  px: 3,
                  py: 1.1,
                  fontSize: '2.5rem',
                }}
              >
                Explore
              </Button>
            </Stack>
            </Box>
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
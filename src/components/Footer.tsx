import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mb: 0,
        pb: 0,
        px: { xs: 2, md: 4 },
        mt: 'auto',
        textAlign: 'center',
      }}
    >
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          &copy; 2026 MCSR Hub. This site is not affiliated with Mojang or Microsoft.
        </Typography>
      </Stack>
    </Box>
  );
}
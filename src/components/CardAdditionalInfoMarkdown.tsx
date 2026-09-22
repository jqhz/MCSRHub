'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { getYouTubeId } from '@src/lib/youtube';

interface CardAdditionalInfoMarkdownProps {
  markdown: string;
}

const markdownSx = {
  '& h2, & h3, & h4': { mt: 1.5, mb: 0.75, fontWeight: 600, fontSize: '0.95rem' },
  '& p': { my: 0.75, fontSize: '0.875rem', color: 'text.secondary' },
  '& ul, & ol': { my: 0.75, pl: 2.5, fontSize: '0.875rem', color: 'text.secondary' },
  '& li': { my: 0.25 },
  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 1 },
  '& code': {
    fontSize: '0.8rem',
    px: 0.5,
    py: 0.25,
    borderRadius: 0.5,
    bgcolor: 'action.hover',
  },
};

function MarkdownLink({
  href,
  children,
}: {
  href?: string;
  children?: ReactNode;
}) {
  if (!href) {
    return <span>{children}</span>;
  }

  const youtubeId = getYouTubeId(href);
  if (youtubeId) {
    return (
      <Box sx={{ my: 1.5 }}>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{ display: 'block', mb: 1, fontSize: '0.875rem' }}
        >
          {children}
        </Link>
        <Box
          component="iframe"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title={typeof children === 'string' ? children : 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{
            width: '100%',
            aspectRatio: '16 / 9',
            border: 0,
            borderRadius: 1,
            display: 'block',
          }}
        />
      </Box>
    );
  }

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{ fontSize: '0.875rem' }}
    >
      {children}
    </Link>
  );
}

export default function CardAdditionalInfoMarkdown({
  markdown,
}: CardAdditionalInfoMarkdownProps) {
  return (
    <Typography component="div" sx={markdownSx}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: MarkdownLink,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </Typography>
  );
}

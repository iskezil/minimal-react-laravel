import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { RouterLink } from 'src/routes/components';

export type BreadcrumbLink = { name: string; href?: string };

export interface CustomBreadcrumbsProps extends BoxProps {
  heading?: string;
  links: BreadcrumbLink[];
  action?: React.ReactNode;
}

export function CustomBreadcrumbs({ heading, links, action, sx, ...other }: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1];
  const rest = links.slice(0, -1);

  return (
    <Box sx={sx} {...other}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={1}>
          {heading && <Typography variant="h4">{heading}</Typography>}
          <Breadcrumbs>
            {rest.map((link) => (
              <Link
                key={link.name}
                component={RouterLink}
                href={link.href || '#'}
                color="inherit"
                variant="body2"
              >
                {link.name}
              </Link>
            ))}
            <Typography color="text.primary" variant="body2">
              {lastLink.name}
            </Typography>
          </Breadcrumbs>
        </Stack>
        {action}
      </Stack>
    </Box>
  );
}

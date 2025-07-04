import * as React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import Link from '@mui/material/Link';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter(Boolean);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Link
        component={RouterLink}
        underline="hover"
        color="inherit"
        to="/"
        variant="body1"
      >
        Dashboard
      </Link>

      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;

        // Reconstruct the path up to this breadcrumb
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        const label = value
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return isLast ? (
          <Typography
            key={to}
            variant="body1"
            sx={{ color: 'text.primary', fontWeight: 600 }}
          >
            {label}
          </Typography>
        ) : (
          <Link
            key={to}
            component={RouterLink}
            underline="hover"
            color="inherit"
            to={to}
            variant="body1"
          >
            {label}
          </Link>
        );
      })}
    </StyledBreadcrumbs>
  );
}

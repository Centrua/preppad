import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import StarIcon from '@mui/icons-material/Star';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Avatar, Box, Menu, MenuItem, Stack, Typography } from '@mui/material';
import * as React from 'react';
import MenuButton from './MenuButton';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';

export default function Header() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <MenuButton showBadge aria-label="Open notifications" onClick={handleClick}>
          <NotificationsRoundedIcon />
        </MenuButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ minWidth: 300 }}
        >
          <MenuItem onClick={handleClose}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 1, width: 32, height: 32 }}>
              <WarningAmberIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Stock Alert: Oat Milk
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Running out by 6/21/25
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={handleClose}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 1, width: 32, height: 32 }}>
              <WarningAmberIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Stock Alert: Espresso Beans
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Running out by 6/24/25
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem onClick={handleClose}>
            <Avatar sx={{ bgcolor: 'info.main', mr: 1, width: 32, height: 32 }}>
              <StarIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Top Product: Iced Coffee
              </Typography>
              <Typography variant="caption" color="text.secondary">
                78 sold this month
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
}

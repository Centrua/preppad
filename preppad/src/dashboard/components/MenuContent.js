import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ErrorIcon from '@mui/icons-material/Error';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { Link, useLocation } from 'react-router-dom';

const mainListItems = [
  { text: 'Dashboard', icon: <HomeRoundedIcon />, path: '/dashboard' },
  { text: 'Inventory', icon: <AnalyticsRoundedIcon />, path: '/inventory' },
  { text: 'Add Item', icon: <PeopleRoundedIcon />, path: '/add-item' },
  { text: 'Receive Shipment', icon: <AssignmentRoundedIcon />, path: '/receive' },
  { text: 'Low Stock', icon: <ErrorIcon />, path: '/low-stock' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
];

const secondaryListItems = [
  { text: 'Integrations', icon: <SettingsRoundedIcon />, path: '/square-oauth' },
  //{ text: 'About', icon: <InfoRoundedIcon />, path: '/about' },
  //{ text: 'Feedback', icon: <HelpRoundedIcon />, path: '/feedback' },
];

export default function MenuContent() {
  const location = useLocation();

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

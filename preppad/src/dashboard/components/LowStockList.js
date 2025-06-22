import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Avatar,
  Card,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import * as React from 'react';

const lowStockData = [
  { name: 'Espresso Beans', count: 12, runOutDate: '2025-06-25' },
  { name: 'Oat Milk', count: 4, runOutDate: '2025-06-22' },
  { name: 'Small Cups', count: 7, runOutDate: '2025-06-23' },
];

export default function LowStockList() {
  return (
    <Card variant="outlined" sx={{ minheight: '25%', flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom>
        Stock Alerts
      </Typography>
      <List>
        {lowStockData.map((item, index) => (
          <React.Fragment key={item.name}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <WarningAmberIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={item.name}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      Count: {item.count}
                    </Typography>
                    {' — '}
                    Run out by {new Date(item.runOutDate).toLocaleDateString()}
                  </>
                }
              />
            </ListItem>
            {index < lowStockData.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Card>
  );
}

import AccessTimeIcon from '@mui/icons-material/AccessTime'; // icon for expiration
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

const expiringSoonData = [
  { name: 'Whole Milk', count: 8, expiryDate: '2025-06-23' },
  { name: 'Chocolate Syrup', count: 2, expiryDate: '2025-06-24' },
  { name: 'Almond Milk', count: 5, expiryDate: '2025-06-25' },
];

export default function ExpiringSoonList() {
  return (
    <Card variant="outlined" sx={{ minHeight: '25%', flexGrow: 1, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Expiring Soon
      </Typography>
      <List>
        {expiringSoonData.map((item, index) => (
          <React.Fragment key={item.name}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <AccessTimeIcon />
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
                      Quantity: {item.count}
                    </Typography>
                    {' — '}
                    Expires on {new Date(item.expiryDate).toLocaleDateString()}
                  </>
                }
              />
            </ListItem>
            {index < expiringSoonData.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
    </Card>
  );
}

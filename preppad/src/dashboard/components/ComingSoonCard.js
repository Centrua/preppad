import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

export default function ComingSoonCard() {
    return (
        <Card variant="outlined" sx={{ minHeight: '25%', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CardContent
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <HourglassEmptyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography component="h2" variant="h6" align="center" sx={{ mb: 1 }}>
                    Coming Soon
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                    New features and insights will appear here soon.
                </Typography>
            </CardContent>
        </Card>
    );
}
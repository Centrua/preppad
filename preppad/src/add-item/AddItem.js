import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import Quagga from 'quagga';
import * as React from 'react';
import AppNavbar from '../dashboard/components/AppNavbar';
import SideMenu from '../dashboard/components/SideMenu';
import {
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from '../dashboard/theme/customizations';
import AppTheme from '../shared-theme/AppTheme';

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

export default function AddItem(props) {
    const videoRef = React.useRef(null);
    const [scannedCode, setScannedCode] = React.useState('');
    const scannedCodeRef = React.useRef('');

    const handleDetected = React.useCallback((result) => {
        const code = result.codeResult.code;
        if (code !== scannedCodeRef.current) {
            scannedCodeRef.current = code;
            setScannedCode(code);
            Quagga.offDetected(handleDetected);
        }
    }, []);

    React.useEffect(() => {
        Quagga.init({
            inputStream: {
                type: 'LiveStream',
                constraints: {
                    facingMode: 'environment',
                },
                target: videoRef.current,
            },
            decoder: {
                readers: ['upc_reader'],
                debug: {
                    drawBoundingBox: true,
                    drawScanline: true,
                }
            },
            locate: true,
        }, (err) => {
            if (err) {
                console.error('Quagga init error:', err);
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected(handleDetected);

        return () => {
            Quagga.offDetected(handleDetected);
            Quagga.stop();
        };
    }, []);

    const handleScreenClick = () => {
        if (scannedCodeRef.current !== '') {
            scannedCodeRef.current = '';
            setScannedCode('');

            setTimeout(() => {
                Quagga.onDetected(handleDetected);
            }, 1000);
        }
    };

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }} onClick={handleScreenClick}>
                <SideMenu />
                <AppNavbar />
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars
                            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                            : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                        mt: 3,
                    })}
                >
                    <Stack
                        spacing={2}
                        sx={{
                            alignItems: 'center',
                            mx: 3,
                            pb: 5,
                            mt: { xs: 8, md: 0 },
                            position: 'relative',
                        }}
                    >
                        {/* Video Feed */}
                        <Box
                            ref={videoRef}
                            sx={{
                                width: '100%',
                                maxWidth: 500,
                                height: 300,
                                border: '2px solid #ccc',
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        />

                        {/* Overlay Barcode if Detected */}
                        {scannedCode && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    height: { xs: 200, sm: 250, md: 300 },
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    padding: '16px 24px',
                                    borderRadius: 2,
                                    color: '#fff',
                                    zIndex: 10,
                                }}
                            >
                                <Typography variant="h6">Barcode Detected</Typography>
                                <Typography variant="body1">{scannedCode}</Typography>
                                <Typography variant="caption">
                                    Click anywhere to scan again
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}

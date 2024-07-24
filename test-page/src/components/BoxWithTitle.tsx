// BoxWithTitle.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface BoxWithTitleProps {
    title: string;
    children: React.ReactNode;
    sx?: object; // Allow for custom styles to be passed
}

const BoxWithTitle: React.FC<BoxWithTitleProps> = ({ title, children, sx }) => {
    return (
        <Box
            sx={{
                position: 'relative',
                border: '1px solid grey',
                borderRadius: 4,
                p: 1,
                mt: 2,
                ...sx, // Spread any custom styles passed as props
            }}
        >
            <Typography
                sx={{
                    position: 'absolute',
                    top: -20, // Adjust based on the size of the Typography
                }}
                variant="body2"
            >
                {title}
            </Typography>
            {children}
        </Box>
    );
};

export default BoxWithTitle;

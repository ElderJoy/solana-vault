import type { FC } from 'react';
import Box from '@mui/material/Box';
import { CommonProps } from '../common';

export const RegisterUserAccountBox: FC<CommonProps> = (props) => {
    return (
        <Box component="section" p={2} sx={{ border: '2px solid grey', borderRadius: 5 }}>
            CeFi Base URL: {props.cefiBaseURL}
        </Box>
    );
};

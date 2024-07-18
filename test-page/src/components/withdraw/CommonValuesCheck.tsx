import { type FC } from 'react';
import { brockerIds, chainIds, CommonProps } from '../common';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export const CommonValuesCheck: FC<CommonProps> = (props) => {
    return (
        <Box>
            <FormControl fullWidth margin="normal" variant="standard">
                <InputLabel>Broker ID</InputLabel>
                <Select
                    value={props.brokerId}
                    label="Broker ID"
                    onChange={(event) => props.setBrokerId(event.target.value)}
                >
                    {brockerIds.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" variant="standard">
                <InputLabel>Chain ID</InputLabel>
                <Select
                    value={props.chainId.toString()}
                    label="Chain ID"
                    onChange={(event) => props.setChainId(BigInt(event.target.value))}
                >
                    {chainIds.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

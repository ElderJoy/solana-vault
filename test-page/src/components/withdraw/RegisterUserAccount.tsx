import { useEffect, useState, type FC } from 'react';
import { CommonProps } from '../common';
import { CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import BoxWithTitle from '../BoxWithTitle';

type RegistrationNonceData = {
    success: boolean;
    data: {
        registration_nonce: string;
    };
    timestamp: number;
};

interface AccountRegistrationMessage {
    brokerId: string;
    chainId: BigInt;
    timestamp: BigInt;
    registrationNonce: BigInt;
}

const brokerIdOptions = ['Broker 1', 'Broker 2', 'Broker 3'];
const chainIdOptions = ['Chain 1', 'Chain 2', 'Chain 3'];

export const RegisterUserAccountBox: FC<CommonProps> = (props) => {
    const [registration_nonce, setRegistrationNonce] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [selectedBrokerId, setSelectedBrokerId] = useState<string>();
    const [selectedChainId, setSelectedChainId] = useState<string>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(props.cefiBaseURL + '/v1/registration_nonce', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Response from external server:', response);

                if (response.status !== 200) {
                    throw new Error('Network response was not ok');
                }

                const registrationNonceData: RegistrationNonceData = await response.json();

                if (!registrationNonceData.success) {
                    throw new Error('Request was not successful');
                }

                const registration_nonce = registrationNonceData.data.registration_nonce;
                setRegistrationNonce(registration_nonce);
            } catch (error) {
                console.log(error);
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    // Handle cases where the error is not an instance of Error
                    // For example, you might want to set a generic error message
                    setError('An unexpected error occurred');
                }
            }
        };

        fetchData();
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <BoxWithTitle title="User Registration">
            {error && <p>Error: {error}</p>}
            {registration_nonce ? (
                <>
                    <FormControl fullWidth margin="normal" variant="standard">
                        <InputLabel>Broker ID</InputLabel>
                        <Select
                            value={selectedBrokerId}
                            label="Broker ID"
                            onChange={(event) => setSelectedBrokerId(event.target.value)}
                        >
                            {brokerIdOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal" variant="standard">
                        <InputLabel>Chain ID</InputLabel>
                        <Select
                            value={selectedChainId}
                            label="Chain ID"
                            onChange={(event) => setSelectedChainId(event.target.value)}
                        >
                            {chainIdOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </>
            ) : (
                <CircularProgress />
            )}
        </BoxWithTitle>
    );
};

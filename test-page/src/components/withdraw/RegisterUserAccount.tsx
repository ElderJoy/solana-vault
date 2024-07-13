import { useEffect, useState, type FC } from 'react';
import { brockerIds, chainIds, CommonProps } from '../common';
import { Button, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import BoxWithTitle from '../BoxWithTitle';
import { useNotify } from '../notify';

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

export const RegisterUserAccountBox: FC<CommonProps> = (props) => {
    const [registration_nonce, setRegistrationNonce] = useState<string | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);
    const [selectedBrokerId, setSelectedBrokerId] = useState<string>();
    const [selectedChainId, setSelectedChainId] = useState<string>();
    const notify = useNotify();

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

    const getRegistrationNonce = async () => {
        try {
            const response = await fetch(props.cefiBaseURL + '/v1/registration_nonce', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 200) {
                notify('error', 'Network response was not ok');
                return;
            }

            const registrationNonceData: RegistrationNonceData = await response.json();

            if (!registrationNonceData.success) {
                notify('error', 'Request was not successful');
                return;
            }

            return registrationNonceData.data.registration_nonce;
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

    const registerAccount = async () => {
        if (!registration_nonce) {
            notify('error', 'Registration nonce not available');
            return;
        }

        if (!selectedBrokerId || !selectedChainId) {
            notify('error', 'Broker ID and Chain ID must be selected');
            return;
        }

        const accountRegistrationMessage: AccountRegistrationMessage = {
            brokerId: selectedBrokerId,
            chainId: BigInt(selectedChainId),
            timestamp: BigInt(Date.now()),
            registrationNonce: BigInt(registration_nonce),
        };

        try {
            const response = await fetch(props.cefiBaseURL + '/v1/register_account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(accountRegistrationMessage),
            });

            console.log('Response from external server:', response);

            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error('Request was not successful');
            }

            console.log('Account registration successful');
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
                            value={selectedChainId}
                            label="Chain ID"
                            onChange={(event) => setSelectedChainId(event.target.value)}
                        >
                            {chainIds.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" color="secondary" onClick={registerAccount}>
                        Register Account
                    </Button>
                </>
            ) : (
                <CircularProgress />
            )}
        </BoxWithTitle>
    );
};

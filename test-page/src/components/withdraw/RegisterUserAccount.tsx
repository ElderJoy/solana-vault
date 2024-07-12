import { useEffect, useState, type FC } from 'react';
import Card from '@mui/material/Box';
import { CommonProps } from '../common';

type RegistrationNonceData = {
    success: boolean;
    data: {
        registration_nonce: string;
    };
    timestamp: number;
};

export const RegisterUserAccountBox: FC<CommonProps> = (props) => {
    const [registration_nonce, setRegistrationNonce] = useState<string | undefined>(undefined);
    const [error, setError] = useState(null);

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
            }
        };

        fetchData();
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <Card component="section" p={2} sx={{ border: '2px solid grey', borderRadius: 5 }}>
            {error && <p>Error: {error}</p>}
            {registration_nonce ? <p>Registration nonce: {registration_nonce}</p> : <p>Loading...</p>}
        </Card>
    );
};

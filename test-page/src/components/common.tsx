export interface CommonProps {
    cefiBaseURL: string;
}

export const chainIds = [900900900, 901901901, 902902902];

export const brockerIds = ['woofi_dex', 'orderly', 'woofi_pro'];

export const getCeFiBaseURL = (): string => {
    return process.env.CEFI_BASE_UI ? process.env.CEFI_BASE_UI : 'http://localhost:3001';
};

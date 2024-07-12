export interface CommonProps {
    cefiBaseURL: string;
}

export enum ChainId {
    Mainnet = 900900900,
    Testnet = 901901901,
    Devnet = 902902902,
}

export const getChainId = (chainId: ChainId): ChainId => {
    return chainId;
};

export const getCeFiBaseURL = (): string => {
    return process.env.CEFI_BASE_UI ? process.env.CEFI_BASE_UI : 'http://localhost:3001';
};

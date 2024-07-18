interface BaseMessage {
    brokerId: string;
    chainId: BigInt;
    timestamp: BigInt;
    chainType: string;
}

interface BaseBody<T extends BaseMessage> {
    message: T;
    signature: string;
    userAddress: string;
}
import type { FC } from 'react';
import { CommonProps } from '../common';
import BoxWithTitle from '../BoxWithTitle';

export const CeFiBaseUrlView: FC<CommonProps> = (props) => {
    return <BoxWithTitle title="CeFi Base URL">{props.cefiBaseURL}</BoxWithTitle>;
};

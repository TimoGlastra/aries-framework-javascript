import type { Wallet } from '@credo-ts/core';
import { AskarWallet, AskarProfileWallet } from '../wallet';
export declare function assertAskarWallet(wallet: Wallet): asserts wallet is AskarProfileWallet | AskarWallet;

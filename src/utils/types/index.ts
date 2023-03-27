import { ethers, BigNumber } from 'ethers';
import { SigningKey } from 'ethers/lib/utils';
import { Responder } from '../../components/signers/signers';

export interface InfoByChain {
  [key: number]: {
    providerUrl?: string;
    bridgeOwnerPrivateKey?: SigningKey;
    bridgeAddress?: string;
    bridgeDeployedBlockNumber?: number;
  }
}

export type OriginalToken = {
  tokenAddress: string;
  originChainId: string;
}

export type User = {
  _address: string;
  chainId: BigNumber;
}

export type SourceTxData = {
  transactionHash: string;
  blockHash: string;
  logIndex: number;
}

export type Signature = {
  v: number;
  r: string;
  s: string;
}

export type DepositData = {
  from: User;
  to: User;
  spender: string;
  token: string;
  value: string;
  deadline: BigNumber;
  approveTokenTransferSig: Signature;
}

export type ClaimData = {
  from: User;
  to: User;
  value: BigNumber;
  token: OriginalToken; // used to indicate which is the original ERC20 (info that must be stored on all bridges)
  depositTxSourceToken: string; // the deposited token address that triggered the transfer (WERC20/ERC20)
  targetTokenAddress: string; // Todo refactor contract to not use this // if the operator populates this address then the token will be released else it indicates that the claimed token is a wrapped one
  targetTokenName: string; // provided by operator to name new wrapped token
  targetTokenSymbol: string; // provided by operator to name new wrapped token
  deadline: BigNumber; // provided by operator in case we want to have a deadline (most of the times there will be none)
  sourceTxData: SourceTxData;
}

export type TransactionData = {
  id: string;
  eventName: string;
  fromChain: number;
  toChain: number;
  fromAddress: string;
  toAddress: string;
  transferedTokenAddress: string;
  originalTokenAddress: string;
  originalChainId: number;
  txHash: string;
  blockHash: string;
  logIndex: number;
  blockNumber: number;
  blockTimestamp: number;
  claimData: ClaimData;
  isClaimed: boolean;
  claimedTxHash: string;
  claimedBlockHash: string;
  claimedLogIndex: number;
}

export type LastBlockNumberData = {
  chain: number;
  bridgeAddress: string;
  lastBlockNumber: number;
}

export type SignersAndBridgesByChain = {
  [chain: number | string]: Responder;
}

export type RawEventData = {
  parsedLog: ethers.utils.LogDescription,
  transactionData: {
    transactionHash: string;
    blockHash: string;
    logIndex: number;
    blockNumber: number;
  }
}

export type SavedTokenData = {
  [chainId: number | string]: {
    [address: string]: {
      saved: boolean;
      name: string;
      symbol: string;
    }
  }
}

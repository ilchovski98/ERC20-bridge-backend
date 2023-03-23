import { ethers, Wallet, Contract } from 'ethers';
import { SigningKey } from 'ethers/lib/utils';

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
  chainId: string;
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
  deadline: string;
  approveTokenTransferSig: Signature;
}

export type ClaimData = {
  from: User;
  to: User;
  value: string;
  token: OriginalToken; // used to indicate which is the original ERC20 (info that must be stored on all bridges)
  depositTxSourceToken: string; // the deposited token address that triggered the transfer (WERC20/ERC20)
  targetTokenAddress: string; // Todo refactor contract to not use this // if the operator populates this address then the token will be released else it indicates that the claimed token is a wrapped one
  targetTokenName: string; // provided by operator to name new wrapped token
  targetTokenSymbol: string; // provided by operator to name new wrapped token
  deadline: string; // provided by operator in case we want to have a deadline (most of the times there will be none)
  sourceTxData: SourceTxData;
}

export type TransactionData = {
  eventName: string;
  fromChain: string;
  toChain: string;
  fromAddress: string;
  toAddress: string;
  transferedTokenAddress: string;
  originalTokenAddress: string;
  originalChainId: string;
  txHash: string;
  blockHash: string;
  logIndex: string;
  blockNumber: number;
  claimSignature: string;
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
  [chain: number | string]: {
    provider: ethers.providers.JsonRpcProvider;
    signer: Wallet;
    bridgeContract: Contract;
  }
}

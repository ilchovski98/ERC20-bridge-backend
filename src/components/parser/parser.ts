import { signersAndBridgesByChain } from '../signers/signers';
import { ClaimData, RawEventData } from '../../utils/types';
import { ethers } from 'ethers';

// export type ClaimData = {
//   from: User;
//   to: User;
//   value: string;
//   token: OriginalToken; // used to indicate which is the original ERC20 (info that must be stored on all bridges)
//   depositTxSourceToken: string; // the deposited token address that triggered the transfer (WERC20/ERC20)
//   targetTokenAddress: string; // Todo refactor contract to not use this // if the operator populates this address then the token will be released else it indicates that the claimed token is a wrapped one
//   targetTokenName: string; // provided by operator to name new wrapped token
//   targetTokenSymbol: string; // provided by operator to name new wrapped token
//   deadline: string; // provided by operator in case we want to have a deadline (most of the times there will be none)
//   sourceTxData: SourceTxData;
// }

// export type TransactionData = {
//   eventName: string;
//   fromChain: string;
//   toChain: string;
//   fromAddress: string;
//   toAddress: string;
//   transferedTokenAddress: string;
//   originalTokenAddress: string;
//   originalChainId: string;
//   txHash: string;
//   blockHash: string;
//   logIndex: string;
//   blockNumber: number;
//   claimSignature: string;
//   isClaimed: boolean;
//   claimedTxHash: string;
//   claimedBlockHash: string;
//   claimedLogIndex: number;
// }

// create functions that will be called when an event occurs
/*
  Events:

  sending:
  LockOriginalToken
  BurnWrappedToken

  receiving:
  ReleaseOriginalToken
  MintWrappedToken
*/

export const parseDepositEvent = async (eventData: RawEventData) => {
  const parsedLog = eventData.parsedLog;
  const args = parsedLog.args;
  const transactionData = eventData.transactionData;
  let parseTransaction;

  if (parsedLog.name == 'LockOriginalToken') {
    const claimData: ClaimData = {
      from: {
        _address: args.sender,
        chainId: args.sourceChainId,
      },
      to: {
        _address: args.recepient,
        chainId: args.toChainId,
      },
      value: args.value,
      token: {
        tokenAddress: args.lockedTokenAddress,
        originChainId: args.sourceChainId,
      },
      depositTxSourceToken: args.lockedTokenAddress,
      targetTokenAddress: ethers.constants.AddressZero,
      targetTokenName: 'Wrapped ' + tokenName, // Todo cache token names
      targetTokenSymbol: 'W' + tokenSymbol, // Todo cache token symbols
      deadline: ethers.constants.MaxUint256.toString(),
      sourceTxData: {
        transactionHash: transactionData.transactionHash,
        blockHash: transactionData.blockHash,
        logIndex: transactionData.logIndex,
      },
    }

    parseTransaction = {
      id: `${transactionData.transactionHash}-${transactionData.blockHash}-${transactionData.logIndex}`,
      eventName: parsedLog.name,
      fromChain: args.sourceChainId,
      toChain: args.toChainId,
      fromAddress: args.sender,
      toAddress: args.recepient,
      transferedTokenAddress: args.lockedTokenAddress,
      originalTokenAddress: args.lockedTokenAddress,
      originalChainId: args.sourceChainId,
      txHash: transactionData.transactionHash,
      blockHash: transactionData.blockHash,
      logIndex: transactionData.logIndex,
      blockNumber: transactionData.blockNumber,
      claimSignature: '',
      isClaimed: false,
      claimedTxHash: '',
      claimedBlockHash: '',
      claimedLogIndex: ''
    }
  } else if (parsedLog.name == 'BurnWrappedToken') {
    parseTransaction = {
      id: `${transactionData.transactionHash}-${transactionData.blockHash}-${transactionData.logIndex}`,
      eventName: parsedLog.name,
      fromChain: args.sourceChainId,
      toChain: args.toChainId,
      fromAddress: args.sender,
      toAddress: args.recepient,
      transferedTokenAddress: args.burnedWrappedTokenAddress,
      originalTokenAddress: args.originalTokenAddress,
      originalChainId: args.originalTokenChainId,
      txHash: transactionData.transactionHash,
      blockHash: transactionData.blockHash,
      logIndex: transactionData.logIndex,
      blockNumber: transactionData.blockNumber,
      claimSignature: '', // needs to be signed before stored to db
      isClaimed: false,
      claimedTxHash: '',
      claimedBlockHash: '',
      claimedLogIndex: ''
    }
  }

  if (!parseTransaction) {
    console.error('parseDepositEvent(): Event name does not match!');
    return;
  }

  return parseTransaction;
}

export const parseClaimEvent = async (eventData: RawEventData) => {

}

export const parseDepositEvents = async (eventData: RawEventData[]) => {

}

export const parseClaimEvents = async (eventData: RawEventData[]) => {

}


// based on the event type deposit || claim will either
// deposit : get needed data from the event, create claimData and sign it, store the data and the signature in the transaction
// claim : get needed data from the event, identify the deposit transaction and populate the needed fields claimed and etc...

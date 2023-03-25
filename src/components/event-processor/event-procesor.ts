import { ethers } from 'ethers';

import { signersAndBridgesByChain } from '../signers/signers';
import { ClaimData, RawEventData, TransactionData } from '../../utils/types';
import { getTokenData } from '../tokenData/tokenData';
import { createTransaction } from '../../routes/transactions';

/*
  Events:

  sending:
  LockOriginalToken
  BurnWrappedToken

  receiving:
  ReleaseOriginalToken
  MintWrappedToken
*/

export const processDepositEvent = async (eventData: RawEventData) => {
  const parsedLog = eventData.parsedLog;
  const args = parsedLog.args;
  const transactionData = eventData.transactionData;
  let parseTransaction: TransactionData | undefined;

  if (parsedLog.name == 'LockOriginalToken') {
    const tokenData = await getTokenData(args.lockedTokenAddress, args.sourceChainId);

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
      targetTokenName: 'Wrapped ' + tokenData.name,
      targetTokenSymbol: 'W' + tokenData.symbol,
      deadline: ethers.constants.MaxUint256.toString(),
      sourceTxData: {
        transactionHash: transactionData.transactionHash,
        blockHash: transactionData.blockHash,
        logIndex: transactionData.logIndex,
      }
    }

    const claimSignature = await signersAndBridgesByChain[args.sourceChainId].signClaimData(claimData);

    console.log('claimSignature', claimSignature);

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
      claimData: claimData,
      claimSignature: claimSignature,
      isClaimed: false,
      claimedTxHash: '',
      claimedBlockHash: '',
      claimedLogIndex: 0
    }
  } else if (parsedLog.name == 'BurnWrappedToken') {
    let targetTokenAddress, tokenData;

    if (args.originalTokenChainId === args.toChainId) {
      // Claiming original token
      targetTokenAddress = ethers.constants.AddressZero;
      tokenData = await getTokenData(args.originalTokenAddress, args.originalTokenChainId);
    } else {
      // Claiming wrapped token
      targetTokenAddress = args.originalTokenAddress;
      tokenData = await getTokenData(args.burnedWrappedTokenAddress, args.sourceChainId);
    }

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
        tokenAddress: args.originalTokenAddress,
        originChainId: args.originalTokenChainId,
      },
      depositTxSourceToken: args.burnedWrappedTokenAddress,
      targetTokenAddress: targetTokenAddress,
      targetTokenName: tokenData.name,
      targetTokenSymbol: tokenData.symbol,
      deadline: ethers.constants.MaxUint256.toString(),
      sourceTxData: {
        transactionHash: transactionData.transactionHash,
        blockHash: transactionData.blockHash,
        logIndex: transactionData.logIndex,
      },
    };

    const claimSignature = await signersAndBridgesByChain[args.sourceChainId].signClaimData(claimData);

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
      claimData: claimData,
      claimSignature: claimSignature,
      isClaimed: false,
      claimedTxHash: '',
      claimedBlockHash: '',
      claimedLogIndex: 0
    }
  }

  if (!parseTransaction) {
    console.error('parseDepositEvent(): Event name does not match!');
    return;
  }

  return parseTransaction;
}

export const saveDepositTransaction = async (eventData: RawEventData) => {
  const transaction = await processDepositEvent(eventData);
  if (transaction) {
    await createTransaction(transaction);
  }
}

export const processClaimEvent = async (eventData: RawEventData) => {
  // search for id in database
  // if not found throw warrning that there is a claim event without deposit transaction (potential bug)
  // if found update is claimed and claimTXHash and etc
}

export const processDepositEvents = async (eventData: RawEventData[]) => {
  // processDepositEvent() on a loop in array
  // batch save in database
}

export const processClaimEvents = async (eventData: RawEventData[]) => {
  // processClaimEvent() on a loop
}


// based on the event type deposit || claim will either
// deposit : get needed data from the event, create claimData and sign it, store the data and the signature in the transaction
// claim : get needed data from the event, identify the deposit transaction and populate the needed fields claimed and etc...

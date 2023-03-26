import { ethers } from 'ethers';

import { signersAndBridgesByChain } from '../signers/signers';
import { ClaimData, RawEventData, TransactionData } from '../../utils/types';
import { getTokenData } from '../tokenData/tokenData';
import { createTransaction, getTransactionById, findTransactionAndUpdate, createTransactionInBatch } from '../../routes/transactions';

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
  const parsedLog = eventData.parsedLog;
  const args = parsedLog.args;
  const transactionData = eventData.transactionData;
  // search for id in database
  // todo check when you try to update non existent record in db what happens we can avoid calling db twice
  const depositId = `${args.transactionHash}-${args.blockHash}-${args.logIndex}`;
  const result = await getTransactionById(depositId);

  if (result) {
    await findTransactionAndUpdate({ id: depositId }, {
      isClaimed: true,
      claimedTxHash: transactionData.transactionHash,
      claimedBlockHash: transactionData.blockHash,
      claimedLogIndex: transactionData.logIndex
    });
  } else {
    console.error(`There is no recorded deposit transaction for claim event:`, transactionData);
  }
}

export const processDepositEvents = async (eventsData: RawEventData[]) => {
  const batch: TransactionData[] = [];

  for (let i = 0; i < eventsData.length; i++) {
    const result = await processDepositEvent(eventsData[i]);
    if (result) {
      batch.push(result);
    }
  }

  return batch;
}

export const saveDepositEvents = async (eventsData: RawEventData[]) => {
  const batch = await processDepositEvents(eventsData);
  await createTransactionInBatch(batch);
}

export const processClaimEvents = async (eventsData: RawEventData[]) => {
  for (let i = 0; i < eventsData.length; i++) {
    await processClaimEvent(eventsData[i]);
  }
}

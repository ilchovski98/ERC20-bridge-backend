import { ethers } from 'ethers';

import { signersAndBridgesByChain } from '../signers/signers';
import { executeAllRequests } from '../../utils';
import { ClaimData, RawEventData, TransactionData } from '../../utils/types';
import { getTokenData } from '../tokenData/tokenData';
import { createTransaction, getTransactionById, findTransactionAndUpdate } from '../../routes/transactions';

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
      targetTokenName: 'Wrapped ' + tokenData.name, // todo names on site doesnt work
      targetTokenSymbol: 'W' + tokenData.symbol,
      deadline: ethers.constants.MaxUint256,
      sourceTxData: {
        transactionHash: transactionData.transactionHash,
        blockHash: transactionData.blockHash,
        logIndex: transactionData.logIndex,
      }
    }

    parseTransaction = {
      id: `${transactionData.transactionHash}-${transactionData.blockHash}-${transactionData.logIndex}`,
      eventName: parsedLog.name,
      fromChain: args.sourceChainId.toNumber(),
      toChain: args.toChainId.toNumber(),
      fromAddress: args.sender,
      toAddress: args.recepient,
      transferedTokenAddress: args.lockedTokenAddress,
      originalTokenAddress: args.lockedTokenAddress,
      originalChainId: args.sourceChainId.toNumber(),
      txHash: transactionData.transactionHash,
      blockHash: transactionData.blockHash,
      logIndex: transactionData.logIndex,
      blockNumber: transactionData.blockNumber,
      claimData: claimData,
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
      console.log('Claiming original token', tokenData);
    } else {
      // Claiming wrapped token
      targetTokenAddress = args.originalTokenAddress;
      tokenData = await getTokenData(args.burnedWrappedTokenAddress, args.sourceChainId);
      console.log('Claiming wrapped token', tokenData);
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
      deadline: ethers.constants.MaxUint256,
      sourceTxData: {
        transactionHash: transactionData.transactionHash,
        blockHash: transactionData.blockHash,
        logIndex: transactionData.logIndex,
      },
    };

    parseTransaction = {
      id: `${transactionData.transactionHash}-${transactionData.blockHash}-${transactionData.logIndex}`,
      eventName: parsedLog.name,
      fromChain: args.sourceChainId.toNumber(),
      toChain: args.toChainId.toNumber(),
      fromAddress: args.sender,
      toAddress: args.recepient,
      transferedTokenAddress: args.burnedWrappedTokenAddress,
      originalTokenAddress: args.originalTokenAddress,
      originalChainId: args.originalTokenChainId.toNumber(),
      txHash: transactionData.transactionHash,
      blockHash: transactionData.blockHash,
      logIndex: transactionData.logIndex,
      blockNumber: transactionData.blockNumber,
      claimData: claimData,
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

export const saveDepositEvent = async (eventData: RawEventData) => {
  try {
    const transaction = await processDepositEvent(eventData);
    if (transaction) {
      await createTransaction(transaction);
    }
  } catch (error) {
    console.error(error);
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

export const saveDepositEvents = async (eventsData: RawEventData[]) => {
  await executeAllRequests(eventsData, saveDepositEvent);
}

export const processClaimEvents = async (eventsData: RawEventData[]) => {
  await executeAllRequests(eventsData, processClaimEvent);
}

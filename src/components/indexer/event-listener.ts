import { ethers } from 'ethers';

import { infoByChain } from '../../config';
import { signersAndBridgesByChain } from '../signers/signers';
import { getLastProcessedBlockNumber, updateLastBlockNumber } from '../../routes/lastBlockNumbers';
import { saveDepositEvent, processClaimEvent, processClaimEvents, saveDepositEvents } from '../event-processor/event-procesor';
import { executeAllRequests } from '../../utils';

import bridgeABI from '../../utils/contract/abi/Bridge.json';
import { RawEventData } from '../../utils/types';

const firstTopic = [
  ethers.utils.id('LockOriginalToken(address,uint256,address,address,uint256,uint256)'),
  ethers.utils.id('BurnWrappedToken(address,uint256,address,address,uint256,uint256,address,uint256)'),
  ethers.utils.id('ReleaseOriginalToken(address,uint256,address,address,uint256,uint256,address,bytes32,bytes32,uint256)'),
  ethers.utils.id('MintWrappedToken(address,uint256,address,address,uint256,uint256,address,uint256,bytes32,bytes32,uint256)')
];

const filter = {
  topics: [firstTopic]
}

const seperateEventsByType = (events: RawEventData[]) => {
  const depositTx: RawEventData[] = [];
  const claimTx: RawEventData[] = [];

  events.forEach((eventData: RawEventData) => {
    const eventParsedLog = eventData.parsedLog;
    if (eventParsedLog.name === 'LockOriginalToken' || eventParsedLog.name === 'BurnWrappedToken') {
      depositTx.push(eventData);
    } else if (eventParsedLog.name === 'ReleaseOriginalToken' || eventParsedLog.name === 'MintWrappedToken') {
      claimTx.push(eventData);
    }
  });

  return {depositTx, claimTx};
}

// if the node is out of date sync
export const sync = async () => {
  const chains = Object.keys(infoByChain);
  const currentBlockBeforeProcessing: any = {};
  const currentBlockAfterProcessing: any = {};

  // Todo fix type any
  const allEventsFromAllChains: RawEventData[] = [];

  const getBridgeEventsOnChain = async (currentChain: string) => {
    const provider = signersAndBridgesByChain[currentChain].provider;
    const chainId = (await provider.getNetwork()).chainId;
    const bridgeContract = signersAndBridgesByChain[chainId].bridge;
    const startBlock = (await getLastProcessedBlockNumber(chainId)).lastBlockNumber;
    const currentBlock = await provider.getBlockNumber();
    currentBlockBeforeProcessing[currentChain] = currentBlock;

    const logs = await bridgeContract.queryFilter(filter, startBlock, currentBlock);
    const contractInterface = new ethers.utils.Interface(bridgeABI.abi);

    logs.forEach(log => {
      const rawEventData: RawEventData = {
        parsedLog: contractInterface.parseLog({ data: log.data, topics: log.topics }),
        transactionData: {
          transactionHash: log.transactionHash,
          blockHash: log.blockHash,
          logIndex: log.logIndex,
          blockNumber: log.blockNumber,
        }
      }

      allEventsFromAllChains.push(rawEventData);
    });

    // change lastBlockNumber in db for the corresponding chain
    await updateLastBlockNumber(currentChain, currentBlock);
  }

  await executeAllRequests(chains, getBridgeEventsOnChain);

  /*
    In the database I will save the deposit tx and the claimTx will just add, to the already existing deposit tx, properities like isClaimed, claimSignature and other
    I dont have block.timestamp and I store all deposit events from all bridges on one place.

    When processing a claim transaction we will search in the database for the corresponding deposit transaction in order to update it.

    I have to seperate the events by type in order to process the deposit tx first so that each claim tx to have already saved corresponding deposit tx.
  */
  const {depositTx, claimTx} = seperateEventsByType(allEventsFromAllChains);

  console.log('depositTx', depositTx.length);
  console.log('claimTx', claimTx.length);

  await saveDepositEvents(depositTx);
  await processClaimEvents(claimTx);

  // get current blockNumbers
  const updateCurrentBlockAfterProcessing = async (currentChain: string) => {
    const provider = signersAndBridgesByChain[currentChain].provider;
    const currentBlock = await provider.getBlockNumber();

    currentBlockAfterProcessing[currentChain] = currentBlock;
  }

  await executeAllRequests(chains, updateCurrentBlockAfterProcessing);

  // compare old and new block numbers
  // if they are not the same run sync again
  let isSynced = true;

  for (let i = 0; i < chains.length; i++) {
    if (!(currentBlockBeforeProcessing[chains[i]] === currentBlockAfterProcessing[chains[i]])) {
      isSynced = false;
    }
  }

  if (!isSynced) {
    console.log('Syncing took too long and new blocks are present. New Sync is started');
    await sync();
  } else {
    console.log('Sync ended successfully!');
  }
}

// after sync start listening for the events for each bridge
export const initListeners = () => {
  const chains = Object.keys(infoByChain);

  chains.forEach(chain => {
    signersAndBridgesByChain[chain].bridge.on(filter, async (log) => {
      const currentBlock = await signersAndBridgesByChain[chain].provider.getBlockNumber();
      const contractInterface = new ethers.utils.Interface(bridgeABI.abi);
      const rawEventData: RawEventData = {
        parsedLog: contractInterface.parseLog({ data: log.data, topics: log.topics }),
        transactionData: {
          transactionHash: log.transactionHash,
          blockHash: log.blockHash,
          logIndex: log.logIndex,
          blockNumber: log.blockNumber,
        }
      };
      console.log(`Bridge event on chainId ${chain} detected: ${rawEventData.parsedLog.name}`);

      const eventParsedLog = rawEventData.parsedLog;

      // do apropriate action according to type: save or process
      if (eventParsedLog.name === 'LockOriginalToken' || eventParsedLog.name === 'BurnWrappedToken') {
        await saveDepositEvent(rawEventData);
      } else if (eventParsedLog.name === 'ReleaseOriginalToken' || eventParsedLog.name === 'MintWrappedToken') {
        await processClaimEvent(rawEventData);
      }
      // update last block number for the chain
      await updateLastBlockNumber(chain, currentBlock);
    })
  });
  console.log('Listeners are initialised...');
}

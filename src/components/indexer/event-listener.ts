import { ethers } from 'ethers';

import { signersAndBridgesByChain } from '../signers/signers';
import { infoByChain } from '../../config';
import { getLastProcessedBlockNumber } from '../../routes/lastBlockNumbers';
import bridgeABI from '../../utils/contract/abi/Bridge.json';
import { saveDepositTransaction, processClaimEvent, processDepositEvents, processClaimEvents, saveDepositEvents } from '../event-processor/event-procesor';
import { RawEventData } from '../../utils/types';

// if the node is out of date sync
export const sync = async () => {
  const chains = Object.keys(infoByChain);

  // Todo fix type any
  const allEventsFromAllChains: any = [];

  for (let i = 0; i < chains.length; i++) {
    const currentChain = chains[i];
    const provider = signersAndBridgesByChain[currentChain].provider;
    const chainId = (await provider.getNetwork()).chainId;
    const bridgeContract = signersAndBridgesByChain[chainId].bridge;
    const startBlock = (await getLastProcessedBlockNumber(chainId)).lastBlockNumber;
    const currentBlock = await provider.getBlockNumber();

    const firstTopic = [
      ethers.utils.id('LockOriginalToken(address,uint256,address,address,uint256,uint256)'),
      ethers.utils.id('BurnWrappedToken(address,uint256,address,address,uint256,uint256,address,uint256)'),
      ethers.utils.id('ReleaseOriginalToken(address,uint256,address,address,uint256,uint256,address,bytes32,bytes32,uint256)'),
      ethers.utils.id('MintWrappedToken(address,uint256,address,address,uint256,uint256,address,uint256,bytes32,bytes32,uint256)')
    ];

    const filter = {
      topics: [firstTopic]
    }
    const logs = await bridgeContract.queryFilter(filter, startBlock, currentBlock);

    console.log('logs for ', chainId);

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

      if (rawEventData.parsedLog.name === 'ReleaseOriginalToken') {
        console.log('---------------------------------------------------');
        console.log(rawEventData);
        console.log('---------------------------------------------------');
      }


      allEventsFromAllChains.push(rawEventData);
    });

    // change lastBlockNumber in db
  }

  /*
    In the database I will save the deposit tx and the claimTx will just add, to the already existing deposit tx, properities like isClaimed, claimSignature and other
    I dont have block.timestamp and I store all deposit events from all bridges on one place.

    When processing a claim transaction we will search in the database for the corresponding deposit transaction in order to update it.

    I have to seperate the events by type in order to process the deposit tx first so that each claim tx to have already saved deposit tx.
  */
  const depositTx: RawEventData[] = [];
  const claimTx: RawEventData[] = [];

  allEventsFromAllChains.forEach((eventData: RawEventData) => {
    const eventParsedLog = eventData.parsedLog;
    if (eventParsedLog.name === 'LockOriginalToken' || eventParsedLog.name === 'BurnWrappedToken') {
      depositTx.push(eventData);
    } else if (eventParsedLog.name === 'ReleaseOriginalToken' || eventParsedLog.name === 'MintWrappedToken') {
      claimTx.push(eventData);
    }
  });

  console.log('depositTx', depositTx.length);
  console.log('claimTx', claimTx.length);

  await saveDepositEvents(depositTx);
  await processClaimEvents(claimTx);
}

// after sync start listening for the events for each bridge

// call the right parser for the right event


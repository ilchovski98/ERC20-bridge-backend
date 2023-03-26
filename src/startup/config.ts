import { signersAndBridgesByChain } from '../components/signers/signers';
import { createLastBlockPerChainIfNotPresent } from '../routes/lastBlockNumbers';
import { infoByChain } from '../config';
import { sync, initListeners } from '../components/indexer/event-listener';

const main = async () => {
  /*
    Loop trough all defined chains with deployed bridges and
    check if lastBlockNumber that operator has validated is defined in the database
  */
  const chains = Object.keys(infoByChain);
  for (let index = 0; index < chains.length; index++) {
    await createLastBlockPerChainIfNotPresent(chains[index], signersAndBridgesByChain[Number(chains[index])].signer);
  }

  await sync();
  initListeners();
}

module.exports = function() {
  main().catch((err) => console.log(err));
}

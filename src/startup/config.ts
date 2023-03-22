import { signersAndBridgesByChain } from '../services/responders';
import { createLastBlockPerChainIfNotPresent } from '../routes/lastBlockNumbers';
import { infoByChain } from '../config';

const main = async () => {
  /*
    Loop trough all defined chains with deployed bridges and
    check if lastBlockNumber that operator has validated is defined in the database
  */
  const chains = Object.keys(infoByChain);
  for (let index = 0; index < chains.length; index++) {
    await createLastBlockPerChainIfNotPresent(chains[index], signersAndBridgesByChain[Number(chains[index])].signer);
  }
}

module.exports = function() {
  main().catch((err) => console.log(err));
}

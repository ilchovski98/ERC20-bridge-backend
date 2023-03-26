import { signersAndBridgesByChain } from '../signers/signers';
import { multicallTokenData } from '../../utils';
import { SavedTokenData } from '../../utils/types';

const savedTokenData: SavedTokenData = {}

Object.keys(signersAndBridgesByChain).forEach(chainId => {
  savedTokenData[chainId] = {};
});

export const getTokenData = async (address: string, chainId: number | string) => {
  if (savedTokenData[chainId] && savedTokenData[chainId][address]?.saved) {
    console.log('use saved token data');

    return {
      name: savedTokenData[chainId][address].name,
      symbol: savedTokenData[chainId][address].symbol
    };
  } else {
    console.log('loading new token data...');

    const result = await multicallTokenData(address, ['name', 'symbol'], [[], []], signersAndBridgesByChain[chainId].provider);

    if (result.length > 0) {
      savedTokenData[chainId][address] = {
        saved: true,
        name: result[0],
        symbol: result[1]
      }
    }
    console.log('saved the new token data');


    return {
      name: result[0],
      symbol: result[1]
    };
  }
}

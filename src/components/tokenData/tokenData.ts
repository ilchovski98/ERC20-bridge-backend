import { signersAndBridgesByChain } from '../signers/signers';
import { multicallTokenData } from '../../utils';
import { SavedTokenData } from '../../utils/types';

const savedTokenData: SavedTokenData = {}

export const getTokenData = async (address: string, chainId: number | string) => {
  if (savedTokenData[chainId][address]?.saved) {
    return {
      name: savedTokenData[chainId][address].name,
      symbol: savedTokenData[chainId][address].symbol
    };
  } else {
    const result = await multicallTokenData(address, ['name', 'symbol'], [[], []], signersAndBridgesByChain[chainId].provider);
    return {
      name: result[0],
      symbol: result[1]
    };
  }
}

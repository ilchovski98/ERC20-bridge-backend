import { InfoByChain } from './utils/types';

const PRIVATE_KEY: any = process.env.BRIDGE_PRIVATE_KEY;

export const infoByChain: InfoByChain = {
  11155111: {
    providerUrl: process.env.SEPOLIA_RPC_URL,
    bridgeOwnerPrivateKey: PRIVATE_KEY,
    bridgeAddress: '0xF55D12e0fe91c157c3D389F134a46b2182D2F6Da',
    bridgeDeployedBlockNumber: 3101518
  },
  5: {
    providerUrl: process.env.GOERLI_RPC_URL,
    bridgeOwnerPrivateKey: PRIVATE_KEY,
    bridgeAddress: '0xc551F21DE4cd2C55Ea1B8B9eb8b541aaBE9766EF',
    bridgeDeployedBlockNumber: 8664187
  }
};

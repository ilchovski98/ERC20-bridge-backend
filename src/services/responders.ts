import { Contract, ethers, providers, Wallet } from 'ethers';

import bridgeABI from '../contract/abi/Bridge.json';
import { infoByChain } from '../config';
import { ClaimData, SignersAndBridgesByChain } from '../types';

export class Responder {
  signer: Wallet;
  bridge: Contract;
  provider: providers.Provider;

  constructor(bridgeAddress: string, signerPrivateKey: string, provider: providers.Provider) {
    this.provider = provider;
    this.signer = new ethers.Wallet(signerPrivateKey, provider);
    this.bridge = new ethers.Contract(
      bridgeAddress,
      bridgeABI.abi,
      this.signer
    );
  }

  async signClaimData(claimData: ClaimData) {
    const domain = {
      name: await this.bridge.name(),
      version: '1',
      chainId: (await this.provider.getNetwork()).chainId,
      verifyingContract: this.bridge.address,
    };

    const types = {
      User: [
        { name: '_address', type: 'address' },
        { name: 'chainId', type: 'uint256' },
      ],
      SourceTxData: [
        { name: 'transactionHash', type: 'bytes32' },
        { name: 'blockHash', type: 'bytes32' },
        { name: 'logIndex', type: 'uint256' },
      ],
      OriginalToken: [
        { name: 'tokenAddress', type: 'address' },
        { name: 'originChainId', type: 'uint256' },
      ],
      ClaimData: [
        { name: 'from', type: 'User' },
        { name: 'to', type: 'User' },
        { name: 'value', type: 'uint256' },
        { name: 'token', type: 'OriginalToken' },
        { name: 'depositTxSourceToken', type: 'address' },
        { name: 'targetTokenAddress', type: 'address' },
        { name: 'targetTokenName', type: 'string' },
        { name: 'targetTokenSymbol', type: 'string' },
        { name: 'deadline', type: 'uint256' },
        { name: 'sourceTxData', type: 'SourceTxData' },
      ],
      Claim: [
        { name: '_claimData', type: 'ClaimData' },
        { name: 'nonce', type: 'uint256' },
      ],
    };

    const nonce = (await this.bridge.nonce(claimData.from._address)).toHexString();

    const value = {
      _claimData: claimData,
      nonce: nonce,
    };

    const signatureLike = await this.signer._signTypedData(domain, types, value);
    const signature = ethers.utils.splitSignature(signatureLike);

    return signature;
  }
}

export const signersAndBridgesByChain: SignersAndBridgesByChain = {};

Object.keys(infoByChain).forEach(chain => {
  const chainId = Number(chain);
  const privateKey: any = infoByChain[chainId].bridgeOwnerPrivateKey; // Todo fix any
  const provider = new ethers.providers.JsonRpcProvider(infoByChain[chainId].providerUrl, 'any');
  const signer = new ethers.Wallet(privateKey, provider);
  const bridgeContract = new ethers.Contract(
    infoByChain[chainId].bridgeAddress || '',
    bridgeABI.abi,
    signer
  );

  signersAndBridgesByChain[chainId] = {
    provider,
    signer,
    bridgeContract
  }
});

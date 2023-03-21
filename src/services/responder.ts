import { Contract, ethers, providers, Wallet } from 'ethers';
import bridgeABI from '../contract/abi/Bridge.json';

type OriginalToken = {
  tokenAddress: string;
  originChainId: string;
}

type User = {
  _address: string;
  chainId: string;
}

type SourceTxData = {
  transactionHash: string;
  blockHash: string;
  logIndex: number;
}

type Signature = {
  v: number;
  r: string;
  s: string;
}

type DepositData = {
  from: User;
  to: User;
  spender: string;
  token: string;
  value: string;
  deadline: string;
  approveTokenTransferSig: Signature;
}

type ClaimData = {
  from: User;
  to: User;
  value: string;
  token: OriginalToken; // used to indicate which is the original ERC20 (info that must be stored on all bridges)
  depositTxSourceToken: string; // the deposited token address that triggered the transfer (WERC20/ERC20)
  targetTokenAddress: string; // Todo refactor contract to not use this // if the operator populates this address then the token will be released else it indicates that the claimed token is a wrapped one
  targetTokenName: string; // provided by operator to name new wrapped token
  targetTokenSymbol: string; // provided by operator to name new wrapped token
  deadline: string; // provided by operator in case we want to have a deadline (most of the times there will be none)
  sourceTxData: SourceTxData;
}

export class Responder {
  signer: Wallet;
  bridge: Contract;
  provider: providers.Provider;

  constructor(bridgeAddress: string, signerPrivateKey: string, provider: providers.Provider) {
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

/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBridge, IBridgeInterface } from "../../contracts/IBridge";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "burnedWrappedTokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recepient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sourceChainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toChainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "originalTokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "originalTokenChainId",
        type: "uint256",
      },
    ],
    name: "BurnWrappedToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "lockedTokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recepient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sourceChainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toChainId",
        type: "uint256",
      },
    ],
    name: "LockOriginalToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "mintedTokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recepient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sourceChainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toChainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "originalTokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "originalChainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "transactionHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "logIndex",
        type: "uint256",
      },
    ],
    name: "MintWrappedToken",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "releasedTokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recepient",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sourceChainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "toChainId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "sourceWrappedTokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "transactionHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "logIndex",
        type: "uint256",
      },
    ],
    name: "ReleaseOriginalToken",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "_address",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
              },
            ],
            internalType: "struct IBridge.User",
            name: "from",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "_address",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
              },
            ],
            internalType: "struct IBridge.User",
            name: "to",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "tokenAddress",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "originChainId",
                type: "uint256",
              },
            ],
            internalType: "struct IBridge.OriginalToken",
            name: "token",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "depositTxSourceToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "targetTokenAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "targetTokenName",
            type: "string",
          },
          {
            internalType: "string",
            name: "targetTokenSymbol",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "bytes32",
                name: "transactionHash",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "blockHash",
                type: "bytes32",
              },
              {
                internalType: "uint256",
                name: "logIndex",
                type: "uint256",
              },
            ],
            internalType: "struct IBridge.SourceTxData",
            name: "sourceTxData",
            type: "tuple",
          },
        ],
        internalType: "struct IBridge.ClaimData",
        name: "_claimData",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "v",
            type: "uint8",
          },
          {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
          },
        ],
        internalType: "struct IBridge.Signature",
        name: "claimSig",
        type: "tuple",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "_address",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
              },
            ],
            internalType: "struct IBridge.User",
            name: "from",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "_address",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
              },
            ],
            internalType: "struct IBridge.User",
            name: "to",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "v",
                type: "uint8",
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
              },
            ],
            internalType: "struct IBridge.Signature",
            name: "approveTokenTransferSig",
            type: "tuple",
          },
        ],
        internalType: "struct IBridge.DepositData",
        name: "_depositData",
        type: "tuple",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "_address",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
              },
            ],
            internalType: "struct IBridge.User",
            name: "from",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "address",
                name: "_address",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "chainId",
                type: "uint256",
              },
            ],
            internalType: "struct IBridge.User",
            name: "to",
            type: "tuple",
          },
          {
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            internalType: "address",
            name: "token",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint8",
                name: "v",
                type: "uint8",
              },
              {
                internalType: "bytes32",
                name: "r",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "s",
                type: "bytes32",
              },
            ],
            internalType: "struct IBridge.Signature",
            name: "approveTokenTransferSig",
            type: "tuple",
          },
        ],
        internalType: "struct IBridge.DepositData",
        name: "_depositData",
        type: "tuple",
      },
    ],
    name: "depositWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IBridge__factory {
  static readonly abi = _abi;
  static createInterface(): IBridgeInterface {
    return new utils.Interface(_abi) as IBridgeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IBridge {
    return new Contract(address, _abi, signerOrProvider) as IBridge;
  }
}

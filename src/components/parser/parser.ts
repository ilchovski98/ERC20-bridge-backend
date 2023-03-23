import { signersAndBridgesByChain } from '../signers/signers';

// export type ClaimData = {
//   from: User;
//   to: User;
//   value: string;
//   token: OriginalToken; // used to indicate which is the original ERC20 (info that must be stored on all bridges)
//   depositTxSourceToken: string; // the deposited token address that triggered the transfer (WERC20/ERC20)
//   targetTokenAddress: string; // Todo refactor contract to not use this // if the operator populates this address then the token will be released else it indicates that the claimed token is a wrapped one
//   targetTokenName: string; // provided by operator to name new wrapped token
//   targetTokenSymbol: string; // provided by operator to name new wrapped token
//   deadline: string; // provided by operator in case we want to have a deadline (most of the times there will be none)
//   sourceTxData: SourceTxData;
// }

// export type TransactionData = {
//   eventName: string;
//   fromChain: string;
//   toChain: string;
//   fromAddress: string;
//   toAddress: string;
//   transferedTokenAddress: string;
//   originalTokenAddress: string;
//   originalChainId: string;
//   txHash: string;
//   blockHash: string;
//   logIndex: string;
//   blockNumber: number;
//   claimSignature: string;
//   isClaimed: boolean;
//   claimedTxHash: string;
//   claimedBlockHash: string;
//   claimedLogIndex: number;
// }

// create functions that will be called when an event occurs
/*
  Events:

  sending:
  LockOriginalToken
  BurnWrappedToken

  receiving:
  ReleaseOriginalToken
  MintWrappedToken
*/

const parseReceiveEvents = async (eventData) => {

}

const parseSendingEvents = async (eventData) => {

}
// based on the event type deposit || claim will either
// deposit : get needed data from the event, create claimData and sign it, store the data and the signature in the transaction
// claim : get needed data from the event, identify the deposit transaction and populate the needed fields claimed and etc...

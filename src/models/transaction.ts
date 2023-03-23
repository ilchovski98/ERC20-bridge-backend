// @ts-nocheck
import mongoose from 'mongoose';
import Joi from 'joi';

import { validationForAddress } from '../utils';
import { TransactionData, ClaimData } from '../utils/types';

const transactionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: function(value) {
      return `${this?.txHash}-${this?.blockHash}-${this?.logIndex}` === value;
    }
  },
  eventName: {
    type: String,
    required: true,
    minlength: 2
  },
  fromChain: {
    type: Number,
    min: 1,
    required: true,
  },
  toChain: {
    type: Number,
    min: 1,
    required: true,
  },
  fromAddress: {
    type: String,
    required: true,
    minlength: 42,
    maxlength: 42,
    validate: validationForAddress
  },
  toAddress: {
    type: String,
    required: true,
    minlength: 42,
    maxlength: 42,
    validate: validationForAddress
  },
  transferedTokenAddress: {
    type: String,
    required: true,
    minlength: 42,
    maxlength: 42,
    validate: validationForAddress
  },
  originalTokenAddress: {
    type: String,
    required: true,
    minlength: 42,
    maxlength: 42,
    validate: validationForAddress
  },
  originalChainId: {
    type: Number,
    min: 1,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
    maxlength: 66
  },
  blockHash: {
    type: String,
    required: true,
    maxlength: 66
  },
  logIndex: {
    type: Number,
    required: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  claimData: {
    type: Object,
    required: true // place some validation
  },
  claimSignature: {
    type: String,
    required: true,
    maxlength: 66 // add validation check
  },
  isClaimed: {
    type: Boolean,
    required: true // add validation check
  },
  claimedTxHash: {
    type: String,
    maxlength: 66
  },
  claimedBlockHash: {
    type: String,
    maxlength: 66
  },
  claimedLogIndex: {
    type: Number
  }
});

export const Transaction = mongoose.model('Transaction', transactionSchema);

export function validateTransaction(transaction: TransactionData) {
  const bytes32 = Joi.string().max(66).required();
  const address = Joi.string().min(42).max(42).required();
  const chainId = Joi.number().min(1).required();

  const schema = Joi.object({
    id: Joi.string().required(),
    eventName: Joi.string().min(2).required(),
    fromChain: chainId,
    toChain: chainId,
    fromAddress: address,
    toAddress: address,
    transferedTokenAddress: address,
    originalTokenAddress: address,
    originalChainId: chainId,
    txHash: bytes32,
    blockHash: bytes32,
    logIndex: Joi.number().required(),
    blockNumber: Joi.number().min(1).required(),
    claimSignature: bytes32,
    isClaimed: Joi.boolean().required(),
    claimedTxHash: bytes32,
    claimedBlockHash: bytes32,
    claimedLogIndex: Joi.number()
  });
  return schema.validate(transaction);
}

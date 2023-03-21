import mongoose from 'mongoose';
import Joi from 'joi';

const transactionSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  fromChain: {
    type: String,
    required: true,
  },
  toChain: {
    type: String,
    required: true,
  },
  fromAddress: {
    type: String,
    required: true,
    minlength: 64,
    maxlength: 64
  },
  toAddress: {
    type: String,
    required: true,
    minlength: 64,
    maxlength: 64
  },
  transferedTokenAddress: {
    type: String,
    required: true,
    minlength: 64,
    maxlength: 64
  },
  originalTokenAddress: {
    type: String,
    required: true,
    minlength: 64,
    maxlength: 64
  },
  originalChainId: {
    type: String,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
    minlength: 64,
    maxlength: 64
  },
  blockHash: {
    type: String,
    required: true,
    minlength: 64,
    maxlength: 64
  },
  logIndex: {
    type: Number,
    required: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  claimSignature: {
    type: String,
    required: true,
    minlength: 64,
    maxlength: 64
  },
  isClaimed: {
    type: Boolean,
    required: true,
  },
  claimedTxHash: {
    type: String,
    minlength: 64,
    maxlength: 64
  },
  claimedBlockHash: {
    type: String,
    minlength: 64,
    maxlength: 64
  },
  claimedLogIndex: {
    type: Number
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

function validateTransaction(transaction) {
  const bytes32OrAddress = Joi.string().min(64).max(64).required();
  const chainId = Joi.string().required();

  const schema = Joi.object({
    eventName: bytes32OrAddress,
    fromChain: chainId,
    toChain: chainId,
    fromAddress: bytes32OrAddress,
    toAddress: bytes32OrAddress,
    transferedTokenAddress: bytes32OrAddress,
    originalTokenAddress: bytes32OrAddress,
    originalChainId: chainId,
    txHash: bytes32OrAddress,
    blockHash: bytes32OrAddress,
    logIndex: bytes32OrAddress,
    blockNumber: Joi.number().required(),
    claimSignature: bytes32OrAddress,
    isClaimed: Joi.boolean().required(),
    claimedTxHash: Joi.string().min(64).max(64),
    claimedBlockHash: Joi.string().min(64).max(64),
    claimedLogIndex: Joi.number()
  });
  return schema.validate(transaction);
}

exports.Transaction = Transaction;
exports.validate = validateTransaction;

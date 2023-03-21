import mongoose from 'mongoose';
import Joi from 'joi';

const LastBlockNumberSchema = new mongoose.Schema({
  chain: {
    type: String,
    required: true
  },
  bridgeAddress: {
    type: String,
    required: true,
    minlength: 64,
    maxlength: 64
  },
  lastBlockNumber: {
    type: Number,
    required: true
  }
});

const LastBlockNumber = mongoose.model('LastBlockNumber', LastBlockNumberSchema);

function validateLastBlockNumber(transaction) {
  const schema = Joi.object({
    chain: Joi.string().required(),
    bridgeAddress: Joi.string().min(64).max(64).required(),
    lastBlockNumber: Joi.number().required()
  });
  return schema.validate(transaction);
}

exports.Transaction = LastBlockNumber;
exports.validate = validateLastBlockNumber;

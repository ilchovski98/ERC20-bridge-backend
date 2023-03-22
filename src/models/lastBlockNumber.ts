import mongoose from 'mongoose';
import Joi from 'joi';

import { validationForAddress } from '../utils';
import { LastBlockNumberData } from '../utils/types';

const LastBlockNumberSchema = new mongoose.Schema({
  chain: {
    type: Number,
    min: 1,
    required: true,
    unique: true
  },
  bridgeAddress: {
    type: String,
    required: true,
    minlength: 42,
    maxlength: 42,
    validate: validationForAddress
  },
  lastBlockNumber: {
    type: Number,
    required: true,
    min: 1
  }
});

export const LastBlockNumber = mongoose.model('LastBlockNumber', LastBlockNumberSchema);

export function validateLastBlockNumber(lastBlockNumber: LastBlockNumberData) {
  const schema = Joi.object({
    chain: Joi.number().min(1).required(),
    bridgeAddress: Joi.string().min(42).max(42).required(),
    lastBlockNumber: Joi.number().min(1).required()
  });
  return schema.validate(lastBlockNumber);
}

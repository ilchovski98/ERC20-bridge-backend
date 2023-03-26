import express, { Request, Response } from 'express';
import _ from 'lodash';

import { Transaction, validateTransaction } from '../models/transaction';
import { TransactionData } from '../utils/types';
import { asyncMiddleware } from '../middlewares/async';

const router = express.Router();

export const createTransaction = async (data: TransactionData) => {
  const { error } = validateTransaction(data);
  if (error) {
    console.error(error);
    return error
  }
  try {
    const transaction = new Transaction(data);
    await transaction.save();
    return true;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export const getTransactionById = async (id: string) => {
  return await Transaction.findOne({ id });
}

export const findTransactionAndUpdate = async (find: Object, update: Object) => {
  const transaction = await Transaction.findOneAndUpdate(find, update);
  await transaction?.save();
}

// read
router.get('/', asyncMiddleware(async (req: Request, res: Response) => {
  const transactions = await Transaction.find({});
  res.send(transactions);
}));

// delete for testing
router.delete('/all', asyncMiddleware(async (req: Request, res: Response) => {
  const result = await Transaction.deleteMany({});
  res.send(result);
}));

// create for testing
// router.post('/', asyncMiddleware(async (req: Request, res: Response) => {
//   const transaction = await Transaction(req.body);
//   await transaction.save();
//   res.send(transaction);
// }));

// // update
// router.put('/:tweetId', asyncMiddleware(async (req, res) => {
//   const tweet = await Transaction.findByIdAndUpdate(req.params.tweetId, { text: req.body.text });
//   await tweet.save();
//   res.send(tweet);
// }));

export default router;
